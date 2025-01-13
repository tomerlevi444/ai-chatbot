import { auth } from '@/app/(auth)/auth';
import { BlockKind } from '@/components/block';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocuments,
  saveDocument,
} from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } =
  new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id && !type) {
    return new Response('Missing document parameters', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (type !== null && type !== 'generic' && type !== 'apartment') {
    return new Response('Unknown type', { status: 400 });
  }

  const documents = await getDocuments({ id, type, userId: session!.user!.id! });

  const [document] = documents;

  if (!document) {
    return new Response('Not Found', { status: 404 });
  }

  if (document.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: BlockKind } = await request.json();

  if (session.user?.id) {
    const document = await saveDocument({
      id,
      content,
      title,
      kind,
      userId: session.user.id,
    });

    return Response.json(document, { status: 200 });
  }
  return new Response('Unauthorized', { status: 401 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { timestamp }: { timestamp: string } = await request.json();

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const documents = await getDocuments({ id, userId: session!.user!.id! });

  const [document] = documents;

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response('Deleted', { status: 200 });
}
