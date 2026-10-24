
import { useEffect, useState } from "react";
import {
  Bell,
  Moon,
  Sun,
  Monitor,
  RotateCcw,
  Save,
  User,
  GraduationCap,
  Heart
} from "lucide-react";
import { readStorage, writeStorage } from "../data/storage";
import { applyTheme, SETTINGS_STORAGE_KEY } from "../data/theme";

const STORAGE_KEY = SETTINGS_STORAGE_KEY;

const PROFILE_STORAGE_KEY = "schoolsync-student-profile";

const defaultProfile = {
  name: "",
  grade: "",
  school: "",
  interests: "",
  goals: ""
};

function loadProfile() {
  const saved = readStorage(PROFILE_STORAGE_KEY, defaultProfile);
  return saved && typeof saved === "object" ? { ...defaultProfile, ...saved } : { ...defaultProfile };
}

const defaultSettings = {
  notifications: true,
  announcements: true,
  events: true,
  scholarships: true,
  opportunities: true,
  theme: "light"
};

function loadSettings() {
  const saved = readStorage(STORAGE_KEY, defaultSettings);
  return saved && typeof saved === "object"
    ? { ...defaultSettings, ...saved }
    : { ...defaultSettings };
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(loadProfile);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    writeStorage(STORAGE_KEY, settings);

    applyTheme(settings.theme);
  }, [settings]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemThemeChange = () => {
      if (settings.theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [settings.theme]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));

    setSaved(false);
  };


  const updateProfile = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setProfileSaved(false);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setProfileSaved(writeStorage(PROFILE_STORAGE_KEY, profile));
  };

  const resetSettings = () => {
    setSettings({ ...defaultSettings });
    setSaved(true);
  };

  const saveSettings = () => {
    const success = writeStorage(STORAGE_KEY, settings);
    applyTheme(settings.theme);
    setSaved(success);
  };

  return (
    <div>
      <header className="page-header settings-header">
        <div>
          <p className="eyebrow">PREFERENCES</p>
          <h1>Settings</h1>
          <p className="subtitle">
            Customize how SchoolSync works for you.
          </p>
        </div>

        <div className="settings-header-icon">
          <Bell size={24} />
        </div>
      </header>


      <section className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2>Student profile</h2>
            <p>Edit the information SchoolSync uses to personalize your dashboard.</p>
          </div>
        </div>

        <form className="profile-form-card settings-profile-form" onSubmit={saveProfile}>
          <div className="profile-section-heading">
            <User size={21} />
            <div>
              <h2>Basic information</h2>
              <p>Keep your student information up to date.</p>
            </div>
          </div>

          <div className="profile-grid">
            <label className="profile-field">
              Name
              <input name="name" value={profile.name} onChange={updateProfile} placeholder="Your name" maxLength={100} />
            </label>
            <label className="profile-field">
              Grade
              <select name="grade" value={profile.grade} onChange={updateProfile}>
                <option value="">Select grade</option>
                <option value="9th grade">9th grade</option>
                <option value="10th grade">10th grade</option>
                <option value="11th grade">11th grade</option>
                <option value="12th grade">12th grade</option>
              </select>
            </label>
            <label className="profile-field profile-wide">
              School
              <input name="school" value={profile.school} onChange={updateProfile} placeholder="Your school" maxLength={150} />
            </label>
          </div>

          <div className="profile-section-heading">
            <Heart size={21} />
            <div>
              <h2>Interests &amp; goals</h2>
              <p>These help personalize your SchoolSync experience.</p>
            </div>
          </div>

          <div className="profile-grid">
            <label className="profile-field profile-wide">
              Interests
              <textarea name="interests" value={profile.interests} onChange={updateProfile} placeholder="Computer science, robotics, music..." maxLength={500} />
            </label>
            <label className="profile-field profile-wide">
              Goals
              <textarea name="goals" value={profile.goals} onChange={updateProfile} placeholder="What are you working toward?" maxLength={500} />
            </label>
          </div>

          <div className="settings-actions">
            <button type="submit" className="settings-save-button"><Save size={18} /> Save profile</button>
            {profileSaved && <span className="settings-saved-message">Profile updated.</span>}
          </div>
        </form>
      </section>

      <section className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2>Notifications</h2>
            <p>Choose which updates you want to receive.</p>
          </div>
        </div>

        <div className="settings-list">
          <label className="setting-row">
            <div>
              <strong>Enable notifications</strong>
              <span>Allow SchoolSync to show notification updates.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(event) =>
                updateSetting("notifications", event.target.checked)
              }
            />
          </label>

          <label className="setting-row">
            <div>
              <strong>School announcements</strong>
              <span>Receive updates about important school information.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.announcements}
              disabled={!settings.notifications}
              onChange={(event) =>
                updateSetting("announcements", event.target.checked)
              }
            />
          </label>

          <label className="setting-row">
            <div>
              <strong>Events</strong>
              <span>Receive reminders about upcoming events.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.events}
              disabled={!settings.notifications}
              onChange={(event) =>
                updateSetting("events", event.target.checked)
              }
            />
          </label>

          <label className="setting-row">
            <div>
              <strong>Scholarships</strong>
              <span>Receive updates about scholarship opportunities.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.scholarships}
              disabled={!settings.notifications}
              onChange={(event) =>
                updateSetting("scholarships", event.target.checked)
              }
            />
          </label>

          <label className="setting-row">
            <div>
              <strong>Opportunities</strong>
              <span>
                Receive updates about internships, competitions, and programs.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.opportunities}
              disabled={!settings.notifications}
              onChange={(event) =>
                updateSetting("opportunities", event.target.checked)
              }
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2>Appearance</h2>
            <p>Choose how SchoolSync should look.</p>
          </div>
        </div>

        <div className="theme-options">
          <button
            type="button"
            className={`theme-option ${
              settings.theme === "light" ? "active" : ""
            }`}
            onClick={() => updateSetting("theme", "light")}
          >
            <Sun size={22} />
            <strong>Light</strong>
            <span>Bright and clean</span>
          </button>

          <button
            type="button"
            className={`theme-option ${
              settings.theme === "dark" ? "active" : ""
            }`}
            onClick={() => updateSetting("theme", "dark")}
          >
            <Moon size={22} />
            <strong>Dark</strong>
            <span>Easy on the eyes</span>
          </button>

          <button
            type="button"
            className={`theme-option ${
              settings.theme === "system" ? "active" : ""
            }`}
            onClick={() => updateSetting("theme", "system")}
          >
            <Monitor size={22} />
            <strong>System</strong>
            <span>Follow your device</span>
          </button>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2>Save preferences</h2>
            <p>
              Your settings are stored locally in this browser.
            </p>
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="settings-save-button"
            onClick={saveSettings}
          >
            <Save size={18} />
            Save settings
          </button>

          <button
            type="button"
            className="settings-reset-button"
            onClick={resetSettings}
          >
            <RotateCcw size={18} />
            Reset
          </button>

          {saved && (
            <span className="settings-saved-message">
              Settings updated.
            </span>
          )}
        </div>
      </section>

      <div className="demo-notice">
        <strong>Frontend demo:</strong> Settings currently use browser
        storage. When the backend is added, these preferences can be tied
        to the student's account.
      </div>
    </div>
  );
}

export default Settings;
