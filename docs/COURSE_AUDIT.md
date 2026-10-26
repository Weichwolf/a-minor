# Fachliche Prüfung · 2026-10-26

Die [Stufenprofile](PRACTICE_LEVELS.md) beschreiben die Anforderungen des aktuellen Praxisgenerators. Die [musikalische Revision](MUSICAL_REVIEW.md) dokumentiert konkrete Notenbefunde und Korrekturen. Die folgenden Kursangaben betreffen das archivierte Lernmaterial.

## Grundlage und Umfang

Das fachliche Ziel umfasst Notenlesen, Rhythmus, Melodie, Begleitung, Harmonie und Form. Eigenständige Notenbeispiele und vollständige Stücke verbinden diese Fähigkeiten. Die musikalischen Anforderungen werden aus den tatsächlichen Stimmen beurteilt: Tonumfang, Anschlagsdichte, Bewegungen, Koordination und Wiederkehr gehören zusammen.

| Fähigkeit | Kurszuordnung | Beispiele |
|---|---|---|
| Grundwerte, Pausen, Tonwechsel und Puls | Phase 0: Lesen und Rhythmus | Einführende Gitarren- und Keyboardübungen |
| Achtel und Akkordbegleitung | Phasen 0–2 | `u2-1`, `ku2-rhythm` |
| Dämpfung, Powerchords und Akzente | Phasen 0–2 | `u0-4-4`, `u2-6`, `u2-rhythm` |
| Melodie über Bass/Akkorden und Handrollen | Phasen 0–3 | `ku5-3`, `ku7-4` |
| Synkopen, Chromatik und Bindungen | Phasen 3–4 | `u3-reading`, `ku3-reading`, `u8-4`, `ku8-4` |
| Sechzehntel und gebrochene Akkorde | Phasen 3–5 | `u3-4`, `ku3-4`, `u5-2`, `ku5-2` |
| Shuffle, 12/8 und Formnavigation | Phasen 5–8 | `u5-4`, `ku5-4`, `u7-4`, `ku7-4` |

Die Tempostudien `u7-5` und `ku7-5` verwenden denselben Satz bei 60, 90 und 120 Vierteln pro Minute. Vollständige Durchläufe verbinden Tempo, Klang und Form. Die Einstiegsübungen bleiben langsamer.

## Eigenständiges Zielprofil

- Gitarre: E2 A2 D3 G3 C4 F4; Noten mit Lageangabe, keine Tabs. Offene Pedaltöne, unabhängige Melodie, danach Arpeggien und Akkorde mit Melodiestimme.
- Keyboard: eigenständige Bass-/Melodieführung und lesbare Voicings, auf einem Synthesizer mit 49 Tasten und klavierartigen Klängen anwendbar. Ein Klang genügt zunächst.
- Klangreferenzen: *Turn Loose the Swans*, *October Rust*, *Eternity*, *Le quattro stagioni*, *Harmonia artificioso-ariosa*. Keine Gleichsetzung dieser Musik mit einer einzelnen Skala. Hörziele: Phrasierung, Wiederholung, Register, Dichte, Reibung und Auflösung.
- Solospiel zuerst; Drums oder externer Bass können unterstützen. Die Abschlussminiaturen von Phase 1 werden auch ohne Begleitung geprüft.
- Notenlesen, Gehör und eigene Notation laufen durch alle Phasen. Akkordsymbole ergänzen später ausgeschriebene Stimmen; sie ersetzen das Lesen nicht.

## Korrigierte fachliche und technische Fehler

- Tiefes Gitarren-E: geschriebenes E3 liegt im Raum unter der dritten unteren Hilfslinie, nicht auf dieser Linie.
- P4-Formen sind innerhalb verfügbarer Bünde/Saiten verschiebbar; offene Saiten lassen sich nicht als offene Saiten mitverschieben.
- G3 im Drei-Saiten-Fenster bleibt auf D, statt automatisch auf die offene G-Saite zu wandern.
- Seitliches Vibrato erhöht die Tonhöhe; es schwingt nicht automatisch symmetrisch um den Bundton. Sofortiges Vibrato ist keine allgemeine Regelverletzung.
- F–E ist eine phrygische Übevorgabe, keine zwingende Auflösung. F–G dient als Gegenbeispiel.
- Klavier und Synth unterscheiden sich im Ausklang. Wiederholter Bass macht Übungen ohne Latch, Split oder Pad möglich.
- Keyboard-Gegenbewegung beginnt rechts auf C4, links auf C3: keine zwei Daumen gleichzeitig auf derselben Taste.
- Haltebögen verlängern die Tonereignisse bei der Vorschau und bleiben über Zeilenumbrüche sichtbar. Bis zu drei Gitarrenschichten teilen ein System; Keyboard nutzt zwei Systeme mit unabhängiger oberer und mittlerer Stimme.
- Triolen, punktierter Viertelpuls in 12/8 und Achtelpuls in 5/8 beziehungsweise 7/8 stimmen zwischen Noten, Vorschau und MIDI überein. Swing-Vorschau verwendet ausdrücklich ein 2:1-Übemodell.
- Wiederholungen, einzelne erste/zweite Endings, D.S. al Coda und D.C. al Fine steuern die Vorschau aus denselben Notendaten.
- Notenvorschau: FluidR3 GM mit SpessaSynth. Echte SoundFont-Hüllkurven, Sample-Loops, Velocity, Release und Drum-Choke. Browser prüft Ladeabbruch, Retry, vollständige Schleifen, Stop und Übemix; PCM-Tests prüfen die Klangeigenschaften getrennt vom Hall.
- Alle Drum-Muster enthalten hörbar gewichtete geschlossene Hi-Hat; die Auswahl heißt ausschließlich Klick/Drums.
- Half-time hat tatsächlich Snare auf 3; gerade Achtelbegleitung Snare auf 2 und 4. Keine zufälligen Fills in Lernaufgaben.
- MIDI-Stopp leert die Warteschlange und beendet Kanal-10-Noten. Verbindungsabbruch oder inaktiver Tab stoppt die Begleitung; kein heimlicher interner Schlagzeugersatz.
- Import validiert vor Zustandsänderung und ersetzt den lokalen Fortschritt. Alte Speicherformate werden eingelesen. UI maskiert importierte Texte. Fortschritts-IDs sind sprachunabhängig.

## Quellen für technische und notatorische Korrekturen

- [musictheory.net: Staff, Clefs and Ledger Lines](https://www.musictheory.net/lessons/10), [Dots and Ties](https://www.musictheory.net/lessons/14).

## Quellen der Musiklehre (2026-09-12)

Die Musiklehre nennt keine spezifischen Geräte; die frühere Gerätetabelle (Anhang D) wurde entfernt, Synthese, Effekte und Drumcomputer werden allgemein behandelt. Die verbleibenden Anhänge rechnen (Frequenzen, Cent, Kombinationstöne, Delay-Zeiten) und listen (Stimmungen, Akkordsymbole); alle Werte sind aus den Formeln im Text nachrechenbar, die Kombinationstöne in Anhang B sind mit den temperierten Frequenzen neu berechnet und tragen ihre Cent-Abweichung.

Belegte Fakten über die Referenzen (Kapitel 27):

- My Dying Bride, *Turn Loose the Swans*: [Wikipedia](https://en.wikipedia.org/wiki/Turn_Loose_the_Swans): Veröffentlichung 11. Oktober 1993, Peaceville; Besetzung Stainthorpe, Craighan, Robertshaw, Jackson, Powell (Violine, Keyboard), Miah; Titelliste mit Längen; *Sear Me MCMXCIII* nur Gesang, Keyboard, Violine; *Black God* mit Gastgesang.
- Type O Negative, *October Rust*: [Wikipedia](https://en.wikipedia.org/wiki/October_Rust): Veröffentlichung 20. August 1996, Roadrunner; Besetzung; programmierte Drums (Josh Silver, Programmierung; Produktion Silver und Steele); *Cinnamon Girl* (Neil Young); *Bad Ground* als Scherz-Intro. B-Standard-Stimmung: [Kenny Hickey, Equipboard](https://equipboard.com/pros/kenny-hickey) und [Wikipedia](https://en.wikipedia.org/wiki/Kenny_Hickey).
- Anathema, *Eternity*: [Wikipedia](https://en.wikipedia.org/wiki/Eternity_(Anathema_album)): Veröffentlichung 25. November 1996, Peaceville; Besetzung Vincent Cavanagh, Daniel Cavanagh (Gitarre, Keyboards), Patterson, Douglas; Gäste; *Hope* (Roy Harper, gesprochener Text); mehr Keyboards, überwiegend klarer Gesang.
- Biber, *Harmonia artificioso-ariosa*: [IMSLP](https://imslp.org/wiki/Harmonia_artificioso-ariosa_(Biber,_Heinrich_Ignaz_Franz_von)): Erstdruck 1696; Besetzung, Scordaturen und Satzfolgen der sieben Partien (Anhang A, Kapitel 7, 14, 26, 27).
- Vivaldi, *Le quattro stagioni*: Op. 8 Nr. 1–4 aus *Il cimento dell’armonia e dell’inventione*, Amsterdam 1725; Tonarten, Satzfolgen und Sonette nach den Partituren (IMSLP).

Notenglyphen: [Bravura](https://github.com/steinbergmedia/bravura) 1.482 (Steinberg, SIL Open Font License 1.1), Umrisse extrahiert bei 1 em = 40 px; Lizenz unter `assets/glyphs/OFL.txt`. Schlüsselplatzierung (G-Schlüssel auf der zweiten, F-Schlüssel auf der vierten Linie), Vorzeichen, Pausen, Fähnchen, Triolenklammern, Akzente und Wiederholungszeichen sind mit Playwright-Screenshots und geometrischen Überlappungsprüfungen kontrolliert.

Hardwareklang und tatsächliches Timing am angeschlossenen MIDI-Klangerzeuger sind im Entwicklungscontainer nicht überprüfbar. Browser- und MIDI-Mocktests ersetzen diesen Hörtest nicht.


## Überarbeitung · 2026-09-22

### Musikalische Form

86 Kurs-Partituren sind neu oder überarbeitet; bestehende Aufgaben-IDs bleiben erhalten. Von 130 Aufgaben mit Noten verwenden 58 die Form A–B–A–C, darunter vier Lesegeneratoren. Alle notierten Kursaufgaben umfassen mindestens vier Takte. Lange Sequenzen, Kadenzen, Wiederholungen und Sprungformen bleiben eigenständige Formen. Offene Studien erhalten ausnotierte Schlüsse; Umkehrungen tragen korrekte Bassbezeichnungen. Der gemeinsame obere Ton in D7–G ist als eigenständige gebundene Stimme notiert.

### Fachliche Korrekturen

- P4-Geometrie: eine Saite plus sieben Bünde = 5 + 7 = 12 Halbtöne; vier Bünde auf sechs Saiten ergeben 24 Orte über 28 Halbtöne. F4 + 19 Bünde = C6, Bund 20 = C#6.
- 49 Tasten: 4 × 12 + 1 = 49, hier C2–C6. C2 liegt vier Halbtöne unter E2. Handzuordnung und klingender Bereich sind keine unveränderlichen Geräteeigenschaften.
- E2–A4 ist zwei Oktaven plus Quarte; das notierte Pentatonikmuster enthält auf einer Saite drei Töne. P4 bedeutet nicht automatisch drei Töne je Saite.
- Modalität entsteht im Zusammenhang; Bass oder Leitton allein sind kein verlässliches Klassifikationskriterium. Pentatonik ohne Halbtonschritte ist nicht automatisch konsonant.
- Hemiole: Verhältnis 3:2; 3+3+2 ist eine andere Akzentgruppierung. Zwei punktierte Halbe in 12/8 tragen zusammen vier große Pulse. Siehe [Open Music Theory: Metrical Dissonance](https://viva.pressbooks.pub/openmusictheory/chapter/metrical-dissonance/).
- Akkordbeispiele: fehlende Septimen beziehungsweise Leittöne ergänzt, verminderte Septakkorde vollständig und passend zur Auflösung geschrieben.
- Unbegründete Universalregeln zu Fingersätzen, Gain, Sustain, Registern, Form und Synthese durch konkrete Modelle und ihre Grenzen ersetzt. Eine Staccato-Note bezeichnet keinen bloßen Hallausklang.

### Darstellung und Technik

47 zusätzliche Theorieabbildungen zeigen Grifforte, Tasten, Rhythmus, Form und Synthese. Das eigenständige P4-Griffbrett ist wieder im Hauptmenü erreichbar. Modellbezogene Geräteanleitungen und Links wurden aus Kurs, Oberfläche und Dokumentation entfernt.

Balken folgen den angegebenen Taktgruppen und überschreiten keine Taktgrenze. Vorzeichen gelten stimmenübergreifend innerhalb desselben Systems; gebundene Fortsetzungen erzeugen keinen neuen Anschlag. Die Trennung von Stimm- und Systemgeltung lässt sich auch in [LilyPond: Automatic accidentals](https://lilypond.org/doc/v2.26/Documentation/notation/displaying-pitches#automatic-accidentals) nachvollziehen.

Der Generator berechnet auffüllbare Restdauern vor der Auswahl. Dadurch vermeidet er rhythmische Sackgassen; ungültige Längen und Tonbereiche werden abgewiesen. A–B–A–C und Grundtonschluss sind automatisiert überprüft.

### Prüfung und Grenze

Node-Tests prüfen musikalische Form, Taktlängen, Saitenbelegung, Griffweiten, Handspannweiten, Haltebögen, Vorzeichen, Balken, Generator, Karten und Gerätefreiheit der Sprachdaten. Browsertests prüfen beide Sprachen, alle Einheiten, neue Theorieabbildungen, das Griffbrett auf kleinen Bildschirmen, Wiedergabe und MIDI-Mocks. Die geänderte Erwartung für die Harmoniereferenzen folgt der ausdrücklich von vier auf acht Takte erweiterten Studie.

Musikalische Qualität ist nicht aus Formbuchstaben beweisbar. Die Tests belegen Struktur und technische Konsistenz; Instrumentklang, konkrete Greifbewegungen und gestalterische Wirkung benötigen das Spiel am Instrument.

## Lokaler Fortschritt

- Fortschritt und Notizen werden ausschließlich im Browser gespeichert (`localStorage`, Format 3).
- Die Merge-Schnittstelle und das aktive Ereignisjournal wurden entfernt. Das alte Journal wird nur zur Migration gelesen.
- Manuelles Backup/Restore sichert und ersetzt den lokalen Stand. Bestehende Markierungen, Notizen und Löschungen bleiben bei der Migration erhalten.
- Der bisherige Merge-Test wurde wegen der geänderten Anforderung durch Migrationstests ersetzt. Zusätzliche Tests prüfen Ersetzen beim Restore, Speicherfehler und Änderungen aus anderen lokalen Tabs.
