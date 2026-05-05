import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminNavbar from "../../components/layout/AdminNavbar";
import API from "../../services/api";

const API_HOST = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function MemeModeration() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const fetchFlagged = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/memes/admin/flagged");
      setMemes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load flagged memes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const update = async (id, payload) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await API.put(`/memes/${id}`, payload);
      toast.success("Meme updated");
      fetchFlagged();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update meme");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Flagged Meme Moderation</h2>

        {loading ? (
          <p>Loading...</p>
        ) : memes.length === 0 ? (
          <div className="card text-gray-500">No flagged memes.</div>
        ) : (
          <div className="space-y-4">
            {memes.map((meme) => (
              <div key={meme._id} className="card">
                <img
                  src={`${API_HOST}${meme.image}`}
                  alt={meme.caption || "Flagged meme"}
                  className="w-full h-72 object-cover rounded-sm mb-3"
                />

                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-1 rounded-sm text-xs font-semibold bg-red-100 text-red-700">
                    FLAGGED
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(meme.updatedAt).toLocaleString()}
                  </span>
                </div>

                <p className="font-medium wrap-break-word">{meme.caption}</p>
                <p className="text-sm text-gray-500 mt-1">{meme.category}</p>
                {meme.createdBy && (
                  <p className="text-xs text-gray-400 mt-1">
                    By {meme.createdBy.alias || meme.createdBy.name || meme.createdBy.email}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Upvotes: {meme.upvotes?.length || 0} | Downvotes: {meme.downvotes?.length || 0}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="btn btn-primary"
                    disabled={processing[meme._id]}
                    onClick={() => update(meme._id, { status: "VISIBLE" })}
                  >
                    {processing[meme._id] ? "Processing..." : "Approve"}
                  </button>

                  <button
                    className="btn btn-danger"
                    disabled={processing[meme._id]}
                    onClick={() => update(meme._id, { status: "REMOVED" })}
                  >
                    {processing[meme._id] ? "Processing..." : "Remove"}
                  </button>

                  <button
                    className="btn"
                    disabled={processing[meme._id]}
                    onClick={() => update(meme._id, { votingEnabled: !meme.votingEnabled })}
                  >
                    {meme.votingEnabled ? "Disable Voting" : "Enable Voting"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}