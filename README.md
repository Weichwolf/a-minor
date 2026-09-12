# a-minor

Zweisprachiger Improvisations- und Theoriekurs für P4-Gitarre und Keyboard. Notenlesen, Gehör, Harmonik, Klang und selbstständiges Solospiel wachsen gemeinsam.

- **Gitarre:** E2 A2 D3 G3 C4 F4. Offene Pedaltöne und Melodie, später Arpeggien, Akkorde und bewegter Bass. Noten mit Lageangabe; keine Tabs.
- **Keyboard:** 49 Tasten, Synthesizer und Klavier. Bass links, Melodie rechts; zunächst ein Klang ohne verpflichtenden Split.
- **Theorie:** Was die Referenzen tun, warum es funktioniert und was sie teilen, aufgebaut auf E–A–D. Notation, Modi, Harmonik, Bass und Drums, Zeit, Synthese und Effekte, Form, eigene Sprache.
- **Referenzen:** My Dying Bride (*Turn Loose the Swans*), Type O Negative (*October Rust*), Anathema (*Eternity*), Vivaldi (*Le quattro stagioni*), Biber (*Harmonia artificioso-ariosa*). Eigene musikalische Gedanken statt festgelegter Coverstücke.

## Stand

Phase 0–8 beider Instrumente ist ausgearbeitet. Phase 2–8 enthält je sieben Gitarren- und sechs Keyboardeinheiten: 7 × (7 + 6) = 91 neue Einheiten. Jede hat Notenbeispiel, gezielte Variation und eigene Anwendung: 91 × 3 = 273 neue Aufgaben. Mit den bisherigen 53 Aufgaben sind es 326. Jam-/Backing-Editor und freie Konfigurationsseiten bleiben entfernt.

Die Theoriespur hat 67 Einheiten in Phase 0–8 (7, 7, 7, 7, 8, 7, 10, 7, 7) und fünf Anhänge. Jede Einheit hat drei Aufgaben (Hören, Modell, Anwendung): 67 × 3 = 201. Gesamt 326 + 201 = 527 Aufgaben. Referenzstellen sind nach Track und Formstelle benannt, nicht nach Zeit; jede Aussage über eine Stelle trägt die Markierung „prüfen“, bis sie am Album bestätigt ist. Die Gerätetabellen in Anhang D sind gegen die Handbücher geprüft (Quellen im [fachlichen Abgleich](docs/COURSE_AUDIT.md)); wenige Restpunkte tragen die Markierung „prüfen“.

Der [fachliche Abgleich](docs/COURSE_AUDIT.md) dokumentiert Fehlerkorrekturen, die lokale Gigajam-Sammlung Debut–Grade Five, erkannte Lücken und die Grenzen des Vergleichs. Die im Abgleich erkannten Fähigkeiten sind jetzt mit konkreten Übungen verknüpft. Das ist keine Zusicherung einer Prüfungsgleichwertigkeit; formale Abschlusskriterien liegen nicht vor. Der [vollständige Lernweg](docs/CURRICULUM.md) verlinkt jede neue Einheit.

| Phase | Instrumente | Theorie |
|---|---|---|
| 0 | Ton, P4-Orientierung, Noten, Puls, Dämpfung, unabhängige Stimmen | Obertöne, Stimmungslogik, Noten- und Rhythmusschrift, Hörmethode, Referenzkarte, Verzerrung |
| 1 | Motiv, Variation, Pedalton/Melodie, Äolisch/Phrygisch, eigene Miniatur | Pedal, sieben Modi, Äolisch/Phrygisch, Dorisch/Lydisch, E–A–D als drei Zentren, modal/tonal |
| 2 | Zweiklänge, Dreiklänge, Arpeggien, Akzente und Rhythmusgitarre | Dreiklang, Powerchord, Terzen/Sexten, Stimmführung, tiefe Stimmung, Zweistimmigkeit, Akkordsymbole |
| 3 | Bewegter Bass, Lamento, Synkopen, Sechzehntel, Formzeichen | Lamento, Quintfall, Ostinato/Ritornello, Bassrollen, Frequenzraum, Drums I und II |
| 4 | Harmonisch Moll, Sext-/Septakkorde, Akkordsymbole und Stimmführung | Mollformen, Kadenzen, Septimenkette, dim7, Zwischendominanten, Modulation, Barockformeln, Verweigerung |
| 5 | Sequenzen, Figuration, Triolen, 12/8, Shuffle und Swing | Unterteilung, Swing, Polyrhythmus/Hemiole, ungerade Takte, Tempo/Ausklang, Rubato, Agogik |
| 6 | Quarten, Lydisch, Register und Klangkontraste | Subtraktiv, Wavetable/FM, Pads/Orgel/Chor, Delay, Tape/BBD, TC-Presets, Hall, Chorus, Gain, Frequenzplan |
| 7 | Gruppierung, ungerade Takte, Solo und Rückkehr in die Form | Riff/Song, Suite, Ritornello/Programm, lange Formen, Dichtebogen, Intro/Outro, Stimmlücke |
| 8 | Eigenständiges Arrangement mit Bass, Melodie, Arpeggien und Akkorden | Gemeinsamkeiten, Regelwerk, Workflow, Schichtaufnahme, Dokumentation, Repertoire, Laufbahn |
| A | | Anhänge: Akustik, Intermodulation, Delay-Mathematik, Gerätetabellen, Akkordsymbole |

## Übezeit

Vier Sitzungen zu je einer Stunde. Drei mit 45 Minuten Gitarre und 15 Minuten Keyboard, eine mit umgekehrter Gewichtung:
Gitarre 3 × 45 + 15 = 150 Minuten; Keyboard 3 × 15 + 45 = 90 Minuten pro Woche.

Theorie kommt dazu: eine Einheit pro Woche, etwa 60 Minuten außerhalb der Instrumentalzeit, davon die Hälfte Hören am Album. Modell-Aufgaben werden am Keyboard gespielt, Anwendungen mit dem Instrument der Woche.

Eine Einheit pro Instrument bearbeiten. Bereits sichere Aufgaben dienen als Einstiegskontrolle. Hören/singen → spielen → wiederholen → genau eine Eigenschaft verändern → aufnehmen und vergleichen. „Sicher abrufbar“ erst nach Wiederholung an zwei Übetagen ohne Hilfen. Bestehende Markierungen bleiben erhalten; überarbeitete Übungen erneut prüfen.

## Start

Online: [a-minor.ch](https://a-minor.ch).

Lokal im Projektverzeichnis:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

`http://localhost:8000` öffnen. Kein Build. Keine Laufzeitabhängigkeiten. JSON-Dateien werden geladen; direktes Öffnen per `file://` wird nicht unterstützt. Web MIDI benötigt eine passende Browserimplementierung und einen sicheren Kontext wie HTTPS oder localhost.

Deutsch/Englisch oben umschalten. Auswahl und Fortschritt bleiben im Browser. Noten, Tonmaterial, Takt und Lage gehören zur Aufgabe. Sichtbare Begleitregler: Start/Stopp, Tempo und **Begleitung** mit genau den Optionen **Klick** und **Drums**. Das passende Muster gehört zur Aufgabe. Noten brechen an Taktgrenzen in neue Systeme um; dichte Einzeltakte bleiben bei Bedarf horizontal scrollbar. Notenhilfen sind standardmäßig aus; Diagramme eingeklappt.

## MIDI

Unter **MIDI** Ausgänge suchen und Gerät wählen. Klick/Drums ausschließlich als Noten auf Kanal 10. Ohne verbundenes Gerät startet die Begleitung nicht. Keine MIDI-Clock, kein Fernstart eines Gerätepatterns, keine Program Changes.

| Klang | MIDI-Note |
|---|---|
| Kick | 36 |
| Snare | 38 |
| Geschlossene Hi-Hat | 42 |
| Klick/Rim | 37 |

MX49: Drum-Kit auf Part 10. SR-18: MIDI-Interface mit DIN-Ausgang, MIDI CH 10, DRUM IN ON: V1, NOTE MAP NORMAL und passende Pad-Zuordnung unter NOTE. Die Handbücher sind in der MIDI-Ansicht verlinkt. Gerätetests stehen noch aus.

Alle Drum-Muster enthalten geschlossene Hi-Hat (Note 42) mit hörbar gewichteten MIDI-Velocities. Half-time: Kick auf 1, Snare auf 3, Viertel-Hi-Hat. Gerade Begleitung: Kick auf 1/3, Snare auf 2/4, Achtel-Hi-Hat. Shuffle verwendet lange/kurze Achtel im Übeverhältnis 2:1. In 12/8 sind es vier große Pulse mit je drei Hi-Hat-Achteln; 5/8 und 7/8 betonen die vorgegebenen Gruppen. Auch 3/4 bietet Klick und Drums.

Tempoeinheit direkt am Regler: ♩ bei einfachen Vierteltakten, ♩. bei 6/8, 9/8 und 12/8, ♪ bei 5/8 und 7/8. Vorschau und MIDI verwenden dieselbe Einheit. Bass und Pads werden selbst gespielt, nicht vom Player erzeugt. Die separate Notenvorschau verwendet lokal gehostete Salamander-Klaviersamples (Alexander Holm, CC BY 3.0); sie berücksichtigt Stimmen, Haltebögen, Akzente, Staccato, Bend-Zielton, Swing und Formabläufe. Sie simuliert keine Gitarren-Anschlagtechnik.

„Anhören“ wiederholt die vollständige notierte Form einschließlich Pausen bis zum Stoppen. Ausklänge dürfen über die Loop-Grenze reichen, ohne den nächsten Einsatz zu verzögern. Geladen werden nur die nötigen Anschlagsschichten und Tonhöhen. Der Satz umfasst 17 Grundtöne × 3 Schichten = 51 Stereo-MP3s, zusammen 6.092.470 Bytes. Anschlag und natürlicher Ausklang stammen aus der Aufnahme. Eine kurze Einschaltglättung und eine registerabhängige exponentielle Dämpfung mit abnehmenden Höhen formen die Notenenden. Stoppen blendet aus und verwirft geplante Einsätze; abgebrochenes Laden startet später nicht selbstständig. Kein zusätzlicher Klangregler.

[Sample-Herkunft, Bearbeitung und Lizenz](assets/piano/credits.html) · [Reproduzierbarer Sample-Build und Hüllkurvenmodell](assets/piano/README.md).

## Backup / Restore

**Log → Backup herunterladen** sichert das gemeinsame Journal einschließlich Abschlussmarkierungen, Notizen und Löschvermerken als JSON. **Backup wiederherstellen** validiert die Datei und führt sie mit dem lokalen Journal zusammen. Doppelte Ereignisse werden nicht dupliziert; neuere Änderungen werden nicht durch alte Backups überschrieben. Auch frühere JSON-Backups mit `done` und `log` werden eingelesen. Ungültige Dateien ändern keine Daten.

Speicherung gilt pro Browserprofil und Origin; localhost und a-minor.ch haben getrennte Daten. Beim Browserwechsel oder vor dem Löschen der Websitedaten exportieren. Kein Konto. Backups verschiedener Geräte lassen sich manuell zusammenführen. Automatische Netzsynchronisation ist zurückgestellt. Die Spracheinstellung ist eine separate Browserpräferenz und kein Lernfortschritt.

## Dateien

| Datei | Aufgabe |
|---|---|
| `data/course.json` | Sprachunabhängige IDs, Phasenstruktur (drei Spuren), Noten, Hilfen und Begleitvorgaben |
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

Textfelder: `title`, `instructions`, `checklist`, bei Gitarre `position`; Einheiten zusätzlich `goal` und `text`. Theorieaufgaben haben `kind` `hear`, `model` oder `apply` in dieser Reihenfolge; `hear` blendet den Prüfhinweis ein. Eine Phase mit `"reference": true` enthält Einheiten ohne Aufgaben (Anhänge) und zeigt keinen Planungshinweis.
Dauern: `w h q e s`, optional punktiert (`h.`) oder als Triole (`et`, `qt`). Zeitberechnung mit 24 Ticks pro Viertel hält binäre und ternäre Unterteilungen exakt. `tie:1` bindet zur nächsten gleichen Tonhöhe. `p` darf für Akkorde ein Array enthalten; `s` und `fi` können dazu positionsgleiche Arrays sein. `s` zählt tief nach hoch 0–5; angezeigte Saitennummern hoch nach tief 1–6. `score.bass` ist die unabhängige zweite Stimme: Gitarre im selben Violinsystem, Keyboard im Basssystem. `score.inner` ergänzt eine unabhängig gehaltene beziehungsweise bewegte Mittelstimme im oberen System. Alle Stimmen müssen gleich lang sein. `score.stringWindow` begrenzt automatische Saitenvorschläge.

Zusätzliche Notenfelder: `accent`, `staccato`, `harmonic`, `bend` (Halbtöne), `slur`/`slurEnd`. `tuplet:3` startet eine Triolenklammer, `tupletEnd:true` beendet sie. `score.chords` und `score.sections` beschriften Takte; `score.swing:true` interpretiert gerade Achtel in der Vorschau als 2:1-Übemodell.

Formnotation und Vorschau verwenden dieselben Daten:

```json
{"repeat":{"from":1,"to":2,"endings":[3,4]}}
```

Spielt 1–2–3–1–2–4. Alternativ `times:2` ohne Endings für eine einfache Wiederholung. Endings sind einzelne, unmittelbar anschließende Takte.

```json
{"jump":{"from":4,"to":2,"codaAt":3,"coda":5}}
```

D.S. al Coda; bei sechs geschriebenen Takten: 1–2–3–4–2–3–5–6. `to:1` bezeichnet D.C.; `fine` ersetzt `codaAt`/`coda` bei einem Schluss nach dem Rücksprung. Ein Score verwendet einen Wiederholungsbereich oder einen Rücksprung. Verschachtelte Kombinationen sind nicht implementiert und werden abgewiesen. Begleitungs-`bars` zählt gespielte Takte einschließlich Wiederholungen. Über Taktstriche laufende Noten werden mit Haltebögen ausgeschrieben.

## Prüfungen

```sh
npm ci
npm test
npm run test:browser
```

Node.js und Python 3 erforderlich; Browsertest startet seinen lokalen Server selbst. Chromium liegt standardmäßig unter `/usr/bin/chromium`, alternativ `CHROMIUM_PATH` setzen. Playwright ist ausschließlich eine Entwicklungsabhängigkeit.

Die Tests prüfen die Einheitenzahl, die Aufgabenfolge Hören/Modell/Anwendung der Theoriespur, aufgabenlose Anhänge, Taktlängen, drei unabhängige Stimmen, gleichzeitige Saitenbelegung, Griffweiten, Keyboard-Handspannweiten, Haltebögen, Triolen, Formabläufe, Tempoeinheiten, Hi-Hat-Ausgabe, Generatorgrenzen, MIDI-Stopp, validierten Import, Sprachvollständigkeit und alle Einheiten in beiden Sprachen im Browser. Zusätzlich: Sample-Integrität, Anschlagsschichten, Retuning, Dämpfung, Ladewiederholung, Abbruch während des Ladens und Audio-Rendering im Browser (Dynamik, Tonenden, Polyphonie). Hardwareklang und reale Gerätelatenz benötigen einen Hörtest am angeschlossenen Instrument.

Akkordsymbole bleiben oberhalb der Noten sichtbar. Unter jedem Takt stehen die tatsächlichen Bass- beziehungsweise Pedaltöne, einschließlich Basswechseln und Pausen; reine Einzelstimmen erhalten keine erfundenen Akkorde. Die Angaben folgen den klingenden Oktaven (auch bei oktavierender Gitarrennotation) und der internationalen Benennung B/H: B entspricht deutschem H, Bb deutschem B.

Gitarrenanschlag: rechte Hand ausschließlich Plektrum, linke Hand Hammer-ons/Pull-offs und später Tapping aus der Stille. Kein Finger- oder Hybrid-Picking. Gemeinsame Einsätze werden zunächst kurz aufgefächert; die Partitur und Klaviervorschau bilden das rhythmische Stimmengerüst ab. Exakte gemeinsame Einsätze mit Plektrum und linkem Anschlag werden nach der Legato-Einheit aufgebaut.
