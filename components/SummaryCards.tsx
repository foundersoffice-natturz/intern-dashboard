export default function SummaryCards({ counts }: { counts: any }) {
  const Card = ({ label, val }: any) => (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{val}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card label="Total interns" val={counts.total} />
      <Card label="Submitted" val={counts.submitted} />
      <Card label="Flagged" val={counts.flagged} />
      <Card label="On Leave" val={counts.leave} />
    </div>
  );
}
