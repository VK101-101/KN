import {
  KENDRA,
  PLANETS,
  RAHU,
  KETU,
  SUN,
  MOON,
  MARS,
  MERCURY,
  JUPITER,
  VENUS,
  SATURN,
  TRIKONA,
  type PlanetId,
} from "./constants";
import { aspectsOf, grahaOf, type Chart } from "./chart";
import { norm360 } from "./ephemeris";

export type YogaPolarity = "positive" | "negative" | "mixed";

export interface YogaResult {
  key: string;
  name: string;
  category: string;
  polarity: YogaPolarity;
  planets: PlanetId[];
  formedBy: string;
  description: string;
}

const nameOf = (p: PlanetId) => PLANETS[p].name;

export function detectYogas(chart: Chart): YogaResult[] {
  const out: YogaResult[] = [];
  const g = (p: PlanetId) => grahaOf(chart, p);
  const house = (p: PlanetId) => g(p).house;
  const sign = (p: PlanetId) => g(p).sign;
  const lordOf = (h: number) => chart.houseLords[h - 1].lord;
  const sameSign = (a: PlanetId, b: PlanetId) => sign(a) === sign(b);
  const aspectsSign = (p: PlanetId, s: number) =>
    aspectsOf(p).some((a) => (sign(p) + a - 1) % 12 === s);
  const mutualAspect = (a: PlanetId, b: PlanetId) => sameSign(a, b) || (aspectsSign(a, sign(b)) && aspectsSign(b, sign(a)));
  const distFromMoon = (p: PlanetId) => ((sign(p) - sign(MOON) + 12) % 12) + 1;

  /* ---------------- Panch Mahapurusha ---------------- */
  const mahapurusha: Record<number, [string, string]> = {
    [MARS]: ["Ruchaka", "courage, command and physical vitality"],
    [MERCURY]: ["Bhadra", "intelligence, eloquence and business skill"],
    [JUPITER]: ["Hamsa", "wisdom, ethics and respect"],
    [VENUS]: ["Malavya", "beauty, luxury and artistic refinement"],
    [SATURN]: ["Sasa", "discipline, authority and mass following"],
  };
  for (const p of [MARS, MERCURY, JUPITER, VENUS, SATURN] as PlanetId[]) {
    const gp = g(p);
    const strong = ["Exalted", "Own Sign", "Moolatrikona"].includes(gp.dignity);
    if (strong && KENDRA.includes(gp.house)) {
      const [nm, effect] = mahapurusha[p];
      out.push({
        key: `mahapurusha-${nm.toLowerCase()}`,
        name: `${nm} Yoga`,
        category: "Panch Mahapurusha",
        polarity: "positive",
        planets: [p],
        formedBy: `${nameOf(p)} is ${gp.dignity.toLowerCase()} in the ${gp.house}th house (a kendra).`,
        description: `One of the five great-person yogas. It gives ${effect}.`,
      });
    }
  }

  /* ---------------- Gaja Kesari ---------------- */
  const jupFromMoon = distFromMoon(JUPITER);
  if ([1, 4, 7, 10].includes(jupFromMoon)) {
    out.push({
      key: "gaja-kesari",
      name: "Gaja Kesari Yoga",
      category: "Chandra",
      polarity: "positive",
      planets: [JUPITER, MOON],
      formedBy: `Jupiter is in the ${jupFromMoon}th sign from the Moon (a kendra from Chandra).`,
      description:
        "Gives a steady mind, reputation, protection in adversity and the ability to rise above circumstances - the classic 'elephant and lion' yoga of lasting success.",
    });
  }

  /* ---------------- Budha-Aditya ---------------- */
  const sunMercury = sameSign(SUN, MERCURY);
  if (sunMercury && house(SUN) !== 12) {
    const combust = g(MERCURY).combust;
    out.push({
      key: "budha-aditya",
      name: "Budha-Aditya Yoga",
      category: "Raja",
      polarity: combust ? "mixed" : "positive",
      planets: [SUN, MERCURY],
      formedBy: `Sun and Mercury are together in ${signNameSafe(chart, sign(SUN))}.`,
      description:
        "Sharp intelligence, administrative ability and good name through learning. When Mercury is deeply combust the results come with self-doubt, so a strong Mercury dasha or sub-period is needed to unlock it.",
    });
  }

  /* ---------------- Raja yogas: kendra + trikona lords ---------------- */
  let rajaCount = 0;
  for (const kh of KENDRA) {
    for (const th of TRIKONA) {
      const a = lordOf(kh);
      const b = lordOf(th);
      if (a === b) continue;
      if (mutualAspect(a, b)) {
        rajaCount++;
        if (rajaCount <= 4) {
          out.push({
            key: `raja-${kh}-${th}`,
            name: "Raja Yoga",
            category: "Raja",
            polarity: "positive",
            planets: [a, b],
            formedBy: `Lord of the ${kh}th (${nameOf(a)}) and lord of the ${th}th (${nameOf(b)}) ${
              sameSign(a, b) ? "are conjunct" : "mutually aspect each other"
            }.`,
            description:
              "A kendra-trikona combination. It gives position, authority and support from powerful people, and usually fructifies in the dashas of the two planets involved.",
          });
        }
      }
      // Parivartana between kendra and trikona lord
      if (sameSign(a, b) === false && sign(a) === chart.houseLords[th - 1].sign && sign(b) === chart.houseLords[kh - 1].sign) {
        out.push({
          key: `parivartana-${kh}-${th}`,
          name: "Maha Parivartana Yoga",
          category: "Raja",
          polarity: "positive",
          planets: [a, b],
          formedBy: `The lords of the ${kh}th and ${th}th houses exchange signs.`,
          description:
            "A powerful exchange between an angular and a trinal house. It links career and fortune, and gives a life with visible status and long-term gains.",
        });
      }
    }
  }

  /* ---------------- Dhana yogas ---------------- */
  const dhanaHouses = [2, 5, 9, 11];
  for (let i = 0; i < dhanaHouses.length; i++) {
    for (let j = i + 1; j < dhanaHouses.length; j++) {
      const h1 = dhanaHouses[i];
      const h2 = dhanaHouses[j];
      const a = lordOf(h1);
      const b = lordOf(h2);
      if (a !== b && mutualAspect(a, b)) {
        out.push({
          key: `dhana-${h1}-${h2}`,
          name: "Dhana Yoga",
          category: "Dhana",
          polarity: "positive",
          planets: [a, b],
          formedBy: `Lords of the ${h1}th and ${h2}th houses are ${sameSign(a, b) ? "conjunct" : "in mutual aspect"}.`,
          description:
            "A wealth combination. Money comes through the significations of these houses and increases through the dashas of the planets involved.",
        });
        break;
      }
    }
  }
  if (house(lordOf(2)) === 11 && house(lordOf(11)) === 2) {
    out.push({
      key: "dhana-2-11-exchange",
      name: "Dhana Yoga (2-11 exchange)",
      category: "Dhana",
      polarity: "positive",
      planets: [lordOf(2), lordOf(11)],
      formedBy: "The 2nd and 11th lords occupy each other's signs.",
      description: "Earnings and savings reinforce each other; a strong indicator of accumulating wealth.",
    });
  }

  /* ---------------- Vipreet Raja Yogas ---------------- */
  const vipreet: Record<number, [string, string]> = {
    6: ["Harsha", "health, litigation and enemies"],
    8: ["Sarala", "longevity, research and sudden gains"],
    12: ["Vimala", "expenses, foreign lands and liberation"],
  };
  for (const h of [6, 8, 12]) {
    const l = lordOf(h);
    const dh = house(l);
    if ([6, 8, 12].includes(dh)) {
      const [nm, scope] = vipreet[h];
      out.push({
        key: `vipreet-${nm.toLowerCase()}`,
        name: `${nm} Vipreet Raja Yoga`,
        category: "Raja",
        polarity: "positive",
        planets: [l],
        formedBy: `Lord of the ${h}th house (${nameOf(l)}) is placed in the ${dh}th house.`,
        description: `A reversal yoga: early difficulties in ${scope} turn into advantage. It often gives success after obstacles or in fields others avoid.`,
      });
    }
  }

  /* ---------------- Chandra yogas ---------------- */
  const secondFromMoon = (sign(MOON) + 1) % 12;
  const twelfthFromMoon = (sign(MOON) + 11) % 12;
  const in2 = chart.grahas.filter((p) => p.planet !== SUN && p.planet !== MOON && p.sign === secondFromMoon);
  const in12 = chart.grahas.filter((p) => p.planet !== SUN && p.planet !== MOON && p.sign === twelfthFromMoon);
  if (in2.length && in12.length) {
    out.push({
      key: "durudhara",
      name: "Durudhara Yoga",
      category: "Chandra",
      polarity: "positive",
      planets: [...in2, ...in12].map((p) => p.planet),
      formedBy: "Planets occupy both the 2nd and 12th signs from the Moon.",
      description: "Gives resources, generosity and support from others; the native is seldom without help.",
    });
  } else if (in2.length) {
    out.push({
      key: "sunapha",
      name: "Sunapha Yoga",
      category: "Chandra",
      polarity: "positive",
      planets: in2.map((p) => p.planet),
      formedBy: "Planets occupy the 2nd sign from the Moon.",
      description: "Self-earned wealth, intelligence and a good reputation.",
    });
  } else if (in12.length) {
    out.push({
      key: "anapha",
      name: "Anapha Yoga",
      category: "Chandra",
      polarity: "positive",
      planets: in12.map((p) => p.planet),
      formedBy: "Planets occupy the 12th sign from the Moon.",
      description: "Good health, character and enjoyment, with a tendency to renounce at the end of life.",
    });
  } else if (chart.grahas.every((p) => p.planet === MOON || p.planet === SUN || p.sign !== sign(MOON))) {
    const kendraFromMoon = chart.grahas.some(
      (p) => p.planet !== MOON && p.planet !== SUN && [1, 4, 7, 10].includes(((p.sign - sign(MOON)) + 12) % 12 + 1),
    );
    out.push({
      key: "kemadruma",
      name: "Kemadruma Yoga",
      category: "Chandra",
      polarity: kendraFromMoon ? "mixed" : "negative",
      planets: [MOON],
      formedBy: "No planet (other than the Sun) occupies the 2nd, 12th or the Moon's own sign.",
      description: kendraFromMoon
        ? "A Kemadruma is formed but cancelled by planets in kendra from the Moon - early struggle gives way to stability."
        : "Classically a solitary Moon: phases of loneliness, fluctuating confidence and dependence on one's own effort. It is not a curse and is greatly modified by the Moon's dispositor.",
    });
  }

  const adhi = [MERCURY, JUPITER, VENUS].filter((p) => [6, 7, 8].includes(distFromMoon(p)));
  if (adhi.length >= 2) {
    out.push({
      key: "adhi",
      name: "Adhi Yoga",
      category: "Raja",
      polarity: "positive",
      planets: adhi,
      formedBy: "Two or more natural benefics occupy the 6th, 7th or 8th sign from the Moon.",
      description: "Leadership, comfort and the confidence of superiors; a yoga of prosperous, stable living.",
    });
  }

  /* ---------------- Amala ---------------- */
  const tenthFromLagna = (chart.lagna.sign + 9) % 12;
  const amalaPlanets = chart.grahas.filter((p) => [JUPITER, VENUS, MERCURY, MOON].includes(p.planet) && (p.sign === tenthFromLagna || p.sign === (sign(MOON) + 9) % 12));
  if (amalaPlanets.length) {
    out.push({
      key: "amala",
      name: "Amala Yoga",
      category: "Raja",
      polarity: "positive",
      planets: amalaPlanets.map((p) => p.planet),
      formedBy: "A natural benefic occupies the 10th from the lagna or the Moon.",
      description: "A spotless reputation, ethical conduct and lasting fame in one's work.",
    });
  }

  /* ---------------- Saraswati ---------------- */
  const saraswatiPlanets = [JUPITER, VENUS, MERCURY];
  const saraswatiHouses = [1, 2, 4, 5, 7, 9, 10];
  if (saraswatiPlanets.every((p) => saraswatiHouses.includes(house(p))) && ["Own Sign", "Exalted", "Moolatrikona", "Friend", "Great Friend"].includes(g(JUPITER).dignity)) {
    out.push({
      key: "saraswati",
      name: "Saraswati Yoga",
      category: "Raja",
      polarity: "positive",
      planets: saraswatiPlanets,
      formedBy: "Jupiter, Venus and Mercury occupy kendras, trikonas or the 2nd, with Jupiter strongly placed.",
      description: "Learning, eloquence, writing and creative talent; the classic yoga of scholars and artists.",
    });
  }

  /* ---------------- Kala Sarpa ---------------- */
  const rahuLon = g(RAHU).lon;
  const others = [SUN, MOON, MARS, MERCURY, JUPITER, VENUS, SATURN].map((p) => g(p).lon);
  const between = (lon: number, a: number, b: number) => norm360(lon - a) < norm360(b - a);
  if (others.every((l) => between(l, rahuLon, rahuLon + 180))) {
    out.push({
      key: "kala-sarpa",
      name: "Kala Sarpa Yoga",
      category: "Arishta",
      polarity: "negative",
      planets: [RAHU, KETU],
      formedBy: "All seven planets are hemmed between Rahu and Ketu.",
      description:
        "A life with sharp ups and downs, delays that eventually turn into unusual achievement, and a strong pull toward the mystical. Its severity depends entirely on the strength of the lagna lord and the Moon.",
    });
  } else if (others.every((l) => between(l, rahuLon + 180, rahuLon + 360))) {
    out.push({
      key: "kala-sarpa-reverse",
      name: "Kala Sarpa Yoga (reverse)",
      category: "Arishta",
      polarity: "negative",
      planets: [RAHU, KETU],
      formedBy: "All seven planets are hemmed between Ketu and Rahu.",
      description: "The same pattern in the opposite direction - intensity, sudden changes and eventual detachment.",
    });
  }

  /* ---------------- Mangal dosha ---------------- */
  const mangalHouses = [1, 4, 7, 8, 12];
  const marsHouse = house(MARS);
  const marsFromMoon = distFromMoon(MARS);
  const marsFromVenus = ((sign(MARS) - sign(VENUS) + 12) % 12) + 1;
  if (mangalHouses.includes(marsHouse) || mangalHouses.includes(marsFromMoon) || mangalHouses.includes(marsFromVenus)) {
    const cancelled =
      ["Exalted", "Own Sign", "Moolatrikona"].includes(g(MARS).dignity) ||
      aspectsSign(JUPITER, sign(MARS)) ||
      [0, 7, 9].includes(sign(MARS));
    out.push({
      key: "mangal-dosha",
      name: "Mangal (Kuja) Dosha",
      category: "Dosha",
      polarity: cancelled ? "mixed" : "negative",
      planets: [MARS],
      formedBy: `Mars occupies the ${marsHouse}th from lagna / ${marsFromMoon}th from Moon / ${marsFromVenus}th from Venus.`,
      description: cancelled
        ? "Present but substantially cancelled - Mars is strong, in its own or exaltation sign, or aspected by Jupiter. Match with a partner who also has a Mars dosha, or perform the standard remedies."
        : "Classically indicates friction, impatience or delay in marriage. It is only one factor - Jupiter's aspect, the 7th lord and Venus must all be judged before drawing a conclusion.",
    });
  }

  /* ---------------- Grahan / Chandal / Angarak ---------------- */
  const grahan = [SUN, MOON].filter((p) => sameSign(p, RAHU) || sameSign(p, KETU));
  if (grahan.length) {
    out.push({
      key: "grahan-dosha",
      name: "Grahan Dosha",
      category: "Dosha",
      polarity: "negative",
      planets: [...grahan, sameSign(grahan[0], RAHU) ? RAHU : KETU],
      formedBy: `${grahan.map(nameOf).join(" and ")} conjoin${grahan.length === 1 ? "s" : ""} a lunar node.`,
      description:
        "A shadow on the significations of the luminary involved - confidence (Sun) or emotional security (Moon). It often gives unusual sensitivity and depth, and is softened by a strong dispositor.",
    });
  }
  if (sameSign(JUPITER, RAHU)) {
    out.push({
      key: "guru-chandal",
      name: "Guru Chandal Yoga",
      category: "Dosha",
      polarity: "negative",
      planets: [JUPITER, RAHU],
      formedBy: "Jupiter and Rahu share a sign.",
      description: "Unconventional beliefs and a tendency to question tradition. Excellent for research and out-of-the-box thinking, difficult for orthodoxy.",
    });
  }
  if (sameSign(MARS, RAHU)) {
    out.push({
      key: "angarak",
      name: "Angarak Yoga",
      category: "Dosha",
      polarity: "negative",
      planets: [MARS, RAHU],
      formedBy: "Mars and Rahu share a sign.",
      description: "High drive and courage, but also anger, risk-taking and accidents if unchecked. Great for surgery, engineering, sport and the military.",
    });
  }
  if (sameSign(MOON, SATURN)) {
    out.push({
      key: "vish-yoga",
      name: "Vish Yoga",
      category: "Dosha",
      polarity: "negative",
      planets: [MOON, SATURN],
      formedBy: "Moon and Saturn share a sign.",
      description: "Seriousness, emotional restraint and a tendency to carry burdens silently. Maturity and patience are the gifts of this combination.",
    });
  }
  if (sameSign(SATURN, RAHU)) {
    out.push({
      key: "shrapit",
      name: "Shrapit Yoga",
      category: "Dosha",
      polarity: "negative",
      planets: [SATURN, RAHU],
      formedBy: "Saturn and Rahu share a sign.",
      description: "A karma-clearing combination: slow, heavy responsibilities followed by unusual endurance and late but solid success.",
    });
  }

  /* ---------------- Shakat ---------------- */
  const jupFromMoon2 = distFromMoon(JUPITER);
  if ([6, 8, 12].includes(jupFromMoon2)) {
    out.push({
      key: "shakat",
      name: "Shakat Yoga",
      category: "Arishta",
      polarity: "negative",
      planets: [MOON, JUPITER],
      formedBy: `Jupiter is in the ${jupFromMoon2}th sign from the Moon.`,
      description: "A 'cart' that tips: fortunes can swing sharply. It teaches resilience and usually improves markedly after the first Saturn return.",
    });
  }

  /* ---------------- Daridra ---------------- */
  if ([6, 8, 12].includes(house(lordOf(11)))) {
    out.push({
      key: "daridra",
      name: "Daridra Yoga",
      category: "Arishta",
      polarity: "negative",
      planets: [lordOf(11)],
      formedBy: `The 11th lord (${nameOf(lordOf(11))}) is placed in the ${house(lordOf(11))}th house.`,
      description: "Income can leak through losses or expenditures. Careful budgeting and avoiding lending money neutralise most of it.",
    });
  }

  /* ---------------- Vargottama ---------------- */
  for (const gp of chart.grahas) {
    if (gp.planet === RAHU || gp.planet === KETU) continue;
    if (gp.vargas.D1 === gp.vargas.D9) {
      out.push({
        key: `vargottama-${gp.planet}`,
        name: `Vargottama ${nameOf(gp.planet)}`,
        category: "Strength",
        polarity: "positive",
        planets: [gp.planet],
        formedBy: `${nameOf(gp.planet)} is in the same sign in D1 and D9 (${signNameSafe(chart, gp.sign)}).`,
        description: "A planet in vargottama acts with unusual consistency and gains strength in its dasha.",
      });
    }
  }

  /* ---------------- Neecha Bhanga ---------------- */
  for (const gp of chart.grahas) {
    if (gp.dignity !== "Debilitated") continue;
    const dispositor = chart.houseLords.find((h) => h.sign === gp.sign)!.lord;
    const dispositorHouse = house(dispositor);
    const fromMoon = ((sign(dispositor) - sign(MOON) + 12) % 12) + 1;
    if (KENDRA.includes(dispositorHouse) || [1, 4, 7, 10].includes(fromMoon)) {
      out.push({
        key: `neecha-bhanga-${gp.planet}`,
        name: "Neecha Bhanga Raja Yoga",
        category: "Raja",
        polarity: "positive",
        planets: [gp.planet, dispositor],
        formedBy: `${nameOf(gp.planet)} is debilitated, but its dispositor ${nameOf(dispositor)} is in a kendra.`,
        description: "Debility is cancelled. Such a planet often gives its best results after an early period of struggle.",
      });
    }
  }

  /* ---------------- Combustion ---------------- */
  const burnt = chart.grahas.filter((p) => p.combust && p.planet !== SUN);
  if (burnt.length) {
    out.push({
      key: "asta",
      name: "Astangata (Combustion)",
      category: "Strength",
      polarity: "negative",
      planets: burnt.map((p) => p.planet),
      formedBy: `${burnt.map((p) => nameOf(p.planet)).join(", ")} ${burnt.length === 1 ? "is" : "are"} within combustion distance of the Sun.`,
      description: "A combust planet loses outward brightness: its house matters need conscious effort. Retrograde planets and Mercury/Venus very close to the Sun still retain much of their power.",
    });
  }

  /* ---------------- Kendradhipati dosha ---------------- */
  const kendraLords = new Set([lordOf(1), lordOf(4), lordOf(7), lordOf(10)]);
  const kd = [...kendraLords].filter((p) => [JUPITER, VENUS, MERCURY, MOON].includes(p));
  if (kd.length) {
    out.push({
      key: "kendradhipati",
      name: "Kendradhipati Dosha",
      category: "Dosha",
      polarity: "mixed",
      planets: kd,
      formedBy: `${kd.map(nameOf).join(", ")} own${kd.length === 1 ? "s" : ""} both a kendra and a natural-benefic nature.`,
      description: "A natural benefic owning a kendra loses some benevolence. Its dasha can bring responsibility that feels heavier than its rewards.",
    });
  }

  return out;
}

function signNameSafe(chart: Chart, s: number) {
  return ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][s];
}
