
import {
  School as SchoolIcon,
  Megaphone,
  CalendarDays,
  Users,
  ArrowUpRight,
  MapPin,
  Clock,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Rocket
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readStorage } from "../data/storage";

const PROFILE_KEY = "schoolsync-student-profile";
const EVENTS_KEY = "schoolsync-custom-events";
const CLUBS_KEY = "schoolsync-custom-clubs";


function loadProfile() {
  return {
    name: "",
    grade: "",
    school: "",
    interests: "",
    goals: "",
    ...readStorage(PROFILE_KEY, {})
  };
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not specified";

  const date = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function School() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(loadProfile);
  const [customEvents, setCustomEvents] = useState(() =>
    readStorage(EVENTS_KEY, [])
  );
  const [customClubs, setCustomClubs] = useState(() =>
    readStorage(CLUBS_KEY, [])
  );

  useEffect(() => {
    const refreshData = () => {
      setProfile(loadProfile());
      setCustomEvents(readStorage(EVENTS_KEY, []));
      setCustomClubs(readStorage(CLUBS_KEY, []));
    };

    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const schoolName = profile.school?.trim() || "Your School";

  const firstName = profile.name?.trim()
    ? profile.name.trim().split(/\s+/)[0]
    : "Student";

  const events = customEvents
    .map((event) => ({
      ...event,
      displayTitle: event.title || event.name || "Untitled event",
      displayDate: event.date ? formatDate(event.date) : "Date not specified",
      displayTime: event.time || "Time not specified",
      displayLocation: event.location || "Location not specified",
      isCustom: true
    }))
    .filter((event) => {
      if (!event.date) return false;
      const eventDate = new Date(`${event.date}T23:59:59`);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= new Date();
    })
    .slice(0, 4);

  const clubs = customClubs
    .map((club) => ({
      ...club,
      displayName: club.name || club.title || "Untitled club",
      displayDescription: club.description || "Explore this student club.",
      displayCategory: club.category || "Student organization",
      isCustom: true
    }))
    .slice(0, 6);

  return (
    <div>
      <header className="school-page-hero">
        <div className="school-hero-icon">
          <SchoolIcon size={28} />
        </div>

        <div>
          <p className="eyebrow">YOUR SCHOOL COMMUNITY</p>
          <h1>{schoolName}</h1>
          <p className="subtitle">
            Welcome, {firstName}. Find school news, events, clubs, and
            opportunities in one place.
          </p>
        </div>
      </header>

      {!profile.school?.trim() && (
        <div className="school-profile-prompt">
          <div>
            <strong>Add your school to personalize this page.</strong>
            <p>
              Add your school name in your profile. School-specific
              information will require a connection to real school data.
            </p>
          </div>

          <button type="button" onClick={() => navigate("/profile")}>
            Update profile
            <ArrowUpRight size={17} />
          </button>
        </div>
      )}

      <section>
        <div className="section-header">
          <h2>School overview</h2>
          <SchoolIcon size={19} color="#8490a4" />
        </div>

        <div className="school-overview-grid">
          <article className="school-overview-card">
            <div className="school-overview-icon blue">
              <Megaphone size={21} />
            </div>
            <div>
              <strong>Announcements</strong>
              <span>School news and updates</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/announcements")}
              aria-label="View announcements"
            >
              <ArrowUpRight size={18} />
            </button>
          </article>

          <article className="school-overview-card">
            <div className="school-overview-icon purple">
              <CalendarDays size={21} />
            </div>
            <div>
              <strong>Events</strong>
              <span>{customEvents.length} custom events saved</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/events")}
              aria-label="View events"
            >
              <ArrowUpRight size={18} />
            </button>
          </article>

          <article className="school-overview-card">
            <div className="school-overview-icon green">
              <Users size={21} />
            </div>
            <div>
              <strong>Clubs</strong>
              <span>{customClubs.length} custom clubs saved</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/clubs")}
              aria-label="View clubs"
            >
              <ArrowUpRight size={18} />
            </button>
          </article>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>School announcements</h2>
          <Megaphone size={19} color="#8490a4" />
        </div>

        <div className="school-announcement-list">
          <div className="sd-empty-state">
            No school announcements have been published yet. Create one with the AI Announcement Assistant.
          </div>
        </div>

        <button
          type="button"
          className="school-section-button"
          onClick={() => navigate("/announcements")}
        >
          View all announcements
          <ArrowUpRight size={17} />
        </button>
      </section>

      <section>
        <div className="section-header">
          <h2>Events</h2>
          <CalendarDays size={19} color="#8490a4" />
        </div>

        <div className="school-events-grid">
          {events.map((event, index) => (
            <article
              className="school-event-card"
              key={`${event.displayTitle}-${index}`}
            >
              <div className="school-event-icon">
                <CalendarDays size={20} />
              </div>
              <div>
                <span className="school-card-meta">
                  {event.displayDate}
                  {event.isCustom ? " · Added in SchoolSync" : ""}
                </span>
                <h3>{event.displayTitle}</h3>
                <div className="school-event-detail">
                  <Clock size={15} />
                  {event.displayTime}
                </div>
                <div className="school-event-detail">
                  <MapPin size={15} />
                  {event.displayLocation}
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="school-section-button"
          onClick={() => navigate("/events")}
        >
          View all events
          <ArrowUpRight size={17} />
        </button>
      </section>

      <section>
        <div className="section-header">
          <h2>Featured clubs</h2>
          <Users size={19} color="#8490a4" />
        </div>

        <div className="school-club-grid">
          {clubs.map((club, index) => (
            <article
              className="school-club-card"
              key={`${club.displayName}-${index}`}
            >
              <div className="school-club-heading">
                <div className="school-club-icon">
                  <Users size={19} />
                </div>
                <span>{club.displayCategory}</span>
              </div>
              <h3>{club.displayName}</h3>
              <p>{club.displayDescription}</p>
              <small>
                Added in SchoolSync
              </small>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="school-section-button"
          onClick={() => navigate("/clubs")}
        >
          Explore all clubs
          <ArrowUpRight size={17} />
        </button>
      </section>

      <section>
        <div className="section-header">
          <h2>School resources</h2>
          <ExternalLink size={19} color="#8490a4" />
        </div>

        <div className="school-resource-grid">
          <button type="button" onClick={() => navigate("/study")}>
            <BookOpen size={21} />
            <span>
              <strong>Study resources</strong>
              <small>Find tools for your classes</small>
            </span>
            <ArrowUpRight size={17} />
          </button>

          <button type="button" onClick={() => navigate("/college")}>
            <GraduationCap size={21} />
            <span>
              <strong>College planning</strong>
              <small>Organize your next steps</small>
            </span>
            <ArrowUpRight size={17} />
          </button>

          <button type="button" onClick={() => navigate("/opportunities")}>
            <Rocket size={21} />
            <span>
              <strong>Opportunities</strong>
              <small>Find ways to get involved</small>
            </span>
            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      <div className="demo-notice">
        Events and clubs shown here are created in SchoolSync. School-specific
        announcements require content to be published through the app.
      </div>
    </div>
  );
}

export default School;
