import { computeKundli } from "../src/lib/astro";
import { formatLocalDateTime } from "../src/lib/time";

const k = computeKundli({
  name: "Test Native",
  gender: "male",
  date: "1990-01-01",
  time: "12:00",
  tz: "Asia/Kolkata",
  lat: 28.6139,
  lon: 77.209,
  place: "New Delhi",
});

const p = (i: number) => k.chart.grahas[i];
console.log("Lagna:", k.chart.lagna);
console.log("Sun:", p(0).lon.toFixed(3), p(0).house);
console.log("Moon:", p(1).lon.toFixed(3), p(1).nakshatra, p(1).pada);
console.log("Panchang:", k.panchang.tithi.fullName, k.panchang.nakshatra.name, k.panchang.yoga.name, k.panchang.karana.name);
console.log("Sunrise/set:", formatLocalDateTime(k.panchang.sunriseJd ? (k.panchang.sunriseJd - 2440587.5) * 86400000 : 0, "Asia/Kolkata"));
console.log("Dasha:", k.dashas.startLord, k.dashas.balanceYears.toFixed(3));
console.log("Chain:", k.dashas.chain.map((c) => c.lord).join(" > "));
console.log("Vargas:", k.vargas.length, k.vargas.find((v) => v.key === "D9")?.lagnaSign);
console.log("Shadbala:", k.shadbala.map((r) => `${r.planet}:${r.rupas.toFixed(1)}`).join(" "));
console.log("AV totals:", JSON.stringify(k.ashtakavarga.totals), "SAV", k.ashtakavarga.sarvashtakavarga.join(","));
console.log("Yogas:", k.yogas.map((y) => y.name).join(", "));
console.log("Sade sati:", JSON.stringify(k.sadeSati));
console.log("Gulika:", k.chart.gulika.toFixed(2));
console.log("Interpretation keys:", Object.keys(k.interpretation));
