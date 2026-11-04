"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BirthInput } from "@/lib/astro/chart";
import { AYANAMSAS, DEFAULT_OPTIONS, HOUSE_SYSTEMS, type ChartOptions } from "@/lib/astro/options";
import { CITIES, searchCities } from "@/lib/geo/cities";
import { TIMEZONES } from "@/lib/time";
import { DEFAULT_PERSON, birthQuery } from "@/lib/query";

export interface PersonState {
  name: string;
  gender: "male" | "female" | "other";
  date: string;
  time: string;
  place: string;
  lat: string;
  lon: string;
  tz: string;
}

export function personFromInput(input: BirthInput): PersonState {
  return {
    name: input.name,
    gender: input.gender,
    date: input.date,
    time: input.time,
    place: input.place,
    lat: String(input.lat),
    lon: String(input.lon),
    tz: input.tz,
  };
}

export function personFromDefaults(): PersonState {
  return {
    name: DEFAULT_PERSON.name,
    gender: DEFAULT_PERSON.gender,
    date: DEFAULT_PERSON.date,
    time: DEFAULT_PERSON.time,
    place: DEFAULT_PERSON.place,
    lat: String(DEFAULT_PERSON.lat),
    lon: String(DEFAULT_PERSON.lon),
    tz: DEFAULT_PERSON.tz,
  };
}

/** Great-circle distance in kilometres. */
function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * A label for coordinates read from the browser. We keep it honest: name the
 * nearest known city only when it is genuinely close, otherwise show the
 * coordinates themselves rather than leaving a stale city name in the form.
 */
function locationLabel(lat: number, lon: number) {
  let best: (typeof CITIES)[number] | null = null;
  let bestDist = Infinity;
  for (const c of CITIES) {
    const d = distanceKm(lat, lon, c.lat, c.lon);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  if (best && bestDist <= 25) return `Near ${best.name}`;
  return `My location (${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"})`;
}

export function personToInput(p: PersonState): BirthInput {
  const city = CITIES.find((c) => c.name.toLowerCase() === p.place.toLowerCase());
  const lat = p.lat.trim() === "" ? NaN : Number(p.lat);
  const lon = p.lon.trim() === "" ? NaN : Number(p.lon);
  return {
    name: p.name.trim() || "Native",
    gender: p.gender,
    date: p.date,
    time: p.time,
    place: p.place.trim() || city?.name || "Unknown place",
    lat: Number.isFinite(lat) ? lat : city?.lat ?? DEFAULT_PERSON.lat,
    lon: Number.isFinite(lon) ? lon : city?.lon ?? DEFAULT_PERSON.lon,
    tz: p.tz,
  };
}

function CityPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: PersonState;
  onChange: (next: PersonState) => void;
  idPrefix: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value.place);
  const [syncedPlace, setSyncedPlace] = useState(value.place);

  // Keep the text box in step when the place is changed by the parent (e.g.
  // geolocation or a preset). Adjusting during render is the React-recommended
  // alternative to a setState effect and avoids a cascading re-render.
  if (value.place !== syncedPlace) {
    setSyncedPlace(value.place);
    setQuery(value.place);
  }

  const suggestions = useMemo(() => searchCities(query, 9), [query]);

  return (
    <div className="relative">
      <label className="label" htmlFor={`${idPrefix}-place`}>
        Place of birth
      </label>
      <input
        id={`${idPrefix}-place`}
        className="field"
        autoComplete="off"
        value={query}
        placeholder="Start typing a city…"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onChange({ ...value, place: e.target.value });
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
      />
      <p className="mt-1 text-[0.7rem] text-muted">
        {value.lat && value.lon
          ? `${Number(value.lat).toFixed(4)}° ${Number(value.lat) >= 0 ? "N" : "S"}, ${Math.abs(Number(value.lon)).toFixed(4)}° ${Number(value.lon) >= 0 ? "E" : "W"} · ${value.tz}`
          : "Choose a city to set coordinates and timezone automatically."}
      </p>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-card py-1 shadow-xl">
          {suggestions.map((c) => (
            <li key={`${c.name}-${c.state}-${c.lat}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-brand-soft"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery(c.name);
                  setOpen(false);
                  onChange({
                    ...value,
                    place: c.name,
                    lat: String(c.lat),
                    lon: String(c.lon),
                    tz: c.tz,
                  });
                }}
              >
                <span className="font-medium text-ink">{c.name}</span>
                <span className="truncate text-[0.7rem] text-muted">
                  {c.state}, {c.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PersonFields({
  value,
  onChange,
  idPrefix,
  heading,
  accent = "brand",
}: {
  value: PersonState;
  onChange: (next: PersonState) => void;
  idPrefix: string;
  heading?: string;
  accent?: "brand" | "bride" | "groom";
}) {
  const accentClass =
    accent === "bride"
      ? "border-rose-200 bg-rose-50/60"
      : accent === "groom"
        ? "border-sky-200 bg-sky-50/60"
        : "border-line bg-paper-deep/40";

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${accentClass}`}>
      {heading && (
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-dark">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron" />
          {heading}
        </h3>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${idPrefix}-name`}>
            Full name
          </label>
          <input
            id={`${idPrefix}-name`}
            className="field"
            value={value.name}
            placeholder="Name (optional)"
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor={`${idPrefix}-gender`}>
            Gender
          </label>
          <select
            id={`${idPrefix}-gender`}
            className="field"
            value={value.gender}
            onChange={(e) => onChange({ ...value, gender: e.target.value as PersonState["gender"] })}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor={`${idPrefix}-date`}>
            Date of birth
          </label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            className="field"
            value={value.date}
            min="1800-01-01"
            max="2399-12-31"
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor={`${idPrefix}-time`}>
            Time of birth (24h)
          </label>
          <input
            id={`${idPrefix}-time`}
            type="time"
            step={60}
            className="field"
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <CityPicker value={value} onChange={onChange} idPrefix={idPrefix} />
        </div>
      </div>
    </div>
  );
}

function OptionsFields({
  options,
  onChange,
}: {
  options: ChartOptions;
  onChange: (o: ChartOptions) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="opt-ayanamsa">
          Ayanamsa
        </label>
        <select
          id="opt-ayanamsa"
          className="field"
          value={options.ayanamsa}
          onChange={(e) => onChange({ ...options, ayanamsa: e.target.value as ChartOptions["ayanamsa"] })}
        >
          {AYANAMSAS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="opt-house">
          House system
        </label>
        <select
          id="opt-house"
          className="field"
          value={options.houseSystem}
          onChange={(e) => onChange({ ...options, houseSystem: e.target.value as ChartOptions["houseSystem"] })}
        >
          {HOUSE_SYSTEMS.map((h) => (
            <option key={h.key} value={h.key}>
              {h.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="opt-dasha">
          Dasha year
        </label>
        <select
          id="opt-dasha"
          className="field"
          value={options.dashaYear}
          onChange={(e) => onChange({ ...options, dashaYear: Number(e.target.value) as 360 | 365.25 })}
        >
          <option value={365.25}>365.25 days (JHora / Parashara&apos;s Light)</option>
          <option value={360}>360 days (savana)</option>
        </select>
      </div>
      <div className="flex items-end">
        <label className="flex cursor-pointer items-center gap-2.5 pb-2 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#4a3a86]"
            checked={options.trueNode}
            onChange={(e) => onChange({ ...options, trueNode: e.target.checked })}
          />
          Use true lunar node (default: mean)
        </label>
      </div>
      <div className="flex items-end">
        <label className="flex cursor-pointer items-center gap-2.5 pb-2 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#4a3a86]"
            checked={options.topocentric}
            onChange={(e) => onChange({ ...options, topocentric: e.target.checked })}
          />
          Topocentric positions (default: geocentric)
        </label>
      </div>
    </div>
  );
}

export function BirthForm({
  initial,
  initialOptions = DEFAULT_OPTIONS,
  submitLabel = "Generate kundli",
  showOptions = true,
}: {
  initial?: PersonState;
  initialOptions?: ChartOptions;
  submitLabel?: string;
  showOptions?: boolean;
}) {
  const router = useRouter();
  const [person, setPerson] = useState<PersonState>(initial ?? personFromDefaults());
  const [options, setOptions] = useState<ChartOptions>(initialOptions);
  const [advanced, setAdvanced] = useState(false);
  const [geo, setGeo] = useState<"idle" | "locating" | "error">("idle");

  const tzOptions = TIMEZONES.includes(person.tz) ? TIMEZONES : [person.tz, ...TIMEZONES];

  function locate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo("error");
      return;
    }
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPerson((p) => ({
          ...p,
          place: locationLabel(lat, lon),
          lat: lat.toFixed(4),
          lon: lon.toFixed(4),
          tz: detected || p.tz,
        }));
        setGeo("idle");
      },
      () => setGeo("error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = personToInput(person);
    if (!input.date || !input.time) return;
    router.push(`/kundli?${birthQuery(input, options).toString()}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <PersonFields value={person} onChange={setPerson} idPrefix="birth" />

      <div className="rounded-xl border border-line bg-card">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-brand"
        >
          <span>{advanced ? "Hide" : "Show"} precise coordinates & calculation options</span>
          <span className="text-xs text-muted">{advanced ? "−" : "+"}</span>
        </button>
        {advanced && (
          <div className="space-y-5 border-t border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">
                Coordinates and timezone are set automatically when you choose a city.
              </p>
              <button type="button" onClick={locate} className="btn btn-ghost !px-3 !py-1.5 text-xs">
                {geo === "locating" ? "Locating…" : "Use my location"}
              </button>
            </div>
            {geo === "error" && (
              <p className="text-xs text-rose-600">
                Your location could not be read. Check the browser permission or enter the coordinates below.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="birth-lat">
                  Latitude (° N +)
                </label>
                <input
                  id="birth-lat"
                  className="field"
                  type="number"
                  step="0.0001"
                  min={-90}
                  max={90}
                  value={person.lat}
                  onChange={(e) => setPerson({ ...person, lat: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="birth-lon">
                  Longitude (° E +)
                </label>
                <input
                  id="birth-lon"
                  className="field"
                  type="number"
                  step="0.0001"
                  min={-180}
                  max={180}
                  value={person.lon}
                  onChange={(e) => setPerson({ ...person, lon: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="birth-tz">
                  Timezone
                </label>
                <select
                  id="birth-tz"
                  className="field"
                  value={person.tz}
                  onChange={(e) => setPerson({ ...person, tz: e.target.value })}
                >
                  {tzOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {showOptions && <OptionsFields options={options} onChange={setOptions} />}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary w-full sm:w-auto">
        {submitLabel}
        <span aria-hidden>→</span>
      </button>
      <p className="text-xs leading-relaxed text-muted">
        Birth time should be as recorded. Even a 4-minute error can move the lagna by one degree;
        use the rectification notes in the report if the ascendant is close to a sign boundary.
      </p>
    </form>
  );
}

export { OptionsFields };
