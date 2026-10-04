# Meeting Notes

A minimal Fathom-inspired app focused on the experience after a meeting, built with Next.js, TypeScript, React, and Tailwind CSS.

## Current build: search and grounded Ask

- `/` reads meetings, attendees, and transcript segments from Supabase on the server, newest first, with participant initials and transcript line counts. Search keeps title/participant matching local and queries Postgres transcript text through `/api/search` after a 300 ms pause. Matching meetings show a source line and timestamp. Searches are limited to 200 characters; `%`, `_`, and backslash are treated literally.
- `/meetings/[id]` has Summary and Transcript tabs with local transcript search and a speaker filter. Desktop shows meeting details alongside the transcript; mobile uses a Details tab. Timestamp links navigate to passages.
- Summary shows saved TL;DR and Decisions / Key points sections, or a Generate summary button with loading and error states. Action items and chapters appear in Details. Unassigned tasks show Needs owner.
- Timestamp buttons open Transcript, clear its filters, scroll to the matching passage, and highlight it for two seconds. Timestamps within summary text are clickable too; jumping to a time between lines selects the preceding line.
- Action-item checkboxes persist completion through `PATCH /api/action-items/[id]`. Each transcript line has a Highlight button that saves its text as an annotation through `POST /api/meetings/[id]/annotations`. Saved annotations appear beside the meeting and on transcript lines, including after reload. Both routes validate input and use Supabase only on the server.
- Supabase reads run at request time. The application does not import the seed JSON or connect to Supabase during builds.
- The docked **Ask a question** panel is a conversation: earlier questions and replies remain in the scrolling thread while the page is open, including through Collapse. Three suggestions appear only in an empty thread; **New chat** clears it. Questions carry their scope label, and replies show source chips or a clear explanation when the supplied transcript does not answer the question.

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
3. Run `npm run dev` in one terminal. In another, run `npm run generate`. It lists meetings without summaries, calls the app's POST `/api/meetings/[id]/summarize` endpoint sequentially, and pauses 1.5 seconds between requests. It defaults to `http://localhost:3000`; for another port use `npm run generate -- http://localhost:3001`. It continues after failures, prints the failed meeting IDs at the end, sets a failing exit code if any request fails, and skips saved summaries on reruns.
4. Alternatively, open a meeting and click **Generate summary**. Refresh after generation to confirm persistence. A second POST returns the saved result without calling Gemini again.

Gemini REST requests use a manually constructed Gemini-compatible `responseSchema` with uppercase types and nullable assignees. Summary and Ask share one server-only helper: an initial attempt plus up to three retries for HTTP 503, HTTP 429, and network/timeout failures, waiting 2, 5, and 10 seconds. If `GEMINI_FALLBACK_MODEL` is set, it tries that model once after primary failure. Attempts allow up to 75 seconds, with shorter timeouts when needed to reserve the waits and five seconds per remaining attempt within an approximately 107-second overall AI budget and the 120-second route allowance. Final AI failures show “The AI service is busy right now. Please try again in a minute.” with Retry controls; upstream bodies, keys, and model settings are never logged.

Zod independently validates returned JSON before saving or rendering. Invalid or incomplete JSON, incorrect summary sections, repeated bullet text, unknown owners, invented timestamps, or invalid chapter counts/order are rejected before saving. Long calls (at least 30 minutes and 30 transcript lines) receive 3–8 chapters; short excerpts receive 1–2. Summary rendering uses escaped text and plain bullet sections, without raw HTML or an additional Markdown dependency. [Gemini structured output documentation](https://ai.google.dev/gemini-api/docs/structured-output).

Database claims serialize generation for a meeting. A busy request returns HTTP 409; failed requests release their claim, and claims abandoned by a stopped process expire after three minutes. Saving uses one database transaction for the summary, action items, and chapters, so a failed insert leaves no partial generated output. Gemini calls run only in the server route; the batch script never sends credentials to the app. The endpoint has a 120-second runtime allowance, which the deployment plan must support. In Vercel, configure the same server environment variable names and redeploy.

Run `npm install`, then `npm run dev` and open http://localhost:3000. Verify with `npm run lint` and `npm run build`.

## Ask setup and behavior

1. In the Supabase SQL editor, paste the entire contents of `supabase/ask-usage.sql` and click **Run**, after the base schema has been applied. It adds `ask_usage` and an atomic `consume_ask_request` function. RLS is enabled with no anonymous policies; only the service role can access the counter or call the function. Rerunning the SQL preserves usage.
2. Run or restart `npm run dev`. Existing Supabase and Gemini settings are reused. `GEMINI_FALLBACK_MODEL` is optional. `ASK_DAILY_LIMIT` is optional and defaults to 50 when absent or blank; configured limits must be integers from 1 to 10000. No new dependencies are required.
3. Open a meeting, click **Ask a question**, select its scope, and ask a question of 3–500 characters. The composer starts at one line and grows to about four. Enter sends; Shift+Enter adds a line. Sending clears and disables the input while a Thinking bubble waits for the reply. Errors appear in that reply with Retry, which keeps the original question and scope. Click a citation chip to verify the source; citations in other meetings open `/meetings/[id]?t=<seconds>`. Ordinary meeting visits still open Summary; timestamp links open Transcript and highlight the source line.

The cap is shared across the unauthenticated demo and resets at midnight UTC. Valid requests consume one slot, including no-match answers and failed AI calls; invalid inputs and missing meetings do not. Internal Gemini retries consume no additional slots. Concurrent requests cannot exceed the cap because Postgres increments the counter conditionally in one statement. No question text is stored in the usage table.

**This meeting** loads every transcript line in chronological order, with its speaker and timestamp. The supplied lines are capped at 64000 serialized JSON characters; longer transcripts are trimmed and each reply visibly reports that its context was trimmed. The full long seed meeting fits this limit. **All meetings** extracts up to eight stemmed keywords, removes common words, and matches any keyword using ordinary case-insensitive Postgres substring matching. It reads matching pages before ranking by keyword overlap, then supplies the top 16 lines, capped at 1500 text characters per line and 16000 serialized JSON characters total. Trimming is reported. Different wording can change all-meeting results; a missing answer does not prove that omitted or unmatched passages lack it.

The most recent three successful question/reply pairs, including scope labels, are sent as conversation context for follow-ups. They are never factual evidence: answers must rely solely on the supplied transcript lines. History stays in page memory and is cleared by New chat or navigation away, not stored in Supabase or browser storage. New chat is disabled during a pending reply. The thread announces new messages through an accessible live log and scrolls its own container, keeping the meeting page in place.

No embeddings, summaries, or action items are supplied as evidence. Model citations must reference line IDs actually sent; duplicate or invented references and supported answers with no citations are rejected. Meeting titles, speakers, and timestamps come from the retrieved database rows. The schema checks citation identity and output shape; the prompt constrains factual claims, which users can verify in the source passages.

## Product decisions

- Keep the meeting library and transcript review flow to make the post-meeting experience usable first.
- Use an original, responsive layout rather than a pixel-for-pixel Fathom copy.
- Label all fictional meetings as seed data; transcripts are excerpts rather than full-length recordings.
- Cut live meeting bots and recording to focus on reviewing existing transcripts. Timestamp buttons scroll to text instead of playing audio.
- Cut calendar sync because meeting capture is outside this assignment's scope.
- Omit authentication as requested; this is a shared demo dataset.
- Persist fictional seed data in Supabase and read it server-side; use ordinary Postgres text matching for library transcripts and Ask retrieval, while retaining local transcript filters and title/participant search.
- Generate real summaries, action items, and chapters on demand; persist task completion and transcript highlights without adding annotation editing.
- Cut Team Calls, Deals, and CRM sync because this one-day build focuses on the core meeting review experience.
- Keep Ask docked beside meeting review for questions that arise while reading. Use a retained conversation with suggestions only before the first message and a compact composer, so Ask feels like a conversation instead of a review form. Require source citations, plainly acknowledge insufficient evidence, and answer only the question asked.
- Use a single teal accent and one system font, with a list-based library and mobile section tabs for reviewing meetings on narrow screens.
- Use system fonts so the initial deployment does not require downloading fonts at build time.

## Server data and security

The schema includes meetings, attendees, transcript_segments, summaries (with `tldr`, `template_name`, and `markdown`), action_items, annotations, and chapters. Seed imports write only meetings, attendees, and transcript segments. Generated summaries, action items, and chapters are persisted and read separately by the meeting page.

Ask requests have a persistent, shared daily cap configured by `ASK_DAILY_LIMIT` so anonymous callers cannot bypass a per-user quota. The default is 50.

Use Supabase only on the server, with RLS denying direct anonymous access. The data module uses Next.js's `server-only` boundary; a shared client factory is used by the server module and seed command, with session persistence disabled. The service role key must never be sent to the client or logged. `.env.example` lists variable names with empty values; real local secrets belong only in `.env.local`.

## Early Vercel deployment

1. Publish the app to your Git provider using your own Git workflow.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Select the **Next.js** framework preset and the root directory containing `package.json`. Keep the default build and output settings.
4. For this persistence build, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel's environment settings for the deployment environments you use. Apply the schema and seed your Supabase project before opening the deployed app. Click **Deploy** and copy the deployment URL.
5. Verify the library, all meeting links, and a transcript timestamp on the live site.

See [Vercel's Git deployment guide](https://vercel.com/docs/git).
