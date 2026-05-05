import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";

export default function ArticleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArticle();
  }, []);

  const fetchArticle = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await API.get(`/articles/${id}`);
      setArticle(data);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to load article");
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

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

  const formatTagLabel = (tag) =>
    String(tag || "")
      .replace(/[-_]+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          <PageState
            variant="loading"
            title="Loading article"
            description="Fetching the article details and related metadata."
          />
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          <PageState
            variant="error"
            title="Article unavailable"
            description={error || "This article may be unavailable or removed."}
            actionLabel="Back to Knowledge Hub"
            onAction={() => navigate("/articles")}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 shrink-0">
            <div className="glass rounded-2xl p-4 sticky top-24 animate-fade-in border border-white/60">
              <div className="mt-3">
                <Button variant="outline" className="w-full" onClick={() => navigate("/articles")}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Hub
                </Button>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Tag className="h-4 w-4" />
                  <span>{article.category || "GENERAL"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  <span>{renderDisplayName(article.createdBy, "Anonymous")}</span>
                </div>

                {Array.isArray(article.tags) && article.tags.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-sm bg-slate-100 text-slate-600 text-xs font-medium">
                          #{formatTagLabel(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <article className="glass rounded-2xl p-6 sm:p-8 animate-fade-in border border-white/60">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 wrap-break-word">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-6 text-xs sm:text-sm text-slate-500">
                <span className="px-2 py-1 rounded-sm bg-indigo-50 text-indigo-600 font-medium">
                  {article.category || "GENERAL"}
                </span>
                {Array.isArray(article.tags) && article.tags.length > 0 && (
                  <span className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-sm bg-slate-100 text-slate-600 font-medium">
                        #{formatTagLabel(tag)}
                      </span>
                    ))}
                  </span>
                )}
                <span>Published {formatDate(article.createdAt)}</span>
              </div>

              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
                {article.content}
              </div>
            </article>
          </main>
        </div>
      </div>
    </>
  );
}
