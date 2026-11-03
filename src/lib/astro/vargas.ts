import { norm360 } from "./ephemeris";
import type { VargaKey } from "./constants";

const signOf = (lon: number) => Math.floor(norm360(lon) / 30);
const degOf = (lon: number) => norm360(lon) % 30;
const isOdd = (sign: number) => sign % 2 === 0; // Aries = 0 is the 1st (odd) sign

/**
 * Divisional chart mapping, BPHS / Parashara as implemented by JHora.
 * Returns the varga sign (0..11) of a sidereal longitude.
 */
export function vargaSign(lon: number, key: VargaKey): number {
  const sign = signOf(lon);
  const deg = degOf(lon);
  const part = (n: number) => Math.floor(deg / (30 / n));
  const mod = (x: number) => ((x % 12) + 12) % 12;

  switch (key) {
    case "D1":
      return sign;
    case "D2":
      return isOdd(sign) ? (deg < 15 ? 4 : 3) : deg < 15 ? 3 : 4;
    case "D3":
      return mod(sign + part(3) * 4);
    case "D4":
      return mod(sign + part(4) * 3);
    case "D7":
      return mod((isOdd(sign) ? sign : sign + 6) + part(7));
    case "D9": {
      const mobility = sign % 3; // 0 movable, 1 fixed, 2 dual
      const start = mobility === 0 ? sign : mobility === 1 ? sign + 8 : sign + 4;
      return mod(start + part(9));
    }
    case "D10":
      return mod((isOdd(sign) ? sign : sign + 8) + part(10));
    case "D12":
      return mod(sign + part(12));
    case "D16": {
      const mobility = sign % 3;
      const start = mobility === 0 ? 0 : mobility === 1 ? 4 : 8;
      return mod(start + part(16));
    }
    case "D20": {
      const mobility = sign % 3;
      const start = mobility === 0 ? 0 : mobility === 1 ? 8 : 4;
      return mod(start + part(20));
    }
    case "D24":
      return mod((isOdd(sign) ? 4 : 3) + part(24));
    case "D27": {
      const element = sign % 4; // Fire, Earth, Air, Water
      const start = [0, 3, 6, 9][element];
      return mod(start + part(27));
    }
    case "D30": {
      if (isOdd(sign)) {
        if (deg < 5) return 0; // Mars / Aries
        if (deg < 10) return 10; // Saturn / Aquarius
        if (deg < 18) return 8; // Jupiter / Sagittarius
        if (deg < 25) return 2; // Mercury / Gemini
        return 6; // Venus / Libra
      }
      if (deg < 5) return 1; // Venus / Taurus
      if (deg < 12) return 5; // Mercury / Virgo
      if (deg < 20) return 11; // Jupiter / Pisces
      if (deg < 25) return 9; // Saturn / Capricorn
      return 7; // Mars / Scorpio
    }
    case "D40":
      return mod((isOdd(sign) ? 0 : 6) + part(40));
    case "D45": {
      const mobility = sign % 3;
      const start = mobility === 0 ? 0 : mobility === 1 ? 4 : 8;
      return mod(start + part(45));
    }
    case "D60":
      return mod(sign + part(60));
    default:
      return sign;
  }
}

export function vargaSigns(lon: number): Record<VargaKey, number> {
  const keys: VargaKey[] = [
    "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
    "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60",
  ];
  const out = {} as Record<VargaKey, number>;
  for (const k of keys) out[k] = vargaSign(lon, k);
  return out;
}
