import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";

export default function Forum() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [replyingId, setReplyingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false });

  const [postForm, setPostForm] = useState({ title: "", content: "" });
  const [replyDrafts, setReplyDrafts] = useState({});

  const renderDisplayName = (person, fallback = "User") => {
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
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (currentPage = 1) => {
    try {
      setError("");
      setLoading(true);
      const { data } = await API.get(`/forum?page=${currentPage}&limit=10`);
      setPosts(data.items || []);
      setPagination(data.pagination || { page: currentPage, limit: 10, total: 0, totalPages: 0, hasNextPage: false });
    } catch (error) {
      setPosts([]);
      setPagination({ page: currentPage, limit: 10, total: 0, totalPages: 0, hasNextPage: false });
      setError(error.response?.data?.message || "Failed to load forum posts");
      toast.error("Failed to load forum posts");
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user) {
      toast.error("Login required to create a post");
      navigate("/login");
      return;
    }

    if (!postForm.title.trim() || !postForm.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setCreating(true);
    try {
      await API.post("/forum", {
        title: postForm.title.trim(),
        content: postForm.content.trim()
      });
      setPostForm({ title: "", content: "" });
      toast.success("Post created");
      fetchPosts(page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const replyToPost = async (postId) => {
    if (!user) {
      toast.error("Login required to reply");
      navigate("/login");
      return;
    }

    const text = replyDrafts[postId]?.trim();
    if (!text) {
      toast.error("Reply cannot be empty");
      return;
    }

    setReplyingId(postId);
    try {
      await API.post(`/forum/${postId}/reply`, { text });
      setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Reply posted");
      fetchPosts(page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post reply");
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="rounded-2xl bg-linear-to-r from-indigo-700 to-blue-700 text-white p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Community Forum</h1>
          <p className="text-sm text-indigo-100 mb-3">
            Discuss active cyber threats, ask questions, and help others stay safe.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-sm bg-white/20">View posts: Public</span>
            <span className="px-2 py-1 rounded-sm bg-white/20">Create post: Login required</span>
            <span className="px-2 py-1 rounded-sm bg-white/20">Reply: Login required</span>
          </div>

          <div className="mt-4">
            <Button className="w-full sm:w-auto" onClick={() => (user ? navigate("/forum/create") : navigate("/login"))}>
              {user ? "Create Post" : "Login To Create Post"}
            </Button>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="font-semibold text-lg mb-3">Create Post</h2>
          {!user && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-sm p-2 mb-3">
              You are viewing as guest. Login to create a post.
            </p>
          )}

          <input
            className="input mb-3"
            placeholder="Post title"
            value={postForm.title}
            onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
            disabled={!user || creating}
          />

          <textarea
            className="input mb-3 min-h-28"
            placeholder="Share your experience, tips, or question"
            value={postForm.content}
            onChange={(e) => setPostForm((prev) => ({ ...prev, content: e.target.value }))}
            disabled={!user || creating}
          />

          <Button onClick={createPost} disabled={!user} loading={creating} className="w-full sm:w-auto">
            Create Post
          </Button>
        </div>

        {loading ? (
          <PageState
            variant="loading"
            title="Loading forum"
            description="Fetching the latest community discussions."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Forum unavailable"
            description={error}
            actionLabel="Try again"
            onAction={() => fetchPosts(page)}
          />
        ) : posts.length === 0 ? (
          <PageState
            variant="empty"
            title="No posts yet"
            description="Start the first discussion or check back once the community posts."
            actionLabel={user ? "Create Post" : "Login To Create Post"}
            onAction={() => (user ? navigate("/forum/create") : navigate("/login"))}
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="card">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  By {renderDisplayName(post.user, "Anonymous")} • {new Date(post.createdAt).toLocaleString()}
                </p>

                <p className="mt-3 text-sm leading-relaxed">{post.content}</p>

                <div className="mt-4 border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">Replies ({post.replies?.length || 0})</h4>

                  {(post.replies || []).length === 0 ? (
                    <p className="text-xs text-gray-500">No replies yet.</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {(post.replies || []).map((reply) => (
                        <div key={reply._id} className="rounded-sm border bg-gray-50 px-3 py-2">
                          <p className="text-sm">{reply.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {renderDisplayName(reply.user)} • {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    className="input mb-3 min-h-20"
                    placeholder={user ? "Write a reply..." : "Login to reply"}
                    value={replyDrafts[post._id] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                    disabled={!user || replyingId === post._id}
                  />

                  <Button
                    onClick={() => replyToPost(post._id)}
                    disabled={!user}
                    loading={replyingId === post._id}
                    className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button type="button" variant="outline" disabled={page === 1 || loading} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                Previous
              </Button>

              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>

              <Button type="button" variant="outline" disabled={!pagination.hasNextPage || loading} onClick={() => setPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
