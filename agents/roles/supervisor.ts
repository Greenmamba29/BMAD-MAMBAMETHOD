// agents/roles/supervisor.ts
import { chat } from "@/lib/openai";
import type { Agent, AgentContext } from "../runtime/agentTypes";

export const Supervisor: Agent = {
  name: "Supervisor",
  systemPrompt: `You are a supervisor. Decide: (a) call tools (b) handoff to 'Researcher' or 'Coder' or 'Verifier' (c) output final.
Return JSON in the last assistant message with keys: {action, toolCalls?, handoffTo?, final?}.`,
  allowedTools: ["bmad", "web_search"],
  async handle(input, ctx: AgentContext) {
    const messages = [
      { role: "system" as const, content: Supervisor.systemPrompt },
      ...(ctx.memory ?? []),
      { role: "user" as const, content: input }
    ];

    const resp = await chat(messages);
    const text = resp.choices[0].message?.content ?? "";
    // naive JSON scrape; tighten with a tool schema if you like
    let decision: any = {};
    try { decision = JSON.parse(text); } catch { /* keep empty */ }

    return {
      messages: [{ role: "assistant" as const, content: text, name: "Supervisor" }],
      toolCalls: decision.toolCalls,
      handoffTo: decision.handoffTo,
      done: !!decision.final
    };
  }
};