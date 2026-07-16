import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import { sanitizeObject } from "../../utils/sanitizer";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const checkStrength = (password) => {
  if (password.length < 6) return "Weak";

  let score = 0;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 2) return "Strong";
  return "Medium";
};

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error("All fields are required");
      return;
    }

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
      await API.post("/auth/register", sanitized);

      localStorage.setItem("tempEmail", sanitized.email);
      toast.success("OTP sent to your email");

      navigate("/verify");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form className="card w-80" onSubmit={handleSubmit}>
        <h2 className="text-xl mb-4 font-semibold">Register</h2>

        <input
          name="name"
          placeholder="Name"
          className="input mb-3"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          className="input mb-3"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input mb-3"
          onChange={handleChange}
        />

        <p className="text-xs text-gray-600 mb-3">
          Password Strength: {checkStrength(form.password)}
        </p>

        <button className="btn btn-primary w-full">
          {loading ? "Processing..." : "Register"}
        </button>

        <p className="mt-3 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
