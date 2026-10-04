# Meeting Notes

A minimal Fathom-inspired app focused on the experience after a meeting, built with Next.js, TypeScript, React, and Tailwind CSS.

## Current build: step 2 — persistence

- `/` reads meetings, attendees, and transcript segments from Supabase on the server, newest first, with participant initials and transcript line counts. Local search matches titles, participants, and transcript text.
- `/meetings/[id]` has Summary and Transcript tabs with local transcript search and a speaker filter. Desktop shows meeting details alongside the transcript; mobile uses a Details tab. Timestamp links navigate to passages.
- Summary, action-item, and annotation panels show honest empty states. No AI output is mocked.
- Supabase reads run at request time. The application does not import the seed JSON or connect to Supabase during builds.

## Database setup

1. Use Node.js 22 or newer (required by the installed Supabase SDK) and run `npm install`.
2. In your Supabase project's SQL editor, paste the entire contents of `supabase/schema.sql` and click **Run**. It creates seven tables, constraints, indexes, and enables RLS. No anonymous or authenticated policies are created; table privileges are reserved for the service role.
3. Your existing `.env.local` must contain `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Neither variable may use a `NEXT_PUBLIC_` prefix. The app loads this file automatically; the seed command loads it using Node's `--env-file` option. Secrets are never printed or sent to the browser.
4. Run `npm run seed` from the project root. It reads `data/seed-meetings.json`, converts `MM:SS` to integer seconds and minutes to duration seconds, and sets `is_seed` on meetings, attendees, and transcript segments. Unique keys plus upserts make repeat runs safe without duplicates. Reruns update matching seed rows; they do not delete rows removed from the JSON or change AI/annotation tables. The three batches are separate writes; after a partial failure, rerun the command.
5. Run `npm run dev` and open http://localhost:3000.

The unique attendee, transcript, and summary constraints also provide indexes beginning with `meeting_id`; the transcript index includes `start_seconds`. The other child tables have explicit meeting indexes. Foreign keys cascade on meeting deletion, durations must be positive, and timestamps must be nonnegative.

Run `npm install`, then `npm run dev` and open http://localhost:3000. Verify with `npm run lint` and `npm run build`.

## Product decisions

- Keep the meeting library and transcript review flow to make the post-meeting experience usable first.
- Use an original, responsive layout rather than a pixel-for-pixel Fathom copy.
- Label all fictional meetings as seed data; transcripts are excerpts rather than full-length recordings.
- Cut live meeting bots and recording to focus on reviewing existing transcripts. Timestamp links scroll to text instead of playing audio.
- Cut calendar sync because meeting capture is outside this assignment's scope.
- Omit authentication as requested; this is a shared demo dataset.
- Persist fictional seed data in Supabase and read it server-side; keep search and transcript filtering local for this small library. Defer database search and Q&A to subsequent build steps.
- Defer summaries, action items, chapters, and annotation editing to subsequent build steps. Empty panels explicitly show that these features are not connected yet.
- Use a single teal accent and one system font, with a list-based library and mobile section tabs for reviewing meetings on narrow screens.
- Use system fonts so the initial deployment does not require downloading fonts at build time.

## Remaining approved backend plan (not implemented)

The schema includes meetings, attendees, transcript_segments, summaries (with `tldr`, `template_name`, and `markdown`), action_items, annotations, and chapters. Only meetings, attendees, and transcript segments are seeded and read by the current UI; the remaining tables are reserved for later steps.

Gemini calls will run only in server routes, with schema validation before saving or rendering AI responses. Generate a summary only when none is saved for that meeting; enforce this against concurrent requests. Ask requests will have a persistent, shared daily cap configured by `ASK_DAILY_LIMIT` so anonymous callers cannot bypass a per-user quota. The numeric limit will be set when this endpoint is built.

Use Supabase only on the server, with RLS denying direct anonymous access. The data module uses Next.js's `server-only` boundary; a shared client factory is used by the server module and seed command, with session persistence disabled. The service role key must never be sent to the client or logged. `.env.example` lists variable names with empty values; real local secrets belong only in `.env.local`.

## Early Vercel deployment

1. Publish the app to your Git provider using your own Git workflow.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Select the **Next.js** framework preset and the root directory containing `package.json`. Keep the default build and output settings.
4. For this persistence build, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel's environment settings for the deployment environments you use. Apply the schema and seed your Supabase project before opening the deployed app. Click **Deploy** and copy the deployment URL.
5. Verify the library, all four meeting links, and a transcript timestamp on the live site.

See [Vercel's Git deployment guide](https://vercel.com/docs/git).
