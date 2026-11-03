"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { searchCities } from "@/lib/geo/cities";

export interface PanchangFormState {
  date: string;
  place: string;
  lat: string;
  lon: string;
  tz: string;
}

export function PanchangForm({ initial }: { initial: PanchangFormState }) {
  const router = useRouter();
  const [value, setValue] = useState<PanchangFormState>(initial);
  const [query, setQuery] = useState(initial.place);
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => searchCities(query, 8), [query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams({
      d: value.date,
      p: value.place || "New Delhi",
      lat: value.lat,
      lon: value.lon,
      tz: value.tz,
    });
    router.push(`/panchang?${q.toString()}`);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_1.3fr_auto] sm:items-end">
      <div>
        <label className="label" htmlFor="panchang-date">
          Date
        </label>
        <input
          id="panchang-date"
          type="date"
          className="field"
          min="1800-01-01"
          max="2399-12-31"
          value={value.date}
          onChange={(e) => setValue({ ...value, date: e.target.value })}
          required
        />
      </div>

      <div className="relative">
        <label className="label" htmlFor="panchang-place">
          Place
        </label>
        <input
          id="panchang-place"
          className="field"
          autoComplete="off"
          value={query}
          placeholder="Start typing a city…"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setValue({ ...value, place: e.target.value });
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 140)}
          required
        />
        <p className="mt-1 text-[0.7rem] text-muted">
          {Number(value.lat).toFixed(4)}°, {Math.abs(Number(value.lon)).toFixed(4)}° · {value.tz}
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
                    setValue({
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

      <button type="submit" className="btn btn-primary h-[42px]">
        Show panchang <span aria-hidden>→</span>
      </button>
    </form>
  );
}
