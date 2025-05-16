import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialise the SDK with your secrets
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const assistant_id = process.env.OPENAI_ASSISTANT_ID!;

/**
 * POST /api/simplify
 * Body:  { text: string }
 * Reply: { plain: string }
 */
export async function POST(req: NextRequest) {
  const { text } = await req.json();

  /* 1️⃣  Start a run */
  const run = await openai.beta.threads.createAndRun({
    assistant_id,
    thread: { messages: [{ role: 'user', content: text }] },
  });

  /* 2️⃣  Poll until finished */
  while (true) {
    const status = await openai.beta.threads.runs.retrieve(
      run.thread_id,
      run.id
    );
    if (status.status === 'completed') break;
    await new Promise((r) => setTimeout(r, 800));
  }

  /* 3️⃣  Grab the first text block (safe cast to any[]) */
  const msgs = await openai.beta.threads.messages.list(run.thread_id);
  const first = msgs.data[0];

  // content can be text blocks or image/file blocks; we want the first text one
  const textBlock = (first?.content as any[]).find((b: any) => b.type === 'text');
  const plain = textBlock?.text?.value ?? '';

  return NextResponse.json({ plain });
}
