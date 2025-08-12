// agents/roles/researcher.ts
import { chat } from "@/lib/openai";
import type { Agent, AgentContext } from "../runtime/agentTypes";

export const Researcher: Agent = {
  name: "Researcher",
  systemPrompt: `You research succinctly. Use tools only if needed. Output bullets and sources.`,
  allowedTools: ["web_search"],
  async handle(input, ctx: AgentContext) {
    const messages = [
      { role: "system" as const, content: Researcher.systemPrompt },
      ...(ctx.memory ?? []),
      { role: "user" as const, content: input }
    ];
    const resp = await chat(messages);
    return { messages: [{ role: "assistant" as const, content: resp.choices[0].message?.content ?? "", name: "Researcher" }] };
  }
};