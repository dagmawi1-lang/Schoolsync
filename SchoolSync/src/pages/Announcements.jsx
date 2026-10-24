
import { useEffect, useState } from "react";
import {
  Search,
  Megaphone,
  CalendarDays,
  MapPin,
  Clock,
  Filter,
  Volume2,
  VolumeX,
} from "lucide-react";
import { readStorage, subscribeToStorage } from "../data/storage";

const ANNOUNCEMENTS_KEY = "schoolsync-announcements";


const categories = [
  "All",
  "Academics",
  "Clubs",
  "Events",
  "Deadlines",
];

function Announcements() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [speakingId, setSpeakingId] = useState(null);
  const [announcements, setAnnouncements] = useState(() =>
    readStorage(ANNOUNCEMENTS_KEY, [])
  );

  useEffect(() => {
    return subscribeToStorage(({ key, value }) => {
      if (key === ANNOUNCEMENTS_KEY) {
        setAnnouncements(Array.isArray(value) ? value : []);
      }
    });
  }, []);

  function readAnnouncement(item) {
    if (!("speechSynthesis" in window)) {
      window.alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingId === item.id) {
      setSpeakingId(null);
      return;
    }

    const textToRead = [
      item.title,
      item.category,
      item.description,
      `Date: ${item.date}`,
      `Time: ${item.time}`,
      `Location: ${item.location}`,
    ].join(". ");

    const speech = new SpeechSynthesisUtterance(textToRead);
    speech.rate = 0.95;

    speech.onend = () => setSpeakingId(null);
    speech.onerror = () => setSpeakingId(null);

    setSpeakingId(item.id);
    window.speechSynthesis.speak(speech);
  }

  const filteredAnnouncements = announcements.filter((item) => {
    const searchText =
      `${item.title} ${item.description} ${item.location} ${item.category}`
        .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="announcements-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">STAY IN THE LOOP</p>
          <h1>Announcements</h1>
          <p className="subtitle">
            Important school updates, club activities, events,
            and deadlines in one place.
          </p>
        </div>
      </header>

      <div className="announcement-tools">
        <div className="search-box">
          <Search size={20} />
          <input
            type="search"
            placeholder="Search announcements..."
            aria-label="Search announcements"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div
        className="category-filters"
        aria-label="Filter announcements"
      >
        <Filter size={17} />

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-button ${
              activeCategory === category ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category)}
            aria-pressed={activeCategory === category}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="announcement-results">
        <div className="section-header">
          <h2>School updates</h2>
          <span className="result-count">
            {filteredAnnouncements.length} found
          </span>
        </div>

        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => (
            <article
              className="full-announcement-card"
              key={item.id}
            >
              <div className="full-announcement-top">
                <div className="announcement-title-group">
                  <div className="announcement-icon">
                    <Megaphone size={21} />
                  </div>

                  <div>
                    <h3>{item.title}</h3>
                    <span className="announcement-category">
                      {item.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`priority-badge ${
                    item.priority === "Important"
                      ? "important"
                      : ""
                  }`}
                >
                  {item.priority}
                </span>
              </div>

              <p className="announcement-description">
                {item.description}
              </p>

              <div className="announcement-details">
                <span>
                  <CalendarDays size={16} />
                  {item.date}
                </span>

                <span>
                  <Clock size={16} />
                  {item.time}
                </span>

                <span>
                  <MapPin size={16} />
                  {item.location}
                </span>
              </div>

              <button
                type="button"
                className="speech-button"
                onClick={() => readAnnouncement(item)}
                aria-label={
                  speakingId === item.id
                    ? `Stop reading ${item.title}`
                    : `Read ${item.title} aloud`
                }
              >
                {speakingId === item.id ? (
                  <>
                    <VolumeX size={17} />
                    Stop reading
                  </>
                ) : (
                  <>
                    <Volume2 size={17} />
                    Read aloud
                  </>
                )}
              </button>
            </article>
          ))
        ) : (
          <div className="empty-announcements">
            <Megaphone size={32} />
            <h3>No announcements found</h3>
            <p>
              Try a different search term or select another category.
            </p>

            <button
              type="button"
              className="reset-button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {announcements.length === 0 && (
        <p className="demo-notice">No school announcements have been published yet. Use the AI Announcement Assistant to create one.</p>
      )}
    </div>
  );
}

export default Announcements;
