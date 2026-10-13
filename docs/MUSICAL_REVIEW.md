# Praxisgenerator: laufende Fallprüfung · 2026-10-13

Die aktuelle Prüfung betrifft den Generator für vier Instrumente. Der ältere Bericht darunter dokumentiert den archivierten Kurs und das frühere Repertoire; er ist kein Nachweis für den neuen Generator.

`node scripts/review-practice.cjs` erzeugt reproduzierbar 36 Stücke (sechs Grades × sechs Stile) mit allen vier Parts und schreibt die Befunde nach `test-results/practice-review.json`. Seeds, Tonart, Tempo, Harmonik, Form, tatsächliche Notenwerte, erste Takte der Abschnitte, Stückbeschreibungen und Bewegungskennzahlen stehen im Bericht. Die Kennzahlen sind Suchhilfen für die Partiturbeurteilung: Ein großer Tonhöhensprung kann auf benachbarten Saiten leicht sein, eine kleine Tonbewegung einen Lagenwechsel verlangen. Gemittelte Akkordhöhen sind keine realen Melodietöne. Bundmittelwerte ignorieren die Entlastung durch offene Saiten und Pausen. Der Bericht behauptet deshalb keine automatische Musikalitäts- oder Schwierigkeitsbewertung.

## Bisher geprüfte Befunde und Korrekturen

- **Grade 0 Gothic, Seed 20261015, Fis-Moll:** Der Powerchordabschnitt enthielt F♯2–E2–C♯4–F♯2 als Grundtöne. Der Sprung E2–C♯4 betrug 21 Halbtöne. Auf der P4-Gitarre bis Bund 5 ist der tiefe Cis-Powerchord auf benachbarten Saiten nicht verfügbar. Eine bloße Optimierung der Saiten konnte das nicht lösen. Die Anfänger-Harmonieplanung verwendet hier nun iv–i als vorbereiteten Schluss: F♯m–E–Bm–F♯m. Die Gitarrengrundtöne F♯2–E2–B2–F♯2 bleiben je Bewegung innerhalb einer Quinte. Die Tonart und der Wechsel von Riff zu Powerchords bleiben erhalten. Keyboard und Bass folgen derselben geänderten Harmonik.
- **Powerchords über eine ganze Phrase:** Eine zusätzliche Planung verschiebt ausschließlich vollständige Grundton/Quint-Paare um Oktaven und betrachtet die folgenden Anschläge mit. Rhythmus, Tonklassen, einstimmige Motive und der gemeinsame Anfang variierter Rückkehr bleiben erhalten. Ein unabhängiger Regressionstest mit C3/G3–D3/A3–E2/B2 belegt die ruhigere Fortsetzung nach E3/B3; Bindungen bleiben zusammenhängend. Danach plant der bestehende Durchgang die konkrete Saitenfolge.
- **Abschnittsübergänge und Wiederkehr:** Die Messung schneller großer Sprünge begann bisher an jedem Abschnitt neu. Sie durchläuft nun die tatsächliche gespielte Form und berücksichtigt auch den Übergang zum nächsten Abschnitt. Die maximale Anschlagsdichte wird weiterhin abschnittsweise bestimmt. Ein eigener Test belegt, dass ein schneller Registersprung genau an einer Abschnittsgrenze in die kombinierte Anforderung eingeht.

## Prüfung der angekündigten Lerninhalte

Die Fokusprüfung kontrolliert klingende Ereignisse und Notation statt allein die ausgewählte Schwerpunktbezeichnung. Sie deckt alle sechs Stile ab. Die Regressionen stehen in `tests/practice-focus.test.cjs`; die zusätzlichen Harmonie- und Registerprüfungen in `tests/practice-composer.test.cjs`.

| Reproduzierbarer Befund | Musikalische Korrektur |
|---|---|
| Grade 4 Rock, Seed 12: „synkopierter Bass“ konnte nur auf ganzen Zählzeiten einsetzen | Eine Achtelpause führt zu einer punktierten Viertel, die über den folgenden Hauptschlag hinweg klingt. Der restliche Takt bleibt variabel. Dieselbe Anforderung gilt für die entsprechenden Gitarren- und Keyboardschwerpunkte. |
| Grade 5 Rock, Seed 23: Septakkord-Arpeggio ohne gespielte Septime | Die eröffnende Akkordfigur enthält Grundton, Quinte, Terz und Septime. Bei zu wenigen Anschlägen erhält ihr Beginn vier Achtel; danach bleiben Rhythmus und Kontur variabel. |
| Grade 5 Rock, Seeds 65/86: Shuffle-Gitarre beziehungsweise Shuffle-Bass nur mit Vierteln | Die erste Motivzelle enthält Achtelpaare, die der Player ternär ausführt. Gewählter Shuffle bleibt auch im Progressive-Stil in 4/4; ungerade Metren überschreiben diesen Schwerpunkt nicht. |
| Grade 0 Rock, Seed 8: angekündigte Drum-Unterbrechung fehlte | Vor dem Fill pausieren alle Schlagzeugstimmen gemeinsam auf der vierten Zählzeit. Die vorherigen drei Schläge behalten den Puls. |
| Grade 2 Rock, Seed 0: Kick-Variation ohne versetzten Kick | Der erste Haupttakt enthält einen zusätzlichen Kick auf der ersten Achtelzwischenzählzeit. |
| Grade 3 Barock, Seed 16: die Halbtonänderung blieb teilweise innerhalb der Tonleiter | Ein tatsächlich leiterfremder Nachbarton führt lokal einen Halbton zum Zielton zurück. Die chromatische Farbe hat damit eine konkrete Auflösung. |
| Grade 4 Rock, Seed 28: Haltebogen-Schwerpunkt ohne Haltebogen | Die zweite Motivzelle stellt einen teilbaren Tonwert bereit; seine zwei gleich hohen Noten werden gebunden. |
| Grade 5 Progressive, Seeds 3/29: Triolenauftakt wurde durch 5/8 oder 7/8 ersetzt | Auch im ungeraden Takt endet die Fokuszelle mit einer vollständigen Achteltriole. Im 12/8-Schwerpunkt bleibt die entsprechende Dreiergruppe regulärer Achtel. |
| Grade 5 Gothic, Seed 5: erster Akkord war vermindert, deshalb fehlte jede Taktwiederholung | Ein späteres geeignetes Powerchordpaar trägt die Wiederholung. Offener Achttakt-Mittelpunkt und vorbereiteter Schluss bleiben geschützt. |
| Grade 5 Lounge, Seed 20261523: die Begrenzung oberhalb einer gehaltenen Innenstimme erzeugte G statt eines Tons aus Fis-Dorisch beziehungsweise der Harmonie | Die rechte Linie wählt jetzt den nächstliegenden passenden Ton innerhalb des spielbaren Handrahmens; im konkreten Fall G♯. |

Bei Durakkorden folgt die Septime dem Modus: beispielsweise IV7 in Dorisch und ♭VII7 in Äolisch. Das frühere pauschale maj7 konnte zusätzliche, unbeabsichtigte chromatische Farben erzeugen. Mollakkorde behalten bewusst die gebräuchliche kleine Septime; zusammen mit harmonisch-mollgeprägten Melodien ist dies eine Mischung mit natürlich Moll. Akkordtöne werden als Grundton, Terz, Quinte und Septime geschrieben; ihre enharmonische Schreibweise und ein gegebenenfalls erhöhtes Quintintervall stimmen mit den Akkordsymbolen überein.

Nach der erweiterten Fokus- und Harmonieprüfung bestehen alle **100 automatisierten Tests** sowie die vollständige Browserprüfung mit 288 Stil/Grade/Instrument/Sprache-Kombinationen, 48 einseitigen PDF-Downloads und zwei zusätzlichen Varianten-PDFs. MIDI-Persistenz, Wiedergabe, Bookmarks mit JSON/CSV und die Theorieansichten bestehen ebenfalls. Die zusammenhängende musikalische Beurteilung der 36 Fälle und die abschließende Anforderungsbilanz stehen noch aus. Die Prüfung ist eine Noten- und Bewegungsanalyse, kein instrumentaler Spieltest und kein Hörurteil.

---

# Musikalische und fachliche Revision · 2026-09-30

## Maßstab und Umfang

Die Referenzen sind eine stilistische und geschmackliche Leitlinie. Der Kurs erlaubt andere Tonarten, Tempi, Formen, Dichten und Techniken. Langsam und sparsam ist eine mögliche Entscheidung; durchgehende Achtel, Sechzehntel, Gallop, Swing und Dur sind ebenfalls verfügbares Material.

Geprüft wurden die notierten Stimmen und Aufgaben beider Instrumente, die Beispiele der Musiklehre sowie sämtliche Formteile aller Repertoirestücke. Der Kurs enthält nach der Erweiterung 326 + 4 × 3 = 338 Aufgaben: 130 + 8 neue Partituren + 1 ergänzte Shuffle-Partitur = 139 notierte Aufgaben; 338 − 139 = 199 Aufgaben mit textlicher Spiel-, Hör-, Variations- oder Kompositionsanweisung. Vier der notierten Aufgaben erzeugen Lesestücke mit Motiv, versetzter Antwort, Wiederkehr und Schluss.

**Lehrerperspektive:** Stimmen und Instrumentenbereiche müssen spielbar sein, Lernziel und hörbare Aufgabe übereinstimmen. Einzelnotenrhythmik ersetzt keine Akkordanschlagtechnik. Eine Variation darf keine Taktlänge versehentlich verändern. Akustische Modelle und Satzkonventionen gelten unter ihren jeweiligen Bedingungen.

**Lernendenperspektive:** Die Aufgabe braucht einen erkennbaren musikalischen Zusammenhang. Vorher muss klar sein, welche Noten bleiben, welche ersetzt werden und woran die Aufnahme beurteilt wird. Ruf, Antwort, Wiederkehr und Schluss sind häufige Mittel; andere Formen bleiben möglich. Auch ein offener Schluss ist ein Schluss, wenn er bewusst gesetzt wird.

Die Prüfung ist eine Partitur- und Aufgabenbeurteilung mit technischer Wiedergabekontrolle. Sie ersetzt kein Spielen auf den realen Instrumenten und keine ästhetische Hörbeurteilung durch Musiker. Automatische Tests messen keine Musikalität.

## Kurs: konkrete Änderungen

| Befund | Korrektur | Musikalischer Nachweis in der Aufgabe |
|---|---|---|
| Powerchords überwiegend als gehaltene oder vereinzelte Anschläge | `u2-pulse`, Black Lantern | Achtel-Hook E5–G5, Antwort auf A5, wörtliche Wiederkehr, B5–A5–E5 und Schlusspause |
| Sechzehntel vorhanden, aber keine durchgehenden Powerchord-Sechzehntel | `u3-riff`, Iron Current | Gleichmäßige Sechzehntel, Kontrast G5–A5, Rückkehr; Gallop als zweite Fassung desselben Stücks |
| Akkordsymbole ohne hinreichende rhythmische Strum-Anwendung | `u4-strum`, Violet Gate | Acht Takte in G-Moll, Dreiklang-/D7-Wechsel, gleiche Musik ausgeschrieben und als Rhythmuschart mit Taktwiederholung |
| Keyboardtechnik mit zu wenig wiederholten linken Akkorden unter bewegter Melodie | `ku5-comping`, Night Relay | Linke Viertelakkorde, rechte Hook/Antwort, dominante Wendung und Schluss; gerade, Swing und Offbeat-Variante |
| Quint-/Sextriff nur als gerade Vorschau vorhanden | `e4-6-2` mit vollständiger Swing-Partitur | Vergleich desselben Hooks bei gleichem Viertelpuls |
| Klangdiagnose und Intervallvergleich ohne ausreichend bestimmten Verlauf | `ke0-2-1`, `ke0-3-4` | Bereits bekannte Phrase für Klangvergleich; eigener viertaktiger Ruf/Farbwechsel/Rückkehr/Schluss für Intervalle |
| Moll-/Durvergleich und einige freie Rhythmusaufgaben zu wenig in Form eingebunden | `e2-1-2`, `ke2-1-2`, `e2-6-3`, `e3-4-3`, `ke3-4-3`, `e5-groove-3`, `ke5-groove-3` | Vergleich bzw. Rhythmuswechsel behält Motiv, Antwort und bewussten Schluss |
| „Erste Viertel ersetzen“ unklar, wenn die erste Zählzeit mehrere Noten/Pausen enthält | `e3-4-2`, `ke3-4-2` | Gesamte erste Zählzeit ersetzen, ihre erste klingende Tonhöhe verwenden; restliche Phrase und Schluss behalten |
| Chromatische Achtel zur Viertel verlängern und folgende Achtel entsprechend kürzen ergibt Null | `e6-5-2`, `ke6-5-2` | Punktierte Achtel + Sechzehntel: 3/4 + 1/4 = 1 Viertel; gesamte Phrase bleibt spielbar |
| Kurze Miniaturen belegen keine langen Gigajam-Parts | `e7-5-2/3`, `ke7-5-2/3` | Dichte Rhythmik, höhere Tempi, lange Form und vollständiges lokales Stück mit zwei Aufnahmen an verschiedenen Tagen |

Bestehende Variationen behalten grundsätzlich das Ausgangsstück. Teilstimmen werden zum Hören isoliert und anschließend wieder in die vollständige Form eingesetzt. Kompositionsaufgaben liefern Tonmaterial, Satz- oder Rhythmusbedingung; die Aufnahme prüft den tatsächlichen Verlauf. Neue Aufgaben prüfen neben Technik ausdrücklich Hook, Stimmengewichtung und Schluss.

## Repertoire: alle Stücke

Beurteilung der ausgeschriebenen Stimmen und Formteile. „Beibehalten“ bedeutet, dass keine konkrete musikalische Fehlentscheidung gefunden wurde; es ist kein ästhetisches Gütesiegel.

| Stück | Musikalischer Befund und Entscheidung |
|---|---|
| Ember | Gehaltener Ruf, kurze Antwort und freier Raum tragen die Anfängerform. Beibehalten. |
| Stone and Breath | Tiefe Einzelimpulse und ganze Pausentakte gehören zum Gewicht des Stücks. Keine Achtel als Selbstzweck ergänzen. |
| Empty Halls | Dreierpuls und räumlich versetzte Antworten bilden einen Dialog. Schluss zieht Begleitung zurück. Beibehalten. |
| Beneath the Ash | Wiederkehrender tiefer Gedanke mit kurzen Keyboardantworten; gemeinsame Einsätze und Stopps sind das Lernziel. Beibehalten. |
| Last Light | Schlichte lange Linie und ausgedünnter Schluss. Wenige Noten sind hier eine vollständige Aussage. Beibehalten. |
| Mossbound | Auftaktnahe Gesten und ruhige Gegenantwort; Luft im Riff bleibt erhalten. |
| The Second Threshold | F–E und die F-Harmonie erzeugen einen konkreten phrygischen Verlauf. Pausen verhindern einen bloßen Skalenlauf. Beibehalten. |
| Black Glass | Gebrochene Dreiklänge, unterbrochene Antworten und ausgeschriebene Variationen. Beibehalten. |
| Iron Rain | Hook zu wenig durchgehend für die Lernanforderung. Jetzt sechs E5-Achtel und zwei G5-Achtel; Antwort kürzt den Lauf vor einer Pause. E-Bass bleibt bewusst Pedal unter G5. Falsches A5-Symbol im vorletzten Takt auf E5 korrigiert. |
| November Window | Dreiertakt, fallende Linie und verspätete Antworten ergeben einen eigenen Liedcharakter. Beibehalten. |
| The Descent | Absteigender Bass E–D–C–B trägt die Form; gehaltene und fallende Melodietöne reagieren darauf. Beibehalten. |
| Crooked Footsteps | Vorweggenommene Anschläge und Bindungen machen den Hook; Pausen bleiben vollständig. Beibehalten. |
| Shards of Rain | Kurze Einzelnoten-Blitze bleiben A-Material. B erhält Powerchord-Bursts und einen durchgehenden B5-Sechzehnteltakt, bevor die Musik nach E zurücknimmt. |
| Circle of Dust | Sequenzierter Gedanke bleibt über dem bewegten harmonischen Weg erkennbar. Beibehalten. |
| Beyond the Gate | Gehaltene Frage und breitere Antwort; Schluss und vorherige Spannung sind verschieden gestaltet. Beibehalten. |
| Threshold of Fire | Langsame harmonische Bewegung und hervorgehobener Leitton bereiten die Rückkehr vor. Beibehalten. |
| Dance of Lead | Punktierte Gesten und verminderte Wendungen gehören zum schwerfälligen Tanz; kurze Akkordantworten begleiten den Keyboard-Lead. Beibehalten. |
| Blackwater | Zusammengesetzter Puls und lange Melodiebögen; Atemstellen unterscheiden die Formhälften. Beibehalten. |
| Pendulum of Thorns | Swingriff und absichtlich leere Antworten bilden den Charakter. Beibehalten. |
| Threads of Smoke | Legatofragmente und Rückkehr in tieferer Gestalt. Die Begleitung füllt nicht jeden Melodieausklang. Beibehalten. |
| Light Through Lead | F# über C bildet den lydischen Kontrast. F# im letzten Em-Klang bleibt eine offene None, keine versehentlich fehlende Tonika. |
| Cold Bells | Registerdialog und weite Pausen tragen das Glockenbild. Keine permanente rhythmische Füllung ergänzen. |
| Stone Against Water | Gerade und ternäre Stimmen stehen bewusst nebeneinander; ihre spätere Annäherung bildet Entwicklung. Beibehalten. |
| Seven Shadows | 2+2+3 trägt den Lauf, fehlender Anschlag verändert das letzte Gewicht. Beibehalten. |
| The Broken Circle | 3+3+2-Riff und Solo kontrastieren. Im Solo waren obere Begleitnoten aus einem anderen Verlauf kopiert: jetzt C über Am, F über Dm, G# über E7 und A über Am. |
| House of Rain | Türmotiv, Riff und Solo behandeln denselben Gedanken in verschiedenen Dichten. Beibehalten. |
| Ashen Garden | Atmende 12/8-Linie; Keyboardthema links und rechte Begleitung behalten eigene Rollen. Beibehalten. |
| Clockwork Winter | Ritornell und Episoden sind eigenständig. Im Solo stand kopiertes C# über C/Bb ohne passende Weiterführung: dort C; C# über A7 bleibt als funktionaler Leitton erhalten. |
| Two Shores | Zwei Themenperspektiven, getrennte Soli und gemeinsame Coda. Beibehalten. |
| Where the Night Ends | Wechsel von Dreier- zu Viererpuls und ausgedünnter Schluss erfüllen den Formgedanken. Beibehalten. |

Die Änderungen an vier Stücken stehen in `scripts/repertoire-themes.json`; Noten, MIDI, betroffene PDFs und Rollenmix wurden daraus neu erzeugt. Alle vollständigen Quartetts wurden vor und nach der Mischung kontinuierlich gerendert, einschließlich Pausen und Ausklang. Die [Messung](audio/REPERTOIRE_MIX.md) prüft Balance und Pegel, nicht den Geschmack.

## Theorie und Notationssoftware

- Akustik: näherungsweise Kombinationstöne im gleichstufigen System präzisiert. `2f1 − f2` ist ein Produkt dritter Ordnung: 2 + 1 = 3. Harmonische und Intermodulationsprodukte dürfen nicht verwechselt werden. Symmetrische Nichtlinearität und reale Verzerrung sind unterschiedliche Modelle.
- Intervalle: enharmonische Schreibweise und tatsächliche Tonhöhen korrigiert; übermäßige Quarte und verminderte Quinte erklingen gleich, haben andere Schreibweise und Funktion.
- Harmonik: Paralleltonart/Gegenklang, D/E, verminderte Septakkordumkehrungen und Quint-/Quartenrichtung mit den Noten abgeglichen. Modi, Dissonanzen, Modulation und Satzregeln nicht als Genreverbote formuliert.
- Rhythmus: Tempoeinheit von Unterteilung getrennt. Metrische Modulation im Beispiel 60 → 90 läuft jetzt tatsächlich schneller. Zwei Takte vorher und zwei nachher: 2 × 4 × 60/60 + 2 × 4 × 60/90 = 13⅓ Sekunden.
- Klang: Filter-, Register-, Gain- und Stimmrollen als konkrete Gestaltungsentscheidungen formuliert. Dichte Voicings, schnelle Rhythmen und rhythmische Synthbegleitung bleiben erlaubt.
- Delay: Wiederholungszahl aus der angegebenen Pegelschwelle berechnet; Schallwegdifferenz nicht mit Raumgröße gleichgesetzt; Präzedenzwirkung ohne universelle Millisekundengrenze erklärt.
- Notation: benachbarte Akkordsekunden erhalten abwechselnd versetzte Köpfe. Rhythmusslashes enthalten keine falschen Ton-/Griffhilfen. Prozentzeichen wird nur für eine genaue Taktwiederholung akzeptiert; die Wiedergabe behält vollständige Akkordtöne.
- Generator: diatonische Schreibweise statt beliebiger enharmonischer Tonbenennung. Wiederholungszahl null wird als ungültig abgewiesen.
- Übeprotokoll: Textfeld und Speicher akzeptieren dieselbe maximale Notizlänge.

Fachliche Grundlage: [UNSW zu Obertönen](https://newt.phys.unsw.edu.au/jw/harmonics.html), [Kombinationstönen und Temperierung](https://animations.physics.unsw.edu.au/jw/Tartini-tones-temperament.html), [Open Music Theory zu Molltonleitern](https://pressbooks.nebraska.edu/openmusictheory/chapter/minor-scales/), [Modi](https://viva.pressbooks.pub/openmusictheory/chapter/intro-to-diatonic-modes-and-the-chromatic-scale/) und [Kontrapunktkonventionen](https://viva.pressbooks.pub/openmusictheory/chapter/species-counterpoint/), [LilyPond zu kurzen Wiederholungen](https://lilypond.org/doc/v2.25/Documentation/notation/short-repeats.html). Stilistische Wirkung und musikalischer Wert folgen daraus nicht automatisch.
