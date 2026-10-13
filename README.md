# a-minor

Musik verstehen und sicher ab Noten spielen: für P4-Gitarre (E2 A2 D3 G3 C4 F4), Keyboard (49 Tasten, C2–C6), Bass (E1 A1 D2 G2) und Drums. Zweisprachig Deutsch/Englisch, statisch und ohne Benutzerkonto.

Das Hauptmenü enthält **Theorie | Praxis | Griffbrett | MIDI | Bookmarks**. Praxis zeigt ausschließlich generierte Stücke, ihre musikalische Einordnung und die Bedienelemente. Technik und Koordination sind Teil der Stücke. Es gibt keine Aufgabenlisten, Abschlussmarkierungen oder Lernfortschrittsanzeigen.

## Start

Online: [a-minor.ch](https://a-minor.ch).

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

`http://localhost:8000` öffnen. Kein Build erforderlich; `file://` wird nicht unterstützt. Web MIDI benötigt einen unterstützenden Browser und HTTPS oder localhost. Notenschrift, Audio-Engine, SoundFont, PDF-Engine und Schrift werden lokal ausgeliefert.

## Praxis

Instrument, Grade 0–5 und Stil wählen. **Rock, Doom, Gothic, Progressive, Barock und Lounge** stehen zur Verfügung; Rock ist die erste Auswahl und richtet sich nach den Anforderungen der lokalen Gigajam-Sammlung. Alle Stücke enthalten vier vollständig notierte Instrumentalparts. Die Instrumentauswahl wechselt die Ansicht derselben gemeinsamen Komposition. Solo und Band sind getrennte Wiedergabeoptionen.

Der Generator plant Harmonie, Rhythmuszellen, Kontur, Kontrast, Rückkehr und Schluss gemeinsam. Jedes Instrument erhält einen eigenen Schwerpunkt und ein eigenes Rhythmusprofil. Grade 1 enthält beispielsweise Drum-Sechzehntelfills, während Gitarren- und Keyboard-Sechzehntel ab Grade 4 vorkommen. Tonarten umfassen Dur, Moll und stilbezogene Modi statt nur A/D/E-Moll. Erreichbare P4-/Bassgriffe und Keyboardlagen bleiben verbindlich.

| Grade | Anforderungen | Gespielte Takte / Vierteltempo |
|---|---|---|
| 0 | Powerchords, rechte Melodie/Dreiklänge, Grundtonbass, Viertelgroove und Achtelfills | 12–16 / 85–128 |
| 1 | Achtel, Dämpfung, Handdialog, linke Dreiklänge, Bassdurchgänge und Sechzehntel-/Tomfills | 16–24 / 85–128 |
| 2 | Chromatische Powerchords, Akkorde mit Bass, Oktave/Quinte und Achtelbecken | 16–32 / 85–128 |
| 3 | Dur/Moll/Septakkorde, Melodie über Begleitung, Registerwechsel und Akzentfills | 24–48 / 85–128 |
| 4 | Powerchord-Sechzehntel, Synkopen, Bindungen, unabhängige Hände, Becken-/Klangwechsel | 24–64 / 90–140 |
| 5 | Rhythmuscharts, Quint/Sext, Swing, Triolen, 12/8, Innenstimmen, Kontrast und Navigation | 32–64 / 80–146 |

Jeder Abschnitt hat mindestens vier Takte; ab Grade 3 auch acht. Es werden höchstens 24 verschiedene Takte notiert. Wiederkehrende Abschnitte ergeben längere vollständige Abläufe. Der [Gigajam-Abgleich](docs/GIGAJAM_COVERAGE.md) umfasst 120 PDFs / 218 Seiten für alle vier Instrumente und dokumentiert Inhalte, Tempoeinheiten und Transfergrenzen. Die [didaktischen Entscheidungen](docs/PRACTICE_DIDACTICS.md) beschreiben die musikalische Konstruktion. Originaltakte oder Begleitspuren werden nicht übernommen. Instrumentgrenzen erfordern andere Griffe oder Register; eine Prüfungsanerkennung wird nicht behauptet.

Ein kurzer Absatz nennt Stil, Tonzentrum/Modus, Taktart, Form, tatsächliche Akkordfolgen, Intervalle und Notenwerte sowie den Grund für den Schwerpunkt. Ab Grade 2 stehen Stufen bei den Akkorden. Er enthält keine ausgeschriebene Lösung der Melodie und keine zusätzlichen Übungsaufträge.

Wörtlich wiederkehrende Abschnitte werden einmal notiert. Vier Takte bleiben in einer Zeile; acht Takte erscheinen in zwei Viererzeilen. Mobile Notenzeilen scrollen innerhalb ihrer Ansicht. Die Wiedergabemarkierung folgt der vollständigen Form und springt bei einer Wiederholung zum bereits notierten Abschnitt zurück.

**Anhören** spielt die eigene Stimme normal, **Üben** mit der gewählten Führungslautstärke. Tempo, Abschnitt, Einzähler, Schleife und kompakter Mixer gehören zum selben Player. Der Einzähler bleibt auch bei Solo hörbar. **MIDI** lädt die komplette gemeinsame MIDI-Datei; **PDF herunterladen** erzeugt direkt eine einseitige A4-Partitur als Vektorgrafik, ohne Druckdialog oder neues Fenster. URL, Titel und PDF-Dateiname verwenden dieselbe Kennung (`0x` plus acht Hexadezimalstellen).

URLs enthalten Instrument, Grade, Stil und Seed, beispielsweise `#/practice/bass/2/rock/0x00000011`. Die letzte Auswahl bleibt im Browser. Diese Revision benötigt keinen bisherigen Generator und keine Kompatibilität zu alten Bookmarks. Git verwaltet frühere Generatorstände.

## Bookmarks und Datensicherung

Der Stern speichert das Stück für das ausgewählte Instrument. Bookmarks können einen eigenen Namen und eine kurze Geschmacksnotiz erhalten. Die neue Bookmark-Liste öffnet die Stücke und erlaubt das Entfernen. Gespeichert wird die vollständige Partitur mit Generatorversion und Einstellungen; das Wiederöffnen verwendet diesen Notenstand, auch wenn sich der Generator später verändert.

- **JSON ↓** exportiert vollständige Stücke, Kennungen, Auswahl, Zeitpunkt, Namen, Notizen und musikalische Analyse. **JSON ↑** validiert und ergänzt die Sammlung; vorhandene Einträge bleiben erhalten. Ungültige Dateien oder fehlgeschlagenes Speichern ändern den bisherigen Stand nicht.
- **CSV ↓** exportiert eine Übersicht mit Instrument, Grade, Stil, Tonzentrum/Modus, Tempo, Takt, Form, Taktzahlen, Abschnittslängen, Akkordfolgen, tatsächlichen Intervallen, Rhythmusmerkmalen, Schwerpunkt, Namen, Notiz und URL. Text mit Tabellenformel-Präfix wird als Text geschützt.

Die Exporte können zur manuellen Geschmacksanalyse und weiteren Anpassung von a-minor weitergegeben werden. Es gibt keine automatische Übermittlung oder automatische Lernstandsbewertung.

Bookmarks, MIDI-Gerätezuordnung, Mix, Wiedergabeauswahl und Sprache liegen im `localStorage`, getrennt nach Browserprofil und Origin. localhost und a-minor.ch haben getrennte Daten. JSON exportieren, bevor Websitedaten gelöscht werden oder der Browser gewechselt wird. Frühere Kurs-/Logdaten werden nicht gelöscht; ihre Oberfläche entfällt.

## Theorie

Das Lesebuch **Musiklehre** umfasst neun Teile mit **34 Kapiteln, fünf Anhängen und 250 notierten Beispielen**, jeweils mit optionaler Klangvorschau. Es ist für Bildschirm und Handy gedacht: begrenzte Textbreite, nummerierte Abschnitte, erklärende Modelle, Zusammenfassungen und Vor-/Zurücknavigation. Keine Aufgaben, Checklisten oder Fortschrittsmarkierungen.

Ton und Schrift, Tonleitern, Modi, Intervalle, Akkorde, Harmonik, Rhythmus, Satz, Klang und Form bilden die Grundlagen. Weitere Kapitel verbinden dieses Wissen mit Ensemble-Rollen, dem Verstehen einer Partitur und den sechs Stilen Rock, Doom, Gothic, Progressive, Barock und Lounge. Keyboard-Motiv und Begleitung sowie Lounge-Stimmführung vertiefen die musikalischen Zusammenhänge. E-Bass-Beispiele erläutern Grundton, Quinte, Oktave und chromatische Annäherungen in oktavierender Bassnotation. Die Schlagzeugbeispiele verwenden Percussion-Notation und echte Drum-Klänge; das ausdrücklich bezeichnete Tremolo-Modell bleibt ein Beispiel mit Tonhöhen. Alle Beispiele sind eigene Modelle, keine Transkriptionen. Das Lesebuch setzt keinen Referenzkurs voraus.

**Griffbrett** zeigt die sechs P4-Saiten mit Grundton, Skala, Tonname oder Intervall bis Bund 24. Das Buch enthält außerdem Tastaturkarten, Rhythmusraster, Formabläufe und Klangdarstellungen.

## MIDI und Klang

Der globale Standardausgang und getrennte Ausgänge für Keyboard, Bass, Gitarre und Drums werden gespeichert und beim nächsten Besuch wiederhergestellt. Getrennte Geräte bleiben vorgemerkt. Eine eindeutige Kombination aus Name und Hersteller kann eine geänderte Geräte-ID zuordnen; mehrdeutige Treffer werden nicht automatisch ausgewählt. Die Browserberechtigung bleibt erforderlich.

| Stimme | MIDI-Kanal | Programm, nullbasiert |
|---|---:|---|
| Keyboard | 4 | 0 |
| Bass | 6 | 33 |
| Gitarre | 7 | 24 / 27 / 29, je nach Stil und Grade |
| Drums | 10 | 0 |

SMF Format 0, 480 PPQ, GM-Drums. Kick 36, Snare 38, geschlossene Hi-Hat 42, Einzähler/Rim 37. Keine MIDI-Clock oder Geräte-Transportsteuerung. Die MIDI-Stimme wählt ihr Programm; externe Klangerzeuger benötigen die passende Klangzuordnung. Persönlicher Mix nutzt extern CC11, intern Kanal-Gain.

Tempoeinheit: ♩ bei Vierteltakten, ♩. in 12/8, ♪ in 5/8 und 7/8. Notation und MIDI berücksichtigen Haltebögen, Akzente, Staccato und gegebenenfalls Swing. Swing verwendet ein 2:1-Modell. Die Klangvorschau verwendet lokales FluidR3 GM mit SpessaSynth; sie simuliert keine reale Gitarren-Anschlagtechnik. Klang und Latenz am angeschlossenen Gerät benötigen einen Hörtest.

[SoundFont](assets/soundfont/README.md) · [Audio-Engine](assets/vendor/README.md) · [PDF-Engine und Schrift](assets/vendor/pdfmake/README.md). Quellen und Lizenzen stehen im Footer.

## Dateien und Pflege

| Datei | Aufgabe |
|---|---|
| `js/practice-composer.js` | Versionierter musikalischer Generator, Stile, Grade und Formen |
| `js/practice-generator.js` | Unveränderter Notenablauf alter Links und gemeinsamer MIDI-Encoder |
| `js/practice-info.js` | Tatsächliche musikalische Merkmale und kurze Einordnung |
| `js/practice.js` | Auswahl, reproduzierbare URL, Wiederöffnen gespeicherter Stücke |
| `js/bookmarks.js` | Partitursnapshots, Liste, sichere Speicherung, JSON/CSV |
| `js/repertoire.js` | Gemeinsamer Partitur- und Audio-/MIDI-Player |
| `js/score-pdf.js` | Direkter einseitiger PDF-Download |
| `js/app.js`, `index.html`, `css/style.css` | Navigation, Ansichten und Darstellung |
| `data/book.json`, `locales/de.json`, `locales/en.json` | Lehrbeispiele, deutsche/englische Texte |
| `js/music.js`, `js/notation.js` | Tonhöhen, Skalen, P4-Lagen, Notenschrift und Zeitmodell |
| `js/audio.js`, `js/midi.js`, `js/midi-player.js` | Persistente MIDI-Zuordnung, Dateien und externe Wiedergabe |

Frühere Kursdaten, Repertoiredateien und Prüfungen bleiben als Inhaltsquelle und Archiv erhalten. Alte Stück- und Einheitenlinks sind weiterhin lesbar; Kurs, Repertoire und Log sind keine Menüpunkte mehr. Historische Abgleiche: [Curriculum](docs/CURRICULUM.md), [fachliche Prüfung](docs/COURSE_AUDIT.md), [musikalische Prüfung](docs/MUSICAL_REVIEW.md).

Buchkapitel verwenden `textId` und platzieren Beispiele genau einmal als `[[beispiel-id]]`. Texte und sprachabhängige Beschriftungen gehören in beide Sprachdateien. Tonnamen international: B = deutsches H, Bb = deutsches B, C4 = MIDI 60. Gespeicherte Gitarrentöne sind klingend; die Notation oktaviert.

Notendauern: `w h q e s`, optional `.` oder `t`. `p` kann einen Einzelton oder ein Akkordarray enthalten. `s` zählt Gitarrensaiten tief nach hoch 0–5. `bass` ist die zweite Stimme; `tie` verbindet gleiche Töne. Jede Stimme füllt den Takt vollständig. Neue Generatorfassungen benötigen eine neue Version; vorhandene Notenstände und Legacy-Links bleiben nachvollziehbar.

## Prüfungen

```sh
npm ci
npm test
npm run test:browser
```

Node.js, Python 3 und Chromium (`/usr/bin/chromium`, alternativ `CHROMIUM_PATH`) erforderlich. Entwicklungsabhängigkeiten werden für Tests und das Aktualisieren der lokal ausgelieferten Bibliotheken verwendet.

Geprüft werden deterministische Generation, alle Grades/Stile, Taktfüllung, Skalen, Griff- und Handspielbarkeit, Literalwiederholungen, tatsächliche MIDI-Noten, Klang- und MIDI-Routing, Gerätewiederherstellung, unveränderliche Bookmarks, atomarer Import, JSON/CSV, beide Sprachen, mobiles Layout und einseitige direkte PDFs. Auch die vorhandenen Inhalts-, Notations- und SoundFontprüfungen bleiben aktiv.
