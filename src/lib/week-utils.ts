/** Returns the Monday–Sunday range for the current week. */
export function getWeekRange(date = new Date()): { start: Date; end: Date; label: string } {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { start: monday, end: sunday, label: `Week of ${fmt(monday)} – ${fmt(sunday)}` };
}

/** Returns previous week's Monday–Sunday range. */
export function getLastWeekRange(date = new Date()): { start: Date; end: Date; label: string } {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return getWeekRange(d);
}
