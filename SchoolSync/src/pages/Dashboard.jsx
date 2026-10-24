
import {
  Search,
  CalendarDays,
  Megaphone,
  GraduationCap,
  BookOpen,
  Rocket,
  DollarSign,
  ArrowUpRight,
  User,
  Target,
  School,
  BookmarkCheck,
  Users,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  TrendingUp,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchData } from "../data/searchData";
import {
  readStorage,
  subscribeToStorage
} from "../data/storage";

const PROFILE_STORAGE_KEY = "schoolsync-student-profile";
const SCHOLARSHIP_STORAGE_KEY = "schoolsync-saved-scholarships";
const EVENTS_STORAGE_KEY = "schoolsync-custom-events";
const CLUBS_STORAGE_KEY = "schoolsync-custom-clubs";
const NOTIFICATIONS_STORAGE_KEY = "schoolsync-notifications";
const COLLEGE_STORAGE_KEY = "schoolsync-college-checklist";

const defaultProfile = {
  name: "",
  grade: "",
  school: "",
  interests: "",
  goals: ""
};

const quickLinks = [
  {
    title: "Announcements",
    description: "Stay updated with school news.",
    icon: Megaphone,
    color: "blue",
    path: "/announcements"
  },
  {
    title: "Study Resources",
    description: "Find resources to support your learning.",
    icon: BookOpen,
    color: "purple",
    path: "/study"
  },
  {
    title: "College Planning",
    description: "Organize your next academic steps.",
    icon: GraduationCap,
    color: "green",
    path: "/college"
  },
  {
    title: "Scholarships",
    description: "Keep track of funding opportunities.",
    icon: DollarSign,
    color: "orange",
    path: "/scholarships"
  }
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function getProfile() {
  return {
    ...defaultProfile,
    ...safeObject(readStorage(PROFILE_STORAGE_KEY, defaultProfile))
  };
}

function Dashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState(getProfile);

  const [savedScholarships, setSavedScholarships] = useState(() =>
    safeArray(readStorage(SCHOLARSHIP_STORAGE_KEY, []))
  );

  const [customEvents, setCustomEvents] = useState(() =>
    safeArray(readStorage(EVENTS_STORAGE_KEY, []))
  );


  const [customClubs, setCustomClubs] = useState(() =>
    safeArray(readStorage(CLUBS_STORAGE_KEY, []))
  );

  const [notifications, setNotifications] = useState(() =>
    safeArray(readStorage(NOTIFICATIONS_STORAGE_KEY, []))
  );

  const [collegeChecklist, setCollegeChecklist] = useState(() =>
    safeObject(readStorage(COLLEGE_STORAGE_KEY, {}))
  );

  useEffect(() => {
    const refreshDashboard = (change) => {
      const key = change?.key;

      if (!key || key === PROFILE_STORAGE_KEY) {
        setProfile(getProfile());
      }

      if (!key || key === SCHOLARSHIP_STORAGE_KEY) {
        setSavedScholarships(
          safeArray(readStorage(SCHOLARSHIP_STORAGE_KEY, []))
        );
      }

      if (!key || key === EVENTS_STORAGE_KEY) {
        setCustomEvents(
          safeArray(readStorage(EVENTS_STORAGE_KEY, []))
        );
      }


      if (!key || key === CLUBS_STORAGE_KEY) {
        setCustomClubs(
          safeArray(readStorage(CLUBS_STORAGE_KEY, []))
        );
      }

      if (!key || key === NOTIFICATIONS_STORAGE_KEY) {
        setNotifications(
          safeArray(readStorage(NOTIFICATIONS_STORAGE_KEY, []))
        );
      }

      if (!key || key === COLLEGE_STORAGE_KEY) {
        setCollegeChecklist(
          safeObject(readStorage(COLLEGE_STORAGE_KEY, {}))
        );
      }
    };

    const unsubscribe = subscribeToStorage(refreshDashboard);
    const handleFocus = () => refreshDashboard();

    window.addEventListener("focus", handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return searchData.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        item.category,
        item.keywords
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [search]);

  const profileFields = [
    profile.name,
    profile.grade,
    profile.school,
    profile.interests,
    profile.goals
  ];

  const completedProfileFields = profileFields.filter(
    (field) => typeof field === "string" && field.trim().length > 0
  ).length;

  const profileProgress = Math.round(
    (completedProfileFields / profileFields.length) * 100
  );

  const firstName = profile.name.trim().split(/\s+/)[0] || "";

  const welcomeText = firstName
    ? `Welcome back, ${firstName}`
    : "Welcome to SchoolSync";

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  const completedCollegeTasks = Object.values(collegeChecklist).filter(
    Boolean
  ).length;

  const totalCollegeTasks = 8;

  const collegeProgress = Math.min(
    100,
    Math.round((completedCollegeTasks / totalCollegeTasks) * 100)
  );

  const activityItems = [
    {
      label: "Saved scholarships",
      value: savedScholarships.length,
      icon: BookmarkCheck,
      path: "/scholarships",
      color: "orange"
    },
    {
      label: "Your events",
      value: customEvents.length,
      icon: CalendarDays,
      path: "/events",
      color: "blue"
    },
    {
      label: "Your clubs",
      value: customClubs.length,
      icon: Users,
      path: "/clubs",
      color: "purple"
    },
    {
      label: "Unread notifications",
      value: unreadNotifications,
      icon: Bell,
      path: "/notifications",
      color: "green"
    }
  ];

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  return (
    <main className="schoolsync-dashboard">
      <style>{`
        .schoolsync-dashboard {
          --sd-text: var(--text-primary, #182230);
          --sd-muted: var(--text-secondary, #667085);
          --sd-border: var(--border-color, #e5eaf1);
          --sd-surface: var(--card-bg, var(--surface, #ffffff));
          --sd-page: var(--background-color, var(--app-bg, #f6f8fc));
          color: var(--sd-text);
          width: 100%;
          min-width: 0;
          padding-bottom: 32px;
        }

        .schoolsync-dashboard * {
          box-sizing: border-box;
        }

        .sd-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .sd-date {
          color: var(--sd-muted);
          font-size: 13px;
          margin: 0;
        }

        .sd-eyebrow {
          color: #5369d9;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.3px;
          margin: 0 0 8px;
        }

        .sd-header h1 {
          font-size: clamp(25px, 3vw, 34px);
          line-height: 1.2;
          letter-spacing: -1px;
          margin: 0 0 10px;
          overflow-wrap: anywhere;
        }

        .sd-subtitle {
          color: var(--sd-muted);
          font-size: 14px;
          line-height: 1.65;
          margin: 0;
          max-width: 680px;
        }

        .sd-search-wrap {
          position: relative;
          width: 100%;
          margin: 24px 0;
          z-index: 5;
        }

        .sd-search {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          background: var(--sd-surface);
          border: 1px solid var(--sd-border);
          border-radius: 13px;
          padding: 0 15px;
          min-height: 50px;
          color: var(--sd-muted);
        }

        .sd-search:focus-within {
          border-color: #7889ef;
          box-shadow: 0 0 0 3px rgba(83, 105, 217, .11);
        }

        .sd-search input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--sd-text);
          font-size: 14px;
        }

        .sd-search input::placeholder {
          color: var(--sd-muted);
        }

        .sd-search-clear {
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: var(--sd-muted);
          cursor: pointer;
          padding: 5px;
        }

        .sd-search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          max-height: 340px;
          overflow-y: auto;
          background: var(--sd-surface);
          border: 1px solid var(--sd-border);
          box-shadow: 0 12px 35px rgba(15, 23, 42, .12);
          border-radius: 13px;
          padding: 7px;
        }

        .sd-search-result {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          border: 0;
          border-radius: 9px;
          padding: 12px;
          background: transparent;
          color: var(--sd-text);
          cursor: pointer;
        }

        .sd-search-result:hover {
          background: var(--sd-page);
        }

        .sd-search-result strong,
        .sd-search-result small {
          display: block;
        }

        .sd-search-result strong {
          font-size: 13px;
          margin-bottom: 4px;
        }

        .sd-search-result small {
          font-size: 12px;
          color: var(--sd-muted);
          line-height: 1.4;
        }

        .sd-search-category {
          font-size: 10px;
          color: var(--sd-muted);
          border: 1px solid var(--sd-border);
          border-radius: 20px;
          padding: 4px 7px;
          white-space: nowrap;
        }

        .sd-empty-search {
          color: var(--sd-muted);
          padding: 16px;
          font-size: 13px;
        }

        .sd-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(190px, .7fr);
          gap: 24px;
          align-items: center;
          border-radius: 20px;
          padding: clamp(22px, 3vw, 32px);
          margin-bottom: 28px;
          background: linear-gradient(120deg, #edf1ff 0%, #f4f0ff 58%, #eef8ff 100%);
          border: 1px solid #e3e8ff;
          color: #20294a;
          overflow: hidden;
        }

        .sd-hero-content {
          min-width: 0;
        }

        .sd-hero .sd-eyebrow {
          color: #5369d9;
        }

        .sd-hero h2 {
          font-size: clamp(20px, 2.4vw, 27px);
          line-height: 1.3;
          letter-spacing: -.6px;
          margin: 0 0 10px;
        }

        .sd-hero p {
          color: #5c6681;
          font-size: 13px;
          line-height: 1.65;
          margin: 0;
        }

        .sd-profile-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .sd-profile-meta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(93,110,180,.12);
          padding: 7px 10px;
          border-radius: 9px;
          font-size: 12px;
          color: #465274;
          overflow-wrap: anywhere;
        }

        .sd-hero-progress {
          padding: 19px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.95);
          border-radius: 15px;
          min-width: 0;
        }

        .sd-progress-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #5c6681;
          margin-bottom: 12px;
        }

        .sd-progress-heading strong {
          font-size: 19px;
          color: #27345d;
        }

        .sd-progress-track {
          height: 8px;
          background: #dfe5fa;
          border-radius: 20px;
          overflow: hidden;
        }

        .sd-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #5369d9, #8c7cf0);
          transition: width .3s ease;
        }

        .sd-primary-button,
        .sd-secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 41px;
          padding: 10px 13px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .sd-primary-button {
          width: 100%;
          margin-top: 15px;
          color: white;
          background: #5369d9;
          border: 1px solid #5369d9;
        }

        .sd-primary-button:hover {
          background: #4358c6;
        }

        .sd-secondary-button {
          color: var(--sd-text);
          background: var(--sd-surface);
          border: 1px solid var(--sd-border);
        }

        .sd-section {
          margin-top: 30px;
        }

        .sd-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .sd-section-heading h2 {
          font-size: 17px;
          letter-spacing: -.3px;
          margin: 0;
        }

        .sd-section-heading p {
          font-size: 12px;
          color: var(--sd-muted);
          margin: 5px 0 0;
        }

        .sd-heading-icon {
          display: grid;
          place-items: center;
          color: var(--sd-muted);
        }

        .sd-activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 13px;
        }

        .sd-activity-card {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          text-align: left;
          border: 1px solid var(--sd-border);
          border-radius: 14px;
          padding: 16px 13px;
          background: var(--sd-surface);
          color: var(--sd-text);
          cursor: pointer;
          transition: transform .18s, box-shadow .18s, border-color .18s;
        }

        .sd-activity-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 22px rgba(15, 23, 42, .06);
          border-color: #cdd5ee;
        }

        .sd-activity-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          border-radius: 11px;
        }

        .sd-activity-icon.blue,
        .sd-quick-icon.blue {
          background: #eaf1ff;
          color: #4268d5;
        }

        .sd-activity-icon.purple,
        .sd-quick-icon.purple {
          background: #f0eaff;
          color: #8057ce;
        }

        .sd-activity-icon.green,
        .sd-quick-icon.green {
          background: #e4f8ed;
          color: #21895a;
        }

        .sd-activity-icon.orange,
        .sd-quick-icon.orange {
          background: #fff0df;
          color: #c87a20;
        }

        .sd-activity-copy {
          min-width: 0;
          flex: 1;
        }

        .sd-activity-copy strong {
          display: block;
          font-size: 21px;
          line-height: 1.2;
          margin-bottom: 5px;
        }

        .sd-activity-copy span {
          display: block;
          color: var(--sd-muted);
          font-size: 11px;
          line-height: 1.35;
        }

        .sd-activity-arrow {
          color: #9aa4b5;
          flex: 0 0 auto;
        }

        .sd-college-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(180px, .55fr);
          align-items: center;
          gap: 24px;
          padding: 22px;
          background: var(--sd-surface);
          border: 1px solid var(--sd-border);
          border-radius: 16px;
        }

        .sd-college-copy {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .sd-college-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 12px;
          background: #eaf1ff;
          color: #4268d5;
        }

        .sd-college-copy strong {
          display: block;
          font-size: 14px;
          margin: 1px 0 7px;
        }

        .sd-college-copy p {
          color: var(--sd-muted);
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        .sd-college-progress-number {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 9px;
          font-size: 12px;
          color: var(--sd-muted);
        }

        .sd-college-progress-number strong {
          color: var(--sd-text);
          font-size: 15px;
        }

        .sd-college-track {
          height: 7px;
          background: var(--sd-page);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--sd-border);
        }

        .sd-college-track div {
          height: 100%;
          border-radius: inherit;
          background: #34a779;
          transition: width .3s ease;
        }

        .sd-college-open {
          margin-top: 13px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #5369d9;
          background: transparent;
          border: 0;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .sd-quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 13px;
        }

        .sd-quick-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 19px;
          border-radius: 15px;
          border: 1px solid var(--sd-border);
          background: var(--sd-surface);
          color: var(--sd-text);
          cursor: pointer;
          transition: transform .18s, box-shadow .18s;
        }

        .sd-quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, .07);
        }

        .sd-quick-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .sd-quick-card h3 {
          font-size: 14px;
          margin: 0 0 7px;
        }

        .sd-quick-card p {
          color: var(--sd-muted);
          font-size: 12px;
          line-height: 1.6;
          margin: 0 0 17px;
        }

        .sd-quick-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #5369d9;
          font-size: 11px;
          font-weight: 700;
          margin-top: auto;
        }

        .sd-two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .sd-panel {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--sd-border);
          border-radius: 16px;
          background: var(--sd-surface);
        }

        .sd-panel-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .sd-panel-heading h3 {
          font-size: 14px;
          margin: 0;
        }

        .sd-panel-heading p {
          color: var(--sd-muted);
          font-size: 11px;
          margin: 4px 0 0;
        }

        .sd-panel-heading-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--sd-page);
          color: #5369d9;
          flex: 0 0 36px;
        }

        .sd-favorite-heading-icon {
          color: #d97706;
        }

        .sd-list-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 12px 0;
          border-top: 1px solid var(--sd-border);
        }

        .sd-list-item:first-of-type {
          border-top: 0;
        }

        .sd-list-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          margin-top: 5px;
          border-radius: 50%;
          background: #7185ed;
        }

        .sd-list-content {
          min-width: 0;
          flex: 1;
        }

        .sd-list-content strong {
          display: block;
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 4px;
          overflow-wrap: anywhere;
        }

        .sd-list-content p {
          color: var(--sd-muted);
          font-size: 11px;
          line-height: 1.6;
          margin: 0;
        }

        .sd-panel-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 0;
          background: transparent;
          border: 0;
          color: #5369d9;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .sd-empty-state {
          padding: 18px 12px;
          border: 1px dashed var(--sd-border);
          border-radius: 11px;
          text-align: center;
          color: var(--sd-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .sd-opportunity-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px;
          background: linear-gradient(110deg, #f0edff, #eef5ff);
          border: 1px solid #e1e6fb;
          border-radius: 16px;
          color: #252f52;
        }

        .sd-opportunity-copy {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          min-width: 0;
        }

        .sd-opportunity-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 12px;
          background: rgba(255,255,255,.8);
          color: #6a61d8;
        }

        .sd-opportunity-copy h3 {
          font-size: 15px;
          margin: 0 0 7px;
        }

        .sd-opportunity-copy p {
          color: #65708d;
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        .sd-opportunity-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex: 0 0 auto;
        }

        .sd-opportunity-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          border: 1px solid rgba(83,105,217,.25);
          border-radius: 9px;
          background: rgba(255,255,255,.85);
          color: #4d5fc3;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .sd-opportunity-actions button:hover {
          background: white;
        }

        .sd-footer-note {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--sd-muted);
          font-size: 11px;
          margin-top: 26px;
        }

        @media (max-width: 720px) {
          .sd-hero {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 21px;
          }

          .sd-hero-progress {
            padding: 16px;
          }

          .sd-college-card {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 18px;
          }

          .sd-two-column {
            grid-template-columns: 1fr;
          }

          .sd-activity-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .sd-activity-card {
            gap: 9px;
            padding: 12px 10px;
          }

          .sd-activity-icon {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
          }

          .sd-activity-copy strong {
            font-size: 18px;
          }

          .sd-activity-copy span {
            font-size: 10px;
          }

          .sd-activity-arrow {
            display: none;
          }

          .sd-quick-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .sd-quick-card {
            padding: 14px;
          }

          .sd-opportunity-banner {
            align-items: flex-start;
            flex-direction: column;
          }

          .sd-opportunity-actions {
            width: 100%;
          }

          .sd-opportunity-actions button {
            flex: 1 1 auto;
          }
        }

        @media (max-width: 420px) {
          .sd-topline {
            align-items: flex-start;
            flex-direction: column;
          }

          .sd-activity-grid {
            grid-template-columns: 1fr;
          }

          .sd-activity-card {
            padding: 13px;
          }

          .sd-section-heading h2 {
            font-size: 15px;
          }

          .sd-quick-card h3 {
            font-size: 13px;
          }

          .sd-quick-card p {
            font-size: 11px;
          }

          .sd-opportunity-actions {
            flex-direction: column;
          }

          .sd-search-category {
            display: none;
          }
        }

        html[data-theme="dark"] .schoolsync-dashboard .sd-hero,
        html[data-theme="dark"] .schoolsync-dashboard .sd-opportunity-banner {
          background: linear-gradient(120deg, #202744, #29243f);
          border-color: #383e5e;
          color: #f1f3ff;
        }

        html[data-theme="dark"] .schoolsync-dashboard .sd-hero p,
        html[data-theme="dark"] .schoolsync-dashboard .sd-opportunity-copy p {
          color: #c1c8e1;
        }

        html[data-theme="dark"] .schoolsync-dashboard .sd-profile-meta span {
          background: rgba(20, 27, 49, .75);
          color: #e0e5ff;
          border-color: #41496d;
        }

        html[data-theme="dark"] .schoolsync-dashboard .sd-hero-progress {
          background: rgba(20, 27, 49, .75);
          border-color: #41496d;
        }

        html[data-theme="dark"] .schoolsync-dashboard .sd-progress-heading,
        html[data-theme="dark"] .schoolsync-dashboard .sd-progress-heading strong {
          color: #f1f3ff;
        }

        html[data-theme="dark"] .schoolsync-dashboard .sd-progress-track {
          background: #353d60;
        }

        html[data-theme="dark"] .schoolsync-dashboard .sd-opportunity-icon,
        html[data-theme="dark"] .schoolsync-dashboard .sd-opportunity-actions button {
          background: #303756;
          color: #dce2ff;
          border-color: #41496d;
        }
      `}</style>

      <div className="sd-topline">
        <div className="sd-header">
          <p className="sd-eyebrow">YOUR STUDENT HUB</p>
          <h1>{welcomeText}</h1>
          <p className="sd-subtitle">
            Your school life, learning resources, and future opportunities
            in one place.
          </p>
        </div>

        <p className="sd-date">
          <Clock size={14} style={{ display: "inline", marginRight: 6 }} />
          {currentDate}
        </p>
      </div>

      <div className="sd-search-wrap">
        <div className="sd-search">
          <Search size={19} />

          <input
            type="search"
            placeholder="Search announcements, study tools, colleges..."
            aria-label="Search SchoolSync"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              className="sd-search-clear"
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <X size={17} />
            </button>
          )}
        </div>

        {search.trim() && (
          <div className="sd-search-results">
            {results.length > 0 ? (
              results.map((item) => (
                <button
                  type="button"
                  className="sd-search-result"
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSearch("");
                  }}
                >
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="sd-search-category">
                    {item.category}
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))
            ) : (
              <div className="sd-empty-search">
                No matching sections found. Try another keyword.
              </div>
            )}
          </div>
        )}
      </div>

      {profileProgress < 100 && (
      <section className="sd-hero">
        <div className="sd-hero-content">
          <p className="sd-eyebrow">YOUR SCHOOLSYNC PROFILE</p>

          <h2>
            {profile.name
              ? `Make SchoolSync work for you, ${firstName}.`
              : "Personalize your SchoolSync experience."}
          </h2>

          <p>
            Add your interests and goals to make your student dashboard
            more useful. Your profile helps keep your school plans organized.
          </p>

          <div className="sd-profile-meta">
            {profile.grade && (
              <span>
                <GraduationCap size={15} />
                {profile.grade}
              </span>
            )}

            {profile.school && (
              <span>
                <School size={15} />
                {profile.school}
              </span>
            )}

            {profile.interests && (
              <span>
                <Target size={15} />
                {profile.interests}
              </span>
            )}
          </div>
        </div>

        <div className="sd-hero-progress">
          <div className="sd-progress-heading">
            <span>Profile completion</span>
            <strong>{profileProgress}%</strong>
          </div>

          <div
            className="sd-progress-track"
            role="progressbar"
            aria-label="Profile completion"
            aria-valuenow={profileProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="sd-progress-fill"
              style={{ width: `${profileProgress}%` }}
            />
          </div>

          <button
            type="button"
            className="sd-primary-button"
            onClick={() => navigate("/profile")}
          >
            <User size={16} />
            {profileProgress === 100 ? "View my profile" : "Complete my profile"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </section>
      )}

      <section className="sd-section">
        <div className="sd-section-heading">
          <div>
            <h2>Your SchoolSync activity</h2>
            <p>A quick look at what you have saved and organized.</p>
          </div>
          <span className="sd-heading-icon">
            <TrendingUp size={20} />
          </span>
        </div>

        <div className="sd-activity-grid">
          {activityItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                className="sd-activity-card"
                key={item.label}
                onClick={() => navigate(item.path)}
              >
                <div className={`sd-activity-icon ${item.color}`}>
                  <Icon size={19} />
                </div>

                <div className="sd-activity-copy">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>

                <ArrowUpRight className="sd-activity-arrow" size={16} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="sd-section">
        <div className="sd-section-heading">
          <div>
            <h2>College planning progress</h2>
            <p>Keep moving forward, one task at a time.</p>
          </div>
          <span className="sd-heading-icon">
            <GraduationCap size={21} />
          </span>
        </div>

        <div className="sd-college-card">
          <div className="sd-college-copy">
            <div className="sd-college-icon">
              <GraduationCap size={22} />
            </div>

            <div>
              <strong>
                {completedCollegeTasks} of {totalCollegeTasks} tasks completed
              </strong>
              <p>
                Use your college checklist to track your planning progress
                and remember important application steps.
              </p>
            </div>
          </div>

          <div>
            <div className="sd-college-progress-number">
              <span>Overall progress</span>
              <strong>{collegeProgress}%</strong>
            </div>

            <div
              className="sd-college-track"
              role="progressbar"
              aria-label="College planning progress"
              aria-valuenow={collegeProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div style={{ width: `${collegeProgress}%` }} />
            </div>

            <button
              type="button"
              className="sd-college-open"
              onClick={() => navigate("/college")}
            >
              Open college checklist
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <section className="sd-section">
        <div className="sd-section-heading">
          <div>
            <h2>Quick access</h2>
            <p>Jump straight to your most-used sections.</p>
          </div>
          <span className="sd-heading-icon">
            <Sparkles size={20} />
          </span>
        </div>

        <div className="sd-quick-grid">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                className="sd-quick-card"
                key={item.path}
                onClick={() => navigate(item.path)}
              >
                <div className={`sd-quick-icon ${item.color}`}>
                  <Icon size={22} />
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <span className="sd-quick-link">
                  Open section
                  <ArrowUpRight size={15} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="sd-section sd-two-column">
        <div className="sd-panel">
          <div className="sd-panel-heading">
            <span className="sd-panel-heading-icon">
              <Bell size={18} />
            </span>
            <div>
              <h3>Notifications</h3>
              <p>
                {unreadNotifications === 0
                  ? "You're all caught up."
                  : `${unreadNotifications} unread notification${unreadNotifications === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>

          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((notification, index) => (
              <div className="sd-list-item" key={notification.id ?? index}>
                <span
                  className="sd-list-dot"
                  style={{
                    background: notification.read ? "#c1c8d4" : "#7185ed"
                  }}
                />
                <div className="sd-list-content">
                  <strong>
                    {notification.title || notification.message || "Notification"}
                  </strong>
                  <p>
                    {notification.description ||
                      notification.message ||
                      "Open notifications to see more details."}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="sd-empty-state">
              No notifications to display yet.
            </div>
          )}

          <button
            type="button"
            className="sd-panel-button"
            onClick={() => navigate("/notifications")}
          >
            View all notifications
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="sd-panel">
          <div className="sd-panel-heading">
            <span className="sd-panel-heading-icon">
              <CalendarDays size={18} />
            </span>
            <div>
              <h3>Your upcoming events</h3>
              <p>Your custom events saved in SchoolSync.</p>
            </div>
          </div>

          {customEvents.length > 0 ? (
            customEvents.slice(0, 3).map((event, index) => (
              <div className="sd-list-item" key={event.id ?? index}>
                <span className="sd-list-dot" />
                <div className="sd-list-content">
                  <strong>{event.title || event.name || "Untitled event"}</strong>
                  <p>
                    {[event.date, event.time, event.location]
                      .filter(Boolean)
                      .join(" · ") || "Saved event"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="sd-empty-state">
              You have not added any custom events yet. Add events to keep
              important dates organized here.
            </div>
          )}

          <button
            type="button"
            className="sd-panel-button"
            onClick={() => navigate("/events")}
          >
            Open events
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      <section className="sd-section sd-two-column">
        <div className="sd-panel">
          <div className="sd-panel-heading">
            <span className="sd-panel-heading-icon">
              <BookmarkCheck size={18} />
            </span>
            <div>
              <h3>Saved scholarships</h3>
              <p>Your bookmarked funding opportunities.</p>
            </div>
          </div>

          {savedScholarships.length > 0 ? (
            savedScholarships.slice(0, 3).map((scholarship, index) => (
              <div className="sd-list-item" key={scholarship.id ?? index}>
                <span className="sd-list-dot" />
                <div className="sd-list-content">
                  <strong>
                    {scholarship.title ||
                      scholarship.name ||
                      "Saved scholarship"}
                  </strong>
                  <p>
                    {scholarship.amount ||
                      scholarship.award ||
                      scholarship.provider ||
                      "Open scholarships to view details."}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="sd-empty-state">
              No saved scholarships yet. Save scholarships from the
              scholarships page to find them here.
            </div>
          )}

          <button
            type="button"
            className="sd-panel-button"
            onClick={() => navigate("/scholarships")}
          >
            Explore scholarships
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="sd-panel">
          <div className="sd-panel-heading">
            <span className="sd-panel-heading-icon">
              <Users size={18} />
            </span>
            <div>
              <h3>Your clubs</h3>
              <p>Keep track of clubs you have added.</p>
            </div>
          </div>

          {customClubs.length > 0 ? (
            customClubs.slice(0, 3).map((club, index) => (
              <div className="sd-list-item" key={club.id ?? index}>
                <span className="sd-list-dot" />
                <div className="sd-list-content">
                  <strong>{club.name || club.title || "Untitled club"}</strong>
                  <p>
                    {club.category ||
                      club.description ||
                      "Your saved club"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="sd-empty-state">
              You have not added custom clubs yet. Explore clubs to find
              groups and activities that interest you.
            </div>
          )}

          <button
            type="button"
            className="sd-panel-button"
            onClick={() => navigate("/clubs")}
          >
            Explore clubs
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      <section className="sd-section">
        <div className="sd-opportunity-banner">
          <div className="sd-opportunity-copy">
            <div className="sd-opportunity-icon">
              <Rocket size={22} />
            </div>

            <div>
              <h3>Find your next opportunity</h3>
              <p>
                Explore clubs, competitions, volunteer work, internships,
                and other ways to get involved.
              </p>
            </div>
          </div>

          <div className="sd-opportunity-actions">
            <button
              type="button"
              onClick={() => navigate("/opportunities")}
            >
              Opportunities
              <ArrowUpRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/clubs")}
            >
              Clubs
              <ArrowUpRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/events")}
            >
              Events
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <div className="sd-footer-note">
        <CheckCircle2 size={15} />
        Your dashboard uses the information saved in your SchoolSync pages.
      </div>
    </main>
  );
}

export default Dashboard;
