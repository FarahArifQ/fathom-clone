# Meeting Notes

A minimal Fathom-inspired app focused on the experience after a meeting, built with Next.js, TypeScript, React, and Tailwind CSS.

## Current build: step 4 — meeting interactions

- `/` reads meetings, attendees, and transcript segments from Supabase on the server, newest first, with participant initials and transcript line counts. Local search matches titles, participants, and transcript text.
- `/meetings/[id]` has Summary and Transcript tabs with local transcript search and a speaker filter. Desktop shows meeting details alongside the transcript; mobile uses a Details tab. Timestamp links navigate to passages.
- Summary shows saved TL;DR and Decisions / Key points sections, or a Generate summary button with loading and error states. Action items and chapters appear in Details. Unassigned tasks show Needs owner.
- Timestamp buttons open Transcript, clear its filters, scroll to the matching passage, and highlight it for two seconds. Timestamps within summary text are clickable too; jumping to a time between lines selects the preceding line.
- Action-item checkboxes persist completion through `PATCH /api/action-items/[id]`. Each transcript line has a Highlight button that saves its text as an annotation through `POST /api/meetings/[id]/annotations`. Saved annotations appear beside the meeting and on transcript lines, including after reload. Both routes validate input and use Supabase only on the server.
- Supabase reads run at request time. The application does not import the seed JSON or connect to Supabase during builds.

## Database setup

1. Use Node.js 22 or newer (required by the installed Supabase SDK) and run `npm install`.
2. In your Supabase project's SQL editor, paste the entire contents of `supabase/schema.sql` and click **Run**. It creates seven tables, constraints, indexes, and enables RLS. No anonymous or authenticated policies are created; table privileges are reserved for the service role.
3. Your existing `.env.local` must contain `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Neither variable may use a `NEXT_PUBLIC_` prefix. The app loads this file automatically; the seed command loads it using Node's `--env-file` option. Secrets are never printed or sent to the browser.
4. Run `npm run seed` from the project root. It reads `data/seed-meetings.json`, converts `MM:SS` to integer seconds and minutes to duration seconds, and sets `is_seed` on meetings, attendees, and transcript segments. Unique keys plus upserts make repeat runs safe without duplicates. Reruns update matching seed rows; they do not delete rows removed from the JSON or change AI/annotation tables. The three batches are separate writes; after a partial failure, rerun the command.
5. Run `npm run dev` and open http://localhost:3000.

The unique attendee, transcript, and summary constraints also provide indexes beginning with `meeting_id`; the transcript index includes `start_seconds`. The other child tables have explicit meeting indexes. Foreign keys cascade on meeting deletion, durations must be positive, and timestamps must be nonnegative.

## Long meeting seed

`data/seed-meetings.json` also includes `m5`, **Launch Readiness Review: Atlas Release**, alongside the original four meetings. The provided data specifies 48 minutes, 8 attendees, and 158 transcript lines in chronological order from `00:00` through `46:38`. All provided transcript text is preserved. No summary, action items, or chapters are included.

Run `npm run seed` to import all five meetings through the existing upserts. Refresh the library, search for **Atlas**, and open `/meetings/m5`. Check the 48-minute duration, 8 attendees under Details, and 158 lines in the Transcript tab with no filters applied. Summary should remain empty after the first import; reseeding does not delete any previously generated outputs.

For database verification before generating anything, run this read-only query in the Supabase SQL editor:

```sql
select
  m.id,
  m.title,
  m.duration_seconds,
  (select count(*) from public.attendees where meeting_id = m.id) as attendees,
  (select count(*) from public.transcript_segments where meeting_id = m.id) as transcript_lines,
  (select max(start_seconds) from public.transcript_segments where meeting_id = m.id) as last_timestamp_seconds,
  (select count(*) from public.summaries where meeting_id = m.id) as summaries,
  (select count(*) from public.action_items where meeting_id = m.id) as action_items,
  (select count(*) from public.chapters where meeting_id = m.id) as chapters
from public.meetings m
where m.id = 'm5';
```

Before generation, expect `duration_seconds = 2880`, `attendees = 8`, `transcript_lines = 158`, `last_timestamp_seconds = 2798`, and zero summaries, action items, and chapters.

## Generate AI summaries

1. Paste the entire updated `supabase/schema.sql` into the Supabase SQL editor and click **Run**. Rerunning it preserves existing data and adds generation claim columns plus three service-role-only functions for claiming, saving, and releasing generation.
2. The server environment must contain `GEMINI_API_KEY` and `GEMINI_MODEL`, as well as the two Supabase variables. Restart the dev server after configuring them yourself; never prefix secrets with `NEXT_PUBLIC_`. The code reads the model from the environment without logging it.
3. Run `npm run dev` in one terminal. In another, run `npm run generate`. It lists meetings without summaries, calls the app's POST `/api/meetings/[id]/summarize` endpoint sequentially, and pauses 1.5 seconds between requests. It defaults to `http://localhost:3000`; for another port use `npm run generate -- http://localhost:3001`. It logs only failures, sets a failing exit code if any request fails, and skips saved summaries on reruns.
4. Alternatively, open a meeting and click **Generate summary**. Refresh after generation to confirm persistence. A second POST returns the saved result without calling Gemini again.

Gemini REST requests use a manually constructed Gemini-compatible `responseSchema` with uppercase types and nullable assignees, with a 75-second timeout. Zod independently validates the returned JSON before saving. Invalid or incomplete JSON, incorrect summary sections, repeated bullet text, unknown owners, invented timestamps, or invalid chapter counts/order are rejected before saving. Long calls (at least 30 minutes and 30 transcript lines) receive 3–8 chapters; short excerpts receive 1–2. Summary rendering uses escaped text and plain bullet sections, without raw HTML or an additional Markdown dependency. [Gemini structured output documentation](https://ai.google.dev/gemini-api/docs/structured-output).

Database claims serialize generation for a meeting. A busy request returns HTTP 409; failed requests release their claim, and claims abandoned by a stopped process expire after three minutes. Saving uses one database transaction for the summary, action items, and chapters, so a failed insert leaves no partial generated output. Gemini calls run only in the server route; the batch script never sends credentials to the app. The endpoint has a 120-second runtime allowance, which the deployment plan must support. In Vercel, configure the same server environment variable names and redeploy.

Run `npm install`, then `npm run dev` and open http://localhost:3000. Verify with `npm run lint` and `npm run build`.

## Product decisions

- Keep the meeting library and transcript review flow to make the post-meeting experience usable first.
- Use an original, responsive layout rather than a pixel-for-pixel Fathom copy.
- Label all fictional meetings as seed data; transcripts are excerpts rather than full-length recordings.
- Cut live meeting bots and recording to focus on reviewing existing transcripts. Timestamp buttons scroll to text instead of playing audio.
- Cut calendar sync because meeting capture is outside this assignment's scope.
- Omit authentication as requested; this is a shared demo dataset.
- Persist fictional seed data in Supabase and read it server-side; keep search and transcript filtering local for this small library. Defer database search and Q&A to subsequent build steps.
- Generate real summaries, action items, and chapters on demand; persist task completion and transcript highlights without adding annotation editing.
- Cut Team Calls, Deals, and CRM sync because this one-day build focuses on the core meeting review experience.
- Keep Ask for questions that arise while reading a meeting. Its planned answers must cite transcript moments, plainly state when information is absent, and address only the question asked. Ask is not implemented in step 4.
- Use a single teal accent and one system font, with a list-based library and mobile section tabs for reviewing meetings on narrow screens.
- Use system fonts so the initial deployment does not require downloading fonts at build time.

## Remaining approved backend plan (not implemented)

The schema includes meetings, attendees, transcript_segments, summaries (with `tldr`, `template_name`, and `markdown`), action_items, annotations, and chapters. Seed imports write only meetings, attendees, and transcript segments. Generated summaries, action items, and chapters are persisted and read separately by the meeting page.

Ask requests will have a persistent, shared daily cap configured by `ASK_DAILY_LIMIT` so anonymous callers cannot bypass a per-user quota. The numeric limit will be set when this endpoint is built.

Use Supabase only on the server, with RLS denying direct anonymous access. The data module uses Next.js's `server-only` boundary; a shared client factory is used by the server module and seed command, with session persistence disabled. The service role key must never be sent to the client or logged. `.env.example` lists variable names with empty values; real local secrets belong only in `.env.local`.

## Early Vercel deployment

1. Publish the app to your Git provider using your own Git workflow.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Select the **Next.js** framework preset and the root directory containing `package.json`. Keep the default build and output settings.
4. For this persistence build, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel's environment settings for the deployment environments you use. Apply the schema and seed your Supabase project before opening the deployed app. Click **Deploy** and copy the deployment URL.
5. Verify the library, all meeting links, and a transcript timestamp on the live site.

See [Vercel's Git deployment guide](https://vercel.com/docs/git).
