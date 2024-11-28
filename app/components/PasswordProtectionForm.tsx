"use client";
import { useState } from "react";
import { setSitePassword } from "@/utils/password-protection";
import { useRouter } from "next/navigation";
import BrandingFooter from "./BrandingFooter";

export default function PasswordProtectionForm({ domain }: { domain: string }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError(false);

    try {
      const response = await fetch("/api/validate-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, password }),
      });

      const { valid } = await response.json();

      if (valid) {
        setSitePassword(domain, password);
        router.refresh();
      } else {
        setValidationError(true);
      }
    } catch (error) {
      setValidationError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="password-form-container"
      className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white z-50"
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-md border border-blue-100 p-8 space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold text-blue-900">
                Password Protected Gallery
              </h2>
              <p className="text-sm text-blue-600">
                Enter the password to view this gallery
              </p>
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm ${
                  validationError ? "border-red-500" : "border-blue-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300`}
                autoFocus
                disabled={isLoading}
              />
              {validationError && (
                <p className="mt-2 text-sm text-red-500">Incorrect password</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "View Gallery"}
            </button>
          </form>
        </div>
      </div>
      <BrandingFooter hostname={domain} />
    </div>
  );
}
