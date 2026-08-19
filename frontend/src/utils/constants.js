export const APP_NAME = "TapStorm";
export const APP_TAGLINE = "How fast can you storm?";

export const GAME_MODES = {
  sprint: {
    key:      "sprint",
    label:    "Sprint",
    subtitle: "15 seconds of pure reflex",
    duration: 15,
    icon:     "ti-bolt",
    accent:   "#f97316",
  },
  classic: {
    key:      "classic",
    label:    "Classic",
    subtitle: "The standard 60-second test",
    duration: 60,
    icon:     "ti-target",
    accent:   "#6366f1",
  },
  marathon: {
    key:      "marathon",
    label:    "Marathon",
    subtitle: "2 minutes of sustained speed",
    duration: 120,
    icon:     "ti-flame",
    accent:   "#10b981",
  },
};

export const LEADERBOARD_PERIODS = [
  { key: "global", label: "All time" },
  { key: "weekly", label: "This week" },
  { key: "daily",  label: "Today" },
];

export const RANK_ICONS = ["🥇", "🥈", "🥉"];

export const NAV_TABS = [
  { id: "game",        label: "Play",    icon: "ti-device-gamepad-2" },
  { id: "leaderboard", label: "Ranks",   icon: "ti-trophy" },
  { id: "profile",     label: "Profile", icon: "ti-user-circle" },
];

export const GAME_PHASE = {
  IDLE:      "idle",
  COUNTDOWN: "countdown",
  PLAYING:   "playing",
  DONE:      "done",
};
