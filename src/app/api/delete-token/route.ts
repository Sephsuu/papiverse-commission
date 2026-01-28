import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('decodedToken');
  return new Response(JSON.stringify({ message: 'Cookie deleted successfully!' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
