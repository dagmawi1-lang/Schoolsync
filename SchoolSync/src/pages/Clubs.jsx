import { useState } from "react";
import {
  Search,
  School,
  Code,
  Cpu,
  Heart,
  Palette,
  Trophy,
  CalendarDays,
  MapPin,
  PlusCircle,
  Plus,
  X,
  Trash2
} from "lucide-react";
import { readStorage, writeStorage } from "../data/storage";

const STORAGE_KEY = "schoolsync-custom-clubs";

const categories = [
  "All",
  "Academic",
  "Arts",
  "Community Service",
  "Culture & Language",
  "Technology",
  "STEM",
  "Sports",
  "Student Life",
  "Other"
];

const categoryIcons = {
  Technology: Code,
  "Community Service": Heart,
  Arts: Palette,
  Academic: Trophy
};

function loadCustomClubs() {
  const clubs = readStorage(STORAGE_KEY, []);
  if (!Array.isArray(clubs)) return [];

  return clubs.filter(
    (club) =>
      club &&
      typeof club.id === "string" &&
      typeof club.name === "string" &&
      typeof club.category === "string"
  );
}

function Clubs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [customClubs, setCustomClubs] = useState(loadCustomClubs);

  const [form, setForm] = useState({
    name: "",
    category: "Technology",
    description: "",
    meeting: "",
    location: ""
  });

  const allClubs = customClubs.map((club) => ({
    ...club,
    icon: categoryIcons[club.category] || School,
    isCustom: true
  }));

  const filteredClubs = allClubs.filter((club) => {
    const text =
      `${club.name} ${club.category} ${club.description}`.toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (category === "All" || club.category === category)
    );
  });

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function saveClub(event) {
    event.preventDefault();
    setFormError("");

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.meeting.trim() ||
      !form.location.trim()
    ) {
      setFormError("Please complete every field before creating the club.");
      return;
    }

    const newClub = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      meeting: form.meeting.trim(),
      location: form.location.trim()
    };

    const updatedClubs = [newClub, ...customClubs];

    if (writeStorage(STORAGE_KEY, updatedClubs)) {
      setCustomClubs(updatedClubs);

      setForm({
        name: "",
        category: "Technology",
        description: "",
        meeting: "",
        location: ""
      });

      setShowForm(false);
      setFormError("");
      setSearch("");
      setCategory("All");
    } else {
      setFormError(
        "This club could not be saved in this browser. Check your browser storage settings."
      );
    }
  }

  function deleteClub(id) {
    const updatedClubs = customClubs.filter((club) => club.id !== id);

    if (writeStorage(STORAGE_KEY, updatedClubs)) {
      setCustomClubs(updatedClubs);
    } else {
      setFormError("The club could not be deleted. Please try again.");
    }
  }

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">FIND YOUR COMMUNITY</p>
          <h1>Clubs & Organizations</h1>
          <p className="subtitle">
            Discover student groups, find ways to get involved, and create
            a club when you are ready to build something new.
          </p>
        </div>
      </header>

      <div className="clubs-highlight">
        <div className="clubs-highlight-icon">
          <School size={28} />
        </div>
        <div>
          <h2>Find your people. Build something together.</h2>
          <p>
            Explore interests, connect with school communities, and create
            your own student organization.
          </p>
        </div>
      </div>

      <div className="clubs-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="search"
            placeholder="Search clubs, interests, or categories..."
            aria-label="Search clubs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="create-club-button"
          onClick={() => {
            setShowForm((value) => !value);
            setFormError("");
          }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Create club"}
        </button>
      </div>

      {showForm && (
        <section className="club-form-card">
          <div className="club-form-heading">
            <div>
              <p className="eyebrow">START SOMETHING NEW</p>
              <h2>Create a club</h2>
              <p>
                Add a club to your local SchoolSync directory.
              </p>
            </div>

            <School size={28} />
          </div>

          <form onSubmit={saveClub}>
            <div className="club-form-grid">
              <label className="club-form-field">
                Club name *
                <input
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  placeholder="e.g. AI & Machine Learning Club"
                  maxLength={100}
                  required
                />
              </label>

              <label className="club-form-field">
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

              <label className="club-form-field club-form-wide">
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="Explain what the club does and what students can expect."
                  rows={3}
                  maxLength={500}
                  required
                />
              </label>

              <label className="club-form-field">
                Meeting information *
                <input
                  name="meeting"
                  value={form.meeting}
                  onChange={updateForm}
                  placeholder="e.g. Thursdays after school"
                  maxLength={100}
                  required
                />
              </label>

              <label className="club-form-field">
                Location *
                <input
                  name="location"
                  value={form.location}
                  onChange={updateForm}
                  placeholder="e.g. Room 204"
                  maxLength={120}
                  required
                />
              </label>
            </div>

            {formError && (
              <p className="club-form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="club-form-footer">
              <p>* Required fields</p>

              <button type="submit" className="create-club-button">
                <Plus size={18} />
                Save club
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="category-filters">
        <School size={17} />

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
        <h2>Student clubs</h2>
        <span className="result-count">{filteredClubs.length} listings</span>
      </div>

      <div className="clubs-grid">
        {filteredClubs.map((club) => {
          const Icon = club.icon;

          return (
            <article className="quick-card club-card" key={club.id}>
              <div className="quick-icon">
                <Icon size={22} />
              </div>

              <span className="announcement-category">
                {club.category}
              </span>

              <h3>{club.name}</h3>
              <p>{club.description}</p>

              <div className="club-detail">
                <span>
                  <CalendarDays size={15} />
                  {club.meeting}
                </span>

                <span>
                  <MapPin size={15} />
                  {club.location}
                </span>
              </div>

              {club.isCustom && (
                <div className="custom-club-footer">
                  <span>Your club · Saved on this device</span>

                  <button
                    type="button"
                    className="delete-club-button"
                    onClick={() => deleteClub(club.id)}
                    aria-label={`Delete ${club.name}`}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              )}

              {!club.isCustom && (
                <a
                  className="resource-link"
                  href="mailto:"
                  onClick={(event) => {
                    event.preventDefault();

                    window.alert(
                      "Club contact requests will be available when SchoolSync is connected to your school's club directory."
                    );
                  }}
                >
                  <PlusCircle size={15} />
                  Request club information
                </a>
              )}
            </article>
          );
        })}
      </div>

      {filteredClubs.length === 0 && (
        <div className="empty-announcements">
          <Search size={28} />
          <h3>No clubs found</h3>
          <p>Try another keyword or category.</p>

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
        Only clubs created in SchoolSync are shown here. Clubs you create are
        saved in this browser on this device and are not yet shared with other
        SchoolSync users.
      </p>
    </div>
  );
}

export default Clubs;