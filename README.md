# a-minor

Learn to read music and understand what you play. A bilingual (English/German), static web app for **electric guitar, keyboard, bass and drums** — no account or build step required.

**[Open a-minor.ch](https://a-minor.ch)**

## Features

- **Practice:** reproducible pieces for Grades 0–5, with gradually expanding keys, scales and styles. Rock and Doom start at Grade 0, Blues at 1, Gothic and Baroque at 2, Lounge at 3, and Progressive at 4. Each piece includes four written parts, contrasting sections, a short explanation of its harmony and intervals, and band or solo playback.
- **Theory:** a reading companion for desktop and mobile, with 34 chapters, five appendices and 250 original notation examples. No assignments or progress tracking.
- **Fretboard:** explore notes, scales and intervals in all-fourths guitar tuning, including minor/major pentatonic and blues scales.
- **MIDI:** internal audio or external devices, with saved routing and mixer settings.
- **Bookmarks:** save complete scores, add notes, and export JSON backups or CSV summaries. JSON import restores saved pieces.

Guitar uses P4 tuning (E2 A2 D3 G3 C4 F4), with power chords, riffs, melodies and single-note arpeggios. Keyboard parts fit 49 keys (C2–C6); bass uses standard E1 A1 D2 G2 tuning. Drum parts use General MIDI percussion.

Each style has five original motif families, with occasional melodic and arrangement variations that follow the grade limits. Target playing durations for Grades 0–5 are about **0:45, 1:05, 1:30, 2:00, 2:35 and 3:15**, within roughly 10%. Tempo, metre and all written returns count toward duration; changing playback tempo updates the displayed time. Tempos, grooves and fills follow both style and grade.

Download complete MIDI files or a **single-page PDF directly**, without a print dialog. Bookmarks and preferences stay in browser storage; export JSON before clearing site data or changing browsers.

## Run locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000>. Web MIDI requires a compatible browser and HTTPS or localhost. Fonts, audio, SoundFont and PDF libraries are served locally.

## Development

```sh
npm ci
npm test
npm run test:browser
npm run test:practice-browser
```

Tests require Node.js, Python 3 and Chromium (`/usr/bin/chromium`, or set `CHROMIUM_PATH`). They cover generation, musical and instrument constraints, MIDI, persistence, bilingual layouts and PDF downloads.

Design and review notes: [key, scale and style progression](docs/PRACTICE_PROGRESSION.md), [pedagogy](docs/PRACTICE_DIDACTICS.md), [grade coverage](docs/GIGAJAM_COVERAGE.md), [musical review](docs/MUSICAL_REVIEW.md). The generator uses original musical patterns; reference scores and recordings are not included.

Third-party credits and licenses: [SoundFont](assets/soundfont/README.md), [audio engine](assets/vendor/README.md), [PDF engine and fonts](assets/vendor/pdfmake/README.md).
