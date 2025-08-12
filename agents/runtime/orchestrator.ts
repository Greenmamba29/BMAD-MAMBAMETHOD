// agents/runtime/orchestrator.ts
import { v4 as uuid } from "uuid";
import type { AgentContext, AgentMessage, ToolCall } from "./agentTypes";
import { toolRegistry } from "./tools";
import { Supervisor } from "../roles/supervisor";
import { Researcher } from "../roles/researcher";
import { Coder } from "../roles/coder";
import { Verifier } from "../roles/verifier";

const agents = { Supervisor, Researcher, Coder, Verifier };

export async function runAgents(input: string, userId?: string) {
  const ctx: AgentContext = { userId, traceId: uuid(), tools: toolRegistry, memory: [] };

  let current = agents.Supervisor;
  let step = 0;

  while (step++ < 12) {
    const result = await current.handle(input, ctx);
    if (result.messages?.length) ctx.memory!.push(...result.messages as AgentMessage[]);

    // Tool calls
    if (result.toolCalls?.length) {
      for (const call of result.toolCalls as ToolCall[]) {
        if (!current.allowedTools.includes(call.name)) continue;
        const tool = ctx.tools[call.name];
        if (!tool) continue;
        const toolRes = await tool(call.args ?? {}, ctx);
        ctx.memory!.push({
          role: "tool",
          name: call.name,
          content: JSON.stringify(toolRes)
        });
      }
      continue; // let same agent react to tool results
    }

    // Handoff
    if (result.handoffTo && agents[result.handoffTo as keyof typeof agents]) {
      current = agents[result.handoffTo as keyof typeof agents];
      continue;
    }

    if (result.done) break;

    // Default: return to Supervisor to decide next step
    if (current !== agents.Supervisor) {
      current = agents.Supervisor;
    } else {
      break; // prevent loops
    }
  }

  return { traceId: ctx.traceId, transcript: ctx.memory };
}