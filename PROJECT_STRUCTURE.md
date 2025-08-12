# BMAD Agent Scaffold - Project Structure

## Overview

This is a production-ready multi-agent system scaffold with BMAD methodology integration. The project follows Next.js 15+ conventions with TypeScript throughout.

## Directory Structure

```
/
├── .env.local.example          # Environment variables template
├── .gitignore                  # Git ignore patterns
├── README.md                   # Main project documentation
├── PROJECT_STRUCTURE.md        # This file
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration for Tailwind
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
│
├── agents/                     # Agent system core
│   ├── runtime/                # Core runtime components
│   │   ├── agentTypes.ts       # Type definitions for agents, tools, messages
│   │   ├── orchestrator.ts     # Main orchestration logic with handoffs
│   │   └── tools.ts            # Tool registry mapping
│   │
│   ├── roles/                  # Individual agent implementations
│   │   ├── supervisor.ts       # Supervisor agent (orchestrates workflow)
│   │   ├── researcher.ts       # Research specialist agent
│   │   ├── coder.ts            # Software development agent
│   │   └── verifier.ts         # Quality assurance agent
│   │
│   ├── tools/                  # Tool implementations
│   │   ├── bmadTool.ts         # BMAD methodology execution tool
│   │   └── webSearchTool.ts    # Web search integration
│   │
│   └── vendor/                 # Third-party integrations
│       └── bmad/               # BMAD methodology files
│           ├── README.md       # Instructions for adding BMAD files
│           ├── bmad-core/      # BMAD team and workflow definitions
│           │   ├── agent-teams/
│           │   └── workflows/
│           └── dist/           # BMAD agent prompts
│               └── agents/
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Demo page with agent interface
│   ├── globals.css             # Global styles with Tailwind
│   └── api/                    # API routes
│       └── agents/
│           └── run/
│               └── route.ts    # Main agent execution endpoint
│
├── hooks/                      # React hooks
│   └── useAgentRunner.ts       # Client-side agent execution hook
│
└── lib/                        # Shared utilities
    ├── openai.ts               # OpenAI client and chat helper
    └── supabaseServer.ts       # Supabase server-side client
```

## Key Components

### Agent System (`/agents`)

**Runtime**
- `agentTypes.ts`: Core type definitions for the entire agent system
- `orchestrator.ts`: Main loop that manages agent handoffs, tool execution, and workflow
- `tools.ts`: Registry that maps tool names to their implementations

**Roles**
- `supervisor.ts`: Decision-making agent that plans and delegates work
- `researcher.ts`: Specializes in information gathering and analysis
- `coder.ts`: Handles all software development tasks
- `verifier.ts`: Quality assurance and testing specialist

**Tools**
- `bmadTool.ts`: Comprehensive BMAD methodology integration with YAML parsing
- `webSearchTool.ts`: Placeholder for web search integration

### API Layer (`/app/api`)

**Agents API**
- `POST /api/agents/run`: Main endpoint for executing agent workflows
- `GET /api/agents/run`: Health check endpoint
- Includes user authentication via Supabase
- Optional logging to Supabase database

### Client Layer (`/app`, `/hooks`)

**UI Components**
- `page.tsx`: Demo interface with agent interaction
- `layout.tsx`: Root application layout

**Hooks**
- `useAgentRunner.ts`: React hook for agent execution with helpers

### Utilities (`/lib`)

**OpenAI Integration**
- `openai.ts`: Configured OpenAI client with chat helper

**Supabase Integration**
- `supabaseServer.ts`: Server-side Supabase client with cookie handling

## Data Flow

1. **User Input** → Demo UI → `useAgentRunner` hook
2. **API Call** → `POST /api/agents/run` → User authentication
3. **Orchestration** → `runAgents()` → Supervisor agent
4. **Workflow** → Agent handoffs → Tool execution → Memory management
5. **Response** → Aggregated results → Client display

## Configuration

### Environment Variables

```env
OPENAI_API_KEY=sk-...                    # Required for AI functionality
NEXT_PUBLIC_SUPABASE_URL=...             # Required for user context
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # Required for user context
MAKE_WEBHOOK_URL=...                     # Optional for web search
```

### Agent Configuration

Each agent can be configured with:
- `systemPrompt`: Instructions and behavior
- `allowedTools`: Tools the agent can use
- `handle()`: Custom processing logic

### Tool Configuration

Tools implement the interface:
```typescript
(args: any, ctx: AgentContext) => Promise<ToolResult>
```

## Extension Points

### Adding New Agents

1. Create agent file in `/agents/roles/`
2. Add to orchestrator's agent registry
3. Update Supervisor to know about the new agent

### Adding New Tools

1. Create tool file in `/agents/tools/`
2. Add to tool registry in `/agents/runtime/tools.ts`
3. Update agent `allowedTools` arrays

### Customizing BMAD

1. Add BMAD files to `/agents/vendor/bmad/`
2. Modify team definitions in `bmad-core/agent-teams/`
3. Adjust workflows in `bmad-core/workflows/`
4. Update agent prompts in `dist/agents/`

## Production Considerations

### Security
- Environment variables properly isolated
- User authentication via Supabase
- Input validation on API endpoints

### Performance
- Type-safe throughout with TypeScript
- Efficient agent handoffs without unnecessary loops
- Configurable step limits to prevent infinite execution

### Monitoring
- Comprehensive logging throughout orchestration
- Optional database logging for analytics
- Error handling and recovery mechanisms

### Scalability
- Stateless agent execution
- Extensible tool and agent architecture
- Ready for horizontal scaling

## Development Workflow

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your keys

# Type checking
npm run type-check

# Development server
npm run dev

# Production build
npm run build

# Production server
npm start
```