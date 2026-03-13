# Open Source Policy (Docs App)
This document defines how the docs app is published from this monorepo into a public repository.

## Repository boundary
- Public repo includes only the `docs/` subtree.
- Private product code (API, app frontend, internal ops files) must not be copied into the public docs repo.

## Content boundary
- Public docs should explain product usage, architecture, MCP integration, and workflows.
- Do not publish secrets, private tokens, internal-only endpoints, or non-public operational details.

## Licensing boundary
Before first public release, choose and apply license files explicitly in the public docs repo:
- Site source code license (recommended: MIT).
- Documentation content license (recommended: CC BY 4.0).

If a single-license model is preferred, document that decision in the public repo README and include one canonical `LICENSE` file.

## Ownership
- Product team owns technical correctness and release policy.
- Community contributions are accepted through pull requests on the public docs repository.

## Release checklist
- Public repo created and visibility set to public.
- `README.md` includes setup and scope.
- `CONTRIBUTING.md` exists and explains contribution workflow.
- License file(s) added and verified.
- `Edit this page on GitHub` links point to public docs repo.
