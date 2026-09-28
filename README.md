# Atlas de Sellos

Tracker de viajes: mapa del mundo interactivo (SVG generado con d3-geo a partir de geometría real de países) para marcar países como visitados/pendientes, cargar viajes (ciudades, año, nota) y ver estadísticas y gráficos.

Proyecto de práctica de Zentenio (metodología de vibe coding de Matías Heluani). Ver `../CLAUDE.md` para las convenciones generales de esta carpeta.

## Desarrollo

```bash
npm install
npm run dev
```

## Datos

Todo el estado vive en memoria (`useState`). No hay backend ni `localStorage`. Se persiste manualmente exportando/importando un archivo JSON (mismo formato que la versión artifact).
