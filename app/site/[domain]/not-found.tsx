import Link from "next/link";

export default function NotFound({ domain }: { domain: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 text-gray-800">
      <div className="max-w-lg text-center px-4">
        <div className="mb-6">
          <span className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
            Available! 🎉
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="break-words">{domain}.myphotos.site</span>
        </h1>

        <p className="text-xl mb-6">
          Create your stunning photo gallery in under 2 minutes
        </p>

        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                JD
              </div>
              <div className="w-8 h-8 -ml-2 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                AM
              </div>
              <div className="w-8 h-8 -ml-2 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs">
                RK
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Join 10,000+ photographers who trust MyPhotos.site
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Link
            href={`https://www.myphotos.site/?utm_source=not-found&utm_medium=banner&utm_campaign=${domain}`}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:bg-blue-500 flex items-center justify-center space-x-2"
          >
            <span>Claim This Domain Now</span>
            <span className="text-xl">→</span>
          </Link>

          <p className="text-sm text-gray-500">
            ⚡️ Premium domains are going fast - No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
