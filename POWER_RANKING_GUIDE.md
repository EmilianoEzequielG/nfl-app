# 📊 GUÍA EDITORIAL: POWER RANKING

## Cómo Editar y Subir el Power Ranking Semana a Semana

---

## 1️⃣ ACCESO AL EDITOR

### En la web (http://localhost:3000)
1. Ve a la pestaña **"Power Ranking"**
2. Click en el icono 🔒 (Lock) en la esquina superior derecha
3. Ingresa contraseña: `secret123`
4. El icono cambiará a 🔓 (Unlock) y aparecerán botones "Editar" en cada equipo

---

## 2️⃣ EDITAR UN EQUIPO

### Paso a Paso:
1. Click en el botón **"Editar"** (azul) del equipo que quieres ajustar
2. Se abre modal con dos campos:

   **Campo 1: Posición (1-32)**
   - Ingresa número de 1 a 32
   - Ejemplo: Si crees que Kansas City es #1, escribe `1`
   - Si Buffalo debería ser #2, escribe `2`
   - El sistema automáticamente reordena la lista completa

   **Campo 2: Resumen Editorial (Textarea)**
   - Escribe tu análisis de por qué ese equipo está en esa posición
   - Máximo: Sin límite (pero recomendado 2-3 oraciones)
   
   Ejemplos de buenos resúmenes:
   ```
   KC Chiefs: Lideran la conferencia con defensa dominante. Mahomes 
   sigue en MVP level, controlando el juego en momentos decisivos. 
   Ofensiva versátil con opciones de carrera y pase.
   ```
   
   ```
   Philadelphia Eagles: Mejora semana a semana. Defensa permite 
   menos puntos en últimas 4 semanas. Jalen Hurts leyendo bien 
   pre-snap. Ofensiva coordinada.
   ```

3. Click **"Guardar"**
4. El resumen se guarda instantáneamente en la base de datos

---

## 3️⃣ INTERPRETAR LA LISTA

### Indicadores Visuales:

🏷️ **Badge "Ajustado"** (azul)
- Solo aparece si TÚ editaste manualmente ese equipo
- Significa: "Este ranking fue editado manualmente, no es el calculado"
- Equipos sin badge = ranking calculado por defecto (EPA, powerplay metrics)

### Ejemplo de Lectura:
```
1. Kansas City Chiefs (11-3) ← Badge "Ajustado"
   "Los Chiefs mantienen el liderato..."
   ↑ TÚ pusiste aquí en posición #1

4. Philadelphia Eagles (10-4) ← Sin badge
   (No aparece resumen porque no lo editaste)
   ↑ Sistema lo puso aquí por EPA calculado
```

---

## 4️⃣ PROCESO SEMANAL (RECOMENDADO)

### Cada Semana (Lunes-Martes después de games):

1. **Abre la página Power Ranking**
2. **Unlock**: Click 🔒 → contraseña
3. **Revisa Top 10**: 
   - ¿Cambió algo? ¿Algún equipo subió/bajó inesperadamente?
   - Lee el resumen actual
   - ¿Sigue siendo válido?

4. **Equipos para Editar** (prioridad):
   - ⭐ Top 5 (siempre editar)
   - ⭐ Bottom 5 (siempre editar)
   - ⭐ Equipos que ganaron/perdieron inesperadamente
   - ⭐ Cambios importantes en posición

5. **Edita cada uno**:
   - Ajusta posición si es necesario
   - Escribe/actualiza el resumen (2-3 puntos clave)

6. **Revisa antes de salir**:
   - ¿La lista tiene sentido top-to-bottom?
   - ¿Top 10 son realmente los mejores?
   - ¿Bottom 5 necesitan cambios?

---

## 5️⃣ ESTRUCTURA DEL RESUMEN (RECOMENDADA)

No hay formato obligatorio, pero esta estructura funciona bien:

```
[PUNTO 1 - DEFENSA/OFENSIVA]
[Equipo] está [subiendo/bajando/igual] porque [razón]. 

[PUNTO 2 - JUGADOR CLAVE O TENDENCIA]
[Nombre QB/Coach] está [jugando bien/mal], impactando [resultado].

[PUNTO 3 - CONTEXTO DE TEMPORADA O PRÓXIMOS JUEGOS]
Próxima semana enfrenta a [rival], que juega [defensa/ofensiva].
```

### Ejemplo Completo:
```
Buffalo está mejorando defensivamente. Permitieron 16 puntos 
en últimas 2 semanas vs. 24 promedio. Allen leyendo pre-snap 
mejor. Próximo juego contra Miami en divisional importante.
```

---

## 6️⃣ NOTAS IMPORTANTES

### ✅ DO's:
- Actualiza Top 10 cada semana (mínimo)
- Escribe resúmenes claros y específicos
- Menciona jugadores clave (QB, defensive star)
- Compara vs. semanas anteriores ("subió 2 posiciones porque...")
- Cambia posiciones si hay cambios significativos

### ❌ DON'Ts:
- No dejes resúmenes vacíos (usa "Todavía no analizado" si no tienes tiempo)
- No edites solo posición sin resumen
- No escribas resúmenes genéricos ("equipo bueno")
- No compares contra años anteriores (es temporada 2026)

---

## 7️⃣ TIPS EDITORIALS

### Para Escritura Rápida:
- Abre ESPN.com Power Rankings como referencia
- Lee NFL.com análisis de semana
- Mira stats de EPA/pFF (si tienes acceso)
- Pregunta a comunidad qué piensan

### Datos Útiles (Mañana agregamos a la página):
- EPA (Expected Points Added) - ofensiva y defensa
- DVOA (Defense-adjusted Value Over Average)
- Puntos permitidos (últimas 4 semanas)
- Posesión promedio
- Conversiones 3rd down

---

## 8️⃣ PUBLICAR EN LA WEB

### Paso 1: Editar Localmente
```bash
# Ya hiciste esto en la web ✅
# Los cambios se guardan automáticamente en BD
```

### Paso 2: Subir a Producción (cuando haya servidor)
```bash
# Cuando tengas servidor en vivo:
git add .
git commit -m "Power Ranking - Semana 5"
git push origin main
# Se despliega automáticamente
```

---

## 9️⃣ ESTRUCTURA DE DATOS (Backend)

Si necesitas entender la base de datos:

```
PowerRankingNote {
  teamId: "KC"           // Equipo (código 3-letras)
  week: 5                // Semana (1-21)
  rankingPosition: 1     // Tu posición ajustada
  summary: "Los Chiefs..."  // Tu resumen editorial
}
```

**Nota**: El sistema combina dos fuentes:
- **Posición Calculada**: Power ranking automático (EPA-based)
- **Posición Ajustada**: TU edición manual (si existe)
- **Siempre muestra**: adjustedRank || calculatedRank

---

## 🔟 FAQ

**P: ¿Cuándo debo cambiar una posición?**
R: Cuando el resultado (EPA) cambió significativamente, o injury importante, o sorpresa de rendimiento.

**P: ¿Puedo dejar un equipo sin resumen?**
R: Sí, pero mostrará "Todavía no hay resumen". Mejor escribir algo corto.

**P: ¿Cuál es el mejor horario para editar?**
R: Lunes-Martes después de games terminan. Miércoles like actualizar cambios últimos minuto.

**P: ¿Puedo cambiar mi edición después?**
R: Sí, click "Editar" nuevamente y sobrescribe.

**P: ¿De dónde saco datos para analizar?**
R: ESPN, NFL.com, PFF, RedZone, tu análisis propio.

---

## 📞 SOPORTE

Si algo no funciona:
1. Verifica contraseña (`secret123`)
2. Intenta refresh (F5)
3. Abre inspector del navegador (F12) → Console
4. Copia cualquier error rojo
5. Avísale al dev

---

**ÚLTIMA ACTUALIZACIÓN**: 2026-08-21
**PRÓXIMO PASO**: Agregar métricas y datos en dashboard
