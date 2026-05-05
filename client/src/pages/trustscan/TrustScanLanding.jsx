import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PublicLayout from "../../components/layout/PublicLayout";
import Button from "../../components/ui/Button";
import API from "../../services/api";

export default function TrustScanLanding() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!url.trim()) {
      toast.error("Please paste a URL to scan");
      return;
    }

    setLoading(true);
    try {
      const payload = await API.post("/trustscan", { url: url.trim() });
      toast.success("TrustScan started");
      navigate(`/trustscan/${payload.data.jobId}`);
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to start TrustScan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-3xl card">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-700 font-semibold">TrustScan V1</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Website Risk Assessment</h1>
          <p className="mt-3 text-slate-600">
            Paste a URL and get a trust score, factor breakdown, and plain-English summary.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="trustscan-url">
              URL
            </label>
            <input
              id="trustscan-url"
              type="text"
              className="input"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={loading}
            />

            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={loading} disabled={!url.trim()}>
                Start TrustScan
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/reports")}>
                Back to Reports
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
