import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import API from "../../services/api";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";

const toEmbedUrl = (url) => {
  if (!url) return "";

  // YouTube watch links -> embed
  if (url.includes("youtube.com/watch")) {
    const params = new URL(url).searchParams;
    const id = params.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  // youtu.be links -> embed
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  return url;
};

export default function VideoHub() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await API.get("/videos");
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      setVideos([]);
      setError(error.response?.data?.message || "Failed to load videos");
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold">Video Hub</h2>
            <p className="text-sm text-gray-500">Short-form awareness content approved by moderators</p>
          </div>
          <Button
            type="button"
            onClick={() => navigate(user ? "/videos/submit" : "/login")}
          >
            {user ? "Submit Video" : "Login to Submit"}
          </Button>
        </div>

        {loading ? (
          <PageState
            variant="loading"
            title="Loading videos"
            description="Fetching approved awareness clips from the moderation queue."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Video feed unavailable"
            description={error}
            actionLabel="Try again"
            onAction={fetchVideos}
          />
        ) : videos.length === 0 ? (
          <PageState
            variant="empty"
            title="No approved videos yet"
            description="Once moderators approve submissions, they will appear here."
            actionLabel={user ? "Submit Video" : "Login to Submit"}
            onAction={() => navigate(user ? "/videos/submit" : "/login")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {videos.map((video) => (
              <div key={video._id} className="card">
                <h3 className="font-semibold mb-2 wrap-break-word">{video.title}</h3>

                <iframe
                  className="w-full h-56 rounded-sm"
                  src={toEmbedUrl(video.url)}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                <p className="text-sm text-gray-500 mt-2">{video.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
