# Generar games_by_week.json desde ESPN API

library(jsonlite)
library(dplyr)
library(tidyr)
library(httr2)

OUTPUT_DIR <- "public/data"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

cat("Descargando schedule 2026 de ESPN...\n")

# ESPN API endpoint for 2026 NFL schedule
url <- "https://site.api.espn.com/apis/site/v2/sports/football/nfl/2026/schedule"

tryCatch({
  response <- httr2::request(url) %>%
    httr2::req_perform()

  schedule_data <- httr2::resp_body_json(response, simplifyVector = TRUE)

  # Extraer eventos (games)
  if (!is.null(schedule_data$events)) {
    events <- schedule_data$events

    cat("Eventos encontrados:", length(events), "\n")

    games_list <- list()

    for (i in seq_along(events)) {
      event <- events[[i]]

      # Extraer información básica
      game_id <- event$id
      week <- as.integer(event$week$number)

      # Equipos
      home_team <- event$competitions[[1]]$home$team$abbreviation
      away_team <- event$competitions[[1]]$away$team$abbreviation

      # Scores
      home_score <- as.integer(event$competitions[[1]]$home$score)
      away_score <- as.integer(event$competitions[[1]]$away$score)

      # Generar métricas realistas
      generate_metrics <- function() {
        list(
          epa_offense_percentile = sample(20:95, 1),
          epa_offense_value = round(rnorm(1, 0, 2.5), 2),
          epa_defense_percentile = sample(20:95, 1),
          epa_defense_value = round(rnorm(1, 0, 2.5), 2),
          scoring_drive_rate = round(runif(1, 0.20, 0.50), 2),
          td_drive_rate = round(runif(1, 0.08, 0.25), 2),
          turnover_drive_rate = round(runif(1, 0.06, 0.20), 2),
          pass_neutral_rate = round(runif(1, 0.43, 0.53), 2),
          third_down_efficiency = round(runif(1, 0.25, 0.50), 2),
          penalties_offensive = sample(2:10, 1),
          penalties_defensive = sample(1:8, 1)
        )
      }

      game_obj <- list(
        game_id = game_id,
        week = week,
        home_team = home_team,
        away_team = away_team,
        home_score = home_score,
        away_score = away_score,
        status = ifelse(is.na(home_score) || is.na(away_score), "scheduled", "final"),
        home_metrics = generate_metrics(),
        away_metrics = generate_metrics()
      )

      games_list <- c(games_list, list(game_obj))
    }

    # Exportar
    write_json(games_list, file.path(OUTPUT_DIR, "games_by_week.json"), pretty = TRUE, auto_unbox = TRUE)

    cat("\n✅ games_by_week.json generado:\n")
    cat("  Total partidos:", length(games_list), "\n")
    cat("  Ruta:", file.path(OUTPUT_DIR, "games_by_week.json"), "\n")

  } else {
    cat("⚠ No se encontraron eventos en la respuesta de ESPN\n")
  }

}, error = function(e) {
  cat("❌ Error al conectar con ESPN API:\n")
  cat(as.character(e), "\n")
})
