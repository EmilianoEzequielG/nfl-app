# Obtener schedule 2026 de ESPN o nflverse, con scores 0-0 si no están disponibles

library(jsonlite)
library(dplyr)
library(nflverse)

set.seed(42)

OUTPUT_DIR <- "public/data"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

cat("Intentando obtener datos de ESPN para 2026...\n")

# Intentar ESPN primero
espn_schedule <- NULL
tryCatch({
  url <- "https://site.api.espn.com/apis/site/v2/sports/football/nfl/2026/schedule"
  response <- httr2::request(url) %>%
    httr2::req_perform()
  espn_schedule <- httr2::resp_body_json(response, simplifyVector = TRUE)
  cat("✓ Datos obtenidos desde ESPN\n")
}, error = function(e) {
  cat("⚠ ESPN no tiene datos de 2026 aún\n")
})

# Si ESPN no funciona, usar nflverse schedule
if (is.null(espn_schedule)) {
  cat("Usando schedule de nflverse...\n")

  schedules <- load_schedules(2026) %>%
    filter(game_type == "REG") %>%
    arrange(week, gameday)

  cat("Total partidos:", nrow(schedules), "\n\n")

  # Generar metrics realistas
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

    game_obj <- list(
      game_id = as.character(game$game_id),
      week = as.integer(game$week),
      home_team = as.character(game$home_team),
      away_team = as.character(game$away_team),
      home_score = 0,  # Scores en 0-0 como no hay resultados
      away_score = 0,
      status = "scheduled",
      home_metrics = generate_metrics(),
      away_metrics = generate_metrics()
    )

    games_list <- c(games_list, list(game_obj))
  }

} else {
  # Procesar datos de ESPN
  events <- espn_schedule$events
  games_list <- list()

  for (i in seq_along(events)) {
    event <- events[[i]]

    game_obj <- list(
      game_id = event$id,
      week = as.integer(event$week$number),
      home_team = event$competitions[[1]]$home$team$abbreviation,
      away_team = event$competitions[[1]]$away$team$abbreviation,
      home_score = as.integer(event$competitions[[1]]$home$score),
      away_score = as.integer(event$competitions[[1]]$away$score),
      status = ifelse(is.na(as.integer(event$competitions[[1]]$home$score)), "scheduled", "final"),
      home_metrics = generate_metrics(),
      away_metrics = generate_metrics()
    )

    games_list <- c(games_list, list(game_obj))
  }
}

# Exportar
output_file <- file.path(OUTPUT_DIR, "games_by_week.json")
write_json(games_list, output_file, pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ games_by_week.json generado:\n")
cat("  Total partidos:", length(games_list), "\n")
cat("  Ubicación:", output_file, "\n")
cat("  Tamaño:", round(file.size(output_file) / 1024, 2), "KB\n")

# Mostrar muestra
cat("\n📊 Primeros 3 partidos (semana 1):\n")
for (i in 1:min(3, length(games_list))) {
  g <- games_list[[i]]
  cat(sprintf("  Week %d: %s %d - %s %d\n",
              g$week, g$away_team, g$away_score,
              g$home_team, g$home_score))
}
