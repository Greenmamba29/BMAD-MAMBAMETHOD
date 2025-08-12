import { chat } from "@/lib/openai";
import type { Agent, AgentContext } from "../runtime/agentTypes";

export const Coder: Agent = {
  name: "Coder",
  systemPrompt: `You write minimal, correct TypeScript/React/Next.js code with explanations.`,
  allowedTools: ["bmad"],
  async handle(input, ctx: AgentContext) {
    const messages = [
      { role: "system" as const, content: Coder.systemPrompt },
      ...(ctx.memory ?? []),
      { role: "user" as const, content: input }
    ];
    const resp = await chat(messages);
    return {
      messages: [
        {
          role: "assistant" as const,
          content: resp.choices[0].message?.content ?? "",
          name: "Coder"
        }
      ]
    };
  }
};