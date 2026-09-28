import type { DatosApp } from "./types";

let seq = 1;
function nextId() {
  return seq++;
}

export function crearDatosDeEjemplo(): DatosApp {
  const data: DatosApp = {};

  const visitados: [string, { ciudades: string[]; anio: number; nota: string }[]][] = [
    ["España", [{ ciudades: ["Madrid", "Barcelona"], anio: 2018, nota: "Primer viaje a Europa, nos volvimos locos con la Sagrada Familia." }]],
    ["Italia", [{ ciudades: ["Roma", "Florencia", "Venecia"], anio: 2019, nota: "La pasta en Roma no se olvida más." }]],
    ["Perú", [{ ciudades: ["Cusco", "Machu Picchu"], anio: 2021, nota: "Subimos al amanecer, valió cada paso." }]],
    [
      "Brasil",
      [
        { ciudades: ["Río de Janeiro"], anio: 2022, nota: "Carnaval con amigos de la facu." },
        { ciudades: ["San Pablo"], anio: 2023, nota: "Viaje de laburo, aproveché para conocer." },
      ],
    ],
    ["Tailandia", [{ ciudades: ["Bangkok", "Chiang Mai"], anio: 2023, nota: "Templos y street food todos los días." }]],
    ["Marruecos", [{ ciudades: ["Marrakech", "Fez"], anio: 2022, nota: "El zoco de Marrakech es un mundo aparte." }]],
    ["Estados Unidos", [{ ciudades: ["Nueva York"], anio: 2020, nota: "Año nuevo en Times Square, un caos hermoso." }]],
    ["Nueva Zelanda", [{ ciudades: ["Auckland", "Queenstown"], anio: 2024, nota: "Naturaleza como en ninguna otra parte." }]],
  ];

  visitados.forEach(([nombre, viajes]) => {
    data[nombre] = {
      estado: 1,
      viajes: viajes.map((v) => ({ id: nextId(), ...v })),
    };
  });

  ["Japón", "Portugal"].forEach((nombre) => {
    data[nombre] = { estado: 2, viajes: [] };
  });

  return data;
}

export function proximoIdDesde(data: DatosApp): number {
  let maxId = 0;
  Object.values(data).forEach((rec) => rec.viajes.forEach((v) => (maxId = Math.max(maxId, v.id))));
  return maxId + 1;
}
