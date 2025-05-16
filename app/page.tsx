'use client';
import { useState } from 'react';

export default function Home() {
  const [src, setSrc] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);

  const simplify = async () => {
    if (!src.trim()) return;
    setBusy(true);
    setOut('');
    const res = await fetch('/api/simplify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: src }),
    });
    const { plain } = await res.json();
    setOut(plain);
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">SWZ Simplifier Demo</h1>

      {/* --- input area --- */}
      <textarea
        className="w-full h-40 p-3 rounded border"
        placeholder="Wklej zdanie z SWZ… "
        value={src}
        onChange={(e) => setSrc(e.target.value)}
      />


      {/* --- action button --- */}
      <button
        onClick={simplify}
        className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        disabled={busy || !src.trim()}
      >
        {busy ? 'Przetwarzanie…' : 'Uprość język'}
      </button>

      {/* --- output box --- */}
      {out && (
        <div className="border rounded p-4 bg-black text-white">
          <h2 className="font-medium mb-2">Zrozumiała wersja:</h2>
          <p>{out}</p>
        </div>
      )}
    </main>
  );
}
