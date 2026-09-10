/**
 * Proxy a la API pública de ESPN para marcadores en vivo.
 *
 * La respuesta se cachea en el CDN de Vercel con `s-maxage`. Sin eso cada
 * visitante ejecutaba la función y disparaba su propia llamada a ESPN: con
 * mucha gente mirando el mismo partido eran cientos de pedidos por minuto
 * saliendo todos de la misma IP, que es la forma más rápida de que ESPN
 * bloquee. Con el CDN de por medio, N visitantes cuestan lo mismo que uno:
 * el origen sólo se consulta cuando la copia cacheada vence.
 *
 * ESPN no publica límites de uso ni ofrece una clave, así que la única
 * protección posible es no pedirle de más.
 */

/** Ventanas de cache, algo más cortas que el refresco del cliente para que
 *  cada pedido encuentre contenido fresco pero no dispare uno nuevo. */
const CACHE: Record<string, { sMaxAge: number; swr: number }> = {
  // El cliente refresca la grilla cada 30s
  scoreboard: { sMaxAge: 20, swr: 40 },
  // El resumen del partido se refresca cada 45s
  summary: { sMaxAge: 30, swr: 60 },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "scoreboard";
  const week = searchParams.get("week");
  const year = searchParams.get("year");
  const event = searchParams.get("event");

  try {
    // Sin semana, ESPN devuelve la que se este jugando: al mirar otra semana en
    // la app se mezclarian marcadores de fechas distintas. seasontype=2 es
    // temporada regular.
    const params = new URLSearchParams();
    // summary trae anotaciones y estadisticas de un partido y se pide por id
    if (event) params.set("event", event);
    if (week) params.set("week", week);
    if (year) {
      params.set("dates", year);
      params.set("seasontype", "2");
    }
    const qs = params.toString();
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/${endpoint}${qs ? `?${qs}` : ""}`;

    // Sin timeout, una demora de ESPN mantiene viva la funcion hasta que Vercel
    // la corta, gastando tiempo de ejecucion sin devolver nada util.
    const corte = AbortSignal.timeout(8000);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: corte,
    });

    if (!response.ok) {
      // El 403 de ESPN llega desde su CDN y suele significar bloqueo por origen
      console.error(
        `[ESPN] ${response.status} en ${endpoint}${response.status === 403 ? " (posible bloqueo por origen)" : ""}`
      );
      return Response.json({ error: "ESPN API error" }, { status: response.status });
    }

    const data = await response.json();
    const { sMaxAge, swr } = CACHE[endpoint] ?? { sMaxAge: 30, swr: 60 };

    return Response.json(data, {
      headers: {
        "Content-Type": "application/json",
        // s-maxage cachea en el CDN (compartido entre visitantes); max-age=0
        // evita que el navegador se quede con una copia propia mas vieja.
        // stale-while-revalidate sirve la copia vencida mientras se renueva por
        // detras, asi nadie espera a que responda ESPN.
        "Cache-Control": `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
      },
    });
  } catch (error) {
    const abortada = error instanceof Error && error.name === "TimeoutError";
    console.error(`[ESPN] ${abortada ? "timeout" : "error"} en ${endpoint}:`, error);
    return Response.json(
      { error: abortada ? "ESPN tardó demasiado" : "Failed to fetch from ESPN" },
      { status: 504 }
    );
  }
}
