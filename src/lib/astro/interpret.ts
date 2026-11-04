import {
  PLANETS,
  RASHIS,
  SIGN_LORD,
  type PlanetId,
} from "./constants";
import type { Chart } from "./chart";
import type { DashaChainItem } from "./dasha";
import type { YogaResult } from "./yogas";

const ORDINAL = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

export const HOUSE_THEMES = [
  "body, personality and the direction of life",
  "money, speech, family and the resources you rely on",
  "courage, siblings, communication and short journeys",
  "home, mother, property and inner peace",
  "children, creativity, intelligence and past merit",
  "health, service, competition and debts",
  "marriage, partnership and public dealings",
  "longevity, transformation, inheritance and the hidden",
  "fortune, dharma, teachers and long journeys",
  "career, status, authority and public achievement",
  "income, gains, friends and aspirations",
  "expenses, foreign lands, solitude and liberation",
];

export const PLANET_KEYWORDS: Record<number, string> = {
  0: "authority, confidence, the father and the sense of self",
  1: "the mind, emotions, the mother and receptivity",
  2: "energy, courage, competition and the will to act",
  3: "intellect, speech, commerce and analysis",
  4: "wisdom, growth, ethics and good fortune",
  5: "love, beauty, comfort and artistic taste",
  6: "discipline, endurance, responsibility and delay",
  7: "ambition, obsession, foreignness and the unconventional",
  8: "detachment, spirituality, research and sudden insight",
};

const REMEDIES: Record<number, { gem: string; mantra: string; charity: string; day: string; deity: string }> = {
  0: { gem: "Ruby (Manik)", mantra: "Om Suryaya Namaha", charity: "Wheat, jaggery and copper on Sundays", day: "Sunday", deity: "Surya / Aditya" },
  1: { gem: "Pearl (Moti)", mantra: "Om Chandraya Namaha", charity: "Rice, milk and silver on Mondays", day: "Monday", deity: "Shiva / Chandra" },
  2: { gem: "Red Coral (Moonga)", mantra: "Om Mangalaya Namaha", charity: "Red lentils and copper on Tuesdays", day: "Tuesday", deity: "Hanuman / Kartikeya" },
  3: { gem: "Emerald (Panna)", mantra: "Om Budhaya Namaha", charity: "Green gram and books on Wednesdays", day: "Wednesday", deity: "Vishnu / Budha" },
  4: { gem: "Yellow Sapphire (Pukhraj)", mantra: "Om Gurave Namaha", charity: "Bengal gram, turmeric and yellow cloth on Thursdays", day: "Thursday", deity: "Brihaspati / Dakshinamurti" },
  5: { gem: "Diamond / White Sapphire", mantra: "Om Shukraya Namaha", charity: "White flowers, curd and silk on Fridays", day: "Friday", deity: "Lakshmi / Shukra" },
  6: { gem: "Blue Sapphire (Neelam)", mantra: "Om Shanaye Namaha", charity: "Black sesame, iron and mustard oil on Saturdays", day: "Saturday", deity: "Shani / Hanuman" },
  7: { gem: "Hessonite (Gomed)", mantra: "Om Rahave Namaha", charity: "Black gram and blankets on Saturdays", day: "Saturday", deity: "Durga / Bhairava" },
  8: { gem: "Cat's Eye (Lehsunia)", mantra: "Om Ketave Namaha", charity: "Two-coloured cloth and sesame on Tuesdays", day: "Tuesday", deity: "Ganesha / Ganapati" },
};

export interface Interpretation {
  lagna: string;
  houses: { house: number; text: string }[];
  planets: { planet: PlanetId; text: string }[];
  nakshatra: string;
  currentDasha: string;
  yogas: string[];
  remedies: { planet: PlanetId; gem: string; mantra: string; charity: string; day: string; deity: string; reason: string }[];
  strengths: string[];
}

export function interpret(chart: Chart, chain: DashaChainItem[], yogas: YogaResult[]): Interpretation {
  const g = (p: PlanetId) => chart.grahas.find((x) => x.planet === p)!;
  const lagna = chart.lagna;
  const lagnaLord = g(lagna.lord);
  const lagnaText =
    `Your lagna is ${RASHIS[lagna.sign].name} (${RASHIS[lagna.sign].hi}) rising at ${lagna.degInSign.toFixed(2)}°, ` +
    `in ${lagna.nakshatra} pada ${lagna.pada}. The chart is ruled by ${PLANETS[lagna.lord].name}, placed in the ` +
    `${ORDINAL[lagnaLord.house]} house in ${RASHIS[lagnaLord.sign].name}. ` +
    `${PLANETS[lagna.lord].name === "Sun" || PLANETS[lagna.lord].name === "Mars" ? "This gives a direct, visible and self-driven temperament" : PLANETS[lagna.lord].name === "Moon" ? "This gives a receptive, feeling-led and adaptable temperament" : PLANETS[lagna.lord].name === "Saturn" ? "This gives a patient, serious and long-horizon temperament" : "This gives a thoughtful, sociable and opportunity-seeking temperament"}. ` +
    `The body and the life-direction are coloured by ${PLANET_KEYWORDS[lagna.lord]}.`;

  const houses = chart.houseLords.map((hl) => {
    const lord = g(hl.lord);
    const occupants = hl.occupants.map((p) => PLANETS[p].name);
    const occupantText = occupants.length
      ? ` It holds ${occupants.join(" and ")}, so ${PLANET_KEYWORDS[hl.occupants[0]].split(",")[0]} is expressed through this house.`
      : " No planet occupies it, so the matters of this house are read through its lord.";
    return {
      house: hl.house,
      text:
        `The ${ORDINAL[hl.house]} house (${HOUSE_THEMES[hl.house - 1]}) falls in ${RASHIS[hl.sign].name}, ` +
        `ruled by ${PLANETS[hl.lord].name} sitting in the ${ORDINAL[lord.house]} house (${lord.dignity.toLowerCase()}). ` +
        `${lord.house === hl.house ? "The lord is in its own house, which strengthens these matters. " : ""}` +
        `${[1, 5, 9].includes(lord.house) ? "Because the lord sits in a trine, this house generally delivers well. " : ""}` +
        `${[6, 8, 12].includes(lord.house) ? "The lord sits in a difficult house, so results come after effort or in an indirect way. " : ""}` +
        occupantText,
    };
  });

  const planets = chart.grahas.map((p) => {
    const dignityNote =
      p.dignity === "Exalted" ? "It is exalted, so it acts at its best here." :
      p.dignity === "Debilitated" ? "It is debilitated, so its outer expression is weak until it matures." :
      p.dignity === "Own Sign" || p.dignity === "Moolatrikona" ? "It is in its own sign, which gives it stability and authority." :
      p.dignity === "Friend" ? "It is in a friendly sign and works comfortably." :
      p.dignity === "Enemy" ? "It is in an enemy sign, so its results need conscious effort." : "It is in a neutral sign and behaves according to its lord.";
    return {
      planet: p.planet,
      text:
        `${PLANETS[p.planet].name} is at ${p.lon.toFixed(2)}° (${RASHIS[p.sign].name} ${p.degInSign.toFixed(2)}°), ` +
        `in the ${ORDINAL[p.house]} house and ${p.nakshatra} pada ${p.pada}${p.retrograde ? ", retrograde" : ""}${p.combust ? ", combust" : ""}. ` +
        `${PLANETS[p.planet].name} brings ${PLANET_KEYWORDS[p.planet]} into ${HOUSE_THEMES[p.house - 1]}. ${dignityNote} ` +
        `Nakshatra lord ${PLANETS[p.nakshatraLord].name} colours how it delivers.`,
    };
  });

  const moon = g(1);
  const nakshatra =
    `The Moon is in ${RASHIS[moon.sign].name}, ${moon.nakshatra} pada ${moon.pada}, lorded by ${PLANETS[moon.nakshatraLord].name}. ` +
    `This is the deepest layer of the mind: ${moon.nakshatra} natives are shaped by its deity and symbol, and the Vimshottari dasha begins from this point. ` +
    `The Moon is ${moon.dignity.toLowerCase()} here, so emotional confidence ${["Exalted", "Own Sign", "Moolatrikona", "Friend"].includes(moon.dignity) ? "is naturally available and recovers quickly" : "needs to be built deliberately, especially in the first dasha"}.`;

  const dashaLord = chain[0]?.lord ?? moon.planet;
  const currentDasha =
    `You are running ${chain.map((c) => `${PLANETS[c.lord].name} (${["Maha", "Antar", "Pratyantar", "Sookshma", "Prana"][c.level - 1] ?? "Deha"})`).join(" → ")}. ` +
    `${PLANETS[dashaLord].name} as the maha-dasha lord sits in the ${ORDINAL[g(dashaLord).house]} house in ${RASHIS[g(dashaLord).sign].name}. ` +
    `The themes of that house - ${HOUSE_THEMES[g(dashaLord).house - 1]} - are the main stage of this period, filtered through ${PLANET_KEYWORDS[dashaLord]}.`;

  const remedies = chart.grahas
    .filter((p) => p.planet !== 7 && p.planet !== 8)
    .filter((p) => ["Debilitated", "Enemy"].includes(p.dignity) || p.combust)
    .map((p) => ({
      planet: p.planet,
      ...REMEDIES[p.planet],
      reason: `${PLANETS[p.planet].name} is ${p.combust ? "combust" : p.dignity.toLowerCase()} in the ${ORDINAL[p.house]} house.`,
    }));

  const strongest = [...chart.grahas].sort((a, b) => dignityRank(a.dignity) - dignityRank(b.dignity))[0];
  const strengths = [
    `The strongest planet by dignity is ${PLANETS[strongest.planet].name} (${strongest.dignity.toLowerCase()}) in the ${ORDINAL[strongest.house]} house.`,
  ];

  return {
    lagna: lagnaText,
    houses,
    planets,
    nakshatra,
    currentDasha,
    yogas: yogas.map((y) => `${y.name}: ${y.formedBy}`),
    remedies,
    strengths,
  };
}

function dignityRank(d: string) {
  return ["Exalted", "Moolatrikona", "Own Sign", "Friend", "Neutral", "Enemy", "Debilitated"].indexOf(d);
}

export { SIGN_LORD, ORDINAL };
