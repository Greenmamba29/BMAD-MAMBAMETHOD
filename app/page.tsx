'use client';

import { useAgentRunner } from '../useAgentRunner';
import { useState } from 'react';

export default function Home() {
  const { loading, trace, run } = useAgentRunner();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      run(input);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          BMAD Agent Scaffold
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your project objective..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : 'Run Agents'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Agents are working...</p>
          </div>
        )}

        {trace && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Agent Run Results</h2>
            <div className="mb-4">
              <h3 className="font-medium text-gray-700">Trace ID:</h3>
              <p className="text-sm text-gray-600 font-mono">{trace.traceId}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-700">Transcript:</h3>
              <div className="bg-gray-50 rounded p-3 max-h-96 overflow-y-auto">
                {trace.transcript?.map((msg: any, i: number) => (
                  <div key={i} className="mb-3 p-2 bg-white rounded border">
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.role} {msg.name && `(${msg.name})`}
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
          <div className="text-blue-800 space-y-2">
            <p>• Enter a project objective (e.g., "Build a Next.js + Supabase file cleanup assistant")</p>
            <p>• The Supervisor agent will plan and delegate to specialized agents</p>
            <p>• Use the BMAD tool for structured project planning</p>
            <p>• Check the transcript to see the agent workflow</p>
          </div>
        </div>
      </div>
    </div>
  );
}