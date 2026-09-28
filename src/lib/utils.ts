import type { DatosApp } from "./types";

export function exportarJSON(data: DatosApp, filename = "atlas-de-sellos.json") {
  const payload = { version: 1, exportedAt: new Date().toISOString(), data };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importarJSON(file: File): Promise<DatosApp> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === "object" && parsed.data) {
          resolve(parsed.data as DatosApp);
        } else {
          reject(new Error("El archivo no tiene el formato esperado"));
        }
      } catch {
        reject(new Error("No se pudo leer el archivo"));
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsText(file);
  });
}
