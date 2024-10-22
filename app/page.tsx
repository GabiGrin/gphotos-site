export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Google Photos Website Creator
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Easily turn your Google Photos albums into beautiful websites
        </p>
      </header>

      <main className="flex flex-col gap-12 row-start-2 items-center max-w-4xl mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-8 items-center">
          <div className="sm:col-span-2">
            <h2 className="text-3xl font-semibold mb-4">
              Showcase Your Memories
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Create stunning websites from your Google Photos albums with just
              a few clicks. Share your special moments with family and friends
              in a beautiful, easy-to-navigate format.
            </p>
          </div>
          {/* <div className="relative w-full h-80 rounded-lg shadow-lg overflow-hidden sm:col-span-2"> */}
          {/* <img
              src="/path/to/example-website-screenshot.jpg"
              alt="Example website screenshot"
              className="absolute inset-0 w-full h-full object-cover"
            /> */}
          {/* </div> */}
          <div className="sm:col-span-2">
            <h2 className="text-3xl font-semibold mb-4">Easy to Use</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              No coding or design skills required. Our intuitive interface
              guides you through the process of selecting albums, customizing
              your website, and publishing it for the world to see.
            </p>
          </div>
          {/* <div className="relative w-full h-80 rounded-lg shadow-lg overflow-hidden sm:col-span-2"> */}
          {/* <img
              src="/path/to/website-creator-interface-screenshot.jpg"
              alt="Website creator interface screenshot"
              className="absolute inset-0 w-full h-full object-cover"
            /> */}
          {/* </div> */}
        </section>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg h-14 px-8 shadow-lg"
            href="/create"
          >
            Create Your Website
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-lg h-14 px-8"
            href="/examples"
          >
            See Examples
          </a>
        </div>
      </main>

      <footer className="row-start-3 text-center text-gray-500 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Google Photos Website Creator. All
          rights reserved.
        </p>
        <p className="mt-2">
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          {" | "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>
        </p>
      </footer>
    </div>
  );
}
