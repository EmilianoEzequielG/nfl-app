library(nflreadr)
library(dplyr)
library(tidyr)
library(jsonlite)
library(stringr)
library(rlang)

# ---- Semana límite de la temporada actual (última con resultado) ----
# Corte 2025 -> 2026: la temporada 2025 ya esta completa (18 semanas), pero
# 2026 recien jugo su semana 1. CURRENT_WEEK se actualiza a mano cada semana
# en vez de calcularse de topweek, para que el corte quede explicito.
topweek <- load_schedules(season = 2026) %>%
  filter(!is.na(result)) %>%
  summarise(week = max(week))

# Semana 1 de 2026 jugada (la 2 arranca esta semana)
CURRENT_WEEK <- 1

# ---- Datos base ---- (el rango incluye 2026 para que el filtro de abajo
# encuentre datos; 2010 como piso historico no cambia, no afecta el resultado)
team_stats <- load_team_stats(2010:2026)

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
# PERCENTIL POR SEMANA - TEMPORADA ACTUAL (2026)
# ============================================================

# Ofensiva: mayor EPA acumulado = mejor = percentil más alto
percentil_ofensiva_semana <- ofensiva %>%
  filter(season == 2026) %>%
  group_by(season, week) %>%
  mutate(percentil_ofensivo = round(percent_rank(epa_total) * 100, 1)) %>%
  ungroup() %>%
  select(team, season, week, epa_total, percentil_ofensivo)

# Defensiva: menor EPA permitido acumulado = mejor = percentil más alto (por eso el signo negativo)
percentil_defensiva_semana <- defensiva %>%
  filter(season == 2026) %>%
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
output_path <- "public/data/epa_percentile_by_week.json"  # antes: "nfl-web/public/data/...", carpeta que no existe en este repo

# Crear directorio si no existe
dir.create(dirname(output_path), showWarnings = FALSE, recursive = TRUE)

# Exportar a JSON
jsonlite::write_json(ranking_semanal, output_path, pretty = TRUE)

cat(sprintf("✓ Datos exportados a: %s\n", output_path))

ranking_semanal