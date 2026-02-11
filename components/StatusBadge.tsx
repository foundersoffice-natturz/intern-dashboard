export default function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border";
  if (status === "Submitted") return <span className={`${base} bg-emerald-50 border-emerald-200 text-emerald-700`}>Submitted</span>;
  if (status === "Flagged (Not Submitted)") return <span className={`${base} bg-rose-50 border-rose-200 text-rose-700`}>Flagged</span>;
  if (status === "Leave") return <span className={`${base} bg-amber-50 border-amber-200 text-amber-700`}>Leave</span>;
  if (status === "Holiday") return <span className={`${base} bg-slate-100 border-slate-200 text-slate-700`}>Holiday</span>;
  return <span className={`${base} bg-white border-slate-200 text-slate-700`}>{status || "—"}</span>;
}
