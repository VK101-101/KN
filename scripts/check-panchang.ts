import { computePanchang, sunriseForLocalDate } from "../src/lib/astro/panchang";

const cases = [
  ["2026-11-03", "Asia/Kolkata", 28.6139, 77.209],
  ["2026-11-08", "Asia/Kolkata", 28.6139, 77.209],
  ["2000-01-01", "Asia/Kolkata", 28.6139, 77.209],
  ["1990-01-01", "Asia/Kolkata", 28.6139, 77.209],
  ["2026-06-15", "America/New_York", 40.7128, -74.006],
  ["2026-01-01", "Australia/Sydney", -33.8688, 151.2093],
];

for (const [date, tz, lat, lon] of cases) {
  // A daily panchang is read at sunrise, the start of the Vedic day.
  const jd = sunriseForLocalDate(date as string, tz as string, lat as number, lon as number);
  const p = computePanchang(jd, lat as number, lon as number, tz as string);
  const civil = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  console.log(
    `${date} civil=${civil} panchang=${p.weekdayName} ${p.weekday} | ${p.tithi.fullName} ${p.nakshatra.name} p${p.nakshatra.pada} | yoga ${p.yoga.name} karana ${p.karana.name} | ${p.lunarMonth.name}/${p.lunarMonth.purnimantaName} Vikram ${p.samvat.vikram} Shaka ${p.samvat.shaka} ${p.samvat.samvatsara} | rahu part ${p.rahuKaal.name}`,
  );
}
