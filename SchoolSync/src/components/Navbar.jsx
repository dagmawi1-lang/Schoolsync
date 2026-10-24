import {
  Settings as SettingsIcon,
  Home,
  Megaphone,
  BookOpen,
  GraduationCap,
  Sparkles,
  DollarSign,
  Rocket,
  CalendarDays,
  School,
  Bell,
  SchoolIcon,
  User
} from "lucide-react";

import { NavLink, Link } from "react-router-dom";

function Navbar() {
  const navigation = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Announcements", path: "/announcements", icon: Megaphone },
    { name: "Study", path: "/study", icon: BookOpen },
    { name: "College", path: "/college", icon: GraduationCap },
    { name: "Scholarships", path: "/scholarships", icon: DollarSign },
    { name: "Opportunities", path: "/opportunities", icon: Rocket },
    { name: "Events", path: "/events", icon: CalendarDays },
    { name: "Clubs", path: "/clubs", icon: School },
    { name: "AI Announcement Assistant", path: "/announcement-ai", icon: Sparkles },
    { name: "My School", path: "/school", icon: SchoolIcon },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "My Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: SettingsIcon }
  ];

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <Link to="/" className="brand" aria-label="Go to SchoolSync dashboard">
        <img src="/favicon.svg" alt="" className="brand-icon" />
        <span className="brand-name">SchoolSync</span>
      </Link>

      <div className="nav-section-label">Workspace</div>

      <nav className="navigation">
        {navigation.slice(0, 8).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={2.1} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="nav-section-label secondary-label">Tools</div>

      <nav className="navigation">
        {navigation.slice(8).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={2.1} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Navbar;
