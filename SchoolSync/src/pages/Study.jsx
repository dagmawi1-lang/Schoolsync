
import { useState } from "react";
import {
  Search,
  BookOpen,
  Calculator,
  Atom,
  Languages,
  Code,
  Globe,
  FlaskConical,
  ExternalLink
} from "lucide-react";

const resources = [
  {
    name: "Khan Academy",
    subject: "Math",
    description: "Free lessons and practice for algebra, geometry, calculus, and statistics.",
    url: "https://www.khanacademy.org/",
    tags: "algebra geometry calculus statistics"
  },
  {
    name: "Desmos",
    subject: "Math",
    description: "Explore graphs, functions, and equations with interactive calculators.",
    url: "https://www.desmos.com/",
    tags: "graphing functions equations"
  },
  {
    name: "OpenStax",
    subject: "Science",
    description: "Free textbooks covering biology, chemistry, physics, and more.",
    url: "https://openstax.org/subjects/science",
    tags: "biology chemistry physics textbooks"
  },
  {
    name: "PhET Interactive Simulations",
    subject: "Science",
    description: "Explore science and math concepts through interactive simulations.",
    url: "https://phet.colorado.edu/",
    tags: "physics chemistry experiments"
  },
  {
    name: "Purdue OWL",
    subject: "English",
    description: "Guidance for writing, grammar, research, and citations.",
    url: "https://owl.purdue.edu/",
    tags: "essays grammar research citations"
  },
  {
    name: "CommonLit",
    subject: "English",
    description: "Reading materials and literacy resources for students and educators.",
    url: "https://www.commonlit.org/",
    tags: "reading literature comprehension"
  },
  {
    name: "Khan Academy History",
    subject: "History",
    description: "Learn about world history, government, and historical events.",
    url: "https://www.khanacademy.org/humanities",
    tags: "history government humanities"
  },
  {
    name: "Library of Congress",
    subject: "History",
    description: "Explore historical documents, photographs, and primary sources.",
    url: "https://www.loc.gov/",
    tags: "primary sources documents research"
  },
  {
    name: "freeCodeCamp",
    subject: "Computer Science",
    description: "Learn programming and web development through hands-on lessons.",
    url: "https://www.freecodecamp.org/",
    tags: "coding javascript html css python"
  },
  {
    name: "CS50",
    subject: "Computer Science",
    description: "Harvard's introductory computer science course and learning materials.",
    url: "https://cs50.harvard.edu/x/",
    tags: "programming computer science algorithms"
  },
  {
    name: "SpanishDict",
    subject: "Languages",
    description: "Spanish vocabulary, grammar explanations, translations, and conjugations.",
    url: "https://www.spanishdict.com/",
    tags: "spanish vocabulary grammar verbs"
  },
  {
    name: "Language Transfer",
    subject: "Languages",
    description: "Free audio courses that help learners understand how languages work.",
    url: "https://www.languagetransfer.org/",
    tags: "languages listening speaking"
  },
  {
    name: "OpenStax Psychology",
    subject: "Psychology",
    description: "Free introductory psychology textbook and study material.",
    url: "https://openstax.org/subjects/social-sciences",
    tags: "psychology behavior brain"
  },
  {
    name: "StatQuest",
    subject: "Statistics",
    description: "Clear explanations of statistics, probability, and related concepts.",
    url: "https://statquest.org/",
    tags: "statistics probability data"
  },
  {
    name: "Google Earth",
    subject: "Geography",
    description: "Explore places, landscapes, and geography around the world.",
    url: "https://earth.google.com/",
    tags: "maps countries geography"
  },
  {
    name: "Google Arts & Culture",
    subject: "Art",
    description: "Explore artworks, museums, artists, and cultural collections.",
    url: "https://artsandculture.google.com/",
    tags: "art artists museums culture"
  }
];

const subjects = [
  "All",
  "Math",
  "Science",
  "English",
  "History",
  "Computer Science",
  "Languages",
  "Psychology",
  "Statistics",
  "Geography",
  "Art"
];

const icons = {
  Math: Calculator,
  Science: Atom,
  English: BookOpen,
  History: Globe,
  "Computer Science": Code,
  Languages: Languages,
  Psychology: Atom,
  Statistics: Calculator,
  Geography: Globe,
  Art: BookOpen
};

function Study() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");

  const filteredResources = resources.filter((resource) => {
    const searchableText =
      `${resource.name} ${resource.subject} ${resource.description} ${resource.tags}`
        .toLowerCase();

    return (
      searchableText.includes(search.toLowerCase()) &&
      (subject === "All" || resource.subject === subject)
    );
  });

  return (
    <div>
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">LEARN SOMETHING NEW</p>
          <h1>Study Resources</h1>
          <p className="subtitle">
            Discover trusted learning tools for your classes,
            exams, and personal projects.
          </p>
        </div>
      </header>

      <div className="search-box">
        <Search size={20} />
        <input
          type="search"
          placeholder="Search subjects, resources, or topics..."
          aria-label="Search study resources"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="category-filters">
        <BookOpen size={17} />

        {subjects.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-button ${subject === item ? "active" : ""}`}
            aria-pressed={subject === item}
            onClick={() => setSubject(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="section-header">
        <h2>Explore learning tools</h2>
        <span className="result-count">
          {filteredResources.length} resources
        </span>
      </div>

      <div className="resource-grid">
        {filteredResources.map((resource) => {
          const Icon = icons[resource.subject] || FlaskConical;

          return (
            <article className="quick-card resource-card" key={resource.name}>
              <div className="quick-icon">
                <Icon size={22} />
              </div>

              <span className="announcement-category">
                {resource.subject}
              </span>

              <h3>{resource.name}</h3>
              <p>{resource.description}</p>

              <a
                className="resource-link"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit resource <ExternalLink size={15} />
              </a>
            </article>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="empty-announcements">
          <BookOpen size={30} />
          <h3>No resources found</h3>
          <p>Try another subject or search term.</p>
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              setSearch("");
              setSubject("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <p className="demo-notice">
        SchoolSync links to external learning websites. Availability,
        account requirements, and individual resource terms may vary.
      </p>
    </div>
  );
}

export default Study;
