import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn("rounded-2xl bg-white p-4 shadow-sm", className)}>
      {title ? <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3> : null}
      {children}
    </div>
  );
}
