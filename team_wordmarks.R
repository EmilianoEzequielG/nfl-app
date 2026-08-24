library(nflreadr)
library(dplyr)
library(jsonlite)

# Extract wordmarks and handle special cases
wordmarks <- nflfastR::teams_colors_logos %>%
  select(team_abbr, team_wordmark) %>%
  # Handle special cases: LA -> LAR (Rams)
  mutate(
    team_abbr = case_when(
      team_abbr == "LA" ~ "LAR",
      TRUE ~ team_abbr
    ),
    # Convert to working GitHub raw URL format with ?raw=true
    team_wordmark = paste0(
      "https://github.com/nflverse/nflfastR-data/blob/master/wordmarks/",
      gsub(".*/", "", team_wordmark),
      "?raw=true"
    )
  ) %>%
  distinct(team_abbr, .keep_all = TRUE) %>%
  arrange(team_abbr) %>%
  rename(abbreviation = team_abbr, wordmarkUrl = team_wordmark)

# Convert to list of rows
json_data <- lapply(
  1:nrow(wordmarks),
  function(i) {
    list(
      abbreviation = wordmarks$abbreviation[i],
      wordmarkUrl = wordmarks$wordmarkUrl[i]
    )
  }
)

# Export to JSON
json_output <- toJSON(json_data, pretty = TRUE, auto_unbox = TRUE)

# Save to file
writeLines(json_output, "team_wordmarks.json")
cat("✓ Exported to team_wordmarks.json\n\n")
cat(json_output)

