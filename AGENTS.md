<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


Project: a Fathom-style AI meeting notes app (take-home assignment, 1-day window).
The goal is a small, working, well-designed product that focuses on the experience AFTER a meeting
(library, transcript, AI summary, action items, search). It is not a pixel-for-pixel copy.

## Stack (do not add to it without asking)
- Next.js (App Router) + TypeScript + React
- Supabase (auth, Postgres, storage)
- Gemini API for summaries, action items, and Q&A (server-side only)
- Deploy on Vercel
- Styling: Tailwind CSS only. No UI component libraries unless I ask.

## Code rules
- Write the minimum code needed for the current task. No extra features, helpers, abstractions, or "nice to have" additions.
- Never duplicate code. Before writing anything, search the repo for existing code that does the same thing and reuse it. If logic is needed in two places, extract it once.
- No dead code, no commented-out code, no unused imports, no unused files.
- No placeholder or lorem ipsum content. Sample meetings/transcripts are allowed only as clearly labeled seed data.
- Anything mocked or cut from the original product (live meeting bot, real recording, calendar sync) must be labeled in the UI where relevant and listed in README.md.
- Keep components small and single-purpose. Keep files short.
- Use TypeScript types properly. No `any`.
- Validate AI responses (use a schema) before saving or rendering them.
- Don't add a new dependency if the stack already covers it. Ask first.

## Working rules
- Only change files related to the current task. Do not refactor, rename, or "clean up" unrelated files.
- Before making large changes, state the plan in a few lines and wait for my go-ahead.
- After each task, list exactly which files you changed and why.
- If something is unclear, ask one short question instead of guessing.
- Run the build/lint after changes and fix errors before saying you're done.

## Security
- API keys live only in `.env.local`. Never hardcode them, never expose them to the client, never commit them.
- Call the Gemini API only from server routes.

## Product decisions to keep in mind
- Core flow: meeting library -> meeting page (transcript + AI summary + action items) -> search / ask questions across meetings.
- Real AI for summaries, action items, and Q&A. Recording and live capture are out of scope.
- Every deliberate difference from the original product (what we kept, changed, cut, and why) gets a line in README.md.

## Git
- Do NOT run `git add`, `git commit`, or `git push` yourself. I run all git commands. You may run read-only commands (`git status`, `git diff`, `git log`) when I ask.
- Never add `Co-authored-by` lines, "Generated with" lines, or any AI attribution to commit messages, code comments, or files.
- Never create or commit files that are not needed to run the app: no scratch files, notes, logs, screenshots, build output, or copies of other files.
- Never touch `.env*` files or `.gitignore` unless I ask.
- If you think a file should be committed, list it and wait for me to decide.
