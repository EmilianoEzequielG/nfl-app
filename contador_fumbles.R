library(nflfastR)
library(dplyr)
library(jsonlite)

# --- 1. Histórico fijo (1999-2025), ya calculado, no se recalcula ---
historico <- list(
  temporada              = "1999-2025",
  total_fumbles          = 19601,
  total_fumbles_perdidos = 9185
)

# --- 2. Temporada 2026, en vivo ---
obtener_fumbles_2026 <- function() {
  
  pbp_2026 <- tryCatch(
    nflfastR::load_pbp(2026),
    error = function(e) NULL
  )
  
  if (is.null(pbp_2026) || nrow(pbp_2026) == 0) {
    total_fumbles <- 0
    total_fumbles_perdidos <- 0
  } else {
    resumen <- pbp_2026 %>%
      summarise(
        total_fumbles          = sum(fumble, na.rm = TRUE),
        total_fumbles_perdidos = sum(fumble_lost, na.rm = TRUE)
      )
    total_fumbles <- resumen$total_fumbles
    total_fumbles_perdidos <- resumen$total_fumbles_perdidos
  }
  
  list(
    temporada              = "2026",
    total_fumbles          = total_fumbles,
    total_fumbles_perdidos = total_fumbles_perdidos
  )
}

temporada_2026 <- obtener_fumbles_2026()

# --- 3. Armar el objeto final con ambos ---
contador_fumbles <- list(
  historico            = historico,
  temporada_2026        = temporada_2026,
  ultima_actualizacion = as.character(Sys.time())
)

print(contador_fumbles)

# --- 4. Exportar a JSON para tu página ---
write_json(contador_fumbles, "fumbles_contador.json", auto_unbox = TRUE, pretty = TRUE)
