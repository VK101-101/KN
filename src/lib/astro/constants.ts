/**
 * Core Vedic (Jyotisha) constants.
 *
 * The tables here follow the conventions used by Jagannatha Hora (PVR Narasimha Rao)
 * and Parashara's Light / AstroSage, i.e. classical BPHS + standard North-Indian practice.
 */

export type PlanetId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface PlanetInfo {
  id: PlanetId;
  name: string;
  short: string;
  hi: string;
  sanskrit: string;
  /** Natural benefic / malefic (BPHS) */
  benefic: boolean;
  /** Exaltation degree inside the sign */
  exalt: { sign: number; deg: number };
  debil: { sign: number; deg: number };
  moolatrikona: { sign: number; from: number; to: number };
  own: number[];
  /** Colour used across the UI */
  color: string;
  /** Vimshottari years */
  years: number;
  /** Swiss Ephemeris id (-1 for derived points) */
  sweId: number;
}

export const SUN: PlanetId = 0;
export const MOON: PlanetId = 1;
export const MARS: PlanetId = 2;
export const MERCURY: PlanetId = 3;
export const JUPITER: PlanetId = 4;
export const VENUS: PlanetId = 5;
export const SATURN: PlanetId = 6;
export const RAHU: PlanetId = 7;
export const KETU: PlanetId = 8;

export const PLANETS: PlanetInfo[] = [
  {
    id: 0, name: "Sun", short: "Su", hi: "सूर्य", sanskrit: "Surya", benefic: false,
    exalt: { sign: 0, deg: 10 }, debil: { sign: 6, deg: 10 },
    moolatrikona: { sign: 4, from: 0, to: 20 }, own: [4],
    color: "#f97316", years: 6, sweId: 0,
  },
  {
    id: 1, name: "Moon", short: "Mo", hi: "चंद्र", sanskrit: "Chandra", benefic: true,
    exalt: { sign: 1, deg: 3 }, debil: { sign: 8, deg: 3 },
    moolatrikona: { sign: 1, from: 3, to: 30 }, own: [3],
    color: "#94a3b8", years: 10, sweId: 1,
  },
  {
    id: 2, name: "Mars", short: "Ma", hi: "मंगल", sanskrit: "Mangala", benefic: false,
    exalt: { sign: 9, deg: 28 }, debil: { sign: 3, deg: 28 },
    moolatrikona: { sign: 0, from: 0, to: 12 }, own: [0, 7],
    color: "#ef4444", years: 7, sweId: 4,
  },
  {
    id: 3, name: "Mercury", short: "Me", hi: "बुध", sanskrit: "Budha", benefic: true,
    exalt: { sign: 5, deg: 15 }, debil: { sign: 11, deg: 15 },
    moolatrikona: { sign: 5, from: 16, to: 20 }, own: [2, 5],
    color: "#22c55e", years: 17, sweId: 2,
  },
  {
    id: 4, name: "Jupiter", short: "Ju", hi: "गुरु", sanskrit: "Guru", benefic: true,
    exalt: { sign: 3, deg: 5 }, debil: { sign: 9, deg: 5 },
    moolatrikona: { sign: 8, from: 0, to: 10 }, own: [8, 11],
    color: "#eab308", years: 16, sweId: 5,
  },
  {
    id: 5, name: "Venus", short: "Ve", hi: "शुक्र", sanskrit: "Shukra", benefic: true,
    exalt: { sign: 11, deg: 27 }, debil: { sign: 5, deg: 27 },
    moolatrikona: { sign: 6, from: 0, to: 15 }, own: [1, 6],
    color: "#ec4899", years: 20, sweId: 3,
  },
  {
    id: 6, name: "Saturn", short: "Sa", hi: "शनि", sanskrit: "Shani", benefic: false,
    exalt: { sign: 6, deg: 20 }, debil: { sign: 0, deg: 20 },
    moolatrikona: { sign: 10, from: 0, to: 20 }, own: [9, 10],
    color: "#3b82f6", years: 19, sweId: 6,
  },
  {
    id: 7, name: "Rahu", short: "Ra", hi: "राहु", sanskrit: "Rahu", benefic: false,
    exalt: { sign: 1, deg: 20 }, debil: { sign: 7, deg: 20 },
    moolatrikona: { sign: 2, from: 0, to: 30 }, own: [10],
    color: "#8b5cf6", years: 18, sweId: 10,
  },
  {
    id: 8, name: "Ketu", short: "Ke", hi: "केतु", sanskrit: "Ketu", benefic: false,
    exalt: { sign: 7, deg: 20 }, debil: { sign: 1, deg: 20 },
    moolatrikona: { sign: 8, from: 0, to: 30 }, own: [7],
    color: "#a16207", years: 7, sweId: 11,
  },
];

export const planetById = (id: number) => PLANETS[id];

export interface RashiInfo {
  name: string;
  hi: string;
  lord: PlanetId;
  element: "Fire" | "Earth" | "Air" | "Water";
  mobility: "Movable" | "Fixed" | "Dual";
  gender: "Male" | "Female" | "Neuter";
}

export const RASHIS: RashiInfo[] = [
  { name: "Aries", hi: "मेष", lord: MARS, element: "Fire", mobility: "Movable", gender: "Male" },
  { name: "Taurus", hi: "वृषभ", lord: VENUS, element: "Earth", mobility: "Fixed", gender: "Female" },
  { name: "Gemini", hi: "मिथुन", lord: MERCURY, element: "Air", mobility: "Dual", gender: "Neuter" },
  { name: "Cancer", hi: "कर्क", lord: MOON, element: "Water", mobility: "Movable", gender: "Female" },
  { name: "Leo", hi: "सिंह", lord: SUN, element: "Fire", mobility: "Fixed", gender: "Male" },
  { name: "Virgo", hi: "कन्या", lord: MERCURY, element: "Earth", mobility: "Dual", gender: "Female" },
  { name: "Libra", hi: "तुला", lord: VENUS, element: "Air", mobility: "Movable", gender: "Male" },
  { name: "Scorpio", hi: "वृश्चिक", lord: MARS, element: "Water", mobility: "Fixed", gender: "Female" },
  { name: "Sagittarius", hi: "धनु", lord: JUPITER, element: "Fire", mobility: "Dual", gender: "Male" },
  { name: "Capricorn", hi: "मकर", lord: SATURN, element: "Earth", mobility: "Movable", gender: "Female" },
  { name: "Aquarius", hi: "कुंभ", lord: SATURN, element: "Air", mobility: "Fixed", gender: "Neuter" },
  { name: "Pisces", hi: "मीन", lord: JUPITER, element: "Water", mobility: "Dual", gender: "Female" },
];

export const NAKSHATRAS = [
  { name: "Ashwini", hi: "अश्विनी", lord: KETU, deity: "Ashwini Kumaras", symbol: "Horse's head", gana: "Deva", yoni: "Horse", nadi: "Adi" },
  { name: "Bharani", hi: "भरणी", lord: VENUS, deity: "Yama", symbol: "Yoni", gana: "Manushya", yoni: "Elephant", nadi: "Madhya" },
  { name: "Krittika", hi: "कृत्तिका", lord: SUN, deity: "Agni", symbol: "Razor / flame", gana: "Rakshasa", yoni: "Goat", nadi: "Antya" },
  { name: "Rohini", hi: "रोहिणी", lord: MOON, deity: "Brahma", symbol: "Ox cart", gana: "Manushya", yoni: "Serpent", nadi: "Antya" },
  { name: "Mrigashira", hi: "मृगशिरा", lord: MARS, deity: "Soma", symbol: "Deer's head", gana: "Deva", yoni: "Serpent", nadi: "Madhya" },
  { name: "Ardra", hi: "आर्द्रा", lord: RAHU, deity: "Rudra", symbol: "Teardrop", gana: "Manushya", yoni: "Dog", nadi: "Adi" },
  { name: "Punarvasu", hi: "पुनर्वसु", lord: JUPITER, deity: "Aditi", symbol: "Bow and quiver", gana: "Deva", yoni: "Cat", nadi: "Adi" },
  { name: "Pushya", hi: "पुष्य", lord: SATURN, deity: "Brihaspati", symbol: "Cow's udder", gana: "Deva", yoni: "Goat", nadi: "Madhya" },
  { name: "Ashlesha", hi: "आश्लेषा", lord: MERCURY, deity: "Nagas", symbol: "Coiled serpent", gana: "Rakshasa", yoni: "Cat", nadi: "Antya" },
  { name: "Magha", hi: "मघा", lord: KETU, deity: "Pitris", symbol: "Throne", gana: "Rakshasa", yoni: "Rat", nadi: "Antya" },
  { name: "Purva Phalguni", hi: "पूर्व फाल्गुनी", lord: VENUS, deity: "Bhaga", symbol: "Hammock", gana: "Manushya", yoni: "Rat", nadi: "Madhya" },
  { name: "Uttara Phalguni", hi: "उत्तर फाल्गुनी", lord: SUN, deity: "Aryaman", symbol: "Bed", gana: "Manushya", yoni: "Cow", nadi: "Adi" },
  { name: "Hasta", hi: "हस्त", lord: MOON, deity: "Savitar", symbol: "Hand", gana: "Deva", yoni: "Buffalo", nadi: "Adi" },
  { name: "Chitra", hi: "चित्रा", lord: MARS, deity: "Vishwakarma", symbol: "Bright jewel", gana: "Rakshasa", yoni: "Tiger", nadi: "Madhya" },
  { name: "Swati", hi: "स्वाति", lord: RAHU, deity: "Vayu", symbol: "Shoot of grass", gana: "Deva", yoni: "Buffalo", nadi: "Antya" },
  { name: "Vishakha", hi: "विशाखा", lord: JUPITER, deity: "Indra-Agni", symbol: "Triumphal arch", gana: "Rakshasa", yoni: "Tiger", nadi: "Antya" },
  { name: "Anuradha", hi: "अनुराधा", lord: SATURN, deity: "Mitra", symbol: "Lotus", gana: "Deva", yoni: "Deer", nadi: "Madhya" },
  { name: "Jyeshtha", hi: "ज्येष्ठा", lord: MERCURY, deity: "Indra", symbol: "Umbrella", gana: "Rakshasa", yoni: "Deer", nadi: "Adi" },
  { name: "Mula", hi: "मूल", lord: KETU, deity: "Nirriti", symbol: "Tied roots", gana: "Rakshasa", yoni: "Dog", nadi: "Adi" },
  { name: "Purva Ashadha", hi: "पूर्व आषाढ़ा", lord: VENUS, deity: "Apas", symbol: "Winnowing fan", gana: "Manushya", yoni: "Monkey", nadi: "Madhya" },
  { name: "Uttara Ashadha", hi: "उत्तर आषाढ़ा", lord: SUN, deity: "Vishvedevas", symbol: "Elephant tusk", gana: "Manushya", yoni: "Mongoose", nadi: "Antya" },
  { name: "Shravana", hi: "श्रवण", lord: MOON, deity: "Vishnu", symbol: "Ear / three lines", gana: "Deva", yoni: "Monkey", nadi: "Antya" },
  { name: "Dhanishta", hi: "धनिष्ठा", lord: MARS, deity: "Vasus", symbol: "Drum", gana: "Rakshasa", yoni: "Lion", nadi: "Madhya" },
  { name: "Shatabhisha", hi: "शतभिषा", lord: RAHU, deity: "Varuna", symbol: "Empty circle", gana: "Rakshasa", yoni: "Horse", nadi: "Adi" },
  { name: "Purva Bhadrapada", hi: "पूर्व भाद्रपद", lord: JUPITER, deity: "Aja Ekapada", symbol: "Sword", gana: "Manushya", yoni: "Lion", nadi: "Adi" },
  { name: "Uttara Bhadrapada", hi: "उत्तर भाद्रपद", lord: SATURN, deity: "Ahirbudhnya", symbol: "Twins / back legs", gana: "Manushya", yoni: "Cow", nadi: "Madhya" },
  { name: "Revati", hi: "रेवती", lord: MERCURY, deity: "Pushan", symbol: "Fish", gana: "Deva", yoni: "Elephant", nadi: "Antya" },
] as const;

export const NAKSHATRA_SPAN = 360 / 27; // 13°20'
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3°20'

export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
];

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha",
  "Shukla", "Brahma", "Indra", "Vaidhriti",
];

export const KARANA_NAMES = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kimstughna",
];

export const WEEKDAYS = [
  { name: "Sunday", hi: "रविवार", lord: SUN, short: "Sun" },
  { name: "Monday", hi: "सोमवार", lord: MOON, short: "Mon" },
  { name: "Tuesday", hi: "मंगलवार", lord: MARS, short: "Tue" },
  { name: "Wednesday", hi: "बुधवार", lord: MERCURY, short: "Wed" },
  { name: "Thursday", hi: "गुरुवार", lord: JUPITER, short: "Thu" },
  { name: "Friday", hi: "शुक्रवार", lord: VENUS, short: "Fri" },
  { name: "Saturday", hi: "शनिवार", lord: SATURN, short: "Sat" },
];

export const DASHA_ORDER: PlanetId[] = [KETU, VENUS, SUN, MOON, MARS, RAHU, JUPITER, SATURN, MERCURY];

export const VARGA_LIST = [
  { key: "D1", divisions: 1, name: "Rashi", hi: "राशि" },
  { key: "D2", divisions: 2, name: "Hora", hi: "होरा" },
  { key: "D3", divisions: 3, name: "Drekkana", hi: "द्रेक्काण" },
  { key: "D4", divisions: 4, name: "Chaturthamsha", hi: "चतुर्थांश" },
  { key: "D7", divisions: 7, name: "Saptamsha", hi: "सप्तांश" },
  { key: "D9", divisions: 9, name: "Navamsa", hi: "नवांश" },
  { key: "D10", divisions: 10, name: "Dashamsha", hi: "दशांश" },
  { key: "D12", divisions: 12, name: "Dwadashamsha", hi: "द्वादशांश" },
  { key: "D16", divisions: 16, name: "Shodashamsha", hi: "षोडशांश" },
  { key: "D20", divisions: 20, name: "Vimshamsha", hi: "विंशांश" },
  { key: "D24", divisions: 24, name: "Chaturvimshamsha", hi: "चतुर्विंशांश" },
  { key: "D27", divisions: 27, name: "Bhamsha", hi: "भांश" },
  { key: "D30", divisions: 30, name: "Trimshamsha", hi: "त्रिंशांश" },
  { key: "D40", divisions: 40, name: "Khavedamsha", hi: "खवेदांश" },
  { key: "D45", divisions: 45, name: "Akshavedamsha", hi: "अक्षवेदांश" },
  { key: "D60", divisions: 60, name: "Shashtiamsha", hi: "षष्टियांश" },
] as const;

export type VargaKey = (typeof VARGA_LIST)[number]["key"];

/** Natural friendship (BPHS). Index = planet id, value = { friends, neutral, enemies } */
export const FRIENDSHIP: Record<number, { friends: number[]; neutral: number[]; enemies: number[] }> = {
  [SUN]: { friends: [MOON, MARS, JUPITER], neutral: [MERCURY], enemies: [VENUS, SATURN] },
  [MOON]: { friends: [SUN, MERCURY], neutral: [MARS, JUPITER, VENUS, SATURN], enemies: [] },
  [MARS]: { friends: [SUN, MOON, JUPITER], neutral: [VENUS, SATURN], enemies: [MERCURY] },
  [MERCURY]: { friends: [SUN, VENUS], neutral: [MARS, JUPITER, SATURN], enemies: [MOON] },
  [JUPITER]: { friends: [SUN, MOON, MARS], neutral: [SATURN], enemies: [MERCURY, VENUS] },
  [VENUS]: { friends: [MERCURY, SATURN], neutral: [MARS, JUPITER], enemies: [SUN, MOON] },
  [SATURN]: { friends: [MERCURY, VENUS], neutral: [JUPITER], enemies: [SUN, MOON, MARS] },
  [RAHU]: { friends: [VENUS, SATURN, MERCURY], neutral: [JUPITER], enemies: [SUN, MOON, MARS] },
  [KETU]: { friends: [MARS, VENUS, SATURN], neutral: [JUPITER, MERCURY], enemies: [SUN, MOON] },
};

/** Houses of the zodiac owned by each planet (for lord-ship based reading) */
export const SIGN_LORD: PlanetId[] = RASHIS.map((r) => r.lord);

export const KENDRA = [1, 4, 7, 10];
export const TRIKONA = [1, 5, 9];
export const DUSTHANA = [6, 8, 12];
export const UPACHAYA = [3, 6, 10, 11];

export const EXALTATION_SIGN: number[] = [0, 1, 9, 5, 3, 11, 6, 1, 7];
export const DEBILITATION_SIGN: number[] = [6, 8, 3, 11, 9, 5, 0, 7, 1];

export const KARAKAS = {
  AK: "Atmakaraka",
  AMK: "Amatyakaraka",
  BK: "Bhratrikaraka",
  MK: "Matrikaraka",
  PK: "Putrakaraka",
  GK: "Gnatikaraka",
  DK: "Darakaraka",
};

export const GANA_ORDER = ["Deva", "Manushya", "Rakshasa"] as const;
export const NADI_ORDER = ["Adi", "Madhya", "Antya"] as const;
export const VARNA_ORDER = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"] as const;

/** Varna by Moon sign (0=Aries) */
export const VARNA_BY_SIGN = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];

/** Vashya category by Moon sign */
export const VASHYA_BY_SIGN = [
  "Chatushpada", "Chatushpada", "Nara", "Jalachara", "Vanachara", "Nara",
  "Nara", "Keeta", "Nara", "Jalachara", "Nara", "Jalachara",
];

export const YONI_ENEMIES: Record<string, string> = {
  Horse: "Buffalo", Buffalo: "Horse",
  Elephant: "Lion", Lion: "Elephant",
  Goat: "Monkey", Monkey: "Goat",
  Serpent: "Mongoose", Mongoose: "Serpent",
  Dog: "Deer", Deer: "Dog",
  Cat: "Rat", Rat: "Cat",
  Tiger: "Cow", Cow: "Tiger",
};

export const BENEFICS = [JUPITER, VENUS, MOON, MERCURY];
export const MALEFICS = [SUN, MARS, SATURN, RAHU, KETU];
