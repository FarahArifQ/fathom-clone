import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import Icon, { type IconName } from "./ui-icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };
export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`button button-${variant} ${className}`} {...props} />;
}

export function IconButton({ icon, label, ...props }: ButtonProps & { icon: IconName; label: string }) {
  return <Button variant="ghost" aria-label={label} {...props}><Icon name={icon} /><span>{label}</span></Button>;
}

export function Tag({ tone = "accent", children }: { tone?: "accent" | "neutral" | "success" | "warning"; children: ReactNode }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function Panel({ glass = false, className = "", ...props }: HTMLAttributes<HTMLElement> & { glass?: boolean }) {
  return <section className={`${glass ? "glass rounded-xl" : "panel"} ${className}`} {...props} />;
}

export function Tabs({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={`tabs ${className}`} {...props} />;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}

export function EmptyState({ title, description, icon = "search", children }: {
  title: string; description: string; icon?: IconName; children?: ReactNode;
}) {
  return <Panel className="px-6 py-12 text-center">
    <Icon name={icon} className="mx-auto mb-4 size-8 text-accent" />
    <h2>{title}</h2><p className="mx-auto mt-2 max-w-lg text-secondary">{description}</p>
    {children && <div className="mt-6">{children}</div>}
  </Panel>;
}
