import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import Button from "../../components/ui/Button";
import API from "../../services/api";

export default function TrustScanHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const payload = await API.get(`/trustscan/history?page=${page}&limit=8`);
        setItems(payload.data.items || []);
        setPagination(payload.data.pagination || null);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load TrustScan history");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page]);

  return (
    <PublicLayout>
      <section className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-4xl card">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-700 font-semibold">TrustScan History</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Recent Scans</h1>
          <p className="mt-2 text-slate-600">Browse previously completed trust assessments.</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && <p className="mt-4 text-sm text-slate-500">Loading history...</p>}

          {!loading && !error && (
            <div className="mt-6 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No completed TrustScan reports yet.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item._id || item.jobId} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.normalizedDomain}</p>
                        <p className="text-sm text-slate-600">{item.url}</p>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Score:</span> {item.score} | <span className="font-semibold text-slate-900">{item.verdict}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={() => navigate(`/trustscan/${item.jobId}/report`)}>Open Report</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {pagination && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages || 1}
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  Previous
                </Button>
                <Button variant="secondary" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/trustscan")}>New Scan</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
