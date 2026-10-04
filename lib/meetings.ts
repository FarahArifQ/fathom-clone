export type Meeting = {
  id: string;
  title: string;
  type: string;
  date: string;
  durationMinutes: number;
  isSeed: boolean;
  participants: string[];
  transcript: { startSeconds: number; speaker: string; text: string }[];
};

export function formatMeetingDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatTimestamp(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
