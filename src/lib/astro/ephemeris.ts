/**
 * Swiss Ephemeris wrapper.
 *
 * All astronomy is delegated to the same engine used by Jagannatha Hora,
 * Parashara's Light and AstroSage (Swiss Ephemeris by Astrodienst).
 * Nothing in this file invents positions - it only converts them to the
 * sidereal (Lahiri / Chitrapaksha by default) frame that Jyotisha uses.
 */
import * as swe from "sweph";
import fs from "node:fs";
import path from "node:path";
import {
  DASHA_ORDER,
  KETU,
  NAKSHATRA_SPAN,
  NAKSHATRAS,
  RAHU,
  PADA_SPAN,
  type PlanetId,
} from "./constants";

import {
  AYANAMSAS,
  HOUSE_SYSTEMS,
  type AyanamsaKey,
  type HouseSystemKey,
} from "./options";

const C = swe.constants;

export { AYANAMSAS, HOUSE_SYSTEMS };
export type { AyanamsaKey, HouseSystemKey };

/** Swiss Ephemeris sidereal-mode constants for each ayanamsa we offer. */
const SID_MODE: Record<AyanamsaKey, number> = {
  lahiri: C.SE_SIDM_LAHIRI,
  true_chitra: C.SE_SIDM_TRUE_CITRA,
  raman: C.SE_SIDM_RAMAN,
  kp: C.SE_SIDM_KRISHNAMURTI,
  yukteshwar: C.SE_SIDM_YUKTESHWAR,
  fagan: C.SE_SIDM_FAGAN_BRADLEY,
};

let initialised = false;

export function initEphemeris() {
  if (initialised) return;
  initialised = true;
  const candidates = [
    path.join(process.cwd(), "ephe"),
    path.join(process.cwd(), "public", "ephe"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        swe.set_ephe_path(p);
        break;
      } catch {
        /* fall back to Moshier */
      }
    }
  }
}

export const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Signed angular difference a-b in (-180, 180] */
export function angularDiff(a: number, b: number) {
  let d = norm360(a - b);
  if (d > 180) d -= 360;
  return d;
}

/** Midpoint of the shorter arc between two longitudes */
export function midPoint(a: number, b: number) {
  return norm360(a + angularDiff(b, a) / 2);
}

export function jdFromDateUtc(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function dateFromJdUtc(jd: number) {
  return new Date((jd - 2440587.5) * 86400000);
}

export interface BodyPosition {
  planet: PlanetId;
  lon: number;
  lat: number;
  dist: number;
  speed: number;
  retrograde: boolean;
}

export interface EphemerisOptions {
  ayanamsa?: AyanamsaKey;
  trueNode?: boolean;
  topocentric?: boolean;
  lat?: number;
  lon?: number;
}

export function setAyanamsa(key: AyanamsaKey) {
  swe.set_sid_mode(SID_MODE[key] ?? SID_MODE.lahiri, 0, 0);
}

export function ayanamsaValue(jdUt: number) {
  return swe.get_ayanamsa_ut(jdUt);
}

/**
 * Sidereal longitudes of the nine grahas in the order Sun..Ketu.
 * Uses apparent geocentric positions (SEFLG_SWIEPH) exactly like JHora.
 */
export function computeGrahas(jdUt: number, opts: EphemerisOptions = {}): BodyPosition[] {
  initEphemeris();
  setAyanamsa(opts.ayanamsa ?? "lahiri");

  if (opts.topocentric && opts.lat != null && opts.lon != null) {
    swe.set_topo(opts.lon, opts.lat, 0);
  }

  let flags = C.SEFLG_SWIEPH | C.SEFLG_SPEED | C.SEFLG_SIDEREAL;
  if (opts.topocentric) flags |= C.SEFLG_TOPOCTR;

  const out: BodyPosition[] = [];
  const ids: PlanetId[] = [0, 1, 2, 3, 4, 5, 6];
  for (const p of ids) {
    const sweId = p === 0 ? C.SE_SUN : p === 1 ? C.SE_MOON : p === 2 ? C.SE_MARS
      : p === 3 ? C.SE_MERCURY : p === 4 ? C.SE_JUPITER : p === 5 ? C.SE_VENUS : C.SE_SATURN;
    const r = swe.calc_ut(jdUt, sweId, flags);
    out.push({
      planet: p,
      lon: norm360(r.data[0]),
      lat: r.data[1],
      dist: r.data[2],
      speed: r.data[3],
      retrograde: r.data[3] < 0,
    });
  }

  const nodeId = opts.trueNode ? C.SE_TRUE_NODE : C.SE_MEAN_NODE;
  const node = swe.calc_ut(jdUt, nodeId, flags);
  const rahuLon = norm360(node.data[0]);
  out.push({ planet: RAHU, lon: rahuLon, lat: 0, dist: node.data[2], speed: node.data[3], retrograde: true });
  out.push({ planet: KETU, lon: norm360(rahuLon + 180), lat: 0, dist: node.data[2], speed: node.data[3], retrograde: true });

  return out;
}

/**
 * Fast Sun/Moon-only positions, used by the panchang's root-finding loops.
 * Avoids computing all nine bodies for every bisection step.
 */
export function sunMoon(jdUt: number, opts: EphemerisOptions = {}) {
  initEphemeris();
  setAyanamsa(opts.ayanamsa ?? "lahiri");
  const flags = C.SEFLG_SWIEPH | C.SEFLG_SPEED | C.SEFLG_SIDEREAL;
  const s = swe.calc_ut(jdUt, C.SE_SUN, flags);
  const m = swe.calc_ut(jdUt, C.SE_MOON, flags);
  return { sun: norm360(s.data[0]), moon: norm360(m.data[0]) };
}

/** Sidereal longitude of a single Swiss Ephemeris body. */
export function bodyLongitude(jdUt: number, sweId: number, ayanamsa: AyanamsaKey = "lahiri") {
  initEphemeris();
  setAyanamsa(ayanamsa);
  const r = swe.calc_ut(jdUt, sweId, C.SEFLG_SWIEPH | C.SEFLG_SPEED | C.SEFLG_SIDEREAL);
  return norm360(r.data[0]);
}

export interface HouseResult {
  cusps: number[];
  /** Bhava madhya (house centres) */
  madhya: number[];
  /** Bhava sandhi (house boundaries) */
  sandhi: number[];
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
}

export function computeHouses(
  jdUt: number,
  lat: number,
  lon: number,
  system: HouseSystemKey = "W",
  opts: EphemerisOptions = {},
): HouseResult {
  initEphemeris();
  setAyanamsa(opts.ayanamsa ?? "lahiri");
  const flags = C.SEFLG_SWIEPH | C.SEFLG_SIDEREAL;

  if (system === "W") {
    const a = swe.houses_ex(jdUt, flags, lat, lon, "W");
    const asc = norm360(a.data.points[0]);
    const sandhi = a.data.houses.slice(0, 12).map((x: number) => norm360(x));
    const madhya = sandhi.map((s: number) => norm360(s + 15));
    return {
      cusps: sandhi.slice(),
      madhya,
      sandhi,
      ascendant: asc,
      mc: norm360(a.data.points[1]),
      armc: a.data.points[2],
      vertex: norm360(a.data.points[3]),
    };
  }

  // Sripati = Porphyry cusps treated as bhava madhya (JHora convention)
  const hsys = system === "S" ? "O" : system;
  const a = swe.houses_ex(jdUt, flags, lat, lon, hsys);
  const cusps = a.data.houses.slice(0, 12).map((x: number) => norm360(x));
  const asc = norm360(a.data.points[0]);

  if (system === "S" || system === "O") {
    const madhya = cusps;
    const sandhi = madhya.map((c, i) => midPoint(c, madhya[(i + 1) % 12]));
    return {
      cusps,
      madhya,
      sandhi,
      ascendant: asc,
      mc: norm360(a.data.points[1]),
      armc: a.data.points[2],
      vertex: norm360(a.data.points[3]),
    };
  }

  // Placidus / Equal: cusps are boundaries, madhya is the midpoint
  const sandhi = cusps;
  const madhya = cusps.map((c, i) => midPoint(c, sandhi[(i + 11) % 12]));
  return {
    cusps,
    madhya,
    sandhi,
    ascendant: asc,
    mc: norm360(a.data.points[1]),
    armc: a.data.points[2],
    vertex: norm360(a.data.points[3]),
  };
}

/** House (1..12) whose sandhi-to-sandhi arc contains the longitude */
export function bhavaOf(lon: number, sandhi: number[]) {
  for (let i = 0; i < 12; i++) {
    const start = sandhi[(i + 11) % 12];
    const end = sandhi[i];
    const span = norm360(end - start) || 360;
    const off = norm360(lon - start);
    if (off < span) return i + 1;
  }
  return 12;
}

export interface RiseSet {
  jd: number | null;
  date: Date | null;
}

/**
 * Hindu sunrise/sunset: centre of the disc, no refraction (the convention used
 * by Drik Panchang and JHora for the panchang day boundary).
 */
export function riseSet(
  jdStart: number,
  lat: number,
  lon: number,
  body: number,
  rise: boolean,
): RiseSet {
  initEphemeris();
  const rsmi = (rise ? C.SE_CALC_RISE : C.SE_CALC_SET) | C.SE_BIT_DISC_CENTER;
  const r = swe.rise_trans(jdStart, body, null, C.SEFLG_SWIEPH, rsmi, [lon, lat, 0], 0, 0);
  if (r.error || !r.data) return { jd: null, date: null };
  return { jd: r.data, date: dateFromJdUtc(r.data) };
}

export interface NakInfo {
  index: number;
  pada: number;
  name: string;
  hi: string;
  lord: PlanetId;
  /** 0..1 progress inside the nakshatra */
  fraction: number;
}

export function nakInfo(lon: number): NakInfo {
  const l = norm360(lon);
  const index = Math.floor(l / NAKSHATRA_SPAN) % 27;
  const within = l - index * NAKSHATRA_SPAN;
  const pada = Math.min(4, Math.floor(within / PADA_SPAN) + 1);
  const n = NAKSHATRAS[index];
  return {
    index,
    pada,
    name: n.name,
    hi: n.hi,
    lord: n.lord as PlanetId,
    fraction: within / NAKSHATRA_SPAN,
  };
}

export interface KpLords {
  star: PlanetId;
  sub: PlanetId;
  subSub: PlanetId;
  /** start of the star, sub and sub-sub divisions in absolute longitude */
  starStart: number;
  subStart: number;
  subSubStart: number;
}

/** KP star / sub / sub-sub lords for any longitude */
export function kpLords(lon: number): KpLords {
  const l = norm360(lon);
  const nakIndex = Math.floor(l / NAKSHATRA_SPAN) % 27;
  const starStart = nakIndex * NAKSHATRA_SPAN;
  const starLord = NAKSHATRAS[nakIndex].lord as PlanetId;

  const rotate = (lord: PlanetId) => {
    const i = DASHA_ORDER.indexOf(lord);
    return [...DASHA_ORDER.slice(i), ...DASHA_ORDER.slice(0, i)];
  };

  const seq1 = rotate(starLord);
  let acc = 0;
  let subStart = starStart;
  let subLord = seq1[0];
  const posInStar = l - starStart;
  // Sub divisions are proportional to Vimshottari years
  let cursor = 0;
  for (const p of seq1) {
    const width = (planetYears(p) / 120) * NAKSHATRA_SPAN;
    if (posInStar >= cursor && posInStar < cursor + width) {
      subStart = starStart + cursor;
      subLord = p;
      break;
    }
    cursor += width;
  }

  const seq2 = rotate(subLord);
  const posInSub = l - subStart;
  const subWidth = (planetYears(subLord) / 120) * NAKSHATRA_SPAN;
  let cursor2 = 0;
  let subSubStart = subStart;
  let subSub = seq2[0];
  for (const p of seq2) {
    const width = (planetYears(p) / 120) * subWidth;
    if (posInSub >= cursor2 && posInSub < cursor2 + width) {
      subSubStart = subStart + cursor2;
      subSub = p;
      break;
    }
    cursor2 += width;
  }

  return { star: starLord, sub: subLord, subSub, starStart, subStart, subSubStart };
}

function planetYears(p: PlanetId) {
  return [6, 10, 7, 17, 16, 20, 19, 18, 7][p];
}

export function obliquity(jd: number) {
  const t = (jd - 2451545.0) / 36525;
  return 23.439291 - 0.0130042 * t - 1.64e-7 * t * t + 5.04e-7 * t * t * t;
}

/** Declination of a body from its ecliptic longitude/latitude */
export function declination(lon: number, lat: number, jd: number) {
  const eps = (obliquity(jd) * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  const b = (lat * Math.PI) / 180;
  return (Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l)) * 180) / Math.PI;
}

export { swe };
