import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-200/60 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-slate-50 rounded-xl">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
        )}
      </div>
      {trend && (
        <div className={cn(
          "mt-4 text-sm font-medium",
          trend.positive ? "text-emerald-600" : "text-rose-600"
        )}>
          {trend.positive ? "↑" : "↓"} {trend.value} {trend.label}
        </div>
      )}
    </div>
  );
}