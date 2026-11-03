import Link from "next/link";
import type { Metadata } from "next";
import { computeKundli, type KundliResult } from "@/lib/astro";
import { KundliView } from "@/components/kundli-view";
import { birthQuery, parseBirthParams, parseOptions, type QueryParams } from "@/lib/query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kundli",
  description: "Your Vedic birth chart with dashas, vargas, panchang, strength and a printable report.",
};

export default async function KundliPage({
  searchParams,
}: {
  searchParams: Promise<QueryParams>;
}) {
  const sp = await searchParams;
  const input = parseBirthParams(sp);
  const options = parseOptions(sp);

  let result: KundliResult | null = null;
  let error: string | null = null;
  try {
    result = computeKundli(input, options);
  } catch (e) {
    error = e instanceof Error ? e.message : "The chart could not be computed.";
  }

  if (!result) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <p className="eyebrow">Kundli</p>
          <h1 className="display mt-2 text-2xl font-semibold text-brand-dark">Chart could not be generated</h1>
          <p className="mt-3 text-sm text-muted">{error}</p>
          <p className="mt-2 text-xs text-muted">
            Check the date, time and place. Birth years outside 1800–2399 need a different ephemeris file.
          </p>
          <Link href="/kundli" className="btn btn-primary mt-5">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  const reportHref = `/report?${birthQuery(input, options).toString()}`;

  return (
    <div className="container-page py-7 sm:py-10">
      <KundliView result={result} reportHref={reportHref} />
    </div>
  );
}
