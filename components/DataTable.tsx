import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";

export default function DataTable({ date, interns }: { date: string; interns: any[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sortKey, setSortKey] = useState<"internName" | "status" | "submissionsCount">("internName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return interns
      .filter(i => {
        if (status !== "ALL" && i.status !== status) return false;
        if (!qq) return true;
        const hay = `${i.internName} ${i.internEmail} ${i.manager} ${i.gpt?.dailySummary || ""}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
  }, [interns, q, status, sortKey, sortDir]);

  const toggleSort = (k: any) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  return (
    <div className="mt-4 rounded-2xl border bg-white">
      <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            className="w-72 rounded-xl border px-3 py-2 text-sm"
            placeholder="Search name/email/manager/summary…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="Submitted">Submitted</option>
            <option value="Flagged (Not Submitted)">Flagged</option>
            <option value="Leave">Leave</option>
          </select>
        </div>

        <div className="text-sm text-slate-500">
          Showing <b>{filtered.length}</b> / {interns.length}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 cursor-pointer" onClick={() => toggleSort("internName")}>Intern</th>
              <th className="text-left px-4 py-3 cursor-pointer" onClick={() => toggleSort("status")}>Status</th>
              <th className="text-left px-4 py-3">Manager</th>
              <th className="text-right px-4 py-3 cursor-pointer" onClick={() => toggleSort("submissionsCount")}>Submissions</th>
              <th className="text-left px-4 py-3">GPT summary</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.internEmail} className="border-t">
                <td className="px-4 py-3">
                  <Link className="font-semibold hover:underline" href={`/intern/${encodeURIComponent(i.internEmail)}?date=${date}`}>
                    {i.internName || i.internEmail}
                  </Link>
                  <div className="text-xs text-slate-500">{i.internEmail}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                <td className="px-4 py-3">{i.manager || "—"}</td>
                <td className="px-4 py-3 text-right">{i.submissionsCount ?? 0}</td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="line-clamp-2">{i.gpt?.dailySummary || "—"}</div>
                  <div className="text-xs text-slate-500">{i.gpt?.model ? `Model: ${i.gpt.model}` : ""}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
