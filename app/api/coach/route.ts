import { NextResponse } from "next/server";

interface CoachRequestBody {
  focusHours?: number;
  dailyGoal?: number;
  streakDays?: number;
  completedTasks?: number;
  totalTasks?: number;
  userName?: string;
  tone?: "reality-check" | "tactical" | "stoic";
  action?: "coach" | "streak_loss";
  previousStreak?: number;
}

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
];

export async function POST(request: Request) {
  try {
    const body: CoachRequestBody = await request.json().catch(() => ({}));
    const {
      focusHours = 0,
      dailyGoal = 6,
      streakDays = 0,
      completedTasks = 0,
      totalTasks = 0,
      userName = "Warrior",
      tone = "reality-check",
      action = "coach",
      previousStreak = 0,
    } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    // If an API key is provided, attempt Gemini generation
    if (apiKey.trim()) {
      try {
        const geminiResult = await callGeminiWithFallback({
          apiKey,
          action,
          focusHours,
          dailyGoal,
          streakDays,
          completedTasks,
          totalTasks,
          userName,
          tone,
          previousStreak,
        });

        if (geminiResult) {
          return NextResponse.json(geminiResult);
        }
      } catch (geminiErr) {
        console.warn("Gemini API call encountered an issue, falling back to local engine:", geminiErr);
      }
    }

    // High-impact psychological fallback engine
    const fallbackResponse = generateLocalDisciplineResponse({
      action,
      focusHours,
      dailyGoal,
      streakDays,
      completedTasks,
      totalTasks,
      userName,
      tone,
      previousStreak,
    });

    return NextResponse.json(fallbackResponse);
  } catch (error) {
    console.error("Coach API route error:", error);
    const localFallback = generateLocalDisciplineResponse({
      action: "coach",
      focusHours: 0,
      dailyGoal: 6,
      streakDays: 0,
      completedTasks: 0,
      totalTasks: 0,
      userName: "Warrior",
      tone: "reality-check",
      previousStreak: 0,
    });
    return NextResponse.json(
      {
        ...localFallback,
        status: "error",
        error: "Failed to process discipline request",
      },
      { status: 500 }
    );
  }
}

async function callGeminiWithFallback(params: {
  apiKey: string;
  action: "coach" | "streak_loss";
  focusHours: number;
  dailyGoal: number;
  streakDays: number;
  completedTasks: number;
  totalTasks: number;
  userName: string;
  tone: string;
  previousStreak: number;
}) {
  const { apiKey, action, focusHours, dailyGoal, streakDays, completedTasks, totalTasks, userName, tone, previousStreak } = params;

  let prompt = "";
  if (action === "streak_loss") {
    prompt = `You are a legendary Stoic Discipline Master and Mental Toughness Coach (combining the spirit of Marcus Aurelius, David Goggins, and Seneca).
The user '${userName}' just broke their consecutive discipline streak (lost a streak of ${previousStreak > 0 ? previousStreak : "multiple"} days). They opened the app after missing yesterday.

Generate an intense, psychologically restorative intervention response in pure JSON format with keys:
- "quote": A devastatingly truthful, powerful discipline quote about failure, rebuilding the chain, and conquering regret (from Marcus Aurelius, David Goggins, Seneca, Epictetus, or original masterwork).
- "author": The author of the quote.
- "headline": A punchy 4-8 word rallying cry (e.g. "The Chain Broke. Your Character Remains.").
- "psychologicalMessage": A 2-3 sentence hard-hitting reality check explaining that missing one day is a test, but missing two is the birth of a new habit of failure. Urge them to pick up the mantle right now.
- "rebuildChallenge": A concrete immediate directive for today (e.g. "Execute one unbroken 25-minute focus session right now to lay the first brick.").

Output strictly valid JSON and nothing else. No markdown fences.`;
  } else {
    const focusPercentage = dailyGoal > 0 ? Math.round((focusHours / dailyGoal) * 100) : 0;
    const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening";

    prompt = `You are FlowState's elite AI Discipline Coach. You evaluate the user's focus with uncompromising accountability and psychological depth.
Tone requested: ${tone} (Options: 'reality-check' = brutal honesty like David Goggins/Jocko Willink; 'tactical' = hyper-focused strategic execution; 'stoic' = Marcus Aurelius/Seneca on duty, mortality, and mastery).

User Metrics:
- Name: ${userName}
- Current Time: ${timeOfDay}
- Focus Logged Today: ${focusHours}h / Target: ${dailyGoal}h (${focusPercentage}% completed)
- Active Streak: ${streakDays} days
- Tasks Completed: ${completedTasks} / ${totalTasks} (${taskRate}%)

Analyze these exact metrics and output strictly valid JSON with these keys:
- "verdict": One of ["AHEAD_OF_SCHEDULE", "ON_TRACK", "BEHIND_SCHEDULE", "CRITICAL_DRIFT"]. If focusHours is 0 and it's afternoon/evening, choose "CRITICAL_DRIFT" or "BEHIND_SCHEDULE".
- "disciplineScore": Integer between 0 and 100 reflecting current discipline state.
- "headline": Short punchy 3-7 word statement.
- "coachingMessage": 2-3 sentences of personalized, hard-hitting psychological guidance reflecting their exact numbers. If they are lagging, call out procrastination without sugarcoating. If they are succeeding, warn against complacency.
- "actionableDirective": One specific, immediate 1-sentence action (e.g. "Lock into a 25-minute Pomodoro timer immediately and eliminate tab switching.").
- "quote": A relevant psychological/stoic discipline quote.
- "author": Author of the quote.

Output strictly valid JSON and nothing else. No markdown fences.`;
  }

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        }),
      });

      if (!response.ok) {
        // If 404, try next candidate model
        if (response.status === 404) {
          continue;
        }
        break;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Clean any potential markdown wrappers
      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      return {
        status: "success",
        modelUsed: model,
        ...parsed,
        timestamp: new Date().toISOString(),
      };
    } catch {
      continue;
    }
  }

  return null;
}

function generateLocalDisciplineResponse(params: {
  action: "coach" | "streak_loss";
  focusHours: number;
  dailyGoal: number;
  streakDays: number;
  completedTasks: number;
  totalTasks: number;
  userName: string;
  tone: string;
  previousStreak: number;
}) {
  const { action, focusHours, dailyGoal, streakDays, completedTasks, totalTasks, userName, tone, previousStreak } = params;

  if (action === "streak_loss") {
    const quotes = [
      {
        quote: "You have power over your mind - not outside events. Realize this, and you will find strength. Never let one lost battle lose the war.",
        author: "Marcus Aurelius",
      },
      {
        quote: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential. Get after it and start the chain again today.",
        author: "David Goggins",
      },
      {
        quote: "No person has the power to have everything they want, but it is in their power not to want what they don't have, and to cheerfully put to good use what they do have.",
        author: "Seneca",
      },
      {
        quote: "The first rule of mastery: Never miss twice. Missing once is an accident. Missing twice is the start of a new, broken habit.",
        author: "James Clear",
      },
    ];
    const selected = quotes[Math.floor(Math.random() * quotes.length)];

    return {
      status: "fallback",
      modelUsed: "local-discipline-engine",
      quote: selected.quote,
      author: selected.author,
      headline: "The Chain Broke. Rebuild It Today.",
      psychologicalMessage: `You missed yesterday, and your active streak of ${previousStreak > 0 ? previousStreak : "recent"} days was reset. Regret will consume you only if you allow today to slip as well. True discipline is not perfection—it is the ruthless refusal to surrender.`,
      rebuildChallenge: "Lock in a single unbroken 25-minute Pomodoro session right now to lay the foundation of your new streak.",
      timestamp: new Date().toISOString(),
    };
  }

  const focusRatio = dailyGoal > 0 ? focusHours / dailyGoal : 0;
  let verdict: "AHEAD_OF_SCHEDULE" | "ON_TRACK" | "BEHIND_SCHEDULE" | "CRITICAL_DRIFT" = "BEHIND_SCHEDULE";
  let disciplineScore = 50;
  let headline = "";
  let coachingMessage = "";
  let actionableDirective = "";
  let quote = "";
  let author = "";

  if (focusHours === 0) {
    verdict = "CRITICAL_DRIFT";
    disciplineScore = 20;
    headline = "Zero Hours Logged. Time Is Bleeding.";
    coachingMessage = `${userName}, you have 0 focus hours recorded today toward your ${dailyGoal}h objective. Excuses feel valid in the moment, but they lead to the exact mediocrity you swore to outgrow. Stop planning and start executing.`;
    actionableDirective = "Launch a 25-minute focus block immediately. Put your phone in another room.";
    quote = "At dawn, when you have trouble getting out of bed, tell yourself: 'I have to go to work — as a human being.'";
    author = "Marcus Aurelius";
  } else if (focusRatio < 0.5) {
    verdict = "BEHIND_SCHEDULE";
    disciplineScore = Math.max(35, Math.round(focusRatio * 100));
    headline = "Behind Target: Double Down Now";
    coachingMessage = `You are sitting at ${focusHours}h out of ${dailyGoal}h target (${Math.round(focusRatio * 100)}%). You have ${completedTasks}/${totalTasks} tasks finished. The second half of the day will define whether this day was an investment or a compromise.`;
    actionableDirective = "Clear non-essential notifications and complete your next pending task without interruption.";
    quote = "Don't count on motivation. Motivation comes and goes. Count on discipline.";
    author = "Jocko Willink";
  } else if (focusRatio < 1.0) {
    verdict = "ON_TRACK";
    disciplineScore = Math.min(85, Math.round(focusRatio * 100));
    headline = "Solid Momentum. Finish The Fight.";
    coachingMessage = `You've clocked ${focusHours}h of deep work. You are within striking distance of your ${dailyGoal}h target. Do not let up when the finish line is in sight. Close out the day with conviction.`;
    actionableDirective = "Queue up one more high-priority focus sprint to hit your daily quota.";
    quote = "Waste no more time arguing what a good man should be. Be one.";
    author = "Marcus Aurelius";
  } else {
    verdict = "AHEAD_OF_SCHEDULE";
    disciplineScore = 98;
    headline = "Target Annihilated. Avoid Complacency.";
    coachingMessage = `Outstanding discipline: ${focusHours}h completed against your ${dailyGoal}h target with an active ${streakDays}-day streak. But remember: victory today guarantees nothing tomorrow. Maintain humility and prepare for tomorrow's arena.`;
    actionableDirective = "Review completed tasks, log key wins, and prime tomorrow's Most Important Task.";
    quote = "The man who loves walking will walk further than the man who loves the destination.";
    author = "Ancient Proverb";
  }

  if (tone === "stoic") {
    quote = "First say to yourself what you would be; and then do what you have to do.";
    author = "Epictetus";
  } else if (tone === "reality-check" && verdict === "CRITICAL_DRIFT") {
    quote = "Nobody is coming to save you. Nobody is coming to push you. It's on you.";
    author = "David Goggins";
  }

  return {
    status: "fallback",
    modelUsed: "local-discipline-engine",
    verdict,
    disciplineScore,
    headline,
    coachingMessage,
    actionableDirective,
    quote,
    author,
    timestamp: new Date().toISOString(),
  };
}
