import {
  DEBILITATION_SIGN,
  EXALTATION_SIGN,
  FRIENDSHIP,
  KENDRA,
  NAKSHATRAS,
  PLANETS,
  RASHIS,
  SIGN_LORD,
  SUN,
  RAHU,
  MOON,
  type PlanetId,
  type VargaKey,
} from "./constants";
import {
  ayanamsaValue,
  bhavaOf,
  computeGrahas,
  computeHouses,
  declination,
  jdFromDateUtc,
  kpLords,
  nakInfo,
  norm360,
  type HouseResult,
  type KpLords,
} from "./ephemeris";
import { vargaSigns } from "./vargas";
import { DEFAULT_OPTIONS, type ChartOptions } from "./options";
import { localToUtc } from "../time";

export interface BirthInput {
  name: string;
  gender: "male" | "female" | "other";
  date: string; // YYYY-MM-DD in local time
  time: string; // HH:mm (local)
  tz: string;
  lat: number;
  lon: number;
  place: string;
}

export type Dignity =
  | "Exalted"
  | "Moolatrikona"
  | "Own Sign"
  | "Great Friend"
  | "Friend"
  | "Neutral"
  | "Enemy"
  | "Debilitated";

export interface Placement {
  planet: PlanetId;
  lon: number;
  speed: number;
  retrograde: boolean;
  sign: number;
  degInSign: number;
  house: number;
  bhava: number;
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  nakshatraLord: PlanetId;
  dignity: Dignity;
  combust: boolean;
  vargas: Record<VargaKey, number>;
  kp: KpLords;
  declination: number;
  isBenefic: boolean;
}

export interface LagnaInfo {
  lon: number;
  sign: number;
  degInSign: number;
  nakshatra: string;
  pada: number;
  lord: PlanetId;
  navamsaSign: number;
}

export interface Chart {
  input: BirthInput;
  options: ChartOptions;
  utc: Date;
  jd: number;
  ayanamsa: number;
  grahas: Placement[];
  lagna: LagnaInfo;
  houses: HouseResult;
  houseLords: { house: number; sign: number; lord: PlanetId; occupants: PlanetId[] }[];
  bhriguBindu: number;
  gulika: number;
  /** sign-wise occupants for chart drawing */
  bySign: Record<number, PlanetId[]>;
}

const COMBUSTION: Partial<Record<PlanetId, number>> = {
  [MOON]: 12,
  2: 17,
  3: 14,
  4: 11,
  5: 10,
  6: 15,
};

export function dignityOf(planet: PlanetId, sign: number, degInSign: number): Dignity {
  const p = PLANETS[planet];
  if (EXALTATION_SIGN[planet] === sign) return "Exalted";
  if (DEBILITATION_SIGN[planet] === sign) return "Debilitated";
  if (p.moolatrikona.sign === sign && degInSign >= p.moolatrikona.from && degInSign <= p.moolatrikona.to) {
    return "Moolatrikona";
  }
  if (p.own.includes(sign)) return "Own Sign";
  const lord = SIGN_LORD[sign];
  const rel = FRIENDSHIP[planet];
  if (rel.friends.includes(lord)) return "Friend";
  if (rel.enemies.includes(lord)) return "Enemy";
  return "Neutral";
}

export function buildChart(input: BirthInput, options: ChartOptions = DEFAULT_OPTIONS): Chart {
  const utc = localToUtc(input.date, input.time, input.tz);
  const jd = jdFromDateUtc(utc);

  const raw = computeGrahas(jd, {
    ayanamsa: options.ayanamsa,
    trueNode: options.trueNode,
    topocentric: options.topocentric,
    lat: input.lat,
    lon: input.lon,
  });
  const houses = computeHouses(jd, input.lat, input.lon, options.houseSystem, { ayanamsa: options.ayanamsa });
  const lagnaSign = Math.floor(houses.ascendant / 30);
  const sunLon = raw[0].lon;

  const grahas: Placement[] = raw.map((b) => {
    const n = nakInfo(b.lon);
    const sign = Math.floor(b.lon / 30);
    const degInSign = b.lon % 30;
    const distFromSun = Math.abs(((b.lon - sunLon + 540) % 360) - 180);
    const threshold = COMBUSTION[b.planet];
    return {
      planet: b.planet,
      lon: b.lon,
      speed: b.speed,
      retrograde: b.retrograde && b.planet !== RAHU && b.planet !== 8,
      sign,
      degInSign,
      house: ((sign - lagnaSign + 12) % 12) + 1,
      bhava: bhavaOf(b.lon, houses.sandhi),
      nakshatra: n.name,
      nakshatraIndex: n.index,
      pada: n.pada,
      nakshatraLord: n.lord,
      dignity: dignityOf(b.planet, sign, degInSign),
      combust: b.planet !== RAHU && b.planet !== 8 && threshold != null && distFromSun < threshold,
      vargas: vargaSigns(b.lon),
      kp: kpLords(b.lon),
      declination: declination(b.lon, b.lat, jd),
      isBenefic: [4, 5, 1, 3].includes(b.planet),
    };
  });

  const lagnaNak = nakInfo(houses.ascendant);

  const bySign: Record<number, PlanetId[]> = {};
  for (let i = 0; i < 12; i++) bySign[i] = [];
  for (const g of grahas) bySign[g.sign].push(g.planet);

  const houseLords = Array.from({ length: 12 }, (_, i) => {
    const sign = (lagnaSign + i) % 12;
    return {
      house: i + 1,
      sign,
      lord: SIGN_LORD[sign],
      occupants: grahas.filter((g) => g.house === i + 1).map((g) => g.planet),
    };
  });

  const rahu = grahas[7].lon;
  const moon = grahas[1].lon;
  const bh = norm360(rahu + ((moon - rahu + 540) % 360) / 2);
  const bhriguBindu = norm360(bh);

  return {
    input,
    options,
    utc,
    jd,
    ayanamsa: ayanamsaValue(jd),
    grahas,
    lagna: {
      lon: houses.ascendant,
      sign: lagnaSign,
      degInSign: houses.ascendant % 30,
      nakshatra: lagnaNak.name,
      pada: lagnaNak.pada,
      lord: SIGN_LORD[lagnaSign],
      navamsaSign: computeVarga(houses.ascendant, "D9"),
    },
    houses,
    houseLords,
    bhriguBindu,
    gulika: 0, // filled by index.ts (needs sunrise)
    bySign,
  };
}

function computeVarga(lon: number, key: VargaKey) {
  return vargaSigns(lon)[key];
}

export function grahaOf(chart: Chart, planet: PlanetId) {
  return chart.grahas.find((g) => g.planet === planet)!;
}

export function planetsInHouse(chart: Chart, house: number) {
  return chart.grahas.filter((g) => g.house === house).map((g) => g.planet);
}

export function planetsInSign(chart: Chart, sign: number) {
  return chart.grahas.filter((g) => g.sign === sign).map((g) => g.planet);
}

export function isKendra(house: number) {
  return KENDRA.includes(house);
}

export function houseFromSign(lagnaSign: number, sign: number) {
  return ((sign - lagnaSign + 12) % 12) + 1;
}

export function signName(sign: number) {
  return RASHIS[((sign % 12) + 12) % 12].name;
}

export function nakshatraName(index: number) {
  return NAKSHATRAS[index].name;
}

/**
 * Graha drishti (aspects) in the Parashari system.
 * Every planet aspects the 7th; Mars adds 4 & 8, Jupiter 5 & 9, Saturn 3 & 10,
 * Rahu/Ketu 5 & 9 (as commonly used by JHora).
 */
export function aspectsOf(planet: PlanetId): number[] {
  switch (planet) {
    case 2:
      return [4, 7, 8];
    case 4:
      return [5, 7, 9];
    case 6:
      return [3, 7, 10];
    case 7:
    case 8:
      return [5, 7, 9];
    default:
      return [7];
  }
}

export function planetsAspiringSign(chart: Chart, sign: number) {
  return chart.grahas.filter((g) => aspectsOf(g.planet).some((a) => (g.sign + a - 1) % 12 === sign));
}

export { SUN };
