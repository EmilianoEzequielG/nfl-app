#!/usr/bin/env node
const https = require("https");
const fs = require("fs");
const path = require("path");

// NFL team wordmarks mapping from nflfastR GitHub
const TEAM_WORDMARKS = {
  KC: "KC.png",
  BUF: "BUF.png",
  SF: "SF.png",
  PHI: "PHI.png",
  BAL: "BAL.png",
  LA: "LA.png",
  DEN: "DEN.png",
  GB: "GB.png",
  HOU: "HOU.png",
  TB: "TB.png",
  CIN: "CIN.png",
  MIA: "MIA.png",
  LAC: "LAC.png",
  DAL: "DAL.png",
  MIN: "MIN.png",
  IND: "IND.png",
  SEA: "SEA.png",
  WAS: "WAS.png",
  ARI: "ARI.png",
  DET: "DET.png",
  NO: "NO.png",
  ATL: "ATL.png",
  NE: "NE.png",
  TEN: "TEN.png",
  CAR: "CAR.png",
  CHI: "CHI.png",
  NYG: "NYG.png",
  NYJ: "NYJ.png",
  JAX: "JAX.png",
  LV: "LV.png",
  CLE: "CLE.png",
  PIT: "PIT.png",
};

const WORDMARKS_DIR = path.join(__dirname, "..", "public", "wordmarks");
const BASE_URL = "https://raw.githubusercontent.com/nflverse/nflfastR-data/master/wordmarks";

async function downloadWordmark(team, filename) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${filename}`;
    const filepath = path.join(WORDMARKS_DIR, filename);

    console.log(`⬇️  Descargando ${team}...`);

    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} para ${team}`));
          return;
        }

        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          console.log(`✅ ${team} descargado`);
          resolve();
        });

        fileStream.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  console.log("🏈 Iniciando descarga de wordmarks...\n");

  if (!fs.existsSync(WORDMARKS_DIR)) {
    fs.mkdirSync(WORDMARKS_DIR, { recursive: true });
    console.log(`📁 Directorio creado: ${WORDMARKS_DIR}\n`);
  }

  const teams = Object.entries(TEAM_WORDMARKS);
  let downloaded = 0;
  let failed = 0;

  for (const [team, filename] of teams) {
    try {
      await downloadWordmark(team, filename);
      downloaded++;
    } catch (err) {
      console.error(`❌ Error descargando ${team}:`, err.message);
      failed++;
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`✅ Descargados: ${downloaded}/${teams.length}`);
  if (failed > 0) console.log(`❌ Fallos: ${failed}`);
  console.log(`\n✨ Listo para usar en PowerRanking modal`);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
