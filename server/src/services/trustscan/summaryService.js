export const buildTrustScanSummary = ({ ssl, headers, domain, reputation }) => {
  const safeSsl = ssl || {};
  const safeHeaders = headers || {};
  const safeDomain = domain || {};
  const safeReputation = reputation || {};
  const missingHeaders = Array.isArray(safeHeaders.missing) ? safeHeaders.missing : [];

  const tlsClause = safeSsl.valid
    ? `valid TLS from ${safeSsl.issuer || "unknown issuer"}`
    : `TLS validation failed (${safeSsl.error || "invalid or expired certificate"})`;

  const headerClause = missingHeaders.length === 0
    ? "strong browser protection controls"
    : `${missingHeaders.slice(0, 3).join(", ")} browser protections missing`;

  let domainClause = "domain intelligence is inconclusive";

  if (!safeDomain.resolves) {
    domainClause = "the domain fails DNS resolution";
  } else if (typeof safeDomain.ageDays === "number" && safeDomain.ageDays < 30) {
    domainClause = `a newly registered domain (${safeDomain.ageDays} days old)`;
  } else if (typeof safeDomain.ageDays === "number" && safeDomain.ageDays < 180) {
    domainClause = `a relatively new domain (${safeDomain.ageDays} days old)`;
  } else if (typeof safeDomain.ageDays === "number") {
    domainClause = `an established domain (${safeDomain.ageDays} days old)`;
  } else {
    domainClause = "partial domain intelligence coverage";
  }

  let reputationClause = "public reputation feeds were unavailable";

  if (safeReputation.listed) {
    reputationClause = `${safeReputation.source || "Reputation feed"} flagged this target`;
  } else if (safeReputation.grade === "Clean") {
    reputationClause = `${safeReputation.source || "Reputation feed"} found no known public listings`;
  }

  return `Site has ${tlsClause}, ${headerClause}, ${domainClause}, and ${reputationClause}.`;
};
