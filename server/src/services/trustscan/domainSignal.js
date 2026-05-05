import { promises as dns } from "dns";
import { withTimeout } from "./networkUtils.js";
import { lookupDomainAgeDays } from "./rdapService.js";
import { getRegistrableDomain, normalizeTarget } from "./urlUtils.js";

const DNS_TIMEOUT_MS = 3500;
const NX_DOMAIN_ERROR_CODES = new Set(["ENOTFOUND", "ENODATA", "EAI_NONAME"]);

const safePrimaryLookup = async (hostname) => {
  try {
    const result = await withTimeout(dns.lookup(hostname, { all: true }), DNS_TIMEOUT_MS);
    const addresses = Array.isArray(result) ? result : result ? [result] : [];

    return {
      resolves: addresses.length > 0,
      addresses,
      errorType: null,
      errorCode: null
    };
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const errorCode = typeof error?.code === "string" ? error.code : null;
    const isTimeout = message.includes("timed out") || errorCode === "EAI_AGAIN";

    return {
      resolves: false,
      addresses: [],
      errorType: isTimeout ? "resolver_unavailable" : "lookup_error",
      errorCode
    };
  }
};

const safeDnsLookup = async (lookupPromise) => {
  try {
    const records = await withTimeout(lookupPromise, DNS_TIMEOUT_MS);
    return {
      records: Array.isArray(records) ? records : [],
      errorType: null,
      errorCode: null
    };
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const isTimeout = message.includes("timed out");

    return {
      records: [],
      errorType: isTimeout ? "timeout" : "lookup_error",
      errorCode: typeof error?.code === "string" ? error.code : null
    };
  }
};

const getDnsRecords = async (hostname) => {
  const lookupDomain = getRegistrableDomain(hostname) || hostname;

  const [lookupResult, mxResult, nsResult, ageDays] = await Promise.all([
    safePrimaryLookup(hostname),
    safeDnsLookup(dns.resolveMx(lookupDomain)),
    safeDnsLookup(dns.resolveNs(lookupDomain)),
    lookupDomainAgeDays(lookupDomain)
  ]);

  const lookupAddresses = lookupResult.addresses;
  const mxRecords = mxResult.records;
  const nsRecords = nsResult.records;
  const resolves = lookupResult.resolves;

  const isNxDomain = !resolves && NX_DOMAIN_ERROR_CODES.has(lookupResult.errorCode);
  const hasEnvironmentDnsIssue = !resolves && Boolean(lookupResult.errorType) && !isNxDomain;

  return {
    lookupDomain,
    resolves,
    mx: mxRecords.length > 0,
    ageDays,
    nameservers: nsRecords.length,
    isNxDomain,
    hasEnvironmentDnsIssue,
    lookupAddresses,
    mxRecords,
    nsRecords
  };
};

export const checkDomainSignals = async (rawUrl) => {
  try {
    const { hostname } = normalizeTarget(rawUrl);
    const records = await getDnsRecords(hostname);

    let scoreDelta = 0;

    if (records.resolves) {
      scoreDelta += 5;
    }

    if (records.isNxDomain) {
      scoreDelta -= 40;
    }

    if (!records.hasEnvironmentDnsIssue && typeof records.ageDays === "number") {
      if (records.ageDays < 30) {
        scoreDelta -= 20;
      } else if (records.ageDays >= 730) {
        scoreDelta += 10;
      }
    }

    if (records.hasEnvironmentDnsIssue) {
      scoreDelta = 0;
    }

    scoreDelta = Math.max(-40, Math.min(20, scoreDelta));

    let grade = "Neutral";
    if (records.isNxDomain) {
      grade = "Broken";
    } else if (typeof records.ageDays === "number" && records.ageDays < 30) {
      grade = "Suspicious";
    } else if (scoreDelta <= -20) {
      grade = "Suspicious";
    } else if (scoreDelta >= 10) {
      grade = "Strong";
    } else if (scoreDelta >= 5) {
      grade = "Fair";
    } else if (!records.resolves && records.hasEnvironmentDnsIssue) {
      grade = "Neutral";
    } else {
      grade = "Fair";
    }

    return {
      resolves: records.resolves,
      mx: records.mx,
      ageDays: records.ageDays,
      nameservers: records.nameservers,
      scoreDelta,
      grade,
      checkedDomain: records.lookupDomain.toLowerCase(),
      records: {
        lookup: records.lookupAddresses,
        mx: records.mxRecords,
        ns: records.nsRecords
      },
      reason: records.hasEnvironmentDnsIssue
        ? "environment_dns_unavailable"
        : records.isNxDomain
          ? "nxdomain"
          : "success"
    };
  } catch (error) {
    return {
      resolves: false,
      mx: false,
      ageDays: null,
      nameservers: 0,
      scoreDelta: -55,
      grade: "Broken",
      checkedDomain: null,
      error: error.message || "Domain signal check failed",
      reason: "network_error"
    };
  }
};
