import { useEffect, useState } from "react";
import { fetchRecentResources } from "../data/recentResources";

export function useRecentListings(kind, fallbackItems) {
  const [items, setItems] = useState(fallbackItems);
  const [status, setStatus] = useState("Checking for recent listings...");
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    let active = true;

    fetchRecentResources(kind)
      .then((result) => {
        if (!active) return;
        setItems(result.items);
        setStatus(`Showing ${result.items.length} recent listings from ${result.source}.`);
      })
      .catch(() => {
        if (active) setStatus("Live listings are unavailable. Showing the resource directory.");
      })
      .finally(() => {
        if (active) setRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, [kind]);

  async function refresh() {
    setRefreshing(true);
    try {
      const result = await fetchRecentResources(kind, true);
      setItems(result.items);
      setStatus(`Showing ${result.items.length} recent listings from ${result.source}.`);
    } catch {
      setStatus("Live listings are unavailable. Showing the resource directory.");
    } finally {
      setRefreshing(false);
    }
  }

  return { items, status, refreshing, refresh };
}
