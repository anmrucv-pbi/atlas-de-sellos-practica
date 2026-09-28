export type Estado = 0 | 1 | 2; // 0 sin visitar, 1 visitado, 2 pendiente

export interface Viaje {
  id: number;
  ciudades: string[];
  anio: number;
  nota: string;
}

export interface RegistroPais {
  estado: Estado;
  viajes: Viaje[];
}

export type DatosApp = Record<string, RegistroPais>;

export interface CountryFeature {
  type: "Feature";
  properties: {
    name: string;
    name_es: string;
    continent: string;
  };
  geometry: GeoJSON.Geometry;
}

export interface CountryFeatureCollection {
  type: "FeatureCollection";
  features: CountryFeature[];
}

export interface TripConAtributos extends Viaje {
  pais: string;
  continente: string;
}

export const CONTINENTES = ["América", "Europa", "Asia", "África", "Oceanía"] as const;
export type Continente = (typeof CONTINENTES)[number];

export function estadoLabel(estado: Estado): string {
  return estado === 1 ? "Visitado" : estado === 2 ? "Pendiente" : "Sin visitar";
}
