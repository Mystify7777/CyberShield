import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { getAiServiceBaseUrl, getApiBaseUrl } from "./utils/runtimeConfig";

const warmUrl = async (url) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal
    });
  } catch {
    // Silent warm-up: failures should not block the app shell.
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export default function App() {
  const [isWarming, setIsWarming] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      warmUrl(`${getApiBaseUrl()}/system/health`),
      warmUrl(getAiServiceBaseUrl())
    ]).finally(() => {
      if (isMounted) {
        setIsWarming(false);
      }
    });

    const fallbackTimer = window.setTimeout(() => {
      if (isMounted) {
        setIsWarming(false);
      }
    }, 15000);

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      {isWarming && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 px-6 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-8 text-center text-white shadow-2xl shadow-slate-950/40">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-white/25 border-t-white animate-spin" />
            <p className="text-lg font-semibold">Waking up CyberShield</p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Preparing the backend in the background so the app feels ready when you start using it.
            </p>
          </div>
        </div>
      )}
      <div className={isWarming ? "pointer-events-none select-none opacity-70 blur-[1px]" : ""}>
        <AppRoutes />
      </div>
    </ErrorBoundary>
  );
}
