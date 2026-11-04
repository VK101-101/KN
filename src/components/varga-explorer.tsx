"use client";

import { useState } from "react";
import type { VargaChart, KundliResult } from "@/lib/astro";
import { PLANETS, RASHIS } from "@/lib/astro/constants";
import { NorthChart, SouthChart } from "./charts";
import { ordinal } from "@/lib/format";

export function VargaExplorer({ result }: { result: KundliResult }) {
  const [selected, setSelected] = useState("D9");
  const varga = result.vargas.find((v) => v.key === selected) ?? result.vargas[0];
  const retro = result.chart.grahas.filter((g) => g.retrograde).map((g) => g.planet);
  const combust = result.chart.grahas.filter((g) => g.combust).map((g) => g.planet);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {result.vargas.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setSelected(v.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              selected === v.key
                ? "border-brand bg-brand text-white"
                : "border-line bg-card text-muted hover:border-brand/40 hover:text-brand-dark"
            }`}
            title={`${v.name} (${v.divisions} divisions)`}
          >
            {v.key}
            <span className={`ml-1 font-normal ${selected === v.key ? "text-white/75" : "text-muted"}`}>
              {v.name}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <NorthChart
              bySign={varga.bySign}
              lagnaSign={varga.lagnaSign}
              title={`${varga.key} · ${varga.name}`}
              subtitle="North Indian"
              retrograde={retro}
              combust={combust}
              size="sm"
            />
            <SouthChart
              bySign={varga.bySign}
              lagnaSign={varga.lagnaSign}
              title={`${varga.key} · ${varga.name}`}
              subtitle="South Indian"
              retrograde={retro}
              combust={combust}
              size="sm"
            />
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-brand-dark">
            {varga.key} placements
            <span className="ml-2 text-[0.7rem] font-normal text-muted">
              Lagna {RASHIS[varga.lagnaSign].name}
            </span>
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Graha</th>
                  <th>Varga rashi</th>
                  <th>Bhava</th>
                </tr>
              </thead>
              <tbody>
                {varga.placements.map((p) => (
                  <tr key={p.planet}>
                    <td className="font-medium">{PLANETS[p.planet].name}</td>
                    <td>
                      {RASHIS[p.sign].name}{" "}
                      <span className="text-[0.7rem] text-muted">{RASHIS[p.sign].hi}</span>
                    </td>
                    <td>{ordinal(p.house)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="font-medium text-brand">Lagna</td>
                  <td>{RASHIS[varga.lagnaSign].name}</td>
                  <td>1st</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            {VARGA_NOTES[varga.key] ?? "A divisional chart refines one area of life; read it with the D1 chart, not instead of it."}
          </p>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-brand-dark">All vargas at a glance</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="data-table text-center">
            <thead>
              <tr>
                <th className="text-left">Varga</th>
                {result.chart.grahas.map((g) => (
                  <th key={g.planet}>{PLANETS[g.planet].short}</th>
                ))}
                <th>Lagna</th>
              </tr>
            </thead>
            <tbody>
              {result.vargas.map((v) => (
                <tr key={v.key} className={v.key === selected ? "bg-brand-soft/60" : ""}>
                  <td className="text-left font-semibold">{v.key}</td>
                  {result.chart.grahas.map((g) => {
                    const p = v.placements.find((x) => x.planet === g.planet)!;
                    return (
                      <td key={g.planet} className={[1, 5, 9].includes(p.house) ? "font-semibold text-brand" : ""}>
                        {RASHIS[p.sign].name.slice(0, 3)}
                      </td>
                    );
                  })}
                  <td>{RASHIS[v.lagnaSign].name.slice(0, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const VARGA_NOTES: Record<string, string> = {
  D1: "The rashi chart — the body, the life direction and everything else.",
  D2: "Hora: wealth and sustenance. Planets in Leo/Cancer in D2 show how money is held.",
  D3: "Drekkana: siblings, courage and short journeys.",
  D4: "Chaturthamsha: property, home and fixed assets.",
  D7: "Saptamsha: children, creativity and lineage.",
  D9: "Navamsa: the fruit of the chart — marriage, dharma and the true strength of each planet.",
  D10: "Dashamsha: career, profession and public standing.",
  D12: "Dwadashamsha: parents and ancestry.",
  D16: "Shodashamsha: vehicles, comforts and happiness.",
  D20: "Vimshamsha: spiritual practice and devotion.",
  D24: "Chaturvimshamsha: learning, education and knowledge.",
  D27: "Bhamsha: strengths and weaknesses of the mind.",
  D30: "Trimshamsha: misfortune, suffering and moral tests.",
  D40: "Khavedamsha: maternal legacy and auspiciousness.",
  D45: "Akshavedamsha: paternal legacy and conduct.",
  D60: "Shashtiamsha: the finest karmic layer — used for the last word on a planet.",
};

export function vargaKeys(vargas: VargaChart[]) {
  return vargas.map((v) => v.key);
}
