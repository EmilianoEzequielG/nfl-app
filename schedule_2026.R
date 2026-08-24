library("nflverse")
library("tidyverse")
library("jsonlite")

# ── 1. Datos ──────────────────────────────────────────────────────────────────
schedules <- load_schedules(2026) %>% filter(game_type == "REG")
jugados   <- schedules %>% filter(is.na(result))



library(dplyr)

# 0. Definición de la tabla base de semanas
tabla_semana <- jugados %>% 
  select(team = home_team, opp = away_team, spread_line, week) %>%
  mutate(is_home = 1) %>% 
  bind_rows(
    jugados %>%
      select(team = away_team, opp = home_team, spread_line, week) %>%
      mutate(spread_line = -spread_line, is_home = 0)
  )

# 1. Resumen de fuerza / nivel por equipo
tabla_resumen_2026 <- tabla_semana %>% 
  group_by(team) %>%
  summarise(
    wins_expected     = round(sum(case_when(
      spread_line > 0  ~ 1,
      spread_line == 0 ~ 0.5,
      spread_line < 0  ~ 0,
      TRUE ~ 0
    ), na.rm = TRUE)),
    veces_underdog     = sum(spread_line < 0, na.rm = TRUE),
    veces_favorito     = sum(spread_line > 0, na.rm = TRUE),
    power_rank_spread  = median(spread_line, na.rm = TRUE),
    .groups = "drop"
  )

# 2. Extraer ratings para unir con oponentes
power_ratings <- tabla_resumen_2026 %>%
  select(
    opponent_team     = team,
    opp_wins_expected = wins_expected,
    opp_power_rank    = power_rank_spread
  )

# 3. Calcular SOS unificado (Enfoque 2 + Enfoque 3)
tabla_sos_2026 <- tabla_semana %>%
  mutate(
    # Probabilidad implícita de victoria
    win_prob = pnorm(spread_line / 13.5)
  ) %>%
  # CORRECCIÓN AQUÍ: Usamos "opp" que es la columna real de tu tabla_semana
  left_join(power_ratings, by = c("opp" = "opponent_team")) %>%
  group_by(team) %>%
  summarise(
    juegos_totales     = n(),
    
    # --- Enfoque 2: Calidad de los Rivales ---
    sos_opp_wins_exp   = mean(opp_wins_expected, na.rm = TRUE),  # Promedio de victorias esperadas de los rivales
    sos_opp_power_rank = mean(opp_power_rank, na.rm = TRUE),   # Promedio del power rank de los rivales
    
    # --- Enfoque 3: Probabilidad Implícita de Victoria ---
    win_prob_promedio  = mean(win_prob, na.rm = TRUE),          # % Promedio de victoria proyectado por juego
    dificultad_sos     = 1 - win_prob_promedio,                 # A mayor valor, calendario más difícil
    
    .groups = "drop"
  ) %>%
  arrange(desc(dificultad_sos))

# Ver resultado
head(tabla_sos_2026)

# ── 8. Exportar ───────────────────────────────────────────────────────────────
# Ajustar ruta según dónde esté el proyecto
output_path <- "nfl-web/src/lib/team-analysis.json"

write_json(tabla_final, output_path, pretty = TRUE, digits = 4, na = "null")
cat("✓ Exportado a:", output_path, "\n")
cat("  Equipos:", nrow(tabla_final), "\n\n")
print(tabla_final %>% select(team_id, win_pct_actual, ppp, pap, wins_over_expected,
                             pct_cubre_spread, sos_futuro_win_pct))
