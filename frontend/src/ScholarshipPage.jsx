import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  FileUp,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Tag,
  MapPin,
  BookOpen,
  FileText,
  Rocket,
  AlertCircle,
} from "lucide-react";

function urgencyColor(deadline) {
  if (!deadline) return null;
  const days = Math.ceil(
    (new Date(deadline) - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "#fca5a5";
  if (days <= 7) return "#f97316";
  if (days <= 30) return "#fbbf24";
  return "#86efac";
}

export default function ScholarshipPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setNotFound(false);
    setScholarship(null);
    axios
      .get(`/api/scholarships/${id}`)
      .then((r) => setScholarship(r.data.scholarship))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function apply(e) {
    e.preventDefault();
    if (!file) {
      setStatus("Please attach a document");
      setStatusType("error");
      return;
    }
    const fd = new FormData();
    fd.append("documents", file);
    try {
      setStatus("Uploading your application…");
      setStatusType("loading");
      await axios.post(`/api/scholarships/${id}/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("🎉 Application submitted successfully!");
      setStatusType("success");
    } catch (err) {
      setStatus(err.response?.data?.message || "Apply failed");
      setStatusType("error");
    }
  }

  if (loading) {
    return (
      <div className="app-content page-loading-state">
        <span className="spinner" />
        <p className="muted">Loading scholarship details…</p>
      </div>
    );
  }

  if (notFound || !scholarship) {
    return (
      <div className="app-content">
        <div className="panel empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Scholarship not found</h3>
          <p>It may have been removed, or the link is incorrect.</p>
          <button
            className="primary"
            onClick={() => navigate("/")}
            style={{ marginTop: "12px" }}
          >
            <ArrowLeft size={15} /> Back to scholarships
          </button>
        </div>
      </div>
    );
  }

  const deadlineColor = urgencyColor(scholarship.deadline);
  const isExpired = scholarship.status === "expired";

  return (
    <motion.main
      className="app-content scholarship-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="detail-panel scholarship-detail-page">
        <div className="detail-header">
          <div
            style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
          >
            <div
              className="card-icon-badge"
              style={{
                width: 56,
                height: 56,
                fontSize: "28px",
                borderRadius: "16px",
              }}
            >
              🏫
            </div>
            <div>
              <p className="eyebrow">
                <Tag size={12} /> Scholarship Details
              </p>
              <h1
                style={{
                  margin: "4px 0 8px",
                  fontSize: "1.8rem",
                  lineHeight: 1.2,
                }}
              >
                {scholarship.title}
              </h1>
              <p
                style={{
                  color: "var(--muted)",
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                {scholarship.description}
              </p>
            </div>
          </div>

          <div className="detail-meta">
            <span
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                justifyContent: "flex-end",
              }}
            >
              <MapPin size={12} /> {scholarship.provider}
            </span>
            <div className="amount-badge">
              <IndianRupee size={18} />
              <span>{scholarship.amount || "Funding available"}</span>
            </div>
          </div>
        </div>

        <div
          className="meta-row wrap"
          style={{ marginTop: "20px", gap: "16px" }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: deadlineColor || "var(--muted)",
            }}
          >
            <Calendar size={14} />
            Deadline:{" "}
            {scholarship.deadline
              ? new Date(scholarship.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Open"}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--muted)",
            }}
          >
            <FileText size={14} />
            Status:{" "}
            <span
              className={`pill status-${scholarship.status}`}
              style={{ marginLeft: "4px" }}
            >
              {scholarship.status}
            </span>
          </span>
        </div>

        <div className="chips-row">
          {(scholarship.states || []).map((item) => (
            <span key={item} className="pill">
              <MapPin size={10} /> {item}
            </span>
          ))}
          {(scholarship.courses || []).map((item) => (
            <span key={item} className="pill">
              <BookOpen size={10} /> {item}
            </span>
          ))}
          {(scholarship.categories || []).map((item) => (
            <span key={item} className="pill">
              {item}
            </span>
          ))}
          {(scholarship.requiredDocuments || []).map((item) => (
            <span key={item} className="pill">
              <FileText size={10} /> {item}
            </span>
          ))}
        </div>

        {scholarship.applicationLink && (
          <a
            className="primary-link"
            href={scholarship.applicationLink}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} /> Open official application
          </a>
        )}

        {isExpired ? (
          <div className="status-msg error" style={{ marginTop: "16px" }}>
            <AlertCircle size={16} /> This scholarship is no longer accepting
            applications.
          </div>
        ) : (
          <div style={{ marginTop: "24px" }}>
            <h4
              style={{
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileUp size={16} color="var(--accent)" /> Submit Your Application
            </h4>

            <form onSubmit={apply}>
              <label
                className={`upload-zone ${dragging ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  setFile(e.dataTransfer.files[0]);
                }}
              >
                <FileUp size={36} className="upload-zone-icon" />
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  {file ? `📄 ${file.name}` : "Drag & drop or click to upload"}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "13px" }}>
                  PDF or image files accepted
                </div>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </label>

              <div style={{ marginTop: "12px" }}>
                <button
                  className="primary btn-rocket"
                  type="submit"
                  disabled={statusType === "loading"}
                  style={{ fontSize: "15px", padding: "12px 24px" }}
                >
                  {statusType === "loading" ? (
                    <>
                      <span className="spinner" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Rocket size={16} /> Apply Now
                    </>
                  )}
                </button>
              </div>
            </form>

            {status && (
              <div className={`status-msg ${statusType}`}>
                {statusType === "success" && <CheckCircle2 size={16} />}
                {statusType === "error" && <XCircle size={16} />}
                {statusType === "loading" && <span className="spinner" />}
                {status}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.main>
  );
}
