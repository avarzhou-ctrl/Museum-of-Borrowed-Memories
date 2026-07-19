# Cutscene narration

The six root-level WAV files are the supplied full-length narration masters. `slides/` contains lossless PCM clips aligned one-to-one with the cutscene slide arrays in `src/game.js`.

| Cutscene | Folder | Slides |
| --- | --- | ---: |
| Opening | `slides/start/` | 8 |
| The Curator Remembered | `slides/the-curator-remembered/` | 7 |
| Return What Was Taken | `slides/return-what-was-taken/` | 7 |
| Burn the Orchard | `slides/burn-the-orchard/` | 8 |
| A Beautiful Lie | `slides/a-beautiful-lie/` | 6 |
| The Visitor Who Almost Remembered | `slides/the-visitor-who-almost-remembered/` | 7 |

Files use one-based names such as `slide-01.wav`; runtime slide index `0` maps to `slide-01.wav`. The Curator’s fifth slide contains Mara’s direct dialogue, which is absent from the supplied narrator master, so `slide-05.wav` is an intentional 0.25-second silent placeholder.

Run `bash scripts/split_cutscene_audio.sh` to regenerate all slide clips from the untouched masters. Boundaries were placed using word-level alignment followed by pause inspection.
