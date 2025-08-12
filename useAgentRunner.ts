// useAgentRunner.ts
import { useState } from "react";

export function useAgentRunner() {
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<any>(null);

  async function run(input: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        body: JSON.stringify({ input }),
        headers: { "Content-Type": "application/json" }
      });
      const json = await res.json();
      setTrace(json);
    } finally { setLoading(false); }
  }

  return { loading, trace, run };
}