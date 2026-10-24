
import { useState } from "react";
import {
  Search,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Heart,
  Code,
  Trophy,
  Users,
  BookOpen,
  Filter,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
} from "lucide-react";
import { readStorage, writeStorage } from "../data/storage";
import { useRecentListings } from "../hooks/useRecentListings";

const SAVED_STORAGE_KEY = "schoolsync-saved-scholarships";

function loadSavedScholarships() {
  const saved = readStorage(SAVED_STORAGE_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

const scholarships = [
  {
    name: "Coca-Cola Scholars Program",
    amount: "$20,000",
    category: "Leadership",
    eligibility:
      "High school seniors demonstrating leadership and service.",
    deadline: "Check the official website for the current cycle.",
    url: "https://www.coca-colascholarsfoundation.org/",
    icon: Users,
    verified: true,
  },
  {
    name: "Horatio Alger Scholarships",
    amount: "Varies",
    category: "Academic",
    eligibility:
      "Eligibility varies by award; financial need and perseverance may be considered.",
    deadline: "Check the official website for current deadlines.",
    url: "https://horatioalger.org/",
    icon: GraduationCap,
    verified: true,
  },
  {
    name: "Regeneron Science Talent Search",
    amount: "Varies by award",
    category: "STEM",
    eligibility:
      "Eligible high school seniors conducting original scientific research.",
    deadline: "Check the official competition calendar.",
    url: "https://www.societyforscience.org/regeneron-sts/",
    icon: Code,
    verified: true,
  },
  {
    name: "Jack Kent Cooke Foundation",
    amount: "Up to $55,000 per year",
    category: "Academic",
    eligibility:
      "High-achieving students with financial need; review current program criteria.",
    deadline: "Check the official website for the current cycle.",
    url: "https://www.jkcf.org/",
    icon: BookOpen,
    verified: true,
  },
  {
    name: "Burger King Foundation Scholarships",
    amount: "Varies",
    category: "Community",
    eligibility:
      "Eligibility depends on the scholarship program and applicant circumstances.",
    deadline: "Check current application dates and requirements.",
    url: "https://burgerkingfoundation.org/",
    icon: Heart,
    verified: true,
  },
  {
    name: "Local Community Scholarships",
    amount: "Varies",
    category: "Community",
    eligibility:
      "May be offered through local organizations, employers, and community groups.",
    deadline: "Depends on the organization.",
    url: "https://bigfuture.collegeboard.org/pay-for-college",
    icon: Users,
    verified: false,
  },
  {
    name: "The Gates Scholarship",
    amount: "Program-specific award",
    category: "Leadership",
    eligibility:
      "High school seniors from low-income backgrounds with strong academic achievement and leadership. Review current program criteria.",
    deadline: "Check the official website for the current cycle.",
    url: "https://www.thegatesscholarship.org/",
    icon: GraduationCap,
    verified: true,
  },
  {
    name: "Dell Scholars Program",
    amount: "Varies by program cycle",
    category: "Academic",
    eligibility:
      "Students who meet current college-readiness, income, and program participation requirements.",
    deadline: "Check the official website for current dates.",
    url: "https://www.dellscholars.org/",
    icon: BookOpen,
    verified: true,
  },
  {
    name: "QuestBridge National College Match",
    amount: "Partner-college financial aid package",
    category: "Academic",
    eligibility:
      "High-achieving high school seniors from low-income backgrounds. Partner-college requirements apply.",
    deadline: "Check the official website for the current cycle.",
    url: "https://www.questbridge.org/high-school-students/national-college-match",
    icon: GraduationCap,
    verified: true,
  },
  {
    name: "Elks Most Valuable Student Scholarship",
    amount: "Varies by award",
    category: "Leadership",
    eligibility:
      "U.S. high school seniors. Review current application rules and selection criteria.",
    deadline: "Check the official website for current dates.",
    url: "https://www.elks.org/scholars/scholarships/mvs.cfm",
    icon: Trophy,
    verified: true,
  },
  {
    name: "Hispanic Scholarship Fund",
    amount: "Varies by award",
    category: "Community",
    eligibility:
      "Students of Hispanic heritage who meet current academic, enrollment, and application criteria.",
    deadline: "Check the official website for the current cycle.",
    url: "https://www.hsf.net/scholarship",
    icon: Heart,
    verified: true,
  },
  {
    name: "UNCF Scholarships",
    amount: "Varies by scholarship",
    category: "Community",
    eligibility:
      "Requirements vary by award and may depend on college, major, or other criteria.",
    deadline: "Review each scholarship's current application dates.",
    url: "https://uncf.org/scholarships",
    icon: Users,
    verified: true,
  },
  {
    name: "Society of Women Engineers Scholarships",
    amount: "Varies by award",
    category: "STEM",
    eligibility:
      "Applicants pursuing engineering, technology, or computing programs. Criteria vary by award.",
    deadline: "Check the official website for current dates.",
    url: "https://swe.org/scholarships/",
    icon: Code,
    verified: true,
  },
];

const categories = [
  "All",
  "STEM",
  "Academic",
  "Leadership",
  "Community",
];

function Scholarships() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { items, status, refreshing, refresh } = useRecentListings(
    "scholarships",
    scholarships
  );
  const [savedScholarships, setSavedScholarships] =
    useState(loadSavedScholarships);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  function toggleSaved(name) {
    setSavedScholarships((previous) => {
      const updated = previous.includes(name)
        ? previous.filter((savedName) => savedName !== name)
        : [...previous, name];

      writeStorage(SAVED_STORAGE_KEY, updated);

      return updated;
    });
  }

  const filteredScholarships = items.filter((item) => {
    const text =
      `${item.name} ${item.category} ${item.eligibility}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || item.category === category;
    const matchesSaved =
      !showSavedOnly || savedScholarships.includes(item.name);

    return matchesSearch && matchesCategory && matchesSaved;
  });

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">INVEST IN YOUR FUTURE</p>
          <h1>Scholarships</h1>
          <p className="subtitle">
            Discover funding opportunities and find awards worth exploring.
          </p>
        </div>
      </header>

      <div className="scholarship-banner">
        <div className="scholarship-banner-icon">
          <DollarSign size={28} />
        </div>
        <div>
          <h2>Your next opportunity could help pay for college.</h2>
          <p>
            Compare opportunities, review eligibility, and always confirm
            details with the official scholarship provider.
          </p>
        </div>
      </div>

      <div className="search-box">
        <Search size={20} />
        <input
          type="search"
          placeholder="Search scholarships, subjects, or eligibility..."
          aria-label="Search scholarships"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="category-filters">
        <Filter size={17} />
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-button ${
              category === item ? "active" : ""
            }`}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="scholarship-actions">
        <button
          type="button"
          className={`filter-button ${showSavedOnly ? "active" : ""}`}
          aria-pressed={showSavedOnly}
          onClick={() => setShowSavedOnly((previous) => !previous)}
        >
          <BookmarkCheck size={17} />
          {showSavedOnly ? "Show all scholarships" : "Saved scholarships"}
          {" "}({savedScholarships.length})
        </button>
        <button
          type="button"
          className="filter-button"
          onClick={refresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} />
          {refreshing ? "Updating..." : "Refresh listings"}
        </button>
      </div>

      <p className="result-count" role="status">{status}</p>

      <div className="section-header">
        <h2>
          {showSavedOnly ? "Your saved scholarships" : "Explore opportunities"}
        </h2>
        <span className="result-count">
          {filteredScholarships.length} results
        </span>
      </div>

      <div className="scholarship-grid">
        {filteredScholarships.map((item) => {
          const Icon = item.icon || GraduationCap;
          const isSaved = savedScholarships.includes(item.name);

          return (
            <article
              className="quick-card scholarship-card"
              key={item.id || item.name}
            >
              <div className="scholarship-card-top">
                <div className="quick-icon">
                  <Icon size={22} />
                </div>
                <span className="scholarship-category">
                  {item.category}
                </span>
              </div>

              <h3>{item.name}</h3>

              <div className="scholarship-amount">
                {item.amount}
              </div>
              <p className="amount-caption">Listed award amount</p>

              {item.publishedAt && (
                <p className="amount-caption">
                  Posted {new Date(item.publishedAt).toLocaleDateString()} via {item.source}
                </p>
              )}

              <div className="eligibility-block">
                <strong>Who may qualify</strong>
                <p>{item.eligibility}</p>
              </div>

              <div className="eligibility-block">
                <strong>Deadline</strong>
                <p>{item.deadline}</p>
              </div>

              <p className="scholarship-disclaimer">
                {item.source
                  ? "Recent listing. Confirm eligibility and deadlines with the official provider."
                  : item.verified
                  ? "Program listed. Confirm current award details and eligibility."
                  : "General resource. Find individual awards and verify their details."}
              </p>

              <button
                type="button"
                className="scholarship-save-button"
                onClick={() => toggleSaved(item.name)}
                aria-pressed={isSaved}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={17} />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark size={17} />
                    Save scholarship
                  </>
                )}
              </button>

              <a
                className="resource-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.source ? "Open listing" : "Visit official resource"} <ExternalLink size={15} />
              </a>
            </article>
          );
        })}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="empty-announcements">
          <Search size={28} />
          <h3>
            {showSavedOnly
              ? "No saved scholarships found"
              : "No scholarships found"}
          </h3>
          <p>
            {showSavedOnly
              ? "Save a scholarship to see it listed here."
              : "Try another keyword or select a different category."}
          </p>
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setShowSavedOnly(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <p className="demo-notice">
        Recent listings come from Opportunity Desk and expire from this page after
        90 days or when a listed deadline passes. Confirm details with each official
        provider. The evergreen directory appears when the live feed is unavailable.
        Saved scholarships are stored in this browser on this device.
      </p>
    </div>
  );
}

export default Scholarships;
