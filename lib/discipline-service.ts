export interface DisciplineAssessment {
  status: "success" | "fallback" | "error";
  modelUsed: string;
  verdict: "AHEAD_OF_SCHEDULE" | "ON_TRACK" | "BEHIND_SCHEDULE" | "CRITICAL_DRIFT";
  disciplineScore: number;
  headline: string;
  coachingMessage: string;
  actionableDirective: string;
  quote?: string;
  author?: string;
  timestamp: string;
}

export interface StreakLossIntervention {
  status: "success" | "fallback" | "error";
  modelUsed: string;
  headline: string;
  quote: string;
  author: string;
  psychologicalMessage: string;
  rebuildChallenge: string;
  timestamp: string;
}

export async function fetchDisciplineCoaching(params: {
  focusHours: number;
  dailyGoal: number;
  streakDays: number;
  completedTasks: number;
  totalTasks: number;
  userName?: string;
  tone?: "reality-check" | "tactical" | "stoic";
}): Promise<DisciplineAssessment> {
  try {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...params,
        action: "coach",
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Client fallback for discipline coaching:", error);
    // Instant client-side fallback if server route is unreachable
    const ratio = params.dailyGoal > 0 ? params.focusHours / params.dailyGoal : 0;
    return {
      status: "fallback",
      modelUsed: "client-resilience-fallback",
      verdict: params.focusHours === 0 ? "CRITICAL_DRIFT" : ratio < 0.5 ? "BEHIND_SCHEDULE" : ratio < 1 ? "ON_TRACK" : "AHEAD_OF_SCHEDULE",
      disciplineScore: params.focusHours === 0 ? 25 : Math.round(Math.min(100, ratio * 100)),
      headline: params.focusHours === 0 ? "Time Is Slipping Away" : "Execute The Standard",
      coachingMessage: params.focusHours === 0
        ? `You have logged 0 hours toward your ${params.dailyGoal}h target today. Procrastination is a debt paid in missed potential. Take action immediately.`
        : `You are at ${params.focusHours}h of ${params.dailyGoal}h. Consistency is forged in refusing to quit before the target is reached.`,
      actionableDirective: "Start a 25-minute Pomodoro focus block right now.",
      quote: "Don't count on motivation. Motivation comes and goes. Count on discipline.",
      author: "Jocko Willink",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function fetchStreakLossQuote(params: {
  userName?: string;
  previousStreak: number;
}): Promise<StreakLossIntervention> {
  try {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...params,
        action: "streak_loss",
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Client fallback for streak loss quote:", error);
    return {
      status: "fallback",
      modelUsed: "client-resilience-fallback",
      headline: "The Chain Broke. Your Character Remains.",
      quote: "You have power over your mind - not outside events. Realize this, and you will find strength. Never let one lost battle lose the war.",
      author: "Marcus Aurelius",
      psychologicalMessage: "Yesterday was lost, but today is virgin territory. The pain of discipline is temporary; the shame of quitting is permanent. Rise and rebuild the chain today.",
      rebuildChallenge: "Lock in an immediate 25-minute focus session to lay the first link.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Calculates current week and today's focus hours using the exact same timezone-normalized
 * daily session calculation as ConsistencyHeatmap.tsx
 */
export function calculateConsistencyAnalytics(
  sessions: Array<{ duration_minutes?: number; created_at?: string }>
): {
  todayHours: number;
  todayMins: number;
  streakDays: number;
  todayDayName: string;
  dayMap: Record<string, { mins: number; count: number }>;
} {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

  const mondayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
  const sundayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + 6, 23, 59, 59, 999);
  const startOfWeekMs = mondayDate.getTime();
  const endOfWeekMs = sundayDate.getTime();

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayMap: Record<string, { mins: number; count: number }> = {
    Mon: { mins: 0, count: 0 },
    Tue: { mins: 0, count: 0 },
    Wed: { mins: 0, count: 0 },
    Thu: { mins: 0, count: 0 },
    Fri: { mins: 0, count: 0 },
    Sat: { mins: 0, count: 0 },
    Sun: { mins: 0, count: 0 },
  };

  const activeDatesSet = new Set<string>();

  if (sessions && sessions.length > 0) {
    sessions.forEach((s) => {
      const mins = s.duration_minutes || 25;

      if (s.created_at) {
        let rawTimestamp = s.created_at;
        if (typeof rawTimestamp === "string" && !rawTimestamp.includes("Z") && !rawTimestamp.includes("+")) {
          rawTimestamp = rawTimestamp.replace(" ", "T") + "Z";
        }
        const dateObj = new Date(rawTimestamp);
        if (isNaN(dateObj.getTime())) return;

        const sessionMs = dateObj.getTime();

        const localYear = dateObj.getFullYear();
        const localMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
        const localDate = String(dateObj.getDate()).padStart(2, "0");
        const localDateStr = `${localYear}-${localMonth}-${localDate}`;
        activeDatesSet.add(localDateStr);

        if (sessionMs >= startOfWeekMs && sessionMs <= endOfWeekMs) {
          const localDayIndex = (dateObj.getDay() + 6) % 7;
          const dayName = weekDays[localDayIndex];
          if (dayMap[dayName]) {
            dayMap[dayName].mins += mins;
            dayMap[dayName].count += 1;
          }
        }
      }
    });
  }

  const todayDayIndex = (now.getDay() + 6) % 7;
  const todayDayName = weekDays[todayDayIndex];
  const todayMins = dayMap[todayDayName].mins;
  const todayHours = Number((todayMins / 60).toFixed(1));

  return {
    todayHours,
    todayMins,
    streakDays: activeDatesSet.size,
    todayDayName,
    dayMap,
  };
}

/**
 * Calculates whether a consecutive streak was broken by checking session history or local cache.
 */
export function evaluateStreakStatus(sessions: Array<{ created_at?: string; duration_minutes?: number }>): {
  isStreakBroken: boolean;
  previousStreak: number;
  lastActiveDate: string | null;
} {
  if (typeof window === "undefined") {
    return { isStreakBroken: false, previousStreak: 0, lastActiveDate: null };
  }

  const now = new Date();
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  // Extract all unique dates from sessions
  const activeDates = new Set<string>();
  sessions.forEach((s) => {
    if (s.created_at) {
      try {
        const d = new Date(s.created_at);
        if (!isNaN(d.getTime())) {
          activeDates.add(formatYMD(d));
        }
      } catch {
        // ignore malformed
      }
    }
  });

  const storedLastDate = localStorage.getItem("flowstate_last_active_date");
  const storedPrevStreak = parseInt(localStorage.getItem("flowstate_saved_streak") || "0", 10);
  const modalDismissedDate = localStorage.getItem("flowstate_streak_modal_dismissed_date");

  // If already shown and dismissed today, don't trigger repeatedly
  if (modalDismissedDate === todayStr) {
    return { isStreakBroken: false, previousStreak: storedPrevStreak, lastActiveDate: storedLastDate };
  }

  // Check if yesterday was missed when the user had prior activity
  const hadActivityYesterday = activeDates.has(yesterdayStr);
  const hadActivityToday = activeDates.has(todayStr);

  let isBroken = false;
  let prevStreak = storedPrevStreak;

  if (activeDates.size > 0 && !hadActivityYesterday) {
    // Find the latest active date before yesterday
    const sortedDates = Array.from(activeDates).sort().reverse();
    const latestDate = sortedDates[0];

    // If the latest activity was before yesterday, and today is either not active yet or just started
    if (latestDate && latestDate < yesterdayStr) {
      isBroken = true;
      prevStreak = Math.max(storedPrevStreak, activeDates.size);
    }
  } else if (storedLastDate && storedLastDate < yesterdayStr && storedPrevStreak > 0) {
    isBroken = true;
  }

  return {
    isStreakBroken: isBroken,
    previousStreak: prevStreak || 1,
    lastActiveDate: storedLastDate,
  };
}
