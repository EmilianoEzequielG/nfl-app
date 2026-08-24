# Generar games_by_week.json del schedule 2026 de nflverse con scores simulados realistas

library(nflverse)
library(dplyr)
library(jsonlite)

set.seed(42)

OUTPUT_DIR <- "public/data"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

cat("Cargando schedule 2026 de nflverse...\n")
schedules <- load_schedules(2026) %>%
  filter(game_type == "REG") %>%
  arrange(week, gameday)

cat("Total de partidos en schedule:", nrow(schedules), "\n\n")

# Función para simular scores realistas
simulate_score <- function() {
  sample(c(
    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
    29, 30, 31, 32, 33, 34, 35, 37, 38, 40, 42, 45
  ), 1)
}

# Generar metrics aleatorias pero realistas
generate_metrics <- function() {
  list(
    epa_offense_percentile = round(runif(1, 15, 95)),
    epa_offense_value = round(rnorm(1, 0, 3), 2),
    epa_defense_percentile = round(runif(1, 15, 95)),
    epa_defense_value = round(rnorm(1, 0, 3), 2),
    scoring_drive_rate = round(runif(1, 0.20, 0.50), 3),
    td_drive_rate = round(runif(1, 0.08, 0.25), 3),
    turnover_drive_rate = round(runif(1, 0.06, 0.20), 3),
    pass_neutral_rate = round(runif(1, 0.40, 0.55), 3),
    third_down_efficiency = round(runif(1, 0.20, 0.55), 3),
    penalties_offensive = as.integer(round(runif(1, 2, 9))),
    penalties_defensive = as.integer(round(runif(1, 1, 7)))
  )
}

# Crear lista de juegos
games_list <- list()

for (i in 1:nrow(schedules)) {
  game <- schedules[i, ]

  game_id <- as.character(game$game_id)
  week <- as.integer(game$week)
  home <- as.character(game$home_team)
  away <- as.character(game$away_team)

  # Simular scores si no existen
  h_score <- as.integer(game$home_score)
  a_score <- as.integer(game$away_score)

  if (is.na(h_score)) {
    h_score <- simulate_score()
  }
  if (is.na(a_score)) {
    a_score <- simulate_score()
  }

  game_obj <- list(
    game_id = game_id,
    week = week,
    home_team = home,
    away_team = away,
    home_score = h_score,
    away_score = a_score,
    status = "final",
    home_metrics = generate_metrics(),
    away_metrics = generate_metrics()
  )

  games_list <- c(games_list, list(game_obj))
}

# Exportar
output_file <- file.path(OUTPUT_DIR, "games_by_week.json")
write_json(games_list, output_file, pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ games_by_week.json generado:\n")
cat("  Total partidos:", length(games_list), "\n")
cat("  Ubicación: ", normalizePath(output_file), "\n")
cat("  Tamaño: ", file.size(output_file) / 1024, "KB\n")

# Mostrar primeros 3 partidos como muestra
cat("\n📊 Primeros 3 partidos:\n")
for (i in 1:min(3, length(games_list))) {
  g <- games_list[[i]]
  cat(sprintf("  Week %d: %s %d - %s %d\n",
              g$week, g$away_team, g$away_score,
              g$home_team, g$home_score))
}
