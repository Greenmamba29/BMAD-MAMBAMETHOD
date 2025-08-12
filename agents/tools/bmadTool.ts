import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { openai } from "@/lib/openai";
import type { AgentContext, ToolResult } from "../runtime/agentTypes";

type RunBMADArgs = {
  objective: string;
  team?: "team-fullstack" | "team-all"; // can add more from /bmad-core/agent-teams
  workflow?: string; // e.g., "greenfield-fullstack"
  model?: string; // default gpt-4o
  maxSteps?: number; // cap steps if you want shorter runs
};

type Artifact = { filename: string; content: string };

type BMADOutput = {
  plan: string[];
  summary: string;
  artifacts: Artifact[];
};

const BMAD_ROOT = path.resolve(process.cwd(), "agents/vendor/bmad");

// --- File helpers ------------------------------------------------------------

async function readText(file: string) {
  return fs.readFile(file, "utf-8");
}

async function loadAgentPrompt(slug: string) {
  // slug like "analyst" -> /dist/agents/analyst.txt
  const p = path.join(BMAD_ROOT, "dist", "agents", `${slug}.txt`);
  return readText(p);
}

async function loadTeamYaml(teamFile: string) {
  const p = path.join(BMAD_ROOT, "bmad-core", "agent-teams", teamFile);
  const raw = await readText(p);
  return yaml.load(raw) as any;
}

async function loadWorkflowYaml(id: string) {
  // id like "greenfield-fullstack" -> /bmad-core/workflows/greenfield-fullstack.yaml
  const p = path.join(BMAD_ROOT, "bmad-core", "workflows", `${id}.yaml`);
  const raw = await readText(p);
  return yaml.load(raw) as any;
}

// --- System prompt assembly --------------------------------------------------

async function buildSystemForAgent(agentSlug: string) {
  const orchestrator = await loadAgentPrompt("bmad-orchestrator"); // core wrapper
  const rolePrompt = await loadAgentPrompt(agentSlug);
  // Keep it simple: orchestrator first, then agent’s role card
  return `${orchestrator}\n\n\n### ROLE CARD: ${agentSlug.toUpperCase()}\n${rolePrompt}`;
}

// --- One step of the workflow -----------------------------------------------

async function runStep(params: {
  agentSlug: string;
  stepName: string;
  objective: string;
  priorArtifacts: Artifact[];
  model: string;
}) {
  const { agentSlug, stepName, objective, priorArtifacts, model } = params;

  const system = await buildSystemForAgent(agentSlug);
  const contextSummary = priorArtifacts.length > 0 ? priorArtifacts.map(a => `- ${a.filename}`).join("\n") : "None yet.";

  const userPrompt = [
    `PROJECT OBJECTIVE:\n${objective}`,
    `WORKFLOW STEP: ${stepName}`,
    `AVAILABLE PRIOR ARTIFACTS:\n${contextSummary}`,
    `OUTPUT REQUIREMENTS:\n- Produce the primary deliverable for this step.\n- If a document is produced, suggest a filename.\n- Return results in a JSON block with keys: {"summary": string, "filename": string, "content": string}.`
  ].join("\n\n");

  const resp = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt }
    ]
  });

  const content = resp.choices[0]?.message?.content ?? "";
  // Try to extract JSON block
  let json: any = null;
  const match = content.match(/\{[\s\S]*\}$/m);
  try {
    json = match ? JSON.parse(match[0]) : {};
  } catch {
    json = {};
  }

  const filename = json.filename || `${agentSlug}-${stepName}.md`;
  const artifact: Artifact = { filename, content: json.content || content };
  const summary = json.summary || `Created ${filename} via ${agentSlug}`;

  return { artifact, summary };
}

// --- Public API --------------------------------------------------------------

export async function runBMAD(args: RunBMADArgs): Promise<BMADOutput> {
  const { objective, team = "team-fullstack", workflow = "greenfield-fullstack", model = "gpt-4o", maxSteps = 8 } = args;

  // Load team + workflow definitions
  const teamDef = await loadTeamYaml(`${team}.yaml`); // includes agents + workflows
  const wfDef = await loadWorkflowYaml(workflow); // includes "sequence" steps

  // Basic guardrails
  if (!wfDef?.workflow?.sequence) {
    throw new Error(`Workflow "${workflow}" not found or malformed.`);
  }

  const plan: string[] = [];
  const artifacts: Artifact[] = [];

  // Run through sequence (trim if maxSteps < sequence length)
  const sequence = (wfDef.workflow.sequence as any[]).slice(0, maxSteps);

  for (const step of sequence) {
    const agentSlug = step.agent as string; // e.g., "analyst", "pm", "architect", "dev", "qa", "ux-expert"
    const creates = step.creates as string; // filename guidance (optional)
    const stepName = creates || step.name || agentSlug;

    const { artifact, summary } = await runStep({
      agentSlug,
      stepName,
      objective,
      priorArtifacts: artifacts,
      model
    });

    plan.push(`${agentSlug}: ${summary}`);
    artifacts.push(artifact);
  }

  // Final pass: ask orchestrator to summarize/validate the package
  const system = await buildSystemForAgent("bmad-orchestrator");
  const recapPrompt = [
    `PROJECT OBJECTIVE:\n${objective}`,
    `ARTIFACTS:\n${artifacts.map(a => `- ${a.filename}`).join("\n")}`,
    `TASK:\nSummarize the plan in 5-8 bullets and confirm the artifacts set covers the objective.`
  ].join("\n\n");

  const recapResp = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: recapPrompt }
    ]
  });

  const summary = recapResp.choices[0]?.message?.content ?? "BMAD run complete.";

  return { plan, summary, artifacts };
}

// --- Tool wrapper for your orchestrator --------------------------------------

export async function bmadTool(
  args: { objective: string; team?: string; workflow?: string; model?: string; maxSteps?: number },
  _ctx: AgentContext
): Promise<ToolResult> {
  try {
    const data = await runBMAD({
      objective: args.objective,
      team: (args.team as any) ?? "team-fullstack",
      workflow: args.workflow ?? "greenfield-fullstack",
      model: args.model ?? "gpt-4o",
      maxSteps: args.maxSteps ?? 6
    });
    return { name: "bmad", ok: true, data };
  } catch (e: any) {
    return { name: "bmad", ok: false, error: e?.message ?? "BMAD failed" };
  }
}