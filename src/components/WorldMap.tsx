"use client";

import { useEffect, useMemo, useRef } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import type { CountryFeature, CountryFeatureCollection, DatosApp, Estado } from "@/lib/types";
import { estadoLabel } from "@/lib/types";

interface Props {
  features: CountryFeature[];
  data: DatosApp;
  onCountryClick: (nombre: string) => void;
  searchPick: { name: string; token: number } | null;
}

export default function WorldMap({ features, data, onCountryClick, searchPick }: Props) {
  const pathsRef = useRef<Record<string, SVGPathElement | null>>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const paths = useMemo(() => {
    const collection: CountryFeatureCollection = { type: "FeatureCollection", features };
    const projection = geoEquirectangular().fitSize([960, 500], collection as unknown as GeoJSON.GeoJSON);
    const pathGen = geoPath(projection);
    return features
      .map((f) => ({
        nombre: f.properties.name_es,
        d: pathGen(f as unknown as GeoJSON.Feature) || "",
      }))
      .filter((p) => p.d);
  }, [features]);

  useEffect(() => {
    if (!searchPick) return;
    const nodes = pathsRef.current;
    Object.values(nodes).forEach((node) => node?.classList.add("dim"));
    const el = nodes[searchPick.name];
    if (el) {
      el.classList.remove("dim");
      el.classList.add("flash");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const t = setTimeout(() => {
      Object.values(nodes).forEach((node) => node?.classList.remove("dim", "flash"));
    }, 2300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPick]);

  function showTooltip(e: React.MouseEvent, nombre: string, estado: Estado) {
    const tt = tooltipRef.current;
    if (!tt) return;
    tt.textContent = `${nombre} · ${estadoLabel(estado)}`;
    tt.style.left = `${e.clientX}px`;
    tt.style.top = `${e.clientY}px`;
    tt.classList.add("show");
  }
  function hideTooltip() {
    tooltipRef.current?.classList.remove("show");
  }

  return (
    <div className="map-card">
      <svg className="map" viewBox="0 0 960 500">
        {paths.map((p) => {
          const estado: Estado = data[p.nombre]?.estado ?? 0;
          const cls = ["country", estado === 1 ? "visited" : estado === 2 ? "pending" : ""]
            .filter(Boolean)
            .join(" ");
          return (
            <path
              key={p.nombre}
              ref={(node) => {
                pathsRef.current[p.nombre] = node;
              }}
              d={p.d}
              className={cls}
              onClick={() => onCountryClick(p.nombre)}
              onMouseMove={(e) => showTooltip(e, p.nombre, estado)}
              onMouseLeave={hideTooltip}
            >
              <title>{p.nombre}</title>
            </path>
          );
        })}
      </svg>
      <div ref={tooltipRef} className="tooltip" />
    </div>
  );
}
