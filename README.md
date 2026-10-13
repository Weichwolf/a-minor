# a-minor

Learn to read music and understand what you play. A bilingual (English/German), static web app for **electric guitar, keyboard, bass and drums** — no account or build step required.

**[Open a-minor.ch](https://a-minor.ch)**

## Features

- **Practice:** reproducible pieces for Grades 0–5 in Rock, Doom, Gothic, Progressive, Baroque and Lounge. Each piece includes four written parts, contrasting sections, a short explanation of its harmony and intervals, and band or solo playback.
- **Theory:** a reading companion for desktop and mobile, with 34 chapters, five appendices and 250 original notation examples. No assignments or progress tracking.
- **Fretboard:** explore notes, scales and intervals in all-fourths guitar tuning.
- **MIDI:** internal audio or external devices, with saved routing and mixer settings.
- **Bookmarks:** save complete scores, add notes, and export JSON backups or CSV summaries. JSON import restores saved pieces.

Guitar uses P4 tuning (E2 A2 D3 G3 C4 F4), with power chords, riffs, melodies and single-note arpeggios. Keyboard parts fit 49 keys (C2–C6); bass uses standard E1 A1 D2 G2 tuning. Drum parts use General MIDI percussion.

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
```

Tests require Node.js, Python 3 and Chromium (`/usr/bin/chromium`, or set `CHROMIUM_PATH`). They cover generation, musical and instrument constraints, MIDI, persistence, bilingual layouts and PDF downloads.

Design and review notes: [pedagogy](docs/PRACTICE_DIDACTICS.md), [grade coverage](docs/GIGAJAM_COVERAGE.md), [musical review](docs/MUSICAL_REVIEW.md). The generator uses original musical patterns; reference scores and recordings are not included.

Third-party credits and licenses: [SoundFont](assets/soundfont/README.md), [audio engine](assets/vendor/README.md), [PDF engine and fonts](assets/vendor/pdfmake/README.md).
