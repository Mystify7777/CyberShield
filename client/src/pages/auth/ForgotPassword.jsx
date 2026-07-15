import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import { sanitizeObject } from "../../utils/sanitizer";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const requestToken = async () => {
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoadingRequest(true);
    try {
      await API.post("/auth/forgot-password", sanitizeObject({ email: trimmedEmail }));
      toast.success("If the account exists, reset instructions were sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset token");
    } finally {
      setLoadingRequest(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedToken = token.trim();

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!trimmedToken) {
      toast.error("Reset token is required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoadingReset(true);
    try {
      await API.post(
        "/auth/reset-password",
        sanitizeObject({
          email: trimmedEmail,
          token: trimmedToken,
          newPassword
        })
      );
      toast.success("Password reset successful. You can now log in.");
      setToken("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not reset password");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={submitReset} className="card w-96">
        <h2 className="text-xl mb-2 font-semibold">Forgot Password</h2>
        <p className="text-xs text-gray-500 mb-4">
          Request a reset token, then paste it here with your new password.
        </p>

        <input
          type="email"
          placeholder="Email"
          className="input mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="button"
          className="btn w-full mb-3"
          onClick={requestToken}
          disabled={loadingRequest}
        >
          {loadingRequest ? "Sending..." : "Send Reset Token"}
        </button>

        <input
          type="text"
          placeholder="Reset token from email"
          className="input mb-3"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <input
          type="password"
          placeholder="New password"
          className="input mb-3"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button className="btn btn-primary w-full" disabled={loadingReset}>
          {loadingReset ? "Updating..." : "Reset Password"}
        </button>

        <p className="mt-3 text-sm">
          Back to{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
