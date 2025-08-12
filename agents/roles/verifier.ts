// agents/roles/verifier.ts
import { chat } from "@/lib/openai";
import type { Agent } from "../runtime/agentTypes";

export const Verifier: Agent = {
  name: "Verifier",
  systemPrompt: `You act as QA: test, critique, and propose fixes. Output a checklist.`,
  allowedTools: [],
  async handle(input, ctx) {
    const messages = [
      { role: "system" as const, content: Verifier.systemPrompt },
      ...(ctx.memory ?? []),
      { role: "user" as const, content: input }
    ];
    const resp = await chat(messages);
    return { messages: [{ role: "assistant" as const, content: resp.choices[0].message?.content ?? "", name: "Verifier" }] };
  }
};