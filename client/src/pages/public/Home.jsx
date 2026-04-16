import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Bot,
  BookOpenText,
  MessagesSquare,
  Lock,
  UserCog,
  Search,
  UserPlus,
  FileText,
  Eye,
  MessageSquare,
} from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import FeatureCard from "../../components/ui/FeatureCard";

const howToUseCards = [
  {
    icon: Search,
    title: "1. Explore Public Modules",
    description: "Open AI Detector and Knowledge Hub to identify suspicious wording, fake urgency, and spoofed links.",
    href: "/ai",
  },
  {
    icon: UserPlus,
    title: "2. Secure Your Account",
    description: "Register, complete OTP email verification, and activate protected reporting with account-linked history.",
    href: "/register",
  },
  {
    icon: FileText,
    title: "3. Take Action",
    description: "File incidents with evidence, follow status updates, and help strengthen shared threat awareness.",
    href: "/create-report",
  },
];

const platformFeatures = [
  {
    icon: ShieldAlert,
    title: "Incident Reporting",
    description: "Report phishing, scam, fraud, or harassment events with optional anonymity and evidence uploads.",
    href: "/create-report",
  },
  {
    icon: Bot,
    title: "AI Threat Detection",
    description: "Analyze suspicious text and messages with fast SAFE/SUSPICIOUS/MALICIOUS threat classification.",
    href: "/ai",
  },
  {
    icon: BookOpenText,
    title: "Knowledge Hub",
    description: "Read vetted cybersecurity guidance on phishing, account safety, and secure digital habits.",
    href: "/articles",
  },
  {
    icon: MessagesSquare,
    title: "Community Forum Access",
    description: "Join moderated discussions, ask incident-response questions, and share prevention strategies.",
    href: "/forum",
  },
  {
    icon: Lock,
    title: "Privacy-first Handling",
    description: "Sensitive reports are protected with encryption-backed storage and admin-only handling workflows.",
    href: "/reports",
  },
  {
    icon: UserCog,
    title: "Admin Moderation",
    description: "Active moderation and role controls keep the platform trustworthy, safe, and abuse-resistant.",
    href: "/admin",
  },
];

const forumAccessCards = [
  {
    icon: UserPlus,
    title: "1. Register + Verify OTP",
    description: "Create account and verify your email to unlock community access.",
    href: "/register",
  },
  {
    icon: Eye,
    title: "2. Visit Forum",
    description: "Open /forum from navbar or dashboard to read all posts publicly.",
    href: "/forum",
  },
  {
    icon: MessageSquare,
    title: "3. Post and Reply",
    description: "Login is required for creating posts and replies, while reading remains public.",
    href: "/login",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [quickCheckText, setQuickCheckText] = useState("");

  const handleQuickAnalyze = () => {
    const trimmed = quickCheckText.trim();
    if (!trimmed) {
      navigate("/ai");
      return;
    }

    navigate(`/ai?text=${encodeURIComponent(trimmed)}`);
  };

  return (
    <PublicLayout>
      <section className="bg-[#dbe6f5] py-14 sm:py-16 lg:py-20">
        <div className="container-page grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              AI-Powered Threat Reporting
            </p>
            <h1 className="mb-4 text-5xl font-black leading-[0.95] tracking-tight text-slate-900 sm:text-6xl">
              Detect Scams
              <br />
              Early. Report
              <br />
              Incidents Fast.
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-slate-600">
              CyberShield helps you verify suspicious messages, understand risk signals, and take immediate action with structured incident reporting and practical awareness guidance.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {[
                "Main loop: Detect -> Explain -> Report",
                "Evidence-backed reporting",
                "Actionable security guidance"
              ].map((signal) => (
                <span key={signal} className="rounded-full border border-blue-300 bg-blue-50/60 px-3 py-1 font-semibold text-blue-700">
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Quick Check</p>
              <textarea
                className="h-24 w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste suspicious message, email text, or URL to analyze"
                value={quickCheckText}
                onChange={(event) => setQuickCheckText(event.target.value)}
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:scale-95" onClick={handleQuickAnalyze}>
                  Analyze Suspicious Message
                </button>
                <button className="rounded-xl bg-slate-700 px-5 py-3 text-lg font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 active:scale-95" onClick={() => navigate("/create-report")}>
                  Report Incident
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 pt-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="rounded-2xl border border-blue-200 bg-white/80 p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">Step 1</p>
              <h3 className="text-2xl font-bold text-slate-800">Analyze Suspicious Text</h3>
              <p className="mt-1 text-base leading-relaxed text-slate-600">
                Paste a suspicious message into AI Detector to get a threat label and confidence.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white/80 p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">Step 2</p>
              <h3 className="text-2xl font-bold text-slate-800">Review Action Guidance</h3>
              <p className="mt-1 text-base leading-relaxed text-slate-600">
                Use result guidance to avoid risky actions and capture relevant evidence.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white/80 p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">Step 3</p>
              <h3 className="text-2xl font-bold text-slate-800">Report and Track</h3>
              <p className="mt-1 text-base leading-relaxed text-slate-600">
                Submit incidents and follow report status from your account dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "OTP Verified Accounts", desc: "Email ownership checks" },
            { title: "AI Threat Triage", desc: "Quick SAFE/SUSPICIOUS/MALICIOUS" },
            { title: "Moderated Community", desc: "Abuse-resistant discussions" },
            { title: "Evidence Upload Support", desc: "Screenshots and URLs accepted" },
          ].map((item, index) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3 animate-fade-up"
              style={{ animationDelay: `${120 + index * 100}ms` }}
            >
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-3">How To Use CyberShield</h2>
        <p className="text-center text-slate-600 max-w-2xl mx-auto mb-10">
          Follow this simple flow to move from awareness to action in under 5 minutes.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {howToUseCards.map((item, index) => (
            <FeatureCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              href={item.href}
              delay={index * 90}
            />
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 px-6 py-14">
        <div className="container-page">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-10">Platform Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                delay={index * 90}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-2">How To Access The Community Forum</h2>
          <p className="text-slate-600 mb-4 text-sm">
            The forum is available at /forum with public viewing and authenticated posting for incident insights.
          </p>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {forumAccessCards.map((item, index) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                href={item.href}
                delay={index * 90}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => navigate("/register")}>Create Account</button>
            <button className="btn btn-secondary" onClick={() => navigate("/login")}>Login</button>
            <button className="btn btn-secondary" onClick={() => navigate("/forum")}>Open Forum</button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-14 text-center">
        <div className="container-page">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Start Protecting Yourself Today</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Take the first step now: analyze suspicious content instantly or activate your account for complete reporting and tracking.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn btn-primary" onClick={() => navigate("/ai")}>
              Try AI Detector
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Create Account
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/articles")}>
              Read Security Guides
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
