import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Layout from "../components/Layout";

import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Weekly() {
  const { status } = useSession();
  const router = useRouter();

  const weekStart = typeof router.query.weekStart === "string"
    ? router.query.weekStart
    : new Date().toISOString().slice(0, 10);

  const { data, error } = useSWR(
    status === "authenticated" ? `/api/data/weekly?weekStart=${weekStart}` : null,
    fetcher
  );

  const labels = data?.compliance?.map((x: any) => x.date) || [];
  const values = data?.compliance?.map((x: any) => x.compliancePct) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Submission compliance %",
        data: values
      }
    ]
  };

  return (
    <Layout>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold">Weekly Summary</div>
          <div className="text-sm text-slate-600">Compliance + trends</div>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="rounded-xl border px-3 py-2 text-sm bg-white"
            value={weekStart}
            onChange={(e) => router.push(`/weekly?weekStart=${e.target.value}`)}
          />
          <a className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-slate-50" href={`/?date=${weekStart}`}>Daily →</a>
        </div>
      </div>

      {error && <div className="mt-4 text-rose-600">Failed to load.</div>}
      {!data && <div className="mt-4">Loading…</div>}

      {data && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="text-lg font-semibold">Submission Compliance</div>
            <div className="mt-3">
              <Line data={chartData} />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="text-lg font-semibold">Daily counts</div>
            <div className="mt-2 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-right px-3 py-2">Submitted</th>
                    <th className="text-right px-3 py-2">Flagged</th>
                    <th className="text-right px-3 py-2">Leave</th>
                    <th className="text-right px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyCounts.map((r: any) => (
                    <tr key={r.date} className="border-t">
                      <td className="px-3 py-2">{r.date}</td>
                      <td className="px-3 py-2 text-right">{r.submitted}</td>
                      <td className="px-3 py-2 text-right">{r.flagged}</td>
                      <td className="px-3 py-2 text-right">{r.leave}</td>
                      <td className="px-3 py-2 text-right">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
