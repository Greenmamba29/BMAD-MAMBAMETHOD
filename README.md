# BMAD Agent Scaffold

A production-ready multi-agent system with BMAD methodology integration, built with Next.js, TypeScript, and OpenAI.

## Features

- **Multi-Agent Architecture**: Supervisor, Researcher, Coder, and Verifier agents working together
- **BMAD Integration**: Full support for BMAD methodology workflows and teams
- **Tool System**: Extensible tool registry with web search and BMAD execution
- **Supabase Integration**: User context and optional logging
- **TypeScript**: Full type safety throughout the system
- **Next.js API**: RESTful API endpoint for agent execution
- **React Hook**: Easy-to-use client-side integration

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
MAKE_WEBHOOK_URL=https://hook.make.com/your-id  # optional
```

### 3. Add BMAD Files (Optional)

For full BMAD functionality, copy your BMAD-METHOD files:

```bash
# Unzip your BMAD-METHOD bundle
# Then copy the required directories:
cp -r BMAD-METHOD-main/bmad-core/ agents/vendor/bmad/bmad-core/
cp -r BMAD-METHOD-main/dist/ agents/vendor/bmad/dist/
```

See `agents/vendor/bmad/README.md` for detailed instructions.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to test the agent system.

## Architecture

### Agents

- **Supervisor**: Orchestrates work between agents and makes delegation decisions
- **Researcher**: Gathers information, analyzes requirements, and provides insights
- **Coder**: Writes code, implements features, and provides technical solutions  
- **Verifier**: Quality assurance, testing, and validation

### Tools

- **bmad**: Executes BMAD methodology workflows for comprehensive project planning
- **web_search**: Searches the web for current information (integrate with your preferred search API)

### Workflow

1. User submits a request
2. Supervisor analyzes and decides on approach
3. Agents are called sequentially or tools are used
4. Results are aggregated and returned

## API Usage

### Endpoint

```
POST /api/agents/run
```

### Request

```json
{
  "input": "Build a Next.js todo app with Supabase authentication"
}
```

### Response

```json
{
  "success": true,
  "traceId": "uuid",
  "transcript": [...],
  "steps": 5,
  "completed": true,
  "duration_ms": 15420
}
```

## React Hook Usage

```tsx
import { useAgentRunner } from "@/hooks/useAgentRunner";

function MyComponent() {
  const { loading, result, error, run } = useAgentRunner();

  const handleSubmit = async () => {
    await run("Build a React component for file uploads");
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Running..." : "Run Agents"}
      </button>
      {result && <div>{result.getFinalResponse()}</div>}
    </div>
  );
}
```

## Configuration

### Adding New Agents

1. Create agent in `agents/roles/`
2. Add to `agents/runtime/orchestrator.ts`
3. Update Supervisor prompts to include new agent

### Adding New Tools

1. Create tool in `agents/tools/`
2. Add to `agents/runtime/tools.ts`
3. Update agent `allowedTools` arrays

### Customizing BMAD

- Modify teams in `agents/vendor/bmad/bmad-core/agent-teams/`
- Adjust workflows in `agents/vendor/bmad/bmad-core/workflows/`
- Update agent prompts in `agents/vendor/bmad/dist/agents/`

## Database Schema (Optional)

For Supabase logging, create this table:

```sql
CREATE TABLE agent_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  trace_id UUID NOT NULL,
  input TEXT,
  transcript JSONB,
  steps INTEGER,
  completed BOOLEAN,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX idx_agent_runs_trace_id ON agent_runs(trace_id);
CREATE INDEX idx_agent_runs_created_at ON agent_runs(created_at);
```

## Example Queries

- "Build a Next.js todo app with Supabase authentication"
- "Research the latest trends in AI agent architectures"
- "Create a file cleanup utility with tiered pricing"
- "Design a React component library with TypeScript"

## Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This is a standard Next.js application and can be deployed to:

- Vercel (recommended)
- Netlify
- Railway
- Any Node.js hosting provider

Make sure to set environment variables in your deployment platform.

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
