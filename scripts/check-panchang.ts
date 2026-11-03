import { computePanchang } from "../src/lib/astro/panchang";
import { localToUtc } from "../src/lib/time";
import { jdFromDateUtc } from "../src/lib/astro/ephemeris";

const cases = [
  ["2026-11-03", "Asia/Kolkata", 28.6139, 77.209],
  ["2026-11-08", "Asia/Kolkata", 28.6139, 77.209],
  ["2000-01-01", "Asia/Kolkata", 28.6139, 77.209],
  ["1990-01-01", "Asia/Kolkata", 28.6139, 77.209],
  ["2026-06-15", "America/New_York", 40.7128, -74.006],
  ["2026-01-01", "Australia/Sydney", -33.8688, 151.2093],
];

for (const [date, tz, lat, lon] of cases) {
  const utc = localToUtc(date as string, "12:00", tz as string);
  const jd = jdFromDateUtc(utc);
  const p = computePanchang(jd, lat as number, lon as number, tz as string);
  const civil = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  console.log(
    `${date} civil=${civil} panchang=${p.weekdayName} ${p.weekday} | ${p.tithi.fullName} ${p.nakshatra.name} p${p.nakshatra.pada} | yoga ${p.yoga.name} karana ${p.karana.name} | rahu part ${p.rahuKaal.name}`,
  );
}
