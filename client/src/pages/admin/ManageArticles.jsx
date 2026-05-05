import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";
import AdminNavbar from "../../components/layout/AdminNavbar";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";

export default function ManageArticles() {
  const [allArticles, setAllArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [processing, setProcessing] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const renderDisplayName = (person, fallback = "Unknown") => {
    if (!person) return fallback;

    const baseName = person.name || fallback;
    if (!person.alias) return baseName;

    return (
      <span title={`Username: ${baseName}`} className="cursor-help">
        {person.alias}
      </span>
    );
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setError("");
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        API.get("/articles/admin/pending"),
        API.get("/articles")
      ]);
      setPendingArticles(pendingRes.data);
      setAllArticles(allRes.data);
    } catch (error) {
      console.error(error);
      setPendingArticles([]);
      setAllArticles([]);
      setError(error.response?.data?.message || "Failed to fetch articles");
      toast.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const updateArticleStatus = async (id, status) => {
    setProcessing({ ...processing, [id]: true });
    try {
      await API.put(`/articles/${id}/status`, { status });
      toast.success(`Article ${status.toLowerCase()}`);
      fetchArticles();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update article");
    } finally {
      setProcessing({ ...processing, [id]: false });
    }
  };

  const deleteArticle = async (id) => {
    setProcessing({ ...processing, [id]: true });
    try {
      await API.delete(`/admin/articles/${id}`);
      toast.success("Article deleted");
      fetchArticles();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete article");
    } finally {
      setProcessing({ ...processing, [id]: false });
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className="p-6">
        <h2 className="text-xl mb-4">Manage Articles</h2>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-sm ${activeTab === "pending" ? "btn btn-primary" : "btn"}`}
          >
            Pending ({pendingArticles.length})
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`px-4 py-2 rounded-sm ${activeTab === "published" ? "btn btn-primary" : "btn"}`}
          >
            Published ({allArticles.length})
          </button>
        </div>

        {loading ? (
          <PageState
            variant="loading"
            title="Loading articles"
            description="Fetching pending submissions and published knowledge posts."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Articles unavailable"
            description={error}
            actionLabel="Try again"
            onAction={fetchArticles}
          />
        ) : activeTab === "pending" && (
          <div>
            {pendingArticles.length === 0 ? (
              <PageState
                variant="empty"
                title="No pending articles"
                description="New community submissions will appear here for review."
              />
            ) : (
              pendingArticles.map((a) => (
                <div key={a._id} className="card mb-4">
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{a.category}</p>
                  <p className="text-sm mb-3">{a.content.substring(0, 150)}...</p>
                  {a.createdBy && (
                    <p className="text-xs text-gray-400 mb-3">
                      <strong>Submitted by:</strong> {renderDisplayName(a.createdBy)} ({a.createdBy.email})
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateArticleStatus(a._id, "APPROVED")}
                      loading={processing[a._id]}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateArticleStatus(a._id, "REJECTED")}
                      variant="danger"
                      loading={processing[a._id]}
                      className="flex items-center gap-2"
                    >
                      <XCircle size={16} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "published" && (
          <div>
            {allArticles.length === 0 ? (
              <PageState
                variant="empty"
                title="No published articles"
                description="Approved knowledge hub posts will appear here."
              />
            ) : (
              allArticles.map((a) => (
                <div key={a._id} className="card mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.category}</p>
                  </div>

                  <Button
                    onClick={() => deleteArticle(a._id)}
                    variant="danger"
                    loading={processing[a._id]}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
