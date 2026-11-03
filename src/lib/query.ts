import { AYANAMSAS, DEFAULT_OPTIONS, HOUSE_SYSTEMS, type ChartOptions } from "./astro/options";
import type { BirthInput } from "./astro/chart";
import { CITIES } from "./geo/cities";

export type QueryParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export const DEFAULT_PERSON = {
  name: "Test Native",
  gender: "male" as const,
  date: "1990-01-01",
  time: "12:00",
  place: "New Delhi",
  lat: 28.6139,
  lon: 77.209,
  tz: "Asia/Kolkata",
};

export function parseBirthParams(sp: QueryParams, prefix = ""): BirthInput {
  const get = (k: string) => one(sp[`${prefix}${k}`]);
  const city = CITIES.find((c) => c.name.toLowerCase() === (get("p") ?? "").toLowerCase());
  const lat = Number(get("lat"));
  const lon = Number(get("lon"));
  const date = get("d");
  const time = get("t");
  const gender = get("g");
  return {
    name: (get("n") ?? "").trim() || (prefix ? "Partner" : "Native"),
    gender: gender === "female" || gender === "other" ? gender : "male",
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : DEFAULT_PERSON.date,
    time: time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : DEFAULT_PERSON.time,
    tz: get("tz") || city?.tz || DEFAULT_PERSON.tz,
    lat: Number.isFinite(lat) && Math.abs(lat) <= 90 ? lat : city?.lat ?? DEFAULT_PERSON.lat,
    lon: Number.isFinite(lon) && Math.abs(lon) <= 180 ? lon : city?.lon ?? DEFAULT_PERSON.lon,
    place: get("p") || city?.name || DEFAULT_PERSON.place,
  };
}

export function parseOptions(sp: QueryParams): ChartOptions {
  const get = (k: string) => one(sp[k]);
  const ay = AYANAMSAS.find((a) => a.key === get("ay"))?.key ?? DEFAULT_OPTIONS.ayanamsa;
  const hs = HOUSE_SYSTEMS.find((h) => h.key === get("hs"))?.key ?? DEFAULT_OPTIONS.houseSystem;
  const dy = get("dy") === "360" ? 360 : 365.25;
  return {
    ayanamsa: ay,
    houseSystem: hs,
    trueNode: get("tn") === "1",
    topocentric: false,
    dashaYear: dy,
  };
}

export function birthQuery(input: BirthInput, options: ChartOptions, prefix = "") {
  const q = new URLSearchParams();
  const set = (k: string, v: string | number) => q.set(`${prefix}${k}`, String(v));
  set("n", input.name);
  set("g", input.gender);
  set("d", input.date);
  set("t", input.time);
  set("p", input.place);
  set("lat", input.lat.toFixed(4));
  set("lon", input.lon.toFixed(4));
  set("tz", input.tz);
  q.set("ay", options.ayanamsa);
  q.set("hs", options.houseSystem);
  q.set("tn", options.trueNode ? "1" : "0");
  q.set("dy", String(options.dashaYear));
  return q;
}
