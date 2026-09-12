#!/usr/bin/env node
/**
 * Trae marcadores y resumenes en vivo de ESPN y los deja como archivos
 * estaticos en public/data/espn-live/.
 *
 * Por que existe: el proxy /api/espn (server-side, corriendo en Vercel) recibe
 * 403 de Akamai (el CDN de ESPN) de forma consistente - confirmado en los
 * Runtime Logs de produccion, no solo en este sandbox. Akamai esta bloqueando
 * el rango de IP de los datacenters de Vercel/AWS, asi que ningun ajuste de
 * headers lo esquiva.
 *
 * Este script corre en un runner de GitHub Actions (Azure, rango de IP
 * distinto) via cron, y si el fetch prospera, deja los datos ya procesados
 * como JSON en el repo. El sitio los sirve como archivos estaticos - deja de
 * pegarle a ESPN en cada visita, asi que el problema de origen no vuelve a
 * aparecer del lado del cliente.
 *
 * Contrapartida aceptada: los datos quedan tan frescos como la ultima corrida
 * del cron (cada 5-10 min durante partidos) mas el tiempo que tarda Vercel en
 * redeployar tras el commit - ya no es instantaneo, pero funciona.
 *
 * Uso:
 *   node scripts/fetch-espn-live.mjs
 */

import fs from "fs/promises";
import path from "path";

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, "public", "data", "espn-live");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
  Referer: "https://www.espn.com/",
  Origin: "https://www.espn.com",
};

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * El 403 de Akamai resulto ser intermitente, no un bloqueo fijo: probando a
 * mano desde el mismo origen, el mismo request paso una vez y fallo la
 * siguiente, sin cambiar nada. Unos pocos reintentos espaciados suben mucho
 * la chance de que una corrida del cron consiga pasar, en vez de depender
 * solo de la proxima corrida 10 minutos despues.
 */
async function fetchJson(url, { timeoutMs = 12000, intentos = 4 } = {}) {
  let ultimoError;
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      const corte = AbortSignal.timeout(timeoutMs);
      const res = await fetch(url, { headers: HEADERS, signal: corte });
      if (res.ok) return await res.json();
      ultimoError = new Error(`HTTP ${res.status}`);
      if (res.status !== 403 && res.status !== 429) throw ultimoError; // otros errores no vale la pena reintentar
    } catch (error) {
      ultimoError = error;
    }
    if (intento < intentos) {
      const espera = 1500 * intento; // 1.5s, 3s, 4.5s...
      console.log(`[ESPN live] intento ${intento}/${intentos} fallo (${ultimoError.message}), reintentando en ${espera}ms`);
      await esperar(espera);
    }
  }
  throw new Error(`${ultimoError.message} en ${url} (tras ${intentos} intentos)`);
}

async function main() {
  console.log("[ESPN live] Iniciando...");

  // Sin `week`, ESPN devuelve la semana que este en curso ahora mismo. No hace
  // falta que el workflow sepa a que semana estamos: se auto-detecta de la
  // propia respuesta (data.week.number) y con eso se nombra el archivo.
  const scoreboardUrl =
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2";

  let scoreboard;
  try {
    scoreboard = await fetchJson(scoreboardUrl);
  } catch (error) {
    // Si esto falla, GitHub Actions tambien esta bloqueado y hay que buscar
    // otra via (proxy con IP residencial, o una API de pago). Se sale con
    // error para que el workflow lo marque en rojo y quede visible.
    console.error("[ESPN live] No se pudo obtener el scoreboard:", error.message);
    process.exitCode = 1;
    return;
  }

  const week = scoreboard?.week?.number;
  const events = scoreboard?.events ?? [];
  console.log(`[ESPN live] Semana detectada: ${week ?? "?"} — ${events.length} partidos`);

  await fs.mkdir(outDir, { recursive: true });

  const timestamp = new Date().toISOString();
  const scoreboardOut = {
    generatedAt: timestamp,
    week: week ?? null,
    raw: scoreboard,
  };

  if (week) {
    const archivo = path.join(outDir, `scoreboard-week-${String(week).padStart(2, "0")}.json`);
    await fs.writeFile(archivo, JSON.stringify(scoreboardOut, null, 2));
    console.log(`[ESPN live] Guardado ${path.relative(projectRoot, archivo)}`);

    // La app necesita saber cual semana mostrar por defecto sin que alguien
    // tenga que clickear "Proxima" a mano cada vez que arranca una nueva.
    // ESPN ya resuelve esto (week.number en el scoreboard sin parametros
    // avanza solo cuando termina la ventana de la semana anterior), asi que
    // se publica tal cual en vez de calcularlo con una tabla de fechas.
    await fs.writeFile(
      path.join(outDir, "current-week.json"),
      JSON.stringify({ week, updatedAt: timestamp }, null, 2)
    );
  } else {
    // Sin semana identificable (fuera de temporada, o formato inesperado) se
    // guarda igual bajo un nombre generico para poder inspeccionarlo.
    const archivo = path.join(outDir, "scoreboard-latest.json");
    await fs.writeFile(archivo, JSON.stringify(scoreboardOut, null, 2));
    console.log(`[ESPN live] Semana no identificada; guardado ${path.relative(projectRoot, archivo)}`);
  }

  // Resumenes: en vivo se piden siempre (las anotaciones van cambiando).
  // Terminados, se piden solo si TODAVIA NO se guardo un archivo para ese
  // evento - una vez guardado, el resultado final ya no cambia mas, asi que
  // no hace falta volver a pedirlo.
  //
  // Antes esto tenia una ventana de 4h post-partido en vez de "ya tiene
  // archivo": cualquier partido consultado mas tarde que eso (alguien
  // mirando el resumen al dia siguiente, por ejemplo) nunca llegaba a
  // generarse - quedaba en "Todavia no hay anotaciones" para siempre porque
  // el script jamas intentaba pedirlo.
  const archivosExistentes = new Set(
    (await fs.readdir(outDir).catch(() => []))
      .filter((n) => n.startsWith("summary-"))
      .map((n) => n.replace("summary-", "").replace(".json", ""))
  );

  const relevantes = events.filter((ev) => {
    const estado = ev?.status?.type?.state;
    if (estado === "in") return true;
    if (estado === "post") return !archivosExistentes.has(String(ev?.id));
    return false;
  });

  console.log(`[ESPN live] ${relevantes.length} partido(s) en vivo o recien terminado(s)`);

  let sumariosOk = 0;
  for (const ev of relevantes) {
    const id = ev?.id;
    if (!id) continue;
    try {
      const summary = await fetchJson(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${id}`
      );
      const archivo = path.join(outDir, `summary-${id}.json`);
      await fs.writeFile(archivo, JSON.stringify({ generatedAt: timestamp, raw: summary }, null, 2));
      sumariosOk++;
    } catch (error) {
      console.warn(`[ESPN live] Resumen del evento ${id} fallo:`, error.message);
    }
  }
  console.log(`[ESPN live] ${sumariosOk}/${relevantes.length} resumenes guardados`);

  // Los resumenes viejos se borran solo pasados 10 dias (cubre toda la
  // semana NFL con margen) para que el directorio no crezca sin limite.
  // Antes eran 24h contra "sigue vigente" (estar en `relevantes`) - pero un
  // partido terminado con su resumen ya guardado deja de estar en
  // `relevantes` justamente PORQUE ya se guardo, asi que se borraba apenas
  // un dia despues de generado: el peor momento posible, cuando alguien
  // recien va a mirar el resultado del dia anterior.
  const archivos = await fs.readdir(outDir);
  let borrados = 0;
  for (const nombre of archivos) {
    if (!nombre.startsWith("summary-")) continue;
    const ruta = path.join(outDir, nombre);
    const stat = await fs.stat(ruta).catch(() => null);
    if (stat && Date.now() - stat.mtimeMs > 10 * 24 * 60 * 60 * 1000) {
      await fs.unlink(ruta);
      borrados++;
    }
  }
  if (borrados) console.log(`[ESPN live] ${borrados} resumen(es) viejo(s) eliminado(s)`);

  console.log("[ESPN live] Listo.");
}

main();
