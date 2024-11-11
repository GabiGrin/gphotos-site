export default function BrandingFooter(props: { hostname: string }) {
  return (
    <footer className="fixed bottom-0 left-0 w-full py-2.5 bg-white bg-opacity-80 backdrop-blur-sm shadow-md">
      <div className="container mx-auto flex items-center justify-center px-4">
        <div className="text-xs text-gray-600">
          Made with{" "}
          <a
            href="https://app.gphotos.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium inline-flex items-center gap-1 group"
          >
            GPhotos.site
            <svg
              className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
        <div className="flex items-center gap-3 ml-2">
          <a
            href={`https://www.gphotos.site?utm_source=${props.hostname}&utm_medium=footer&utm_campaign=user_sites`}
            target="_blank"
            rel="noopener"
            className="text-xs px-3 py-1 rounded-[10px] bg-blue-500 text-white hover:bg-blue-800 transition-colors duration-200"
          >
            Create yours for free
          </a>
        </div>
      </div>
    </footer>
  );
}
