"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

interface CreateSiteFormProps {
  suggestedUsername: string | undefined;
  createSite: (
    prevState: any,
    username: string
  ) => Promise<
    { success?: boolean; message?: string; error?: string } | undefined
  >;
}

export default function CreateSiteForm({
  suggestedUsername,
  createSite,
}: CreateSiteFormProps) {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [state, formAction] = useFormState(
    async (prevState: any, formData: FormData) => {
      const result = await createSite(
        prevState,
        formData.get("username") as string
      );
      if (result?.success) {
        router.push("/edit");
      }
      return result;
    },
    { message: "" }
  );
  const { pending } = useFormStatus();

  useEffect(() => {
    if (suggestedUsername) {
      setUsername(slugify(suggestedUsername));
    }
  }, [suggestedUsername]);

  return (
    <form action={formAction}>
      <div className="mb-4">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Choose your username
        </label>
        <div className="flex">
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(slugify(e.target.value))}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={pending}
          />
          <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500">
            .myphotos.site
          </span>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {pending ? "Creating..." : "Create Site"}
      </button>
      {state?.error && (
        <p className="mt-4 text-sm text-red-600">{state.error}</p>
      )}
      {state?.message && !state?.error && (
        <p className="mt-4 text-sm text-green-600">{state.message}</p>
      )}
    </form>
  );
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}
