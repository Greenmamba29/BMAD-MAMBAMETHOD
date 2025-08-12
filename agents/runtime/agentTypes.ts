import { z } from "zod";

export type ToolCall = {
  name: string;
  args: Record<string, any>;
};

export type ToolResult = {
  name: string;
  ok: boolean;
  data?: any;
  error?: string;
};

export type AgentMessage = {
  role: "system" | "user" | "assistant" | "tool";
  name?: string;
  content: string;
};

export type AgentContext = {
  userId?: string;
  traceId: string;
  tools: Record<string, (args: any, ctx: AgentContext) => Promise<ToolResult>>;
  memory?: Array<AgentMessage>;
};

export type Agent = {
  name: string;
  systemPrompt: string;
  allowedTools: string[];
  handle: (
    input: string,
    ctx: AgentContext
  ) => Promise<{
    messages: AgentMessage[];
    toolCalls?: ToolCall[];
    handoffTo?: string; // delegate to another agent by name
    done?: boolean;
  }>;
};