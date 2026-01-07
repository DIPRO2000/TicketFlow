import { cn } from "@/lib/utils";

const statusStyles = {
  valid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  used: "bg-slate-100 text-slate-600 border-slate-200",
  invalid: "bg-rose-50 text-rose-700 border-rose-200",
  refunded: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        statusStyles[status] || statusStyles.draft,
        className
      )}
    >
      {status}
    </span>
  );
}