"use client";

import { useState } from "react";
import { Button } from "./ui";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button type="button" variant="ghost" onClick={copy} className="border border-slate-200">
      {copied ? "Copiado!" : "Copiar"}
    </Button>
  );
}
