import {
  KARANA_NAMES,
  NAKSHATRAS,
  NAKSHATRA_SPAN,
  RASHIS,
  TITHI_NAMES,
  WEEKDAYS,
  YOGA_NAMES,
  type PlanetId,
} from "./constants";
import {
  jdFromDateUtc,
  norm360,
  riseSet,
  sunMoon,
  swe,
  type AyanamsaKey,
} from "./ephemeris";
import { localToUtc, utcToLocalParts, weekdayOfJdInTz } from "../time";

const D2R = Math.PI / 180;

export const LUNAR_MONTHS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
];

export const SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angirasa", "Shrimukha",
  "Bhava", "Yuvan", "Dhatri", "Ishvara", "Bahudhanya", "Pramathi", "Vikrama",
  "Vrisha", "Chitrabhanu", "Svabhanu", "Tarana", "Parthiva", "Vyaya", "Sarvajit",
  "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya",
  "Manmatha", "Durmukhi", "Hemalamba", "Vilambi", "Vikari", "Sharvari", "Plava",
  "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava", "Plavanga",
  "Kilaka", "Saumya", "Sadharana", "Virodhikrit", "Paridhavi", "Pramadi",
  "Ananda", "Rakshasa", "Anala", "Pingala", "Kalayukta", "Siddharthi", "Raudra",
  "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya",
];

export interface PanchangSlot {
  name: string;
  startJd: number;
  endJd: number;
  quality?: "good" | "bad" | "neutral";
  lord?: PlanetId;
}

export interface Panchang {
  sunriseJd: number;
  sunsetJd: number;
  nextSunriseJd: number;
  dayLengthHours: number;
  nightLengthHours: number;
  weekday: number;
  weekdayName: string;
  tithi: {
    index: number;
    number: number;
    name: string;
    fullName: string;
    paksha: "Shukla" | "Krishna";
    endJd: number;
  };
  nakshatra: { index: number; name: string; pada: number; endJd: number };
  yoga: { index: number; name: string; endJd: number };
  karana: { index: number; name: string; endJd: number };
  moonSign: number;
  sunSign: number;
  lunarMonth: { name: string; purnimantaName: string; index: number };
  samvat: { vikram: number; shaka: number; samvatsara: string };
  ritu: string;
  ayana: "Uttarayana" | "Dakshinayana";
  sunRashi: string;
  choghadiyaDay: PanchangSlot[];
  choghadiyaNight: PanchangSlot[];
  rahuKaal: PanchangSlot;
  yamaganda: PanchangSlot;
  gulikaKaal: PanchangSlot;
  abhijit: PanchangSlot;
  horas: PanchangSlot[];
  moonNakshatraEnd: number;
}

/** Find the instant when `angleFn` next reaches a multiple of `step` degrees. */
export function findCrossing(jdStart: number, angleFn: (jd: number) => number, step: number, maxDays = 2) {
  const start = norm360(angleFn(jdStart));
  const target = norm360(Math.floor(start / step) * step + step);
  const g = (jd: number) => {
    let d = norm360(angleFn(jd) - target);
    if (d > 180) d -= 360;
    return d;
  };
  let lo = jdStart;
  let hi = jdStart;
  const h = 0.002; // ~3 minutes
  for (let i = 0; i < (maxDays * 24) / (h * 24); i++) {
    hi = hi + h;
    if (g(hi) >= 0 && g(hi) < 180) break;
    lo = hi;
  }
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function tithiIndex(moon: number, sun: number) {
  return Math.floor(norm360(moon - sun) / 12) % 30;
}

export function tithiLabel(index: number): {
  number: number;
  name: string;
  paksha: "Shukla" | "Krishna";
  fullName: string;
} {
  const paksha: "Shukla" | "Krishna" = index < 15 ? "Shukla" : "Krishna";
  const n = (index % 15) + 1;
  let name = TITHI_NAMES[n - 1] ?? "";
  if (n === 15) name = index < 15 ? "Purnima" : "Amavasya";
  return { number: n, name, paksha, fullName: `${paksha} ${name}` };
}

export function karanaIndex(moon: number, sun: number) {
  return Math.floor(norm360(moon - sun) / 6) % 60;
}

export function karanaName(index: number) {
  if (index === 0) return KARANA_NAMES[10]; // Kimstughna
  if (index >= 57) return KARANA_NAMES[7 + (index - 57)];
  return KARANA_NAMES[(index - 1) % 7];
}

/** Rahu / Yamaganda / Gulika part (1..8) of the day, by weekday (0 = Sunday) */
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

const CHOGHADIYA_CYCLE = ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"];
const CHOGHADIYA_START = [0, 3, 6, 2, 5, 1, 4]; // Sun..Sat index into cycle
const CHOGHADIYA_QUALITY: Record<string, "good" | "bad" | "neutral"> = {
  Udveg: "bad", Char: "neutral", Labh: "good", Amrit: "good",
  Kaal: "bad", Shubh: "good", Rog: "bad",
};

const HORA_ORDER: PlanetId[] = [0, 5, 3, 1, 6, 4, 2]; // Chaldean descending

function partSlot(startJd: number, endJd: number, part: number, name: string, quality?: PanchangSlot["quality"]): PanchangSlot {
  const span = (endJd - startJd) / 8;
  return { name, startJd: startJd + span * (part - 1), endJd: startJd + span * part, quality };
}

/** Sunrise (local date) for a place. */
export function sunriseForLocalDate(dateStr: string, tz: string, lat: number, lon: number) {
  const localMidnight = localToUtc(dateStr, "00:00:00", tz);
  const jd = jdFromDateUtc(localMidnight);
  const sr = riseSet(jd - 0.2, lat, lon, swe.constants.SE_SUN, true);
  return sr.jd ?? jd + 0.25;
}

export function computePanchang(
  jd: number,
  lat: number,
  lon: number,
  tz: string,
  ayanamsa: AyanamsaKey = "lahiri",
): Panchang {
  const { sun, moon } = sunMoon(jd, { ayanamsa });

  // Hindu day = sunrise .. next sunrise
  const sr = riseSet(jd - 0.9, lat, lon, swe.constants.SE_SUN, true);
  let srJd = sr.jd ?? jd + 0.25;
  // When the reference instant is itself sunrise, the second search returns the
  // same instant with a tiny rounding difference. Only step back a day if the
  // sunrise is genuinely later than the reference.
  if (srJd > jd + 1e-4) {
    // birth before sunrise -> panchang day began yesterday
    const prev = riseSet(srJd - 1.2, lat, lon, swe.constants.SE_SUN, true);
    srJd = prev.jd ?? srJd - 1;
  }
  const ssJd = riseSet(srJd + 0.01, lat, lon, swe.constants.SE_SUN, false).jd ?? srJd + 0.5;
  const nextSr = riseSet(ssJd + 0.01, lat, lon, swe.constants.SE_SUN, true).jd ?? ssJd + 0.5;

  // The vara is the weekday of the sunrise that begins the Hindu day, read in
  // local civil time (a Sydney sunrise is still the previous UT date).
  const weekday = weekdayOfJdInTz(srJd, tz);

  const tIndex = tithiIndex(moon, sun);
  const tLabel = tithiLabel(tIndex);
  const nIndex = Math.floor(norm360(moon) / NAKSHATRA_SPAN) % 27;
  const pada = Math.min(4, Math.floor((norm360(moon) % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1);
  const yIndex = Math.floor(norm360(sun + moon) / NAKSHATRA_SPAN) % 27;
  const kIndex = karanaIndex(moon, sun);

  const tithiEnd = findCrossing(jd, (j) => {
    const g = sunMoon(j, { ayanamsa });
    return g.moon - g.sun;
  }, 12);
  const nakEnd = findCrossing(jd, (j) => sunMoon(j, { ayanamsa }).moon, NAKSHATRA_SPAN);
  const yogaEnd = findCrossing(jd, (j) => {
    const g = sunMoon(j, { ayanamsa });
    return g.sun + g.moon;
  }, NAKSHATRA_SPAN);
  const karanaEnd = findCrossing(jd, (j) => {
    const g = sunMoon(j, { ayanamsa });
    return g.moon - g.sun;
  }, 6);

  // Lunar month: sign of the Sun at the previous new moon
  const newMoonJd = findPrevNewMoon(jd, ayanamsa);
  const sunAtNewMoon = sunMoon(newMoonJd, { ayanamsa }).sun;
  const sunSignAtNewMoon = Math.floor(sunAtNewMoon / 30);
  const monthIndex = (sunSignAtNewMoon + 1) % 12;
  const purnimantaIndex = tLabel.paksha === "Krishna" ? (monthIndex + 1) % 12 : monthIndex;

  const greg = utcToLocalParts((jd - 2440587.5) * 86400000, tz);
  const gregYear = greg.year;
  // The Vikram year turns over at Chaitra. Pausha straddles the Gregorian new
  // year, so it belongs to the new samvat only in November/December.
  const vikram =
    gregYear + (monthIndex <= 8 || (monthIndex === 9 && greg.month >= 11) ? 57 : 56);
  const shaka = vikram - 135;
  // 60-year Jovian cycle: 1987-88 (Shaka 1909) was Prabhava.
  const samvatsara = SAMVATSARAS[(((shaka + 11) % 60) + 60) % 60];

  const dayLen = (ssJd - srJd) * 24;
  const nightLen = (nextSr - ssJd) * 24;

  const dayStartIdx = CHOGHADIYA_START[weekday];
  const choghadiyaDay: PanchangSlot[] = Array.from({ length: 8 }, (_, i) => {
    const name = CHOGHADIYA_CYCLE[(dayStartIdx + i) % 7];
    const span = (ssJd - srJd) / 8;
    return { name, startJd: srJd + span * i, endJd: srJd + span * (i + 1), quality: CHOGHADIYA_QUALITY[name] };
  });
  const nightStartIdx = CHOGHADIYA_START[(weekday + 4) % 7];
  const choghadiyaNight: PanchangSlot[] = Array.from({ length: 8 }, (_, i) => {
    const name = CHOGHADIYA_CYCLE[(nightStartIdx + i) % 7];
    const span = (nextSr - ssJd) / 8;
    return { name, startJd: ssJd + span * i, endJd: ssJd + span * (i + 1), quality: CHOGHADIYA_QUALITY[name] };
  });

  const midday = (srJd + ssJd) / 2;
  const abhijitSpan = (ssJd - srJd) / 30;

  const horas: PanchangSlot[] = [];
  const dayHora = (ssJd - srJd) / 12;
  const nightHora = (nextSr - ssJd) / 12;
  const startLord = WEEKDAYS[weekday].lord;
  let hi = HORA_ORDER.indexOf(startLord);
  for (let i = 0; i < 12; i++) {
    const lord = HORA_ORDER[(hi + i) % 7];
    horas.push({ name: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"][lord], lord, startJd: srJd + dayHora * i, endJd: srJd + dayHora * (i + 1) });
  }
  hi = (hi + 12) % 7;
  for (let i = 0; i < 12; i++) {
    const lord = HORA_ORDER[(hi + i) % 7];
    horas.push({ name: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"][lord], lord, startJd: ssJd + nightHora * i, endJd: ssJd + nightHora * (i + 1) });
  }

  const ritu = ["Vasanta", "Grishma", "Varsha", "Sharada", "Hemanta", "Shishira"][Math.floor(monthIndex / 2) % 6];
  const sunSign = Math.floor(sun / 30);

  return {
    sunriseJd: srJd,
    sunsetJd: ssJd,
    nextSunriseJd: nextSr,
    dayLengthHours: dayLen,
    nightLengthHours: nightLen,
    weekday,
    weekdayName: WEEKDAYS[weekday].name,
    tithi: {
      index: tIndex,
      number: tLabel.number,
      name: tLabel.name,
      fullName: tLabel.fullName,
      paksha: tLabel.paksha,
      endJd: tithiEnd,
    },
    nakshatra: { index: nIndex, name: NAKSHATRAS[nIndex].name, pada, endJd: nakEnd },
    yoga: { index: yIndex, name: YOGA_NAMES[yIndex], endJd: yogaEnd },
    karana: { index: kIndex, name: karanaName(kIndex), endJd: karanaEnd },
    moonSign: Math.floor(moon / 30),
    sunSign,
    lunarMonth: { name: LUNAR_MONTHS[monthIndex], purnimantaName: LUNAR_MONTHS[purnimantaIndex], index: monthIndex },
    samvat: { vikram, shaka, samvatsara },
    ritu,
    ayana: sunSign >= 9 || sunSign <= 2 ? "Uttarayana" : "Dakshinayana",
    sunRashi: RASHIS[sunSign].name,
    choghadiyaDay,
    choghadiyaNight,
    rahuKaal: partSlot(srJd, ssJd, RAHU_PART[weekday], "Rahu Kaal", "bad"),
    yamaganda: partSlot(srJd, ssJd, YAMA_PART[weekday], "Yamaganda", "bad"),
    gulikaKaal: partSlot(srJd, ssJd, GULIKA_PART[weekday], "Gulika Kaal", "bad"),
    abhijit: { name: "Abhijit", startJd: midday - abhijitSpan, endJd: midday + abhijitSpan, quality: "good" },
    horas,
    moonNakshatraEnd: nakEnd,
  };
}

export function findPrevNewMoon(jd: number, ayanamsa: AyanamsaKey = "lahiri") {
  const g = (j: number) => {
    const { sun, moon } = sunMoon(j, { ayanamsa });
    return norm360(moon - sun);
  };
  // Walk backwards from the date and take the first crossing we meet: that is
  // the most recent new moon. (Walking forwards from jd-32 can return an older
  // new moon when the window opens just before one.)
  const step = 0.25;
  let hi = jd;
  let prev = g(jd);
  for (let i = 0; i < 32 / step; i++) {
    const lo = hi - step;
    const cur = g(lo);
    if (cur > prev && cur > 180 && prev < 20) {
      // Between lo (angle near 360°) and hi (angle near 0°).
      let a = lo;
      let b = hi;
      for (let k = 0; k < 50; k++) {
        const m = (a + b) / 2;
        if (g(m) > 180) a = m;
        else b = m;
      }
      return (a + b) / 2;
    }
    prev = cur;
    hi = lo;
  }
  return jd - 29.53;
}

/** Upagrahas (Sun-based) in degrees */
export function upagrahas(sunLon: number) {
  const dhuma = norm360(sunLon + 133 + 20 / 60);
  const vyatipata = norm360(360 - dhuma);
  const parivesha = norm360(vyatipata + 180);
  const indrachapa = norm360(360 - parivesha);
  const upaketu = norm360(indrachapa + 16 + 40 / 60);
  return { dhuma, vyatipata, parivesha, indrachapa, upaketu };
}

void D2R;
