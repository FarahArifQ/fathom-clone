import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function capture() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const event = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const author = process.argv[2];
  if (!author) throw new Error("The capture hook needs your GitHub handle as its argument.");
  if (resolve(event.cwd).toLowerCase() !== root.toLowerCase()) return;
  if (!["UserPromptSubmit", "Stop"].includes(event.hook_event_name)) return;
  if (!/^[a-zA-Z0-9-]+$/.test(event.session_id)) throw new Error("Invalid capture session ID.");
  if (typeof event.model !== "string" || !event.model) throw new Error("Capture event has no model.");

  const isPrompt = event.hook_event_name === "UserPromptSubmit";
  const content = isPrompt ? event.prompt : event.last_assistant_message;
  if (typeof content !== "string") throw new Error("Capture event has no prompt or final response.");
  const timestamp = new Date().toISOString();
  const directory = join(root, ".agent-logs");
  mkdirSync(directory, { recursive: true });
  const existing = readdirSync(directory).filter((name) => name.endsWith(`_${event.session_id}.md`));
  if (existing.length > 1) throw new Error("Multiple capture logs exist for this session.");
  const filename = existing[0] ?? `${timestamp.slice(0, 19).replace("T", "_").replaceAll(":", "-")}_${event.session_id}.md`;
  const path = join(directory, filename);
  if (!existsSync(path)) {
    if (!isPrompt) throw new Error("No prompt was captured for this session; restart with trusted hooks.");
    const date = timestamp.slice(0, 10);
    writeFileSync(path, `---\nsession_id: ${event.session_id}\ndate: ${date}\nauthor: ${author}\nmodel: ${event.model}\ntool: codex\nproject: fathom-clone\ntotal_exchanges: 0\nfirst_prompt_time: ${timestamp}\nlast_prompt_time: ${timestamp}\n---\n\n# Session Log - ${date}\n\nSession: \`${event.session_id.slice(0, 8)}\` | Project: \`fathom-clone\` | Author: \`${author}\`\n\n---\n\n`, { flag: "wx" });
  }

  const log = readFileSync(path, "utf8");
  const prompts = [...log.matchAll(/^\[LOG_ENTRY type=PROMPT num=(\d+) session=/gm)];
  const number = isPrompt ? prompts.length + 1 : prompts.length;
  if (!number) throw new Error("No captured prompt corresponds to this final response.");
  const type = isPrompt ? "PROMPT" : "RESPONSE";
  const marker = `[LOG_ENTRY type=${type} num=${number} session=${event.session_id.slice(0, 8)}]`;
  if (!isPrompt && log.includes(marker)) return;
  if (isPrompt) {
    const headerEnd = log.indexOf("\n---\n", 4);
    const header = log.slice(0, headerEnd)
      .replace(/^total_exchanges: .*$/m, `total_exchanges: ${number}`)
      .replace(/^last_prompt_time: .*$/m, `last_prompt_time: ${timestamp}`);
    writeFileSync(path, header + log.slice(headerEnd));
  }
  appendFileSync(path, `${marker}\ntimestamp: ${timestamp}\nmodel: ${event.model}\n\n${content}\n\n\n`);
}

try {
  await capture();
  process.stdout.write("{}\n");
} catch (error) {
  process.stderr.write(`Automatic capture failed: ${error.message}\n`);
  process.exitCode = 1;
}
