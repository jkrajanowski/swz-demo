import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/simplify
 * Body:  { text: string }
 * Reply: { plain: string }
 */
export async function POST(req: NextRequest) {
  const { text } = await req.json();

  /* 1️⃣  Initialise the SDK *inside* the handler
         – env vars are guaranteed here at runtime */
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,      // undefined during build is OK
  });
  const assistant_id = process.env.OPENAI_ASSISTANT_ID!;

  /* 2️⃣  Start a run */
  const run = await openai.beta.threads.createAndRun({
    assistant_id,
    thread: { messages: [{ role: 'user', content: text }] },
  });

  /* 3️⃣  Poll until finished (simple demo loop) */
  while (true) {
    const status = await openai.beta.threads.runs.retrieve(
      run.thread_id,
      run.id
    );
    if (status.status === 'completed') break;
    await new Promise((r) => setTimeout(r, 800));
  }

  /* 4️⃣  Get the first text block (loose cast keeps TypeScript quiet) */
  const msgs  = await openai.beta.threads.messages.list(run.thread_id);
  const first = msgs.data[0];
  const textBlock = (first?.content as any[]).find((b: any) => b.type === 'text');
  const plain = textBlock?.text?.value ?? '';

  return NextResponse.json({ plain });
}
