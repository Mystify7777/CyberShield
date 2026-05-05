import { getRegistrableDomain } from "./urlUtils.js";

const AGE_LOOKUP_TIMEOUT_MS = 5000;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const lookupDomainAgeDays = async (hostname) => {
  const lookupDomain = getRegistrableDomain(hostname);

  if (!lookupDomain || typeof fetch !== "function") {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AGE_LOOKUP_TIMEOUT_MS);

    try {
      const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(lookupDomain)}`, {
        signal: controller.signal,
        headers: {
          accept: "application/rdap+json, application/json"
        }
      });

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      const events = Array.isArray(payload?.events) ? payload.events : [];
      const registrationEvent = events.find((event) => {
        const action = String(event?.eventAction || "").toLowerCase();
        return action === "registration" || action === "registered" || action === "creation";
      });

      const eventDate = registrationEvent?.eventDate ? new Date(registrationEvent.eventDate) : null;

      if (!eventDate || Number.isNaN(eventDate.getTime())) {
        return null;
      }

      return Math.max(0, Math.floor((Date.now() - eventDate.getTime()) / MS_PER_DAY));
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
};
