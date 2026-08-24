# XoS — Backlog de Conceptos

Acá anotás conceptos nuevos que quieras agregar a la página.
Cuando estés listo, se agregan al archivo de datos correspondiente en `nfl-web/src/lib/`.

---

## Formato para agregar

Cada concepto necesita estos campos según la sección:

### Coberturas → `coverages-data.ts`
- `id`, `label`, `name`, `type` (man/zone/hybrid)
- `definition`, `fieldViz`
- `strengths[]` y `weaknesses[]` — cada uno con `concept` y `text`

### Rutas → `route-concepts-data.ts`
- `id`, `label`, `name`
- `beatsCoverage[]` — qué coberturas ataca
- `definition`, `reads` (lecturas del QB)
- `strengths[]` y `weaknesses[]`

### Carrera → `run-schemes-data.ts`
- `id`, `label`, `name`, `type` (gap/zone)
- `definition`, `keyBlock`
- `strengths[]` y `weaknesses[]`

### Presión → `pressure-data.ts`
- `id`, `label`, `name`, `type` (blitz/stunt/simulated)
- `rushers` (número), `coverageBehind`
- `definition`
- `strengths[]` y `weaknesses[]`

### Situaciones → `situations-data.ts`
- `id`, `label`, `name`, `context`
- `definition`
- `offensiveKeys[]` y `defensiveKeys[]` — cada uno con `name` y `description`

### Glosario → `glossary-data.ts`
- `term`, `category` (ofensivo/defensivo/esquema/situacion/general)
- `definition`

---

## Pendientes

<!-- Anotá acá los conceptos que quieras agregar -->

### Coberturas
- [ ] Pattern Matching — cobertura híbrida, zona que matchea al receptor cuando entra en la zona

### Rutas
- [ ]

### Carrera
- [ ] Jet Sweep / Orbit Motion — carrera perimetral con WR en movimiento pre-snap
- [ ]

### Presión
- [ ] 

### Situaciones
- [ ]

### Glosario
- [ ] Leverage — posición del CB respecto al WR que determina si juega inside o outside
- [ ] Technique (0-Tech, 1-Tech, 3-Tech, 5-Tech) — alineación del DL respecto al OL
- [ ] Bunch / Stack — formaciones con receptores agrupados
- [ ]

---

## Ideas / Secciones futuras

- Jugadas especiales (Special Teams): cobertura de punt, fake punt, onside kick
- Conceptos de protección (max protection, slide protection, BOB)
- Nomenclatura de receivers por posición (X, Y, Z, H, F)
