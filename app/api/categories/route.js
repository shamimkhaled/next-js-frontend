export async function GET() {
  try {
    const response = await fetch('https://seashell-app-4gkvz.ondigitalocean.app/api/categories/tree/');
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}