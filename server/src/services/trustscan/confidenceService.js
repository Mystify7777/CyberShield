export const getTrustScanConfidence = ({ ssl, headers, domain, reputation }) => {
  const sources = [ssl, headers, domain, reputation].filter(Boolean);
  const degradedSources = sources.filter((signal) => signal.reason && signal.reason !== "success").length;

  if (sources.length === 4 && degradedSources === 0) {
    return "High";
  }

  if (degradedSources <= 1 && sources.length >= 3) {
    return "Medium";
  }

  return "Low";
};
