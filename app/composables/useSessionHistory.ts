/**
 * useSessionHistory Composable
 *
 * Manages session history persistence using localStorage.
 * Tracks practice behavior (when/how long), not tajweed accuracy.
 *
 * @module composables/useSessionHistory
 */

export interface SessionHistoryEntry {
  /** Unique session ID */
  id: string;
  /** ISO timestamp when session completed */
  timestamp: string;
  /** Surah number recited */
  surahNumber: number;
  /** Surah name in Arabic */
  surahName: string;
  /** Ayah range [start, end] */
  ayahRange: [number, number];
  /** Duration in milliseconds */
  durationMs: number;
  /** Mock score (0-100) - clearly marked as demo data */
  mockScore?: number;
}

const STORAGE_KEY = "noor-tajweed-sessions";
const MAX_SESSIONS = 100; // Limit stored sessions

export function useSessionHistory() {
  // Reactive sessions list
  const sessions = useState<SessionHistoryEntry[]>("sessionHistory", () => []);

  // Load from localStorage on init
  function loadSessions(): SessionHistoryEntry[] {
    if (!import.meta.client) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load session history:", e);
    }
    return [];
  }

  // Save to localStorage
  function saveSessions(data: SessionHistoryEntry[]) {
    if (!import.meta.client) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save session history:", e);
    }
  }

  // Initialize on client
  onMounted(() => {
    sessions.value = loadSessions();
  });

  /**
   * Add a new session to history
   */
  function addSession(
    entry: Omit<SessionHistoryEntry, "id" | "timestamp">
  ): SessionHistoryEntry {
    const newEntry: SessionHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Add to beginning (most recent first)
    const updated = [newEntry, ...sessions.value];

    // Trim to max size
    if (updated.length > MAX_SESSIONS) {
      updated.splice(MAX_SESSIONS);
    }

    sessions.value = updated;
    saveSessions(updated);

    return newEntry;
  }

  /**
   * Get all sessions (most recent first)
   */
  function getSessions(): SessionHistoryEntry[] {
    return sessions.value;
  }

  /**
   * Get sessions for a specific date
   */
  function getSessionsByDate(date: Date): SessionHistoryEntry[] {
    const dateStr = date.toISOString().split("T")[0];
    return sessions.value.filter((s) => s.timestamp.startsWith(dateStr ?? ""));
  }

  /**
   * Clear all session history
   */
  function clearSessions() {
    sessions.value = [];
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Get total stats (sessions count and total time)
   */
  function getTotalStats() {
    const totalSessions = sessions.value.length;
    const totalTimeMs = sessions.value.reduce(
      (acc, s) => acc + s.durationMs,
      0
    );

    return {
      totalSessions,
      totalTimeMs,
      totalTimeFormatted: formatDuration(totalTimeMs),
    };
  }

  /**
   * Get practice streak (consecutive days)
   */
  function getPracticeStreak(): number {
    if (sessions.value.length === 0) return 0;

    const sortedDates = [
      ...new Set(sessions.value.map((s) => s.timestamp.split("T")[0])),
    ]
      .sort()
      .reverse();

    if (sortedDates.length === 0) return 0;

    let streak = 1;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // Check if most recent session is today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0; // Streak broken
    }

    // Count consecutive days
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i - 1] ?? "");
      const prev = new Date(sortedDates[i] ?? "");
      const diffDays = Math.floor(
        (current.getTime() - prev.getTime()) / 86400000
      );

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Format duration in ms to human readable
   */
  function formatDuration(ms: number): string {
    if (ms < 1000) return "< 1s";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  return {
    // State
    sessions: readonly(sessions),

    // Methods
    addSession,
    getSessions,
    getSessionsByDate,
    clearSessions,
    getTotalStats,
    getPracticeStreak,
    formatDuration,
  };
}
