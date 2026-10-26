# Tonarten, Skalen und Stile · 2026-10-20

Seit Generatorversion 4 erweitert der Generator die Auswahl kumulativ. Die gemeinsamen Profile in `data/practice-curriculum.json` und `js/practice-curriculum.js` enthalten Vorzeichengrenzen, verfügbare Melodieskalen und Stile. Die instrumentbezogenen Rhythmus- und Technikgrenzen bleiben erhalten. Diese Staffelung ist die eigene didaktische Entscheidung der App, keine behauptete Prüfungsordnung.

| Stufe | Neu verfügbare Tonarten (deutsche Namen) | Neue Melodieskalen | Neue Stile |
|---|---|---|---|
| 0 | C-Dur/a-Moll, 0 Vorzeichen | Dur, natürlich Moll | Rock, Doom |
| 1 | G-Dur/e-Moll, F-Dur/d-Moll, bis 1 Vorzeichen | Mollpentatonik | Blues |
| 2 | D-Dur/h-Moll, B-Dur/g-Moll, bis 2 Vorzeichen | Moll-Blues, Mixolydisch | Gothic, Barock |
| 3 | A-Dur/fis-Moll, Es-Dur/c-Moll, bis 3 Vorzeichen | Dorisch, harmonisch Moll, Durpentatonik | Lounge |
| 4 | E-Dur/cis-Moll, As-Dur/f-Moll, bis 4 Vorzeichen | Phrygisch, Dur-Blues | Progressive |
| 5 | Tonarten mit 5–6 Vorzeichen, einschließlich üblicher enharmonischer Schreibweisen | Lydisch | Vertiefung aller sieben Stile |

Ab Stufe 1 wird bei jeder Auswahl mit gleicher Wahrscheinlichkeit die neue oder die bekannte Vorzeichengruppe gewählt; innerhalb der Gruppe erfolgt eine gleichmäßige Auswahl. Dur-/Mollcharakter und Skalen bleiben stilabhängig. Stufe 0 verwendet nur C-Dur oder a-Moll und einen engen melodischen Umfang. Spätere Stufen behalten die bisherigen Tonarten.

Die Vorzeichengrenze bezieht sich auf die notierte Grundtonart. Modale Abweichungen, harmonisch Moll und Blue Notes erscheinen gegebenenfalls als Versetzungszeichen im Notentext. Die kombinierte Tempoplanung berücksichtigt Vorzeichenzahl, Bewegungsdichte, schnelle Sprünge und Handunabhängigkeit. Ihre Vorzeichenachse verwendet die neuen Stufengrenzen und bleibt bei null Vorzeichen endlich.

## Stilabhängige Skalen

- Rock: Dur/natürlich Moll, ab Stufe 1 auch Mollpentatonik, ab 2 Mixolydisch, ab 3 Durpentatonik.
- Doom: natürlich Moll, ab Stufe 4 zusätzlich Phrygisch.
- Gothic: natürlich Moll, ab Stufe 3 auch Dorisch und harmonisch Moll.
- Barock: Dur/natürlich Moll, ab Stufe 3 auch harmonisch Moll.
- Lounge: Dur, natürlich Moll, Dorisch oder Durpentatonik.
- Progressive: Dur, natürlich Moll und Dorisch, ab Stufe 5 auch Lydisch; 5/8 und 7/8 bereits ab Stufe 4.
- Blues: siehe eigene Staffelung unten.

Melodieskala und Harmoniegrundlage werden getrennt geführt. Pentatonische Melodien behalten eine siebentönige Dur-/Mollgrundlage für die Akkordplanung. Die Blues-Begleitung verwendet Durakkorde und später Dominantseptakkorde. Die sechstönige Blues-Skala wird nicht zum Ableiten diatonischer Dreiklänge verwendet. Arpeggioabschnitte folgen den tatsächlichen Akkordtönen.

## Blues

| Stufe | Material |
|---|---|
| 1 | Gerader Puls, Mollpentatonik, I–IV–V, einfache Frage und Antwort mit Pausen |
| 2 | Moll-Blues-Skala mit kurzer ♭5–5-Auflösung |
| 3 | I7–IV7–V7, ausgeschriebene Kontraste und vorbereiteter Schluss |
| 4 | Moll- oder Dur-Blues-Skala, kleine/große Terz, stufengerechte Synkopen |
| 5 | Zusätzlich Swing/Shuffle und 12/8, Walking-/Shuffle-Bass, Navigation und ausgeschriebene Soloabschnitte |

Moll-Blues: `1–♭3–4–♭5–5–♭7`; Dur-Blues: `1–2–♭3–3–5–6`. Notennamen und Intervallbezeichnungen erhalten ihre passende Schreibweise, etwa Es als ♭5 von A. Beide Skalen und die Durpentatonik stehen unabhängig von der Stufe im Griffbrett zur Verfügung.

Jeder Chorus besteht aus drei Viertaktzeilen: A verlängert I, B führt IV–IV–I–I, C führt V–IV–I–V zurück zum Anfang. Gelegentlich wechselt A im zweiten Takt kurz auf IV. Die letzte dritte Zeile O führt V–IV–V–I zum Schluss. Dadurch entstehen vollständige 12-Takt-Chorusse mit vorbereitetem Tonikaschluss, keine angehängten vier Takte. Die Choruszahl folgt seit Version 6 der Zielspieldauer der Stufe und dem spielbaren Stiltempo. Es bleiben mindestens zwei vollständige Chorusse. Die Darstellung schreibt 16 unterschiedliche Takte einschließlich Schlusszeile aus. Wiederkehrende Abschnitte behalten ihre Noten. Blue Notes lösen sich in kurzen Achtelbewegungen auf; reine Akkordarpeggien bleiben harmonisch.

## Auswahl und gespeicherte Stücke

Spätere Stile bleiben sichtbar und deaktiviert, mit „ab Stufe …“ beziehungsweise „from Level …“. Beim Heruntersetzen der Stufe wird ein dann unzulässiger Stil durch Rock ersetzt. Neue direkte Links auf unzulässige Kombinationen werden ebenfalls auf Rock normalisiert; die Generator- und Auswahlfunktionen weisen solche Kombinationen zurück.

Gespeicherte Partituren bleiben unverändert, auch ältere Stücke aus inzwischen gesperrten Stil-/Stufe-Kombinationen. Versionen 3, 4, 5 und 6 können importiert und direkt geöffnet werden. „Neues Stück“ verwendet anschließend die aktuelle Staffelung. Die URL bestimmt neue Kompositionen innerhalb ihrer Generatorversion deterministisch; ein alter ungespeicherter Link kann wegen der geänderten Komposition andere Noten liefern.

## Motivfamilien und dezente Geschmacksakzente · Version 5

Die Referenzsammlung `Progulus.xlsx` regt eine leichte Gewichtung auf melodische Themenentwicklung, symphonische Konturen und atmosphärische Kontraste an. Die App übernimmt keine Melodien, Riffs, Aufnahmen oder artistenspezifischen Vorlagen aus der Sammlung. `js/practice-motifs.js` enthält fünf eigene Motivfamilien je Stil, insgesamt 35. Acht Skalenstufen bilden jeweils eine kurze Kontur; diese wird durch Tonart, Bandharmonik, Rhythmus und Stimmführung konkretisiert. Stufe 0 begrenzt die Kontur auf die ersten drei Skalenstufen und behält den Quintumfang seiner Melodieabschnitte. Stufe 1 begrenzt sie auf die ersten vier Stufen.

Ein eigener deterministischer Zufallsstrom wählt Familie und optionalen Akzent. Mit Wahrscheinlichkeit 25 % kommt ein zum Stil passender Akzent hinzu. Diese Auswahl verändert weder Tonart und Modus noch die technischen Schwerpunkte oder das Metrum. Der Akzent kann dagegen die Ausarbeitung, Dynamik und im Blues die letzte Antwort verändern. Dieselben Anfangsmotive kehren weiter erkennbar zurück. Alle Stücke verwenden die zusätzlichen Motivfamilien, auch ohne weiteren Akzent.

| Stil | Akzent |
|---|---|
| Rock | Ruhigere melodische Antwort, wiedererkennbare Zweitaktfiguren. Ab Stufe 2 kann ein melodischer Bassschwerpunkt auf einzelnen A-Takten das einstimmige Gitarrenriff mitspielen; Grundton-, Quint-, Oktav- und Akkordarpeggio-Schwerpunkte behalten ihre eigenen Figuren. |
| Doom | Absteigende Antwortkontur, mehr Raum im nicht als Technikschwerpunkt benötigten B-Teil, lange harmonische Bassgrundtöne und zurückgenommene Anschlagsstärken. Ein Viertelbassschwerpunkt behält seinen Puls. |
| Gothic | Verwandte Themen über wiederkehrenden Arpeggiofiguren, gebundener wirkende Antwortphrasen und ein dynamischer Bogen zwischen tragenden und ruhigen Teilen. |
| Blues | Ab Stufe 2 erscheint bei Stücken ohne Sprungnavigation im letzten Chorus B′. Die ersten zwei Takte entsprechen B; die letzten zwei entwickeln Rhythmus und Kontur weiter. Alle Chorusse bleiben zwölf Takte lang; 20 statt 16 verschiedene Takte werden notiert. |
| Barock | Kurze zweitaktige Sequenzen; ab Stufe 3 kann die linke gebrochene Akkordstimme gegen die Bewegungsrichtung der Oberstimme geführt werden. |
| Lounge | Gesangliche Kontur, stärker bevorzugte gemeinsame Akkordtöne und nahe Bassgrundtöne im ruhigen Teil. Ab Stufe 4 erhält ein freier B-Abschnitt gelegentlich einen über den Hauptschlag gehaltenen Offbeat-Einsatz. |
| Progressive | Rhythmisch versetzte, verwandte Motive im B-Teil. In 5/8 oder 7/8 betonen tatsächliche Anschläge die bestehenden Zweier-/Dreiergruppen; notierte Wiederkehr bleibt wörtlich. |

In allen Akzentstücken erzeugt eine kleine, wiederkehrende Anschlagskurve einen Phrasenbogen in Gitarre und Keyboard. B wird zurückgenommen. Die notierten Lerntechniken, harmonischen Schlüsse, Hand- und Bundgrenzen haben Vorrang. Neue Rhythmusfiguren betreffen freie Abschnitte außerhalb des jeweiligen Technikschwerpunkts; Synkopen und Gruppenakzente bleiben in den dafür freigegebenen Stufen. Die bisherige Instrumentierung, Tonartenstaffelung und Stilfreischaltung gelten weiter.

Seit Generatorversion 5 speichern Partituren `motifFamily` und `musicalAccent` im vollständigen Bookmark. Frühere gespeicherte Partituren benötigen diese Angaben nicht. Das Review-Skript gibt beide Merkmale im JSON-Bericht aus. Die Oberfläche verwendet weiterhin die tatsächliche musikalische Beschreibung und die üblichen Abschnittsnamen.

## Spieldauer, Tempo und Ausarbeitung · Version 6

| Stufe | Zielspieldauer | Zeitfenster (±10 %, gerundet) |
|---|---|---|
| 0 | 0:45 | 0:41–0:50 |
| 1 | 1:05 | 0:59–1:12 |
| 2 | 1:30 | 1:21–1:39 |
| 3 | 2:00 | 1:48–2:12 |
| 4 | 2:35 | 2:20–2:51 |
| 5 | 3:15 | 2:56–3:35 |

Die Dauer wird in Sekunden aus allen gespielten Abschnitten berechnet: Summe der Viertelschläge × 60 / Vierteltempo. Wiederkehr, Navigation und vollständige Blueschorusse zählen mit; Einzählen und die zusätzliche Player-Schleife gehören nicht zur Zielzeit. Die Taktzahl ergibt sich daraus. Ein langsames Doom-Stück enthält deshalb für denselben Stufe weniger Takte als ein schnelleres Rock-Stück. 12/8, 5/8 und 7/8 verwenden ihre wirklichen Taktlängen. Der Player zeigt Minuten/Sekunden an und berechnet sie bei geändertem Tempo neu.

`js/practice-design.js` definiert die stilabhängigen Tempobereiche des Generators. Die Grundbereiche für gerade 4/4-Stücke sind Viertel/min:

| Stil | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Rock | 72–92 | 76–100 | 80–108 | 84–116 | 84–128 | 80–132 |
| Doom | 50–66 | 52–70 | 54–74 | 54–78 | 54–82 | 52–86 |
| Blues | — | 72–96 | 64–104 | 72–112 | 68–120 | 66–126 |
| Gothic | — | — | 68–96 | 70–104 | 68–112 | 66–120 |
| Barock | — | — | 76–104 | 76–112 | 72–120 | 72–128 |
| Lounge | — | — | — | 66–94 | 64–102 | 62–110 |
| Progressive | — | — | — | — | 74–116 | 72–126 |

12/8 verschiebt den Viertelbereich um Faktor 1,25; der angezeigte punktierte Viertelpuls beträgt weiterhin Vierteltempo / 1,5. Ungerade Achteltakte verwenden Faktor 0,8, Swing reduziert das obere Tempo um 6 %. Anschließend begrenzen tatsächliche kurze Anschlagsabstände, Versetzungszeichen im Notentext, Dichte, schnelle Sprünge und Handunabhängigkeit das Tempo. Die kürzeste Attackenfolge zählt auch bei einem kurzen Fill oder einer kurzen Figur in einem sonst ruhigen Abschnitt. Erst mit diesem spielbaren Bereich werden Form und Tempo auf die Dauer abgestimmt. Lange Abschnitte werden nötigenfalls schon vor der Komposition auf vier Takte verkürzt, gemeinsam mit ihrer Variante. Die vollständige Form bleibt lesbar; höchstens 24 verschiedene Takte werden notiert.

Swing und 12/8 bleiben Stufe 5 vorbehalten. Innerhalb dieser Freigabe erhält Blues 60 % Swing und 15 % 12/8, Lounge 45 % und 15 %, Rock 18 % und 15 %. Doom, Gothic und Progressive bevorzugen gegenüber diesen Stilen häufiger 12/8; Barock bleibt zu 70 % gerade. Seltenere Grooves bleiben für die zugehörigen Technikschwerpunkte erreichbar.

Fills treten an ausgewählten Formgrenzen auf und erhalten davor einen Groove-Anfang. Stufen 0–2 verwenden höchstens eine Viertel-Filldauer; Doom, Lounge und Barock behalten kurze Fills auch später. Andere höhere Stufen können zwei Viertel nutzen, 12/8 drei Achtel. Die dichte Unterteilung ist an Stufe und tatsächlichen Fill-Schwerpunkt gebunden. Die technischen Anschläge bleiben hörbar vorhanden.

Abschnitte bestimmen eine führende Stimme; deren Anschlagsstärke liegt über der Begleitung. Freie Begleitmelodien werden ruhiger, linke Keyboardbegleitung unter einer führenden Gitarre kann liegenbleiben. Schwerpunktabschnitte und barocke Gegenbewegung behalten ihre Funktion. Vier- und achttaktige Linien planen Vorstellung, Fortführung, späteren Höhepunkt und Schluss. Nach einem größeren Sprung wird bei passendem Tonmaterial eine kurze Gegenbewegung bevorzugt. Stufe 0 verwendet keine geliehene ♭VII-Harmonie in C-Dur.

„Neues Stück“ gleicht zuerst technische Schwerpunkte aus und berücksichtigt danach Tonart, Motivfamilie und die tatsächlich verwendete rhythmische Grundfigur. `a-minor-practice-diversity` speichert dazu kleine Auswahlzähler und die letzten vier Merkmalskombinationen je Instrument/Stufe/Stil. Es speichert keine Leistung oder Zeitstempel. Die Suche komponiert keine Kandidaten. Direktlinks, Neuladen und Bookmarks verändern diese Auswahlhistorie nicht. Version 6 speichert zusätzlich `rhythmicFigure`, `durationSeconds`, `targetDurationSeconds` und die Abschnittsführung im vollständigen Bookmark.

Lokale Bookmark-Snapshots verzichten auf JSON-Einrückung, damit die längeren vollständigen Partituren das Browserkontingent langsamer füllen. JSON-Exporte bleiben formatiert und enthalten alle Noten; CSV ergänzt tatsächliche Dauer und Zielzeit.

Rhythmus-Slashes werden pro Takt gerendert: gemischte Zeilen behalten ihre Slashes und ihre normalen Tonhöhen. Prozentwiederholungen bleiben echte Wiederholungen des vorherigen Takts.

## Prüfung

`tests/practice-progression.test.cjs` prüft Freischaltungen, vollständige Blueschorusse, Dur-/Dominantseptbegleitung, tatsächliche Blue-Note-Auflösung, Skalenbeschriftung, MIDI und die Übernahme gespeicherter Partituren. Die vorhandenen Kompositions-, Technik-, Auswahl- und Beschreibungsprüfungen verwenden die gültigen Stil-/Stufe-Kombinationen. Browserprüfungen umfassen alle 240 gültigen Kombinationen von Stil, Stufe, Instrument und Sprache sowie Herunterstufen, direkte Links, alte Bookmarks und Blues-PDFs.

`tests/practice-motifs.test.cjs` prüft zusätzlich die Familienvielfalt, die Auswahlhäufigkeit, Änderungen an den klingenden Noten bei sonst gleichen Einstellungen, die tatsächlichen Rock-/Doom-/Barock-/Blues-Merkmale und die Bookmark-Kompatibilität. `npm run test:practice-browser` prüft die Praxis einschließlich aller sieben Akzente, mobiler Darstellung, B′-Auswahl und 14 zusätzlichen einseitigen PDFs in beiden Sprachen.

`tests/practice-design.test.cjs` vergleicht die Spieldauer mit der MIDI-Zeit und prüft Stufenabstände, Stiltempi, tatsächliche Versetzungszeichen, kurze Anschlagsfolgen, Filllängen und gemischte Slash-Zeilen. Die zusätzliche Browserprüfung kontrolliert Slashes, normale Notenköpfe und Prozentwiederholung gemeinsam, das einseitige PDF sowie die Daueranzeige nach einer Tempoänderung.
