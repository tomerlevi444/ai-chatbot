import { cookies } from 'next/headers';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getDocumentById } from '@/lib/db/queries';
import { createDocumentMessage, generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id: documentId } = params;
  const id = generateUUID();

  const session = await auth();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  const document = await getDocumentById({ id: documentId })

  const uiMessage: any = createDocumentMessage({ id, document })


  return (
    <>
      <Chat
        key={id}
        userId={session?.user?.id}
        id={id}
        initialMessages={[uiMessage]}
        selectedModelId={selectedModelId}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
