// app/test-categories/page.js
import { getCategories } from '@/lib/api';

export default async function TestCategoriesPage() {
  let categories = [];
  let error = null;
  let rawResponse = null;

  try {
    const response = await getCategories();
    rawResponse = response;
    
    // Handle different response formats
    if (Array.isArray(response)) {
      categories = response;
    } else if (response?.data && Array.isArray(response.data)) {
      categories = response.data;
    } else if (response?.categories && Array.isArray(response.categories)) {
      categories = response.categories;
    } else if (response?.results && Array.isArray(response.results)) {
      categories = response.results;
    }
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
          Categories API Test Page
        </h1>

        {/* API Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            API Status
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            API URL: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'https://seashell-app-4gkvz.ondigitalocean.app/api'}/categories/tree/
            </code>
          </p>
          <p className="text-sm mt-2">
            Status: {error ? (
              <span className="text-red-500 font-semibold">❌ Error: {error}</span>
            ) : (
              <span className="text-green-500 font-semibold">✅ Success</span>
            )}
          </p>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            Categories Found: <strong>{categories.length}</strong>
          </p>
        </div>

        {/* Raw Response */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Raw API Response
          </h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-xs">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>

        {/* Categories Tree View */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Categories Tree Structure
          </h2>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={category.id || index} className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {category.name} 
                    <span className="text-sm text-gray-500 ml-2">
                      (ID: {category.id}, Slug: {category.slug}, Products: {category.product_count || 0})
                    </span>
                  </h3>
                  
                  {category.children && category.children.length > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {category.children.map((child, childIndex) => (
                        <div key={child.id || childIndex} className="border-l-2 border-gray-300 pl-4">
                          <p className="text-gray-700 dark:text-gray-300">
                            {child.name}
                            <span className="text-xs text-gray-500 ml-2">
                              (ID: {child.id}, Slug: {child.slug}, Products: {child.product_count || 0})
                            </span>
                          </p>
                          
                          {child.children && child.children.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                              {child.children.map((grandchild, grandIndex) => (
                                <p key={grandchild.id || grandIndex} className="text-sm text-gray-600 dark:text-gray-400">
                                  • {grandchild.name}
                                  <span className="text-xs text-gray-400 ml-1">
                                    (ID: {grandchild.id}, Slug: {grandchild.slug})
                                  </span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No categories found. Check the raw response above for debugging.
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            📝 Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
            <li>Verify that the categories shown above match your database</li>
            <li>If categories are not loading, check the API endpoint and CORS settings</li>
            <li>Make sure your API returns data in one of these formats: direct array, data.array, categories.array, or results.array</li>
            <li>Clear your Next.js cache: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-sm">rm -rf .next && npm run dev</code></li>
            <li>Check browser console for any client-side errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}