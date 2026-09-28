"use client";

import { useMemo, useState } from "react";
import { CONTINENTES } from "@/lib/types";
import type { TripConAtributos } from "@/lib/types";

interface Props {
  trips: TripConAtributos[];
  onEditPais: (nombre: string) => void;
}

export default function TripList({ trips, onEditPais }: Props) {
  const [filtro, setFiltro] = useState<string>("todos");
  const filtered = useMemo(
    () => trips.filter((t) => filtro === "todos" || t.continente === filtro),
    [trips, filtro]
  );

  return (
    <div className="section">
      <div className="section-head">
        <h2>Historial de viajes</h2>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="todos">Todos los continentes</option>
          {CONTINENTES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="trip-list">
        {filtered.length === 0 && (
          <div className="empty">Todavía no hay viajes cargados en esta categoría.</div>
        )}
        {filtered.map((t) => (
          <div key={`${t.pais}-${t.id}`} className="trip-row">
            <div className="trip-main">
              <div className="top">
                <span className="year">{t.anio}</span>
                <span className="pais">{t.pais}</span>
              </div>
              <div className="ciudades">{t.ciudades.join(", ")}</div>
              {t.nota && <div className="nota">&quot;{t.nota}&quot;</div>}
            </div>
            <div className="row-actions">
              <button className="icon-btn" title="Editar" onClick={() => onEditPais(t.pais)}>
                ✎
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
