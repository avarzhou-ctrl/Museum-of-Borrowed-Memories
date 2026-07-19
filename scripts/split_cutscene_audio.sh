#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
audio_dir="$root_dir/assets/audio/cutscenes"
slides_dir="$audio_dir/slides"

command -v ffmpeg >/dev/null

cut_clip() {
  local master="$1"
  local start="$2"
  local end="$3"
  local output="$4"
  mkdir -p "$(dirname "$output")"
  # Decode from the start: input seeking doubles offsets for these generated WAV headers.
  ffmpeg -hide_banner -loglevel error -y -i "$master" -af "atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS" -ar 24000 -ac 1 -c:a pcm_s16le "$output"
}

split_master() {
  local stem="$1"
  shift
  local master="$audio_dir/$stem.wav"
  local duration
  duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$master")"
  local points=("0" "$@" "$duration")
  local final_index=$((${#points[@]} - 1))
  local index
  for ((index = 0; index < final_index; index += 1)); do
    printf -v slide_name "slide-%02d.wav" "$((index + 1))"
    cut_clip "$master" "${points[$index]}" "${points[$((index + 1))]}" "$slides_dir/$stem/$slide_name"
  done
}

# Boundaries sit midway through the pause following each slide's final spoken word.
split_master "start" 5.40 15.09 27.60 30.79 39.88 45.35 52.16
split_master "return-what-was-taken" 5.37 22.84 32.47 42.40 48.24 57.62
split_master "burn-the-orchard" 2.91 15.43 22.91 27.25 33.79 43.38 47.14
split_master "a-beautiful-lie" 7.05 23.59 36.88 42.05 48.64
split_master "the-visitor-who-almost-remembered" 5.73 15.58 26.85 33.78 42.19 49.00

# The supplied narrator track intentionally omits slide 5, which contains Mara's dialogue.
curator_master="$audio_dir/the-curator-remembered.wav"
cut_clip "$curator_master" 0 3.23 "$slides_dir/the-curator-remembered/slide-01.wav"
cut_clip "$curator_master" 3.23 14.17 "$slides_dir/the-curator-remembered/slide-02.wav"
cut_clip "$curator_master" 14.17 25.07 "$slides_dir/the-curator-remembered/slide-03.wav"
cut_clip "$curator_master" 25.07 32.85 "$slides_dir/the-curator-remembered/slide-04.wav"
ffmpeg -hide_banner -loglevel error -y -f lavfi -i anullsrc=r=24000:cl=mono -t 0.25 -c:a pcm_s16le "$slides_dir/the-curator-remembered/slide-05.wav"
cut_clip "$curator_master" 32.85 44.26 "$slides_dir/the-curator-remembered/slide-06.wav"
cut_clip "$curator_master" 44.26 50.12 "$slides_dir/the-curator-remembered/slide-07.wav"
