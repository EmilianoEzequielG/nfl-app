# NFL 2025 — ESTADÍSTICAS OFENSIVAS (Versión Simplificada)
# Genera datos de EPA, turnovers, y scoring drive rates

library(nflreadr)
library(dplyr)
library(tidyr)
library(jsonlite)

OUTPUT_DIR <- "public/data"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

SEASON <- 2026

cat("Descargando datos de ofensiva...\n")
pbp <- load_pbp(seasons = SEASON)
schedules <- load_schedules(seasons = SEASON)

# Filtrar jugadas válidas
plays <- pbp |>
  filter(
    season_type == "REG",
    !is.na(posteam),
    !is.na(defteam),
    play_type %in% c("pass", "run"),
    two_point_attempt == 0
  )

# EPA por semana
offense_epa <- plays |>
  group_by(team = posteam, week) |>
  summarise(
    passing_epa = round(sum(epa[play_type == "pass"], na.rm = TRUE), 3),
    rushing_epa = round(sum(epa[play_type == "run"], na.rm = TRUE), 3),
    total_epa = round(sum(epa, na.rm = TRUE), 3),
    .groups = "drop"
  )

# Scoring drive rate (drives que terminan en TD o FG)
drive_results <- pbp |>
  filter(season_type == "REG", !is.na(fixed_drive_result)) |>
  group_by(posteam, week, fixed_drive) |>
  slice_tail(n = 1) |>
  ungroup() |>
  select(team = posteam, week, drive_result = fixed_drive_result)

drive_summary <- drive_results |>
  mutate(
    is_score = grepl("touchdown|field goal", drive_result, ignore.case = TRUE)
  ) |>
  group_by(team, week) |>
  summarise(
    scoring_drive_rate = round(sum(is_score) / n() * 100, 1),
    total_drives = n(),
    .groups = "drop"
  )

# Turnovers
turnovers <- plays |>
  group_by(team = posteam, week) |>
  summarise(
    interceptions = sum(interception == 1, na.rm = TRUE),
    fumbles_lost = sum(fumble_lost == 1, na.rm = TRUE),
    total_turnovers = interceptions + fumbles_lost,
    .groups = "drop"
  )

# Combine all metrics
offense_week <- offense_epa |>
  left_join(drive_summary, by = c("team", "week")) |>
  left_join(turnovers, by = c("team", "week")) |>
  mutate(across(where(is.numeric), ~replace_na(., 0))) |>
  arrange(team, week)

# Season totals
offense_season <- offense_week |>
  group_by(team) |>
  summarise(
    n_weeks = n(),
    across(where(is.numeric), sum),
    .groups = "drop"
  ) |>
  mutate(
    scoring_drive_rate = round(scoring_drive_rate / n_weeks, 1),
    turnovers_per_game = round(total_turnovers / n_weeks, 1)
  )

# Export
write_json(offense_week, file.path(OUTPUT_DIR, "offense_by_week.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(offense_season, file.path(OUTPUT_DIR, "offense_season.json"), pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ Datos de ofensiva generados:\n")
cat("  - offense_by_week.json\n")
cat("  - offense_season.json\n")
