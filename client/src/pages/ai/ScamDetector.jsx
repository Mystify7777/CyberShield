import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";

export default function ScamDetector() {
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wakingHint, setWakingHint] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  const canAnalyze = text.trim().length > 0 && !loading;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefill = params.get("q");

    if (prefill) {
      setText(prefill);
    }
  }, [location.search]);

  const analyze = async () => {
    if (!text.trim()) {
      toast.error("Please enter a message or URL first");
      return;
    }

    setLoading(true);
    setWakingHint("");
    setAnalysisError("");

    try {
      const { data } = await API.post("/ai/predict", { text });
      setResult(data);

      const previousCount = Number(localStorage.getItem("aiChecksCount") || 0);
      localStorage.setItem("aiChecksCount", String(previousCount + 1));

      toast.success("Analysis complete");
    } catch (error) {
      const message = error?.response?.data?.message || "AI request failed";
      setAnalysisError(message);
      toast.error(message);
      if (message.toLowerCase().includes("ai service failed")) {
        setWakingHint("Server waking up, please wait a few seconds and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-4 sm:p-6 max-w-xl mx-auto">
        <div className="card">
          <h2 className="text-lg sm:text-xl mb-4">AI Scam Detector</h2>

          <textarea
            placeholder="Enter message or URL..."
            className="input"
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />

          <Button onClick={analyze} className="w-full sm:w-auto" loading={loading} disabled={!canAnalyze}>
            Analyze
          </Button>

          {wakingHint && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
              {wakingHint}
            </p>
          )}

          {analysisError && (
            <div className="mt-4">
              <PageState
                variant="error"
                title="Analysis failed"
                description={analysisError}
                actionLabel="Try again"
                onAction={analyze}
              />
            </div>
          )}
        </div>

        {result && (
          <div
            className={`mt-5 p-5 rounded-xl text-white shadow ${
              result.label === "MALICIOUS"
                ? "bg-linear-to-r from-red-500 to-red-600"
                : "bg-linear-to-r from-green-500 to-green-600"
            }`}
          >
            <h3 className="text-xl font-bold">{result.label}</h3>
            <p className="opacity-90">Confidence: {result.confidence}</p>
            <p className="mt-3 text-sm opacity-95">
              {result.label === "MALICIOUS"
                ? "High risk detected. Avoid interacting with this content and file an incident report."
                : result.label === "SUSPICIOUS"
                  ? "Potential risk detected. Verify sender details and report if uncertain."
                  : "Low risk detected. Stay cautious and still report if behavior appears unusual."}
            </p>

            <Button
              className="mt-4 bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => {
                navigate("/create-report", {
                  state: {
                    prefill: {
                      title: `AI Flagged: ${result.label}`,
                      description: text,
                      category: result.label === "MALICIOUS" ? "PHISHING_IMPERSONATION" : "OTHER",
                      subcategory: result.label === "MALICIOUS" ? "IMPERSONATION_SCAM" : "SUSPICIOUS_OTHER",
                      severity: result.label === "MALICIOUS" ? "HIGH" : result.label === "SUSPICIOUS" ? "MEDIUM" : "LOW",
                      sourceChannel: "UNKNOWN"
                    }
                  }
                });
              }}
            >
              Report This Incident
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
