import Link from "next/link";
import Icon from "./ui-icon";

export default function AppBrand() {
  return <Link href="/" className="flex min-h-10 min-w-0 items-center gap-3 rounded-lg font-semibold">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent"><Icon name="note" /></span>
    <span className="truncate">Meeting Notes</span>
  </Link>;
}
