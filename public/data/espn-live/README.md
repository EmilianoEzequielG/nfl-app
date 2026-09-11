# Datos en vivo de ESPN

Estos archivos los genera **`.github/workflows/espn-live-poll.yml`**, no se
editan a mano. El workflow corre `scripts/fetch-espn-live.mjs` en un runner
de GitHub Actions y hace commit/push de lo que encuentra.

## Por qué existe esto

El proxy `/api/espn` (corriendo en Vercel) recibe **403 de Akamai** — el CDN
de ESPN — de forma consistente. No es un bloqueo a esta app en particular:
Akamai bloquea el rango de IP de los datacenters de Vercel/AWS en general.
Confirmado en los Runtime Logs de producción, no solo en desarrollo.

GitHub Actions corre en Azure, con un rango de IP distinto. El workflow le
pega a ESPN desde ahí y, si prospera, deja el resultado acá como JSON
estático. El sitio lee estos archivos en vez de pedirle a ESPN en vivo desde
el navegador o desde Vercel — ver `lib/data.ts` (`loadWeekData`) y
`lib/espn/summary.ts` (`cargarResumenPartido`).

## Contrapartida

Los datos quedan tan frescos como la última corrida del cron (cada 5-10 min
mientras hay partidos) más lo que tarda Vercel en redeployar tras el commit.
Ya no es instantáneo — es la opción que se eligió por ser gratis, contra
pagar un servicio de proxy con IP residencial o una API oficial.

## Archivos

- `scoreboard-week-NN.json` — marcador de todos los partidos de la semana NN,
  con el payload completo de ESPN adentro (`raw`) y `generatedAt` con cuándo
  se generó.
- `summary-{espnId}.json` — resumen (anotaciones, sacks, intercepciones,
  fumbles) de un partido puntual, solo mientras está en vivo o hasta 4h
  después de terminado. Se borra automáticamente pasadas 24h.
