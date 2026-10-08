/**
 * Smart Streak Protection & Inactivity Notification Service
 * Sends strategic accountability browser notifications if the user hasn't logged
 * any focus time by evening, reminding them before their streak resets at midnight.
 */

export function checkAndSendEveningStreakAlert(params: {
  focusHours: number;
  streakDays: number;
  dailyGoal: number;
}): { triggered: boolean; reason: string } {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { triggered: false, reason: "Notifications not supported in this environment" };
  }

  if (Notification.permission !== "granted") {
    return { triggered: false, reason: "Notification permission not granted" };
  }

  const now = new Date();
  const currentHour = now.getHours(); // 0 - 23
  const todayStr = now.toISOString().split("T")[0];

  const storageKey = `flowstate_streak_evening_alert_${todayStr}`;
  const alreadySent = localStorage.getItem(storageKey);

  if (alreadySent === "true") {
    return { triggered: false, reason: "Already alerted today" };
  }

  // Evening threshold: 18:00 (6:00 PM) onwards
  const isEvening = currentHour >= 18;

  // Condition: Inactivity or zero focus time logged by evening
  const isInactive = params.focusHours === 0 || params.focusHours < Math.min(1, params.dailyGoal * 0.25);

  if (isEvening && isInactive) {
    try {
      const streakText = params.streakDays > 0 ? `${params.streakDays}-day streak` : "daily momentum";
      new Notification("⚠️ Streak Shield: Do Not Break The Chain!", {
        body: `It's evening and you have 0 focus hours logged today. Your ${streakText} will break at midnight! Lock in a 25-minute session now.`,
        icon: "/favicon.ico",
        tag: "flowstate-streak-protection",
      });

      localStorage.setItem(storageKey, "true");
      return { triggered: true, reason: "Strategic evening accountability alert dispatched" };
    } catch (err) {
      console.warn("Failed to dispatch evening streak notification:", err);
      return { triggered: false, reason: "Notification dispatch error" };
    }
  }

  return {
    triggered: false,
    reason: isEvening ? "User already has sufficient focus hours logged" : "Not evening yet (triggers at 18:00)",
  };
}

/**
 * Allows immediate manual testing / verification of the browser accountability alert
 */
export function sendTestStreakAlert(params: {
  streakDays: number;
  focusHours: number;
}): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    alert("Browser notifications are not supported in this browser.");
    return false;
  }

  if (Notification.permission === "granted") {
    const streakText = params.streakDays > 0 ? `${params.streakDays}-day active streak` : "daily consistency";
    new Notification("🛡️ FlowState Streak Shield Alert (Test)", {
      body: `Accountability Check: You're at risk of losing your ${streakText} before midnight! Deploy a 25m focus sprint now.`,
      icon: "/favicon.ico",
      tag: "flowstate-streak-test",
    });
    return true;
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        sendTestStreakAlert(params);
      }
    });
  } else {
    alert("Browser notifications are blocked. Please enable notification permissions in your browser settings to receive streak protection alerts.");
  }
  return false;
}
