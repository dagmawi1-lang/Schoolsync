import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./server.js";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const viteCli = path.join(rootDirectory, "node_modules", "vite", "bin", "vite.js");

try {
  const backend = await startServer();
  const frontend = spawn(process.execPath, [viteCli], {
    cwd: rootDirectory,
    env: process.env,
    stdio: "inherit"
  });
  let stopping = false;

  function stop(exitCode = 0) {
    if (stopping) return;
    stopping = true;
    frontend.kill();
    backend.close(() => {
      process.exitCode = exitCode;
    });
  }

  process.on("SIGINT", () => stop(0));
  process.on("SIGTERM", () => stop(0));

  frontend.once("error", (error) => {
    console.error("Could not start Vite:", error.message);
    stop(1);
  });

  frontend.once("exit", (code) => {
    if (!stopping) {
      stopping = true;
      backend.close();
      process.exitCode = code ?? 1;
    }
  });
} catch (error) {
  console.error("Could not start SchoolSync:", error.message);
  process.exitCode = 1;
}