
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { readStorage, subscribeToStorage } from "./data/storage";
import { applyTheme, SETTINGS_STORAGE_KEY } from "./data/theme";

import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Announcements from "./pages/Announcements";
import Study from "./pages/Study";
import College from "./pages/College";
import Scholarships from "./pages/Scholarships";
import Opportunities from "./pages/Opportunities";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import AnnouncementAI from "./pages/AnnouncementAI";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import School from "./pages/School";
import Settings from "./pages/Settings";

function App() {
  useEffect(() => {
    const syncTheme = () => {
      const settings = readStorage(SETTINGS_STORAGE_KEY, {});
      applyTheme(settings?.theme || "light");
    };

    syncTheme();

    const unsubscribe = subscribeToStorage(({ key }) => {
      if (!key || key === SETTINGS_STORAGE_KEY) {
        syncTheme();
      }
    });

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (readStorage(SETTINGS_STORAGE_KEY, {})?.theme === "system") {
        applyTheme("system");
      }
    };

    systemTheme.addEventListener("change", handleSystemThemeChange);

    return () => {
      unsubscribe();
      systemTheme.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Navbar />

          <main
            className="main-content"
            style={{ flex: 1 }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/school" element={<School />} />
              <Route
                path="/notifications"
                element={<Notifications />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/announcement-ai"
                element={<AnnouncementAI />}
              />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/events" element={<Events />} />
              <Route
                path="/opportunities"
                element={<Opportunities />}
              />
              <Route
                path="/scholarships"
                element={<Scholarships />}
              />
              <Route path="/college" element={<College />} />
              <Route path="/study" element={<Study />} />

              {/* Catch every URL that doesn't match an existing route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
