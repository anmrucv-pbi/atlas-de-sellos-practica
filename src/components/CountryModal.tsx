"use client";

import { useEffect, useState } from "react";
import type { RegistroPais } from "@/lib/types";

interface Props {
  pais: string | null;
  registro: RegistroPais | undefined;
  onClose: () => void;
  onDeleteViaje: (id: number) => void;
  onAddViaje: (viaje: { ciudades: string[]; anio: number; nota: string }) => void;
  toast: (msg: string) => void;
}

export default function CountryModal({ pais, registro, onClose, onDeleteViaje, onAddViaje, toast }: Props) {
  const [chips, setChips] = useState<string[]>([]);
  const [chipInput, setChipInput] = useState("");
  const [anio, setAnio] = useState("");
  const [nota, setNota] = useState("");

  useEffect(() => {
    setChips([]);
    setChipInput("");
    setAnio("");
    setNota("");
  }, [pais]);

  useEffect(() => {
    if (!pais) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pais, onClose]);

  if (!pais) return null;

  function handleChipKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = chipInput.trim();
      if (val) {
        setChips((c) => [...c, val]);
        setChipInput("");
      }
    } else if (e.key === "Backspace" && !chipInput && chips.length) {
      setChips((c) => c.slice(0, -1));
    }
  }

  function handleGuardar() {
    let finalChips = chips;
    if (chipInput.trim()) {
      finalChips = [...chips, chipInput.trim()];
    }
    const anioNum = parseInt(anio, 10);
    if (!finalChips.length) {
      toast("Cargá al menos una ciudad");
      return;
    }
    if (!anioNum || anioNum < 1900 || anioNum > 2100) {
      toast("Ingresá un año válido");
      return;
    }
    onAddViaje({ ciudades: finalChips, anio: anioNum, nota: nota.trim() });
    setChips([]);
    setChipInput("");
    setAnio("");
    setNota("");
    toast("Viaje guardado");
  }

  const viajesOrdenados = [...(registro?.viajes ?? [])].sort((a, b) => b.anio - a.anio);

  return (
    <div
      className="overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h3>{pais}</h3>
          <button className="close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="trip-list">
          {viajesOrdenados.length === 0 && (
            <div className="empty">Todavía no cargaste viajes a este país.</div>
          )}
          {viajesOrdenados.map((v) => (
            <div key={v.id} className="trip-row">
              <div className="trip-main">
                <div className="top">
                  <span className="year">{v.anio}</span>
                </div>
                <div className="ciudades">{v.ciudades.join(", ")}</div>
                {v.nota && <div className="nota">&quot;{v.nota}&quot;</div>}
              </div>
              <div className="row-actions">
                <button className="icon-btn" title="Eliminar" onClick={() => onDeleteViaje(v.id)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div className="field">
            <label>Ciudades</label>
            <div className="chip-box">
              {chips.map((c, i) => (
                <span key={i} className="chip">
                  {c}
                  <button onClick={() => setChips((cs) => cs.filter((_, idx) => idx !== i))}>&times;</button>
                </span>
              ))}
              <input
                className="chip-input"
                value={chipInput}
                onChange={(e) => setChipInput(e.target.value)}
                onKeyDown={handleChipKeyDown}
                placeholder="Escribí una ciudad y Enter"
              />
            </div>
          </div>
          <div className="field">
            <label>Año</label>
            <input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} placeholder="2024" />
          </div>
          <div className="field">
            <label>Nota</label>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="¿Qué tal estuvo?" />
          </div>
          <button className="btn" onClick={handleGuardar}>
            Agregar viaje
          </button>
        </div>
      </div>
    </div>
  );
}
