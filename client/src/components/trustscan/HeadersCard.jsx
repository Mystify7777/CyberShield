const headerRows = [
  ["CSP", "CSP"],
  ["HSTS", "HSTS"],
  ["X-Frame-Options", "XFO"],
  ["Referrer-Policy", "Referrer-Policy"],
  ["X-Content-Type-Options", "XCTO"],
  ["Permissions-Policy", "Permissions-Policy"]
];

export default function HeadersCard({ factor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Browser Protection Controls</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">Security Headers</h2>

      {factor ? (
        <>
          <div className="mt-3 grid gap-2 text-sm">
            {headerRows.map(([label, key]) => {
              const present = factor.present?.includes(key);

              return (
                <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="font-medium text-slate-800">{label}</span>
                  <span className={present ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                    {present ? "Present" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-sm text-slate-700">{factor.detail}</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Security headers factor unavailable.</p>
      )}
    </div>
  );
}
