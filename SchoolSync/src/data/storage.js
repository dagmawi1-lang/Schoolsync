
const STORAGE_EVENT = "schoolsync:data-updated";
const STORAGE_PREFIX = "schoolsync-";

function notifyStorage(key, value) {
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, {
      detail: { key, value }
    })
  );
}

export function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorage(key, value);

    if (key.startsWith(STORAGE_PREFIX)) {
      fetch(`/api/state/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value)
      }).catch(() => {});
    }

    return true;
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    return false;
  }
}

export async function initializeStorage() {
  const localEntries = Object.keys(localStorage).filter((key) =>
    key.startsWith(STORAGE_PREFIX)
  );

  try {
    const response = await fetch("/api/state", {
      signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) throw new Error("Backend state request failed");

    const payload = await response.json();
    const backendState = payload?.data;

    if (!backendState || typeof backendState !== "object" || Array.isArray(backendState)) {
      throw new Error("Backend returned invalid state");
    }

    for (const [key, value] of Object.entries(backendState)) {
      if (!key.startsWith(STORAGE_PREFIX)) continue;
      localStorage.setItem(key, JSON.stringify(value));
    }

    for (const key of localEntries) {
      if (Object.hasOwn(backendState, key)) continue;

      try {
        const value = JSON.parse(localStorage.getItem(key));
        await fetch(`/api/state/${encodeURIComponent(key)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value)
        });
      } catch {
        // Keep malformed or unavailable local data available to the app.
      }
    }

    notifyStorage(null, null);
    return true;
  } catch {
    return false;
  }
}

export function subscribeToStorage(callback) {
  const handleCustomUpdate = (event) => {
    callback(event.detail);
  };

  const handleBrowserUpdate = (event) => {
    if (event.key) {
      callback({
        key: event.key,
        value: readStorage(event.key, null)
      });
    }
  };

  window.addEventListener(STORAGE_EVENT, handleCustomUpdate);
  window.addEventListener("storage", handleBrowserUpdate);

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleCustomUpdate);
    window.removeEventListener("storage", handleBrowserUpdate);
  };
}
