const STORAGE_KEY = "lc_cold_start_tour_seen";

export function hasSeenColdStartTour(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markColdStartTourSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}
