import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import { sanitizeObject } from "../../utils/sanitizer";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  CheckCircle,
  Clock,
  User,
  Award,
  Bug,
  Mail,
  Key,
  Wifi,
  Shield,
  Users,
  Smartphone,
  Globe
} from "lucide-react";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    tags: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthenticated = Boolean(user?.token);
  const currentUserId = user?._id;

  const iconMap = {
    phishing: Mail,
    scam: Bug,
    privacy: Shield,
    passwords: Key,
    network: Wifi,
    social: Users,
    mobile: Smartphone,
    web: Globe,
    general: MessageSquare
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

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoadError("");
      setLoadingList(true);
      const { data } = await API.get("/articles");
      setArticles(data);
    } catch (error) {
      console.error(error);
      setArticles([]);
      setLoadError(error.response?.data?.message || "Failed to load articles");
    } finally {
      setLoadingList(false);
    }
  };

  const tags = useMemo(() => {
    const countMap = articles.reduce((acc, article) => {
      const articleTags = Array.isArray(article.tags) && article.tags.length > 0
        ? article.tags
        : [article.category || "general"];

      articleTags.forEach((tag) => {
        const normalizedTag = String(tag || "").trim().toLowerCase();
        if (!normalizedTag) return;
        acc[normalizedTag] = (acc[normalizedTag] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const articleTags = Array.isArray(article.tags) && article.tags.length > 0
        ? article.tags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
        : [String(article.category || "general").trim().toLowerCase()];

      const matchesTag =
        selectedTag === "ALL" || articleTags.includes(selectedTag);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query);

      return matchesTag && matchesSearch;
    });
  }, [articles, searchQuery, selectedTag]);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const toSnippet = (text, max = 170) => {
    if (!text) return "";
    if (text.length <= max) return text;
    return `${text.slice(0, max)}...`;
  };

  const estimateReadTime = (text) => {
    const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  };

  const getVoteCounts = (article) => ({
    up: Number.isInteger(article.upvoteCount)
      ? article.upvoteCount
      : Array.isArray(article.upvotes) ? article.upvotes.length : 0,
    down: Number.isInteger(article.downvoteCount)
      ? article.downvoteCount
      : Array.isArray(article.downvotes) ? article.downvotes.length : 0
  });

  const getUserVote = (article) => {
    if (article.userVote === "up" || article.userVote === "down") {
      return article.userVote;
    }

    if (!currentUserId) return null;

    const hasUpvoted = Array.isArray(article.upvotes)
      && article.upvotes.some((id) => id?.toString() === currentUserId);
    const hasDownvoted = Array.isArray(article.downvotes)
      && article.downvotes.some((id) => id?.toString() === currentUserId);

    if (hasUpvoted) return "up";
    if (hasDownvoted) return "down";
    return null;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitized = sanitizeObject(form);
      await API.post("/articles", sanitized);
      toast.success("Article submitted for review!");
      setForm({ title: "", content: "", category: "GENERAL", tags: "" });
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit article");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (event, articleId, type) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to vote on articles");
      navigate("/login");
      return;
    }

    try {
      const { data } = await API.post(`/articles/${articleId}/vote`, { type });

      setArticles((prev) => prev.map((article) => {
        if (article._id !== articleId) return article;

        return {
          ...article,
          upvoteCount: Number(data?.upvoteCount || 0),
          downvoteCount: Number(data?.downvoteCount || 0),
          userVote: data?.userVote || null
        };
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vote");
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 shrink-0">
            <div className="glass rounded-2xl p-4 sticky top-24 animate-fade-in border border-white/60">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Topics</h2>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTag("ALL")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedTag === "ALL"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>All Articles</span>
                </button>

                {tags.map((topic) => {
                  const Icon = iconMap[topic.name] || MessageSquare;
                  return (
                    <button
                      key={topic.name}
                      onClick={() => setSelectedTag(topic.name)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedTag === topic.name
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{formatTagLabel(topic.name)}</span>
                      </span>
                      <span className="text-xs text-slate-400">{topic.count}</span>
                    </button>
                  );
                })}
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => setShowForm((prev) => !prev)}
                  className="btn btn-primary mt-4 w-full flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {showForm ? "Cancel" : "Submit Article"}
                </button>
              )}
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Knowledge Hub</h1>
                  <p className="text-slate-600">
                    Discover practical cybersecurity knowledge from the community
                  </p>
                </div>

                {!isAuthenticated && (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
                  >
                    Sign in to submit articles
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-12"
                />
              </div>
            </div>

            {showForm && isAuthenticated && (
              <form className="glass rounded-2xl p-6 mb-6 animate-fade-in border border-white/60" onSubmit={handleSubmit}>
                <h3 className="font-semibold mb-3">Submit Your Article</h3>

                <input
                  name="title"
                  placeholder="Article Title"
                  className="input"
                  value={form.title}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="content"
                  placeholder="Article Content"
                  className="input"
                  value={form.content}
                  onChange={handleChange}
                  rows={6}
                  required
                />

                <select
                  name="category"
                  className="input"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="GENERAL">General</option>
                  <option value="PHISHING">Phishing</option>
                  <option value="SCAM">Scam</option>
                  <option value="PRIVACY">Privacy</option>
                </select>

                <input
                  name="tags"
                  placeholder="Tags (comma-separated, e.g. phishing, email, awareness)"
                  className="input"
                  value={form.tags}
                  onChange={handleChange}
                />

                <p className="text-xs text-slate-500 mb-3">
                  Your article will be reviewed by admins before publication.
                </p>

                <Button type="submit" className="w-full" loading={loading}>
                  Submit Article
                </Button>
              </form>
            )}

            {loadingList ? (
              <PageState
                variant="loading"
                title="Loading articles"
                description="Fetching the latest community knowledge posts."
              />
            ) : loadError ? (
              <PageState
                variant="error"
                title="Articles unavailable"
                description={loadError}
                actionLabel="Try again"
                onAction={fetchArticles}
              />
            ) : filteredArticles.length === 0 ? (
              <PageState
                variant="empty"
                title={searchQuery.trim() || selectedTag !== "ALL" ? "No matching articles" : "No articles yet"}
                description={searchQuery.trim() || selectedTag !== "ALL" ? "Try a different keyword or topic filter." : "Be the first to share cybersecurity insights in this topic."}
                actionLabel={isAuthenticated ? "Submit an Article" : "Sign in to submit"}
                onAction={() => (isAuthenticated ? setShowForm(true) : navigate("/login"))}
              />
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article, index) => {
                  const voteCounts = getVoteCounts(article);
                  const userVote = getUserVote(article);

                  return (
                  <div
                    key={article._id}
                    onClick={() => navigate(`/articles/${article._id}`)}
                    className="w-full text-left glass rounded-xl p-6 border border-white/60 hover:border-indigo-300 transition-all duration-300 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-4">
                      <div className="hidden sm:flex flex-col items-center gap-2 text-center min-w-[70px]">
                        <button
                          type="button"
                          onClick={(event) => handleVote(event, article._id, "up")}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            userVote === "up"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title="Upvote"
                        >
                          <ThumbsUp className="h-4 w-4 mx-auto mb-1" />
                          {voteCounts.up}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => handleVote(event, article._id, "down")}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            userVote === "down"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                          }`}
                          title="Downvote"
                        >
                          <ThumbsDown className="h-4 w-4 mx-auto mb-1" />
                          {voteCounts.down}
                        </button>
                        <div className="px-3 py-1 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600">
                          <MessageCircle className="h-4 w-4 mx-auto mb-1" />
                          {estimateReadTime(article.content)}m
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="text-lg font-semibold hover:text-indigo-600 transition-colors">
                            {article.title}
                          </h3>
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        </div>

                        <p className="text-slate-600 text-sm mb-3">{toSnippet(article.content)}</p>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="px-2 py-1 rounded-sm bg-indigo-50 text-indigo-600 text-xs font-medium">
                            {article.category || "GENERAL"}
                          </span>

                          <span className="flex flex-wrap gap-2">
                            {(Array.isArray(article.tags) && article.tags.length > 0
                              ? article.tags
                              : [article.category || "GENERAL"]
                            ).slice(0, 4).map((tag) => (
                              <span
                                key={`${article._id}-${tag}`}
                                className="px-2 py-1 rounded-sm bg-slate-100 text-slate-600 text-xs font-medium"
                              >
                                #{formatTagLabel(tag)}
                              </span>
                            ))}
                          </span>

                          <span className="flex items-center gap-1 text-slate-500">
                            <User className="h-3 w-3" />
                            {renderDisplayName(article.createdBy, "Anonymous")}
                            {article.createdBy?.alias && (
                              <Award className="h-3 w-3 text-amber-500" />
                            )}
                          </span>

                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(article.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
