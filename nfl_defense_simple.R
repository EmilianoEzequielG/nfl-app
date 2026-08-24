# NFL 2025 — ESTADÍSTICAS DEFENSIVAS (Versión Simplificada)
# Genera datos de EPA permitido, sacks, interceptions

library(nflreadr)
library(dplyr)
library(tidyr)
library(jsonlite)

OUTPUT_DIR <- "public/data"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

SEASON <- 2026

cat("Descargando datos de defensa...\n")
pbp <- load_pbp(seasons = SEASON)

# Filtrar jugadas válidas
plays <- pbp |>
  filter(
    season_type == "REG",
    !is.na(posteam),
    !is.na(defteam),
    play_type %in% c("pass", "run"),
    two_point_attempt == 0
  )

# EPA permitido por semana (desde perspectiva de defensa)
defense_epa <- plays |>
  group_by(team = defteam, week) |>
  summarise(
    passing_epa_allowed = round(sum(epa[play_type == "pass"], na.rm = TRUE), 3),
    rushing_epa_allowed = round(sum(epa[play_type == "run"], na.rm = TRUE), 3),
    total_epa_allowed = round(sum(epa, na.rm = TRUE), 3),
    .groups = "drop"
  )

# Sacks
sacks <- plays |>
  group_by(team = defteam, week) |>
  summarise(
    sacks = sum(sack == 1, na.rm = TRUE),
    sack_yards = sum(yards_gained[sack == 1], na.rm = TRUE),
    .groups = "drop"
  ) |>
  mutate(sack_yards = replace_na(sack_yards, 0))

# Interceptions y fumbles forced
turnovers_forced <- plays |>
  group_by(team = defteam, week) |>
  summarise(
    interceptions_forced = sum(interception == 1, na.rm = TRUE),
    fumbles_forced = sum(fumble_lost == 1, na.rm = TRUE),
    total_turnovers_forced = interceptions_forced + fumbles_forced,
    .groups = "drop"
  )

# 3rd down defense
third_down <- pbp |>
  filter(season_type == "REG", down == 3, play_type %in% c("pass", "run")) |>
  group_by(team = defteam, week) |>
  summarise(
    third_down_attempts = n(),
    third_down_stops = sum(first_down == 0, na.rm = TRUE),
    third_down_stop_pct = round(third_down_stops / third_down_attempts * 100, 1),
    .groups = "drop"
  )

# Combine all metrics
defense_week <- defense_epa |>
  left_join(sacks, by = c("team", "week")) |>
  left_join(turnovers_forced, by = c("team", "week")) |>
  left_join(third_down, by = c("team", "week")) |>
  mutate(across(where(is.numeric), ~replace_na(., 0))) |>
  arrange(team, week)

# Season totals
defense_season <- defense_week |>
  group_by(team) |>
  summarise(
    n_weeks = n(),
    across(where(is.numeric), sum),
    .groups = "drop"
  ) |>
  mutate(
    third_down_stop_pct = round(third_down_stop_pct / n_weeks, 1)
  )

# Export
write_json(defense_week, file.path(OUTPUT_DIR, "defense_by_week.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(defense_season, file.path(OUTPUT_DIR, "defense_season.json"), pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ Datos de defensa generados:\n")
cat("  - defense_by_week.json\n")
cat("  - defense_season.json\n")
