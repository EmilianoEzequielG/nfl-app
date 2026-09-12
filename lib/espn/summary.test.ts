import { describe, expect, it } from "vitest";
import { traducirJugada, parsearResumen } from "./summary";

describe("traducirJugada", () => {
  it("traduce un pase con 'to' (pasador primero en el texto de ESPN)", () => {
    expect(traducirJugada("Drake Maye 12 Yd pass to A.J. Brown (Andy Borregales Kick)")).toBe(
      "Drake Maye pase de 12 yd a A.J. Brown (extra de Andy Borregales)"
    );
  });

  it("traduce un pase con 'from' invirtiendo el orden de los nombres", () => {
    // Bug real, encontrado con datos de ESPN: un replace simple del fragmento
    // del medio dejaba "Eli Raridon pase de 2 yd a Drake Maye" - al reves,
    // porque con "from" el nombre que aparece primero en el texto es el
    // RECEPTOR, no el pasador.
    expect(traducirJugada("Eli Raridon 2 Yd pass from Drake Maye (Andy Borregales Kick)")).toBe(
      "Drake Maye pase de 2 yd a Eli Raridon (extra de Andy Borregales)"
    );
  });

  it("traduce 'Rush' igual que 'Run' (ESPN usa ambos para lo mismo)", () => {
    // Bug real: solo se contemplaba "Yd Run", asi que "Kyren Williams 5 Yd
    // Rush" pasaba sin traducir.
    expect(traducirJugada("Kyren Williams 5 Yd Rush (extra de Harrison Mevis)")).toBe(
      "Kyren Williams carrera de 5 yd (extra de Harrison Mevis)"
    );
    expect(traducirJugada("Kyren Williams 5 Yd Run (extra de Harrison Mevis)")).toBe(
      "Kyren Williams carrera de 5 yd (extra de Harrison Mevis)"
    );
  });

  it("traduce gol de campo", () => {
    expect(traducirJugada("Jason Myers 41 Yd Field Goal")).toBe(
      "Jason Myers gol de campo de 41 yd"
    );
  });

  it("traduce gol de campo desviado", () => {
    expect(traducirJugada("Jason Myers 55 Yd Field Goal No Good")).toBe(
      "Jason Myers gol de campo de 55 yd desviado"
    );
  });

  it("traduce devolucion de intercepcion", () => {
    expect(traducirJugada("Devon Witherspoon 25 Yd Interception Return (Jason Myers Kick)")).toBe(
      "Devon Witherspoon devolución de intercepción de 25 yd (extra de Jason Myers)"
    );
  });

  it("traduce conversion de 2 por pase fallada", () => {
    expect(traducirJugada("Rhamondre Stevenson 1 Yd Run (Two-Point Pass Conversion Failed)")).toBe(
      "Rhamondre Stevenson carrera de 1 yd (conversión de 2 por pase fallada)"
    );
  });

  it("traduce safety", () => {
    expect(traducirJugada("Team Safety")).toBe("Equipo safety");
  });

  it("deja pasar texto vacio sin romper", () => {
    expect(traducirJugada("")).toBe("");
  });

  it("no toca una construccion no contemplada (queda en ingles antes que romperse)", () => {
    const raro = "Some Unusual Play Description";
    expect(traducirJugada(raro)).toBe(raro);
  });
});

describe("parsearResumen", () => {
  it("devuelve null sin datos", () => {
    expect(parsearResumen(null)).toBeNull();
    expect(parsearResumen({})).toBeNull();
  });

  it("normaliza LAR->LA y WSH->WAS en equipos, anotaciones y destacados", () => {
    // Bug real: ESPN usa "LAR"/"WSH" donde el resto de la app usa "LA"/"WAS".
    // Sin normalizar, el partido de Rams o Washington nunca cruzaba con
    // game.awayTeam.abbr/homeTeam.abbr y esa mitad del resumen se perdia.
    const data = {
      header: {
        competitions: [
          {
            competitors: [
              { team: { id: "14", abbreviation: "LAR" } },
              { team: { id: "25", abbreviation: "SF" } },
            ],
          },
        ],
      },
      scoringPlays: [
        {
          team: { id: "14" },
          scoringType: { name: "touchdown" },
          text: "Kyren Williams 5 Yd Rush (Harrison Mevis Kick)",
          period: { number: 1 },
          clock: { displayValue: "8:00" },
          awayScore: 0,
          homeScore: 7,
        },
      ],
      boxscore: {
        teams: [
          { team: { abbreviation: "LAR" }, statistics: [{ name: "turnovers", displayValue: "1" }] },
          { team: { abbreviation: "SF" }, statistics: [{ name: "turnovers", displayValue: "0" }] },
        ],
        players: [
          {
            team: { abbreviation: "LAR" },
            statistics: [
              {
                name: "rushing",
                labels: ["CAR", "YDS", "AVG", "TD", "LONG"],
                athletes: [{ athlete: { displayName: "Kyren Williams" }, stats: ["10", "54", "5.4", "1", "13"] }],
              },
            ],
          },
        ],
      },
    };

    const r = parsearResumen(data)!;
    expect(r).not.toBeNull();
    expect(r.anotaciones[0].equipo).toBe("LA"); // no "LAR"
    expect(Object.keys(r.totales)).toEqual(expect.arrayContaining(["LA", "SF"]));
    expect(r.totales["LAR"]).toBeUndefined();
    expect(r.destacados.topRB[0]?.equipo).toBe("LA");
  });

  it("arma totales, anotaciones y destacados con datos reales de ESPN (SF vs LA, semana 1)", () => {
    // Estructura recortada de la respuesta real que devolvio ESPN para este
    // partido (mismos valores que se verificaron a mano contra el juego real).
    const data = {
      header: {
        competitions: [
          {
            competitors: [
              { team: { id: "14", abbreviation: "LAR" } },
              { team: { id: "25", abbreviation: "SF" } },
            ],
          },
        ],
      },
      scoringPlays: [
        {
          team: { id: "25" },
          scoringType: { name: "field goal" },
          text: "Eddy Pineiro 20 Yd Field Goal",
          period: { number: 1 },
          clock: { displayValue: "10:00" },
          awayScore: 3,
          homeScore: 0,
        },
        {
          team: { id: "14" },
          scoringType: { name: "touchdown" },
          text: "Kyren Williams 5 Yd Rush (Harrison Mevis Kick)",
          period: { number: 1 },
          clock: { displayValue: "5:00" },
          awayScore: 3,
          homeScore: 7,
        },
        {
          team: { id: "25" },
          scoringType: { name: "touchdown" },
          text: "Demarcus Robinson 39 Yd pass from Brock Purdy (Eddy Pineiro Kick)",
          period: { number: 2 },
          clock: { displayValue: "3:00" },
          awayScore: 10,
          homeScore: 7,
        },
      ],
      boxscore: {
        teams: [
          {
            team: { abbreviation: "SF" },
            statistics: [
              { name: "turnovers", displayValue: "1" },
              { name: "sacksYardsLost", displayValue: "0-0" },
            ],
          },
          {
            team: { abbreviation: "LAR" },
            statistics: [
              { name: "turnovers", displayValue: "1" },
              { name: "sacksYardsLost", displayValue: "0-0" },
            ],
          },
        ],
        players: [
          {
            team: { abbreviation: "SF" },
            statistics: [
              {
                name: "passing",
                labels: ["C/ATT", "YDS", "AVG", "TD", "INT", "SACKS", "QBR", "RTG"],
                athletes: [
                  { athlete: { displayName: "Brock Purdy" }, stats: ["25/34", "205", "6.0", "3", "1", "0-0", "81.5", "105.6"] },
                ],
              },
              {
                name: "rushing",
                labels: ["CAR", "YDS", "AVG", "TD", "LONG"],
                athletes: [
                  { athlete: { displayName: "Christian McCaffrey" }, stats: ["10", "68", "6.8", "0", "16"] },
                ],
              },
              {
                name: "receiving",
                labels: ["REC", "YDS", "AVG", "TD", "LONG", "TGTS"],
                athletes: [
                  { athlete: { displayName: "Demarcus Robinson" }, stats: ["2", "50", "25.0", "1", "39", "3"] },
                ],
              },
              {
                name: "kicking",
                labels: ["FG", "PCT", "LONG", "XP", "PTS"],
                athletes: [{ athlete: { displayName: "Eddy Pineiro" }, stats: ["2/3", "66.7", "56", "3/3", "9"] }],
              },
              {
                name: "interceptions",
                labels: ["INT", "YDS", "TD"],
                athletes: [{ athlete: { displayName: "Renardo Green" }, stats: ["1", "0", "0"] }],
              },
            ],
          },
          {
            team: { abbreviation: "LAR" },
            statistics: [
              {
                name: "rushing",
                labels: ["CAR", "YDS", "AVG", "TD", "LONG"],
                athletes: [{ athlete: { displayName: "Kyren Williams" }, stats: ["10", "54", "5.4", "1", "13"] }],
              },
            ],
          },
        ],
      },
    };

    const r = parsearResumen(data)!;

    expect(r.anotaciones).toHaveLength(3);
    expect(r.anotaciones.map((a) => a.tipo)).toEqual(["FG", "TD", "TD"]);
    // El pase con "from" quedo con el pasador primero
    expect(r.anotaciones[2].texto).toBe(
      "Brock Purdy pase de 39 yd a Demarcus Robinson (extra de Eddy Pineiro)"
    );

    expect(r.totales["SF"].td).toBe(1);
    expect(r.totales["SF"].fg).toBe(1);
    expect(r.totales["LA"].td).toBe(1);
    expect(r.totales["LA"].fg).toBe(0);

    expect(r.destacados.qb[0]).toMatchObject({ equipo: "SF", jugador: "Brock Purdy" });
    expect(r.destacados.topRB.map((x) => x.jugador)).toEqual(
      expect.arrayContaining(["Christian McCaffrey", "Kyren Williams"])
    );
    expect(r.destacados.topWR[0]).toMatchObject({ equipo: "SF", jugador: "Demarcus Robinson" });
    expect(r.destacados.fieldGoals[0]).toMatchObject({ equipo: "SF", jugador: "Eddy Pineiro" });

    expect(r.intercepciones[0]).toMatchObject({ equipo: "SF", jugador: "Renardo Green", cantidad: 1 });
  });
});
