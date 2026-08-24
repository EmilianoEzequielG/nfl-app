// Proxy para ESPN API - scores en vivo

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "scoreboard";

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return Response.json({ error: "ESPN API error" }, { status: response.status });
    }

    const data = await response.json();

    return Response.json(data, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, max-age=60", // Cache 1 minuto para scores en vivo
      },
    });
  } catch (error) {
    console.error("ESPN proxy error:", error);
    return Response.json({ error: "Failed to fetch from ESPN" }, { status: 500 });
  }
}
