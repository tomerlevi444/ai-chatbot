import { auth } from '@/app/(auth)/auth';
import { getApartmentsByUserId } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const apartments = await getApartmentsByUserId(session!.user!.id!);
  return Response.json(apartments);
}
