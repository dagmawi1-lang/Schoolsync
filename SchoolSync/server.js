import { createServer } from "node:http";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = process.env.SCHOOLSYNC_DATA_DIR || path.join(rootDirectory, "data");
const dataFile = path.join(dataDirectory, "schoolsync.json");
const distDirectory = path.join(rootDirectory, "dist");
const storagePrefix = "schoolsync-";
const maxBodyBytes = 1024 * 1024;
let writeQueue = Promise.resolve();

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

async function readState() {
  try {
    const contents = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(contents);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function saveState(state) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.${process.pid}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(state, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      const error = new Error("Request body is too large");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON");
    error.status = 400;
    throw error;
  }
}

function contentTypeFor(filePath) {
  const extension = path.extname(filePath);
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
  }[extension] || "application/octet-stream";
}

async function serveFrontend(request, response, pathname) {
  let requestedPath;
  try {
    requestedPath = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400).end("Invalid path");
    return;
  }

  const candidate = path.resolve(distDirectory, `.${requestedPath}`);
  const isInsideDist = candidate.startsWith(`${distDirectory}${path.sep}`);
  let filePath = isInsideDist ? candidate : path.join(distDirectory, "index.html");

  try {
    if (!(await stat(filePath)).isFile()) {
      filePath = path.join(distDirectory, "index.html");
    }
  } catch {
    filePath = path.join(distDirectory, "index.html");
  }

  try {
    const contents = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
    response.end(contents);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Frontend build not found. Run npm run build first.");
  }
}

export function createAppServer() {
  return createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    const url = new URL(request.url, "http://localhost");

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        sendJson(response, 200, { status: "ok" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/state") {
        await writeQueue;
        sendJson(response, 200, { data: await readState() });
        return;
      }

      if (request.method === "PUT" && url.pathname.startsWith("/api/state/")) {
        let key;
        try {
          key = decodeURIComponent(url.pathname.slice("/api/state/".length));
        } catch {
          sendJson(response, 400, { error: "Invalid storage key" });
          return;
        }

        if (!new RegExp(`^${storagePrefix}[a-z0-9-]+$`).test(key)) {
          sendJson(response, 400, { error: "Unsupported storage key" });
          return;
        }

        const value = await readJsonBody(request);
        const pendingWrite = writeQueue.then(async () => {
          const state = await readState();
          state[key] = value;
          await saveState(state);
        });
        writeQueue = pendingWrite.catch(() => {});
        await pendingWrite;
        sendJson(response, 200, { saved: true, key });
        return;
      }

      if (url.pathname.startsWith("/api/")) {
        sendJson(response, 404, { error: "API route not found" });
        return;
      }

      if (request.method === "GET") {
        await serveFrontend(request, response, url.pathname);
        return;
      }

      sendJson(response, 404, { error: "Not found" });
    } catch (error) {
      if (!response.headersSent) {
        sendJson(response, error.status || 500, {
          error: error.status ? error.message : "Internal server error"
        });
      } else {
        response.end();
      }
    }
  });
}

export function startServer() {
  const server = createAppServer();
  const port = Number(process.env.API_PORT || process.env.PORT || 3001);
  const host = "127.0.0.1";

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      resolve(server);
      console.log(`SchoolSync backend listening at http://${host}:${port}`);
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error("Could not start SchoolSync backend:", error.message);
    process.exitCode = 1;
  });
}