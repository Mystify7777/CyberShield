import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  BookOpenText,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import FeatureCard from "../../components/ui/FeatureCard";

const coreFeatureCards = [
  {
    icon: Bot,
    title: "AI Scam Detection",
    description: "Classify suspicious text as SAFE, SUSPICIOUS, or MALICIOUS with confidence signals.",
    href: "/ai",
  },
  {
    icon: ShieldAlert,
    title: "Incident Reporting",
    description: "Submit evidence-backed reports and track moderation updates from your dashboard.",
    href: "/create-report",
  },
  {
    icon: BookOpenText,
    title: "Knowledge Hub",
    description: "Learn practical prevention patterns with curated cybersecurity guides.",
    href: "/articles",
  },
];

const supportingCards = [
  {
    icon: CheckCircle2,
    title: "Learning Loop",
    description: "After detection, jump to recommended reads and prevention checklists.",
    href: "/articles",
  },
  {
    icon: AlertTriangle,
    title: "Community Tools",
    description: "Forum, videos, memes, and mini-games stay available under Community.",
    href: "/forum",
  },
  {
    icon: ShieldAlert,
    title: "Operational Safety",
    description: "OTP verification, moderated workflows, and secure evidence handling.",
    href: "/admin",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [quickMessage, setQuickMessage] = useState("");

  const startAnalysis = () => {
    const query = quickMessage.trim();
    navigate(query ? `/ai?q=${encodeURIComponent(query)}` : "/ai");
  };

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-linear-to-br from-white via-blue-50 to-blue-200 px-6 py-20 md:py-28">
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl animate-float" style={{ animationDelay: "1.2s" }} />

        <div className="relative container-page grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-up">
            <p className="uppercase tracking-[0.24em] text-blue-700 text-xs mb-4 font-semibold">
              Trust Intelligence First
            </p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-slate-900 mb-5">
              Analyze websites instantly with TrustScan.
            </h1>
            <p className="text-slate-700 md:text-lg leading-relaxed max-w-2xl">
              Real TLS, DNS, security header, and reputation intelligence in seconds. CyberShield helps you verify
              suspicious messages, understand risk signals, and take immediate action with structured reporting.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm text-blue-800">
              {[
                "Main loop: Detect -> Explain -> Report",
                "Evidence-backed reporting",
                "Actionable security guidance",
              ].map((signal) => (
                <span key={signal} className="rounded-full border border-blue-200 bg-white/80 px-3 py-1 font-medium text-blue-800">
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-8 max-w-2xl animate-fade-up" style={{ animationDelay: "120ms" }}>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 mb-2">
                Quick Check
              </label>
              <textarea
                value={quickMessage}
                onChange={(event) => setQuickMessage(event.target.value)}
                rows={3}
                className="input bg-white/90"
                placeholder="Paste suspicious message, email text, or URL to analyze"
              />

              <div className="mt-3 flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={startAnalysis}>
                  Analyze Suspicious Message
                </button>
                <button className="btn btn-secondary" onClick={() => navigate("/create-report")}>
                  Report Incident
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 animate-fade-in" style={{ animationDelay: "180ms" }}>
            <div className="rounded-2xl border border-blue-100 bg-white/90 shadow-xs p-5 animate-fade-up" style={{ animationDelay: "220ms" }}>
              <p className="text-xs uppercase tracking-wide text-blue-600 mb-1">Step 1</p>
              <h3 className="font-bold text-slate-900">Analyze Suspicious Text</h3>
              <p className="text-sm text-slate-600 mt-1">
                Paste a suspicious message into AI Detector to get a threat label and confidence.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white/90 shadow-xs p-5 animate-fade-up" style={{ animationDelay: "320ms" }}>
              <p className="text-xs uppercase tracking-wide text-blue-600 mb-1">Step 2</p>
              <h3 className="font-bold text-slate-900">Review Action Guidance</h3>
              <p className="text-sm text-slate-600 mt-1">
                Use result guidance to avoid risky actions and capture relevant evidence.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white/90 shadow-xs p-5 animate-fade-up" style={{ animationDelay: "420ms" }}>
              <p className="text-xs uppercase tracking-wide text-blue-600 mb-1">Step 3</p>
              <h3 className="font-bold text-slate-900">Report and Track</h3>
              <p className="text-sm text-slate-600 mt-1">
                Submit incidents and follow report status from your account dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Main Product Loop</p>
          <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
            {[
              "1. Detect potential scam",
              "2. Understand risk signals",
              "3. Report and track response",
            ].map((step) => (
              <div key={step} className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 font-medium text-slate-800">
                {step}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => navigate("/ai")}>
              Start Detection
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/create-report")}>
              Go To Reporting
            </button>
          </div>
        </div>
      </section>

      <section className="container-page py-2 pb-12">
        <div className="rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 to-cyan-50 p-6 md:p-8 shadow-xs">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-700 font-semibold">Trust Intelligence</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-900">Analyze websites instantly with TrustScan</h2>
          <p className="mt-2 text-slate-700 max-w-3xl">
            Run an instant website risk assessment with TLS checks, explainable scoring, public reputation data, and a scan report you can act on.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Instantly assess trust signals, HTTPS posture, and website security hygiene.
          </p>
          <div className="mt-5">
            <button className="btn btn-primary" onClick={() => navigate("/trustscan")}>
              Open TrustScan
            </button>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-3">Core Systems</h2>
        <p className="text-center text-slate-600 max-w-2xl mx-auto mb-10">
          CyberShield focuses on three primary value pillars.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {coreFeatureCards.map((item, index) => (
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
          <h2 className="text-3xl font-black text-center text-slate-900 mb-10">Supporting Systems</h2>

          <div className="grid md:grid-cols-3 gap-5">
            {supportingCards.map((feature, index) => (
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
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Explore Community Modules</h2>
          <p className="text-slate-600 mb-4 text-sm">
            Forum, videos, memes, and games are available under the Community section once you complete the core loop.
          </p>

          <div className="grid md:grid-cols-4 gap-3 text-sm">
            {[
              { label: "Forum", href: "/forum" },
              { label: "Video Hub", href: "/videos" },
              { label: "Meme Hub", href: "/memes" },
              { label: "Phishing Game", href: "/games" },
            ].map((item) => (
              <button
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                onClick={() => navigate(item.href)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => navigate("/articles")}>Open Knowledge Hub</button>
            <button className="btn btn-secondary" onClick={() => navigate("/forum")}>Open Forum</button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-14 text-center">
        <div className="container-page">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Start With Detection, Then Take Action</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Use the AI checker first, then report incidents with confidence and follow recommended mitigation steps.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn btn-primary" onClick={() => navigate("/ai")}>
              Analyze Suspicious Message
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/create-report")}>
              File A Report
            </button>
            <button className="inline-flex items-center gap-2 px-1 py-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors" onClick={() => navigate("/articles")}>
              Read Security Guides
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
