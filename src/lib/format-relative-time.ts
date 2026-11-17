const MINUTE_IN_MILLISECONDS = 60 * 1000;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;
const DAY_IN_MILLISECONDS = 24 * HOUR_IN_MILLISECONDS;
const MONTH_IN_MILLISECONDS = 30 * DAY_IN_MILLISECONDS;

export function formatRelativeUpdateTime(updatedAt: string, now = Date.now()) {
  const updatedAtTime = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedAtTime)) return "更新日時不明";

  const elapsed = Math.max(0, now - updatedAtTime);
  if (elapsed >= MONTH_IN_MILLISECONDS) return "一ヶ月以上前";
  if (elapsed >= DAY_IN_MILLISECONDS) return `${Math.floor(elapsed / DAY_IN_MILLISECONDS)}日前`;
  if (elapsed >= HOUR_IN_MILLISECONDS) return `${Math.floor(elapsed / HOUR_IN_MILLISECONDS)}時間前`;
  return `${Math.floor(elapsed / MINUTE_IN_MILLISECONDS)}分前`;
}
