import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({ alias: "", bio: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setError("");
      setLoading(true);
      const { data: payload } = await API.get("/users/profile");
      setData(payload);
      setProfileForm({
        alias: payload.user.alias || "",
        bio: payload.user.bio || ""
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load profile");
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    setSavingProfile(true);
    try {
      const { data: payload } = await API.put("/users/profile", {
        alias: profileForm.alias,
        bio: profileForm.bio
      });

      setData((prev) => ({ ...prev, user: payload.user }));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Fill both password fields");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setSavingPassword(true);
    try {
      await API.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Password updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <PageState
            variant="loading"
            title="Loading profile"
            description="Fetching your stats, badges, and account settings."
          />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <PageState
            variant="error"
            title="Profile unavailable"
            description={error || "We could not load your profile data."}
            actionLabel="Try again"
            onAction={fetchProfile}
          />
        </div>
      </>
    );
  }

  const { user, stats } = data;
  const xp = Number(user.xp || 0);
  const level = Number(user.level || 1);
  const streak = Number(user.streak || 0);
  const progressPercent = Math.min(100, xp % 100);
  const badges = Array.isArray(user.badges) ? user.badges : [];

  return (
    <>
      <Navbar />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="card mb-6">
          <h2
            className="text-xl sm:text-2xl font-bold mb-1 wrap-break-word"
            title={user.alias ? `Username: ${user.name}` : undefined}
          >
            {user.alias || user.name}
          </h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-2">{user.bio || "No bio yet."}</p>
          <p className="text-sm text-gray-600 mt-2">🔥 Streak: {streak} day{streak === 1 ? "" : "s"}</p>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="font-semibold">Level {level}</h3>
            <p className="text-sm text-gray-600">XP: {xp}</p>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-sm">
            <div
              className="bg-indigo-500 h-2 rounded-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">{100 - progressPercent}% to next level</p>
        </div>

        <div className="card mb-6">
          <h3 className="font-semibold mb-2">Badges</h3>
          {badges.length === 0 ? (
            <p className="text-sm text-gray-500">No badges earned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <span key={`${badge.name}-${index}`} className="px-3 py-1 bg-yellow-400 rounded-sm text-sm">
                  {badge.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-sm text-gray-500">Reports</p>
            <h3 className="text-2xl font-bold">{stats.reports}</h3>
          </div>

          <div className="card text-center">
            <p className="text-sm text-gray-500">Articles</p>
            <h3 className="text-2xl font-bold">{stats.articles}</h3>
          </div>

          <div className="card text-center">
            <p className="text-sm text-gray-500">Forum Posts</p>
            <h3 className="text-2xl font-bold">{stats.posts}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <form className="card" onSubmit={updateProfile}>
            <h3 className="font-semibold mb-3">Profile Details</h3>

            <input
              className="input mb-3"
              placeholder="Alias"
              value={profileForm.alias}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, alias: e.target.value }))}
            />

            <textarea
              className="input mb-3 min-h-28"
              placeholder="Bio"
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
            />

            <Button type="submit" className="w-full sm:w-auto" loading={savingProfile}>
              Save Profile
            </Button>
          </form>

          <form className="card" onSubmit={changePassword}>
            <h3 className="font-semibold mb-3">Change Password</h3>

            <input
              type="password"
              className="input mb-3"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />

            <input
              type="password"
              className="input mb-3"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />

            <Button type="submit" className="w-full sm:w-auto" loading={savingPassword}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
