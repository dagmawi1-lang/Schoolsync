import { useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Trophy,
  GraduationCap,
  Megaphone,
  Plus,
  Trash2,
  X
} from "lucide-react";
import {
  readStorage,
  writeStorage,
  subscribeToStorage
} from "../data/storage";

const STORAGE_KEY = "schoolsync-custom-events";

const categories = [
  "All",
  "Academic",
  "Arts & Music",
  "Career",
  "Clubs",
  "College",
  "Competitions",
  "Community Service",
  "School",
  "Sports",
  "STEM",
  "Student Life",
  "Testing",
  "Workshops",
  "Other"
];

const categoryIcons = {
  Academic: GraduationCap,
  "Arts & Music": Megaphone,
  Career: GraduationCap,
  Clubs: Users,
  College: GraduationCap,
  Competitions: Trophy,
  "Community Service": Users,
  School: Megaphone,
  Sports: Trophy,
  STEM: Trophy,
  "Student Life": Users,
  Testing: CalendarDays,
  Workshops: CalendarDays,
  Other: CalendarDays
};

const defaultForm = {
  title: "",
  category: "School",
  date: "",
  time: "",
  location: "",
  description: ""
};

function loadCustomEvents() {
  const events = readStorage(STORAGE_KEY, []);

  if (!Array.isArray(events)) return [];

  return events.filter(
    (event) =>
      event &&
      typeof event.id === "string" &&
      typeof event.title === "string" &&
      typeof event.category === "string"
  );
}

function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customEvents, setCustomEvents] = useState(loadCustomEvents);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    // Remove legacy favorite-event data now that favorites are no longer part of SchoolSync.
    window.localStorage.removeItem("schoolsync-favorite-events");

    const unsubscribe = subscribeToStorage(({ key, value }) => {
      if (key === STORAGE_KEY) {
        setCustomEvents(Array.isArray(value) ? value : []);
      }
    });

    return unsubscribe;
  }, []);

  const allEvents = customEvents
    .map((event) => ({
      ...event,
      icon: categoryIcons[event.category] || CalendarDays,
      isCustom: true
    }))
    .filter((event) => {
      if (!event.date) return false;
      const eventDate = new Date(`${event.date}T23:59:59`);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= new Date();
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredEvents = allEvents.filter((event) => {
    const searchableText =
      `${event.title} ${event.category} ${event.description} ${event.location}`.toLowerCase();

    const matchesSearch = searchableText.includes(search.toLowerCase());
    const matchesCategory = category === "All" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function saveEvent(event) {
    event.preventDefault();
    setFormError("");

    if (
      !form.title.trim() ||
      !form.date ||
      !form.time.trim() ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      setFormError("Please complete every field before saving.");
      return;
    }

    const newEvent = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      time: form.time.trim(),
      location: form.location.trim(),
      description: form.description.trim()
    };

    const updatedEvents = [newEvent, ...customEvents];

    if (!writeStorage(STORAGE_KEY, updatedEvents)) {
      setFormError(
        "This event could not be saved. Check your browser storage settings."
      );
      return;
    }

    setCustomEvents(updatedEvents);
    setForm({ ...defaultForm });
    setShowForm(false);
    setSearch("");
    setCategory("All");
  }

  function deleteEvent(id) {
    const updatedEvents = customEvents.filter((event) => event.id !== id);

    if (!writeStorage(STORAGE_KEY, updatedEvents)) {
      setFormError("The event could not be deleted. Please try again.");
      return;
    }

    setCustomEvents(updatedEvents);
    setFormError("");
  }

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">STAY IN THE LOOP</p>
          <h1>School Events</h1>
          <p className="subtitle">
            Keep track of current school activities, meetings, competitions,
            and opportunities to connect with your community.
          </p>
        </div>
      </header>

      <div className="events-highlight">
        <div className="events-highlight-icon">
          <CalendarDays size={28} />
        </div>
        <div>
          <h2>Your school calendar, all in one place.</h2>
          <p>
            Browse current events, create your own, and find activities by
            category or keyword.
          </p>
        </div>
      </div>

      <div className="events-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="search"
            placeholder="Search events, clubs, or locations..."
            aria-label="Search school events"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="create-event-button"
          onClick={() => {
            setShowForm((current) => !current);
            setFormError("");
          }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Create event"}
        </button>
      </div>

      {showForm && (
        <section className="event-form-card">
          <div className="event-form-heading">
            <div>
              <p className="eyebrow">MAKE IT HAPPEN</p>
              <h2>Create a school event</h2>
              <p>Add an event to your local SchoolSync event list.</p>
            </div>
            <CalendarDays size={28} />
          </div>

          <form onSubmit={saveEvent}>
            <div className="event-form-grid">
              <label className="event-form-field">
                Event name *
                <input
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="e.g. Coding Club Meetup"
                  maxLength={100}
                  required
                />
              </label>

              <label className="event-form-field">
                Category *
                <select
                  name="category"
                  value={form.category}
                  onChange={updateForm}
                >
                  {categories
                    .filter((item) => item !== "All")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>

              <label className="event-form-field">
                Date *
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateForm}
                  required
                />
              </label>

              <label className="event-form-field">
                Time *
                <input
                  name="time"
                  value={form.time}
                  onChange={updateForm}
                  placeholder="e.g. 3:30 PM to 4:30 PM"
                  maxLength={60}
                  required
                />
              </label>

              <label className="event-form-field event-form-wide">
                Location *
                <input
                  name="location"
                  value={form.location}
                  onChange={updateForm}
                  placeholder="e.g. Library, Room 204, or online"
                  maxLength={120}
                  required
                />
              </label>

              <label className="event-form-field event-form-wide">
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="What should attendees know about this event?"
                  rows={3}
                  maxLength={500}
                  required
                />
              </label>
            </div>

            {formError && (
              <p className="event-form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="event-form-footer">
              <p>* Required fields</p>
              <button type="submit" className="create-event-button">
                <Plus size={18} />
                Save event
              </button>
            </div>
          </form>
        </section>
      )}

      {formError && !showForm && (
        <p className="event-form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="category-filters">
        <CalendarDays size={17} />
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-button ${category === item ? "active" : ""}`}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="section-header">
        <h2>Current events</h2>
        <span className="result-count">{filteredEvents.length} listings</span>
      </div>

      <div className="events-list">
        {filteredEvents.map((event) => {
          const Icon = event.icon;

          return (
            <article className="event-card" key={event.id}>
              <div className="event-date-icon">
                <Icon size={24} />
              </div>

              <div className="event-main">
                <div className="event-title-row">
                  <h3>{event.title}</h3>
                  <span className="announcement-category">{event.category}</span>
                </div>

                <p>{event.description}</p>

                <div className="event-details">
                  <span>
                    <CalendarDays size={15} />
                    {event.date}
                  </span>
                  <span>
                    <Clock size={15} />
                    {event.time}
                  </span>
                  <span>
                    <MapPin size={15} />
                    {event.location}
                  </span>
                </div>

                {event.isCustom && (
                  <div className="custom-event-footer">
                    <span className="custom-event-label">
                      Your event · Saved on this device
                    </span>
                    <button
                      type="button"
                      className="delete-event-button"
                      onClick={() => deleteEvent(event.id)}
                      aria-label={`Delete ${event.title}`}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="empty-announcements">
          <CalendarDays size={28} />
          <h3>No current events found</h3>
          <p>
            Try another keyword or choose a different category, or create the
            event yourself.
          </p>
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              setSearch("");
              setCategory("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <p className="demo-notice">
        Only events created in SchoolSync are shown here. Verify dates, times,
        and locations with the school or event organizer. Events are currently
        saved in this browser on this device.
      </p>
    </div>
  );
}

export default Events;
