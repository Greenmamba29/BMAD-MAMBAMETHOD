"use client";

import { useState } from "react";
import { useAgentRunner } from "@/hooks/useAgentRunner";

export default function Home() {
  const [input, setInput] = useState("");
  const { loading, result, error, run, reset, getFinalResponse, getToolUsage } = useAgentRunner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await run(input);
    }
  };

  const finalResponse = getFinalResponse();
  const toolUsage = getToolUsage();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">BMAD Agent Scaffold</h1>
        <p className="text-gray-600 mb-6">
          Production-ready multi-agent system with Supervisor, Researcher, Coder, and Verifier agents.
          Includes BMAD methodology integration for comprehensive project planning.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="input" className="block text-sm font-medium mb-2">
            Ask the agents to help you with a task:
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Build a Next.js file cleanup assistant with tiered features"
            className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[100px]"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {loading ? "Running Agents..." : "Run Agents"}
          </button>
          {result && (
            <button
              type="button"
              onClick={reset}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Execution Summary</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Trace ID:</strong> {result.traceId}</p>
              <p><strong>Steps:</strong> {result.steps}</p>
              <p><strong>Duration:</strong> {result.duration_ms}ms</p>
              <p><strong>Completed:</strong> {result.completed ? "✅ Yes" : "⚠️ Partial"}</p>
            </div>
          </div>

          {/* Tool Usage */}
          {toolUsage.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Tools Used</h3>
              <div className="space-y-2">
                {toolUsage.map((tool, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className={tool.success ? "text-green-600" : "text-red-600"}>
                      {tool.success ? "✅" : "❌"}
                    </span>
                    <span className="font-medium">{tool.name}</span>
                    {tool.error && <span className="text-red-600">({tool.error})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Response */}
          {finalResponse && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Final Response</h3>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                  {finalResponse}
                </pre>
              </div>
            </div>
          )}

          {/* Full Transcript */}
          <details className="bg-gray-50 border border-gray-200 rounded-lg">
            <summary className="p-4 cursor-pointer font-semibold">
              View Full Transcript ({result.transcript.length} messages)
            </summary>
            <div className="border-t border-gray-200 p-4 space-y-3">
              {result.transcript.map((msg, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
                    <span className="capitalize">{msg.role}</span>
                    {msg.name && <span>({msg.name})</span>}
                  </div>
                  <div className="text-sm">
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border overflow-x-auto">
                      {msg.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Example Queries */}
      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Example Queries</h3>
        <div className="space-y-2 text-sm">
          <button
            onClick={() => setInput("Build a Next.js todo app with Supabase authentication")}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded border"
          >
            Build a Next.js todo app with Supabase authentication
          </button>
          <button
            onClick={() => setInput("Research the latest trends in AI agent architectures")}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded border"
          >
            Research the latest trends in AI agent architectures
          </button>
          <button
            onClick={() => setInput("Create a file cleanup utility with tiered pricing")}
            className="block w-full text-left p-2 hover:bg-gray-100 rounded border"
          >
            Create a file cleanup utility with tiered pricing
          </button>
        </div>
      </div>
    </div>
  );
}