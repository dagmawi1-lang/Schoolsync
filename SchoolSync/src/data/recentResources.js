const categories = {
  scholarships: 6,
  opportunities: 161
};

const cache = new Map();
const cacheDuration = 15 * 60 * 1000;
const refreshLimit = 30 * 1000;
const maximumAge = 90 * 24 * 60 * 60 * 1000;
const maximumResponseSize = 1024 * 1024;
const maximumResults = 24;
const months = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

function decodeEntities(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;

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
  return decodeEntities(String(value || "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function getDeadline(text, publishedAt) {
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

  if (!monthFirst && !dayFirst) return { label, expired: false };

  const monthText = (monthFirst ? monthFirst[1] : dayFirst[2]).toLowerCase();
  const month = months.findIndex((name) => name.startsWith(monthText.slice(0, 3)));
  const day = Number(monthFirst ? monthFirst[2] : dayFirst[1]);
  const explicitYear = monthFirst ? monthFirst[3] : dayFirst[3];
  let year = Number(explicitYear || publishedAt.getUTCFullYear());

  if (
    !explicitYear &&
    (month < publishedAt.getUTCMonth() ||
      (month === publishedAt.getUTCMonth() && day < publishedAt.getUTCDate()))
  ) {
    year += 1;
  }

  const deadline = new Date(Date.UTC(year, month, day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return { label, expired: deadline < today };
}

function getScholarshipCategory(text) {
  if (/\b(stem|science|engineering|technology|computer|math|research)\b/i.test(text)) {
    return "STEM";
  }
  if (/\b(leadership|leader|service)\b/i.test(text)) return "Leadership";
  if (/\b(community|hispanic|african|indigenous|tribal)\b/i.test(text)) {
    return "Community";
  }
  return "Academic";
}

function getOpportunityType(text) {
  if (/\b(competition|contest|challenge|olympiad)\b/i.test(text)) return "Competitions";
  if (/\b(volunteer|volunteering|community service)\b/i.test(text)) return "Volunteering";
  if (/\b(career|job shadow|career exploration)\b/i.test(text)) return "Career Exploration";
  if (/\b(internship|intern|traineeship)\b/i.test(text)) return "Internships";
  return "Programs";
}

function getOpportunityField(text) {
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
    title.length > 200 ||
    !Number.isFinite(publishedAt.getTime()) ||
    age < -24 * 60 * 60 * 1000 ||
    age > maximumAge ||
    url.protocol !== "https:" ||
    url.hostname !== "opportunitydesk.org"
  ) {
    return null;
  }

  const searchableText = `${title} ${excerpt}`;
  if (kind === "scholarships" && !/\b(scholarship|fellowship|grant|bursary|award)\b/i.test(searchableText)) {
    return null;
  }

  const deadline = getDeadline(searchableText, publishedAt);
  if (deadline.expired) return null;

  if (kind === "scholarships") {
    return {
      id: String(post.id),
      name: title,
      amount: "See listing",
      category: getScholarshipCategory(searchableText),
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
    type: getOpportunityType(searchableText),
    field: getOpportunityField(searchableText),
    description: excerpt.slice(0, 700) || "See the listing for program details.",
    eligibility: "Review the listing and organizer requirements before applying.",
    deadline: deadline.label,
    url: url.href,
    publishedAt: publishedAt.toISOString(),
    source: "Opportunity Desk"
  };
}

async function readLimitedJson(response) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumResponseSize) {
    throw new Error("Resource feed response is too large");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Resource feed response is empty");

  const chunks = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > maximumResponseSize) {
      await reader.cancel();
      throw new Error("Resource feed response is too large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function requestFeed(kind) {
  const url = new URL("https://opportunitydesk.org/wp-json/wp/v2/posts");
  url.search = new URLSearchParams({
    categories: String(categories[kind]),
    per_page: "40",
    orderby: "date",
    order: "desc",
    _fields: "id,date,link,title,excerpt"
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Recent listings are temporarily unavailable");

  const posts = await readLimitedJson(response);
  if (!Array.isArray(posts)) throw new Error("Resource feed returned invalid data");

  return {
    items: posts
      .map((post) => normalizePost(post, kind))
      .filter(Boolean)
      .slice(0, maximumResults),
    source: "Opportunity Desk",
    updatedAt: new Date().toISOString()
  };
}

export function fetchRecentResources(kind, forceRefresh = false) {
  if (!Object.hasOwn(categories, kind)) {
    return Promise.reject(new Error("Unsupported resource feed"));
  }

  const now = Date.now();
  const cached = cache.get(kind);
  if (cached?.promise) return cached.promise;
  if (!forceRefresh && cached?.result && now - cached.fetchedAt < cacheDuration) {
    return Promise.resolve({ ...cached.result, cached: true });
  }
  if (forceRefresh && cached?.result && now - cached.fetchedAt < refreshLimit) {
    return Promise.resolve({ ...cached.result, cached: true });
  }

  const pending = requestFeed(kind);
  cache.set(kind, { promise: pending });

  return pending.then((result) => {
    cache.set(kind, { result, fetchedAt: Date.now() });
    return { ...result, cached: false };
  }).catch((error) => {
    cache.delete(kind);
    throw error;
  });
}
