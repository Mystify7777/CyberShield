import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-lg text-center bg-white shadow-sm rounded-2xl p-10">
        <p className="text-sm font-semibold text-slate-500 mb-2">ERROR 404</p>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Page Not Found</h1>
        <p className="text-slate-600 mb-6">
          The page you requested does not exist or was moved.
        </p>
        <Link to="/" className="btn btn-primary inline-block">
          Go To Home
        </Link>
      </div>
    </div>
  );
}
