import seed from "@/data/seed-meetings.json";

export const meetings = seed.meetings;
export type Meeting = typeof meetings[number];

export function formatMeetingDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function timestampSeconds(timestamp: string) {
  const [minutes, seconds] = timestamp.split(":").map(Number);
  return minutes * 60 + seconds;
}
