# Tonarten, Skalen und Stile · 2026-10-20

Generatorversion 4 erweitert die Auswahl kumulativ. Die gemeinsamen Profile in `data/practice-curriculum.json` und `js/practice-curriculum.js` enthalten Vorzeichengrenzen, verfügbare Melodieskalen und Stile. Die instrumentbezogenen Rhythmus- und Technikgrenzen bleiben erhalten. Diese Staffelung ist die eigene didaktische Entscheidung der App, keine behauptete Prüfungsordnung.

| Grade | Neu verfügbare Tonarten (deutsche Namen) | Neue Melodieskalen | Neue Stile |
|---|---|---|---|
| 0 | C-Dur/a-Moll, 0 Vorzeichen | Dur, natürlich Moll | Rock, Doom |
| 1 | G-Dur/e-Moll, F-Dur/d-Moll, bis 1 Vorzeichen | Mollpentatonik | Blues |
| 2 | D-Dur/h-Moll, B-Dur/g-Moll, bis 2 Vorzeichen | Moll-Blues, Mixolydisch | Gothic, Barock |
| 3 | A-Dur/fis-Moll, Es-Dur/c-Moll, bis 3 Vorzeichen | Dorisch, harmonisch Moll, Durpentatonik | Lounge |
| 4 | E-Dur/cis-Moll, As-Dur/f-Moll, bis 4 Vorzeichen | Phrygisch, Dur-Blues | Progressive |
| 5 | Tonarten mit 5–6 Vorzeichen, einschließlich üblicher enharmonischer Schreibweisen | Lydisch | Vertiefung aller sieben Stile |

Ab Grade 1 wird bei jeder Auswahl mit gleicher Wahrscheinlichkeit die neue oder die bekannte Vorzeichengruppe gewählt; innerhalb der Gruppe erfolgt eine gleichmäßige Auswahl. Dur-/Mollcharakter und Skalen bleiben stilabhängig. Grade 0 verwendet nur C-Dur oder a-Moll und einen engen melodischen Umfang. Spätere Grade behalten die bisherigen Tonarten.

Die Vorzeichengrenze bezieht sich auf die notierte Grundtonart. Modale Abweichungen, harmonisch Moll und Blue Notes erscheinen gegebenenfalls als Versetzungszeichen im Notentext. Die kombinierte Tempoplanung berücksichtigt Vorzeichenzahl, Bewegungsdichte, schnelle Sprünge und Handunabhängigkeit. Ihre Vorzeichenachse verwendet die neuen Grade-Grenzen und bleibt bei null Vorzeichen endlich.

## Stilabhängige Skalen

- Rock: Dur/natürlich Moll, ab Grade 1 auch Mollpentatonik, ab 2 Mixolydisch, ab 3 Durpentatonik.
- Doom: natürlich Moll, ab Grade 4 zusätzlich Phrygisch.
- Gothic: natürlich Moll, ab Grade 3 auch Dorisch und harmonisch Moll.
- Barock: Dur/natürlich Moll, ab Grade 3 auch harmonisch Moll.
- Lounge: Dur, natürlich Moll, Dorisch oder Durpentatonik.
- Progressive: Dur, natürlich Moll und Dorisch, ab Grade 5 auch Lydisch; 5/8 und 7/8 bereits ab Grade 4.
- Blues: siehe eigene Staffelung unten.

Melodieskala und Harmoniegrundlage werden getrennt geführt. Pentatonische Melodien behalten eine siebentönige Dur-/Mollgrundlage für die Akkordplanung. Die Blues-Begleitung verwendet Durakkorde und später Dominantseptakkorde. Die sechstönige Blues-Skala wird nicht zum Ableiten diatonischer Dreiklänge verwendet. Arpeggioabschnitte folgen den tatsächlichen Akkordtönen.

## Blues

| Grade | Material |
|---|---|
| 1 | Gerader Puls, Mollpentatonik, I–IV–V, einfache Frage und Antwort mit Pausen |
| 2 | Moll-Blues-Skala mit kurzer ♭5–5-Auflösung |
| 3 | I7–IV7–V7, ausgeschriebene Kontraste und vorbereiteter Schluss |
| 4 | Moll- oder Dur-Blues-Skala, kleine/große Terz, gradegerechte Synkopen |
| 5 | Zusätzlich Swing/Shuffle und 12/8, Walking-/Shuffle-Bass, Navigation und ausgeschriebene Soloabschnitte |

Moll-Blues: `1–♭3–4–♭5–5–♭7`; Dur-Blues: `1–2–♭3–3–5–6`. Notennamen und Intervallbezeichnungen erhalten ihre passende Schreibweise, etwa Es als ♭5 von A. Beide Skalen und die Durpentatonik stehen unabhängig vom Grade im Griffbrett zur Verfügung.

Jeder Chorus besteht aus drei Viertaktzeilen: A verlängert I, B führt IV–IV–I–I, C führt V–IV–I–V zurück zum Anfang. Gelegentlich wechselt A im zweiten Takt kurz auf IV. Die letzte dritte Zeile O führt V–IV–V–I zum Schluss. Dadurch entstehen vollständige 12-Takt-Chorusse mit vorbereitetem Tonikaschluss, keine angehängten vier Takte. Grade 1–2 verwenden zwei Chorusse; später sind je nach Längengrenze zwei bis vier möglich. Die Darstellung schreibt 16 unterschiedliche Takte einschließlich Schlusszeile aus. Wiederkehrende Abschnitte behalten ihre Noten. Blue Notes lösen sich in kurzen Achtelbewegungen auf; reine Akkordarpeggien bleiben harmonisch.

## Auswahl und gespeicherte Stücke

Spätere Stile bleiben sichtbar und deaktiviert, mit „ab Grade …“ beziehungsweise „from Grade …“. Beim Heruntersetzen des Grades wird ein dann unzulässiger Stil durch Rock ersetzt. Neue direkte Links auf unzulässige Kombinationen werden ebenfalls auf Rock normalisiert; die Generator- und Auswahlfunktionen weisen solche Kombinationen zurück.

Gespeicherte Partituren bleiben unverändert, auch ältere Stücke aus inzwischen gesperrten Stil-/Grade-Kombinationen. Versionen 3, 4 und 5 können importiert und direkt geöffnet werden. „Neues Stück“ verwendet anschließend die aktuelle Staffelung. Die URL bestimmt neue Kompositionen innerhalb ihrer Generatorversion deterministisch; ein alter ungespeicherter Link kann wegen der geänderten Komposition andere Noten liefern.

## Motivfamilien und dezente Geschmacksakzente · Version 5

Die Referenzsammlung `Progulus.xlsx` regt eine leichte Gewichtung auf melodische Themenentwicklung, symphonische Konturen und atmosphärische Kontraste an. Die App übernimmt keine Melodien, Riffs, Aufnahmen oder artistenspezifischen Vorlagen aus der Sammlung. `js/practice-motifs.js` enthält fünf eigene Motivfamilien je Stil, insgesamt 35. Acht Skalenstufen bilden jeweils eine kurze Kontur; diese wird durch Tonart, Bandharmonik, Rhythmus und Stimmführung konkretisiert. Grade 0 begrenzt die Kontur auf die ersten drei Skalenstufen und behält den Quintumfang seiner Melodieabschnitte. Grade 1 begrenzt sie auf die ersten vier Stufen.

Ein eigener deterministischer Zufallsstrom wählt Familie und optionalen Akzent. Mit Wahrscheinlichkeit 25 % kommt ein zum Stil passender Akzent hinzu. Diese Auswahl verändert weder Tonart und Modus noch die technischen Schwerpunkte oder das Metrum. Der Akzent kann dagegen die Ausarbeitung, Dynamik und im Blues die letzte Antwort verändern. Dieselben Anfangsmotive kehren weiter erkennbar zurück. Alle Stücke verwenden die zusätzlichen Motivfamilien, auch ohne weiteren Akzent.

| Stil | Akzent |
|---|---|
| Rock | Ruhigere melodische Antwort, wiedererkennbare Zweitaktfiguren. Ab Grade 2 kann ein melodischer Bassschwerpunkt auf einzelnen A-Takten das einstimmige Gitarrenriff mitspielen; Grundton-, Quint-, Oktav- und Akkordarpeggio-Schwerpunkte behalten ihre eigenen Figuren. |
| Doom | Absteigende Antwortkontur, mehr Raum im nicht als Technikschwerpunkt benötigten B-Teil, lange harmonische Bassgrundtöne und zurückgenommene Anschlagsstärken. Ein Viertelbassschwerpunkt behält seinen Puls. |
| Gothic | Verwandte Themen über wiederkehrenden Arpeggiofiguren, gebundener wirkende Antwortphrasen und ein dynamischer Bogen zwischen tragenden und ruhigen Teilen. |
| Blues | Ab Grade 2 erscheint bei Stücken ohne Sprungnavigation im letzten Chorus B′. Die ersten zwei Takte entsprechen B; die letzten zwei entwickeln Rhythmus und Kontur weiter. Alle Chorusse bleiben zwölf Takte lang; 20 statt 16 verschiedene Takte werden notiert. |
| Barock | Kurze zweitaktige Sequenzen; ab Grade 3 kann die linke gebrochene Akkordstimme gegen die Bewegungsrichtung der Oberstimme geführt werden. |
| Lounge | Gesangliche Kontur, stärker bevorzugte gemeinsame Akkordtöne und nahe Bassgrundtöne im ruhigen Teil. Ab Grade 4 erhält ein freier B-Abschnitt gelegentlich einen über den Hauptschlag gehaltenen Offbeat-Einsatz. |
| Progressive | Rhythmisch versetzte, verwandte Motive im B-Teil. In 5/8 oder 7/8 betonen tatsächliche Anschläge die bestehenden Zweier-/Dreiergruppen; notierte Wiederkehr bleibt wörtlich. |

In allen Akzentstücken erzeugt eine kleine, wiederkehrende Anschlagskurve einen Phrasenbogen in Gitarre und Keyboard. B wird zurückgenommen. Die notierten Lerntechniken, harmonischen Schlüsse, Hand- und Bundgrenzen haben Vorrang. Neue Rhythmusfiguren betreffen freie Abschnitte außerhalb des jeweiligen Technikschwerpunkts; Synkopen und Gruppenakzente bleiben in den dafür freigegebenen Grades. Die bisherige Instrumentierung, Tonartenstaffelung und Stilfreischaltung gelten weiter.

Neue Partituren speichern `motifFamily` und `musicalAccent` mit Generatorversion 5 im vollständigen Bookmark. Frühere gespeicherte Partituren benötigen diese Angaben nicht. Das Review-Skript gibt beide Merkmale im JSON-Bericht aus. Die Oberfläche verwendet weiterhin die tatsächliche musikalische Beschreibung und die üblichen Abschnittsnamen.

## Prüfung

`tests/practice-progression.test.cjs` prüft Freischaltungen, vollständige Blueschorusse, Dur-/Dominantseptbegleitung, tatsächliche Blue-Note-Auflösung, Skalenbeschriftung, MIDI und die Übernahme gespeicherter Partituren. Die vorhandenen Kompositions-, Technik-, Auswahl- und Beschreibungsprüfungen verwenden die gültigen Stil-/Grade-Kombinationen. Browserprüfungen umfassen alle 240 gültigen Kombinationen von Stil, Grade, Instrument und Sprache sowie Herunterstufen, direkte Links, alte Bookmarks und Blues-PDFs.

`tests/practice-motifs.test.cjs` prüft zusätzlich die Familienvielfalt, die Auswahlhäufigkeit, Änderungen an den klingenden Noten bei sonst gleichen Einstellungen, die tatsächlichen Rock-/Doom-/Barock-/Blues-Merkmale und die Bookmark-Kompatibilität. `npm run test:practice-browser` prüft die Praxis einschließlich aller sieben Akzente, mobiler Darstellung, B′-Auswahl und 14 zusätzlichen einseitigen PDFs in beiden Sprachen.
