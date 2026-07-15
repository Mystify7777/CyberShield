import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { AlertCircle, Shield, Mail, Image as ImageIcon, EyeOff, TriangleAlert } from "lucide-react";
import Button from "../../components/ui/Button";
import PageState from "../../components/ui/PageState";
import ReportFiltersToolbar from "../../components/reports/ReportFiltersToolbar";
import { getAssetUrl } from "../../utils/getAssetUrl";
import {
  getCategoryLabel,
  getSourceChannelLabel,
  getStatusLabel,
  getSubcategoryLabel,
  getSubcategoryOptions,
  REPORT_PUBLIC_STATUS_VALUES
} from "../../constants/reportTaxonomy";
import { useReportFilters } from "../../hooks/useReportFilters";

export default function ViewReports() {
  const navigate = useNavigate();
  const {
    filters,
    setFilter,
    clearFilters,
    activeChips,
    categoryOptions,
    severityOptions,
    sourceOptions,
    statusOptions,
    sortOptions
  } = useReportFilters({ defaultSort: "newest" });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false });
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthenticated = Boolean(user);
  const limit = 10;

  // Request lifecycle management: prevent stale responses from overwriting fresh results
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const debounceTimeoutRef = useRef(null);

  const fetchReports = useCallback(async (activeFilters, currentRequestId) => {
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setError("");
      setLoading(true);
      const endpoint = isAuthenticated ? "/reports/me" : "/reports";
      const requestParams = new URLSearchParams();
      const safePage = Number.isInteger(activeFilters?.page) && activeFilters.page > 0 ? activeFilters.page : 1;

      if (activeFilters?.q?.trim()) requestParams.set("q", activeFilters.q.trim());
      if (activeFilters?.category) requestParams.set("category", activeFilters.category);
      if (activeFilters?.subcategory) requestParams.set("subcategory", activeFilters.subcategory);
      if (activeFilters?.status) requestParams.set("status", activeFilters.status);
      if (activeFilters?.severity) requestParams.set("severity", activeFilters.severity);
      if (activeFilters?.source) requestParams.set("source", activeFilters.source);
      if (activeFilters?.sort) requestParams.set("sort", activeFilters.sort);
      requestParams.set("page", String(safePage));
      requestParams.set("limit", String(limit));

      const response = await API.get(`${endpoint}?${requestParams.toString()}`, {
        signal: abortController.signal
      });

      // Only update state if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const payload = response.data;
      const items = Array.isArray(payload) ? payload : (payload?.items || []);

      setReports(items);
      setPagination(Array.isArray(payload) ? {
        page: safePage,
        limit,
        total: items.length,
        totalPages: 1,
        hasNextPage: items.length === limit
      } : (payload?.pagination || { page: safePage, limit, total: 0, totalPages: 0, hasNextPage: false }));
    } catch (error) {
      // Ignore abort errors (they mean a newer request is in flight)
      if (error.name === "AbortError") {
        return;
      }

      // Only update error state if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      console.error(error);
      const safePage = Number.isInteger(activeFilters?.page) && activeFilters.page > 0 ? activeFilters.page : 1;
      setReports([]);
      setPagination({ page: safePage, limit, total: 0, totalPages: 0, hasNextPage: false });
      setError(error.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, limit]);

  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Increment request ID for this filter change
    const nextRequestId = ++requestIdRef.current;

    // Debounce the fetch by 250ms to coalesce rapid filter changes into one request
    debounceTimeoutRef.current = setTimeout(() => {
      fetchReports(filters, nextRequestId);
    }, 250);

    // Cleanup: cancel debounce on unmount or before next effect
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [fetchReports, filters]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "CRITICAL":
        return "bg-purple-100 text-purple-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUBMITTED":
      case "PENDING":
        return "bg-blue-500";
      case "UNDER_REVIEW":
      case "REVIEWED":
        return "bg-blue-500";
      case "INVESTIGATING":
        return "bg-orange-500";
      case "NEED_MORE_INFO":
        return "bg-amber-500";
      case "RESOLVED":
        return "bg-green-500";
      case "CLOSED":
        return "bg-slate-700";
      case "DISMISSED":
      case "FALSE_POSITIVE":
      case "DUPLICATE":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">My Reports</h2>
          <Button type="button" className="w-full sm:w-auto" onClick={() => navigate(user ? "/create-report" : "/login") }>
            {user ? "Create Report" : "Login to Create Report"}
          </Button>
        </div>

        <ReportFiltersToolbar
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          activeChips={activeChips}
          totalCount={pagination.total}
          visibleCount={reports.length}
          categoryOptions={categoryOptions}
          subcategoryOptions={filters.category ? getSubcategoryOptions(filters.category) : []}
          statusOptions={statusOptions.filter((option) => REPORT_PUBLIC_STATUS_VALUES.has(option.value))}
          severityOptions={severityOptions}
          sourceOptions={sourceOptions}
          sortOptions={sortOptions}
        />

        {loading ? (
          <PageState
            variant="loading"
            title="Loading reports"
            description="Fetching the latest incident reports and evidence."
          />
        ) : error ? (
          <PageState
            variant="error"
            title="Reports unavailable"
            description={error}
            actionLabel="Try again"
            onAction={() => fetchReports(filters)}
          />
        ) : reports.length === 0 ? (
          <PageState
            variant="empty"
            title={activeChips.length > 0 ? "No reports match current filters" : "No reports yet"}
            description={activeChips.length > 0 ? "Try adjusting or clearing the active filters." : "Create your first report to start tracking incidents."}
            actionLabel={activeChips.length > 0 ? "Clear Filters" : user ? "Create Report" : "Login to Create Report"}
            onAction={activeChips.length > 0 ? clearFilters : () => navigate(user ? "/create-report" : "/login")}
          />
        ) : (
          <>
            {reports.map((r) => (
              <div key={r._id} className="card mb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <h3 className="font-semibold text-lg flex-1">{r.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-white text-xs whitespace-nowrap self-start sm:ml-3 ${getStatusColor(
                    r.status
                  )}`}
                >
                  {getStatusLabel(r.status)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {r.isAnonymous && (
                  <span className="px-2 py-1 rounded-sm text-xs font-semibold bg-gray-100 text-gray-700 inline-flex items-center gap-1">
                    <EyeOff size={14} /> Anonymous
                  </span>
                )}
                {r.isSensitive && (
                  <span className="px-2 py-1 rounded-sm text-xs font-semibold bg-red-100 text-red-700 inline-flex items-center gap-1">
                    <TriangleAlert size={14} /> Sensitive
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">{r.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-gray-500" />
                  <span>Category: <strong>{getCategoryLabel(r.category)}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-gray-500" />
                  <span>Subcategory: <strong>{getSubcategoryLabel(r.subcategory || "SUSPICIOUS_OTHER")}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-gray-500" />
                  <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${getSeverityColor(r.severity)}`}>
                    {r.severity} Severity
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-gray-500" />
                  <span>Source: <strong>{getSourceChannelLabel(r.sourceChannel || "UNKNOWN")}</strong></span>
                </div>
                {r.contactEmail && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Mail size={16} className="text-gray-500" />
                    <span>Contact: <strong>{r.contactEmail}</strong></span>
                  </div>
                )}
              </div>

              {r.evidence && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon size={16} /> Evidence
                  </p>
                  {r.evidence.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={getAssetUrl(r.evidence)}
                      alt="Evidence"
                      className="w-full max-w-md rounded-sm border"
                    />
                  ) : (
                    <a
                      href={getAssetUrl(r.evidence)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Evidence Document
                    </a>
                  )}
                </div>
              )}

              {Array.isArray(r.history) && r.history.length > 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  <p className="font-semibold mb-1">Status History</p>
                  {r.history.map((h, idx) => (
                    <p key={`${r._id}-history-${idx}`}>
                      {h.status} - {new Date(h.date).toLocaleString()}
                    </p>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                {new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString()}
              </p>
              </div>
            ))}

            <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
              <Button variant="outline" onClick={() => setFilter("page", Math.max((pagination.page || filters.page) - 1, 1))} disabled={(pagination.page || filters.page) === 1 || loading}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {pagination.page || filters.page}</span>
              <Button variant="outline" onClick={() => setFilter("page", (pagination.page || filters.page) + 1)} disabled={!pagination.hasNextPage || loading}>
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
