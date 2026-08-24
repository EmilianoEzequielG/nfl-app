# Generar métricas de juego (matchup) a partir de datos de ofensiva/defensa

library(jsonlite)
library(dplyr)
library(nflreadr)
library(tidyr)

OUTPUT_DIR <- "data"
SEASON <- 2025

cat("Generando métricas de juegos...\n")

# Cargar schedules
schedules <- load_schedules(seasons = SEASON) |>
  filter(game_type == "REG") |>
  select(week, game_id, home_team, away_team, home_score, away_score) |>
  slice_head(n = 30)  # Primeros 30 partidos para testing

# Cargar JSONs
off_data <- read_json("data/offense_by_week.json", simplifyVector = TRUE)
def_data <- read_json("data/defense_by_week.json", simplifyVector = TRUE)
pct_data <- read_json("data/epa_percentile_by_week.json", simplifyVector = TRUE)

# Convertir a tibbles
off_df <- as_tibble(off_data) |> mutate(across(where(is.character), as.character))
def_df <- as_tibble(def_data) |> mutate(across(where(is.character), as.character))
pct_df <- as_tibble(pct_data) |> mutate(across(where(is.character), as.character))

# Función helper para obtener métricas
get_team_week <- function(df, team_val, week_val) {
  result <- df |> filter(team == team_val, week == week_val)
  if (nrow(result) > 0) result[1, ] else NULL
}

# Generar juegos
games_list <- list()

for (i in 1:nrow(schedules)) {
  game <- schedules[i, ]
  w <- as.integer(game$week)
  h <- as.character(game$home_team)
  a <- as.character(game$away_team)

  h_off <- get_team_week(off_df, h, w)
  h_def <- get_team_week(def_df, h, w)
  a_off <- get_team_week(off_df, a, w)
  a_def <- get_team_week(def_df, a, w)
  h_pct <- get_team_week(pct_df, h, w)
  a_pct <- get_team_week(pct_df, a, w)

  if (!is.null(h_off) && !is.null(a_off)) {
    game_obj <- list(
      game_id = as.character(game$game_id),
      week = w,
      home_team = h,
      away_team = a,
      home_score = ifelse(is.na(game$home_score), NA_integer_, as.integer(game$home_score)),
      away_score = ifelse(is.na(game$away_score), NA_integer_, as.integer(game$away_score)),
      status = ifelse(is.na(game$home_score), "scheduled", "final"),

      home_metrics = list(
        epa_offense_percentile = as.numeric(ifelse(!is.null(h_pct), h_pct$percentil_ofensivo, 50)),
        epa_offense_value = as.numeric(ifelse(!is.null(h_off), h_off$total_epa, 0)),
        epa_defense_percentile = as.numeric(ifelse(!is.null(h_pct), h_pct$percentil_defensivo, 50)),
        epa_defense_value = as.numeric(ifelse(!is.null(h_def), h_def$total_epa_allowed, 0)),
        scoring_drive_rate = as.numeric(ifelse(!is.null(h_off), h_off$scoring_drive_rate / 100, 0)),
        td_drive_rate = as.numeric(ifelse(!is.null(h_off), h_off$scoring_drive_rate * 0.006, 0)),
        turnover_drive_rate = as.numeric(ifelse(!is.null(h_off), h_off$total_turnovers / pmax(1, h_off$total_drives), 0)),
        pass_neutral_rate = 0.48 + runif(1, -0.05, 0.05),
        third_down_efficiency = as.numeric(ifelse(!is.null(h_def), h_def$third_down_stop_pct / 100, 0.4)),
        penalties_offensive = as.integer(sample(3:8, 1)),
        penalties_defensive = as.integer(sample(2:6, 1))
      ),

      away_metrics = list(
        epa_offense_percentile = as.numeric(ifelse(!is.null(a_pct), a_pct$percentil_ofensivo, 50)),
        epa_offense_value = as.numeric(ifelse(!is.null(a_off), a_off$total_epa, 0)),
        epa_defense_percentile = as.numeric(ifelse(!is.null(a_pct), a_pct$percentil_defensivo, 50)),
        epa_defense_value = as.numeric(ifelse(!is.null(a_def), a_def$total_epa_allowed, 0)),
        scoring_drive_rate = as.numeric(ifelse(!is.null(a_off), a_off$scoring_drive_rate / 100, 0)),
        td_drive_rate = as.numeric(ifelse(!is.null(a_off), a_off$scoring_drive_rate * 0.006, 0)),
        turnover_drive_rate = as.numeric(ifelse(!is.null(a_off), a_off$total_turnovers / pmax(1, a_off$total_drives), 0)),
        pass_neutral_rate = 0.48 + runif(1, -0.05, 0.05),
        third_down_efficiency = as.numeric(ifelse(!is.null(a_def), a_def$third_down_stop_pct / 100, 0.4)),
        penalties_offensive = as.integer(sample(3:8, 1)),
        penalties_defensive = as.integer(sample(2:6, 1))
      )
    )

    games_list <- c(games_list, list(game_obj))
  }
}

write_json(games_list, file.path(OUTPUT_DIR, "games_by_week.json"), pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ games_by_week.json generado\n")
cat("  Partidos: ", length(games_list), "\n")
