# Meeting Notes

A minimal Fathom-inspired app focused on the experience after a meeting, built with Next.js, TypeScript, React, and Tailwind CSS.

## Current build: step 1

- `/` shows four fictional meetings from `data/seed-meetings.json`, newest first.
- `/meetings/[id]` shows attendees and transcript excerpts. Timestamp links navigate to passages.
- Summary and action-item panels show empty states. No AI output is mocked.
- No environment variables, Supabase connection, or external services are needed for this step.

Run `npm install`, then `npm run dev` and open http://localhost:3000. Verify with `npm run lint` and `npm run build`.

## Product decisions

- Keep the meeting library and transcript review flow to make the post-meeting experience usable first.
- Use an original, responsive layout rather than a pixel-for-pixel Fathom copy.
- Label all fictional meetings as seed data; transcripts are excerpts rather than full-length recordings.
- Cut live meeting bots and recording to focus on reviewing existing transcripts. Timestamp links scroll to text instead of playing audio.
- Cut calendar sync because meeting capture is outside this assignment's scope.
- Omit authentication as requested; this is a shared demo dataset.
- Defer summaries, action items, chapters, annotations, search, and Q&A to subsequent build steps. AI panels explicitly show that generation is not connected yet.
- Use system fonts so the initial deployment does not require downloading fonts at build time.

## Approved backend plan (not implemented)

Supabase tables: meetings, attendees, transcript_segments, summaries, action_items, annotations, and chapters. Transcript and reference timestamps are integer seconds. Add `tldr text` to summaries alongside `template_name` and `markdown`; chapters have an ID, `meeting_id`, `title`, and `start_seconds`.

Gemini calls will run only in server routes, with schema validation before saving or rendering AI responses. Generate a summary only when none is saved for that meeting; enforce this against concurrent requests. Ask requests will have a persistent, shared daily cap configured by `ASK_DAILY_LIMIT` so anonymous callers cannot bypass a per-user quota. The numeric limit will be set when this endpoint is built.

Use Supabase only on the server, with RLS denying direct anonymous access. The service role key must never be sent to the client or logged. `.env.example` lists variable names with empty values; real local secrets belong only in `.env.local`. No variables are used in step 1.

## Early Vercel deployment

1. Publish the app to your Git provider using your own Git workflow.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Select the **Next.js** framework preset and the root directory containing `package.json`. Keep the default build and output settings.
4. No environment variables are required for step 1. Click **Deploy** and copy the deployment URL.
5. Verify the library, all four meeting links, and a transcript timestamp on the live site.

See [Vercel's Git deployment guide](https://vercel.com/docs/git). Future server-side secrets will be configured in Vercel's environment settings when backend steps are implemented.
