// app/api/agents/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAgents } from "@/agents/runtime/orchestrator";
import { getServerSupabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: "Invalid input. Please provide a string input." },
        { status: 400 }
      );
    }

    // Get user context from Supabase
    const supabase = await getServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.warn("Auth error (proceeding anonymously):", authError.message);
    }

    console.log(`📥 API Request from user: ${user?.id || 'anonymous'}`);
    console.log(`📝 Input: ${input.substring(0, 200)}${input.length > 200 ? '...' : ''}`);

    // Run the agent orchestrator
    const startTime = Date.now();
    const result = await runAgents(input, user?.id ?? undefined);
    const duration = Date.now() - startTime;

    console.log(`⏱️  Agent run completed in ${duration}ms`);

    // Optional: Log to Supabase for analytics and debugging
    try {
      await supabase.from("agent_runs").insert({
        user_id: user?.id,
        trace_id: result.traceId,
        input: input.substring(0, 1000), // Truncate long inputs
        transcript: result.transcript,
        steps: result.steps,
        completed: result.completed,
        duration_ms: duration,
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.warn("Failed to log to database (continuing):", dbError);
    }

    return NextResponse.json({
      success: true,
      ...result,
      duration_ms: duration
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for health checks
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "bmad-agent-scaffold",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
}