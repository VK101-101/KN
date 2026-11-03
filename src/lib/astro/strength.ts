import {
  DEBILITATION_SIGN,
  EXALTATION_SIGN,
  FRIENDSHIP,
  PLANETS,
  RASHIS,
  SIGN_LORD,
  type PlanetId,
  type VargaKey,
} from "./constants";
import type { Chart, Dignity } from "./chart";
import { aspectsOf } from "./chart";
import { norm360 } from "./ephemeris";
import type { Panchang } from "./panchang";
import { vargaSign } from "./vargas";

export interface ShadbalaRow {
  planet: PlanetId;
  sthana: number;
  dig: number;
  kala: number;
  cheshta: number;
  naisargika: number;
  drik: number;
  total: number;
  rupas: number;
  required: number;
  ratio: number;
}

export interface VimshopakaRow {
  planet: PlanetId;
  score: number; // out of 20
  percent: number;
}

const SAPTAVARGA: VargaKey[] = ["D1", "D2", "D3", "D7", "D9", "D12", "D30"];

const GREAT_FRIENDS: Record<number, number[]> = {
  0: [1, 4, 2],
  1: [0, 3],
  2: [0, 1, 4],
  3: [0, 5],
  4: [0, 1, 2],
  5: [3, 6],
  6: [3, 5],
  7: [5, 6, 3],
  8: [2, 5, 6],
};

function dignityScore(d: Dignity) {
  switch (d) {
    case "Moolatrikona":
      return 45;
    case "Own Sign":
      return 30;
    case "Great Friend":
      return 22.5;
    case "Friend":
      return 15;
    case "Neutral":
      return 7.5;
    case "Enemy":
      return 3.75;
    case "Exalted":
      return 45;
    case "Debilitated":
      return 1.875;
  }
}

function dignityInSign(planet: PlanetId, sign: number): Dignity {
  const p = PLANETS[planet];
  if (EXALTATION_SIGN[planet] === sign) return "Exalted";
  if (DEBILITATION_SIGN[planet] === sign) return "Debilitated";
  if (p.own.includes(sign)) return "Own Sign";
  const lord = SIGN_LORD[sign];
  if (GREAT_FRIENDS[planet]?.includes(lord)) return "Great Friend";
  const rel = FRIENDSHIP[planet];
  if (rel.friends.includes(lord)) return "Friend";
  if (rel.enemies.includes(lord)) return "Enemy";
  return "Neutral";
}

/** Distance between two longitudes in the 0..180 range (for uchcha bala) */
const arc = (a: number, b: number) => {
  const d = norm360(a - b);
  return d > 180 ? 360 - d : d;
};

const MALE = [0, 2, 4];
const FEMALE = [1, 5];

function drekkanaOf(degInSign: number) {
  return Math.floor(degInSign / 10) + 1;
}

export function computeShadbala(chart: Chart, panchang: Panchang): ShadbalaRow[] {
  const rows: ShadbalaRow[] = [];
  const jd = chart.jd;

  for (const g of chart.grahas) {
    const p = g.planet;
    const info = PLANETS[p];
    if (p === 7 || p === 8) continue; // nodes are not part of classical Shadbala

    /* ---------- 1. Sthana Bala ---------- */
    const debil = DEBILITATION_SIGN[p] * 30 + info.debil.deg;
    const uchcha = (180 - arc(g.lon, debil)) / 3; // max 60

    let saptavargaja = 0;
    for (const v of SAPTAVARGA) {
      const vs = vargaSign(g.lon, v);
      saptavargaja += dignityScore(dignityInSign(p, vs));
    }

    const odd = g.sign % 2 === 0;
    const likesOdd = [0, 2, 3, 4, 6].includes(p);
    const ojayugma = (likesOdd ? odd : !odd) ? 15 : 0;

    const kendraBala = [1, 4, 7, 10].includes(g.house) ? 60 : [2, 5, 8, 11].includes(g.house) ? 30 : 15;

    const drek = drekkanaOf(g.degInSign);
    const drekkanaBala = MALE.includes(p) ? (drek === 1 ? 15 : 0) : FEMALE.includes(p) ? (drek === 3 ? 15 : 0) : drek === 2 ? 15 : 0;

    const sthana = uchcha + saptavargaja + ojayugma + kendraBala + drekkanaBala;

    /* ---------- 2. Dig Bala ---------- */
    const weakPoint = [0, 2].includes(p) ? 4 : [4, 3].includes(p) ? 7 : [1, 5].includes(p) ? 10 : 1;
    const weakLon = chart.houses.sandhi[weakPoint - 1];
    const dig = arc(g.lon, weakLon) / 3; // max 60

    /* ---------- 3. Kala Bala ---------- */
    // Nathonnatha (diurnal / nocturnal)
    const sr = panchang.sunriseJd;
    const ss = panchang.sunsetJd;
    const dayFrac = (jd - sr) / (ss - sr);
    const diurnal = [0, 4, 5].includes(p);
    const nocturnal = [1, 2, 6].includes(p);
    let nathonnatha = 60;
    if (diurnal) nathonnatha = 60 * (1 - Math.min(1, Math.abs(dayFrac - 0.5) * 2));
    else if (nocturnal) nathonnatha = 60 * Math.min(1, Math.abs(dayFrac - 0.5) * 2);

    // Paksha bala
    const elong = Math.abs(((chart.grahas[1].lon - chart.grahas[0].lon + 540) % 360) - 180); // 0 new .. 180 full
    const benefic = [1, 3, 4, 5].includes(p);
    let paksha = benefic ? elong / 3 : (180 - elong) / 3;
    if (p === 1) paksha *= 2;

    // Tribhaga bala
    let tribhaga = 0;
    const isDay = jd >= sr && jd < ss;
    if (isDay) {
      const third = Math.floor(((jd - sr) / (ss - sr)) * 3);
      if ((p === 3 && third === 0) || (p === 0 && third === 1) || (p === 6 && third === 2)) tribhaga = 60;
    } else {
      const nightLen = panchang.nextSunriseJd - ss;
      const t = jd >= ss ? jd - ss : jd + 1 - ss;
      const third = Math.floor((t / nightLen) * 3);
      if ((p === 1 && third === 0) || (p === 5 && third === 1) || (p === 2 && third === 2)) tribhaga = 60;
    }
    if (p === 4) tribhaga = 60;

    // Vara + Hora bala
    const varaLord = [0, 1, 2, 3, 4, 5, 6][panchang.weekday];
    const currentHora = panchang.horas.find((h) => jd >= h.startJd && jd < h.endJd);
    let vara = p === varaLord ? 45 : 0;
    if (currentHora?.lord === p) vara += 60;

    // Ayana bala
    const northStrong = [0, 2, 4, 5].includes(p);
    const ayanaRaw = ((24 + g.declination) / 48) * 60;
    const ayana = p === 0 ? ayanaRaw * 2 : northStrong ? ayanaRaw : 60 - ayanaRaw;

    const kala = nathonnatha + paksha + tribhaga + vara + ayana;

    /* ---------- 4. Cheshta Bala ---------- */
    const meanSpeed = [0.9856, 13.176, 0.524, 1.383, 0.083, 1.2, 0.033][p];
    let cheshta: number;
    if (g.retrograde) cheshta = 60;
    else if (p === 0) cheshta = ayana;
    else if (p === 1) cheshta = paksha;
    else {
      const ratio = Math.min(2, Math.abs(g.speed) / meanSpeed);
      cheshta = Math.max(0, Math.min(60, 60 * (1 - ratio / 2)));
    }

    /* ---------- 5. Naisargika Bala ---------- */
    const naisargika = [60, 51.43, 17.14, 25.71, 34.29, 42.86, 8.57][p];

    /* ---------- 6. Drik Bala ---------- */
    let drik = 0;
    for (const other of chart.grahas) {
      if (other.planet === p) continue;
      if (other.planet === 7 || other.planet === 8) continue;
      const aspects = aspectsOf(other.planet).map((h) => norm360(other.lon + (h - 1) * 30));
      for (const a of aspects) {
        const dist = arc(g.lon, a);
        if (dist < 6) {
          const strength = 60 * (1 - dist / 6);
          drik += [1, 3, 4, 5].includes(other.planet) ? strength : -strength;
        }
      }
    }
    drik = Math.max(-60, Math.min(60, drik / 4));

    const total = sthana + dig + kala + cheshta + naisargika + drik;
    const required = [5, 6, 5, 7, 6.5, 5.5, 5][p];
    rows.push({
      planet: p,
      sthana,
      dig,
      kala,
      cheshta,
      naisargika,
      drik,
      total,
      rupas: total / 60,
      required,
      ratio: total / 60 / required,
    });
  }

  return rows.sort((a, b) => b.rupas - a.rupas);
}

/** Vimshopaka bala using the Shadvarga scheme (out of 20) */
export function computeVimshopaka(chart: Chart): VimshopakaRow[] {
  const weights: [VargaKey, number][] = [["D1", 6], ["D2", 2], ["D3", 4], ["D9", 5], ["D12", 2], ["D30", 1]];
  return chart.grahas
    .filter((g) => g.planet !== 7 && g.planet !== 8)
    .map((g) => {
      let score = 0;
      for (const [v, w] of weights) {
        const vs = vargaSign(g.lon, v);
        const d = dignityInSign(g.planet, vs);
        const factor = d === "Exalted" || d === "Moolatrikona" || d === "Own Sign" ? 1 : d === "Great Friend" ? 0.85 : d === "Friend" ? 0.7 : d === "Neutral" ? 0.5 : d === "Enemy" ? 0.3 : 0.1;
        score += w * factor;
      }
      return { planet: g.planet, score, percent: (score / 20) * 100 };
    })
    .sort((a, b) => b.score - a.score);
}

export function rashiOf(sign: number) {
  return RASHIS[sign].name;
}
