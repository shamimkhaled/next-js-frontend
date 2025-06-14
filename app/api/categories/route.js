// app/api/categories/route.js
export async function GET() {
  try {
    console.log('🔍 Fetching categories from external API...');
    
    const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/categories/tree/', {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Vercel-App',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    console.log('📡 Categories API response status:', response.status);

    if (!response.ok) {
      console.error('❌ Categories API failed with status:', response.status);
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Categories data received:', Array.isArray(data) ? `${data.length} categories` : typeof data);

    // Add cache headers to improve performance
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('❌ Categories API Error:', {
      message: error.message,
      name: error.name,
    });
    
    // Return empty array instead of error to prevent UI breaking
    return Response.json([], {
      status: 200, // Return 200 to prevent frontend errors
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}