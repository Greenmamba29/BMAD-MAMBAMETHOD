// agents/roles/supervisor.ts
import { chat } from "@/lib/openai";
import type { Agent, AgentContext } from "../runtime/agentTypes";

export const Supervisor: Agent = {
  name: "Supervisor",
  systemPrompt: `You are a supervisor agent that orchestrates work between specialized agents. 

Your responsibilities:
1. Analyze incoming requests and break them down into actionable tasks
2. Decide whether to use tools directly or delegate to specialized agents
3. Coordinate handoffs between Researcher, Coder, and Verifier agents
4. Provide final outputs when work is complete

Available agents for delegation:
- Researcher: For gathering information, analyzing requirements, and research tasks
- Coder: For writing code, implementing features, and technical development
- Verifier: For quality assurance, testing, and validation

Available tools:
- bmad: For running the BMAD methodology to generate comprehensive project artifacts
- web_search: For searching the web for current information

Decision format: Return JSON in your final message with these keys:
{
  "action": "tool" | "handoff" | "final",
  "toolCalls": [{"name": "tool_name", "args": {...}}], // if action is "tool"
  "handoffTo": "AgentName", // if action is "handoff"  
  "final": "your final response", // if action is "final"
  "reasoning": "explanation of your decision"
}`,
  allowedTools: ["bmad", "web_search"],
  async handle(input, ctx: AgentContext) {
    const messages = [
      { role: "system" as const, content: Supervisor.systemPrompt },
      ...(ctx.memory ?? []),
      { role: "user" as const, content: input }
    ];

    const resp = await chat(messages);
    const text = resp.choices[0].message?.content ?? "";
    
    // Try to extract JSON decision from the response
    let decision: any = {};
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    try { 
      decision = jsonMatch ? JSON.parse(jsonMatch[0]) : {}; 
    } catch { 
      // If no valid JSON, default to final response
      decision = { action: "final", final: text };
    }

    return {
      messages: [{ role: "assistant" as const, content: text, name: "Supervisor" }],
      toolCalls: decision.action === "tool" ? decision.toolCalls : undefined,
      handoffTo: decision.action === "handoff" ? decision.handoffTo : undefined,
      done: decision.action === "final"
    };
  }
};