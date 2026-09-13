/**
 * Endpoint de diagnostico, temporal: confirma si el bloqueo de Akamai
 * tambien afecta a las Edge Functions de Vercel, que corren en una red
 * distinta a las funciones serverless normales (Node.js en AWS Lambda).
 *
 * No lo usa el cliente ni reemplaza nada en produccion - es solo para
 * probar con curl/navegador si esta via esquiva el bloqueo que si le pega
 * a GitHub Actions (falla 100% de las corridas) y, con Node serverless
 * clasico, a Vercel (403 confirmado en los Runtime Logs).
 *
 * Si esto funciona, vale la pena migrar el flujo real a edge. Si tambien
 * da 403, se descarta esta via sin haber tocado nada del pipeline actual.
 */
export const runtime = "edge";

export async function GET() {
  const inicio = Date.now();
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          Referer: "https://www.espn.com/",
        },
      }
    );
    const ms = Date.now() - inicio;
    if (!res.ok) {
      return Response.json({ ok: false, status: res.status, ms }, { status: res.status });
    }
    const data = await res.json();
    return Response.json({
      ok: true,
      status: res.status,
      ms,
      week: data?.week?.number ?? null,
      eventos: data?.events?.length ?? null,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error), ms: Date.now() - inicio },
      { status: 500 }
    );
  }
}
