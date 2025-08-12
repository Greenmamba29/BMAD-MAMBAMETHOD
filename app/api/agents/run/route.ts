// app/api/agents/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAgents } from "@/agents/runtime/orchestrator";
import { getServerSupabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { input } = await req.json();
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const result = await runAgents(input, user?.id ?? undefined);

  // (optional) log to Supabase
  // await supabase.from("agent_runs").insert({ user_id: user?.id, trace_id: result.traceId, transcript: result.transcript });

  return NextResponse.json(result);
}