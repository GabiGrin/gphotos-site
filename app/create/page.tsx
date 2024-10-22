export default function CreateWebsite() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold mb-8">Create Your Website</h1>
      <form className="max-w-xl mx-auto">
        <div className="mb-6">
          <label
            htmlFor="google-photos-link"
            className="block mb-2 text-lg font-medium text-gray-900 dark:text-white"
          >
            Google Photos Album Link
          </label>
          <input
            type="text"
            id="google-photos-link"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="https://photos.app.goo.gl/your-album-id"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="theme"
            className="block mb-2 text-lg font-medium text-gray-900 dark:text-white"
          >
            Choose a Theme
          </label>
          <select
            id="theme"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="theme1">Theme 1</option>
            <option value="theme2">Theme 2</option>
            <option value="theme3">Theme 3</option>
          </select>
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Website
        </button>
      </form>
    </div>
  );
}
