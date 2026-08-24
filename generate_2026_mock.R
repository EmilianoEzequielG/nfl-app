# Generar datos mock realistas para 2026 basados en patrones de 2025

library(jsonlite)
library(dplyr)
library(tidyr)

set.seed(42)

OUTPUT_DIR <- "public/data"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

# Equipos NFL
teams <- c("ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN",
           "DET", "GB", "HOU", "IND", "JAX", "KC", "LA", "LAC", "LV", "MIA",
           "MIN", "NE", "NO", "NYG", "NYJ", "PHI", "PIT", "SEA", "SF", "TB",
           "TEN", "WAS")

# Generar datos ofensivos simulados
offense_data <- expand.grid(team = teams, week = 1:5) %>%
  as_tibble() %>%
  mutate(
    passing_epa = round(rnorm(n(), mean = 0, sd = 3), 3),
    rushing_epa = round(rnorm(n(), mean = 0, sd = 2), 3),
    total_epa = round(passing_epa + rushing_epa, 3),
    scoring_drive_rate = round(runif(n(), 25, 50), 1),
    total_drives = sample(8:15, n(), replace = TRUE),
    interceptions = sample(0:3, n(), replace = TRUE),
    fumbles_lost = sample(0:2, n(), replace = TRUE),
    total_turnovers = interceptions + fumbles_lost
  )

# Defensa
defense_data <- expand.grid(team = teams, week = 1:5) %>%
  as_tibble() %>%
  mutate(
    passing_epa_allowed = round(rnorm(n(), mean = 0, sd = 3), 3),
    rushing_epa_allowed = round(rnorm(n(), mean = 0, sd = 2), 3),
    total_epa_allowed = round(passing_epa_allowed + rushing_epa_allowed, 3),
    sacks = sample(0:5, n(), replace = TRUE),
    sack_yards = sacks * sample(4:8, n(), replace = TRUE),
    interceptions_forced = sample(0:2, n(), replace = TRUE),
    fumbles_forced = sample(0:2, n(), replace = TRUE),
    total_turnovers_forced = interceptions_forced + fumbles_forced,
    third_down_attempts = sample(10:20, n(), replace = TRUE),
    third_down_stops = sample(3:10, n(), replace = TRUE),
    third_down_stop_pct = round(third_down_stops / third_down_attempts * 100, 1)
  )

# EPA Percentiles
percentile_data <- expand.grid(team = teams, week = 1:5, season = 2026) %>%
  as_tibble() %>%
  mutate(
    epa_total = round(rnorm(n(), mean = 0, sd = 3), 3),
    percentil_ofensivo = round(runif(n(), 1, 100), 1),
    epa_total_allowed = round(rnorm(n(), mean = 0, sd = 3), 3),
    percentil_defensivo = round(runif(n(), 1, 100), 1)
  )

# Schedules (generar matchups)
schedule <- data.frame(
  week = c(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
  home_team = c("KC", "BUF", "SF", "DAL", "PHI", "DEN", "GB", "MIN",
                "TB", "NE", "LAC", "ATL", "HOU", "TEN", "SEA", "NYG"),
  away_team = c("BUF", "KC", "DAL", "SF", "WAS", "LV", "DET", "GB",
                "NO", "MIA", "LAR", "CAR", "IND", "JAX", "PIT", "PHI"),
  home_score = sample(10:35, 16),
  away_score = sample(10:35, 16)
)

# Generar 30 game matchups completos
games_data <- list()

for (w in 1:5) {
  schedule_week <- schedule %>% filter(week == w)

  for (i in 1:nrow(schedule_week)) {
    game <- schedule_week[i, ]
    h <- as.character(game$home_team)
    a <- as.character(game$away_team)

    h_off <- offense_data %>% filter(team == h, week == w)
    h_def <- defense_data %>% filter(team == h, week == w)
    a_off <- offense_data %>% filter(team == a, week == w)
    a_def <- defense_data %>% filter(team == a, week == w)
    h_pct <- percentile_data %>% filter(team == h, week == w)
    a_pct <- percentile_data %>% filter(team == a, week == w)

    if (nrow(h_off) > 0 && nrow(a_off) > 0) {
      game_obj <- list(
        game_id = paste0("2026", sprintf("%02d", w), sprintf("%02d", i)),
        week = w,
        home_team = h,
        away_team = a,
        home_score = as.integer(game$home_score),
        away_score = as.integer(game$away_score),
        status = "final",

        home_metrics = list(
          epa_offense_percentile = as.numeric(h_pct$percentil_ofensivo),
          epa_offense_value = as.numeric(h_off$total_epa),
          epa_defense_percentile = as.numeric(h_pct$percentil_defensivo),
          epa_defense_value = as.numeric(h_def$total_epa_allowed),
          scoring_drive_rate = as.numeric(h_off$scoring_drive_rate / 100),
          td_drive_rate = as.numeric(h_off$scoring_drive_rate * 0.006),
          turnover_drive_rate = as.numeric(h_off$total_turnovers / pmax(1, h_off$total_drives)),
          pass_neutral_rate = 0.48 + runif(1, -0.05, 0.05),
          third_down_efficiency = as.numeric(h_def$third_down_stop_pct / 100),
          penalties_offensive = as.integer(sample(3:8, 1)),
          penalties_defensive = as.integer(sample(2:6, 1))
        ),

        away_metrics = list(
          epa_offense_percentile = as.numeric(a_pct$percentil_ofensivo),
          epa_offense_value = as.numeric(a_off$total_epa),
          epa_defense_percentile = as.numeric(a_pct$percentil_defensivo),
          epa_defense_value = as.numeric(a_def$total_epa_allowed),
          scoring_drive_rate = as.numeric(a_off$scoring_drive_rate / 100),
          td_drive_rate = as.numeric(a_off$scoring_drive_rate * 0.006),
          turnover_drive_rate = as.numeric(a_off$total_turnovers / pmax(1, a_off$total_drives)),
          pass_neutral_rate = 0.48 + runif(1, -0.05, 0.05),
          third_down_efficiency = as.numeric(a_def$third_down_stop_pct / 100),
          penalties_offensive = as.integer(sample(3:8, 1)),
          penalties_defensive = as.integer(sample(2:6, 1))
        )
      )

      games_data <- c(games_data, list(game_obj))
    }
  }
}

# Exportar
write_json(offense_data, file.path(OUTPUT_DIR, "offense_by_week.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(defense_data, file.path(OUTPUT_DIR, "defense_by_week.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(percentile_data, file.path(OUTPUT_DIR, "epa_percentile_by_week.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(games_data, file.path(OUTPUT_DIR, "games_by_week.json"), pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ Datos 2026 generados:\n")
cat("  - offense_by_week.json\n")
cat("  - defense_by_week.json\n")
cat("  - epa_percentile_by_week.json\n")
cat("  - games_by_week.json (", length(games_data), " partidos)\n", sep = "")
