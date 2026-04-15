function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getAttemptTimestamp(item) {
  return (
    item?.attemptedAt ??
    item?.AttemptedAt ??
    item?.lastAttemptAt ??
    item?.LastAttemptAt ??
    item?.latestAttempt?.attemptedAt ??
    item?.latestAttempt?.AttemptedAt ??
    null
  );
}

export function computeStreakData(items, referenceDate = new Date()) {
  const dateKeys = new Set();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const dt = toDate(getAttemptTimestamp(item));
    if (dt) dateKeys.add(toLocalDateKey(dt));
  });

  const sortedDates = [...dateKeys]
    .map((key) => toDate(`${key}T00:00:00`))
    .filter(Boolean)
    .sort((a, b) => a - b);

  let bestStreak = 0;
  let runningBest = 0;
  let previous = null;
  sortedDates.forEach((current) => {
    if (!previous) {
      runningBest = 1;
    } else {
      const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
      runningBest = diffDays === 1 ? runningBest + 1 : 1;
    }
    bestStreak = Math.max(bestStreak, runningBest);
    previous = current;
  });

  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayKey = toLocalDateKey(today);
  const yesterdayKey = toLocalDateKey(yesterday);
  const activeToday = dateKeys.has(todayKey);
  const startDate = activeToday ? today : dateKeys.has(yesterdayKey) ? yesterday : null;

  let currentStreak = 0;
  if (startDate) {
    const cursor = new Date(startDate);
    while (dateKeys.has(toLocalDateKey(cursor))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  const monthActiveDateKeys = new Set(
    [...dateKeys].filter((key) => {
      const dt = toDate(`${key}T00:00:00`);
      return dt && dt >= monthStart && dt <= monthEnd;
    })
  );

  const lastActiveDate = sortedDates.length ? sortedDates[sortedDates.length - 1] : null;

  return {
    currentStreak,
    bestStreak,
    activeToday,
    monthActiveDateKeys,
    uniqueActiveDays: dateKeys.size,
    lastActiveDate,
  };
}

export function getMonthCalendar(referenceDate = new Date()) {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const daysInMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
  const firstDayOffset = (monthStart.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < firstDayOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dt = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day);
    cells.push({
      day,
      key: toLocalDateKey(dt),
      isToday: toLocalDateKey(new Date()) === toLocalDateKey(dt),
    });
  }

  return {
    monthLabel: referenceDate.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    cells,
  };
}
