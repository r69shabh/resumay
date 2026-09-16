import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// --- Button / Btn ---
export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "danger";

export type ButtonSize = "xs" | "sm" | "default" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "sm", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";

    const variants: Record<ButtonVariant, string> = {
      default:
        "bg-primary text-primary-foreground shadow-sm hover:bg-indigo-600 dark:hover:bg-indigo-500",
      primary:
        "bg-primary text-primary-foreground shadow-sm hover:bg-indigo-600 dark:hover:bg-indigo-500",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-zinc-200/70 dark:hover:bg-zinc-800",
      outline:
        "border border-border bg-card text-foreground shadow-xs hover:bg-accent/70 hover:text-accent-foreground dark:hover:bg-zinc-800/60",
      ghost:
        "text-muted-foreground hover:bg-accent/60 hover:text-foreground dark:hover:bg-zinc-800/60",
      destructive:
        "border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60",
      danger:
        "border border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60",
    };

    const sizes: Record<ButtonSize, string> = {
      xs: "h-7 rounded-md px-2 text-xs",
      sm: "h-8 rounded-lg px-2.5 text-xs",
      default: "h-9 rounded-lg px-3.5 text-sm",
      lg: "h-10 rounded-xl px-5 text-sm font-semibold",
      icon: "h-8 w-8 rounded-lg p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Btn = Button;

// --- Badge ---
export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "indigo"
  | "emerald"
  | "amber"
  | "sky"
  | "violet"
  | "destructive";

export function Badge({
  className,
  variant = "secondary",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors";

  const variants: Record<BadgeVariant, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground",
    indigo:
      "border border-indigo-200 bg-indigo-50/80 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300",
    emerald:
      "border border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber:
      "border border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    sky:
      "border border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
    violet:
      "border border-violet-200 bg-violet-50/80 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
    destructive:
      "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

// --- Card ---
export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

// --- Segmented Control / Tabs ---
export function Seg<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-border bg-secondary/60 p-1 text-xs backdrop-blur-xs",
        className
      )}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 select-none",
              active
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.icon}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// --- Input & Textarea ---
export const inputCls =
  "w-full rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground/70 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

export const labelCls = "mb-1.5 block text-xs font-semibold text-muted-foreground";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(inputCls, className)} {...props} />;
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={cn(inputCls, className)} {...props} />;
});
Textarea.displayName = "Textarea";
