// agents/tools/webSearchTool.ts
import type { AgentContext, ToolResult } from "../runtime/agentTypes";

export async function webSearchTool(args: { q: string }, _ctx: AgentContext): Promise<ToolResult> {
  // Replace with your own search or Make.com scenario call
  // await fetch(process.env.MAKE_WEBHOOK_URL!, { method: "POST", body: JSON.stringify(args) })
  return { name: "web_search", ok: true, data: [{ title: "Stub", url: "https://example.com" }] };
}