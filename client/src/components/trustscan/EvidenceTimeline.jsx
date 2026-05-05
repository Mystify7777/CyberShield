const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900"
};

const getTone = (reason, message) => {
  if (reason === "success") return toneClasses.success;
  if (reason === "service_unavailable" || reason === "api_error") return toneClasses.warning;
  if (reason === "network_error") return toneClasses.error;
  if (message?.toLowerCase().includes("unavailable")) return toneClasses.warning;
  return toneClasses.info;
};

const formatTime = (value) => {
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return value;
  }
};

export default function EvidenceTimeline({ events = [] }) {
  if (!events.length) {
    return null;
  }

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">Scan Evidence</p>
          <h2 className="mt-2 text-xl font-black text-slate-900">Evidence Timeline</h2>
        </div>
        <p className="text-sm text-slate-500">Captured during the scan run</p>
      </div>

      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <div key={`${event.key}-${event.occurredAt}`} className={`rounded-2xl border px-4 py-3 ${getTone(event.reason, event.message)}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] font-semibold opacity-80">{event.label}</p>
                <p className="mt-1 text-sm font-semibold">{event.message}</p>
              </div>
              <div className="text-right text-xs font-medium opacity-80">
                <p>{formatTime(event.occurredAt)}</p>
                <p className="mt-1">{(event.durationMs / 1000).toFixed(2)}s</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
