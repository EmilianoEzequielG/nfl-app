# NFL Scoreboard App - Setup Completado

## ✅ Estructura Inicial Lista

### Carpetas Creadas
```
/components/
  ├── Scoreboard/
  │   ├── Scoreboard.tsx (componente principal con lista de partidos)
  │   └── GameCard.tsx (tarjeta individual de partido)
  └── GameModal/
      ├── GameModal.tsx (modal bottom-sheet)
      ├── MetricsComparison.tsx (todas las métricas enfrentadas)
      └── MetricBar.tsx (barra comparativa entre equipos)

/types/
  └── index.ts (tipos base: Team, Game, GameMetrics, Week, PowerRankingNote)

/lib/
  └── mockData.ts (datos mock para desarrollo, con 3 partidos)

/hooks/
  └── (reservado para hooks custom)

/data/
  └── (carpeta para JSON generados por scripts de R)

/public/
  ├── helmets/ (carpeta para PNG de cascos)
  └── (assets públicos)
```

### Tecnologías
- **Next.js 16** con App Router
- **React 19** (client/server components)
- **TypeScript** (strict mode)
- **Tailwind CSS 4** (mobile-first)
- **Lucide React** (iconos)

## 📱 Diseño Mobile-First

### Scoreboard
- Lista vertical simple (sin 2 columnas)
- Tarjetas de partidos con:
  - Equipos visitante y local lado a lado
  - Scores (si finalizó)
  - Hora (si scheduled)
  - Tap para abrir modal

### Modal de Partido (Bottom-Sheet)
- Header con cascos/VS/scores
- Contenido scrolleable con todas las métricas
- Cierre con X o swipe-down
- Responsive: bottom-sheet en mobile, centrado en desktop

### Métricas (Formato Enfrentado)
Cada métrica tiene DOS filas separadas para evitar cruce de campos:

1. **EPA Percentil** (2 filas)
   - Ofensivo: EPA Of. Equipo 1 vs EPA Def. Equipo 2
   - Defensivo: EPA Def. Equipo 1 vs EPA Of. Equipo 2

2. **Pass Neutral** (1 fila)

3. **Scoring/TD/Turnover Drive Rate** (6 filas - 2 por métrica)
   - Ofensivo: Of. Equipo 1 vs Def. Equipo 2
   - Defensivo: Def. Equipo 1 vs Of. Equipo 2

4. **3rd Down Efficiency** (2 filas)
   - Mismo patrón que EPA

5. **Penalties** (2 filas)
   - Ofensivas: Pen. Of. Equipo 1 vs Pen. Def. Equipo 2
   - Defensivas: Pen. Def. Equipo 1 vs Pen. Of. Equipo 2

**Nota**: Cada fila defensiva muestra el dato DEFENSIVO REAL, no invertido.

## 🚀 Próximos Pasos

### 1. Integrar Scripts de R
Cuando tengas los scripts listos:
- [ ] Confirmar que R está instalado localmente
- [ ] Instalar paquetes de R (nflreadr, dplyr, jsonlite, etc.)
- [ ] Ejecutar scripts: `Rscript nombre.R`
- [ ] Validar JSON generados en /data/
- [ ] Conectar datos a la UI

### 2. Datos Fijos (No se regeneran con R)
- [ ] PNGs de cascos (32 equipos) → /public/helmets/[ABBR].png
- [ ] Proxy ESPN API (/api/espn/route.ts) para scores en vivo
- [ ] JSON editorial (estadios, coaching staff, hashtags)

### 3. Base de Datos
- [ ] Configurar Postgres + Prisma
- [ ] Schema: Week, PowerRankingNote, GameMetricsSnapshot
- [ ] Seed con datos de la semana actual

### 4. Navegación Principal (Aún no implementada)
- [ ] Tabs: Scoreboard | Power Ranking | XOs
- [ ] Power Ranking: lista de equipos → abre editorial
- [ ] XOs: se mantiene del proyecto anterior

## 📊 Mock Data Actual

**Week 1** con 3 partidos:
1. **KC 24 - BUF 17** (final) - métricas completas
2. **SF 28 - DAL 21** (final) - métricas completas
3. **PHI vs DEN** (scheduled 1:00 PM) - sin métricas

Para agregar más partidos, edita `/lib/mockData.ts`

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev        # Servidor en http://localhost:3000

# Compilación
npm run build      # Producción build
npm run start      # Ejecutar build

# Chequeos
npm run lint       # ESLint
npm run type-check # TypeScript check (si existe)
```

## 📋 Checklist de Validación

- ✅ TypeScript compila sin errores
- ✅ Scoreboard renderiza lista de partidos
- ✅ GameCard muestra scores y horarios correctamente
- ✅ Modal abre al tocar un partido
- ✅ Métricas enfrentadas muestran sin cruce de campos
- ⏳ Screenshots en navegador (abrir http://localhost:3000)
- ⏳ Conectar datos de scripts R
- ⏳ Base de datos Postgres
- ⏳ Navegación multi-tab

## 🐛 Verificación de Métricas (Bug de Cruce de Campos)

**Test Manual**: Abre KC vs BUF
- EPA Ofensivo (fila 1): debe mostrar "KC 78%" vs "BUF 82%" (EPA defensiva de BUF)
- EPA Defensivo (fila 2): debe mostrar "KC 82%" vs "BUF 78%" (EPA ofensiva de BUF)

El valor DEFENSIVO de un equipo NO es el inverso de su ofensiva en el rival.
