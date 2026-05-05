const confidenceClasses = {
  High: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-red-200 bg-red-50 text-red-700"
};

export default function ConfidenceBadge({ confidence = "Medium" }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${confidenceClasses[confidence] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
      Confidence: {confidence}
    </div>
  );
}
