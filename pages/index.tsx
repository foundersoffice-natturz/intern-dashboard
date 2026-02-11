import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import useSWR from "swr";
import Layout from "../components/Layout";
import SummaryCards from "../components/SummaryCards";
import DataTable from "../components/DataTable";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const { data, status } = useSession();
  const router = useRouter();

  const date = typeof router.query.date === "string"
    ? router.query.date
    : new Date().toISOString().slice(0, 10);

  const { data: daily, error } = useSWR(
    status === "authenticated" ? `/api/data/daily?date=${date}` : null,
    fetcher
  );

  if (status === "loading") return <div className="p-6">Loading…</div>;
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border bg-white p-6 max-w-md w-full">
          <div className="text-lg font-semibold">Intern Reporting Dashboard</div>
          <div className="text-sm text-slate-600 mt-2">Sign in with Google (management only).</div>
          <button
            className="mt-4 w-full rounded-xl bg-black text-white py-2"
            onClick={() => signIn("google")}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-2xl font-bold">Daily Summary</div>
          <div className="text-sm text-slate-600">Search, filter, sort, drill down per intern.</div>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="rounded-xl border px-3 py-2 text-sm bg-white"
            value={date}
            onChange={(e) => router.push(`/?date=${e.target.value}`)}
          />
          <a className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-slate-50" href={`/weekly?weekStart=${date}`}>
            Weekly view →
          </a>
        </div>
      </div>

      {error && <div className="mt-4 text-rose-600">Failed to load data.</div>}
      {!daily && <div className="mt-4">Loading dashboard data…</div>}

      {daily && (
        <>
          <div className="mt-4">
            <SummaryCards counts={daily.counts} />
          </div>
          <DataTable date={date} interns={daily.interns} />
        </>
      )}
    </Layout>
  );
}
