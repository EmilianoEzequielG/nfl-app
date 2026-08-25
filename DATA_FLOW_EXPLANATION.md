# 📊 FLUJO DE DATOS - Power Ranking

**Pregunta:** ¿Cómo llegan los datos reales desde JSON hasta el modal?

---

## 🔄 DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (Browser)                          │
│                                                                 │
│  PowerRanking.tsx                                              │
│  ├─ useState(selectedTeam)  ← Equipo seleccionado              │
│  ├─ useState(currentWeek)   ← Semana navegada                  │
│  └─ useEffect(() => loadRankings())                            │
│                    │                                            │
│                    ▼                                            │
│  fetch(`/api/power-ranking?week=${currentWeek}`)               │
│                    │                                            │
└────────────────────┼────────────────────────────────────────────┘
                     │ HTTP GET
                     │ Parámetro: week=1 (1-18)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE (Servidor)                         │
│                                                                 │
│  app/api/power-ranking/route.ts                                │
│  ├─ GET(request) {                                             │
│  │   const week = request.nextUrl.searchParams.get("week")     │
│  │                                                             │
│  │   // IMPORTACIONES DE JSON                                 │
│  │   import offense_season.json  ◄──────┐                     │
│  │   import defense_season.json  ◄──────┼─ Datos estáticos   │
│  │   import epa_percentile_by_week.json ◄┘ del proyecto      │
│  │                                                             │
│  │   // MAPEOS PARA BÚSQUEDA RÁPIDA                          │
│  │   offenseLookup = Map(team → offense data)                │
│  │   defenseLookup = Map(team → defense data)                │
│  │   epaWeeklyLookup = Map(team-w{week} → epa data)         │
│  │                                                             │
│  │   // PARA CADA EQUIPO EN DEFAULT_RANKINGS (32)            │
│  │   for each team {                                          │
│  │     offenseMetrics = offenseLookup.get(team)               │
│  │     defenseMetrics = defenseLookup.get(team)               │
│  │     epaWeekly = epaWeeklyLookup.get(`${team}-w${week}`)  │
│  │                                                             │
│  │     metrics = {                                            │
│  │       epaOffensePercentile: epaWeekly.percentil_ofensivo, │
│  │       epaDefensePercentile: epaWeekly.percentil_defensivo,│
│  │       epaOffense: offenseMetrics.total_epa,               │
│  │       epaDefense: defenseMetrics.total_epa_allowed,       │
│  │       sacksAllowed: offenseMetrics.sacks_allowed,         │
│  │       sacksGenerated: defenseMetrics.sacks_generated,     │
│  │       ...más campos...                                    │
│  │     }                                                      │
│  │   }                                                         │
│  │                                                             │
│  │   return NextResponse.json(rankings)  ◄── Array[32]       │
│  └─                                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                     ▲ HTTP 200 + JSON
                     │
                     └─ Response = [
                        {
                          id: "KC",
                          name: "Kansas City Chiefs",
                          calculatedRank: 1,
                          record: "11-3",
                          color: "#E31828",
                          epa: 5.0859,
                          metrics: {
                            epaOffensePercentile: 80.6,
                            epaDefensePercentile: 0,
                            epaOffense: 35.399,
                            epaDefense: -19.784,
                            sacksAllowed: 47,
                            sacksGenerated: 35,
                            ...
                          }
                        },
                        ... [31 más] ...
                       ]
                       
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Continuación)                       │
│                                                                 │
│  const [rankings, setRankings] = useState(data)  ◄── Almacena │
│                                                                 │
│  Renderiza lista de equipos:                                   │
│  rankings.map(team => (                                        │
│    <button onClick={() => setSelectedTeam(team)}>             │
│      {team.name} - Rank #{team.calculatedRank}                │
│    </button>                                                   │
│  ))                                                             │
│                                                                 │
│  Cuando usuario hace click → selectedTeam = team data          │
│                                                                 │
│  Modal abre:                                                   │
│  ├─ Wordmark: `/wordmarks/${selectedTeam.id}.png`             │
│  ├─ Nombre/Rank: ${selectedTeam.name} #${selectedTeam.calculatedRank}
│  ├─ Record: ${selectedTeam.record}                            │
│  └─ Métricas via MetricsSingleTeam:                           │
│     <MetricsSingleTeam                                        │
│       teamName={selectedTeam.name}                            │
│       teamColor={selectedTeam.color}                          │
│       metrics={selectedTeam.metrics}                          │
│     />                                                         │
│                                                                 │
│  MetricsSingleTeam.tsx:                                        │
│  ├─ Recibe: metrics object con campos reales                  │
│  ├─ Renderiza 3 secciones:                                    │
│  │  1. 📊 EPA Percentile (vs 50% liga)                        │
│  │  2. 🏈 EPA Total (vs 0 liga)                               │
│  │  3. ⚡ Turnovers & Pressure (vs avg liga)                  │
│  ├─ Cada métrica muestra barra con color dinámico             │
│  └─ Verde si arriba de promedio, rojo si abajo               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📍 EJEMPLO PRÁCTICO: KC CHIEFS

### Paso 1: Usuario abre Power Ranking (Week 1)
```javascript
// PowerRanking.tsx - useEffect
loadRankings()
fetch("/api/power-ranking?week=1")  // ◄── Parámetro: week=1
```

### Paso 2: API procesa
```javascript
// route.ts
const week = 1  // Extracted from query params

// Busca KC en los JSONs:
offenseMetrics = offenseLookup.get("KC")
  // Resultado: { team: "KC", total_epa: 35.399, sacks_allowed: 47, ... }

defenseMetrics = defenseLookup.get("KC")
  // Resultado: { team: "KC", total_epa_allowed: -19.784, sacks_generated: 35, ... }

epaWeekly = epaWeeklyLookup.get("KC-w1")
  // Resultado: { team: "KC", week: 1, percentil_ofensivo: 80.6, percentil_defensivo: 0, ... }
```

### Paso 3: API arma metrics object
```javascript
metrics = {
  epaOffensePercentile: 80.6,        // Directo de epaWeekly
  epaDefensePercentile: 0,           // Directo de epaWeekly
  epaOffense: 35.399,                // Directo de offenseMetrics
  epaDefense: -19.784,               // Directo de defenseMetrics
  sacksAllowed: 47,                  // Directo de offenseMetrics
  sacksGenerated: 35,                // Directo de defenseMetrics
  turnoverDriveRateOffense: 0.088,   // Calculado: turnovers / drives
}
```

### Paso 4: Cliente recibe y renderiza
```javascript
// PowerRanking.tsx
setRankings(data)  // data = [{ id: "KC", metrics: {...}, ... }, ...]

// Usuario hace click en KC
setSelectedTeam(rankings[0])

// Modal abre con:
<Image src="/wordmarks/KC.png" />
<MetricsSingleTeam 
  teamName="Kansas City Chiefs"
  teamColor="#E31828"
  metrics={{
    epaOffensePercentile: 80.6,
    epaDefensePercentile: 0,
    epaOffense: 35.399,
    epaDefense: -19.784,
    sacksAllowed: 47,
    sacksGenerated: 35,
  }}
/>
```

### Paso 5: MetricsSingleTeam renderiza
```
📊 EPA Percentile
  Ofensivo: 80.6% vs Avg: 50%  → Verde (arriba de promedio)
  Defensivo: 0% vs Avg: 50%    → Rojo (abajo de promedio)

🏈 EPA Total
  Ofensivo: 35.4 vs Avg: 0     → Verde (positivo)
  Defensivo: -19.8 vs Avg: 0   → Rojo (negativo)

⚡ Turnovers & Pressure
  Sacks Allowed: 47 vs Avg: 24 → Rojo (más sacks = malo)
  Sacks Generated: 35 vs Avg: 24 → Amarillo (menos = débil)
```

---

## 📁 FUENTES DE DATOS

### 1. offense_season.json
```json
[
  {
    "team": "KC",
    "total_epa": 35.399,
    "passing_epa": 157.25,
    "rushing_epa": 1.504,
    "sacks_allowed": 47,
    "turnovers": 16,
    "drives_total": 180,
    ...
  },
  ... [31 más] ...
]
```
**Uso:** EPA ofensivo, turnovers, sacks permitidos

### 2. defense_season.json
```json
[
  {
    "team": "KC",
    "total_epa_allowed": -19.784,
    "passing_epa_allowed": -108.687,
    "rushing_epa_allowed": -19.648,
    "sacks_generated": 35,
    "turnovers_forced": 27,
    ...
  },
  ... [31 más] ...
]
```
**Uso:** EPA defensivo, sacks generados, turnovers forzados

### 3. epa_percentile_by_week.json
```json
[
  {
    "team": "KC",
    "season": 2025,
    "week": 1,
    "epa_total": 5.0859,
    "percentil_ofensivo": 80.6,
    "epa_total_allowed": -2.0,
    "percentil_defensivo": 0,
    ...
  },
  ... [541 más entries = 32 teams × 17 weeks] ...
]
```
**Uso:** Percentiles semanales por equipo

---

## 🔑 MAPEO DE DATOS (En el API)

```javascript
// Se crean 3 Maps para búsqueda O(1):

// Map 1: offense_season.json → offenseLookup
offenseLookup = Map {
  "KC" → {team: "KC", total_epa: 35.399, ...},
  "BUF" → {team: "BUF", total_epa: 148.875, ...},
  "SF" → {team: "SF", total_epa: 94.407, ...},
  ... (32 total)
}

// Map 2: defense_season.json → defenseLookup
defenseLookup = Map {
  "KC" → {team: "KC", total_epa_allowed: -19.784, ...},
  "BUF" → {team: "BUF", total_epa_allowed: -13.808, ...},
  "SF" → {team: "SF", total_epa_allowed: 75.455, ...},
  ... (32 total)
}

// Map 3: epa_percentile_by_week.json → epaWeeklyLookup
epaWeeklyLookup = Map {
  "KC-w1" → {team: "KC", week: 1, percentil_ofensivo: 80.6, ...},
  "KC-w2" → {team: "KC", week: 2, percentil_ofensivo: ..., ...},
  ...
  "KC-w17" → {team: "KC", week: 17, percentil_ofensivo: ..., ...},
  "BUF-w1" → {team: "BUF", week: 1, percentil_ofensivo: 93.5, ...},
  ...
  ... (32 × 17 = 544 total)
}
```

---

## ⚙️ CÓMO FUNCIONA LA BÚSQUEDA

```javascript
// Usuario navega a week 5 y hace click en Buffalo Bills

const week = 5
const teamId = "BUF"

// Búsqueda rápida (O(1)):
const offenseData = offenseLookup.get("BUF")
// ✅ Resultado inmediato: {team: "BUF", total_epa: 148.875, ...}

const defenseData = defenseLookup.get("BUF")
// ✅ Resultado inmediato: {team: "BUF", total_epa_allowed: -13.808, ...}

const weeklyData = epaWeeklyLookup.get("BUF-w5")
// ✅ Resultado inmediato: {team: "BUF", week: 5, percentil_ofensivo: ..., ...}

// Construcción de metrics:
metrics = {
  epaOffensePercentile: weeklyData.percentil_ofensivo,  // De w5
  epaDefensePercentile: weeklyData.percentil_defensivo, // De w5
  epaOffense: offenseData.total_epa,                    // Season total
  epaDefense: defenseData.total_epa_allowed,            // Season total
  // ... más campos ...
}
```

---

## 🚀 FLUJO RESUMIDO (3 SEGUNDOS)

1. **Usuario navega Power Ranking** → Click en equipo
2. **PowerRanking.tsx** → `fetch("/api/power-ranking?week=1")`
3. **API route.ts** → Busca en 3 JSONs, arma metrics
4. **API devuelve** → 32 equipos con datos reales
5. **Cliente renderiza** → Modal con wordmark + MetricsSingleTeam
6. **MetricsSingleTeam** → Muestra barras vs promedio liga

---

## ⚠️ PROBLEMAS A MEJORAR MAÑANA

Ver `TOMORROW_API_IMPROVEMENTS.md`

**Resumen:** El flujo actual funciona pero podría ser más claro y eficiente. Mañana reorganizamos.
