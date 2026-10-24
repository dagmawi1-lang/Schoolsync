
import { useState } from "react";
import {
  Search,
  Rocket,
  Code,
  Trophy,
  Heart,
  BriefcaseBusiness,
  ExternalLink,
  CalendarDays,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import { useRecentListings } from "../hooks/useRecentListings";

const opportunities = [
  {
    title: "NASA Internships",
    type: "Internships",
    field: "STEM",
    description:
      "Explore internship programs related to science, technology, engineering, and space.",
    eligibility:
      "Requirements vary by program, age, education, and citizenship.",
    deadline: "Check the official program page.",
    url: "https://intern.nasa.gov/",
    icon: Rocket
  },
  {
    title: "MIT THINK Scholars Program",
    type: "Competitions",
    field: "STEM",
    description:
      "Explore a student research initiative supporting selected science and technology project proposals.",
    eligibility:
      "Review current eligibility and application rules before applying.",
    deadline: "Check the official program page.",
    url: "https://think.mit.edu/",
    icon: Lightbulb
  },
  {
    title: "Congressional App Challenge",
    type: "Competitions",
    field: "Technology",
    description:
      "Build an app and explore a congressional district's student app-development competition.",
    eligibility:
      "Eligibility depends on congressional district and current competition rules.",
    deadline: "Check the current competition cycle.",
    url: "https://www.congressionalappchallenge.us/",
    icon: Code
  },
  {
    title: "FIRST Robotics",
    type: "Competitions",
    field: "Engineering",
    description:
      "Discover robotics programs that combine engineering, programming, and teamwork.",
    eligibility:
      "Programs and age requirements vary. Check the official site for options.",
    deadline: "Season schedules vary.",
    url: "https://www.firstinspires.org/",
    icon: Trophy
  },
  {
    title: "Smithsonian Volunteer Opportunities",
    type: "Volunteering",
    field: "Community",
    description:
      "Explore volunteer and learning opportunities with Smithsonian museums and programs.",
    eligibility:
      "Age limits and availability vary by role and location.",
    deadline: "Check individual opportunities.",
    url: "https://www.si.edu/Volunteer",
    icon: Heart
  },
  {
    title: "CareerOneStop",
    type: "Career Exploration",
    field: "Careers",
    description:
      "Research careers, skills, training pathways, and ways to explore occupations.",
    eligibility:
      "Open career exploration resource; specific programs may have their own requirements.",
    deadline: "Self-guided resource.",
    url: "https://www.careeronestop.org/",
    icon: BriefcaseBusiness
  },
  {
    title: "Bank of America Student Leaders",
    type: "Internships",
    field: "Community leadership",
    description:
      "Explore a student leadership initiative that connects young people with community-focused work.",
    eligibility:
      "Eligibility and participating locations vary by cycle. Review the current program requirements.",
    deadline: "Check the official website for current dates.",
    url: "https://about.bankofamerica.com/en/making-an-impact/student-leaders",
    icon: Heart
  },
  {
    title: "DoSomething Campaigns",
    type: "Volunteering",
    field: "Community service",
    description:
      "Find youth-led campaigns and practical ways to take action on issues in your community.",
    eligibility:
      "Campaign requirements vary. Check age and participation details for each activity.",
    deadline: "Campaign dates vary.",
    url: "https://www.dosomething.org/",
    icon: Heart
  },
  {
    title: "National History Day",
    type: "Competitions",
    field: "History and research",
    description:
      "Create a documentary, exhibit, paper, performance, or website around an annual history theme.",
    eligibility:
      "Open to students in grades 6-12 through participating schools and regional programs.",
    deadline: "Dates vary by regional and state program.",
    url: "https://www.nhd.org/",
    icon: Trophy
  },
  {
    title: "Scholastic Art & Writing Awards",
    type: "Competitions",
    field: "Arts and writing",
    description:
      "Submit original artwork or writing to a regional program for recognition and awards.",
    eligibility:
      "Students in grades 7-12; available categories and regional requirements vary.",
    deadline: "Check the official website for regional deadlines.",
    url: "https://www.artandwriting.org/",
    icon: Lightbulb
  },
  {
    title: "Girls Who Code Programs",
    type: "Programs",
    field: "Technology",
    description:
      "Explore coding programs, clubs, and learning opportunities for students.",
    eligibility:
      "Program formats, age ranges, and enrollment requirements vary.",
    deadline: "Check the official website for current programs.",
    url: "https://girlswhocode.com/programs",
    icon: Code
  },
  {
    title: "CyberPatriot",
    type: "Competitions",
    field: "Cybersecurity",
    description:
      "Build cybersecurity and IT skills through a team-based cyber defense competition.",
    eligibility:
      "Teams and divisions have specific school, grade, and registration requirements.",
    deadline: "Check the official website for the current competition schedule.",
    url: "https://www.uscyberpatriot.org/",
    icon: Code
  },
  {
    title: "USAJOBS Student Pathways",
    type: "Internships",
    field: "Public service",
    description:
      "Search federal student and recent graduate internship pathways across agencies.",
    eligibility:
      "Requirements vary by agency and posting. Review each listing before applying.",
    deadline: "Application windows vary by position.",
    url: "https://www.usajobs.gov/Help/working-in-government/unique-hiring-paths/students/",
    icon: BriefcaseBusiness
  },
  {
    title: "Youth Service America",
    type: "Volunteering",
    field: "Service learning",
    description:
      "Find youth service initiatives, event opportunities, and resources for community projects.",
    eligibility:
      "Opportunities and grant requirements vary by program.",
    deadline: "Check the official website for current opportunities.",
    url: "https://ysa.org/",
    icon: Heart
  }
];

const types = [
  "All",
  "Internships",
  "Competitions",
  "Volunteering",
  "Career Exploration",
  "Programs"
];

function Opportunities() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const { items, status, refreshing, refresh } = useRecentListings(
    "opportunities",
    opportunities
  );

  const filtered = items.filter((item) => {
    const searchableText =
      `${item.title} ${item.type} ${item.field} ${item.description} ${item.eligibility}`
        .toLowerCase();

    return (
      searchableText.includes(search.toLowerCase()) &&
      (type === "All" || item.type === type)
    );
  });

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">TAKE YOUR NEXT STEP</p>
          <h1>Opportunities</h1>
          <p className="subtitle">
            Discover ways to build skills, gain experience, and make an impact.
          </p>
        </div>
      </header>

      <div className="opportunity-highlight">
        <div className="opportunity-highlight-icon">
          <Rocket size={27} />
        </div>
        <div>
          <h2>Turn your interests into experience.</h2>
          <p>
            Explore programs, competitions, volunteering, and career resources.
            Always check official eligibility and deadlines.
          </p>
        </div>
      </div>

      <div className="search-box">
        <Search size={20} />
        <input
          type="search"
          placeholder="Search internships, coding, volunteering..."
          aria-label="Search opportunities"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="category-filters">
        <CalendarDays size={17} />
        {types.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-button ${type === item ? "active" : ""}`}
            aria-pressed={type === item}
            onClick={() => setType(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="section-header resource-feed-controls">
        <span className="result-count" role="status">{status}</span>
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

      <div className="section-header">
        <h2>Explore opportunities</h2>
        <span className="result-count">{filtered.length} results</span>
      </div>

      <div className="resource-grid">
        {filtered.map((item) => {
          const Icon = item.icon || Rocket;

          return (
            <article className="quick-card resource-card" key={item.id || item.title}>
              <div className="quick-icon">
                <Icon size={22} />
              </div>

              <span className="announcement-category">{item.type}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <div className="opportunity-detail">
                <strong>Field</strong>
                <span>{item.field}</span>
              </div>

              <div className="opportunity-detail">
                <strong>Eligibility</strong>
                <span>{item.eligibility}</span>
              </div>

              <div className="opportunity-detail">
                <strong>Deadline</strong>
                <span>{item.deadline}</span>
              </div>

              {item.publishedAt && (
                <div className="opportunity-detail">
                  <strong>Posted</strong>
                  <span>
                    {new Date(item.publishedAt).toLocaleDateString()} via {item.source}
                  </span>
                </div>
              )}

              <a
                className="resource-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.source ? "Open listing" : "View official resource"} <ExternalLink size={15} />
              </a>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-announcements">
          <Search size={28} />
          <h3>No opportunities found</h3>
          <p>Try a different keyword or category.</p>
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              setSearch("");
              setType("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <p className="demo-notice">
        Recent listings come from Opportunity Desk and expire from this page after
        90 days or when a listed deadline passes. Confirm details with the official
        provider. The evergreen directory appears when the live feed is unavailable.
      </p>
    </div>
  );
}

export default Opportunities;
