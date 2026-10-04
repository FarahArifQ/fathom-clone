import type { SVGProps } from "react";

const paths = {
  note: <><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h4M9 12h6M9 16h4" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-3-5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.5" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
} as const;

export type IconName = keyof typeof paths;

export default function Icon({ name, className = "size-5", ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" focusable="false" className={className} {...props}>{paths[name]}</svg>;
}
