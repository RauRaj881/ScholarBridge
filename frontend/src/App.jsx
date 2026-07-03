import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Scholarships from "./Scholarships";
import AdminDashboard from "./AdminDashboard";
import ScholarshipPage from "./ScholarshipPage";
import Nav from "./Nav";

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [adminView, setAdminView] = useState("metrics"); // 'metrics' or 'scholarships'

  useEffect(() => {
    axios
      .get("/api/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null));
  }, []);

  if (!user) {
    return showRegister ? (
      <Register
        onRegistered={(u) => {
          setUser(u);
          setShowRegister(false);
        }}
        onCancel={() => setShowRegister(false)}
      />
    ) : (
      <Login onLogin={setUser} onShowRegister={() => setShowRegister(true)} />
    );
  }

  const isAdminDashboardActive =
    user.role === "admin" && adminView === "metrics";

  return (
    <BrowserRouter>
      <div className="app-shell">
        {!isAdminDashboardActive && (
          <Nav
            user={user}
            onLogout={() => setUser(null)}
            onViewChange={setAdminView}
          />
        )}

        <main className="main-content-panel">
          <Routes>
            {/* Dedicated scholarship detail page — real URL, works on refresh/share */}
            <Route
              path="/scholarship/:id"
              element={<ScholarshipPage user={user} />}
            />

            {/* Everything else falls back to the existing dashboard/admin views */}
            <Route
              path="*"
              element={
                user.role === "admin" ? (
                  adminView === "metrics" ? (
                    <AdminDashboard
                      onOpenScholarships={() => setAdminView("scholarships")}
                      onLogout={() => setUser(null)}
                    />
                  ) : (
                    <Scholarships user={user} />
                  )
                ) : (
                  <Scholarships user={user} />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
