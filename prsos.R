library("nflverse")
library("tidyverse")

library(dplyr)
library(nflreadr)

# 1. Carga de datos
schedules <- load_schedules(2025) %>%
  filter(game_type == "REG", !is.na(result))

# 2. Procesar locales
home <- schedules %>%
  select(team = home_team, score = home_score, opponent_score = away_score, result, spread_line) %>%
  mutate(is_home = 1)

# 3. Procesar visitantes (invirtiendo valores para verlos desde la perspectiva del visitante)
away <- schedules %>%
  select(team = away_team, score = away_score, opponent_score = home_score, result, spread_line) %>%
  mutate(
    result = -result,
    spread_line = -spread_line, 
    is_home = 0
  )

# 4. Consolidación y Resumen Estadístico
tabla_equipos <- bind_rows(home, away) %>%
  group_by(team) %>%
  summarise(
    juegos = n(),
    puntos_totales = sum(score, na.rm = TRUE),
    puntos_recibidos = sum(opponent_score, na.rm = TRUE),
    # Promedios
    ppp = mean(score, na.rm = TRUE),   # Puntos Por Partido
    pap = mean(opponent_score, na.rm = TRUE), # Puntos Al Rival (recibidos)
    dif_puntos = sum(result, na.rm = TRUE),
    # Victorias y Expected
    victorias = sum(result > 0, na.rm = TRUE),
    derrotas = sum(result < 0, na.rm = TRUE),
    empates = sum(result == 0, na.rm = TRUE),
    wins_over_expected = sum(
      case_when(
        spread_line > 0 & result > 0 ~ 1,      # Era underdog y ganó
        spread_line > 0 & result == 0 ~ 0.5,    
        spread_line < 0 & result > 0 ~ 0,      # Era favorito y ganó (se esperaba)
        spread_line < 0 & result < 0 ~ -1,     # Era favorito y perdió
        TRUE ~ 0
      ), na.rm = TRUE
    ),
    # Métricas de Spread
    n_over_spread = sum(result > spread_line, na.rm = TRUE),
    veces_underdog = sum(spread_line < 0, na.rm = TRUE),
    veces_favorito = sum(spread_line > 0, na.rm = TRUE),
    victorias_under_dog = sum(spread_line < 0 & result > 0, na.rm = TRUE), 
    pct_cubre_spread = (n_over_spread / juegos) * 100,
  ) %>%
  arrange(desc(victorias), desc(dif_puntos))
  


# 1. Base de datos: Separamos lo jugado de lo pendiente
schedules <- load_schedules(2025) %>% filter(game_type == "REG")

# 2. Perfil de Fuerza Actual (Win % y Spread promedio de cada equipo hoy)
# Usamos el código que ya teníamos para definir "qué tan bueno es cada equipo"
fuerza_equipos <- tabla_equipos %>%
  select(team, win_pct_actual = victorias / juegos, power_rank_spread = ppp)

# 3. Función interna para procesar oponentes
obtener_oponentes <- function(data) {
  bind_rows(
    data %>% select(team = home_team, opponent = away_team, spread_line),
    data %>% select(team = away_team, opponent = home_team, spread_line)
  )
}

# --- CÁLCULO RETROSPECTIVO (Lo que ya pasó) ---
sos_retro <- schedules %>%
  filter(!is.na(result)) %>%
  obtener_oponentes() %>%
  left_join(fuerza_equipos, by = c("opponent" = "team")) %>%
  group_by(team) %>%
  summarise(
    sos_retro_win_pct = mean(win_pct_actual, na.rm = TRUE),
    sos_retro_spread = mean(spread_line, na.rm = TRUE), # Dificultad basada en las líneas de esos días
    .groups = "drop"
  )

# --- CÁLCULO PROSPECTIVO (Lo que falta jugar) ---
sos_prospectivo <- schedules %>%
  filter(is.na(result)) %>%
  obtener_oponentes() %>%
  left_join(fuerza_equipos, by = c("opponent" = "team")) %>%
  group_by(team) %>%
  summarise(
    sos_futuro_win_pct = mean(win_pct_actual, na.rm = TRUE),
    # Aquí usamos el power rank del oponente para ver qué tan difícil es lo que viene
    sos_futuro_dificultad = mean(power_rank_spread, na.rm = TRUE), 
    juegos_restantes = n(),
    .groups = "drop"
  )

# 4. UNIÓN FINAL
tabla_analisis_total <- tabla_equipos %>%
  left_join(sos_retro, by = "team") %>%
  left_join(sos_prospectivo, by = "team") %>%
  mutate(
    balance_calendario = sos_futuro_win_pct - sos_retro_win_pct
  )

tabla_analisis_total
