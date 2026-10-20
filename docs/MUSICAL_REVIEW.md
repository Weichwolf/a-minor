# Praxisgenerator: Fallprüfung · 2026-10-13

Die aktuelle Prüfung betrifft den Generator für vier Instrumente. Der ältere Bericht darunter dokumentiert den archivierten Kurs und das frühere Repertoire; er ist kein Nachweis für den neuen Generator.

`node scripts/review-practice.cjs` erzeugt seit Generatorversion 4 reproduzierbar 30 Stücke (alle freigegebenen Stil-/Grade-Kombinationen) mit allen vier Parts und schreibt die Befunde nach `test-results/practice-review.json`. Seeds, Tonart, Tempo, Harmonik, Form, tatsächliche Notenwerte, vollständige Stimmen der unterschiedlichen Abschnitte, Stückbeschreibungen und Bewegungskennzahlen stehen im Bericht. Die Kennzahlen sind Suchhilfen für die Partiturbeurteilung: Ein großer Tonhöhensprung kann auf benachbarten Saiten leicht sein, eine kleine Tonbewegung einen Lagenwechsel verlangen. Gemittelte Akkordhöhen sind keine realen Melodietöne. Bundmittelwerte ignorieren die Entlastung durch offene Saiten und Pausen. Der Bericht behauptet deshalb keine automatische Musikalitäts- oder Schwierigkeitsbewertung.

Die folgenden konkreten Seeds und Befunde dokumentieren den Prüfstand vom 13.10.2026 vor der kumulativen Staffelung. Die [aktuelle Staffelung](PRACTICE_PROGRESSION.md) hat eine neue Generatorversion; dieselben Seeds können deshalb andere Stücke ergeben.

## Befunde und Korrekturen

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

## Beurteilung der 36 vollständigen Fälle

Die Tabelle beurteilt die ausgeschriebenen Phrasen, ihre Harmonik und die Übergänge in der angegebenen Spielreihenfolge. Alle vier Parts jedes Falls wurden einbezogen. Die [versionierten Befunde](practice-review.json) enthalten sämtliche Takte der unterschiedlichen Abschnitte, die vollständige Form, Beschreibungen und Bewegungskennzahlen. Reproduktion: `node scripts/review-practice.cjs docs/practice-review.json`. Die Seeds sind dezimal angegeben; dieselben Seeds lassen sich in Praxis als Hex-Kennung öffnen. Tempoangaben unten sind Viertel/min, auch bei ungeraden Metren.

**Maßstab:** Wiederholung soll Orientierung geben, Kontrast einen musikalischen Grund haben und die Rückkehr vorbereitet sein. Neue Techniken müssen tatsächlich in den Noten stehen. Die Instrumentbeurteilung berücksichtigt Rhythmus, Lage, verfügbare Zeit und die Funktion des Parts; ein einzelner Sprungwert entscheidet nicht über Spielbarkeit. A′/B′ behalten den gemeinsamen Anfang und verändern die letzten zwei Takte. O bezeichnet den notierten Schlussteil, S den ausgeschriebenen Soloabschnitt. Der letzte einzigartige Abschnitt im Datenbericht ist bei ABA nicht der zuletzt gespielte Abschnitt: Maßgeblich ist immer die vollständige Form.

### Grade 0

| Stil · Seed · Tempo/Form | Musikalische und spieltechnische Beurteilung |
|---|---|
| Rock · 20261013 · 85 / ABAB | D-Dur: A färbt die Tonika mit C, B führt über A nach D. **Gitarre:** drei Viertel-Powerchords und eine Pause bilden eine erkennbare Zelle. **Keyboard:** rechte Melodie D4–Fis4, links Pause; geringe Lese- und Bewegungsdichte. **Bass:** Grundtonwechsel D/C/A mit kurzer Achtelöffnung. **Drums:** stabiler Viertelpuls. Die gleiche Zelle gewinnt durch die verschiedene Schlussvorbereitung Bedeutung. |
| Doom · 20261014 · 97 / ABA | Cm–As–B–Cm trägt beide Teile; unterschiedliche Dichte unterscheidet Riff und Melodie. **Gitarre:** Viertelfigur C–Es–D–C, B beruhigt die Linie. **Keyboard:** B enthält lange Werte und Pausen. **Bass:** vier Grundtonviertel verankern die Wechsel. **Drums:** einfacher Viertelpuls mit leichterem B. Transponierte Riffs reichen weiter als der eng begrenzte Melodieabschnitt; kein Versprechen eines einzigen Fünftonraums für das gesamte Stück. |
| Gothic · 20261015 · 96 / ABAB | Fis-Moll: riffgeprägtes A, B mit plagalem Hm–Fis-Moll-Schluss. **Gitarre:** Wechsel von Einzelnoten zu tiefen Quinten; die korrigierte Lage vermeidet den entfernten Cis-Powerchord. **Keyboard:** Pausen gliedern B. **Bass:** Grundtonviertel, größere Tonabstände über benachbarte Saiten. **Drums:** unveränderter Puls. Der Registerkontrast ist beabsichtigt und rhythmisch entlastet. |
| Progressive · 20261016 · 104 / ABAB | A-Dur mit geliehenem G, unterschiedliche D-/E-Vorbereitung der Rückkehr. **Gitarre:** kleine wiederkehrende Viertelkontur. **Keyboard:** ruhende rechte Dreiklänge wechseln zur Linie, links bleibt frei. **Bass:** Achtelgrundtöne in A, Viertel in B. **Drums:** Achtelfill markiert das Ende. Der Stilkontrast entsteht harmonisch, noch ohne ungerade Takte. |
| Barock · 20261017 · 103 / ABA | D–Em–A–D gibt eine eindeutige Kadenz. **Gitarre:** Melodie mit längerem Antwortton, dann gleichmäßigeres Riff. **Keyboard:** Einzelnoten wechseln zu rechten Dreiklängen. **Bass:** Achtelgrundtöne versus Viertelbegleitung. **Drums:** einfacher Viertelpuls. Als moderne Bandübertragung plausibel; kein historischer Barocksatz und keine unabhängige kontrapunktische Schulung. |
| Lounge · 20261018 · 88 / ABAB | G-Dorisch mit Am und Dm: der helle Mollbereich bleibt bei einfacher Rhythmik erkennbar. **Gitarre:** G–A–B-Motiv, dann rhythmisch dichtere Wiederaufnahme. **Keyboard:** Linie versus gehaltene/repetierte Dreiklänge. **Bass:** ruhige Grundtonwechsel. **Drums:** paarige Bassdrum-Achtel unter Viertelbecken. Noch kein Swing als zusätzliche Anfängerhürde. |

### Grade 1

| Stil · Seed · Tempo/Form | Musikalische und spieltechnische Beurteilung |
|---|---|
| Rock · 20261114 · 103 / ABAB | A–D–A verbindet Power-Riff und Melodie. **Gitarre:** regelmäßige Powerchord-Achtel, B mit längeren Einzelnoten. **Keyboard:** bewegte rechte Hand über gehaltenen linken Dreiklängen. **Bass:** Achtelgrundtöne, in B weniger dicht. **Drums:** Viertelbecken mit lokalen Fills. Die zusätzliche Handkoordination erhält eine stabile harmonische Basis. |
| Doom · 20261115 · 114 / ABAB′ | Cm–As–B mit verändertem Schluss der Rückkehr. **Gitarre:** Achtelriff versus Viertelmelodie. **Keyboard:** linke Dreiklänge und deutlich höherer B-Registerbereich; der Oktavwechsel ist eine bewusste zusätzliche Leseanforderung. **Bass:** tiefe Achtel mit ruhigerem B. **Drums:** konstantes Grundgerüst. B′ bleibt durch den gleichen Anfang wiedererkennbar. |
| Gothic · 20261116 · 108 / ABAB′ | Am/F/G und die veränderte Em-Rückleitung unterscheiden die Wiederkehr. **Gitarre:** einzeln angeschlagene Akkordtöne in A, melodisches Riff in B. **Keyboard:** wechselnde Hände entlasten die Gleichzeitigkeit. **Bass:** wechselnde Grundtonwerte. **Drums:** kurze Sechzehntelfills. Diese schnellen Drumwerte werden nicht auf Gitarre oder Keyboard übertragen. |
| Progressive · 20261117 · 112 / ABAB | Am–Dm und zunächst offenes Em führen zur geschlossenen B-Antwort. **Gitarre:** Achtel-Powerchords versus Melodie; 13,5 Halbtöne Abstand der Anschlagsmittelwerte sind hier ein Textur-/Saitenwechsel, bei höchstens zwei Bünden Änderung des Bundmittels. **Keyboard:** linke gehaltene Dreiklänge. **Bass:** Achtel auf einfachen Grundtönen. **Drums:** Tomfill als Formsignal. |
| Barock · 20261118 · 100 / AABB | D–Em–A–D bleibt unter Thema und gebrochener Figur erhalten. **Gitarre:** Viertel/Halbe wechseln zu Achtelarpeggien. **Keyboard:** Handdialog; vor dem gemessenen 19-Halbton-Registerwechsel hat die rechte Hand einen ganzen linken Antworttakt frei. **Bass:** lange Grundtonwerte. **Drums:** Viertelbecken und begrenzte schnelle Schlussfigur. Die Zeit zum Umsetzen ist wichtiger als die reine Sprungzahl. |
| Lounge · 20261119 · 114 / ABAB′ | Fis-Dorisch: Fism–Gism–Cism. **Gitarre:** melodischer Anfang, danach klarer Dreiklang als Einzeltonfigur. **Keyboard:** rechte Figuren über linken Dreiklängen. **Bass:** Durchgänge zielen zum nächsten Grundton; ein bereits passender Ganztonabstand braucht keinen zusätzlichen Fremdton. **Drums:** Viertelpuls. B′ entwickelt das Ende ohne neue Anfangsfigur. |

### Grade 2

| Stil · Seed · Tempo/Form | Musikalische und spieltechnische Beurteilung |
|---|---|
| Rock · 20261215 · 108 / ABACABO | Es-Dur: Tonika, melodische Subdominantöffnung und Cm/Fm-Bridge führen über B nach Es. **Gitarre:** Riff, Melodie und Dreiklang-Arpeggio erfüllen verschiedene Rollen. **Keyboard:** Handdialog und akkordischer C-Teil. **Bass:** Skalenbewegung mit harmonischen Stütztönen. **Drums:** echte zusätzliche Kick-Zwischenzählzeit. Die längere Form bietet neue Inhalte statt nur identischer Wiederholungen. |
| Doom · 20261216 · 93 / ABCAO | G-Moll mit Es/Cm und A°; F–Gm ergibt einen modalen Schluss. **Gitarre:** Riff und durch Pausen entlastete Melodie. **Keyboard:** Akkorde mit Bass, längere B-Antwort. **Bass:** Grundton/Quinte, bei vermindertem Klang angepasste Quinte; der Abschnittswechsel umfasst bis 14 Halbtöne und bleibt ein bewusst zu lesender Saitenwechsel. **Drums:** versetzter Kick bei stabilem Achtelbecken. |
| Gothic · 20261217 · 104 / ABABO | Em–C–D/Bm führt über Bm zurück. **Gitarre:** Arpeggio gegen Powerchordfläche. **Keyboard:** vollständige Akkorde mit Bass erhalten die Terzen. **Bass:** Oktavpendel; vor einem sonst zu weiten folgenden Grundton kehrt die Figur tiefer zurück. **Drums:** Achtelbecken, ruhigeres B. Registerbewegung ist der Bassinhalt, kein Zufallsprodukt der Gitarrenstimme. |
| Progressive · 20261218 · 127 / ABA′O | Dm–Gm–B–Am bleibt offen, O schließt nach Dm. **Gitarre:** Achtelarpeggien, Melodie und verändertes Ende von A′. **Keyboard:** rhythmisch gemeinsame Akkord-/Bassanschläge. **Bass:** Quintpendel mit tieferer Anschlussquinte. **Drums:** Achtelpuls. Das obere Tempo und die Registerwechsel machen dies zum anspruchsvolleren Fall der Stufe; Wiederholung und längere Melodiewerte schaffen Entlastung. |
| Barock · 20261219 · 109 / ABAO | Em/Bm, dann Am–Fis°–Bm und Rückkehr. **Gitarre:** Thema versus einzeln gespielte Akkordtöne. **Keyboard:** Handdialog mit Zeit für den Registerwechsel. **Bass:** Grundton/Quinte in A, ruhigerer B-Puls. **Drums:** regelmäßige Achtelbecken. Der verminderte Akkord wird nicht als unpassender reiner Gitarren-Powerchord angeschlagen. |
| Lounge · 20261220 · 97 / ABAO | Es-Dur mit Fm/B und klarem Dominantschluss. **Gitarre:** schrittweise Melodie und Riff, größte Bewegung fünf Halbtöne. **Keyboard:** Melodie versus Akkorde mit Bass. **Bass:** Grundton/Quinte, maximal sieben Halbtöne Bewegung. **Drums:** akzentuiertes Fill. Dieser ruhigere Fall bietet dieselbe Grade-Struktur mit geringerer Bewegungsbelastung. |

### Grade 3

| Stil · Seed · Tempo/Form | Musikalische und spieltechnische Beurteilung |
|---|---|
| Rock · 20261316 · 94 / ABAABAABAO | A-Moll mit Dm/Em und plagalem Dm–Am-Schluss. **Gitarre:** wiederkehrende Riffkontur gegen lange melodische Antwort. **Keyboard:** Akkordwechsel und gehaltene linke Unterstützung unter B. **Bass:** gerichtete Skalenfiguren, B vereinfacht. **Drums:** hörbar und sichtbar akzentuierte Sechzehntelfills. Die wiederholte Form stabilisiert den Umgang mit mehreren harmonischen Wechseln. |
| Doom · 20261317 · 94 / AABAAABAO | H-Phrygisch, C–Hm als charakteristische Schlusswendung. **Gitarre:** Arpeggio enthält die Mollterz tatsächlich; Kontrastmelodie. **Keyboard:** ruhende Akkorde versus Linie. **Bass:** C als modale kleine Sekunde innerhalb der Skalenbewegung. **Drums:** Akzentfills. Die kleine Sekunde hat eine tonale Funktion und ist kein beliebiger chromatischer Fehler. |
| Gothic · 20261318 · 98 / ABACBABACBO | Gis-Dorisch mit Cis-Dur und Eis°. **Gitarre:** Akkordfiguren und melodischer B-Teil; über Eis° einstimmig. **Keyboard:** Arpeggio, Melodie und volle Akkorde als Kontrast. **Bass:** auf- und absteigende Arpeggien, nun einschließlich korrekter verminderter Quinte; größter Sprung zehn statt zuvor 22 Halbtöne. **Drums:** Tomfills markieren die Rückkehr. |
| Progressive · 20261319 · 90 / ABA′ABA′ABA′O | E-Dur mit Dis° als Spannung und H–E-Schluss. **Gitarre:** gebrochene Akkorde versus höherer melodischer B-Teil. **Keyboard:** Melodie über eigener Begleitung, Registerwechsel im Formkontrast. **Bass:** Skalen mit Akkordstützen. **Drums:** Akzent-Sechzehntel. Das niedrige Tempo entlastet die Kombination aus vier Vorzeichen und den Registerwechseln. |
| Barock · 20261320 · 88 / AABBAABBO | Gis harmonisch Moll, Cis-Moll und Dis-Dur geben Leittonspannung. **Gitarre:** Thema und anschließende Arpeggioepisode. **Keyboard:** Melodie über gebrochener linker Begleitung. **Bass:** die abwärts geführte zweite Arpeggiohälfte reduziert den größten Sprung von 19 auf sieben Halbtöne. **Drums:** Tomfill. Harmonische Lesearbeit bleibt, unnötige Bassakrobatik entfällt. |
| Lounge · 20261321 · 95 / AABAO | Achtaktige A/B-Abschnitte: offenes Em7 in der Mitte, E7–Am7 am Ende. **Gitarre:** enger Fünftonraum mit überwiegend Schritten. **Keyboard:** Melodie über Septakkordbegleitung. **Bass:** ausdrücklich höheres B-Register, bis 17 Halbtöne am Übergang; bei sonst einfachen Wiederholungen ein isolierter Grade-Schwerpunkt. **Drums:** Akzentfills. Die Form bekommt Richtung durch verschiedene Schlussstärken. |

### Grade 4

| Stil · Seed · Tempo/Form | Musikalische und spieltechnische Beurteilung |
|---|---|
| Rock · 20261417 · 131 / ABAABAABAO | Fis-Dur mit H/Cis und deutlicher Dominantrückkehr. **Gitarre:** Achtelpause und punktierte Viertel erzeugen die angekündigte Synkope. **Keyboard:** versetzte Handbewegungen. **Bass:** chromatische Annäherungen zum nächsten Grundton. **Drums:** punktierter Groove. Sechs Vorzeichen und hohes Tempo ergeben einen fordernden Stufenfall; wiederkehrende Konturen begrenzen die neue Information. |
| Doom · 20261418 · 102 / ABCAO | Achtaktige Mollflächen, Es7 als modale Farbe, C7 als zusätzliche Schlussvorbereitung. **Gitarre:** Riff/Melodie und einzeln gespielte Akkordfigur mit kurzen Werten. **Keyboard:** echte Septakkordlagen. **Bass:** präzise Pausen. **Drums:** Sechzehntelfills. Der hohe Bundmittel-Sprung ist ein Prüfhinweis einschließlich offener Saiten, keine Behauptung eines erzwungenen Zwölfbund-Handsprungs. |
| Gothic · 20261419 · 124 / ABABO | Achtaktige Gis-Moll-Phrasen unterscheiden den offenen Dis-Moll-Mittelpunkt von späterem Dis-Dur. **Gitarre:** gebundene Powerchordfiguren mit kleinen Arpeggio-Ausnahmen, kein erzwungener Melodiewechsel. **Keyboard:** unabhängige Hände unter wiederkehrendem Motiv. **Bass:** klar bemessene Lücken. **Drums:** Sechzehntelfills. Der zusammenhängende Gitarrenschwerpunkt ist die erlaubte Ausnahme zur meist wechselnden Spielweise. |
| Progressive · 20261420 · 104 / ABA′ABA′O | C-Lydisch mit Hm/Fis°; vier Takte A und acht Takte B. **Gitarre:** Sechzehntel in gebrochenen Dreiklängen, längere B-Melodie. **Keyboard:** tatsächlich notierte Haltebögen. **Bass:** Pausen gegen den Puls. **Drums:** Wechsel von Hi-Hat zu Ride. A′ verändert die Schlussphrase und behält die Orientierung des Anfangs. |
| Barock · 20261421 · 105 / AABBAABBAABBO | H harmonisch Moll mit Cis° und Fis-Dur. **Gitarre:** Melodie versus gebundene Quinten; verminderte Klänge werden aufgebrochen. **Keyboard:** eigenständige Rhythmen und gebrochene linke Akkorde. **Bass:** klingende Offbeat-Synkope. **Drums:** offene Hi-Hat als zusätzliche Artikulation. Der Dominantschluss hält die verschiedenen rhythmischen Ebenen zusammen. |
| Lounge · 20261422 · 122 / AABAO | Achtaktige H-Moll-Septakkordfolge, Fis7 schließt nach Hm7. **Gitarre:** ruhige Melodie mit lokalem Powerchord-Sechzehntelkontrast. **Keyboard:** gebundene Figuren und Arpeggioantwort. **Bass:** Pausen, die nicht vom Player zugespielt werden. **Drums:** synkopierter Kick. Hier bleibt Lounge eine elektrische Bandbearbeitung; die Gitarrenklangregel hat Vorrang vor dichten Jazzgriffen. |

### Grade 5

| Stil · Seed · Tempo/Form | Musikalische und spieltechnische Beurteilung |
|---|---|
| Rock · 20261518 · 139 / ABSCABSCBO | D-Mixolydisch, C und G statt durchgehendem Durleitton; achtaktiges A, kürzere Kontraste. **Gitarre:** Riff/Melodie und klare Powerchordunterstützung. **Keyboard:** unabhängige Hände, im Solo längere Begleitklänge. **Bass:** notierter Navigationsablauf. **Drums:** ausgeschriebenes Solo in S und Rückkehr. Die anderen Stimmen geben dem Solopart Platz, ohne ihre eigene Form zu verlieren. |
| Doom · 20261519 · 111 / ABABABAB | Gism7–Emaj7–Fis7: die kleine Septime von Fis bleibt modal passend. **Gitarre:** kompakter tiefer Powerchord-Rhythmuschart und echte Taktwiederholung. **Keyboard:** bewegte unabhängige Hände. **Bass:** Navigations-/Triolenrhythmen. **Drums:** vollständige Triolenfills. Die acht Buchstaben entsprechen dem Wiederholungs- und Rücksprungablauf, nicht acht verschiedenen notierten Abschnitten. |
| Gothic · 20261520 · 109 / ABAB | Achtaktige Cis-Dorisch-Abschnitte mit Fis7/Gism7 und Ais°. **Gitarre:** C♯–G♯–E–B macht die Septime explizit hörbar; B bietet die melodische Antwort. **Keyboard/Bass:** gemeinsame notierte Navigation, unterschiedliche rhythmische Dichte. **Drums:** Triolenfills. Die erhöhte sechste Stufe erklärt die hellere Mollfarbe und den verminderten Ais-Akkord. |
| Progressive · 20261521 · 109 / ABSCABSCBO | Ges-Dur in 5/8, achtaktiges A und viertaktige Kontraste. **Gitarre:** Akkordtonfigur und stützende Quinten. **Keyboard:** drei echte Triolenachtel als Auftakt trotz ungeradem Metrum. **Bass:** ausgeschriebenes S-Solo mit größerem Register. **Drums:** durchgehende Formnavigation. Hier kumulieren Metrum, Vorzeichen und Koordination; begrenzte Motivbausteine und ruhige Begleitteile bleiben nötig. |
| Barock · 20261522 · 100 / ASBASB | Je acht Takte in D harmonisch Moll, Gm/E°/A führen zurück. **Gitarre:** Thema versus Powerchordunterstützung und Navigation. **Keyboard:** Melodie, lange Solo-Begleitklänge, Arpeggioepisode. **Bass:** ausdrücklich führende S-Figur; bis 19 Halbtöne am Registerübergang sind fortgeschrittener Solokontrast, nicht der Grundton-Anfängermodus. **Drums:** Formstütze. Kein Anspruch auf klassischen mehrstimmigen Kontrapunkt. |
| Lounge · 20261523 · 115 / AABAAABAO | Fis-Dorisch, B7 und Cism7; Swing verbindet die Band. **Gitarre:** Arpeggiofarben, in B mit klingender Septime. **Keyboard:** gehaltene Innenstimme plus eigene Oberstimme; die Registerkorrektur bleibt nun im zulässigen Tonmaterial. **Bass:** echte geswungene Achtelpaare. **Drums:** passender Swingpuls. Explizite Triolen bleiben davon unabhängig gleichmäßig. |

## Ergebnis und Grenzen

Die geprüften Stücke haben erkennbare Wiederholung, funktionale oder modale Schlussvorbereitung und gradebezogene Kontraste. Aus der Fallprüfung entstanden konkrete Korrekturen statt bloßer Freigaben: ruhigere Gitarrenregister, erreichbare Anfängerharmonik, tatsächlich klingende Lerninhalte, modale Septimen, passende Keyboardtöne sowie zurückgeführte Bassarpeggien. Die Basskorrektur verwendet auch bei Quint-/Walkingfiguren die tatsächliche Akkordquinte; eine verminderte Quinte wird nicht durch eine reine ersetzt. Ihre Regression vergleicht klingende Töne mit der jeweiligen, gegebenenfalls innerhalb des Takts wechselnden Harmonie.

Die Beschreibungen der 144 Parts benennen die tatsächliche Harmonie und instrumentbezogene Anforderungen, gruppieren Wiederholungen und begrenzen die Intervallauswahl je Grade. Große Formen ergeben trotzdem längere Absätze; die Einordnung ist keine vollständige Spielanleitung. Sie unterscheidet Bandakkorde von Gitarrenquinten und behandelt Drum-Tonnummern nicht als melodische Intervalle. Die Browserprüfung kontrolliert die Darstellung in beiden Sprachen und im PDF.

Die Stichprobe deckt jede Kombination von Grade und Stil mit allen vier Parts ab, nicht jeden möglichen Seed oder jedes Schwerpunkt-Kreuzprodukt. Weitere Rhythmusarten wie 12/8 werden durch die gezielten Inhalts- und MIDI-Tests abgedeckt. Bewegungsplanung und kombinierte Tempoanpassung sind nachvollziehbare Regeln, keine empirisch normierte Schwierigkeitsmessung. Unterschiedliche Stücke desselben Grades bleiben unterschiedlich anspruchsvoll. Grade 0 bezeichnet den Inhaltsstand der Referenzsammlung und setzt grundlegende Instrumentorientierung voraus; es ist kein Ersatz für die erste Erklärung von Haltung, Anschlag oder Notenlesen.

Die Stile sind bewusst vereinfachte, originale Bandmodelle. Barock bedeutet hier insbesondere Kadenz, Sequenz und gebrochene Figuren; Lounge erhält harmonische Farben innerhalb der vorgegebenen E-Gitarrenregeln. Nicht jedes Stück repräsentiert alle Konventionen seines Genres. Die kompakte Form schult keine identische Ausdauer wie ein vollständiges Referenzstück. Das Verfahren belegt Noteninhalt, Zeitmodell und modellierte Spielgrenzen; ein instrumentaler Spieltest und ein menschliches Hörurteil wurden nicht durchgeführt. Klanggestaltung, Dämpfung, körperliche Ausführung und individueller Lernfortschritt können aus MIDI oder Softwaretests nicht abgeleitet werden.

**Abschließende Softwareprüfung:** `npm test` besteht mit 101 Tests; `npm run test:browser` besteht vollständig, einschließlich 288 Praxis-Kombinationen, 48 direkten einseitigen PDF-Downloads, zwei Varianten-PDFs, MIDI-Persistenz, tatsächlicher Wiedergabe, Bookmarks mit JSON/CSV und sämtlichen Theorieansichten. Die [Anforderungsbilanz](PRACTICE_DIDACTICS.md#abschließende-anforderungsbilanz) ordnet die Nachweise dem Überarbeitungsziel zu.

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
