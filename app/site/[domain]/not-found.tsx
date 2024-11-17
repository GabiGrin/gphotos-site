import Link from "next/link";

export default function NotFound({ domain }: { domain: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-md text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Site Not Found</h1>
        <p className="text-xl mb-8">{domain}.myphotos.site is available!</p>
        <p className="text-lg mb-8">
          Create your own beautiful photo gallery with MyPhotos.site in minutes.
        </p>
        <Link
          href="/sign-in"
          className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
        >
          Sign Up Now
        </Link>
      </div>
    </div>
  );
}
