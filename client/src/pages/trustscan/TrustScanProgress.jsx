import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import Button from "../../components/ui/Button";
import API from "../../services/api";

const CHECKS = [
  "URL normalization",
  "DNS resolve",
  "SSL certificate check",
  "HTTP security headers check",
  "Domain age and WHOIS data",
  "Reputation scoring"
];

const getCompletedChecks = (job, report) => {
  if (!job) return 0;
  if (job.status === "completed" && report) return CHECKS.length;

  const startedAtMs = job.startedAt ? new Date(job.startedAt).getTime() : Date.now();
  const elapsed = Math.max(0, Date.now() - startedAtMs);
  const ratio = Math.min(0.95, elapsed / 4500);
  return Math.max(1, Math.floor(ratio * CHECKS.length));
};

export default function TrustScanProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const payload = await API.get(`/trustscan/${id}`);
      setJob(payload.data.job);
      setReport(payload.data.report);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load scan status");
    }
  }, [id]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      fetchStatus();
    }, 1200);

    return () => window.clearInterval(timer);
  }, [job, fetchStatus]);

  const completedChecks = useMemo(() => getCompletedChecks(job, report), [job, report]);

  return (
    <PublicLayout>
      <section className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-3xl card">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-700 font-semibold">TrustScan Progress</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Scan Status</h1>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!job && !error && <p className="mt-4 text-slate-600">Loading scan details...</p>}

          {job && (
            <>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p><span className="font-semibold">Target:</span> {job.url}</p>
                <p><span className="font-semibold">Domain:</span> {job.normalizedDomain}</p>
                <p className="mt-1"><span className="font-semibold">State:</span> {job.status}</p>
              </div>

              <div className="mt-6 space-y-3">
                {CHECKS.map((label, index) => {
                  const isDone = index < completedChecks;
                  const isActive = !isDone && index === completedChecks && job.status !== "completed";

                  return (
                    <div
                      key={label}
                      className={`rounded-xl border px-4 py-3 text-sm transition-colors ${
                        isDone
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : isActive
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      <span className="font-semibold">{isDone ? "Done" : isActive ? "Running" : "Queued"}</span>
                      {" - "}
                      {label}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {job.status === "completed" && report ? (
                  <Button onClick={() => navigate(`/trustscan/${id}/report`)}>
                    View Final Report
                  </Button>
                ) : (
                  <Button onClick={fetchStatus}>Refresh Status</Button>
                )}
                <Button variant="secondary" onClick={() => navigate("/trustscan")}>New Scan</Button>
              </div>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
