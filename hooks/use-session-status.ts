import { JobStatusCounts } from "@/utils/dal/server-api";
import { useEffect, useMemo, useState } from "react";
import { useClientApi } from "./useClientApi";

interface UseSessionStatusProps {
  sessionId: string;
  pollingInterval?: number;
  onComplete: (status: SessionProgressComplete) => void;
}

interface StatusCounts {
  total: number;
  succeeded: number;
  failed: number;
}

interface SessionProgressScanning extends StatusCounts {
  type: "scanning";
}

interface SessionProgressUploading extends StatusCounts {
  type: "uploading";
}

export interface SessionProgressComplete {
  type: "complete";
  scanning: StatusCounts;
  uploading: StatusCounts;
}

export type SessionProgress =
  | SessionProgressScanning
  | SessionProgressUploading
  | SessionProgressComplete;

export function useSessionStatus({
  sessionId,
  pollingInterval = 5000,
  onComplete,
}: UseSessionStatusProps): SessionProgress {
  const [status, setStatus] = useState<SessionProgress>({
    type: "scanning",
    total: 0,
    succeeded: 0,
    failed: 0,
  });

  const clientApi = useClientApi();

  useEffect(() => {
    if (!sessionId) return;
    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      console.log("Polling status");
      try {
        const counts = await clientApi.getSessionStatus(sessionId);

        const { processPageJobs, imageUploadJobs } = counts;

        // If no jobs exist yet, maintain scanning state with zeros
        if (processPageJobs.total === 0) {
          setStatus({
            type: "scanning",
            total: 0,
            succeeded: 0,
            failed: 0,
          });
          return;
        }

        const scanningComplete =
          processPageJobs.completed + processPageJobs.failed ===
          processPageJobs.total;

        // Handle the scanning phase
        if (!scanningComplete) {
          setStatus({
            type: "scanning",
            total: processPageJobs.total,
            succeeded: processPageJobs.completed,
            failed: processPageJobs.failed,
          });
          return;
        }

        // If all scanning jobs failed, move directly to complete state
        if (processPageJobs.failed === processPageJobs.total) {
          const status: SessionProgressComplete = {
            type: "complete",
            scanning: {
              total: processPageJobs.total,
              succeeded: processPageJobs.completed,
              failed: processPageJobs.failed,
            },
            uploading: {
              total: 0,
              succeeded: 0,
              failed: 0,
            },
          };
          setStatus(status);
          if (onComplete) {
            onComplete(status);
            clearInterval(intervalId);
          }
          return;
        }

        // Handle the uploading phase
        const uploadingComplete =
          imageUploadJobs.completed + imageUploadJobs.failed ===
          imageUploadJobs.total;

        if (!uploadingComplete && imageUploadJobs.total > 0) {
          setStatus({
            type: "uploading",
            total: imageUploadJobs.total,
            succeeded: imageUploadJobs.completed,
            failed: imageUploadJobs.failed,
          });
          return;
        }

        // If uploading is complete or there are no upload jobs, move to complete state
        if (uploadingComplete || imageUploadJobs.total === 0) {
          const status: SessionProgressComplete = {
            type: "complete",
            scanning: {
              total: processPageJobs.total,
              succeeded: processPageJobs.completed,
              failed: processPageJobs.failed,
            },
            uploading: {
              total: imageUploadJobs.total,
              succeeded: imageUploadJobs.completed,
              failed: imageUploadJobs.failed,
            },
          };
          setStatus(status);
          onComplete(status);
          clearInterval(intervalId);
        }
      } catch (error) {
        // In case of error, maintain the current status type but add error information
        setStatus((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "An error occurred",
        }));
      }
    };

    pollStatus();
    intervalId = setInterval(pollStatus, pollingInterval);

    return () => clearInterval(intervalId);
  }, [sessionId, pollingInterval, onComplete]);

  return status;
}
