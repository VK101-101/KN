/**
 * Calculation options that are safe to import from client components.
 *
 * This module deliberately contains no astronomy code: the ephemeris pulls in
 * the native Swiss Ephemeris binding, so anything the browser bundle touches
 * (forms, query parsing) must import its choices from here instead.
 */

export const AYANAMSAS = [
  { key: "lahiri", label: "Lahiri / Chitrapaksha" },
  { key: "true_chitra", label: "True Chitrapaksha" },
  { key: "raman", label: "B. V. Raman" },
  { key: "kp", label: "Krishnamurti (KP)" },
  { key: "yukteshwar", label: "Sri Yukteshwar" },
  { key: "fagan", label: "Fagan-Bradley" },
] as const;

export type AyanamsaKey = (typeof AYANAMSAS)[number]["key"];

export const HOUSE_SYSTEMS = [
  { key: "W", label: "Whole Sign (Rasi = Bhava)" },
  { key: "S", label: "Sripati (Bhava Chalit)" },
  { key: "O", label: "Porphyry" },
  { key: "P", label: "Placidus" },
  { key: "E", label: "Equal" },
] as const;

export type HouseSystemKey = (typeof HOUSE_SYSTEMS)[number]["key"];

export interface ChartOptions {
  ayanamsa: AyanamsaKey;
  houseSystem: HouseSystemKey;
  trueNode: boolean;
  topocentric: boolean;
  dashaYear: 360 | 365.25;
}

export const DEFAULT_OPTIONS: ChartOptions = {
  ayanamsa: "lahiri",
  houseSystem: "W",
  trueNode: false,
  topocentric: false,
  dashaYear: 365.25,
};
