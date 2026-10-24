import { useMemo, useState } from "react";
import {
  Sparkles,
  CalendarDays,
  MapPin,
  Clock,
  Megaphone,
  RotateCcw,
  Send,
  Copy,
} from "lucide-react";
import { readStorage, writeStorage } from "../data/storage";

const ANNOUNCEMENTS_KEY = "schoolsync-announcements";

const categories = [
  "Academics",
  "Clubs",
  "Events",
  "Deadlines",
  "College",
  "Career",
  "Sports",
  "Student Life",
  "Other",
];

function AnnouncementAI() {
  const [form, setForm] = useState({
    topic: "",
    details: "",
    category: "Academics",
    date: "",
    time: "",
    location: "",
    audience: "All students",
    priority: "General",
  });
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState("");

  const canGenerate = useMemo(
    () => form.topic.trim() && form.details.trim(),
    [form.topic, form.details]
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function generateAnnouncement() {
    setStatus("");

    if (!canGenerate) {
      setStatus("Add a title and the important details first.");
      return;
    }

    const dateLine = form.date
      ? `Date: ${form.date}`
      : "Date: See the school calendar for details.";
    const timeLine = form.time ? `Time: ${form.time}` : "Time: See the school calendar for details.";
    const locationLine = form.location
      ? `Location: ${form.location}`
      : "Location: See the official school information.";

    const polishedDetails = form.details
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*([.!?])\s*/g, "$1 ")
      .trim();

    const body = `SchoolSync Announcement\n\n${form.topic.trim()}\n\n${polishedDetails}\n\n${dateLine}\n${timeLine}\n${locationLine}\nAudience: ${form.audience}`;

    setDraft({
      id: `announcement-${Date.now()}`,
      title: form.topic.trim(),
      description: polishedDetails,
      category: form.category,
      date: form.date || "See school calendar",
      time: form.time || "See school calendar",
      location: form.location || "See official school information",
      priority: form.priority,
      audience: form.audience,
      body,
    });
  }

  function publishAnnouncement() {
    if (!draft) return;

    const current = readStorage(ANNOUNCEMENTS_KEY, []);

    writeStorage(ANNOUNCEMENTS_KEY, [
      {
        ...draft,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setStatus("Announcement published to SchoolSync.");
  }

  async function copyAnnouncement() {
    if (!draft) return;

    try {
      await navigator.clipboard.writeText(draft.body);
      setStatus("Announcement copied to your clipboard.");
    } catch {
      setStatus("Clipboard access is unavailable. You can copy the announcement manually.");
    }
  }

  function reset() {
    setForm({
      topic: "",
      details: "",
      category: "Academics",
      date: "",
      time: "",
      location: "",
      audience: "All students",
      priority: "General",
    });
    setDraft(null);
    setStatus("");
  }

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">AI SCHOOL COMMUNICATION</p>
          <h1>AI Announcement Assistant</h1>
          <p className="subtitle">
            Turn a few details into a polished SchoolSync announcement, review it,
            and publish it when it is ready.
          </p>
        </div>
      </header>

      <div className="ai-intro-card">
        <div className="ai-intro-icon">
          <Sparkles size={27} />
        </div>
        <div>
          <h2>Create announcements instead of just analyzing them.</h2>
          <p>
            Give the assistant the important information. It will organize the
            details into a clean announcement that you can edit, copy, or publish.
          </p>
        </div>
      </div>

      <section className="ai-workspace">
        <div className="ai-form-grid">
          <label className="ai-label">
            Announcement title
            <input
              className="ai-input"
              value={form.topic}
              onChange={(event) => updateField("topic", event.target.value)}
              placeholder="Robotics Club Meeting"
            />
          </label>

          <label className="ai-label">
            Category
            <select
              className="ai-input"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="ai-label ai-full-width">
            Important details
            <textarea
              className="ai-textarea"
              value={form.details}
              onChange={(event) => updateField("details", event.target.value)}
              placeholder="Tell students what they need to know, what they need to bring, and what they need to do."
              rows={6}
            />
          </label>

          <label className="ai-label">
            Date
            <input
              className="ai-input"
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </label>

          <label className="ai-label">
            Time
            <input
              className="ai-input"
              type="time"
              value={form.time}
              onChange={(event) => updateField("time", event.target.value)}
            />
          </label>

          <label className="ai-label">
            Location
            <input
              className="ai-input"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Room 204"
            />
          </label>

          <label className="ai-label">
            Audience
            <select
              className="ai-input"
              value={form.audience}
              onChange={(event) => updateField("audience", event.target.value)}
            >
              <option>All students</option>
              <option>Specific club</option>
              <option>Grade level</option>
              <option>Staff</option>
              <option>Other</option>
            </select>
          </label>

          <label className="ai-label">
            Priority
            <select
              className="ai-input"
              value={form.priority}
              onChange={(event) => updateField("priority", event.target.value)}
            >
              <option>General</option>
              <option>Important</option>
            </select>
          </label>
        </div>

        <div className="ai-actions">
          <button
            type="button"
            className="ai-primary-button"
            onClick={generateAnnouncement}
          >
            <Sparkles size={17} />
            Generate announcement
          </button>

          <button type="button" className="ai-secondary-button" onClick={reset}>
            <RotateCcw size={16} />
            Clear
          </button>
        </div>

        {status && <p className="ai-status">{status}</p>}
      </section>

      {draft && (
        <section className="ai-results">
          <div className="ai-results-heading">
            <div>
              <p className="eyebrow">READY TO REVIEW</p>
              <h2>{draft.title}</h2>
            </div>
            <div className="ai-actions ai-results-actions">
              <button type="button" className="ai-secondary-button" onClick={copyAnnouncement}>
                <Copy size={16} />
                Copy
              </button>
              <button type="button" className="ai-primary-button" onClick={publishAnnouncement}>
                <Send size={16} />
                Publish
              </button>
            </div>
          </div>

          <div className="ai-summary-card">
            <Megaphone size={20} />
            <div>
              <strong>AI-generated announcement</strong>
              <p>{draft.description}</p>
            </div>
          </div>

          <div className="ai-detail-grid">
            <article className="ai-detail-card">
              <CalendarDays size={20} />
              <strong>Date</strong>
              <p>{draft.date}</p>
            </article>
            <article className="ai-detail-card">
              <Clock size={20} />
              <strong>Time</strong>
              <p>{draft.time}</p>
            </article>
            <article className="ai-detail-card">
              <MapPin size={20} />
              <strong>Location</strong>
              <p>{draft.location}</p>
            </article>
            <article className="ai-detail-card">
              <Megaphone size={20} />
              <strong>Audience</strong>
              <p>{draft.audience}</p>
            </article>
          </div>

          <div className="ai-original-text">
            <strong>Announcement preview</strong>
            <pre className="ai-announcement-preview">{draft.body}</pre>
          </div>
        </section>
      )}
    </div>
  );
}

export default AnnouncementAI;
