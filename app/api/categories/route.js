export async function GET() {
  try {
    const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/categories/tree/', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}