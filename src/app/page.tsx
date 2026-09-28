"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hero from "@/components/Hero";
import WorldMap from "@/components/WorldMap";
import TripList from "@/components/TripList";
import TripsChart from "@/components/TripsChart";
import CountryModal from "@/components/CountryModal";
import { crearDatosDeEjemplo, proximoIdDesde } from "@/lib/seedData";
import { exportarJSON, importarJSON } from "@/lib/utils";
import { CONTINENTES } from "@/lib/types";
import type {
  CountryFeature,
  CountryFeatureCollection,
  DatosApp,
  Estado,
  TripConAtributos,
} from "@/lib/types";

export default function Home() {
  const [features, setFeatures] = useState<CountryFeature[]>([]);
  const [data, setData] = useState<DatosApp>(() => crearDatosDeEjemplo());
  const [modalPais, setModalPais] = useState<string | null>(null);
  const [searchPick, setSearchPick] = useState<{ name: string; token: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextIdRef = useRef<number | null>(null);
  if (nextIdRef.current === null) {
    nextIdRef.current = proximoIdDesde(data);
  }

  useEffect(() => {
    fetch("/countries.json")
      .then((r) => r.json())
      .then((geo: CountryFeatureCollection) => {
        const continentesValidos: readonly string[] = CONTINENTES;
        const filtered = geo.features.filter((f) => continentesValidos.includes(f.properties.continent));
        setFeatures(filtered);
      })
      .catch(() => showToast("No se pudo cargar el mapa"));
  }, []);

  const nameToContinent = useMemo(() => {
    const m = new Map<string, string>();
    features.forEach((f) => m.set(f.properties.name_es, f.properties.continent));
    return m;
  }, [features]);

  const totalPaises = features.length;

  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }

  function cycleEstado(nombre: string) {
    const rec = data[nombre] ?? { estado: 0 as Estado, viajes: [] };
    const nuevoEstado = ((rec.estado + 1) % 3) as Estado;
    setData((prev) => ({
      ...prev,
      [nombre]: { ...(prev[nombre] ?? { estado: 0, viajes: [] }), estado: nuevoEstado },
    }));
    if (nuevoEstado === 1) {
      setModalPais(nombre);
    }
  }

  function handleAddViaje(pais: string, viaje: { ciudades: string[]; anio: number; nota: string }) {
    setData((prev) => {
      const rec = prev[pais] ?? { estado: 0 as Estado, viajes: [] };
      const id = nextIdRef.current!++;
      return { ...prev, [pais]: { estado: 1, viajes: [...rec.viajes, { id, ...viaje }] } };
    });
  }

  function handleDeleteViaje(pais: string, id: number) {
    setData((prev) => {
      const rec = prev[pais];
      if (!rec) return prev;
      return { ...prev, [pais]: { ...rec, viajes: rec.viajes.filter((v) => v.id !== id) } };
    });
    showToast("Viaje eliminado");
  }

  function handleReset() {
    setData({});
    nextIdRef.current = 1;
    setModalPais(null);
    showToast("Empezaste de cero");
  }

  function handleExport() {
    exportarJSON(data);
    showToast("JSON exportado");
  }

  function handleImportFile(file: File) {
    importarJSON(file)
      .then((imported) => {
        setData(imported);
        nextIdRef.current = proximoIdDesde(imported);
        setModalPais(null);
        showToast("Datos importados");
      })
      .catch((err: Error) => showToast(err.message));
  }

  function handleSearchPick(nombre: string) {
    setSearchPick({ name: nombre, token: Date.now() });
  }

  const allTrips: TripConAtributos[] = useMemo(() => {
    const list: TripConAtributos[] = [];
    Object.entries(data).forEach(([nombre, rec]) => {
      if (rec.estado !== 1) return;
      const continente = nameToContinent.get(nombre) ?? "";
      rec.viajes.forEach((v) => list.push({ ...v, pais: nombre, continente }));
    });
    list.sort((a, b) => b.anio - a.anio || a.pais.localeCompare(b.pais));
    return list;
  }, [data, nameToContinent]);

  const counters = useMemo(() => {
    const visitados = Object.entries(data).filter(([, r]) => r.estado === 1);
    const ciudadesSet = new Set<string>();
    const continentesSet = new Set<string>();
    visitados.forEach(([nombre, rec]) => {
      const continente = nameToContinent.get(nombre);
      if (continente) continentesSet.add(continente);
      rec.viajes.forEach((v) => v.ciudades.forEach((c) => ciudadesSet.add(c.trim().toLowerCase())));
    });
    const pct = totalPaises ? (visitados.length / totalPaises) * 100 : 0;
    return { paises: visitados.length, ciudades: ciudadesSet.size, continentes: continentesSet.size, pct };
  }, [data, nameToContinent, totalPaises]);

  return (
    <div className="wrap">
      <div>
        <div className="eyebrow">Atlas de Sellos</div>
        <h1>Tracker de viajes</h1>
        <div className="sub">
          Tocá un país en el mapa para marcarlo: sin visitar → visitado → pendiente → sin visitar. Al
          marcarlo como visitado se abre el panel para cargar el viaje.
        </div>
      </div>

      <Hero
        data={data}
        features={features}
        counters={counters}
        onCycleEstado={cycleEstado}
        onOpenModal={setModalPais}
        onReset={handleReset}
        onExport={handleExport}
        onImportFile={handleImportFile}
        onSearchPick={handleSearchPick}
      />

      <WorldMap features={features} data={data} onCountryClick={cycleEstado} searchPick={searchPick} />

      <TripList trips={allTrips} onEditPais={setModalPais} />

      <TripsChart trips={allTrips} />

      <div className="note">
        Los datos viven en memoria y se guardan solo al exportar. No te olvides de descargar el JSON antes
        de cerrar.
      </div>

      <CountryModal
        pais={modalPais}
        registro={modalPais ? data[modalPais] : undefined}
        onClose={() => setModalPais(null)}
        onDeleteViaje={(id) => modalPais && handleDeleteViaje(modalPais, id)}
        onAddViaje={(v) => modalPais && handleAddViaje(modalPais, v)}
        toast={showToast}
      />

      <div className={`toast${toastMsg ? " show" : ""}`}>{toastMsg ?? ""}</div>
    </div>
  );
}
