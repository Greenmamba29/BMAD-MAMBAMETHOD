// hooks/useAgentRunner.ts
import { useState, useCallback } from "react";

export interface AgentMessage {
  role: "system" | "user" | "assistant" | "tool";
  name?: string;
  content: string;
}

export interface AgentRunResult {
  success: boolean;
  traceId: string;
  transcript: AgentMessage[];
  steps: number;
  completed: boolean;
  duration_ms: number;
  error?: string;
}

export function useAgentRunner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (input: string) => {
    if (!input?.trim()) {
      setError("Please provide a valid input");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Agent run failed");
      }

      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Agent runner error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  // Helper function to get the final assistant response
  const getFinalResponse = useCallback(() => {
    if (!result?.transcript) return null;
    
    const assistantMessages = result.transcript
      .filter(msg => msg.role === "assistant" && msg.name !== "System")
      .reverse(); // Get the last assistant message
    
    return assistantMessages[0]?.content || null;
  }, [result]);

  // Helper function to get messages by agent
  const getMessagesByAgent = useCallback((agentName: string) => {
    if (!result?.transcript) return [];
    
    return result.transcript.filter(msg => 
      msg.role === "assistant" && msg.name === agentName
    );
  }, [result]);

  // Helper function to get tool usage summary
  const getToolUsage = useCallback(() => {
    if (!result?.transcript) return [];
    
    const toolMessages = result.transcript.filter(msg => msg.role === "tool");
    const toolUsage = toolMessages.map(msg => {
      try {
        const toolResult = JSON.parse(msg.content);
        return {
          name: msg.name || toolResult.name,
          success: toolResult.ok,
          error: toolResult.error
        };
      } catch {
        return {
          name: msg.name || "unknown",
          success: false,
          error: "Failed to parse tool result"
        };
      }
    });
    
    return toolUsage;
  }, [result]);

  return {
    // State
    loading,
    result,
    error,
    
    // Actions
    run,
    reset,
    
    // Helpers
    getFinalResponse,
    getMessagesByAgent,
    getToolUsage
  };
}