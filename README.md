# Meeting Notes

A minimal Fathom-inspired app focused on the experience after a meeting, built with Next.js, TypeScript, React, and Tailwind CSS.

## Current build: open demo and grounded Ask

- `/` is an open landing page with a floating glass navigation capsule, a product introduction, three steps, three product differences, an honest demo note and a final Try the demo link. Navigation marks the current section; mobile has a labeled menu with Escape to close. Smooth anchor scrolling and one-time fade-up reveals respect reduced motion. With JavaScript disabled, the page content remains visible.
- The landing preview reuses the app's panels, tags, avatars and transcript citation chips with two actual Atlas passages from `data/seed-meetings.json`. It contains no invented summary, tasks or AI answers and needs no Supabase or Gemini connection. Try the demo opens `/library`; See a sample meeting opens `/meetings/m5`. Preview citations open the exact transcript moment. The copy distinguishes always-cited Ask answers from summary points whose source timestamps were saved. Add a meeting explains that this demo has prepared meetings and no upload flow.
- `/library` reads meetings, attendees, and transcript segments from Supabase on the server, newest first. The dark library uses full-width meeting cards with type, date, duration, transcript line count, attendee initials and count. Ctrl/Command+K focuses its labeled search, including from the landing page or sticky application navigation. Search keeps title/participant matching local and queries Postgres transcript text through `/api/search` after a 300 ms pause. Matching meetings show a source line and timestamp. Searches are limited to 200 characters; `%`, `_`, and backslash are treated literally. Loading skeletons and retry states distinguish unavailable data from an empty library.
- The library's floating Ask across meetings button opens the same retained Ask conversation, preset to All meetings, with Summarize my meetings and List open action items suggestions. At 1100px and wider, chat docks in a sticky column beside the list; smaller screens show it in the page flow, focus the composer and restore the previous scroll position on Close. Citations show the meeting title and open the exact transcript line. The existing `/api/ask` contract is unchanged: the library sends a context marker in its required meeting ID field, which All meetings ignores. Answers still use retrieved transcript passages and do not read saved checkbox completion; the panel states this limitation.
- `/meetings/[id]` opens Summary on ordinary visits, with Transcript and Ask tabs. Desktop uses a solid reading column and a sticky glass sidebar starting below the 64px navigation bar: Action items, Chapters, Attendees, then Annotations. Below 800px, Details holds those panels. Every panel shows a count; action items also show completion progress. The meeting title sets the browser tab title. Loading skeletons and a retry screen cover unavailable meeting data.
- Summary shows saved TL;DR in a subtly tinted block, followed by Decisions and Key points, or a Generate summary button with loading and error states. Timestamp chips beside points use times already saved in the Markdown and present in the transcript; missing source times are labeled explicitly, never inferred. Space is reserved above Summary for a future template selector; no selector is implemented. Unassigned tasks show Needs owner.
- Timestamp buttons open Transcript, clear its filters, scroll to the matching passage, and highlight it for two seconds. Timestamps within summary text are clickable too; jumping to a time between lines selects the preceding line.
- Keep long transcripts in a scrolling area (50vh on mobile, 60vh on desktop), with search, speaker filtering, and a line count above it. Expand shows the full transcript; timestamp jumps restore the bounded view and scroll only that area. Every line stays mounted, and Back to top returns to the start.
- Long meetings show a clickable chapter outline when chapters exist and a speaker timeline above Transcript. Speaker colors remain consistent between lines and legend; selecting a legend name updates the speaker filter. Timeline intervals are approximate, based on successive transcript timestamps, not measured speaking durations or audio playback. Chapter jumps mark the active chapter and briefly emphasize the source line.
- Action-item checkboxes persist completion through `PATCH /api/action-items/[id]`. Each transcript line has a Highlight button that saves its text as an annotation through `POST /api/meetings/[id]/annotations`. Saved annotations appear beside the meeting and on transcript lines, including after reload. Both routes validate input and use Supabase only on the server.
- Library and meeting Supabase reads run at request time, without connecting during builds. Only the static landing preview reads the seed JSON directly.
- The **Ask** tab opens the retained conversation in the main column. Desktop also keeps an Ask a question dock entry; mobile uses a full-width sheet in the page flow so chat never covers reading text. Closing Ask or changing tabs retains earlier questions, replies and the draft while the page is open. Three suggestions appear only in an empty thread; New chat clears it. User and assistant bubbles are solid, questions carry scope labels, and replies cite source moments or plainly acknowledge missing evidence.
- Saving an action item or highlight shows a dismissible glass confirmation. Action-item changes support Undo through the existing PATCH endpoint; highlights have no Undo because no deletion endpoint exists. Failed writes show a friendly Retry control. The composer grows to four lines with no scrollbar until needed; its custom scrollbar hides arrow buttons.

## Database setup

1. Use Node.js 22 or newer (required by the installed Supabase SDK) and run `npm install`.
2. In your Supabase project's SQL editor, paste the entire contents of `supabase/schema.sql` and click **Run**. It creates seven tables, constraints, indexes, and enables RLS. No anonymous or authenticated policies are created; table privileges are reserved for the service role.
3. Your existing `.env.local` must contain `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Neither variable may use a `NEXT_PUBLIC_` prefix. The app loads this file automatically; the seed command loads it using Node's `--env-file` option. Secrets are never printed or sent to the browser.
4. Run `npm run seed` from the project root. It reads `data/seed-meetings.json`, converts `MM:SS` to integer seconds and minutes to duration seconds, and sets `is_seed` on meetings, attendees, and transcript segments. Unique keys plus upserts make repeat runs safe without duplicates. Reruns update matching seed rows; they do not delete rows removed from the JSON or change AI/annotation tables. The three batches are separate writes; after a partial failure, rerun the command.
5. Run `npm run dev` and open http://localhost:3000.

The unique attendee, transcript, and summary constraints also provide indexes beginning with `meeting_id`; the transcript index includes `start_seconds`. The other child tables have explicit meeting indexes. Foreign keys cascade on meeting deletion, durations must be positive, and timestamps must be nonnegative.

## Long meeting seed

`data/seed-meetings.json` also includes `m5`, **Launch Readiness Review: Atlas Release**, alongside the original four meetings. The provided data specifies 48 minutes, 8 attendees, and 158 transcript lines in chronological order from `00:00` through `46:38`. All provided transcript text is preserved. No summary, action items, or chapters are included.

Run `npm run seed` to import all five meetings through the existing upserts. Open `/library`, search for **Atlas**, and open `/meetings/m5`. Check the 48-minute duration, 8 attendees under Details, and 158 lines in the Transcript tab with no filters applied. Summary should remain empty after the first import; reseeding does not delete any previously generated outputs.

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
3. Open a meeting, select **Ask** (or the desktop **Ask a question** entry), choose its scope, and ask a question of 3–500 characters. The composer starts at one line and grows to about four. Enter sends; Shift+Enter adds a line. Sending clears and disables the input while a Thinking bubble waits for the reply. Errors appear in that reply with Retry, which keeps the original question and scope. Click a citation chip to verify the source; citations in other meetings open `/meetings/[id]?t=<seconds>`. Ordinary meeting visits still open Summary; timestamp links open Transcript and highlight the source line.

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
- Cut sign-in, sign-up, pricing, testimonials, customer logos, compliance badges, review ratings and invented statistics. Keep a short, honest landing page that opens for anyone and explains the working demo. Marketing references inform only the idea of a capsule navigation and scannable sections; layout, wording and product preview belong to Meeting Notes.
- Persist fictional seed data in Supabase and read it server-side; use ordinary Postgres text matching for library transcripts and Ask retrieval, while retaining local transcript filters and title/participant search.
- Generate real summaries, action items, and chapters on demand; persist task completion and transcript highlights without adding annotation editing.
- Cut Team Calls, Deals, and CRM sync because this one-day build focuses on the core meeting review experience.
- Keep Ask docked beside meeting review for questions that arise while reading. Use a retained conversation with suggestions only before the first message and a compact composer, so Ask feels like a conversation instead of a review form. Require source citations, plainly acknowledge insufficient evidence, and answer only the question asked.
- Surface the existing all-meetings Ask on the library instead of building a separate chat or API. Keep the transcript-only evidence rule and shared daily cap, and distinguish transcript tasks from saved completion state.
- Use an original dark theme with one teal accent, Inter, and readable muted text. Keep glass limited to navigation, side panels and the Ask dock, with opaque fallbacks for unsupported browsers and reduced transparency preferences. Solid reading surfaces support long transcripts; shared controls, underlined tabs, visible focus and reduced motion settings make the interface consistent.
- Use mostly opaque tinted glass with blur so background text stays unreadable. Reserve the soft teal glow for active tab underlines, focus rings, primary-button hover/focus, Ask send, the active chapter and the timestamp target. Keep the TL;DR gradient subtle and all other reading surfaces solid. Header clearance and anchor offsets account for the navigation height.
- Load and self-host Inter through `next/font`; the font downloads during the build, with no browser request to Google Fonts.

## Server data and security

The schema includes meetings, attendees, transcript_segments, summaries (with `tldr`, `template_name`, and `markdown`), action_items, annotations, and chapters. Seed imports write only meetings, attendees, and transcript segments. Generated summaries, action items, and chapters are persisted and read separately by the meeting page.

Ask requests have a persistent, shared daily cap configured by `ASK_DAILY_LIMIT` so anonymous callers cannot bypass a per-user quota. The default is 50.

Use Supabase only on the server, with RLS denying direct anonymous access. The data module uses Next.js's `server-only` boundary; a shared client factory is used by the server module and seed command, with session persistence disabled. The service role key must never be sent to the client or logged. `.env.example` lists variable names with empty values; real local secrets belong only in `.env.local`.

## Early Vercel deployment

1. Publish the app to your Git provider using your own Git workflow.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Select the **Next.js** framework preset and the root directory containing `package.json`. Keep the default build and output settings.
4. For this persistence build, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel's environment settings for the deployment environments you use. Apply the schema and seed your Supabase project before opening the deployed app. Click **Deploy** and copy the deployment URL.
5. Verify the landing page, `/library`, the sample meeting link, and a transcript timestamp on the live site.

See [Vercel's Git deployment guide](https://vercel.com/docs/git).
