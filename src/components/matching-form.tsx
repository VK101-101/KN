"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonFields, personFromDefaults, personToInput, type PersonState } from "./birth-form";
import type { BirthInput } from "@/lib/astro/chart";
import { birthQuery } from "@/lib/query";
import { DEFAULT_OPTIONS, type ChartOptions } from "@/lib/astro/options";

export function MatchingForm({
  initialBride,
  initialGroom,
  options = DEFAULT_OPTIONS,
}: {
  initialBride?: BirthInput;
  initialGroom?: BirthInput;
  options?: ChartOptions;
}) {
  const router = useRouter();
  const [bride, setBride] = useState<PersonState>(() => {
    if (initialBride) return { ...initialBride, lat: String(initialBride.lat), lon: String(initialBride.lon) };
    return { ...personFromDefaults(), name: "", gender: "female", date: "1992-05-14", time: "08:30", place: "Mumbai", lat: "19.076", lon: "72.8777" };
  });
  const [groom, setGroom] = useState<PersonState>(() => {
    if (initialGroom) return { ...initialGroom, lat: String(initialGroom.lat), lon: String(initialGroom.lon) };
    return { ...personFromDefaults(), name: "", gender: "male", date: "1990-01-01", time: "12:00", place: "New Delhi", lat: "28.6139", lon: "77.209" };
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const b = birthQuery(personToInput(bride), options, "b");
    const g = birthQuery(personToInput(groom), options, "g");
    const merged = new URLSearchParams([...b.entries(), ...g.entries()]);
    router.push(`/matching?${merged.toString()}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <PersonFields value={bride} onChange={setBride} idPrefix="bride" heading="Bride's birth details" accent="bride" />
        <PersonFields value={groom} onChange={setGroom} idPrefix="groom" heading="Groom's birth details" accent="groom" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary">
          Match these charts <span aria-hidden>→</span>
        </button>
        <p className="text-xs text-muted">
          Ashtakoot works from the Moon nakshatra and Moon sign. The full charts are checked too, but
          the kutas are the traditional first filter.
        </p>
      </div>
    </form>
  );
}
