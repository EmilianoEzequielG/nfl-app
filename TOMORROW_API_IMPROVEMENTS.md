# 🔧 MEJORAS API - AGENDA PARA MAÑANA
**Fecha:** 2026-08-24  
**Responsable:** User  
**Estado:** Pendiente

---

## 🎯 OBJETIVO
Mejorar claridad y eficiencia del endpoint `/api/power-ranking` para que sea más fácil entender y mantener.

---

## ❓ PROBLEMA ACTUAL

El flujo actual funciona, pero tiene algunos puntos confusos:

### 1. **Mapeos complejos sin comentarios**
```javascript
// Actual (confuso):
const epaWeeklyLookup = new Map(
  epaData.map((d) => [`${d.team}-w${d.week}`, d])
);
```
**Problema:** ¿Por qué `team-w${week}`? ¿Qué es `epaData`?  
**Solución:** Comentarios explicativos + nombres más claros

### 2. **Búsqueda manual sin validación**
```javascript
// Actual:
const epaWeekly = epaWeeklyLookup.get(`${calc.teamId}-w${week}`);
```
**Problema:** ¿Qué pasa si no existe el dato? ¿Fallback silencioso?  
**Solución:** Logging + fallbacks explícitos

### 3. **Cálculos inline sin claridad**
```javascript
// Actual:
turnoverDriveRateOffense: offenseMetrics?.turnovers ? 
  offenseMetrics.turnovers / (offenseMetrics.drives_total || 1) : 0,
```
**Problema:** ¿Qué es `drives_total`? ¿Por qué dividir por 1 si no existe?  
**Solución:** Función helper + documentación

### 4. **Respuesta inconsistente**
```javascript
// Actual:
epaOffensePercentile: epaWeekly?.percentil_ofensivo ?? offenseMetrics?.pass_epa_adj_z ?? 50,
```
**Problema:** 3 niveles de fallback, pero ¿cuál se usa realmente?  
**Solución:** Priorización clara: weekly > season > default

### 5. **Datos de season mezclados con weekly**
```javascript
// Actual (confuso):
epaOffense: offenseMetrics?.total_epa ?? 0,  // Season
epaOffensePercentile: epaWeekly?.percentil_ofensivo ?? 50,  // Weekly
```
**Problema:** Sin claridad en la diferencia conceptual  
**Solución:** Separar en secciones: `offensiveMetrics` vs `weeklySnapshot`

---

## ✅ MEJORAS PROPUESTAS

### Cambio 1: Refactorizar función principal
```javascript
// ANTES:
export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get("week");
  const offenseData = offenseSeasonData;
  const rankings = DEFAULT_RANKINGS.map((calc) => { /* 20 líneas */ });
  return NextResponse.json(rankings);
}

// DESPUÉS:
export async function GET(request: NextRequest) {
  try {
    const week = parseWeekParam(request);
    const lookups = initializeLookups();
    const rankings = buildRankingsWithRealData(DEFAULT_RANKINGS, week, lookups);
    return NextResponse.json(rankings);
  } catch (error) {
    return handleApiError(error);
  }
}

// Funciones helper:
function initializeLookups() { /* */}
function buildRankingsWithRealData() { /* */}
function parseWeekParam() { /* */}
function handleApiError() { /* */}
```

**Ventaja:** Cada función tiene una responsabilidad clara

### Cambio 2: Crear tipos TypeScript para datos
```typescript
// types/power-ranking.ts
interface OffenseMetrics {
  team: string;
  total_epa: number;
  passing_epa: number;
  rushing_epa: number;
  sacks_allowed: number;
  turnovers: number;
  drives_total: number;
}

interface DefenseMetrics {
  team: string;
  total_epa_allowed: number;
  sacks_generated: number;
  turnovers_forced: number;
}

interface EPAPercentileWeekly {
  team: string;
  week: number;
  percentil_ofensivo: number;
  percentil_defensivo: number;
  epa_total: number;
}

interface PowerRankingMetrics {
  weekly: {
    epaOffensePercentile: number;
    epaDefensePercentile: number;
  };
  season: {
    epaOffense: number;
    epaDefense: number;
  };
  derived: {
    turnoverRateOffense: number;
    turnoverRateDefense: number;
    sacksAllowed: number;
    sacksGenerated: number;
  };
}
```

**Ventaja:** TypeScript puede validar tipos, evita bugs

### Cambio 3: Logging para debugging
```javascript
// En route.ts:
function buildRankingsWithRealData(rankings, week, lookups) {
  const results = [];
  
  for (const rank of rankings) {
    console.log(`[Power Ranking] Processing ${rank.teamId} (week ${week})`);
    
    const offense = lookups.offense.get(rank.teamId);
    if (!offense) {
      console.warn(`[Power Ranking] Missing offense data for ${rank.teamId}`);
    }
    
    const defense = lookups.defense.get(rank.teamId);
    if (!defense) {
      console.warn(`[Power Ranking] Missing defense data for ${rank.teamId}`);
    }
    
    const weekly = lookups.epaWeekly.get(`${rank.teamId}-w${week}`);
    if (!weekly) {
      console.warn(`[Power Ranking] Missing weekly EPA data for ${rank.teamId} week ${week}`);
    }
    
    // ... build metrics ...
    
    results.push(teamData);
  }
  
  console.log(`[Power Ranking] Processed ${results.length} teams`);
  return results;
}
```

**Ventaja:** Puedes ver exactamente qué datos se está usando/faltando

### Cambio 4: Documentar el flujo en comentarios
```javascript
/**
 * GET /api/power-ranking?week=1
 * 
 * Retorna rankings de 32 equipos para una semana específica.
 * 
 * FLUJO DE DATOS:
 * 1. Extrae week del query parameter (default: 1)
 * 2. Para cada equipo en DEFAULT_RANKINGS:
 *    a) Busca datos de season en offense_season.json
 *    b) Busca datos de season en defense_season.json
 *    c) Busca datos de week en epa_percentile_by_week.json
 * 3. Combina 3 fuentes en objeto "metrics":
 *    - weekly: percentiles de la semana
 *    - season: totales de la temporada
 *    - derived: calculados (rates, etc)
 * 4. Devuelve array de 32 equipos con datos completos
 * 
 * EJEMPLO:
 * GET /api/power-ranking?week=1
 * Response: [{id: "KC", metrics: {...}, ...}, ...]
 */
export async function GET(request: NextRequest) { }
```

### Cambio 5: Separar responsabilidades
```javascript
// Actual (todo en route.ts):
export async function GET() {
  // 50 líneas: imports, maps, loops, metrics building
}

// Propuesto (modular):
// app/api/power-ranking/route.ts
export async function GET() {
  const lookups = new PowerRankingLookups();
  const service = new PowerRankingService(lookups);
  return service.getRankings(week);
}

// lib/power-ranking/lookups.ts
export class PowerRankingLookups {
  constructor() {
    this.offense = new Map(...);
    this.defense = new Map(...);
    this.epaWeekly = new Map(...);
  }
}

// lib/power-ranking/service.ts
export class PowerRankingService {
  getRankings(week) { /* Main logic */ }
  buildMetrics(team, week) { /* Helper */ }
  calculateTurnoverRate(turnovers, drives) { /* Helper */ }
}
```

---

## 📋 CHECKLIST PARA MAÑANA

- [ ] Refactorizar `route.ts` en funciones helper
- [ ] Crear types en `types/power-ranking.ts`
- [ ] Agregar logging detallado
- [ ] Documentar flujo en comentarios
- [ ] Separar en módulos: `lib/power-ranking/`
- [ ] Verificar que API sigue devolviendo 32 equipos correctamente
- [ ] Testear con diferentes weeks (1, 10, 17)
- [ ] Documentar en archivo README

---

## 🎯 META

Después de estas mejoras:
- ✅ Cualquiera puede leer y entender el código
- ✅ Fácil de debuguear si algo falla
- ✅ Fácil de agregar nuevas métricas
- ✅ Performance optimizado

---

## 📌 NOTAS

- No es urgente (app funciona bien ahora)
- Mejora mantenibilidad y claridad
- Tomar entre 1-2 horas
- Después: escribir resumenes de equipos será más fácil

---

**Generado:** 2026-08-24
