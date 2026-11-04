/** Timezone-correct conversion between local civil time and UTC (IANA zones, full DST history). */

const partsCache = new Map<string, Intl.DateTimeFormat>();

function dtf(tz: string) {
  let f = partsCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsCache.set(tz, f);
  }
  return f;
}

export interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function utcToLocalParts(utcMs: number, tz: string): LocalParts {
  const parts = dtf(tz).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  let hour = get("hour");
  if (hour === 24) hour = 0;
  return { year: get("year"), month: get("month"), day: get("day"), hour, minute: get("minute"), second: get("second") };
}

/** Offset of the zone at a given instant, in minutes east of UTC. */
export function tzOffsetMinutes(tz: string, utcMs: number): number {
  const p = utcToLocalParts(utcMs, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / 60000);
}

/** Convert a wall-clock date/time in `tz` to a UTC Date, handling DST transitions. */
export function localToUtc(dateStr: string, timeStr: string, tz: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh = 0, mm = 0, ss = 0] = timeStr.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm, ss);
  const offset = tzOffsetMinutes(tz, guess);
  let utc = guess - offset * 60000;
  const offset2 = tzOffsetMinutes(tz, utc);
  if (offset2 !== offset) utc = guess - offset2 * 60000;
  return new Date(utc);
}

export function formatLocalTime(utc: Date | number, tz: string, withSeconds = false) {
  const ms = typeof utc === "number" ? utc : utc.getTime();
  const p = utcToLocalParts(ms, tz);
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(p.hour)}:${z(p.minute)}${withSeconds ? ":" + z(p.second) : ""}`;
}

export function formatLocalDate(utc: Date | number, tz: string) {
  const ms = typeof utc === "number" ? utc : utc.getTime();
  const p = utcToLocalParts(ms, tz);
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(p.day)}-${z(p.month)}-${p.year}`;
}

export function formatLocalDateTime(utc: Date | number, tz: string) {
  return `${formatLocalDate(utc, tz)} ${formatLocalTime(utc, tz)}`;
}

export function offsetLabel(tz: string, utcMs: number) {
  const off = tzOffsetMinutes(tz, utcMs);
  const sign = off < 0 ? "-" : "+";
  const a = Math.abs(off);
  return `UTC${sign}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
}

export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Colombo",
  "Asia/Dhaka",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Bangkok",
  "Asia/Riyadh",
  "Asia/Jerusalem",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "Australia/Perth",
  "Pacific/Auckland",
  "UTC",
];

export function weekdayOfJd(jd: number) {
  // 0 = Sunday. JD 2451545.0 (2000-01-01 12:00 UT) is a Saturday.
  return (((Math.floor(jd + 1.5) % 7) + 7) % 7);
}

/** Weekday (0 = Sunday) of the civil date that a Julian Day falls on in a zone. */
export function weekdayOfJdInTz(jd: number, tz: string) {
  const p = utcToLocalParts((jd - 2440587.5) * 86400000, tz);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
}
