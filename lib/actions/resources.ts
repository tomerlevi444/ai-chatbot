'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
  embeddings as embeddingsTable
} from '@/lib/db/schema';

import { generateEmbeddings } from '@/lib/ai/embeddings';

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';


const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    const embeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
    embeddings.map(embedding => ({
        resourceId: resource.id,
        ...embedding,
    })),
    );

    return 'Resource successfully created and embedded.';
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};