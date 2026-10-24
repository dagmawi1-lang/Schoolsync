
import { useState } from "react";
import {
  Search,
  GraduationCap,
  ClipboardCheck,
  FileText,
  CalendarDays,
  ExternalLink,
  Compass,
  BookOpen,
} from "lucide-react";
import { readStorage, writeStorage } from "../data/storage";

const CHECKLIST_STORAGE_KEY = "schoolsync-college-checklist";

function loadChecklist() {
  const checklist = readStorage(CHECKLIST_STORAGE_KEY, []);
  return Array.isArray(checklist) ? checklist : [];
}

const resources = [
  {
    title: "Explore Colleges",
    category: "College Search",
    description:
      "Research colleges, compare programs, and discover schools that fit your goals.",
    icon: Compass,
    url: "https://bigfuture.collegeboard.org/college-search",
  },
  {
    title: "Common App",
    category: "Applications",
    description:
      "Explore the college application platform used by many colleges.",
    icon: FileText,
    url: "https://www.commonapp.org/",
  },
  {
    title: "Federal Student Aid",
    category: "Financial Aid",
    description:
      "Learn about federal financial aid, FAFSA, grants, and student loans.",
    icon: GraduationCap,
    url: "https://studentaid.gov/",
  },
  {
    title: "College Scorecard",
    category: "College Research",
    description:
      "Compare colleges using information about programs, costs, and outcomes.",
    icon: ClipboardCheck,
    url: "https://collegescorecard.ed.gov/",
  },
  {
    title: "BigFuture Scholarships",
    category: "Financial Aid",
    description:
      "Explore scholarship opportunities and tools for planning college costs.",
    icon: BookOpen,
    url: "https://bigfuture.collegeboard.org/pay-for-college",
  },
  {
    title: "College Application Timeline",
    category: "Planning",
    description:
      "Review application deadlines and organize the tasks you need to complete.",
    icon: CalendarDays,
    url: "https://bigfuture.collegeboard.org/plan-for-college",
  },
];

const tasks = [
  "Build a list of colleges to research",
  "Review admission requirements",
  "Prepare a resume of activities and achievements",
  "Ask teachers about recommendation letters",
  "Draft and revise a personal statement",
  "Research scholarships and financial aid",
  "Track application deadlines",
];

function College() {
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState(loadChecklist);

  function toggleTask(task) {
    setCompleted((previous) => {
      const updated = previous.includes(task)
        ? previous.filter((item) => item !== task)
        : [...previous, task];

      writeStorage(CHECKLIST_STORAGE_KEY, updated);

      return updated;
    });
  }

  const filteredResources = resources.filter((resource) =>
    `${resource.title} ${resource.category} ${resource.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const progress =
    (completed.filter((task) => tasks.includes(task)).length /
      tasks.length) *
    100;

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">PLAN YOUR FUTURE</p>
          <h1>College Planning</h1>
          <p className="subtitle">
            Research colleges, organize your applications, and
            take the next step toward your future.
          </p>
        </div>
      </header>

      <div className="college-progress-card">
        <div className="progress-heading">
          <div>
            <p className="eyebrow">YOUR APPLICATION CHECKLIST</p>
            <h2>One step at a time</h2>
          </div>
          <GraduationCap size={30} />
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-label="College application checklist progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="subtitle">
          {completed.filter((task) => tasks.includes(task)).length} of{" "}
          {tasks.length} tasks completed
        </p>

        <div className="college-tasks">
          {tasks.map((task) => (
            <label className="college-task" key={task}>
              <input
                type="checkbox"
                checked={completed.includes(task)}
                onChange={() => toggleTask(task)}
              />
              <span>{task}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="search-box">
        <Search size={20} />
        <input
          type="search"
          placeholder="Search college resources..."
          aria-label="Search college resources"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="section-header">
        <h2>College planning tools</h2>
        <span className="result-count">
          {filteredResources.length} resources
        </span>
      </div>

      <div className="resource-grid">
        {filteredResources.map((resource) => {
          const Icon = resource.icon;

          return (
            <article
              className="quick-card resource-card"
              key={resource.title}
            >
              <div className="quick-icon">
                <Icon size={22} />
              </div>

              <span className="announcement-category">
                {resource.category}
              </span>

              <h3>{resource.title}</h3>
              <p>{resource.description}</p>

              <a
                className="resource-link"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore resource <ExternalLink size={15} />
              </a>
            </article>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="empty-announcements">
          <Search size={28} />
          <h3>No resources found</h3>
          <p>
            Try searching for colleges, applications, or financial aid.
          </p>
        </div>
      )}

      <p className="demo-notice">
        These are external resources. Always verify application
        deadlines and financial aid requirements with official sources.
        Your checklist progress is saved in this browser on this device.
      </p>
    </div>
  );
}

export default College;
