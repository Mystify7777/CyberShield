import toast from "react-hot-toast";
import API from "../../services/api";
import { syncUserCoins } from "../../utils/economySync";
import { getAssetUrl } from "../../utils/getAssetUrl";

export default function MemeCard({ meme, refresh }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id;
  const hasUpvoted = Boolean(userId && meme.upvotes?.some((id) => String(id) === String(userId)));
  const hasDownvoted = Boolean(userId && meme.downvotes?.some((id) => String(id) === String(userId)));

  const vote = async (type) => {
    if (!user) {
      toast.error("Login required to vote");
      return;
    }

    try {
      await API.post(`/memes/${meme._id}/vote`, { type });
      await syncUserCoins();
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="card">
      <img
        src={getAssetUrl(meme.image)}
        alt={meme.caption || "Meme"}
        className="rounded-sm mb-3 w-full h-64 object-cover"
      />

      <p className="font-medium wrap-break-word">{meme.caption}</p>
      <p className="text-sm text-gray-500 mt-1">{meme.category}</p>
      {Number(meme.upvotes?.length || 0) > 10 && (
        <span className="inline-block text-yellow-600 text-sm font-semibold mt-1">🔥 Trending</span>
      )}
      {meme.createdBy && (
        <p className="text-xs text-gray-400 mt-1">
          By {meme.createdBy.alias || meme.createdBy.name || "Community Member"}
        </p>
      )}
      <p className="text-xs text-green-600 mt-1">+XP for engagement</p>

      {meme.votingEnabled ? (
        <div className="flex gap-3 mt-3">
          <button
            className={`btn ${hasUpvoted ? "bg-green-100 text-green-700 border border-green-300" : ""}`}
            onClick={() => vote("up")}
            title={hasUpvoted ? "You upvoted this" : "Upvote"}
          >
            👍 {meme.upvotes?.length || 0}
          </button>
          <button
            className={`btn ${hasDownvoted ? "bg-red-100 text-red-700 border border-red-300" : ""}`}
            onClick={() => vote("down")}
            title={hasDownvoted ? "You downvoted this" : "Downvote"}
          >
            👎 {meme.downvotes?.length || 0}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-2">Voting is disabled for this meme.</p>
      )}
    </div>
  );
}