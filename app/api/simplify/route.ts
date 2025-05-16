import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const assistant_id = process.env.OPENAI_ASSISTANT_ID!;

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  // 1 start a run
  const run = await openai.beta.threads.createAndRun({
    assistant_id,
    thread: { messages: [{ role: 'user', content: text }] },
  });

  // 2 poll until it finishes
  while (true) {
    const status = await openai.beta.threads.runs.retrieve(
      run.thread_id,
      run.id
    );
    if (status.status === 'completed') break;
    await new Promise(r => setTimeout(r, 800));
  }

  // 3 get the assistant’s reply
  const msgs = await openai.beta.threads.messages.list(run.thread_id);
  const plain = msgs.data[0]?.content[0]?.text.value ?? '';

  return NextResponse.json({ plain });
}
