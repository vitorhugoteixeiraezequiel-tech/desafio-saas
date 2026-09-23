import type { ComponentProps, ReactNode } from "react";

export function Logo() {
  return (
    <span className="text-lg font-bold tracking-tight">
      Descri<span className="text-indigo-600">tiva</span>
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function Errors({ errors }: { errors?: string[] }) {
  return errors?.map((e) => (
    <span key={e} className="block text-xs text-red-600">
      {e}
    </span>
  ));
}

type Labeled = { label: string; name: string; errors?: string[] };

export function Field({ label, name, errors, ...props }: Labeled & ComponentProps<"input">) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input name={name} className={inputClass} {...props} />
      <Errors errors={errors} />
    </label>
  );
}

export function TextArea({ label, name, errors, ...props }: Labeled & ComponentProps<"textarea">) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea name={name} className={`${inputClass} min-h-28`} {...props} />
      <Errors errors={errors} />
    </label>
  );
}

export function Select({
  label,
  name,
  errors,
  children,
  ...props
}: Labeled & ComponentProps<"select">) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select name={name} className={inputClass} {...props}>
        {children}
      </select>
      <Errors errors={errors} />
    </label>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Alert({ type, children }: { type: "error" | "success"; children: ReactNode }) {
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return (
    <p role="status" className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {children}
    </p>
  );
}
