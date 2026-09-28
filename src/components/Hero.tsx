"use client";

import { useEffect, useRef, useState } from "react";
import type { CountryFeature, DatosApp, Estado } from "@/lib/types";
import { estadoLabel } from "@/lib/types";

interface Counters {
  paises: number;
  ciudades: number;
  continentes: number;
  pct: number;
}

interface Props {
  data: DatosApp;
  features: CountryFeature[];
  counters: Counters;
  onCycleEstado: (nombre: string) => void;
  onOpenModal: (nombre: string) => void;
  onReset: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onSearchPick: (nombre: string) => void;
}

export default function Hero({
  data,
  features,
  counters,
  onCycleEstado,
  onOpenModal,
  onReset,
  onExport,
  onImportFile,
  onSearchPick,
}: Props) {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pickedNombre, setPickedNombre] = useState<string | null>(null);
  const [resetConfirming, setResetConfirming] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allNames = features.map((f) => f.properties.name_es).sort((a, b) => a.localeCompare(b));
  const q = query.trim().toLowerCase();
  const matches = q ? allNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 8) : [];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function pick(nombre: string) {
    setPickedNombre(nombre);
    setQuery("");
    setDropdownOpen(false);
    onSearchPick(nombre);
  }

  function handleReset() {
    if (!resetConfirming) {
      setResetConfirming(true);
      resetTimer.current = setTimeout(() => setResetConfirming(false), 3000);
    } else {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setResetConfirming(false);
      setPickedNombre(null);
      onReset();
    }
  }

  const pickedEstado: Estado = pickedNombre ? data[pickedNombre]?.estado ?? 0 : 0;

  return (
    <div className="hero">
      <div className="pct-row">
        <div>
          <div className="pct">{counters.pct === 0 ? "0" : counters.pct.toFixed(1)}%</div>
          <div className="pct-label">DEL MUNDO VISITADO</div>
        </div>
        <button className={`reset-btn${resetConfirming ? " confirming" : ""}`} onClick={handleReset}>
          {resetConfirming ? "¿Seguro? Tocá de nuevo" : "Empezar de cero"}
        </button>
      </div>

      <div className="counters">
        <div className="counter">
          <b>{counters.paises}</b>
          <span>Países</span>
        </div>
        <div className="counter">
          <b>{counters.ciudades}</b>
          <span>Ciudades</span>
        </div>
        <div className="counter">
          <b>{counters.continentes}</b>
          <span>Continentes</span>
        </div>
      </div>

      <div className="legend">
        <span>
          <i className="swatch" style={{ background: "var(--unvisited)", border: "1.4px solid var(--unvisited-border)" }} />
          Sin visitar
        </span>
        <span>
          <i className="swatch" style={{ background: "var(--visited)" }} />
          Visitado
        </span>
        <span>
          <i className="swatch" style={{ background: "var(--pending-fill)", border: "1.4px dashed var(--pending)" }} />
          Pendiente
        </span>
      </div>

      <div className="search-wrap" ref={wrapRef}>
        <div className="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            type="text"
            placeholder="Buscar país..."
            autoComplete="off"
          />
        </div>
        <div className={`dropdown${dropdownOpen && matches.length ? " open" : ""}`}>
          {matches.map((n) => (
            <div key={n} className="dropdown-item" onClick={() => pick(n)}>
              <span>{n}</span>
              <small>{estadoLabel(data[n]?.estado ?? 0)}</small>
            </div>
          ))}
        </div>
      </div>

      {pickedNombre && (
        <div className="picked show">
          <div>
            <span className="name">{pickedNombre}</span>{" "}
            <span
              className="badge"
              style={
                pickedEstado === 1
                  ? { background: "var(--visited)", color: "#1a1206" }
                  : pickedEstado === 2
                  ? { background: "var(--pending-fill)", color: "var(--ink)", border: "1px dashed var(--pending)" }
                  : { background: "var(--unvisited)", color: "var(--ink-soft)", border: "1px solid var(--unvisited-border)" }
              }
            >
              {estadoLabel(pickedEstado)}
            </span>
          </div>
          <div className="actions">
            <button className="btn-mini" onClick={() => onCycleEstado(pickedNombre)}>
              Cambiar estado
            </button>
            <button className="btn-mini" onClick={() => onOpenModal(pickedNombre)}>
              Abrir panel
            </button>
          </div>
        </div>
      )}

      <div className="data-actions">
        <button className="btn" onClick={onExport}>
          Exportar JSON
        </button>
        <button className="btn secondary" onClick={() => fileInputRef.current?.click()}>
          Importar JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
