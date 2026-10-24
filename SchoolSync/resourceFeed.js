const feedCategories = {
  scholarships: 6,
  opportunities: 161
};

const feedCache = new Map();
const cacheDurationMs = 15 * 60 * 1000;
const forcedRefreshIntervalMs = 30 * 1000;
const maximumPostAgeMs = 90 * 24 * 60 * 60 * 1000;
const maximumResponseBytes = 1024 * 1024;
const maximumListings = 24;

const monthNames = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"'
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== "#") return namedEntities[code.toLowerCase()] ?? entity;

    const number = code[1].toLowerCase() === "x"
      ? Number.parseInt(code.slice(2), 16)
      : Number.parseInt(code.slice(1), 10);

    try {
      return number > 0 && number <= 0x10ffff
        ? String.fromCodePoint(number)
        : entity;
    } catch {
      return entity;
    }
  });
}

function plainText(value) {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractDeadline(text, publishedAt) {
  const match = text.match(
    /\bdeadline\s*:\s*((?:on\s+)?(?:rolling(?: basis)?|ongoing|unspecified|to be announced|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+20\d{2})?|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s*(?:20\d{2})?))/i
  );

  if (!match) return { label: "See listing for deadline", expired: false };

  const label = match[1].trim().replace(/\s+/g, " ");
  const monthFirst = label.match(
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?/i
  );
  const dayFirst = label.match(
    /(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s*(20\d{2})?/i
  );

  if (!monthFirst && !dayFirst) {
    return { label, expired: false };
  }

  const monthName = (monthFirst ? monthFirst[1] : dayFirst[2]).toLowerCase();
  const month = monthNames.findIndex((name) => name.startsWith(monthName.slice(0, 3)));
  const day = Number(monthFirst ? monthFirst[2] : dayFirst[1]);
  const year = Number((monthFirst ? monthFirst[3] : dayFirst[3]) || publishedAt.getUTCFullYear());
  const deadline = new Date(Date.UTC(year, month, day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    label,
    expired: deadline < today
  };
}

function scholarshipCategory(text) {
  if (/\b(stem|science|engineering|technology|computer|math|research)\b/i.test(text)) {
    return "STEM";
  }
  if (/\b(leadership|leader|service)\b/i.test(text)) return "Leadership";
  if (/\b(community|hispanic|african|indigenous|tribal)\b/i.test(text)) {
    return "Community";
  }
  return "Academic";
}

function opportunityType(text) {
  if (/\b(competition|contest|challenge|olympiad)\b/i.test(text)) {
    return "Competitions";
  }
  if (/\b(volunteer|volunteering|community service)\b/i.test(text)) {
    return "Volunteering";
  }
  if (/\b(career|job shadow|career exploration)\b/i.test(text)) {
    return "Career Exploration";
  }
  if (/\b(internship|intern|traineeship)\b/i.test(text)) return "Internships";
  return "Programs";
}

function opportunityField(text) {
  if (/\b(cybersecurity|cyber defense)\b/i.test(text)) return "Cybersecurity";
  if (/\b(engineering|technology|software|coding|computer|data science)\b/i.test(text)) {
    return "Technology";
  }
  if (/\b(science|research|laboratory)\b/i.test(text)) return "Science and research";
  if (/\b(community|volunteer|service)\b/i.test(text)) return "Community service";
  if (/\b(health|medical|medicine)\b/i.test(text)) return "Health";
  if (/\b(policy|government|public service)\b/i.test(text)) return "Public service";
  if (/\b(art|design|writing|journalism|media)\b/i.test(text)) return "Arts and media";
  return "Student programs";
}

function normalizePost(post, kind) {
  const title = plainText(post?.title?.rendered);
  const excerpt = plainText(post?.excerpt?.rendered);
  const publishedAt = new Date(post?.date);
  let url;

  try {
    url = new URL(post?.link);
  } catch {
    return null;
  }

  const age = Date.now() - publishedAt.getTime();
  if (
    !Number.isSafeInteger(post?.id) ||
    !title ||
    !Number.isFinite(publishedAt.getTime()) ||
    age < -24 * 60 * 60 * 1000 ||
    age > maximumPostAgeMs ||
    url.protocol !== "https:" ||
    url.hostname !== "opportunitydesk.org"
  ) {
    return null;
  }

  const searchText = `${title} ${excerpt}`;
  if (kind === "scholarships" && !/\b(scholarship|fellowship|grant|bursary|award)\b/i.test(searchText)) {
    return null;
  }

  const deadline = extractDeadline(searchText, publishedAt);
  if (deadline.expired) return null;

  if (kind === "scholarships") {
    return {
      id: String(post.id),
      name: title,
      amount: "See listing",
      category: scholarshipCategory(searchText),
      eligibility: excerpt.slice(0, 700) || "See the listing for eligibility requirements.",
      deadline: deadline.label,
      url: url.href,
      publishedAt: publishedAt.toISOString(),
      source: "Opportunity Desk"
    };
  }

  return {
    id: String(post.id),
    title,
    type: opportunityType(searchText),
    field: opportunityField(searchText),
    description: excerpt.slice(0, 700) || "See the listing for program details.",
    eligibility: "Review the listing and organizer requirements before applying.",
    deadline: deadline.label,
    url: url.href,
    publishedAt: publishedAt.toISOString(),
    source: "Opportunity Desk"
  };
}

async function readResponseBody(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Feed response had no body");

  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > maximumResponseBytes) {
      await reader.cancel();
      throw new Error("Feed response was too large");
    }

    chunks.push(value);
  }

  const body = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  return JSON.parse(body.toString("utf8"));
}

export async function getRecentListings(kind, forceRefresh = false) {
  const category = feedCategories[kind];
  if (!category) throw new Error("Unsupported resource feed");

  const now = Date.now();
  const cached = feedCache.get(kind);
  if (cached && now - cached.fetchedAt < cacheDurationMs) {
    return { ...cached.payload, cached: true };
  }
  if (cached && forceRefresh && now - cached.fetchedAt < forcedRefreshIntervalMs) {
    return { ...cached.payload, cached: true };
  }

  const feedUrl = new URL("https://opportunitydesk.org/wp-json/wp/v2/posts");
  feedUrl.search = new URLSearchParams({
    categories: String(category),
    per_page: "40",
    orderby: "date",
    order: "desc",
    _fields: "id,date,link,title,excerpt"
  }).toString();

  const response = await fetch(feedUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    redirect: "error"
  });
  if (!response.ok) throw new Error("Feed provider returned an error");

  const posts = await readResponseBody(response);
  if (!Array.isArray(posts)) throw new Error("Feed provider returned invalid data");

  const items = posts
    .map((post) => normalizePost(post, kind))
    .filter(Boolean)
    .slice(0, maximumListings);
  const payload = {
    source: "Opportunity Desk",
    updatedAt: new Date().toISOString(),
    items
  };

  feedCache.set(kind, { fetchedAt: now, payload });
  return { ...payload, cached: false };
}