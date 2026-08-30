# XOS - Estructura Ofensiva

## Arquitectura General

### Componentes
- **`components/XOs/XOs.tsx`** — Wrapper principal
- **`components/XOs/TacticsExplorer.tsx`** — Interfaz de exploración (tabs, navegación, modales)
- **`components/XOs/TacticDiagrams.tsx`** — Renderización de diagramas
- **`lib/tactics/offensive-content.ts`** — Base de datos de conceptos ofensivos

---

## Estructura de Datos - Interfaz TacticConcept

```typescript
interface TacticConcept {
  id: string;                    // ID único (ej: "personnel-11")
  name: string;                  // Nombre del concepto (ej: "11 Personnel")
  category: string;              // Categoría (ver abajo)
  categoryLabel: string;         // Label en español (ej: "Personal")
  definition: string;            // Definición en español (párrafo)
  strengths: string[];           // Array de fortalezas (bullets)
  weaknesses: string[];          // Array de debilidades (bullets)
  idealFor: string;              // Descripción de cuándo usarlo
  diagram?: string;              // ID del diagrama (ej: "personnel-11")
}
```

---

## Categorías Ofensivas

### 1. **Personnel** 👥
Agrupaciones de jugadores en el backfield.

**Ejemplos:**
- `personnel-11`: 1 RB, 1 TE, 3 WR (más común en NFL)
- `personnel-12`: 1 RB, 2 TE, 2 WR (poder)
- `personnel-21`: 2 RB, 1 TE, 2 WR (balance)
- `personnel-10`: 1 RB, 0 TE, 4 WR (spread)
- `personnel-30`: 3 RB, 0 TE, 2 WR (puro poder)
- `personnel-20`: 2 RB, 0 TE, 3 WR (sin tight end)

---

### 2. **Formaciones** 📐
Alineaciones base (cómo se disponen verticalmente).

**Ejemplos:**
- `formations-i`: I-formation (RB directo detrás del QB)
- `formations-shotgun`: Shotgun (QB recibe snap a distancia)
- `formations-pistol`: Pistol (QB a media distancia)
- `formations-wildcat`: Wildcat (QB no toca el balón)
- `formations-trips`: Trips (3 WR al mismo lado)
- `formations-empty`: Empty (5 receptores, sin RB)

**Nota:** Personnel + Formación = descripta pre-snap

---

### 3. **Gap Scheme** 🔲
Sistema de asignación de gaps (espacios entre O-linemen).

**Ejemplos:**
- `gap-power`: Power Run (dos bloqueadores al mismo punto)
- `gap-inside-zone`: Inside Zone (bloqueo combinado en gaps interiores)
- `gap-outside-zone`: Outside Zone (horizontalidad, busca perimetral)
- `gap-stretch`: Stretch Run (más horizontal que zone, busca perimetral)
- `gap-counter`: Counter (engaño: bloqueo va opuesto a dirección de carrera)
- `gap-trap`: Trap (un O-lineman "caza" a defensor)
- `gap-lead`: Lead (RB atrás bloquea en dirección de carrera)

---

### 4. **Conceptos Aéreos** 📡
Rutas de receptores y progresiones de pase.

**Ejemplos:**
- `aerial-slants`: Slants (rutas rápidas hacia adentro, 2-3 yardas)
- `aerial-stick`: Stick Route (receptor perpendicular a línea, zona media)
- `aerial-out`: Out Routes (dirección de adentro hacia afuera, 10-12 yardas)
- `aerial-dig`: Dig Routes (receptor corre vertical luego sale a zona media)
- `aerial-deep-cross`: Deep Cross (cruce profundo, 20+ yardas)
- `aerial-four-verts`: Four Verts (cuatro receptores verticales, busca profundidad)
- `aerial-mesh`: Mesh (dos receptores cruzan, confunde coverage)
- `aerial-spacing`: Spacing Routes (receptores en espacio vacío, busca receiver open)
- `aerial-rpo`: RPO (Run-Pass Option: QB decide en snap si corre o pasa)

---

### 5. **Conceptos Terrestres** 🏃
Tipos de carreras y power runs.

**Ejemplos:**
- `ground-dive`: Dive (carrera directa, muy corta distancia)
- `ground-pitch`: Pitch (lateral rápido del QB al RB)
- `ground-toss`: Toss (igual que pitch, nombre alternativo)
- `ground-tosser`: Tosser (RB que prefiere recibir toss)
- `ground-smash-mouth`: Smash Mouth (poder puro, 1-2 yardas)
- `ground-power-running`: Power Running (sistema de poder sostenido)
- `ground-read-option`: Read Option (QB lee defensor, decide corre/entrega)
- `ground-split-veer`: Split Veer (opción bifurcada, versión modificada de veer)

---

### 6. **Protecciones** 🛡️
Esquemas de defensa de QB contra presión.

**Ejemplos:**
- `protections-max-protect`: Max Protect (máxima cantidad de bloqueadores, sacrifica opciones pase)
- `protections-zone-blocking`: Zone Blocking (bloqueadores trabajan área, no hombre específico)
- `protections-man-blocking`: Man Blocking (cada bloqueador asignado a hombre específico)
- `protections-slide-protection`: Slide Protection (línea se desliza hacia un lado)
- `protections-hot-routes`: Hot Routes (receptor sale rápido si se abre presión)
- `protections-chip-block`: Chip Block (TE/RB bloquea primero luego sale como receptor)
- `protections-half-slide`: Half Slide (parte de la línea hace slide, parte hace hombre)

---

### 7. **Sistemas Ofensivos** 🎯
Filosofías de equipo (cómo juega el equipo ofensivamente).

**Ejemplos:**
- `sistemas-west-coast`: West Coast Offense (pase corto-intermedio, ritmo de construcción, pase antes que carrera)
- `sistemas-air-raid`: Air Raid Offense (pase explosivo, muchas opciones de pase)
- `sistemas-pro-style`: Pro Style (equilibrio pass/run, flexibilidad personnel)
- `sistemas-run-first`: Run-First Offense (énfasis en carrera, pase complementario)
- `sistemas-hurry-up`: Hurry-Up Offense (tempo rápido, confunde defensa)
- `sistemas-power-running`: Power Running System (carreras de poder coordinadas)
- `sistemas-spread`: Spread Offense (espaciamiento, pase vertical, aislamiento 1v1)

---

## Estructura de Carpeta

```
lib/tactics/
├── offensive-content.ts          ← Array de TacticConcept[]
└── defensive-content.ts          ← Para defensiva (similar estructura)

components/XOs/
├── XOs.tsx                        ← Wrapper wrapper
├── TacticsExplorer.tsx            ← Lógica principal (tabs, búsqueda, navegación)
├── TacticDiagrams.tsx             ← Componente de diagrama (renderización)
├── PlayDiagrams.tsx               ← Diagramas de jugadas (si es necesario)
└── XosDiagrams.tsx                ← Más diagramas
```

---

## Flujo de Datos

1. **User selecciona tab** "Ofensiva"
2. **TacticsExplorer** carga `offensiveContent` array
3. **User selecciona categoría** (ej: "Personnel")
4. **Filtrado** por categoría (category === "personnel")
5. **User clickea concepto** (ej: "11 Personnel")
6. **Modal abre** mostrando:
   - Nombre, definición, fortalezas, debilidades, ideal-para
   - Diagrama (si existe)
   - Navegación next/prev por conceptos

---

## Ejemplo: Cómo Agregar un Concepto

```typescript
{
  id: "personnel-02",
  name: "02 Personnel (0 RB, 2 TE, 3 WR)",
  category: "personnel",
  categoryLabel: "Personal",
  definition: "Descripción del concepto...",
  strengths: [
    "Beneficio 1",
    "Beneficio 2",
  ],
  weaknesses: [
    "Debilidad 1",
    "Debilidad 2",
  ],
  idealFor: "Cuándo usarlo...",
  diagram: "personnel-02", // Opcional
}
```

**Agregarlo a:** `offensive-content.ts` → array `offensiveContent`

---

## Categorías Disponibles

| ID | Label | Icon | Description |
|---|---|---|---|
| personnel | Personal | 👥 | Agrupaciones de jugadores |
| formations | Formaciones | 📐 | Alineaciones base |
| gap-scheme | Gap Scheme | 🔲 | Sistema de gaps |
| aerial | Conceptos Aéreos | 📡 | Rutas y pases |
| ground | Conceptos Terrestres | 🏃 | Carreras |
| protections | Protecciones | 🛡️ | Defensa de QB |
| sistemas | Sistemas Ofensivos | 🎯 | Filosofías de equipo |

---

## Notas de Implementación

- **Todos los textos** deben estar en español
- **Diagrams** son opcionales (campo `diagram?`)
- **Array order** determina orden en UI (no hay sorting)
- **ID único** es requerido para navegación
- **Strengths/weaknesses** son arrays de strings (bullets en UI)

---

## Para Descargar/Exportar

1. Abrir `lib/tactics/offensive-content.ts`
2. Copiar array `offensiveContent`
3. Pegar en archivo `.json` o mantener como `.ts`

**Archivo JSON (si deseas):**
```json
{
  "version": "1.0",
  "category": "offensive",
  "concepts": [ ... ]
}
```

---

## Contacto/Referencia

- Componente principal: `components/XOs/TacticsExplorer.tsx`
- Datos: `lib/tactics/offensive-content.ts`
- Diagrama: `components/XOs/TacticDiagrams.tsx`
