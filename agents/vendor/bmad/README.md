# BMAD Vendor Directory

This directory is where you should place your BMAD methodology files to enable full BMAD functionality.

## Required Structure

```
agents/vendor/bmad/
├── bmad-core/
│   ├── agent-teams/
│   │   ├── team-fullstack.yaml
│   │   ├── team-all.yaml
│   │   └── ... (other team definitions)
│   └── workflows/
│       ├── greenfield-fullstack.yaml
│       ├── brownfield-fullstack.yaml
│       ├── greenfield-service.yaml
│       ├── greenfield-ui.yaml
│       └── ... (other workflow definitions)
└── dist/
    └── agents/
        ├── bmad-orchestrator.txt
        ├── analyst.txt
        ├── pm.txt
        ├── architect.txt
        ├── dev.txt
        ├── qa.txt
        ├── ux-expert.txt
        └── ... (other agent prompt files)
```

## How to Add BMAD Files

1. **Unzip your BMAD-METHOD bundle** to a temporary location
2. **Copy the required directories:**
   - Copy `BMAD-METHOD-main/bmad-core/` to `agents/vendor/bmad/bmad-core/`
   - Copy `BMAD-METHOD-main/dist/` to `agents/vendor/bmad/dist/`

## Fallback Mode

If BMAD files are not present, the system will operate in **fallback mode**:
- The `bmadTool` will still function but with basic placeholder logic
- You'll see a note in the artifacts indicating fallback mode was used
- All other agent functionality remains fully operational

## Testing

Once you've added the BMAD files, you can test the integration by:
1. Running the development server: `npm run dev`
2. Using a query like: "Build a Next.js file cleanup assistant with tiered features"
3. The system should automatically use the BMAD methodology to generate comprehensive project artifacts

## Supported Teams and Workflows

After adding your BMAD files, you can specify different teams and workflows:

- **Teams:** `team-fullstack`, `team-all`, etc.
- **Workflows:** `greenfield-fullstack`, `brownfield-fullstack`, `greenfield-service`, `greenfield-ui`, etc.

The exact options depend on what's included in your BMAD bundle.