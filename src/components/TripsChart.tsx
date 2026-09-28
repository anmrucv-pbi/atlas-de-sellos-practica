"use client";

import { useMemo } from "react";
import type { TripConAtributos } from "@/lib/types";

interface Props {
  trips: TripConAtributos[];
}

const BAR_W = 32;
const GAP = 24;
const CHART_H = 110;

export default function TripsChart({ trips }: Props) {
  const { years, counts, maxCount, width } = useMemo(() => {
    const counts: Record<number, number> = {};
    trips.forEach((t) => {
      counts[t.anio] = (counts[t.anio] || 0) + 1;
    });
    const years = Object.keys(counts)
      .map(Number)
      .sort((a, b) => a - b);
    const maxCount = years.length ? Math.max(...years.map((y) => counts[y])) : 0;
    const width = Math.max(320, years.length * (BAR_W + GAP) + GAP);
    return { years, counts, maxCount, width };
  }, [trips]);

  return (
    <div className="section">
      <div className="section-head">
        <h2>Viajes por año</h2>
      </div>
      <div className="chart-wrap">
        {years.length === 0 ? (
          <svg className="chart" height="160" viewBox="0 0 320 160">
            <text x={160} y={80} textAnchor="middle" className="chart-label">
              Todavía no hay viajes para graficar
            </text>
          </svg>
        ) : (
          <svg className="chart" width={width} height="160" viewBox={`0 0 ${width} 160`}>
            {years.map((y, i) => {
              const c = counts[y];
              const h = (c / maxCount) * CHART_H;
              const x = i * (BAR_W + GAP) + GAP / 2;
              const y0 = CHART_H - h + 10;
              return (
                <g key={y}>
                  <rect className="bar" x={x} y={y0} width={BAR_W} height={h} rx={4}>
                    <title>
                      {y}: {c} {c > 1 ? "viajes" : "viaje"}
                    </title>
                  </rect>
                  <text x={x + BAR_W / 2} y={CHART_H + 30} textAnchor="middle" className="chart-label">
                    {y}
                  </text>
                  <text x={x + BAR_W / 2} y={y0 - 6} textAnchor="middle" className="chart-label">
                    {c}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
