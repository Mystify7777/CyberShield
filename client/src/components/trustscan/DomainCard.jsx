export default function DomainCard({ factor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Domain Intelligence</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">DNS / Domain Intel</h2>

      {factor ? (
        <>
          <div className="mt-3 grid gap-2 text-sm">
            {[
              ["Resolves", factor.resolves],
              ["Email Records", factor.mx],
              ["Domain Age", typeof factor.ageDays === "number" ? `${factor.ageDays} days` : "Unknown"],
              ["Nameservers", typeof factor.nameservers === "number" ? factor.nameservers : "Unknown"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-800">{label}</span>
                <span className="font-semibold text-slate-700">{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{factor.grade}</p>
            <p className="mt-1">{factor.detail}</p>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Domain intelligence factor unavailable.</p>
      )}
    </div>
  );
}
