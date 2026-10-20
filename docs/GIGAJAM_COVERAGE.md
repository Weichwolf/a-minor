# Gigajam-Abgleich · 2026-10-13

## Prüfgrundlage

Lokale Sammlung `~/Git/Gigajam`: Debut bis Grade Five, fünf Stücke pro Stufe, jeweils Gitarre, Piano, Bass und Drums. Inventar und Textextraktion umfassen **120 PDFs mit 218 Seiten** sowie **30 MIDI-Dateien**. Die Notation ist die Grundlage für rhythmische Werte und Spielanweisungen. MIDI bestätigt Tonbereiche, Stimmen, Einsätze, Tempo und lange Abläufe; kurze MIDI-Abstände zwischen gestrummten Akkordtönen sind kein Beleg für Sechzehntel oder Zweiunddreißigstel.

Die Produktionsdaten enthalten Anforderungsprofile, keine importierten Takte, Melodien oder Begleitspuren. Die Profile stehen in [practice-curriculum.json](../data/practice-curriculum.json); der Browser lädt ihre identische JS-Fassung. Rock ist die Grundlage. Die anderen sechs Stile verändern Harmonik, Kontur, Klang, Begleitfigur oder Puls, während die Spielgrenzen pro Instrument bestehen bleiben.

## App-Staffelung ab 2026-10-20

Die instrumentbezogenen Anforderungen dieses Abgleichs bleiben erhalten. Generatorversion 4 verwendet jedoch eine eigene kumulative Tonarten-/Skalen-/Stilstaffelung mit Vorzeichengrenzen 0/1/2/3/4/6 und einem neuen Bluesstil. Der [Staffelungsplan](PRACTICE_PROGRESSION.md) dokumentiert diese App-Entscheidung; sie ist keine zusätzliche Aussage über die Referenzsammlung.

## Korrigierte Ursachen

Der vorige Praxisgenerator wählte nur A, D oder E als Tonzentrum und überwiegend Mollmodi. Seine eigenen Tempogrenzen endeten bei Grade 5 bei 100. Sechzehntel kamen nur in einzelnen Vorlagen vor; Stilvorlagen konnten die Grade-Anforderungen wieder vereinfachen. Bass bestand vor allem aus gehaltenen Grundtönen, Drums aus einem einfachen Raster. Das entsprach dem Umfang der Sammlung nicht.

Jetzt werden Dur- und Molltonarten mit einer Grade-Grenze für die Zahl der Vorzeichen gewählt. Rock umfasst auch mixolydische und geliehene Durakkorde. Notenwerte, Techniken und Koordination besitzen **eigene Profile für jedes Instrument**. Bereits Grade 1 braucht beispielsweise Drum-Sechzehntelfills; daraus folgt keine Anforderung an Keyboard-Sechzehntel derselben Stufe.

## Melodisches Gitarrenspiel als Ergänzung

Die Referenzanforderungen sind kein ausschließliches Repertoire von Begleitakkorden. Die Auswahl der Gitarrenschwerpunkte bleibt zwischen Einzelton- und Akkordspiel ausgewogen. Im Regelfall verbindet ein Stück jetzt mehrere Spielweisen in stilabhängigen Abschnitten, etwa Riff → Melodie → Riff oder Arpeggio → Akkordfigur → Arpeggio. Der ausgewählte Grade-Schwerpunkt bleibt in mindestens einem Abschnitt vorhanden. Ab Grade 0 entstehen Melodien und Einzeltonriffs in Ganzen, Halben und Vierteln; der Tonumfang einer Einzeltonfigur pro Takt bleibt innerhalb einer Quinte. Ab Grade 1 kommen mit Plektrum gespielte gebrochene Akkorde und Achtelfiguren dazu. Die Schlussfigur folgt der Spielweise ihres Abschnitts. Powerchords bleiben als gleichzeitige Anschläge erhalten. Dreiklänge und Septakkorde werden für die verzerrte E-Gitarre als Arpeggien vermittelt; Quint-/Sextwechsel als Einzeltonfiguren. Schluss- und Begleitfiguren folgen derselben Regel. Die Referenz wird damit in ihrer Gitarrentechnik bewusst angepasst, während Keyboard seine eigenen Akkordanforderungen behält. Die [didaktische Beschreibung](PRACTICE_DIDACTICS.md) dokumentiert Formauswahl, motivische Verbindung, variierte Rückkehr und Begleitung.

## Anforderungen je Grade (mit E-Gitarrenanpassung)

### Erneute Sichtprüfung für die pädagogische Überarbeitung

Am 13.10.2026 wurden für den ersten Überarbeitungsschritt zusätzlich die gerenderten Originalseiten von Debut *Fire It Up* (Piano), Grade 1 *Ain’t No Party* (Drums), Grade 4 *Torture* (Guitar) und Grade 5 *Soul Town* (Keys) visuell geprüft. Das ist eine gezielte Stichprobe, noch keine erneute Vollprüfung aller Grade und Parts.

Der Debut-Part verbindet drei Vorzeichen und Vierteltempo 128 mit ruhenden linken Händen, vielen langen Werten, wiederkehrenden Akkordlagen und eng geführten Melodiefiguren. Daraus folgt für die Überarbeitung: Vorzeichenzahl oder Tempo allein sind keine ausreichenden Schwierigkeitsmaße. Entscheidend ist ihre Kombination mit Bewegungs- und Lesedichte. Grade 1 Drums verbindet einen wiederkehrenden Viertelpuls mit lokal begrenzten Sechzehntelfills; schnelle Unterteilung ist hier keine Anforderung an jeden Takt und jede Stimme. Grade 4 Guitar kombiniert Powerchordangaben, Sechzehntel, Pausen, wiederkehrende rhythmische Zellen und harmonische Wechsel. Grade 5 Keys zeigt sowohl gebundene/versetzte Stimmen als auch einfachere gemeinsame Rhythmen; hohe Grades benötigen also ebenfalls Entlastung innerhalb ihrer Form. Es werden ausschließlich diese abstrakten Anforderungen verwendet, keine Tonfolgen oder Taktkopien.

Zusätzlich wurden die ersten Originalseiten aller vier Parts von Grade 2 *Lonely Streets* und Grade 3 *Tunnel Vision* geprüft. Grade 2 bestätigt den Wechsel zwischen gehaltenen und schnelleren Powerchordrhythmen, Keyboardakkorden mit Bass, Oktavbewegungen im Bass sowie Achtelbecken und sichtbar akzentuierten Sechzehntelfills. Der Generator kennzeichnet diese Fill-Akzente nun auch in der Notation. Grade 3 zeigt harmonisch geführte Akkordwechsel, Melodie über längeren linken Akkorden, Skalen-/Akkordfiguren im Bass und Wechsel zwischen Viertel-/Achtelbecken, Crash-Anfängen und differenzierten Fills. Die Keyboard-Abstufung erhält deshalb in Grade 3 Rock längere linke Begleitwerte unter den melodischen Abschnitten; bloß identische schnelle Anschläge beider Hände würden diesen Zusammenhang nicht vollständig abbilden. Die Gitarren-Dreiklänge der Vorlage werden weiterhin ausdrücklich als Powerchords plus einstimmige Akkordfiguren adaptiert.

| Grade | Gitarre | Keyboard | Bass | Drums |
|---|---|---|---|---|
| 0 | Gehaltene und in Vierteln wiederholte Grundton/Quint-Klänge, Wechsel, Pausen | Rechte Einzelmelodie und Dreiklänge, Ganze/Halbe/Viertel; linke Hand pausiert | Grundtonwechsel, Viertel und Achtel | Viertelbecken, Bassdrum/Snare, Achtelbewegung und Achtelfills, Stopps |
| 1 | Powerchord-Achtel, Wechsel, gedämpfte/offene Anschläge | Linke Dreiklänge, Handdialog, Melodie über gehaltenen Akkorden | Achtel und einfache Durchgänge | Sechzehntelfills, Snare/Tom-Verteilung, Viertelbecken |
| 2 | Chromatische Powerchordbewegung, Dreiklang-Arpeggien und Dämpfung | Akkorde mit Bass, gemeinsame Rhythmen und abwechselnde Hände | Oktave, Quinte, bewegte Figuren | Achtelbecken, variierte Bassdrum, akzentuierte Fills |
| 3 | Dur-/Moll-/Septakkord-Arpeggien, Powerchordwechsel und melodische Registerwechsel | Akkordwechsel, chromatische Farbe, eigene Begleitung unter Melodie | Skalen-/Akkordfiguren und Registerwechsel | Crash-Einsätze, akzentuierte Sechzehntel und Tomfills |
| 4 | Ganze Powerchord-Sechzehntel, Synkopen, Bindungen, Arpeggien, Clean/Drive-Kontrast | Punktierungen, Synkopen, Bindungen, unabhängige Hände und Septakkorde | Synkopen, chromatische Annäherungen und präzise Pausen | Versetzte/punktierte Grooves, offene Hi-Hat, Ride/Crash, drei koordinierte Schläge und Sechzehntelfills |
| 5 | Powerchord-Rhythmusslashes, Taktwiederholung, einstimmige Quint-/Sextwechsel, Shuffle, Septakkord-Arpeggien, ausgeschriebener Kontrast und Rückkehr | Swing/Comping, Triolenauftakt, 12/8, unabhängige Hände und gehaltene Innenstimmen | Walking-/Shuffle-/12/8-Figuren, Kontrast und Rückkehr | Swing/Shuffle/12/8, Triolenfills, Kontrast und Rückkehr |

Die neuen Schwerpunkte ersetzen nicht die grundlegenden Bausteine: Akkordwechsel, Grundwerte, Pausen und frühere Anschlagsarten bleiben in den späteren Arrangements enthalten. Lange Abläufe, Wiederholungen sowie D.C./D.S., Fine und Coda kommen in Grade 5 hinzu. Soloabschnitte sind für das Lesen ausgeschrieben; freie Improvisationsaufträge gehören nicht in diesen Modus.

Konkrete Belege: Debut **Fire It Up** zeigt rechte Piano-Dreiklänge und Achtelfills; Grade 1 **Ain’t No Party**, Drums, enthält Sechzehntelfills. Grade 2 **Fire It Up**, Gitarre, nutzt gedämpfte Anschläge; **Ain’t No Party**, Bass, erweitert um Oktav-/Quintbewegung. Grade 3 **Tunnel Vision**, Piano, verbindet Melodie und linke Akkorde; **Wearing the Wire**, Drums, ergänzt Akzentfills. Grade 4 **Torture**, Gitarre, verlangt Sechzehntel auf vollständigen Powerchords; **Island of Dreams**, Drums, erweitert Punktierungen und Beckenfarben. Grade 5 **Brown Shoes** verbindet Shuffle, Quint/Sext und Rhythmusnotation; **Coming Up Shortly**, Piano, zeigt den Triolenauftakt; **Soul Town**, Piano, gehaltene Innenstimmen und unabhängige Rhythmen; **Take a Walk With Me** nutzt 12/8.

## Tempo und Form

| Grade | Referenztempi, Viertel/min | Zielspieldauer seit Version 6 | Abschnitt |
|---|---|---|---|
| 0 | 85, 90, 93, 115, 128 | 0:45 | 4 Takte |
| 1 | 85, 90, 93, 115, 128 | 1:05 | 4 Takte |
| 2 | 85, 90, 93, 115, 128 | 1:30 | 4 Takte |
| 3 | 85, 90, 93, 115, 128 | 2:00 | 4 oder 8 Takte |
| 4 | 90, 91, 102, 120, 140 | 2:35 | 4 oder 8 Takte |
| 5 | 80, 85, 110, 125, 146 | 3:15 | 4 oder 8 Takte |

MIDI enthält teils gerundete Abweichungen: Island of Dreams 90,5 statt notierter 91, Brown Shoes 124,5 statt 125, Who Says it’s Raining 145,5 statt 146. Die Felder `quarterTempo` und `referenceTempos` der Profile dokumentieren weiterhin die Referenz. Seit Version 6 verwendet die App eigene Stilbereiche und berücksichtigt die Belastung der tatsächlich komponierten Stimmen; sie überträgt den Rockbereich nicht pauschal auf Doom, Lounge oder Blues. Die [Tempo- und Dauerstaffelung](PRACTICE_PROGRESSION.md) dokumentiert diese Entscheidungen.

Die Zielzeiten erlauben ungefähr zehn Prozent Abweichung und gelten ohne Einzählen oder zusätzliche Player-Schleifen. Die Taktzahl folgt aus Tempo, Taktart und vollständiger Form. Die frühere Grenze von drei Formdurchläufen beziehungsweise 64 gespielten Takten entfällt. Wiederkehrende Abschnitte und vollständige Blueschorusse schaffen die erforderliche Spieldauer; die notierte Partitur bleibt kompakt. Diese App-Staffelung übernimmt keine Originalabläufe und behauptet keine identische Ausdaueranforderung zu jedem Referenzstück.

Take a Walk With Me notiert **Viertel = 85 in 12/8**. Vier große Pulse pro Takt entsprechen punktierter Viertel = 85 / 1,5 ≈ 56,67. Diese kleinere Zahl ist eine andere Tempoeinheit, keine Verlangsamung. MIDI verwendet das Vierteltempo; der Player zeigt die zu seiner Taktart passende Einheit. Progressive erweitert ab Grade 4 um 5/8 oder 7/8; das ist eine Stilerweiterung, kein Befund der Rocksammlung.

Wiederkehrende Abschnitte werden einmal geschrieben. Die tatsächliche Form wird angezeigt und vollständig abgespielt; höchstens 24 verschiedene Takte passen auf die einseitige Partitur. Vier Takte bilden immer eine Zeile, acht Takte zwei. Sprungformen verbinden einen wiederholten Abschnittsblock mit einer anschließenden Rückkehr zu Segno oder Anfang und dem notierten Schluss/Coda. Die Wiederholungszahl und vollständige Form bleiben sichtbar.

## Generierbarkeit und Prüfung

Die Rhythmusgrammatik setzt ganze Takte aus zulässigen Grundwerten, Pausen, Punktierungen und vollständigen Triolengruppen zusammen. Sie verwendet keine Liste übernommener Referenztakte. Häufige Rockmuster werden höher gewichtet; andere vollständige Kombinationen bleiben möglich. Melodien, Basslinien und erreichbare Akkordlagen werden aus Tonart, Harmonie, Kontur und Zufall komponiert. Akkordwechsel innerhalb eines Takts werden gemeinsam geplant. Übliche kurze Takte können dadurch unabhängig dieselbe Gestalt wie ein Referenztakt erhalten.

Tests prüfen, dass jeder mehrstimmige Gitarrenanschlag ausschließlich Grundton und reine Quinte enthält, Arpeggien einstimmig bleiben und Keyboard weiterhin vollständige Akkorde enthält. Zusätzlich prüfen sie die Gradewerte pro Stimme, breite Tonart-/Tempoauswahl, alle benannten Schwerpunkte, vollständige Takte, Griff-/Handgrenzen, Drum-Koordination, wörtliche Wiederkehr und Formlänge. Die MIDI-Datei wird gegen alle vier geschriebenen Parts geprüft: Notenanfänge und -enden, Stimmen, Swing, gleichmäßige explizite Triolen, Bindungen über Taktgrenzen, Artikulation und Lautstärke. Die Bass- und Drum-Notation sind eigene Parts, keine nachträglich angenäherte Begleitung. Browserprüfungen decken sämtliche Stil/Grade/Instrument/Sprache-Kombinationen, mobile Zeilen, direkte einseitige PDFs und gespeicherte MIDI-/Bookmark-Einstellungen ab.

**Grenzen:** Der Abgleich beschreibt die Spielanforderungen dieser lokalen Sammlung, keine formale Prüfungsanerkennung. „Jeden Taktinhalt erzeugen“ bedeutet hier die musikalischen Bausteine und Spielanforderungen, nicht eine Zusage, dass jeder Originaltakt in originaler Lage und Griffweise reproduziert wird. P4 erfordert andere Griffe als Standardstimmung. Die 49 Tasten C2–C6 können die tiefen F1-/B1-Register einiger Piano-Originale nicht abbilden; die Register werden angepasst. Diese Instrumentgrenzen bleiben ausdrücklich erhalten. Automatische Notenprüfung beweist keine korrekte Körperhaltung, Anschlagtechnik oder Ausdruck; auch freie Soli werden nicht automatisch gelehrt.

## Vollständiges Inventar

| Grade | Stück | Gitarre | Piano | Bass | Drums |
|---|---|---:|---:|---:|---:|
| 0 | Ain't No Party | 1 | 1 | 1 | 1 |
| 0 | Fire It Up | 1 | 1 | 1 | 1 |
| 0 | Lonely Streets | 1 | 1 | 1 | 1 |
| 0 | Tunnel Vision | 1 | 1 | 1 | 1 |
| 0 | Wearing the Wire | 1 | 1 | 1 | 1 |
| 1 | Ain't No Party | 1 | 1 | 1 | 1 |
| 1 | Fire It Up | 1 | 2 | 1 | 1 |
| 1 | Lonely Streets | 1 | 1 | 1 | 1 |
| 1 | Tunnel Vision | 1 | 2 | 1 | 1 |
| 1 | Wearing the Wire | 1 | 2 | 1 | 1 |
| 2 | Ain't No Party | 1 | 2 | 1 | 1 |
| 2 | Fire It Up | 2 | 3 | 2 | 2 |
| 2 | Lonely Streets | 1 | 2 | 1 | 1 |
| 2 | Tunnel Vision | 1 | 2 | 2 | 2 |
| 2 | Wearing the Wire | 1 | 2 | 1 | 1 |
| 3 | Ain't No Party | 2 | 2 | 2 | 2 |
| 3 | Fire It Up | 2 | 3 | 2 | 3 |
| 3 | Lonely Streets | 2 | 2 | 2 | 2 |
| 3 | Tunnel Vision | 2 | 3 | 2 | 2 |
| 3 | Wearing the Wire | 2 | 3 | 2 | 2 |
| 4 | Berlin Wall | 3 | 5 | 3 | 4 |
| 4 | Island of Dreams | 3 | 3 | 1 | 2 |
| 4 | The Buzz | 1 | 3 | 2 | 3 |
| 4 | The Way it Is | 2 | 3 | 2 | 2 |
| 4 | Torture | 3 | 4 | 2 | 3 |
| 5 | Brown Shoes | 3 | 4 | 2 | 3 |
| 5 | Coming Up Shortly | 2 | 3 | 2 | 1 |
| 5 | Soul Town | 2 | 4 | 2 | 3 |
| 5 | Take a Walk With Me | 1 | 3 | 1 | 2 |
| 5 | Who Says it's Raining | 2 | 2 | 2 | 2 |

Gesamt: Gitarre 48, Piano 71, Bass 46, Drums 53 Seiten = **218 Seiten**. Die lokalen Partituren und MIDI-Dateien bleiben außerhalb des Repositories.
