import type { Metadata } from "next";
import Link from "next/link";
import { computePanchang, sunriseForLocalDate, upagrahas } from "@/lib/astro/panchang";
import { sunMoon } from "@/lib/astro/ephemeris";
import { PanchangPanel, Pill, PlanetLegend } from "@/components/panels";
import { PanchangForm } from "@/components/panchang-form";
import { parseBirthParams, parseOptions, type QueryParams } from "@/lib/query";
import { fmtJdTime, longDate, shortDate } from "@/lib/format";
import { formatLocalDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panchang",
  description:
    "Daily Vedic panchang for any city: tithi, nakshatra, yoga, karana, sunrise and sunset, choghadiya, Rahu kaal, Abhijit muhurat, horas and the Vedic calendar.",
};

function todayIn(tz: string) {
  return formatLocalDate(Date.now(), tz)
    .split("-")
    .reverse()
    .join("-");
}

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function PanchangPage({
  searchParams,
}: {
  searchParams: Promise<QueryParams>;
}) {
  const sp = await searchParams;
  const spWithDate: QueryParams = { ...sp };
  if (typeof sp["d"] !== "string" && !Array.isArray(sp["d"])) {
    spWithDate["d"] = todayIn("Asia/Kolkata");
  }

  const input = parseBirthParams(spWithDate);
  const options = parseOptions(sp);
  const date = input.date;

  let panchang = null;
  let error: string | null = null;
  let sunLon = 0;

  try {
    // A daily panchang is read at sunrise, the start of the Vedic day.
    const srJd = sunriseForLocalDate(date, input.tz, input.lat, input.lon);
    panchang = computePanchang(srJd, input.lat, input.lon, input.tz, options.ayanamsa);
    sunLon = sunMoon(srJd, { ayanamsa: options.ayanamsa }).sun;
  } catch (e) {
    error = e instanceof Error ? e.message : "The panchang could not be computed.";
  }

  const formState = {
    date,
    place: input.place,
    lat: String(input.lat),
    lon: String(input.lon),
    tz: input.tz,
  };

  const prev = shiftDate(date, -1);
  const next = shiftDate(date, 1);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">Vedic calendar · daily</p>
          <h1 className="display mt-2 text-3xl font-semibold text-brand-dark sm:text-4xl">Panchang & muhurat</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The five limbs of the Vedic day — tithi, nakshatra, yoga, karana and vara — computed for the
            sunrise-to-sunrise day at the chosen place, with the muhurat windows used for choosing a time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/panchang?d=${prev}&p=${encodeURIComponent(input.place)}&lat=${input.lat}&lon=${input.lon}&tz=${input.tz}`} className="btn btn-ghost !px-3 !py-2 text-sm">
            ← {shortDate(prev)}
          </Link>
          <Link href={`/panchang?d=${todayIn(input.tz)}&p=${encodeURIComponent(input.place)}&lat=${input.lat}&lon=${input.lon}&tz=${input.tz}`} className="btn btn-ghost !px-3 !py-2 text-sm">
            Today
          </Link>
          <Link href={`/panchang?d=${next}&p=${encodeURIComponent(input.place)}&lat=${input.lat}&lon=${input.lon}&tz=${input.tz}`} className="btn btn-ghost !px-3 !py-2 text-sm">
            {shortDate(next)} →
          </Link>
        </div>
      </div>

      <div className="card mt-6 p-5 sm:p-6">
        <PanchangForm initial={formState} />
      </div>

      {error && (
        <div className="card mt-6 border-rose-200 bg-rose-50/60 p-5 text-sm text-rose-800">
          {error} Check the date and place, then try again.
        </div>
      )}

      {panchang && (
        <div className="mt-8 space-y-6">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand-soft via-paper-deep to-paper px-5 py-5 sm:px-7">
              <div>
                <p className="eyebrow">{panchang.weekdayName} · {panchang.tithi.paksha} paksha</p>
                <h2 className="display mt-1 text-2xl font-semibold text-brand-dark sm:text-3xl">
                  {longDate(date)}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {input.place} · {panchang.tithi.fullName} · {panchang.nakshatra.name} p{panchang.nakshatra.pada}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="brand">{panchang.lunarMonth.purnimantaName}</Pill>
                <Pill>Vikram {panchang.samvat.vikram}</Pill>
                <Pill>{panchang.ritu}</Pill>
                <Pill>{panchang.ayana}</Pill>
              </div>
            </div>
            <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
              <div className="rounded-xl border border-line bg-card p-3">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Sunrise</p>
                <p className="mt-0.5 text-lg font-semibold text-ink">{fmtJdTime(panchang.sunriseJd, input.tz)}</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-3">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Sunset</p>
                <p className="mt-0.5 text-lg font-semibold text-ink">{fmtJdTime(panchang.sunsetJd, input.tz)}</p>
              </div>
              <div className="rounded-xl border border-line bg-card p-3">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Abhijit muhurat</p>
                <p className="mt-0.5 text-[0.92rem] font-semibold text-ink">
                  {fmtJdTime(panchang.abhijit.startJd, input.tz)} – {fmtJdTime(panchang.abhijit.endJd, input.tz)}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-card p-3">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted">Rahu kaal</p>
                <p className="mt-0.5 text-[0.92rem] font-semibold text-rose-700">
                  {fmtJdTime(panchang.rahuKaal.startJd, input.tz)} – {fmtJdTime(panchang.rahuKaal.endJd, input.tz)}
                </p>
              </div>
            </div>
          </div>

          <PanchangPanel
            panchang={panchang}
            tz={input.tz}
            place={input.place}
            dateLabel={longDate(date)}
            upagrahas={upagrahas(sunLon)}
          />

          <div className="card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-brand-dark">Choosing a time</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-emerald-800">Auspicious</p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-emerald-900/85">
                  Abhijit, Amrit and Shubh choghadiya, and the day&apos;s own hora of a benefic planet. Good for
                  beginnings, travel and signing.
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-800">Neutral</p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-amber-900/85">
                  Labh and Char choghadiya, and Budh or Guru hora. Fine for routine work; avoid for weddings
                  and inaugural ceremonies.
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-rose-800">Avoid</p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-rose-900/85">
                  Rahu kaal, Yamaganda, Gulika kaal, and the Rikta tithis (4th, 9th, 14th). Traditionally
                  avoided for auspicious work.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <p className="text-xs leading-relaxed text-muted">
              Times are in {input.tz}. Panchang is the sunrise-to-sunrise Vedic day; the lunar month shown is
              Purnimanta (North Indian) with the Amanta name beside it. Muhurat is a traditional aid to
              timing, not a guarantee of an outcome.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <PlanetLegend />
            <Link href="/kundli" className="btn btn-primary no-print text-sm">
              Panchang at your birth
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
