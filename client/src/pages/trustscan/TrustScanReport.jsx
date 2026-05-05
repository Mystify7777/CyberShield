import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import PublicLayout from "../../components/layout/PublicLayout";
import Button from "../../components/ui/Button";
import ConfidenceBadge from "../../components/trustscan/ConfidenceBadge";
import DomainCard from "../../components/trustscan/DomainCard";
import EvidenceTimeline from "../../components/trustscan/EvidenceTimeline";
import HeadersCard from "../../components/trustscan/HeadersCard";
import ReputationCard from "../../components/trustscan/ReputationCard";
import ReportActions from "../../components/trustscan/ReportActions";
import ScoreRing from "../../components/trustscan/ScoreRing";
import API from "../../services/api";
import { exportTrustScanPdf } from "../../utils/trustscanPdf";

export default function TrustScanReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await API.get(`/trustscan/${id}`);
        setJob(payload.data.job);
        setReport(payload.data.report);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load TrustScan report");
      }
    };

    load();
  }, [id]);

  const sslFactor = report?.factors?.find((factor) => factor.key === "ssl") || null;
  const headersFactor = report?.factors?.find((factor) => factor.key === "headers") || null;
  const dnsFactor = report?.factors?.find((factor) => factor.key === "dns") || null;
  const reputationFactor = report?.factors?.find((factor) => factor.key === "reputation") || null;
  const evidence = report?.scanEvidence || [];

  const shareReport = async () => {
    try {
      const publicUrl = `${window.location.origin}/trustscan/report/${report._id}/public`;
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public report link copied");
    } catch {
      toast.error("Unable to copy report link");
    }
  };

  const downloadReport = async () => {
    try {
      await exportTrustScanPdf(reportRef.current, `cybershield-trustscan-${id}.pdf`);
      toast.success("Report downloaded");
    } catch {
      toast.error("Unable to download report");
    }
  };

  return (
    <PublicLayout>
      <section className="container-page py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-5xl card px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-700 font-semibold">TrustScan Report</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Final Assessment</h1>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && !report && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
              <p className="font-semibold">Scan is not complete yet.</p>
              <p className="mt-1 text-sm">Open progress view to continue tracking checks.</p>
              <div className="mt-3">
                <Button onClick={() => navigate(`/trustscan/${id}`)}>Go to Progress</Button>
              </div>
            </div>
          )}

          {report && (
            <>
              <div ref={reportRef} className="space-y-6">
                <div className="mt-6 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
                  <ScoreRing score={report.score} verdict={report.verdict} />

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <p className="text-sm text-slate-600 wrap-break-word"><span className="font-semibold text-slate-800">Target:</span> {report.url}</p>
                    <p className="mt-1 text-sm text-slate-600 wrap-break-word"><span className="font-semibold text-slate-800">Domain:</span> {report.normalizedDomain}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Scanned:</span> {new Date(report.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-4">
                      <ConfidenceBadge confidence={report.confidence || "Medium"} />
                    </div>
                    <p className="mt-4 text-sm text-slate-700 leading-6">{report.summary}</p>
                  </div>
                </div>

                <EvidenceTimeline events={evidence} />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Transport Security</p>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">SSL / TLS</h2>
                    <p className="mt-3 text-sm text-slate-700">
                      {sslFactor?.detail || "SSL factor unavailable."}
                    </p>
                  </div>

                  <HeadersCard factor={headersFactor} />

                  <DomainCard factor={dnsFactor} />

                  <ReputationCard factor={reputationFactor} scanMetadata={report.scanMetadata} />
                </div>

                {report.scanDurationMs && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Completed in</span> {(report.scanDurationMs / 1000).toFixed(2)}s
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h2 className="text-lg font-bold text-slate-900">Factor Breakdown</h2>
                  <div className="mt-4 space-y-3">
                    {(report.factors || []).map((factor) => (
                      <div key={factor.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="font-semibold text-slate-900">{factor.label}</p>
                          <span className="text-sm font-semibold text-slate-700">Impact: {factor.impact > 0 ? `+${factor.impact}` : factor.impact}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">Status: {factor.status}</p>
                        {factor.reason && <p className="mt-1 text-sm text-slate-600">Reason: {factor.reason}</p>}
                        <p className="mt-1 text-sm text-slate-600">{factor.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <ReportActions
                onRunAgain={() => navigate("/trustscan")}
                onShare={shareReport}
                onDownload={downloadReport}
                onViewHistory={() => navigate("/trustscan/history")}
              />
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
