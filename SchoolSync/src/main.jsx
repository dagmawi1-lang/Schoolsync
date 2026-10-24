import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initializeStorage, readStorage } from "./data/storage";
import { applyTheme, SETTINGS_STORAGE_KEY } from "./data/theme";

initializeStorage().finally(() => {
  const settings = readStorage(SETTINGS_STORAGE_KEY, {});
  applyTheme(settings?.theme || "light");

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});