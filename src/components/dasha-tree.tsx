"use client";

import { useMemo, useState } from "react";
import { DASHA_ORDER, PLANETS, type PlanetId } from "@/lib/astro/constants";
import type { DashaChainItem, DashaNode } from "@/lib/astro/dasha";
import { dateRange } from "@/lib/format";

const LEVEL_NAMES = ["Maha Dasha", "Antar Dasha", "Pratyantar Dasha", "Sookshma Dasha", "Prana Dasha"];

function keyOf(n: { level: number; lord: PlanetId; startJd: number }) {
  return `${n.level}-${n.lord}-${n.startJd.toFixed(3)}`;
}

export function DashaTree({
  tree,
  tz,
  chain,
}: {
  tree: DashaNode[];
  tz: string;
  chain: DashaChainItem[];
}) {
  const currentKeys = useMemo(() => new Set(chain.map((c) => keyOf(c))), [chain]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(currentKeys));

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-1.5">
      {tree.map((node) => {
        const key = keyOf(node);
        const isOpen = open.has(key);
        const isCurrent = currentKeys.has(key);
        return (
          <div key={key}>
            <button
              type="button"
              onClick={() => toggle(key)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                isCurrent
                  ? "border-brand/40 bg-brand-soft"
                  : "border-line bg-card hover:border-brand/30 hover:bg-paper-deep/60"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold ${
                  isCurrent ? "bg-brand text-white" : "bg-paper-deep text-brand-dark"
                }`}
              >
                {PLANETS[node.lord].short}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold text-ink">{PLANETS[node.lord].name}</span>
                  <span className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Mahadasha</span>
                  {isCurrent && <span className="chip !bg-white/80 !py-0 text-[0.6rem]">running</span>}
                </span>
                <span className="block text-[0.72rem] text-muted">{dateRange(node.startJd, node.endJd, tz)}</span>
              </span>
              <span className={`text-xs text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
            </button>

            {isOpen && node.children && (
              <div className="ml-4 mt-1.5 space-y-1 border-l border-line pl-3">
                {node.children.map((child) => {
                  const cKey = keyOf(child);
                  const cOpen = open.has(cKey);
                  const cCurrent = currentKeys.has(cKey);
                  return (
                    <div key={cKey}>
                      <button
                        type="button"
                        onClick={() => toggle(cKey)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[0.8rem] transition-colors ${
                          cCurrent ? "bg-brand-soft font-medium text-brand-dark" : "hover:bg-paper-deep/60"
                        }`}
                      >
                        <span className="w-14 shrink-0 font-medium">{PLANETS[child.lord].name}</span>
                        <span className="flex-1 text-[0.7rem] text-muted">{dateRange(child.startJd, child.endJd, tz)}</span>
                        <span className={`text-[0.6rem] text-muted transition-transform ${cOpen ? "rotate-90" : ""}`}>▶</span>
                      </button>
                      {cOpen && child.children && (
                        <div className="ml-3 border-l border-line pl-3">
                          {child.children.map((g) => {
                            const gKey = keyOf(g);
                            const gCurrent = currentKeys.has(gKey);
                            return (
                              <div
                                key={gKey}
                                className={`flex items-center gap-2 rounded px-2 py-1 text-[0.74rem] ${gCurrent ? "bg-brand-soft/70 font-medium text-brand-dark" : ""}`}
                              >
                                <span className="w-14 shrink-0">{PLANETS[g.lord].name}</span>
                                <span className="flex-1 text-[0.66rem] text-muted">{dateRange(g.startJd, g.endJd, tz)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <p className="pt-2 text-xs text-muted">
        Levels: {LEVEL_NAMES.join(" → ")}. The running chain is highlighted; click any period to open its
        sub-periods. Current Sookshma and Prana periods are listed above in the summary.
      </p>
    </div>
  );
}

export function CurrentDasha({ chain, tz }: { chain: DashaChainItem[]; tz: string }) {
  return (
    <div className="space-y-2">
      {chain.map((c) => (
        <div key={`${c.level}-${c.startJd}`} className="flex items-center gap-3 rounded-lg border border-line bg-card px-3 py-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-[0.58rem] font-bold text-brand-dark">
            {PLANETS[c.lord].short}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.8rem] font-medium text-ink">
              {PLANETS[c.lord].name}{" "}
              <span className="font-normal text-muted">· {LEVEL_NAMES[c.level - 1] ?? "Dasha"}</span>
            </p>
            <p className="text-[0.68rem] text-muted">{dateRange(c.startJd, c.endJd, tz)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function YoginiTable({
  periods,
  tz,
}: {
  periods: { name: string; lord: PlanetId; startJd: number; endJd: number }[];
  tz: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Yogini</th>
            <th>Lord</th>
            <th>Period</th>
          </tr>
        </thead>
        <tbody>
          {periods.slice(0, 12).map((p, i) => (
            <tr key={i}>
              <td className="font-medium">{p.name}</td>
              <td>{PLANETS[p.lord].name}</td>
              <td className="text-muted">{dateRange(p.startJd, p.endJd, tz)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DASHA_ORDER };
