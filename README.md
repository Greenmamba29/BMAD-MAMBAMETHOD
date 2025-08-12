# BMAD Agent Scaffold

A production-ready agent scaffold that gives you:

- **Supervisor agent** that plans and delegates
- **Sub-agents** (Researcher / Coder / Verifier)
- **BMAD tool wrapper** (so your uploaded BMAD-METHOD runs as a callable tool)
- **Supabase user context**
- **Next.js `/api/agents/run` endpoint** and a tiny client hook

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:
```ini
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
MAKE_WEBHOOK_URL=https://hook.make.com/your-id   # optional
```

### 3. Add Your BMAD Files

Unzip your BMAD-METHOD upload and copy these folders into your app:

```bash
/agents/vendor/bmad/
  bmad-core/               # from BMAD-METHOD-main/bmad-core
  dist/                    # from BMAD-METHOD-main/dist
```

Your final paths should look like:
```
/agents/vendor/bmad/bmad-core/agent-teams/team-fullstack.yaml
/agents/vendor/bmad/bmad-core/workflows/greenfield-fullstack.yaml
/agents/vendor/bmad/dist/agents/bmad-orchestrator.txt
... (other agents *.txt)
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the demo interface.

## 🏗️ Architecture

### File Structure

```
/agents
  /runtime
    agentTypes.ts          # Core type definitions
    orchestrator.ts        # Agent coordination logic
    tools.ts              # Tool registry
  /tools
    bmadTool.ts           # BMAD integration wrapper
    webSearchTool.ts      # Example web search tool
  /roles
    supervisor.ts         # Planning & delegation agent
    researcher.ts         # Research specialist
    coder.ts             # Development specialist
    verifier.ts          # QA & validation specialist
  /vendor/bmad/          # Your BMAD bundle files
    bmad-core/
    dist/
/lib
  openai.ts              # OpenAI client helper
  supabaseServer.ts      # Supabase server utilities
/app
  /api/agents/run/       # Next.js API endpoint
    route.ts
  page.tsx               # Demo interface
useAgentRunner.ts        # React hook for client usage
```

### Core Components

#### Agent Types (`agents/runtime/agentTypes.ts`)
Defines the core interfaces for agents, tools, and messages.

#### Orchestrator (`agents/runtime/orchestrator.ts`)
Coordinates agent execution, manages tool calls, and handles agent handoffs.

#### BMAD Tool (`agents/tools/bmadTool.ts`)
Wraps your BMAD bundle to make it callable by agents. Reads teams/workflows from YAML and agent prompts from TXT files.

#### Agent Roles
- **Supervisor**: Plans, delegates, and coordinates the overall workflow
- **Researcher**: Handles research tasks using web search tools
- **Coder**: Specializes in development tasks and can use BMAD
- **Verifier**: Acts as QA, validates outputs, and proposes fixes

## 🛠️ Usage

### Basic Agent Run

```typescript
import { runAgents } from '@/agents/runtime/orchestrator';

const result = await runAgents(
  "Build a Next.js + Supabase file cleanup assistant with tiered features",
  "user-123"
);

console.log(result.transcript); // Full conversation history
console.log(result.traceId);    // Unique identifier for this run
```

### Using the BMAD Tool

```typescript
import { bmadTool } from '@/agents/tools/bmadTool';

const result = await bmadTool({
  objective: "Build a file management system",
  team: "team-fullstack",
  workflow: "greenfield-fullstack",
  maxSteps: 5
}, context);

if (result.ok) {
  console.log(result.data.plan);      // Step-by-step plan
  console.log(result.data.summary);   // Executive summary
  console.log(result.data.artifacts); // Generated deliverables
}
```

### Client-Side Usage

```typescript
import { useAgentRunner } from '@/useAgentRunner';

function MyComponent() {
  const { loading, trace, run } = useAgentRunner();
  
  const handleRun = () => {
    run("Build a task management app");
  };
  
  return (
    <button onClick={handleRun} disabled={loading}>
      {loading ? 'Running...' : 'Run Agents'}
    </button>
  );
}
```

## 🔧 Configuration

### Available Teams
- `team-fullstack` - Complete development team
- `team-all` - Extended team with additional specialists

### Available Workflows
- `greenfield-fullstack` - New full-stack application development
- `brownfield-fullstack` - Existing application enhancement
- `greenfield-service` - New backend service development
- `greenfield-ui` - New frontend application development

### Customizing Agents

Modify agent prompts in `agents/roles/*.ts` files:

```typescript
export const Supervisor: Agent = {
  name: "Supervisor",
  systemPrompt: `Your custom system prompt here...`,
  allowedTools: ["bmad", "web_search"],
  // ... rest of implementation
};
```

### Adding New Tools

1. Create your tool function in `agents/tools/`
2. Add it to the registry in `agents/runtime/tools.ts`
3. Update agent `allowedTools` arrays as needed

## 📊 Monitoring & Logging

### Supabase Integration

The system automatically logs agent runs to Supabase (when configured):

```typescript
// In app/api/agents/run/route.ts
await supabase.from("agent_runs").insert({
  user_id: user?.id,
  trace_id: result.traceId,
  transcript: result.transcript
});
```

### Trace IDs

Every agent run gets a unique `traceId` for tracking and debugging.

## 🚀 Production Deployment

### Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all required environment variables are set in your production environment.

### BMAD Files

Make sure your BMAD bundle files are included in your deployment.

## 🔍 Troubleshooting

### Common Issues

1. **BMAD files not found**: Check that your BMAD bundle is properly extracted to `/agents/vendor/bmad/`
2. **OpenAI API errors**: Verify your `OPENAI_API_KEY` is set and valid
3. **Supabase connection issues**: Check your Supabase URL and keys

### Debug Mode

Enable detailed logging by setting `DEBUG=true` in your environment.

## 📚 API Reference

### `/api/agents/run`

**POST** endpoint for running agents.

**Request Body:**
```json
{
  "input": "Your project objective here"
}
```

**Response:**
```json
{
  "traceId": "uuid-string",
  "transcript": [
    {
      "role": "user",
      "content": "User input"
    },
    {
      "role": "assistant",
      "name": "Supervisor",
      "content": "Agent response"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the BMAD documentation
3. Open an issue in the repository

---

Built with ❤️ using Next.js, OpenAI, and the BMAD methodology.
