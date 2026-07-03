import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ExternalLink,
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Bell,
  MessageCircle,
  Star,
  Users,
  TrendingUp,
  Search,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import AdminPanel from "./AdminPanel";
import Chat from "./Chat";
import EligibilityChecker from "./EligibilityChecker";
import Applications from "./Applications";
import NotificationsCenter from "./NotificationsCenter";
import AdminDashboard from "./AdminDashboard";
import AdminApplications from "./AdminApplications";
import Carousel from "./Carousel";
import { translations } from "./translations";

const slides = [
  {
    id: 1,
    content: "Get Registered → Verify → Get Paid",
    title: "ScholarBridge Workflow",
  },
  {
    id: 2,
    content: "Empowering students across India to excel.",
    title: "Our Mission",
  },
  {
    id: 3,
    content: "Join thousands of successful applicants.",
    title: "Join Today",
  },
];

const cardEmojis = ["🎓", "📚", "🏆", "💡", "🌟", "🎯", "📖", "🔬", "🎨", "⚽"];

function getEmoji(index) {
  return cardEmojis[index % cardEmojis.length];
}

function daysUntil(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - Date.now()) / (1000 * 60 * 60 * 24));
}

function urgencyMeta(deadline) {
  const days = daysUntil(deadline);
  if (days === null)
    return { label: "Open", color: "#86efac", bg: "rgba(134,239,172,0.12)" };
  if (days < 0)
    return { label: "Closed", color: "#fca5a5", bg: "rgba(252,165,165,0.12)" };
  if (days === 0)
    return {
      label: "Last day",
      color: "#fca5a5",
      bg: "rgba(252,165,165,0.12)",
    };
  if (days <= 7)
    return {
      label: `${days}d left`,
      color: "#f97316",
      bg: "rgba(249,115,22,0.12)",
    };
  if (days <= 30)
    return {
      label: `${days}d left`,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
    };
  return {
    label: `${days}d left`,
    color: "#86efac",
    bg: "rgba(134,239,172,0.12)",
  };
}

const navTabs = [
  { id: "overview", icon: <LayoutDashboard size={15} />, labelKey: "overview" },
  {
    id: "eligibility",
    icon: <CheckSquare size={15} />,
    labelKey: "eligibility",
  },
  {
    id: "applications",
    icon: <FileText size={15} />,
    labelKey: "applications",
  },
  { id: "notifications", icon: <Bell size={15} />, labelKey: "notifications" },
];

const quickFilters = [
  { id: "all", label: "All" },
  { id: "featured", label: "⭐ Featured" },
  { id: "closingSoon", label: "⏰ Closing Soon" },
];

export default function Scholarships({ user }) {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("/api/scholarships")
      .then((r) => setList(r.data.scholarships || []))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handler = () =>
      setLanguage(localStorage.getItem("language") || "English");
    window.addEventListener("languageChange", handler);
    return () => window.removeEventListener("languageChange", handler);
  }, []);

  const t = translations[language] || translations.English;
  const featuredCount = list.filter((s) => s.featured).length;

  const filteredList = useMemo(() => {
    let result = list;

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(q) ||
          (s.provider || "").toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q),
      );
    }

    if (activeFilter === "featured") {
      result = result.filter((s) => s.featured);
    } else if (activeFilter === "closingSoon") {
      result = result.filter((s) => {
        const days = daysUntil(s.deadline);
        return days !== null && days >= 0 && days <= 14;
      });
    }

    return result;
  }, [list, searchTerm, activeFilter]);

  return (
    <main className="app-content">
      {/* Hero Section */}
      <motion.section
        className="hero panel"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 450px" }}>
          <p className="eyebrow">
            <Sparkles size={14} style={{ verticalAlign: "middle" }} />{" "}
            {t.dashboard}
          </p>
          <h1
            style={{
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "2.4rem",
              fontWeight: 800,
              margin: "8px 0",
            }}
          >
            {t.findTrackWin}
          </h1>
          <p className="muted">
            {t.signedInAs} <strong>{user.name}</strong> ({user.email})
          </p>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab-btn ${activeView === tab.id ? "primary" : ""}`}
                onClick={() => setActiveView(tab.id)}
              >
                {tab.icon}
                {t[tab.labelKey] || tab.id}
              </button>
            ))}
            <button
              className={`nav-tab-btn ${showChat ? "primary" : ""}`}
              onClick={() => setShowChat((s) => !s)}
            >
              <MessageCircle size={15} />
              {showChat ? t.hideBharosa : t.openBharosa}
            </button>
          </div>
        </div>

        <div
          style={{
            flex: "0 0 320px",
            height: "160px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          <img
            src="/banner.png"
            alt="ScholarBridge Portal Banner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </motion.section>

      <motion.div
        style={{ marginBottom: "20px" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Carousel
          slide={slides[slideIndex]}
          slideIndex={slideIndex}
          totalSlides={slides.length}
        />
      </motion.div>

      {activeView === "overview" && !isLoading && list.length > 0 && (
        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: "20px" }}
        >
          <div className="stat-card">
            <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🎓</div>
            <div className="stat-number">{list.length}</div>
            <div className="stat-label">
              <GraduationCap size={13} /> Total Scholarships
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "2rem", marginBottom: "6px" }}>⭐</div>
            <div className="stat-number">{featuredCount}</div>
            <div className="stat-label">
              <Star size={13} /> Featured
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🏆</div>
            <div className="stat-number">10K+</div>
            <div className="stat-label">
              <Users size={13} /> Students Helped
            </div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "2rem", marginBottom: "6px" }}>📈</div>
            <div className="stat-number">₹5Cr+</div>
            <div className="stat-label">
              <TrendingUp size={13} /> Disbursed
            </div>
          </div>
        </motion.div>
      )}

      {user.role === "admin" && (
        <AdminDashboard onOpenScholarships={() => setShowAdmin((v) => !v)} />
      )}
      {showAdmin && (
        <AdminPanel
          onDone={() => {
            setShowAdmin(false);
            axios
              .get("/api/scholarships")
              .then((r) => setList(r.data.scholarships || []));
          }}
        />
      )}
      {showChat && <Chat />}

      {activeView === "eligibility" ? (
        <EligibilityChecker
          onSelectScholarship={(item) => navigate(`/scholarship/${item._id}`)}
        />
      ) : null}
      {activeView === "applications" ? (
        user.role === "admin" ? (
          <AdminApplications />
        ) : (
          <Applications />
        )
      ) : null}
      {activeView === "notifications" ? <NotificationsCenter /> : null}

      {activeView === "overview" && (
        <section className="panel panel-overview">
          <div
            className="section-head"
            style={{ flexWrap: "wrap", gap: "16px" }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
              }}
            >
              <GraduationCap size={20} color="var(--accent)" />
              {t.openOpportunities}
            </h2>

            <div className="search-filter-row">
              <div className="search-input-wrap">
                <Search size={15} className="search-input-icon" />
                <input
                  type="text"
                  placeholder="Search by title or provider…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="quick-filter-row">
                <SlidersHorizontal
                  size={14}
                  style={{ color: "var(--muted)", flexShrink: 0 }}
                />
                {quickFilters.map((f) => (
                  <button
                    key={f.id}
                    className={`quick-filter-chip ${activeFilter === f.id ? "active" : ""}`}
                    onClick={() => setActiveFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="cards-grid" style={{ marginTop: "16px" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card skeleton-card">
                  <div className="skeleton-line skeleton-icon" />
                  <div
                    className="skeleton-line"
                    style={{ width: "70%", height: "16px" }}
                  />
                  <div
                    className="skeleton-line"
                    style={{ width: "100%", height: "12px" }}
                  />
                  <div
                    className="skeleton-line"
                    style={{ width: "90%", height: "12px" }}
                  />
                  <div
                    className="skeleton-line"
                    style={{ width: "40%", height: "20px", marginTop: "10px" }}
                  />
                </div>
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>
                {list.length === 0
                  ? "No scholarships found"
                  : "No matches for your search"}
              </h3>
              <p>
                {list.length === 0
                  ? "Check back soon — new opportunities are added regularly."
                  : "Try a different keyword or clear your filters."}
              </p>
            </div>
          ) : (
            <div className="cards-grid" style={{ marginTop: "16px" }}>
              <AnimatePresence>
                {filteredList.map((s, index) => {
                  const urgency = urgencyMeta(s.deadline);
                  return (
                    <motion.article
                      key={s._id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      className="card"
                      onClick={() => navigate(`/scholarship/${s._id}`)}
                    >
                      <div className="card-top">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div className="card-icon-badge">
                            {getEmoji(index)}
                          </div>
                          <strong>{s.title || s.name || s.provider}</strong>
                        </div>
                        {s.featured ? (
                          <span className="pill">
                            <Star size={10} /> {t.featured}
                          </span>
                        ) : null}
                      </div>
                      <p>
                        {s.description || "Click to view details and apply."}
                      </p>
                      <div className="meta-row" style={{ marginTop: "12px" }}>
                        <span className="muted" style={{ fontSize: "13px" }}>
                          {s.provider}
                        </span>
                        <span
                          className="pill"
                          style={{
                            background: "rgba(251,191,36,0.1)",
                            color: "#fbbf24",
                            border: "1px solid rgba(251,191,36,0.2)",
                          }}
                        >
                          {s.amount || "Funding available"}
                        </span>
                      </div>
                      <div
                        className="urgency-badge"
                        style={{ color: urgency.color, background: urgency.bg }}
                      >
                        <Clock size={11} /> {urgency.label}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
