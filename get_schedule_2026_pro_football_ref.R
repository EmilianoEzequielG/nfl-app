# Obtener schedule 2026 desde Pro Football Reference o construir desde nflverse
# con scores en vivo desde ESPN cuando estén disponibles

library(jsonlite)
library(dplyr)
library(nflverse)
library(rvest)

OUTPUT_DIR <- "public/data"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

cat("Obteniendo schedule 2026...\n")

# Opción 1: Intentar Pro Football Reference
pfr_url <- "https://www.pro-football-reference.com/years/2026/games.htm"

schedule_data <- tryCatch({
  cat("Intentando Pro Football Reference...\n")

  page <- read_html(pfr_url)

  # Extraer tabla de schedule
  table <- page %>%
    html_table(fill = TRUE) %>%
    .[[1]]

  cat("✓ Schedule obtenido de Pro Football Reference\n")
  table

}, error = function(e) {
  cat("⚠ Pro Football Reference no disponible, usando nflverse...\n")

  # Fallback: usar nflreadr
  nflreadr::load_schedules(2026) %>%
    filter(game_type == "REG") %>%
    select(game_id, week, gameday, home_team, away_team,
           home_score, away_score, spread_line) %>%
    mutate(
      # Invertir signo del spread_line para que sea desde punto de vista del local
      spread_line = as.character(
        if_else(is.na(spread_line), NA_real_, -as.numeric(spread_line))
      )
    ) %>%
    arrange(week)
})

# Procesar y generar JSON
games_list <- list()

if ("game_id" %in% names(schedule_data)) {
  # Ya está en formato de nflverse
  for (i in 1:nrow(schedule_data)) {
    game <- schedule_data[i, ]

    # Procesar spread_line (si existe)
    spread_line <- NA
    if ("spread_line" %in% names(game) && !is.na(game$spread_line)) {
      spread_line <- as.character(game$spread_line)
    }

    # Procesar fecha (gameday)
    date_utc <- NA
    if ("gameday" %in% names(game) && !is.na(game$gameday)) {
      date_utc <- as.character(game$gameday)
    }

    games_list[[i]] <- list(
      game_id = as.character(game$game_id),
      week = as.integer(game$week),
      home_team = as.character(game$home_team),
      away_team = as.character(game$away_team),
      home_score = as.integer(game$home_score),
      away_score = as.integer(game$away_score),
      status = ifelse(is.na(game$home_score), "scheduled", "final"),
      date_utc = date_utc,
      spread_line = spread_line,
      home_metrics = list(
        epa_offense_percentile = 50,
        epa_offense_value = 0,
        epa_defense_percentile = 50,
        epa_defense_value = 0,
        scoring_drive_rate = 0.3,
        td_drive_rate = 0.15,
        turnover_drive_rate = 0.1,
        pass_neutral_rate = 0.48,
        third_down_efficiency = 0.38,
        penalties_offensive = 0,
        penalties_defensive = 0
      ),
      away_metrics = list(
        epa_offense_percentile = 50,
        epa_offense_value = 0,
        epa_defense_percentile = 50,
        epa_defense_value = 0,
        scoring_drive_rate = 0.3,
        td_drive_rate = 0.15,
        turnover_drive_rate = 0.1,
        pass_neutral_rate = 0.48,
        third_down_efficiency = 0.38,
        penalties_offensive = 0,
        penalties_defensive = 0
      )
    )
  }
} else {
  # Pro Football Reference format
  for (i in 1:nrow(schedule_data)) {
    game <- schedule_data[i, ]

    # Extraer equipos del formato PFR
    visitor <- if ("Visitor" %in% names(game)) game$Visitor else game$Away
    home <- if ("Home" %in% names(game)) game$Home else game$Home
    pts_vis <- if ("PtsV" %in% names(game)) as.integer(game$PtsV) else 0
    pts_home <- if ("PtsH" %in% names(game)) as.integer(game$PtsH) else 0

    # Extraer spread line del formato PFR (usualmente en columna "Over/Under" o similar)
    # PFR puede tener línea en formato "HOU -3" o similar
    spread_line <- NA
    if ("Over/Under" %in% names(game) && !is.na(game[["Over/Under"]])) {
      spread_line <- as.character(game[["Over/Under"]])
    } else if ("Spread" %in% names(game) && !is.na(game[["Spread"]])) {
      spread_line <- as.character(game[["Spread"]])
    }

    games_list[[i]] <- list(
      game_id = paste0("2026", sprintf("%03d", i)),
      week = as.integer(i %/% 16 + 1),
      home_team = as.character(home),
      away_team = as.character(visitor),
      home_score = pts_home,
      away_score = pts_vis,
      status = ifelse(pts_home == 0 && pts_vis == 0, "scheduled", "final"),
      spread_line = spread_line,
      home_metrics = list(
        epa_offense_percentile = 50,
        epa_offense_value = 0,
        epa_defense_percentile = 50,
        epa_defense_value = 0,
        scoring_drive_rate = 0.3,
        td_drive_rate = 0.15,
        turnover_drive_rate = 0.1,
        pass_neutral_rate = 0.48,
        third_down_efficiency = 0.38,
        penalties_offensive = 0,
        penalties_defensive = 0
      ),
      away_metrics = list(
        epa_offense_percentile = 50,
        epa_offense_value = 0,
        epa_defense_percentile = 50,
        epa_defense_value = 0,
        scoring_drive_rate = 0.3,
        td_drive_rate = 0.15,
        turnover_drive_rate = 0.1,
        pass_neutral_rate = 0.48,
        third_down_efficiency = 0.38,
        penalties_offensive = 0,
        penalties_defensive = 0
      )
    )
  }
}

# Exportar
output_file <- file.path(OUTPUT_DIR, "games_by_week.json")
write_json(games_list, output_file, pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ Schedule 2026 generado:\n")
cat("  Total partidos:", length(games_list), "\n")
cat("  Ubicación:", output_file, "\n")
cat("\nNOTA: Los scores en vivo se cargarán desde ESPN mediante el proxy /api/espn\n")
