"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthCodeError() {
  const [errorParams, setErrorParams] = useState({
    error: "",
    errorDescription: "",
    errorCode: "",
  });

  useEffect(() => {
    // Parse hash parameters
    const hash = window.location.hash.substring(1); // Remove the # symbol
    const params = new URLSearchParams(hash);

    setErrorParams({
      error: params.get("error") || "",
      errorDescription: params.get("error_description") || "",
      errorCode: params.get("error_code") || "",
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">
            There was a problem authenticating your account
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
          <p className="text-sm text-red-800 font-medium mb-2">
            Error: {errorParams.error || "Unknown error"}
          </p>
          {errorParams.errorCode && (
            <p className="text-sm text-red-700">
              Code: {errorParams.errorCode}
            </p>
          )}
          {errorParams.errorDescription && (
            <p className="text-sm text-red-700 mt-1">
              Details:{" "}
              {decodeURIComponent(errorParams.errorDescription).replace(
                /\+/g,
                " "
              )}
            </p>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
