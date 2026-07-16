import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import { sanitizeObject } from "../../utils/sanitizer";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const sanitized = sanitizeObject(form);
      const { data } = await API.post("/auth/login", sanitized);

      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Login successful");

      // Redirect based on role
      if (["ADMIN", "SUPER_ADMIN"].includes(data.role)) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="card w-80"
      >
        <h2 className="text-xl mb-4 font-semibold">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input mb-3"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input mb-3"
          onChange={handleChange}
        />

        <button className="btn btn-primary w-full">
          {loading ? "Processing..." : "Login"}
        </button>

        <p className="mt-3 text-sm text-right">
          <Link to="/forgot-password" className="text-blue-500">
            Forgot password?
          </Link>
        </p>

        <p className="mt-3 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
