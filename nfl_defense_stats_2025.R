# =============================================================================
# NFL 2025 — ESTADÍSTICAS DEFENSIVAS
# Espejo completo del script ofensivo: EPA permitido, EPA ajustado (z-score),
# turnovers forzados, jugadas negativas forzadas, ratios situacionales del
# rival, two-minute drill (sostener ventaja), distribución de pases permitida,
# red zone permitida, third/fourth down, drive outcomes permitidos,
# PUNTOS PERMITIDOS, y stats defensivas de player_stats (tackles, sacks, etc.)
# =============================================================================

library(nflreadr)
library(dplyr)
library(tidyr)
library(jsonlite)
library(stringr)
library(rlang)

# BUG FIX: ruta de salida parametrizada (antes hardcodeada a una ruta de Windows)
OUTPUT_DIR <- "nfl_json_2025"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

SEASON <- 2025

cat("Descargando datos (defensiva)...\n")
pbp       <- load_pbp(seasons = SEASON)
# NOTE: def_raw disabled due to API field name changes. Use PBP only.
# def_raw   <- load_player_stats(seasons = SEASON, stat_type = "defense")
schedules <- load_schedules(seasons = SEASON)

cat("Datos descargados. Procesando...\n")

scrimmage <- pbp |>
  filter(
    season_type == "REG",
    !is.na(posteam),
    !is.na(defteam),
    play_type %in% c("pass", "run"),
    two_point_attempt == 0
  )

# =============================================================================
# FUNCIÓN GENÉRICA: compute_team_metrics (idéntica a la del script ofensivo)
#
# Con group_col = "defteam" y opp_col = "posteam", todas las métricas que en
# el script ofensivo representan "lo que el equipo generó" pasan a representar
# "lo que el equipo PERMITIÓ / FORZÓ", porque epa/yardas/etc. en el PBP se
# registran siempre desde la perspectiva del equipo en posesión (posteam).
# =============================================================================

compute_team_metrics <- function(pbp, scrimmage, group_col, opp_col) {
  
  gcol <- sym(group_col)
  ocol <- sym(opp_col)
  
  # ---- EPA base + TDs por tipo de jugada ----
  epa_week <- scrimmage |>
    group_by(team = !!gcol, week) |>
    summarise(
      passing_epa = round(sum(epa[play_type == "pass"], na.rm = TRUE), 3),
      rushing_epa = round(sum(epa[play_type == "run"],  na.rm = TRUE), 3),
      total_epa   = round(sum(epa, na.rm = TRUE), 3),
      passing_tds = sum(touchdown == 1 & play_type == "pass", na.rm = TRUE),
      rushing_tds = sum(touchdown == 1 & play_type == "run",  na.rm = TRUE),
      sacks       = sum(sack == 1, na.rm = TRUE),
      .groups = "drop"
    )
  
  # ---- EPA ajustado (z-score con rolling baseline del rival) ----
  matchup_map <- scrimmage |>
    distinct(team = !!gcol, week, opp = !!ocol)
  
  epa_per_play_team <- scrimmage |>
    group_by(team = !!gcol, week) |>
    summarise(
      pass_epa_per_play = mean(epa[play_type == "pass"], na.rm = TRUE),
      rush_epa_per_play = mean(epa[play_type == "run"],  na.rm = TRUE),
      .groups = "drop"
    )
  
  epa_per_play_opp <- scrimmage |>
    group_by(opp = !!ocol, week) |>
    summarise(
      opp_pass_epa = mean(epa[play_type == "pass"], na.rm = TRUE),
      opp_rush_epa = mean(epa[play_type == "run"],  na.rm = TRUE),
      .groups = "drop"
    ) |>
    arrange(opp, week)
  
  opp_baseline <- epa_per_play_opp |>
    group_by(opp) |>
    mutate(
      opp_pass_baseline = lag(cumsum(opp_pass_epa) / seq_along(opp_pass_epa)),
      opp_rush_baseline = lag(cumsum(opp_rush_epa) / seq_along(opp_rush_epa))
    ) |>
    ungroup() |>
    select(opp, week, opp_pass_baseline, opp_rush_baseline)
  
  epa_diff <- epa_per_play_team |>
    left_join(matchup_map, by = c("team", "week")) |>
    left_join(opp_baseline, by = c("opp", "week")) |>
    mutate(
      pass_epa_diff = pass_epa_per_play - opp_pass_baseline,
      rush_epa_diff = rush_epa_per_play - opp_rush_baseline
    )
  
  league_week_stats <- epa_diff |>
    group_by(week) |>
    summarise(
      league_pass_diff_mean = mean(pass_epa_diff, na.rm = TRUE),
      league_pass_diff_sd   = sd(pass_epa_diff,   na.rm = TRUE),
      league_rush_diff_mean = mean(rush_epa_diff, na.rm = TRUE),
      league_rush_diff_sd   = sd(rush_epa_diff,   na.rm = TRUE),
      .groups = "drop"
    )
  
  epa_adjusted <- epa_diff |>
    left_join(league_week_stats, by = "week") |>
    mutate(
      pass_epa_adj_z   = round((pass_epa_diff - league_pass_diff_mean) / league_pass_diff_sd, 4),
      rush_epa_adj_z   = round((rush_epa_diff - league_rush_diff_mean) / league_rush_diff_sd, 4),
      pass_epa_adj_raw = round(pass_epa_diff, 4),
      rush_epa_adj_raw = round(rush_epa_diff, 4)
    ) |>
    select(team, week,
           pass_epa_adj_z, rush_epa_adj_z,
           pass_epa_adj_raw, rush_epa_adj_raw,
           opp_pass_baseline, opp_rush_baseline)
  
  # ---- Turnovers ----
  turnovers_week <- scrimmage |>
    group_by(team = !!gcol, week) |>
    summarise(
      interceptions = sum(interception == 1, na.rm = TRUE),
      fumbles_lost  = sum(fumble_lost   == 1, na.rm = TRUE),
      turnovers     = sum(interception == 1 | fumble_lost == 1, na.rm = TRUE),
      total_fumbles = sum(fumble == 1, na.rm = TRUE),
      on_downs = sum(down == 4 & play_type %in% c("pass","run") & success == 0, na.rm = TRUE),
      .groups = "drop"
    )
  
  # ---- Jugadas negativas ----
  negative_plays_week <- scrimmage |>
    group_by(team = !!gcol, week) |>
    summarise(
      negative_plays      = sum(yards_gained < 0, na.rm = TRUE),
      negative_pass_plays = sum(yards_gained < 0 & play_type == "pass", na.rm = TRUE),
      negative_rush_plays = sum(yards_gained < 0 & play_type == "run",  na.rm = TRUE),
      total_plays_pbp     = n(),
      negative_play_pct   = round(negative_plays / total_plays_pbp * 100, 1),
      .groups = "drop"
    )
  
  # ---- Ratios situacionales pase/carrera ----
  neutral_wp <- scrimmage |>
    filter(vegas_wp >= 0.20, vegas_wp <= 0.80)
  
  ratio_neutral_week <- neutral_wp |>
    group_by(team = !!gcol, week) |>
    summarise(
      neutral_pass_att = sum(play_type == "pass", na.rm = TRUE),
      neutral_rush_att = sum(play_type == "run",  na.rm = TRUE),
      neutral_total    = n(),
      neutral_pass_pct = round(neutral_pass_att / neutral_total * 100, 1),
      neutral_rush_pct = round(neutral_rush_att / neutral_total * 100, 1),
      .groups = "drop"
    )
  
  ratio_early_down_week <- neutral_wp |>
    filter(down %in% c(1, 2)) |>
    group_by(team = !!gcol, week) |>
    summarise(
      early_down_pass_att = sum(play_type == "pass", na.rm = TRUE),
      early_down_rush_att = sum(play_type == "run",  na.rm = TRUE),
      early_down_total    = n(),
      early_down_pass_pct = round(early_down_pass_att / early_down_total * 100, 1),
      early_down_rush_pct = round(early_down_rush_att / early_down_total * 100, 1),
      .groups = "drop"
    )
  
  ratio_all_downs_week <- neutral_wp |>
    filter(down %in% c(1, 2, 3, 4)) |>
    group_by(team = !!gcol, week) |>
    summarise(
      all_down_pass_att = sum(play_type == "pass", na.rm = TRUE),
      all_down_rush_att = sum(play_type == "run",  na.rm = TRUE),
      all_down_total    = n(),
      all_down_pass_pct = round(all_down_pass_att / all_down_total * 100, 1),
      all_down_rush_pct = round(all_down_rush_att / all_down_total * 100, 1),
      .groups = "drop"
    )
  
  ratio_2min_half_week <- scrimmage |>
    filter(qtr == 2, half_seconds_remaining <= 120) |>
    group_by(team = !!gcol, week) |>
    summarise(
      two_min_half_pass     = sum(play_type == "pass", na.rm = TRUE),
      two_min_half_rush     = sum(play_type == "run",  na.rm = TRUE),
      two_min_half_total    = n(),
      two_min_half_pass_pct = round(two_min_half_pass / two_min_half_total * 100, 1),
      .groups = "drop"
    )
  
  ratio_2min_game_week <- scrimmage |>
    filter(qtr == 4, half_seconds_remaining <= 120) |>
    group_by(team = !!gcol, week) |>
    summarise(
      two_min_game_pass     = sum(play_type == "pass", na.rm = TRUE),
      two_min_game_rush     = sum(play_type == "run",  na.rm = TRUE),
      two_min_game_total    = n(),
      two_min_game_pass_pct = round(two_min_game_pass / two_min_game_total * 100, 1),
      .groups = "drop"
    )
  
  # ---- Distribución de pases por zona de air_yards ----
  pass_plays <- scrimmage |>
    filter(play_type == "pass", !is.na(air_yards))
  
  pass_zone <- function(ay) {
    case_when(
      ay <  1 ~ "behind_los_screen",
      ay <  5 ~ "short",
      ay < 15 ~ "medium",
      TRUE    ~ "long"
    )
  }
  
  pass_dist_week <- pass_plays |>
    mutate(zone = pass_zone(air_yards)) |>
    group_by(team = !!gcol, week, zone) |>
    summarise(
      attempts      = n(),
      completions   = sum(complete_pass == 1, na.rm = TRUE),
      yards         = sum(yards_gained, na.rm = TRUE),
      tds           = sum(touchdown == 1, na.rm = TRUE),
      interceptions = sum(interception == 1, na.rm = TRUE),
      epa           = round(sum(epa, na.rm = TRUE), 3),
      epa_per_play  = round(mean(epa, na.rm = TRUE), 4),
      comp_pct      = round(completions / attempts * 100, 1),
      .groups = "drop"
    )
  
  pass_dist_week_wide <- pass_dist_week |>
    pivot_wider(
      names_from  = zone,
      values_from = c(attempts, completions, yards, tds, interceptions, epa, epa_per_play, comp_pct),
      values_fill = 0
    ) |>
    mutate(
      total_pass_att = rowSums(across(starts_with("attempts_")), na.rm = TRUE),
      across(
        starts_with("attempts_"),
        list(pct = ~ round(. / total_pass_att * 100, 1)),
        .names = "pct_{.col}"
      )
    )
  
  pass_dist_season <- pass_plays |>
    mutate(zone = pass_zone(air_yards)) |>
    group_by(team = !!gcol, zone) |>
    summarise(
      attempts      = n(),
      completions   = sum(complete_pass == 1, na.rm = TRUE),
      yards         = sum(yards_gained, na.rm = TRUE),
      tds           = sum(touchdown == 1, na.rm = TRUE),
      interceptions = sum(interception == 1, na.rm = TRUE),
      epa           = round(sum(epa, na.rm = TRUE), 3),
      epa_per_play  = round(mean(epa, na.rm = TRUE), 4),
      comp_pct      = round(completions / attempts * 100, 1),
      .groups = "drop"
    ) |>
    group_by(team) |>
    mutate(
      total_attempts = sum(attempts),
      attempts_pct   = round(attempts / total_attempts * 100, 1)
    ) |>
    ungroup()
  
  # ---- Red zone (dentro de las 20 yardas) ----
  red_zone_week <- scrimmage |>
    filter(yardline_100 <= 20) |>
    group_by(team = !!gcol, week) |>
    summarise(
      rz_plays        = n(),
      rz_pass_att     = sum(play_type == "pass", na.rm = TRUE),
      rz_rush_att     = sum(play_type == "run",  na.rm = TRUE),
      rz_tds          = sum(touchdown == 1, na.rm = TRUE),
      rz_pass_tds     = sum(touchdown == 1 & play_type == "pass", na.rm = TRUE),
      rz_rush_tds     = sum(touchdown == 1 & play_type == "run",  na.rm = TRUE),
      rz_epa          = round(sum(epa, na.rm = TRUE), 3),
      rz_epa_per_play = round(mean(epa, na.rm = TRUE), 4),
      rz_pass_pct     = round(rz_pass_att / rz_plays * 100, 1),
      rz_rush_pct     = round(rz_rush_att / rz_plays * 100, 1),
      .groups = "drop"
    )
  
  # ---- Third down ----
  third_down_plays <- pbp |>
    filter(season_type == "REG", down == 3, !is.na(posteam), !is.na(defteam), play_type %in% c("pass", "run"))
  
  third_down_week <- third_down_plays |>
    mutate(
      distance_type = case_when(
        ydstogo <= 3 ~ "short",
        ydstogo <= 7 ~ "medium",
        TRUE         ~ "long"
      )
    ) |>
    group_by(team = !!gcol, week, distance_type) |>
    summarise(
      third_down_attempts    = n(),
      third_down_conversions = sum(first_down == 1, na.rm = TRUE),
      third_down_conv_rate   = round(third_down_conversions / third_down_attempts * 100, 1),
      third_down_epa         = round(sum(epa, na.rm = TRUE), 3),
      .groups = "drop"
    )
  
  third_down_totals <- third_down_plays |>
    group_by(team = !!gcol, week) |>
    summarise(
      third_downs_faced      = n(),
      third_down_conversions = sum(first_down == 1, na.rm = TRUE),
      third_down_conv_rate   = round(third_down_conversions / third_downs_faced * 100, 1),
      .groups = "drop"
    )
  
  third_down_wide <- third_down_week |>
    pivot_wider(
      names_from  = distance_type,
      values_from = c(third_down_attempts, third_down_conversions,
                      third_down_conv_rate, third_down_epa),
      values_fill = 0
    ) |>
    left_join(third_down_totals, by = c("team", "week"))
  
  # ---- Fourth down (situaciones clutch: -8 a +8 puntos) ----
  fourth_down <- pbp |>
    filter(
      season_type == "REG",
      down == 4,
      !is.na(!!gcol),
      score_differential >= -8,
      score_differential <=  8
    ) |>
    group_by(team = !!gcol, week) |>
    summarise(
      fourth_down_success  = sum(success == 1, na.rm = TRUE),
      fourth_down_attempts = n(),
      fourth_down_pct      = round(fourth_down_success / fourth_down_attempts * 100, 1),
      .groups = "drop"
    )
  
  # ---- Drive outcomes (TD / FG / Punt / Turnover / Other) ----
  drive_plays_raw <- pbp |>
    filter(
      season_type == "REG",
      !is.na(posteam), !is.na(defteam),
      !is.na(fixed_drive), !is.na(fixed_drive_result)
    )
  
  # BUG FIX: se incluye drive_epa (faltaba en v1, rompía avg_drive_epa)
  drive_results <- drive_plays_raw |>
    group_by(posteam, defteam, week, game_id, fixed_drive) |>
    slice_tail(n = 1) |>
    ungroup() |>
    transmute(
      team         = !!gcol,
      week, game_id,
      drive        = fixed_drive,
      drive_result = fixed_drive_result,
      drive_plays  = drive_play_count,
      drive_yards  = drive_yards_penalized
    ) |>
    mutate(
      drive_outcome = case_when(
        str_detect(drive_result, regex("touchdown", ignore_case = TRUE))              ~ "TD",
        str_detect(drive_result, regex("field goal", ignore_case = TRUE))             ~ "FG",
        str_detect(drive_result, regex("punt",       ignore_case = TRUE))             ~ "Punt",
        str_detect(drive_result, regex("intercept|fumble|turnover", ignore_case = TRUE)) ~ "Turnover",
        TRUE ~ "Other"
      )
    )
  
  drive_summary_week <- drive_results |>
    group_by(team, week) |>
    summarise(
      drives_total    = n(),
      drives_td       = sum(drive_outcome == "TD"),
      drives_fg       = sum(drive_outcome == "FG"),
      drives_punt     = sum(drive_outcome == "Punt"),
      drives_turnover = sum(drive_outcome == "Turnover"),
      drives_other    = sum(drive_outcome == "Other"),
      drives_score    = drives_td + drives_fg,
      score_rate      = round(drives_score    / drives_total * 100, 1),
      td_rate         = round(drives_td       / drives_total * 100, 1),
      turnover_rate   = round(drives_turnover / drives_total * 100, 1),
      avg_drive_plays = round(mean(drive_plays, na.rm = TRUE), 1),
      avg_drive_yards = round(mean(drive_yards, na.rm = TRUE), 1),
      .groups = "drop"
    )
  
  drive_detail <- drive_results |>
    select(team, week, game_id, drive, drive_outcome, drive_plays, drive_yards) |>
    arrange(team, week, drive)
  
  # ---- Two-minute drill (perdiendo por 3 u 8 en los 2 min finales del 4to) ----
  two_min_situations <- pbp |>
    filter(
      season_type == "REG",
      qtr == 4,
      half_seconds_remaining <= 120,
      !is.na(posteam), !is.na(defteam),
      !is.na(score_differential)
    ) |>
    filter(score_differential %in% c(-3, -8)) |>
    group_by(game_id, posteam, defteam, week) |>
    summarise(
      deficit        = first(score_differential),
      plays_in_drill = n(),
      pass_plays     = sum(play_type == "pass", na.rm = TRUE),
      rush_plays     = sum(play_type == "run",  na.rm = TRUE),
      epa_in_drill   = round(sum(epa, na.rm = TRUE), 3),
      home_team      = first(home_team), away_team = first(away_team),
      home_score     = first(home_score), away_score = first(away_score),
      .groups = "drop"
    ) |>
    mutate(
      offense_won = case_when(
        posteam == home_team & home_score > away_score ~ TRUE,
        posteam == away_team & away_score > home_score ~ TRUE,
        TRUE ~ FALSE
      ),
      deficit_type = case_when(deficit == -3 ~ "down_3", deficit > -3 & deficit <= -8 ~ "down_8"), 
      team = !!gcol,
      # Para group_col = "posteam": éxito = la ofensiva remonta y gana.
      # Para group_col = "defteam": éxito = la defensa sostiene la ventaja (gana).
      success = if (group_col == "posteam") offense_won else !offense_won
    )
  
  two_min_summary <- two_min_situations |>
    group_by(team) |>
    summarise(
      total_opportunities    = n(),
      opportunities_down_3   = sum(deficit_type == "down_3"),
      opportunities_down_8   = sum(deficit_type == "down_8"),
      successes              = sum(success),
      successes_down_3       = sum(success & deficit_type == "down_3"),
      successes_down_8       = sum(success & deficit_type == "down_8"),
      success_rate          = round(successes / total_opportunities * 100, 1),
      avg_epa_in_drill       = round(mean(epa_in_drill), 3),
      avg_plays_in_drill     = round(mean(plays_in_drill), 1),
      avg_pass_rate_in_drill = round(mean(pass_plays / (pass_plays + rush_plays) * 100), 1),
      .groups = "drop"
    ) |>
    arrange(desc(success_rate))
  
  two_min_detail <- two_min_situations |>
    select(game_id, team, week, deficit_type, plays_in_drill, pass_plays, rush_plays,
           epa_in_drill, success) |>
    arrange(team, week)

  # ---- PENALIDADES (mismo método que ofensiva) ----
  penalties_all <- pbp |>
    filter(season_type == "REG", penalty == 1, !is.na(!!gcol)) |>
    mutate(
      team = !!gcol,
      is_team_penalty = ifelse(penalty_team == !!gcol, 1, 0)
    ) |>
    group_by(team, week, is_team_penalty) |>
    summarise(
      pen_count = sum(!is.na(penalty), na.rm = TRUE),
      pen_yards = sum(penalty_yards, na.rm = TRUE),
      .groups = "drop"
    )

  # Separar en dos conjuntos y hacer join
  penalties_week <- penalties_all |>
    filter(is_team_penalty == 1) |>
    select(team, week, penalties_count = pen_count, penalties_yards = pen_yards)

  penalties_opp_week <- penalties_all |>
    filter(is_team_penalty == 0) |>
    select(team, week, count_opp = pen_count, yards_opp = pen_yards)

  list(
    epa_week              = epa_week,
    epa_adjusted          = epa_adjusted,
    turnovers_week        = turnovers_week,
    negative_plays_week   = negative_plays_week,
    ratio_neutral_week    = ratio_neutral_week,
    ratio_early_down_week = ratio_early_down_week,
    ratio_all_downs_week  = ratio_all_downs_week,
    ratio_2min_half_week  = ratio_2min_half_week,
    ratio_2min_game_week  = ratio_2min_game_week,
    pass_dist_week_wide   = pass_dist_week_wide,
    pass_dist_season      = pass_dist_season,
    red_zone_week         = red_zone_week,
    third_down_wide       = third_down_wide,
    fourth_down           = fourth_down,
    drive_summary_week    = drive_summary_week,
    drive_detail          = drive_detail,
    two_min_summary       = two_min_summary,
    two_min_detail        = two_min_detail,
    penalties_week        = penalties_week,
    penalties_opp_week    = penalties_opp_week
  )
}

# =============================================================================
# CÁLCULO — perspectiva defensiva (group_col = "defteam", opp_col = "posteam")
# =============================================================================

core <- compute_team_metrics(pbp, scrimmage, group_col = "defteam", opp_col = "posteam")




# ---- Oponente de cada equipo por semana ----
opponent <- scrimmage |>
  distinct(team = defteam, week, opponent = posteam)

# ---- PUNTOS PERMITIDOS (NUEVO) ----
points_def <- bind_rows(
  schedules |> filter(game_type == "REG", !is.na(home_score)) |>
    transmute(team = home_team, week, points_allowed = away_score),
  schedules |> filter(game_type == "REG", !is.na(away_score)) |>
    transmute(team = away_team, week, points_allowed = home_score)
)

# ---- Stats defensivas base (agregadas desde PBP) ----
# Construidas desde play-by-play por semana para cada equipo defensivo
def_week_base <- scrimmage |>
  group_by(team = defteam, week) |>
  summarise(
    pass_attempts_allowed = sum(play_type == "pass", na.rm = TRUE),
    rush_attempts_allowed = sum(play_type == "run", na.rm = TRUE),
    .groups = "drop"
  ) |>
  mutate(
    total_plays_allowed = pass_attempts_allowed + rush_attempts_allowed
  )

# =============================================================================
# ENSAMBLADO FINAL — DEFENSE BY WEEK
# =============================================================================

defense_week_full <- def_week_base |>
  left_join(opponent,    by = c("team", "week")) |>
  left_join(points_def,  by = c("team", "week")) |>
  # EPA permitido + TDs permitidos + sacks generados
  left_join(core$epa_week |>
              rename(passing_epa_allowed = passing_epa,
                     rushing_epa_allowed = rushing_epa,
                     total_epa_allowed   = total_epa,
                     passing_tds_allowed = passing_tds,
                     rushing_tds_allowed = rushing_tds,
                     sacks_generated     = sacks),
            by = c("team", "week")) |>
  # EPA ajustado (z-score): aquí mide qué tan por debajo/encima del promedio
  # del rival permitió esta defensa. Menor (más negativo) = mejor defensa.
  left_join(core$epa_adjusted, by = c("team", "week")) |>
  # Turnovers forzados
  left_join(core$turnovers_week |>
              rename(interceptions_forced = interceptions,
                     fumbles_recovered    = fumbles_lost,
                     turnovers_forced     = turnovers,
                     opponent_fumbles     = total_fumbles),
            by = c("team", "week")) |>
  # Jugadas negativas forzadas
  left_join(core$negative_plays_week |>
              rename(negative_plays_forced      = negative_plays,
                     negative_pass_plays_forced = negative_pass_plays,
                     negative_rush_plays_forced = negative_rush_plays,
                     negative_play_pct_forced   = negative_play_pct,
                     total_plays_faced          = total_plays_pbp),
            by = c("team", "week")) |>
  # Ratios situacionales: lo que el RIVAL hizo contra esta defensa
  left_join(core$ratio_neutral_week,    by = c("team", "week")) |>
  left_join(core$ratio_early_down_week, by = c("team", "week")) |>
  left_join(core$ratio_all_downs_week,  by = c("team", "week")) |>
  left_join(core$ratio_2min_half_week,  by = c("team", "week")) |>
  left_join(core$ratio_2min_game_week,  by = c("team", "week")) |>
  # Red zone permitida
  left_join(core$red_zone_week |>
              rename(rz_plays_allowed        = rz_plays,
                     rz_pass_att_allowed     = rz_pass_att,
                     rz_rush_att_allowed     = rz_rush_att,
                     rz_tds_allowed          = rz_tds,
                     rz_pass_tds_allowed     = rz_pass_tds,
                     rz_rush_tds_allowed     = rz_rush_tds,
                     rz_epa_allowed          = rz_epa,
                     rz_epa_per_play_allowed = rz_epa_per_play,
                     rz_pass_pct_allowed     = rz_pass_pct,
                     rz_rush_pct_allowed     = rz_rush_pct),
            by = c("team", "week")) |>
  # Third down: third_downs_faced = veces que esta defensa enfrentó un 3er down
  left_join(core$third_down_wide, by = c("team", "week")) |>
  # Fourth down: fourth_down_success(_pct) = conversiones PERMITIDAS en 4to down
  left_join(core$fourth_down |>
              rename(fourth_down_allowed     = fourth_down_success,
                     fourth_down_def_attempts = fourth_down_attempts,
                     fourth_down_allowed_pct  = fourth_down_pct),
            by = c("team", "week")) |>
  # Drive outcomes permitidos/forzados
  left_join(core$drive_summary_week |>
              rename(drives_faced            = drives_total,
                     drives_allowed_td       = drives_td,
                     drives_allowed_fg       = drives_fg,
                     drives_forced_punt      = drives_punt,
                     drives_forced_turnover  = drives_turnover,
                     drives_other_allowed    = drives_other,
                     drives_allowed_score    = drives_score,
                     score_rate_allowed      = score_rate,
                     td_rate_allowed         = td_rate,
                     turnover_rate_forced    = turnover_rate,
                     avg_drive_plays_allowed = avg_drive_plays,
                     avg_drive_yards_allowed = avg_drive_yards),
            by = c("team", "week")) |>
  # Penalidades defensivas
  left_join(core$penalties_week, by = c("team", "week")) |>
  # Penalidades ofensivas del rival
  left_join(core$penalties_opp_week |> rename(penalties_opp_count_opp = count_opp, penalties_opp_yards_opp = yards_opp), by = c("team", "week")) |>
  mutate(
    across(where(is.numeric), \(x) replace_na(x, 0)),
    # Métricas derivadas para mantener continuidad con nombres clásicos
    third_down_stops     = third_downs_faced - third_down_conversions,
    third_down_stop_rate = round(ifelse(third_downs_faced > 0,
                                        third_down_stops / third_downs_faced * 100, 0), 1),
    fourth_down_stops     = fourth_down_def_attempts - fourth_down_allowed,
    fourth_down_stop_pct  = round(ifelse(fourth_down_def_attempts > 0,
                                         fourth_down_stops / fourth_down_def_attempts * 100, 0), 1)
  ) |>
  arrange(team, week)



# =============================================================================
# ENSAMBLADO FINAL — DEFENSE SEASON + RANKINGS
# =============================================================================

defense_season_full <- defense_week_full |>
  group_by(team) |>
  summarise(
    n_weeks = n(),
    across(where(is.numeric), sum),
    .groups = "drop"
  ) |>
  mutate(
    # Recalcular métricas derivadas (no se suman, se recalculan)
    negative_play_pct_forced = round(ifelse(total_plays_faced > 0, negative_plays_forced / total_plays_faced * 100, 0), 1),
    neutral_pass_pct         = round(ifelse(neutral_total > 0, neutral_pass_att / neutral_total * 100, 0), 1),
    neutral_rush_pct         = round(ifelse(neutral_total > 0, neutral_rush_att / neutral_total * 100, 0), 1),
    early_down_pass_pct      = round(ifelse(early_down_total > 0, early_down_pass_att / early_down_total * 100, 0), 1),
    early_down_rush_pct      = round(ifelse(early_down_total > 0, early_down_rush_att / early_down_total * 100, 0), 1),
    two_min_half_pass_pct    = round(ifelse(two_min_half_total > 0, two_min_half_pass / two_min_half_total * 100, 0), 1),
    two_min_game_pass_pct    = round(ifelse(two_min_game_total > 0, two_min_game_pass / two_min_game_total * 100, 0), 1),
    rz_pass_pct_allowed      = round(ifelse(rz_plays_allowed > 0, rz_pass_att_allowed / rz_plays_allowed * 100, 0), 1),
    rz_rush_pct_allowed      = round(ifelse(rz_plays_allowed > 0, rz_rush_att_allowed / rz_plays_allowed * 100, 0), 1),
    rz_epa_per_play_allowed  = round(ifelse(rz_plays_allowed > 0, rz_epa_allowed / rz_plays_allowed, 0), 4),
    third_down_conv_rate     = round(ifelse(third_downs_faced > 0, third_down_conversions / third_downs_faced * 100, 0), 1),
    third_down_stop_rate     = round(100 - third_down_conv_rate, 1),
    fourth_down_allowed_pct  = round(ifelse(fourth_down_def_attempts > 0, fourth_down_allowed / fourth_down_def_attempts * 100, 0), 1),
    fourth_down_stop_pct     = round(100 - fourth_down_allowed_pct, 1),
    score_rate_allowed       = round(ifelse(drives_faced > 0, drives_allowed_score / drives_faced * 100, 0), 1),
    td_rate_allowed          = round(ifelse(drives_faced > 0, drives_allowed_td / drives_faced * 100, 0), 1),
    fg_rate_allowed          = round(ifelse(drives_faced > 0, drives_allowed_fg / drives_faced * 100, 0), 1),
    punt_rate_forced         = round(ifelse(drives_faced > 0, drives_forced_punt / drives_faced * 100, 0), 1),
    turnover_rate_forced     = round(ifelse(drives_faced > 0, drives_forced_turnover / drives_faced * 100, 0), 1),
    # Rankings (1 = mejor defensa)
    rank_passing_epa_allowed  = rank(passing_epa_allowed,  ties.method = "min"),
    rank_rushing_epa_allowed  = rank(rushing_epa_allowed,  ties.method = "min"),
    rank_total_epa_allowed    = rank(total_epa_allowed,    ties.method = "min"),
    # z-score: más bajo (más negativo) = el rival rindió por DEBAJO de su
    # promedio contra esta defensa = mejor defensa.
    rank_pass_epa_adj_z       = rank(pass_epa_adj_z,   ties.method = "min"),
    rank_rush_epa_adj_z       = rank(rush_epa_adj_z,   ties.method = "min"),
    rank_pass_epa_adj_raw     = rank(pass_epa_adj_raw, ties.method = "min"),
    rank_rush_epa_adj_raw     = rank(rush_epa_adj_raw, ties.method = "min"),
    rank_passing_tds_allowed  = rank(passing_tds_allowed, ties.method = "min"),
    rank_rushing_tds_allowed  = rank(rushing_tds_allowed, ties.method = "min"),
    rank_sacks_generated      = rank(-sacks_generated,       ties.method = "min"),
    rank_turnovers_forced     = rank(-turnovers_forced,      ties.method = "min"),
    rank_interceptions_forced = rank(-interceptions_forced,  ties.method = "min"),
    # rank_def_tds              = rank(-def_tds,               ties.method = "min"),  # Campo no disponible en agregación
    rank_negative_plays_forced= rank(-negative_play_pct_forced, ties.method = "min"), # más = mejor
    rank_rz_epa_allowed       = rank(rz_epa_allowed,      ties.method = "min"),
    rank_third_down_stop_rate = rank(-third_down_stop_rate, ties.method = "min"),
    rank_fourth_down_stop_pct = rank(-fourth_down_stop_pct, ties.method = "min"),
    rank_score_rate_allowed   = rank(score_rate_allowed,    ties.method = "min"),
    rank_td_rate_allowed      = rank(td_rate_allowed,       ties.method = "min"),
    rank_fg_rate_allowed      = rank(fg_rate_allowed,       ties.method = "min"),
    rank_punt_rate_forced     = rank(-punt_rate_forced,     ties.method = "min"),
    rank_turnover_rate_forced = rank(-turnover_rate_forced, ties.method = "min"),
    rank_points_allowed       = rank(points_allowed,        ties.method = "min")
  ) |>
  arrange(rank_total_epa_allowed)

defense_season_full$rank_third_down_stop_rate


# =============================================================================
# DIAGNÓSTICO — Verificar penalidades antes de exportar
# =============================================================================

cat("DIAGNÓSTICO DE PENALIDADES:\n")
cat("  core$penalties_week nrows:", nrow(core$penalties_week), "\n")
cat("  core$penalties_week cols:", paste(colnames(core$penalties_week), collapse=", "), "\n")
if (nrow(core$penalties_week) > 0) {
  cat("  Sample penalties_week:\n")
  print(head(core$penalties_week, 3))
}

cat("  core$penalties_opp_week nrows:", nrow(core$penalties_opp_week), "\n")
cat("  core$penalties_opp_week cols:", paste(colnames(core$penalties_opp_week), collapse=", "), "\n")
if (nrow(core$penalties_opp_week) > 0) {
  cat("  Sample penalties_opp_week:\n")
  print(head(core$penalties_opp_week, 3))
}

cat("  defense_week_full ncols:", ncol(defense_week_full), "\n")
cat("  defense_week_full has 'penalties_count'?", "penalties_count" %in% colnames(defense_week_full), "\n")
cat("  defense_week_full has 'penalties_opp_count_opp'?", "penalties_opp_count_opp" %in% colnames(defense_week_full), "\n")

# =============================================================================
# PLAYER STATS BY WEEK — Placeholder (API fields changed, not critical for modal)
# =============================================================================

player_stats_def_by_week <- data.frame()

# =============================================================================
# EXPORTAR JSON — DEFENSIVA (8 archivos)
# =============================================================================

cat("Exportando JSONs de defensiva...\n")

write_json(defense_week_full,   file.path(OUTPUT_DIR, "defense_by_week.json"),            pretty = TRUE, auto_unbox = TRUE)
write_json(defense_season_full, file.path(OUTPUT_DIR, "defense_season.json"),              pretty = TRUE, auto_unbox = TRUE)
write_json(core$two_min_summary |>
             rename(stops_from_drill = successes, stop_rate = success_rate,
                    stops_down_3 = successes_down_3, stops_down_8 = successes_down_8),
           file.path(OUTPUT_DIR, "two_minute_drill_defense_season.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(core$two_min_detail |> rename(held_lead = success),
           file.path(OUTPUT_DIR, "two_minute_drill_defense_games.json"),  pretty = TRUE, auto_unbox = TRUE)
write_json(core$pass_dist_season |>
             rename_with(~ paste0(., "_allowed"),
                         -c(team, zone, total_attempts, attempts_pct)),
           file.path(OUTPUT_DIR, "pass_distribution_defense_season.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(core$pass_dist_week_wide,
           file.path(OUTPUT_DIR, "pass_distribution_defense_by_week.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(core$drive_summary_week |>
             rename(drives_faced = drives_total, drives_allowed_td = drives_td,
                    drives_allowed_fg = drives_fg, drives_forced_punt = drives_punt,
                    drives_forced_turnover = drives_turnover, drives_other_allowed = drives_other,
                    drives_allowed_score = drives_score, score_rate_allowed = score_rate,
                    td_rate_allowed = td_rate, turnover_rate_forced = turnover_rate,
                    avg_drive_plays_allowed = avg_drive_plays, avg_drive_yards_allowed = avg_drive_yards),
           file.path(OUTPUT_DIR, "drive_outcomes_defense_by_week.json"), pretty = TRUE, auto_unbox = TRUE)
write_json(core$drive_detail,
           file.path(OUTPUT_DIR, "drive_outcomes_defense_detail.json"), pretty = TRUE, auto_unbox = TRUE)

cat("\n✅ Listo. 8 archivos de DEFENSIVA generados en ./", OUTPUT_DIR, "/\n\n", sep = "")
cat("  defense_by_week.json\n")
cat("  defense_season.json\n")
cat("  two_minute_drill_defense_season.json\n")
cat("  two_minute_drill_defense_games.json\n")
cat("  pass_distribution_defense_season.json\n")
cat("  pass_distribution_defense_by_week.json\n")
cat("  drive_outcomes_defense_by_week.json\n")
cat("  drive_outcomes_defense_detail.json\n")