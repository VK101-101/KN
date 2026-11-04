import {
  FRIENDSHIP,
  GANA_ORDER,
  NADI_ORDER,
  NAKSHATRAS,
  PLANETS,
  RASHIS,
  SIGN_LORD,
  VARNA_BY_SIGN,
  VARNA_ORDER,
  VASHYA_BY_SIGN,
  YONI_ENEMIES,
  JUPITER,
  MARS,
  MOON,
  VENUS,
} from "./constants";
import type { Chart } from "./chart";
import { aspectsOf } from "./chart";

export interface KutaScore {
  key: string;
  name: string;
  max: number;
  score: number;
  detail: string;
}

export interface MatchResult {
  total: number;
  max: number;
  percent: number;
  verdict: string;
  kutas: KutaScore[];
  brideMangal: boolean;
  groomMangal: boolean;
  notes: string[];
}

const YONI_FRIENDLY: Record<string, string[]> = {
  Horse: ["Deer", "Goat"],
  Elephant: ["Buffalo"],
  Goat: ["Horse", "Monkey"],
  Serpent: ["Deer"],
  Dog: ["Deer"],
  Cat: ["Deer"],
  Rat: ["Deer"],
  Tiger: ["Cow"],
  Cow: ["Tiger"],
  Buffalo: ["Elephant"],
  Deer: ["Horse", "Serpent", "Dog", "Cat", "Rat"],
  Monkey: ["Goat"],
  Mongoose: ["Serpent"],
  Lion: ["Elephant"],
};

function varnaScore(brideSign: number, groomSign: number) {
  const b = VARNA_ORDER[VARNA_BY_SIGN[brideSign]];
  const g = VARNA_ORDER[VARNA_BY_SIGN[groomSign]];
  const rank = (v: string) => VARNA_ORDER.indexOf(v as (typeof VARNA_ORDER)[number]);
  // A bride of equal or "lower" varna than the groom scores the point
  return rank(g) <= rank(b) ? 1 : 0;
}

const VASHYA_SCORE: Record<string, Record<string, number>> = {
  Chatushpada: { Chatushpada: 2, Nara: 1, Jalachara: 1, Vanachara: 0.5, Keeta: 0.5 },
  Nara: { Chatushpada: 1, Nara: 2, Jalachara: 1, Vanachara: 1, Keeta: 0.5 },
  Jalachara: { Chatushpada: 1, Nara: 1, Jalachara: 2, Vanachara: 0.5, Keeta: 0.5 },
  Vanachara: { Chatushpada: 0.5, Nara: 1, Jalachara: 0.5, Vanachara: 2, Keeta: 0.5 },
  Keeta: { Chatushpada: 0.5, Nara: 0.5, Jalachara: 0.5, Vanachara: 0.5, Keeta: 2 },
};

function taraScore(fromNak: number, toNak: number) {
  const count = ((toNak - fromNak + 27) % 27) + 1;
  const rem = count % 9;
  // Vipat (3), Pratyari (5) and Vadha (7) are the inauspicious Taras; the 9th is Ati-mitra.
  const bad = rem === 3 || rem === 5 || rem === 7;
  return bad ? 0 : 1.5;
}

function yoniScore(a: string, b: string) {
  if (a === b) return 4;
  if (YONI_ENEMIES[a] === b) return 0;
  if ((YONI_FRIENDLY[a] ?? []).includes(b) || (YONI_FRIENDLY[b] ?? []).includes(a)) return 3;
  return 2;
}

function maitriScore(aSign: number, bSign: number) {
  const a = SIGN_LORD[aSign];
  const b = SIGN_LORD[bSign];
  if (a === b) return 5;
  const aView = FRIENDSHIP[a].friends.includes(b) ? "F" : FRIENDSHIP[a].enemies.includes(b) ? "E" : "N";
  const bView = FRIENDSHIP[b].friends.includes(a) ? "F" : FRIENDSHIP[b].enemies.includes(a) ? "E" : "N";
  const key = [aView, bView].sort().join("");
  switch (key) {
    case "FF":
      return 5;
    case "FN":
      return 4;
    case "NN":
      return 3;
    case "EF":
      return 1;
    case "EN":
      return 0.5;
    default:
      return 0;
  }
}

function ganaScore(a: string, b: string) {
  if (a === b) return 6;
  const pair = [a, b].sort().join("-");
  if (pair === "Deva-Manushya") return 5;
  if (pair === "Deva-Rakshasa") return 1;
  return 0;
}

function bhakootScore(aSign: number, bSign: number) {
  const d1 = ((bSign - aSign + 12) % 12) + 1;
  const d2 = ((aSign - bSign + 12) % 12) + 1;
  const pair = [d1, d2].sort((x, y) => x - y).join("-");
  if (["2-12", "5-9", "6-8"].includes(pair)) return 0;
  return 7;
}

function nadiScore(a: string, b: string) {
  return a === b ? 0 : 8;
}

export function mangalDosha(chart: Chart) {
  const mars = chart.grahas.find((g) => g.planet === MARS)!;
  const moon = chart.grahas.find((g) => g.planet === MOON)!;
  const venus = chart.grahas.find((g) => g.planet === VENUS)!;
  const houses = [1, 4, 7, 8, 12];
  const fromLagna = mars.house;
  const fromMoon = ((mars.sign - moon.sign + 12) % 12) + 1;
  const fromVenus = ((mars.sign - venus.sign + 12) % 12) + 1;
  const jupiter = chart.grahas.find((g) => g.planet === JUPITER)!;
  const jupiterAspectsMars = aspectsOf(JUPITER).some((a) => (jupiter.sign + a - 1) % 12 === mars.sign);
  const present = houses.includes(fromLagna) || houses.includes(fromMoon) || houses.includes(fromVenus);
  const cancelled =
    ["Exalted", "Own Sign", "Moolatrikona"].includes(mars.dignity) ||
    [0, 7, 9].includes(mars.sign) ||
    jupiterAspectsMars;
  return { present, cancelled, fromLagna, fromMoon, fromVenus };
}

export function matchCharts(bride: Chart, groom: Chart): MatchResult {
  const bMoon = bride.grahas.find((g) => g.planet === MOON)!;
  const gMoon = groom.grahas.find((g) => g.planet === MOON)!;
  const bNak = NAKSHATRAS[bMoon.nakshatraIndex];
  const gNak = NAKSHATRAS[gMoon.nakshatraIndex];

  const kutas: KutaScore[] = [];

  kutas.push({
    key: "varna",
    name: "Varna",
    max: 1,
    score: varnaScore(bMoon.sign, gMoon.sign),
    detail: `${VARNA_ORDER[VARNA_BY_SIGN[bMoon.sign]]} (bride) vs ${VARNA_ORDER[VARNA_BY_SIGN[gMoon.sign]]} (groom)`,
  });

  kutas.push({
    key: "vashya",
    name: "Vashya",
    max: 2,
    score: VASHYA_SCORE[VASHYA_BY_SIGN[bMoon.sign]][VASHYA_BY_SIGN[gMoon.sign]],
    detail: `${VASHYA_BY_SIGN[bMoon.sign]} vs ${VASHYA_BY_SIGN[gMoon.sign]}`,
  });

  const tara1 = taraScore(bMoon.nakshatraIndex, gMoon.nakshatraIndex);
  const tara2 = taraScore(gMoon.nakshatraIndex, bMoon.nakshatraIndex);
  kutas.push({
    key: "tara",
    name: "Tara",
    max: 3,
    score: tara1 + tara2,
    detail: `Bride→groom ${tara1} + groom→bride ${tara2}`,
  });

  kutas.push({
    key: "yoni",
    name: "Yoni",
    max: 4,
    score: yoniScore(bNak.yoni, gNak.yoni),
    detail: `${bNak.yoni} vs ${gNak.yoni}`,
  });

  kutas.push({
    key: "maitri",
    name: "Graha Maitri",
    max: 5,
    score: maitriScore(bMoon.sign, gMoon.sign),
    detail: `Moon-sign lords: ${RASHIS[bMoon.sign].name} (${PLANETS[RASHIS[bMoon.sign].lord].name}) vs ${RASHIS[gMoon.sign].name} (${PLANETS[RASHIS[gMoon.sign].lord].name})`,
  });

  kutas.push({
    key: "gana",
    name: "Gana",
    max: 6,
    score: ganaScore(bNak.gana, gNak.gana),
    detail: `${bNak.gana} vs ${gNak.gana}`,
  });

  kutas.push({
    key: "bhakoot",
    name: "Bhakoot",
    max: 7,
    score: bhakootScore(bMoon.sign, gMoon.sign),
    detail: `${RASHIS[bMoon.sign].name} / ${RASHIS[gMoon.sign].name}`,
  });

  kutas.push({
    key: "nadi",
    name: "Nadi",
    max: 8,
    score: nadiScore(bNak.nadi, gNak.nadi),
    detail: `${bNak.nadi} vs ${gNak.nadi}`,
  });

  const total = kutas.reduce((a, k) => a + k.score, 0);
  const percent = (total / 36) * 100;
  const verdict =
    total >= 32 ? "Excellent match" :
    total >= 25 ? "Very good match" :
    total >= 18 ? "Good match" :
    total >= 12 ? "Average - needs judgement" : "Below the traditional threshold";

  const bMangal = mangalDosha(bride);
  const gMangal = mangalDosha(groom);

  const notes: string[] = [];
  if (bMangal.present && gMangal.present) notes.push("Both charts carry Mangal dosha - the classical cancellation by mutual matching applies.");
  else if (bMangal.present) notes.push("The bride's chart has Mangal dosha; the groom's does not.");
  else if (gMangal.present) notes.push("The groom's chart has Mangal dosha; the bride's does not.");
  if (kutas.find((k) => k.key === "nadi")!.score === 0) notes.push("Nadi dosha is present (0/8) - traditionally checked again against the Moon sign and the 7th house before a decision.");
  if (kutas.find((k) => k.key === "bhakoot")!.score === 0) notes.push("Bhakoot dosha is present (0/7) - often cancelled when the Moon-sign lords are friends and the Navamsa charts agree.");
  if (total >= 18) notes.push("Guna Milan is only one input. The 7th house, Venus, Jupiter and both Navamsa charts decide the real quality of a match.");

  return {
    total,
    max: 36,
    percent,
    verdict,
    kutas,
    brideMangal: bMangal.present && !bMangal.cancelled,
    groomMangal: gMangal.present && !gMangal.cancelled,
    notes,
  };
}

export const GANA_LIST = GANA_ORDER;
export const NADI_LIST = NADI_ORDER;
