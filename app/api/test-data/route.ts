import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const offensePath = join(process.cwd(), 'public', 'data', 'offense_season.json');
    const defensePath = join(process.cwd(), 'public', 'data', 'defense_season.json');

    const offenseData = await readFile(offensePath, 'utf-8');
    const defenseData = await readFile(defensePath, 'utf-8');

    const offense = JSON.parse(offenseData);
    const defense = JSON.parse(defenseData);

    return Response.json({
      status: 'ok',
      offense_teams: offense.length,
      defense_teams: defense.length,
      offense_sample: offense[0] ? { team: offense[0].team, penalties_count: offense[0].penalties_count, fg_rate: offense[0].fg_rate } : null,
      defense_sample: defense[0] ? { team: defense[0].team, penalties_count: defense[0].penalties_count, fg_rate_allowed: defense[0].fg_rate_allowed } : null,
    });
  } catch (error) {
    return Response.json({ error: String(error), status: 'failed' }, { status: 500 });
  }
}
