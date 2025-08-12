// agents/runtime/orchestrator.ts
import { v4 as uuid } from "uuid";
import type { AgentContext, AgentMessage, ToolCall } from "./agentTypes";
import { toolRegistry } from "./tools";
import { Supervisor } from "../roles/supervisor";
import { Researcher } from "../roles/researcher";
import { Coder } from "../roles/coder";
import { Verifier } from "../roles/verifier";

const agents = { 
  Supervisor, 
  Researcher, 
  Coder, 
  Verifier 
};

export async function runAgents(input: string, userId?: string) {
  const ctx: AgentContext = { 
    userId, 
    traceId: uuid(), 
    tools: toolRegistry, 
    memory: [] 
  };

  let current = agents.Supervisor;
  let step = 0;
  const maxSteps = 12;

  console.log(`🚀 Starting agent orchestration for user ${userId || 'anonymous'}`);
  console.log(`📝 Input: ${input.substring(0, 100)}${input.length > 100 ? '...' : ''}`);

  while (step++ < maxSteps) {
    console.log(`\n🔄 Step ${step}: Running ${current.name}`);
    
    try {
      const result = await current.handle(input, ctx);
      
      // Add messages to memory
      if (result.messages?.length) {
        ctx.memory!.push(...result.messages as AgentMessage[]);
        console.log(`💬 Added ${result.messages.length} messages to memory`);
      }

      // Handle tool calls
      if (result.toolCalls?.length) {
        console.log(`🔧 Executing ${result.toolCalls.length} tool calls`);
        
        for (const call of result.toolCalls as ToolCall[]) {
          console.log(`  🛠️  Calling tool: ${call.name}`);
          
          // Check if agent is allowed to use this tool
          if (!current.allowedTools.includes(call.name)) {
            console.log(`  ❌ Agent ${current.name} not allowed to use tool ${call.name}`);
            continue;
          }
          
          // Check if tool exists
          const tool = ctx.tools[call.name];
          if (!tool) {
            console.log(`  ❌ Tool ${call.name} not found in registry`);
            continue;
          }
          
          // Execute tool
          try {
            const toolRes = await tool(call.args ?? {}, ctx);
            ctx.memory!.push({
              role: "tool",
              name: call.name,
              content: JSON.stringify(toolRes)
            });
            console.log(`  ✅ Tool ${call.name} executed successfully`);
          } catch (toolError) {
            console.log(`  ❌ Tool ${call.name} failed:`, toolError);
            ctx.memory!.push({
              role: "tool",
              name: call.name,
              content: JSON.stringify({
                name: call.name,
                ok: false,
                error: toolError instanceof Error ? toolError.message : String(toolError)
              })
            });
          }
        }
        continue; // Let same agent react to tool results
      }

      // Handle handoff to another agent
      if (result.handoffTo && agents[result.handoffTo as keyof typeof agents]) {
        const nextAgent = agents[result.handoffTo as keyof typeof agents];
        console.log(`🔀 Handing off from ${current.name} to ${nextAgent.name}`);
        current = nextAgent;
        continue;
      }

      // Check if workflow is complete
      if (result.done) {
        console.log(`✅ Workflow completed by ${current.name}`);
        break;
      }

      // Default: return to Supervisor to decide next step
      if (current !== agents.Supervisor) {
        console.log(`🔙 Returning to Supervisor from ${current.name}`);
        current = agents.Supervisor;
      } else {
        console.log(`🛑 Supervisor completed without clear next action, ending workflow`);
        break; // Prevent infinite loops
      }
    } catch (error) {
      console.error(`❌ Error in step ${step} with agent ${current.name}:`, error);
      
      // Add error to memory and try to recover
      ctx.memory!.push({
        role: "assistant",
        name: "System",
        content: `Error occurred in ${current.name}: ${error instanceof Error ? error.message : String(error)}`
      });
      
      // Return to supervisor to handle the error
      if (current !== agents.Supervisor) {
        current = agents.Supervisor;
      } else {
        break; // If supervisor itself failed, exit
      }
    }
  }

  if (step >= maxSteps) {
    console.log(`⚠️  Workflow reached maximum steps (${maxSteps}), terminating`);
    ctx.memory!.push({
      role: "assistant",
      name: "System",
      content: "Workflow reached maximum steps and was terminated to prevent infinite loops."
    });
  }

  console.log(`🏁 Orchestration complete. Trace ID: ${ctx.traceId}`);
  console.log(`📊 Total memory entries: ${ctx.memory!.length}`);

  return { 
    traceId: ctx.traceId, 
    transcript: ctx.memory,
    steps: step - 1,
    completed: step < maxSteps
  };
}