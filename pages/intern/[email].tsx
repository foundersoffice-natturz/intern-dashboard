import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Layout from "../../components/Layout";
import StatusBadge from "../../components/StatusBadge";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InternDetail() {
  const { status } = useSession();
  const router = useRouter();

  const email = typeof router.query.email === "string" ? router.query.email : "";
  const date = typeof router.query.date === "string" ? router.query.date : new Date().toISOString().slice(0, 10);

  const { data, error } = useSWR(
    status === "authenticated" && email ? `/api/data/intern?date=${date}&email=${encodeURIComponent(email)}` : null,
    fetcher
  );

  return (
    <Layout>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-bold">Intern Detail</div>
          <div className="text-sm text-slate-600">{email} • {date}</div>
        </div>
        <a className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-slate-50" href={`/?date=${date}`}>← Back</a>
      </div>

      {error && <div className="mt-4 text-rose-600">Failed to load.</div>}
      {!data && <div className="mt-4">Loading…</div>}

      {data?.data && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{data.data.internName || data.data.internEmail}</div>
                <div className="text-sm text-slate-600">{data.data.manager || "—"}</div>
              </div>
              <StatusBadge status={data.data.status} />
            </div>
            <div className="mt-3 text-sm text-slate-600">
              Submissions: <b>{data.data.submissionsCount ?? 0}</b>
              {data.data.firstSubmissionAt ? ` • First: ${data.data.firstSubmissionAt}` : ""}
              {data.data.lastSubmissionAt ? ` • Last: ${data.data.lastSubmissionAt}` : ""}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="text-lg font-semibold">GPT Analysis</div>
            <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
              <b>Overall:</b> {data.data.gpt?.dailySummary || "—"}{"\n\n"}
              <b>What went well:</b> {data.data.gpt?.whatWentWell || "—"}{"\n\n"}
              <b>Action points:</b>{"\n"}{data.data.gpt?.actionPoints || "—"}{"\n\n"}
              <b>Risks:</b> {data.data.gpt?.risks || "—"}{"\n\n"}
              <b>Next steps:</b> {data.data.gpt?.nextSteps || "—"}{"\n\n"}
              <span className="text-xs text-slate-500">Model: {data.data.gpt?.model || "—"}</span>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="text-lg font-semibold">Exact Work Done (raw JSON snapshot)</div>
            <pre className="mt-2 text-xs bg-slate-50 rounded-xl border p-3 overflow-auto">
{data.data.gpt?.rawJSON || "—"}
            </pre>
          </div>
        </div>
      )}
    </Layout>
  );
}
