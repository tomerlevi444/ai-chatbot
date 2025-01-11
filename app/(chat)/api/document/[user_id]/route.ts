import { auth } from '@/app/(auth)/auth';
import { BlockKind } from '@/components/block';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  getDocumentsByUserId,
  saveDocument,
} from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (type !== 'generic' && type !== 'apartment') {
    return new Response('Unknown type', { status: 400 })
  }

  const documents = await getDocumentsByUserId({ userId: session!.user!.id!, type });

  return Response.json(documents, { status: 200 });
}