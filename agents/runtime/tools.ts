import type { AgentContext, ToolResult } from "./agentTypes";
import { bmadTool } from "../tools/bmadTool";
import { webSearchTool } from "../tools/webSearchTool";

export const toolRegistry: Record<string, (args: any, ctx: AgentContext) => Promise<ToolResult>> = {
  bmad: bmadTool,
  web_search: webSearchTool,
};