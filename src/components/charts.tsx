import { PLANETS, RASHIS, type PlanetId } from "@/lib/astro/constants";

export interface ChartGlyphProps {
  bySign: Record<number, PlanetId[]>;
  lagnaSign: number;
  title: string;
  subtitle?: string;
  retrograde?: PlanetId[];
  combust?: PlanetId[];
  size?: "sm" | "md";
}

const NORTH_POS: { x: number; y: number }[] = [
  { x: 50, y: 20 }, // 1
  { x: 29, y: 11 }, // 2
  { x: 13, y: 27 }, // 3
  { x: 25, y: 47 }, // 4
  { x: 13, y: 71 }, // 5
  { x: 29, y: 87 }, // 6
  { x: 50, y: 78 }, // 7
  { x: 71, y: 87 }, // 8
  { x: 87, y: 71 }, // 9
  { x: 75, y: 47 }, // 10
  { x: 87, y: 27 }, // 11
  { x: 71, y: 11 }, // 12
];

function PlanetLines({
  planets,
  x,
  y,
  anchor,
  retrograde = [],
  combust = [],
  small,
}: {
  planets: PlanetId[];
  x: number;
  y: number;
  anchor: "middle" | "start";
  retrograde?: PlanetId[];
  combust?: PlanetId[];
  small?: boolean;
}) {
  const fs = small ? 2.9 : 3.2;
  return (
    <>
      {planets.map((p, i) => {
        const marks = `${retrograde.includes(p) ? "℞" : ""}${combust.includes(p) ? "*" : ""}`;
        return (
          <text
            key={p}
            x={x}
            y={y + i * (fs + 0.8)}
            textAnchor={anchor}
            fontSize={fs}
            fontWeight={600}
            fill="#221d1a"
          >
            {PLANETS[p].short}
            {marks ? (
              <tspan fontSize={fs * 0.7} fill="#c2410c">
                {marks}
              </tspan>
            ) : null}
          </text>
        );
      })}
    </>
  );
}

export function NorthChart({
  bySign,
  lagnaSign,
  title,
  subtitle,
  retrograde,
  combust,
  size = "md",
}: ChartGlyphProps) {
  const w = size === "sm" ? 280 : 400;
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-center">
        <h3 className="text-sm font-semibold text-brand-dark">{title}</h3>
        {subtitle && <p className="text-[0.65rem] text-muted">{subtitle}</p>}
      </div>
      <svg
        viewBox="0 0 100 100"
        width={w}
        height={w}
        className="chart-svg max-w-full"
        role="img"
        aria-label={`${title} — North Indian style chart`}
      >
        <rect x="0.6" y="0.6" width="98.8" height="98.8" rx="1" fill="#fffdf8" stroke="#c9bda6" strokeWidth="1" />
        <g stroke="#c9bda6" strokeWidth="0.55" fill="none">
          <path d="M0.6 0.6 L99.4 99.4 M99.4 0.6 L0.6 99.4" />
          <path d="M50 0.6 L99.4 50 L50 99.4 L0.6 50 Z" />
        </g>

        {Array.from({ length: 12 }, (_, i) => {
          const sign = (lagnaSign + i) % 12;
          const planets = bySign[sign] ?? [];
          const pos = NORTH_POS[i];
          const stackStart = pos.y + 6.5;
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r="2.7" fill="#eee9fa" stroke="#cfc4e6" strokeWidth="0.35" />
              <text
                x={pos.x}
                y={pos.y + 1.05}
                textAnchor="middle"
                fontSize="2.7"
                fontWeight={700}
                fill="#4a3a86"
              >
                {sign + 1}
              </text>
              <PlanetLines
                planets={planets}
                x={pos.x}
                y={stackStart}
                anchor="middle"
                retrograde={retrograde}
                combust={combust}
                small={planets.length > 3}
              />
            </g>
          );
        })}
        <text x="50" y="5" textAnchor="middle" fontSize="2.6" fill="#a16207" fontWeight={600}>
          LAGNA
        </text>
        <text x="50" y="97.5" textAnchor="middle" fontSize="2.4" fill="#6e655c">
          North Indian · fixed houses
        </text>
      </svg>
    </div>
  );
}

/* South Indian: signs are fixed, houses rotate with the lagna. */
const SOUTH_GRID: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

export function SouthChart({
  bySign,
  lagnaSign,
  title,
  subtitle,
  retrograde,
  combust,
  size = "md",
}: ChartGlyphProps) {
  const w = size === "sm" ? 280 : 400;
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 text-center">
        <h3 className="text-sm font-semibold text-brand-dark">{title}</h3>
        {subtitle && <p className="text-[0.65rem] text-muted">{subtitle}</p>}
      </div>
      <svg
        viewBox="0 0 100 100"
        width={w}
        height={w}
        className="chart-svg max-w-full"
        role="img"
        aria-label={`${title} — South Indian style chart`}
      >
        <rect x="0.6" y="0.6" width="98.8" height="98.8" fill="#fffdf8" stroke="#c9bda6" strokeWidth="1" />
        <g stroke="#c9bda6" strokeWidth="0.55">
          {[25, 50, 75].map((v) => (
            <line key={`v${v}`} x1={v} y1="0.6" x2={v} y2="99.4" />
          ))}
          {[25, 50, 75].map((v) => (
            <line key={`h${v}`} x1="0.6" y1={v} x2="99.4" y2={v} />
          ))}
        </g>
        <rect x="25.6" y="25.6" width="48.8" height="48.8" fill="#faf6ec" stroke="#e6dcc9" strokeWidth="0.5" />
        <text x="50" y="47" textAnchor="middle" fontSize="3" fill="#a16207" fontWeight="600" letterSpacing="0.5">
          RASHI
        </text>
        <text x="50" y="52.5" textAnchor="middle" fontSize="2.2" fill="#6e655c">
          South Indian
        </text>
        <text x="50" y="56.5" textAnchor="middle" fontSize="2.2" fill="#6e655c">
          fixed signs
        </text>

        {SOUTH_GRID.map((row, r) =>
          row.map((sign, c) => {
            if (sign === null) return null;
            const x = c * 25;
            const y = r * 25;
            const planets = bySign[sign] ?? [];
            const isLagna = sign === lagnaSign;
            return (
              <g key={`${r}-${c}`}>
                {isLagna && (
                  <path
                    d={`M${x + 1.2} ${y + 9} L${x + 9} ${y + 1.2}`}
                    stroke="#c2410c"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                )}
                <text x={x + 2} y={y + 5} fontSize="2.6" fontWeight={700} fill="#4a3a86">
                  {sign + 1}
                </text>
                <text x={x + 5.4} y={y + 5} fontSize="2.1" fill="#6e655c">
                  {RASHIS[sign].name.slice(0, 3)}
                </text>
                <PlanetLines
                  planets={planets}
                  x={x + 2}
                  y={y + 11.5}
                  anchor="start"
                  retrograde={retrograde}
                  combust={combust}
                  small={planets.length > 3}
                />
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

export function ChartPair(props: ChartGlyphProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <NorthChart {...props} />
      <SouthChart {...props} />
    </div>
  );
}
