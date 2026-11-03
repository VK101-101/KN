import { formatLocalDate, formatLocalDateTime, formatLocalTime } from "./time";

export const JD_UNIX_EPOCH = 2440587.5;

export const jdToMs = (jd: number) => (jd - JD_UNIX_EPOCH) * 86400000;
export const msToJd = (ms: number) => ms / 86400000 + JD_UNIX_EPOCH;

export const fmtJdTime = (jd: number, tz: string) => formatLocalTime(jdToMs(jd), tz);
export const fmtJdDate = (jd: number, tz: string) => formatLocalDate(jdToMs(jd), tz);
export const fmtJdDateTime = (jd: number, tz: string) => formatLocalDateTime(jdToMs(jd), tz);

export function dms(deg: number, seconds = false) {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}° ${String(m).padStart(2, "0")}'${seconds ? ` ${String(s).padStart(2, "0")}"` : ""}`;
}

export const ORDINAL = [
  "", "1st", "2nd", "3rd", "4th", "5th", "6th",
  "7th", "8th", "9th", "10th", "11th", "12th",
];

export const ordinal = (n: number) => ORDINAL[n] ?? `${n}th`;

export function longDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dateRange(startJd: number, endJd: number, tz: string) {
  const a = fmtJdDate(startJd, tz);
  const b = fmtJdDate(endJd, tz);
  const [dd, mm, yy] = a.split("-");
  const [dd2, mm2, yy2] = b.split("-");
  return `${Number(dd)} ${MONTHS[Number(mm) - 1]} ${yy} – ${Number(dd2)} ${MONTHS[Number(mm2) - 1]} ${yy2}`;
}

export function yearOfJd(jd: number, tz: string) {
  return Number(fmtJdDate(jd, tz).split("-")[2]);
}

export function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
