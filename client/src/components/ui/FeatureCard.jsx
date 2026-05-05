import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function FeatureCard({ icon: Icon, title, description, href, delay = 0 }) {
  return (
    <Link
      to={href}
      className="group block"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "relative h-full p-6 rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-500",
          "hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md",
          "animate-fade-in"
        )}
      >
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <div className="inline-flex p-3 rounded-xl bg-blue-100 text-blue-700 mb-4 transition-all duration-300 group-hover:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]">
            <Icon className="h-6 w-6" />
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-2 transition-colors group-hover:text-blue-700">
            {title}
          </h3>

          <p className="text-slate-600 mb-4 text-sm">
            {description}
          </p>

          <div className="flex items-center gap-2 text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}