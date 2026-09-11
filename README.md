# a-minor

Zweisprachiger Improvisationskurs für P4-Gitarre und Keyboard. Notenlesen, Gehör und selbstständiges Solospiel wachsen gemeinsam.

- **Gitarre:** E2 A2 D3 G3 C4 F4. Offene Pedaltöne und Melodie, später Arpeggien, Akkorde und bewegter Bass. Noten mit Lageangabe; keine Tabs.
- **Keyboard:** 49 Tasten, Synthesizer und Klavier. Bass links, Melodie rechts; zunächst ein Klang ohne verpflichtenden Split.
- **Referenzen:** My Dying Bride (*Turn Loose the Swans*), Type O Negative (*October Rust*), Anathema (*Eternity*), Vivaldi (*Le quattro stagioni*), Biber (*Harmonia artificioso-ariosa*). Eigene musikalische Gedanken statt festgelegter Coverstücke.

## Stand

Phase 0–1 beider Instrumente ist ausgearbeitet. Phase 2–8 ist als Lernweg mit konkreten Anforderungen strukturiert, noch ohne fertige Übungen. Jam-/Backing-Editor und freie Konfigurationsseiten sind entfernt.

Der [fachliche Abgleich](docs/COURSE_AUDIT.md) dokumentiert Fehlerkorrekturen, die lokale Gigajam-Sammlung Debut–Grade Five, erkannte Lücken und die Grenzen des Vergleichs. Die volle Gigajam-Anforderungsbreite ist im Curriculum eingeplant, noch nicht vollständig unterrichtet.

| Phase | Schwerpunkt |
|---|---|
| 0 | Ton, P4-Orientierung, Noten, Puls, Dämpfung, unabhängige Stimmen |
| 1 | Motiv, Variation, Pedalton/Melodie, Äolisch/Phrygisch, eigene Miniatur |
| 2 | Zweiklänge, Dreiklänge, Arpeggien, Akzente und Rhythmusgitarre |
| 3 | Bewegter Bass, Lamento, Synkopen, Sechzehntel, Formzeichen |
| 4 | Harmonisch Moll, Sext-/Septakkorde, Akkordsymbole und Stimmführung |
| 5 | Sequenzen, Figuration, Triolen, 12/8, Shuffle und Swing |
| 6 | Quarten, Lydisch, Register und Klangkontraste |
| 7 | Gruppierung, ungerade Takte, Solo und Rückkehr in die Form |
| 8 | Eigenständiges Arrangement mit Bass, Melodie, Arpeggien und Akkorden |

## Übezeit

Vier Sitzungen zu je einer Stunde. Drei mit 45 Minuten Gitarre und 15 Minuten Keyboard, eine mit umgekehrter Gewichtung:
Gitarre 3 × 45 + 15 = 150 Minuten; Keyboard 3 × 15 + 45 = 90 Minuten pro Woche.

Eine Einheit pro Instrument bearbeiten. Bereits sichere Aufgaben dienen als Einstiegskontrolle. Hören/singen → spielen → wiederholen → genau eine Eigenschaft verändern → aufnehmen und vergleichen. „Sicher abrufbar“ erst nach Wiederholung an zwei Übetagen ohne Hilfen. Bestehende Markierungen bleiben erhalten; überarbeitete Übungen erneut prüfen.

## Start

Online: [a-minor.ch](https://a-minor.ch).

Lokal im Projektverzeichnis:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

`http://localhost:8000` öffnen. Kein Build. Keine Laufzeitabhängigkeiten. JSON-Dateien werden geladen; direktes Öffnen per `file://` wird nicht unterstützt. Web MIDI benötigt eine passende Browserimplementierung und einen sicheren Kontext wie HTTPS oder localhost.

Deutsch/Englisch oben umschalten. Auswahl und Fortschritt bleiben im Browser. Noten, Tonmaterial, Takt und Lage gehören zur Aufgabe. Sichtbare Begleitregler: Start/Stopp, Tempo, Klick/zugeordnetes Schlagzeugmuster. Notenhilfen sind standardmäßig aus; Diagramme eingeklappt.

## MIDI

Unter **MIDI** Ausgänge suchen und Gerät wählen. Klick/Drums ausschließlich als Noten auf Kanal 10. Ohne verbundenes Gerät startet die Begleitung nicht. Keine MIDI-Clock, kein Fernstart eines Gerätepatterns, keine Program Changes.

| Klang | MIDI-Note |
|---|---|
| Kick | 36 |
| Snare | 38 |
| Geschlossene Hi-Hat | 42 |
| Klick/Rim | 37 |

MX49: Drum-Kit auf Part 10. SR-18: MIDI-Interface mit DIN-Ausgang, MIDI CH 10, DRUM IN ON: V1, NOTE MAP NORMAL und passende Pad-Zuordnung unter NOTE. Die Handbücher sind in der MIDI-Ansicht verlinkt. Gerätetests stehen noch aus.

Half-time: Kick auf 1, Snare auf 3, Viertel-Hi-Hat. Gerade Begleitung: Kick auf 1/3, Snare auf 2/4, Achtel-Hi-Hat. Bei 3/4 nur Klick. Bass und Pads sind derzeit nicht Teil des Players. Die separate Notenvorschau verwendet Browserklang und berücksichtigt Haltebögen und Stimmen.

## Backup / Restore

**Log → Backup herunterladen** sichert das gemeinsame Journal einschließlich Abschlussmarkierungen, Notizen und Löschvermerken als JSON. **Backup wiederherstellen** validiert die Datei und führt sie mit dem lokalen Journal zusammen. Doppelte Ereignisse werden nicht dupliziert; neuere Änderungen werden nicht durch alte Backups überschrieben. Auch frühere JSON-Backups mit `done` und `log` werden eingelesen. Ungültige Dateien ändern keine Daten.

Speicherung gilt pro Browserprofil und Origin; localhost und a-minor.ch haben getrennte Daten. Beim Browserwechsel oder vor dem Löschen der Websitedaten exportieren. Kein Konto. Backups verschiedener Geräte lassen sich manuell zusammenführen. Automatische Netzsynchronisation ist zurückgestellt. Die Spracheinstellung ist eine separate Browserpräferenz und kein Lernfortschritt.

## Dateien

| Datei | Aufgabe |
|---|---|
| `data/course.json` | Sprachunabhängige IDs, Phasenstruktur, Noten, Hilfen und Begleitvorgaben |
| `locales/de.json`, `locales/en.json` | Kurstexte und Oberflächentexte |
| `js/i18n.js` | Laden und Zusammenführen der Sprachdaten |
| `js/app.js` | Ansichten, Sprachwechsel, Übungen und MIDI-Bedienung |
| `js/music.js` | Tonhöhen, Intervalle, Skalen und P4-Positionen |
| `js/notation.js` | Noten-SVG, Stimmen, Haltebögen und Lesegenerator |
| `js/audio.js` | MIDI-Kursbegleitung und separate Notenvorschau |
| `js/store.js` | Gemeinsames Ereignisjournal, Zusammenführung und Backup/Restore |
| `tests/` | Kurs-, Speicher-, MIDI- und Browsertests |

## Übungen ergänzen

Struktur und Noten in `data/course.json`; Texte unter derselben `textId` in beiden Sprachdateien. IDs dauerhaft beibehalten. Tonnamen international: B = deutsches H; Bb = deutsches B. C4 = MIDI 60. Alle gespeicherten Tonhöhen sind klingend, Gitarre wird oktavtransponiert angezeigt.

```json
{
  "id": "e-example",
  "textId": "e-example",
  "kind": "read",
  "tempo": 55,
  "score": {
    "key": "Em", "time": "4/4", "maxFret": 5,
    "notes": [{"p": "E3", "d": "h", "s": 2, "fi": 1}, {"r": 1, "d": "h"}],
    "bass": [{"p": "E2", "d": "w", "s": 0}]
  },
  "aids": ["strings", "fingers"],
  "backing": {"type": "click", "time": "4/4", "bars": 1, "drums": "half"}
}
```

Textfelder: `title`, `instructions`, `checklist`, bei Gitarre `position`; Einheiten zusätzlich `goal` und `text`.
Dauern: `w h q e s`, optional punktiert. `tie:1` bindet zur nächsten gleichen Tonhöhe. `s` zählt tief nach hoch 0–5; angezeigte Saitennummern hoch nach tief 1–6. `score.bass` ist die unabhängige zweite Stimme: Gitarre im selben Violinsystem, Keyboard im Basssystem. Beide Stimmen müssen gleich lang sein. `score.stringWindow` begrenzt automatische Saitenvorschläge.

Der Renderer unterstützt die derzeitigen Phase-0–1-Aufgaben. Triolen, Formzeichen und komplexe spätere Mehrstimmigkeit brauchen vor ihrer Einführung eine entsprechende Erweiterung; das Curriculum behauptet keine vorhandene technische Unterstützung dafür.

## Prüfungen

```sh
npm ci
npm test
npm run test:browser
```

Node.js und Python 3 erforderlich; Browsertest startet seinen lokalen Server selbst. Chromium liegt standardmäßig unter `/usr/bin/chromium`, alternativ `CHROMIUM_PATH` setzen. Playwright ist ausschließlich eine Entwicklungsabhängigkeit.

Die Tests prüfen Taktlängen, Stimmendauern, Haltebögen, spielbare P4-Positionen, Generatorgrenzen, MIDI-Nachrichten und Stopp, validierten Import, Sprachvollständigkeit sowie alle Einheiten in beiden Sprachen im Browser. Hardwareklang und reale Gerätelatenz benötigen einen Hörtest am angeschlossenen Instrument.
