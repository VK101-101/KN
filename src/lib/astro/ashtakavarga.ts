/**
 * Ashtakavarga (Bhinnashtakavarga + Sarvashtakavarga).
 *
 * Benefic-place tables are ported from VedAstro (MIT licensed)
 * https://github.com/VedAstro/VedAstro/blob/master/Library/Logic/Calculate/Ashtakavarga.cs
 * which in turn follows B.V. Raman's "Ashtakavarga System" (pg. 9).
 */
import { PLANETS, type PlanetId } from "./constants";
import type { Chart } from "./chart";

/** key = `${mainPlanet}|${contributor}` -> houses counted from the contributor's sign */
const BENEFIC: Record<string, number[]> = {
  "0|0": [1, 2, 4, 7, 8, 9, 10, 11],
  "0|2": [1, 2, 4, 7, 8, 9, 10, 11],
  "0|6": [1, 2, 4, 7, 8, 9, 10, 11],
  "0|4": [5, 6, 9, 11],
  "0|1": [3, 6, 10, 11],
  "0|3": [3, 5, 6, 9, 10, 11, 12],
  "0|asc": [3, 4, 6, 10, 11, 12],
  "0|5": [6, 7, 12],

  "1|asc": [3, 6, 10, 11],
  "1|2": [2, 3, 5, 6, 9, 10, 11],
  "1|1": [1, 3, 6, 7, 10, 11],
  "1|0": [3, 6, 7, 8, 10, 11],
  "1|6": [3, 5, 6, 11],
  "1|3": [1, 3, 4, 5, 7, 8, 10, 11],
  "1|4": [1, 4, 7, 8, 10, 11, 12],
  "1|5": [3, 4, 5, 7, 9, 10, 11],

  "2|0": [3, 5, 6, 10, 11],
  "2|asc": [1, 3, 6, 10, 11],
  "2|1": [3, 6, 11],
  "2|2": [1, 2, 4, 7, 8, 10, 11],
  "2|6": [1, 4, 7, 8, 9, 10, 11],
  "2|3": [3, 5, 6, 11],
  "2|5": [6, 8, 11, 12],
  "2|4": [6, 10, 11, 12],

  "3|5": [1, 2, 3, 4, 5, 8, 9, 11],
  "3|2": [1, 2, 4, 7, 8, 9, 10, 11],
  "3|6": [1, 2, 4, 7, 8, 9, 10, 11],
  "3|4": [6, 8, 11, 12],
  "3|0": [5, 6, 9, 11, 12],
  "3|3": [1, 3, 5, 6, 9, 10, 11, 12],
  "3|1": [2, 4, 6, 8, 10, 11],
  "3|asc": [1, 2, 4, 6, 8, 10, 11],

  "4|2": [1, 2, 4, 7, 8, 10, 11],
  "4|4": [1, 2, 3, 4, 7, 8, 10, 11],
  "4|0": [1, 2, 3, 4, 7, 8, 9, 10, 11],
  "4|5": [2, 5, 6, 9, 10, 11],
  "4|1": [2, 5, 7, 9, 11],
  "4|6": [3, 5, 6, 12],
  "4|3": [1, 2, 4, 5, 6, 9, 10, 11],
  "4|asc": [1, 2, 4, 5, 6, 7, 9, 10, 11],

  "5|asc": [1, 2, 3, 4, 5, 8, 9, 11],
  "5|1": [1, 2, 3, 4, 5, 8, 9, 11, 12],
  "5|5": [1, 2, 3, 4, 5, 8, 9, 10, 11],
  "5|6": [3, 4, 5, 8, 9, 10, 11],
  "5|0": [8, 11, 12],
  "5|4": [5, 8, 9, 10, 11],
  "5|3": [3, 5, 6, 9, 11],
  "5|2": [3, 5, 6, 9, 11, 12],

  "6|6": [3, 5, 6, 11],
  "6|2": [3, 5, 6, 10, 11, 12],
  "6|0": [1, 2, 4, 7, 8, 10, 11],
  "6|asc": [1, 3, 4, 6, 10, 11],
  "6|3": [6, 8, 9, 10, 11, 12],
  "6|1": [3, 6, 11],
  "6|5": [6, 11, 12],
  "6|4": [5, 6, 11, 12],
};

export interface AshtakavargaResult {
  /** BAV per planet: 12 values indexed by sign 0..11 */
  bhinnashtakavarga: Record<number, number[]>;
  /** Sarvashtakavarga: sum of the seven BAVs, per sign */
  sarvashtakavarga: number[];
  /** BAV total per planet (should be 48/49/39/54/56/52/39) */
  totals: Record<number, number>;
}

export function computeAshtakavarga(chart: Chart): AshtakavargaResult {
  const signOf = (p: PlanetId) => chart.grahas.find((g) => g.planet === p)!.sign;
  const contributors: (PlanetId | "asc")[] = [0, 1, 2, 3, 4, 5, 6, "asc"];

  const bhinnashtakavarga: Record<number, number[]> = {};
  const totals: Record<number, number> = {};

  for (const main of [0, 1, 2, 3, 4, 5, 6]) {
    const row = Array(12).fill(0);
    for (const c of contributors) {
      const key = `${main}|${c}`;
      const houses = BENEFIC[key];
      if (!houses) continue;
      const start = c === "asc" ? chart.lagna.sign : signOf(c);
      for (const h of houses) row[(start + h - 1) % 12] += 1;
    }
    bhinnashtakavarga[main] = row;
    totals[main] = row.reduce((a, b) => a + b, 0);
  }

  const sarvashtakavarga = Array(12).fill(0);
  for (const p of [0, 1, 2, 3, 4, 5, 6]) {
    bhinnashtakavarga[p].forEach((v, i) => (sarvashtakavarga[i] += v));
  }

  return { bhinnashtakavarga, sarvashtakavarga, totals };
}

export const BAV_PLANETS = [0, 1, 2, 3, 4, 5, 6].map((i) => PLANETS[i].name);
