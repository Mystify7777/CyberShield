export default function ReputationCard({ factor, scanMetadata }) {
  const reputation = scanMetadata?.reputation || {};
  const failureReason = reputation.reason;

  const reasonDisplay = {
    service_unavailable: "Service was unavailable during this scan.",
    api_error: "API error occurred while checking reputation.",
    network_error: "Network error occurred during reputation check.",
    success: null
  };

  const failureMessage = reasonDisplay[failureReason] || null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Reputation Signals</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">Public Blocklists</h2>

      {failureMessage && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">{failureMessage}</p>
        </div>
      )}

      {factor ? (
        <>
          <div className="mt-3 grid gap-2 text-sm">
            {[
              ["Source", factor.source || "Unknown"],
              ["Status", factor.listed ? "Flagged" : factor.grade || "Unknown"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-800">{label}</span>
                <span className={
                  label === "Status" && factor.listed
                    ? "font-semibold text-red-600"
                    : label === "Status" && factor.grade === "Clean"
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-slate-700"
                }
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-sm text-slate-700">{factor.detail}</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Reputation signal unavailable.</p>
      )}
    </div>
  );
}
