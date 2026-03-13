# Project Brain Docs
This directory contains the documentation site for Project Brain.

The docs app is published to a standalone public repository using a snapshot sync script while remaining developed inside this monorepo.

## Scope
- In scope: product docs, setup guides, API/MCP usage docs, technical explainers.
- Out of scope: private app backend/frontend source code, internal infrastructure, and secrets.
- Internal prompts, delivery plans, and strategy notes must live outside `docs/` (for example in `internal_docs/`) so they are excluded from public publishing.

## Local development
Requirements:
- Node.js 20+
- npm

Install dependencies:
```bash
npm install
```

Run locally:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Publishing model (monorepo → public docs repo)
Use a snapshot sync from repository root:

1. Add public remote (once):
```bash
git remote add docs-public git@github.com:<org>/projectbrain-docs.git
```
2. Publish current `docs/` snapshot:
2. Push docs subtree to public repo:
```bash
bash scripts/sync-docs-public.sh docs-public main
```
This script clones the public repo branch, replaces its contents with `docs/`, commits the change, and pushes it.

## GitHub Actions automation
This repository includes `.github/workflows/docs-sync.yml`, which automatically publishes docs when `docs/**` changes on `main`.

Required secret in this repository:
- `DOCS_PUBLIC_DEPLOY_KEY`: private SSH deploy key with write access to `9-Trinkets/projectbrain-docs`

The corresponding public key should be added to the `projectbrain-docs` repository (deploy keys with write access enabled).
```

## Ownership and contribution boundary
- Docs content is community-editable through the public docs repository.
- Application/runtime source code remains in the private product repository.
- Changes that require private code access should be documented as issues, then implemented internally.
