import { Link } from "react-router-dom";
import { useState } from "react";
import { sendErrorReport } from "../../utils/errorReporter";

export default function ServerError() {
  const [sending, setSending] = useState(false);
  const [reportState, setReportState] = useState("idle");

  const handleReport = async () => {
    try {
      setSending(true);
      setReportState("idle");
      await sendErrorReport();
      setReportState("sent");
    } catch {
      setReportState("failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-lg text-center bg-white shadow-sm rounded-2xl p-10">
        <p className="text-sm font-semibold text-slate-500 mb-2">ERROR 500</p>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Something Went Wrong</h1>
        <p className="text-slate-600 mb-6">
          We hit an unexpected issue. Please try again in a moment.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="btn btn-primary inline-block">
            Back Home
          </Link>
          <button
            type="button"
            onClick={handleReport}
            className="btn"
            disabled={sending}
          >
            {sending ? "Reporting..." : "Report This Error"}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn"
          >
            Reload
          </button>
        </div>

        {reportState === "sent" && (
          <p className="text-sm text-emerald-600 mt-4">Error report sent successfully.</p>
        )}
        {reportState === "failed" && (
          <p className="text-sm text-red-600 mt-4">Could not send report right now.</p>
        )}
      </div>
    </div>
  );
}
