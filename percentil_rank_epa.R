library(nflreadr)
library(dplyr)
library(tidyr)
library(jsonlite)
library(stringr)
library(rlang)

# ---- Semana límite de la temporada actual (última con resultado) ----
# Nota: Estos percentiles utilizan únicamente datos de la SEMANA 18 (última de la temporada 2025)
topweek <- load_schedules(season = 2025) %>%
  filter(!is.na(result)) %>%
  summarise(week = max(week))

# Usar semana 18 específicamente para los percentiles
CURRENT_WEEK <- 18

# ---- Datos base ----
team_stats <- load_team_stats(2010:2025)

# ============================================================
# OFENSIVA
# ============================================================
ofensiva <- team_stats %>% 
  select(team, season, week, attempts, carries, passing_epa, rushing_epa) %>% 
  mutate(rush = round(carries/(attempts + carries), 2), 
         total_epa = rush*rushing_epa + (1-rush)*passing_epa) %>% 
  group_by(team, season) %>% 
  arrange(week, .by_group = TRUE) %>% 
  mutate(epa_total = cumsum(total_epa)) %>% 
  ungroup() %>% 
  filter(week <= CURRENT_WEEK)

# ============================================================
# DEFENSIVA (lo que cada equipo permitió, visto desde el rival)
# ============================================================
defensiva <- team_stats %>% 
  select(team, opponent_team, season, week, attempts, carries, passing_epa, rushing_epa) %>% 
  rename(team_ofensivo = team, team = opponent_team) %>% 
  mutate(rush = round(carries/(attempts + carries), 2), 
         total_epa_allowed = rush*rushing_epa + (1-rush)*passing_epa) %>% 
  group_by(team, season) %>% 
  arrange(week, .by_group = TRUE) %>% 
  mutate(epa_total_allowed = cumsum(total_epa_allowed)) %>% 
  ungroup() %>% 
  filter(week <= CURRENT_WEEK)

# ============================================================
# PERCENTIL POR SEMANA - TEMPORADA ACTUAL (2025)
# ============================================================

# Ofensiva: mayor EPA acumulado = mejor = percentil más alto
percentil_ofensiva_semana <- ofensiva %>% 
  filter(season == 2025) %>% 
  group_by(season, week) %>% 
  mutate(percentil_ofensivo = round(percent_rank(epa_total) * 100, 1)) %>% 
  ungroup() %>% 
  select(team, season, week, epa_total, percentil_ofensivo)

# Defensiva: menor EPA permitido acumulado = mejor = percentil más alto (por eso el signo negativo)
percentil_defensiva_semana <- defensiva %>% 
  filter(season == 2025) %>% 
  group_by(season, week) %>% 
  mutate(percentil_defensivo = round(percent_rank(-epa_total_allowed) * 100, 1)) %>% 
  ungroup() %>% 
  select(team, season, week, epa_total_allowed, percentil_defensivo)

# ============================================================
# TABLERO FINAL COMBINADO
# ============================================================
ranking_semanal <- percentil_ofensiva_semana %>%
  inner_join(
    percentil_defensiva_semana,
    by = c("team", "season", "week")
  ) %>%
  arrange(team, week)

ranking_semanal %>% 
  filter(team == "LA")

# ============================================================
# EXPORTAR A JSON
# ============================================================
output_path <- "nfl-web/public/data/epa_percentile_by_week.json"

# Crear directorio si no existe
dir.create(dirname(output_path), showWarnings = FALSE, recursive = TRUE)

# Exportar a JSON
jsonlite::write_json(ranking_semanal, output_path, pretty = TRUE)

cat(sprintf("✓ Datos exportados a: %s\n", output_path))

ranking_semanal