# Contributing to ProjectBrain Docs
Thanks for helping improve the docs.

## Quick start
1. Fork `9-Trinkets/projectbrain-docs` and clone your fork.
2. Install dependencies:
```bash
npm install
```
3. Run locally:
```bash
npm run dev
```
4. Build before opening a PR:
```bash
npm run build
```

## Editing docs
- Most content currently lives in `src/App.tsx`.
- Use the **Edit this page on GitHub** link in the docs UI for quick edits.
- Keep changes focused and small when possible.

## Docs writing standards
- Be explicit and actionable.
- Prefer short sections and clear headings.
- Use concrete examples for commands and configuration.
- Keep product claims accurate and verifiable.
- Never include secrets, private credentials, or internal-only notes.

## Pull request workflow
1. Create a branch from `main`:
```bash
git checkout -b docs/<short-description>
```
2. Make your changes and run `npm run build`.
3. Commit with a clear message:
```bash
git commit -m "docs: <what changed>"
```
4. Push your branch and open a PR to `main`.
5. In your PR description, include:
   - what changed
   - why it changed
   - any screenshots (for visual updates)

## One-pass PR checklist
- [ ] Build succeeds locally (`npm run build`)
- [ ] Wording is clear and typo-free
- [ ] Links are valid
- [ ] No secrets or internal-only content included
