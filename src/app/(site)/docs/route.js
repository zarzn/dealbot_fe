import { redirect } from 'next/navigation';

export async function GET(request) {
  return redirect('/how-to-use');
} 