# Praxis und Musiklehre · Revision 2026-10-11

Das Ziel ist sicheres Spielen nach Noten mit Verständnis für den musikalischen Zusammenhang. Praxis enthält vollständige generierte Stücke; Theorie ist ein Lesebuch. Eine Geschmacksnotiz oder ein Bookmark ist keine Leistungsmessung. Es gibt keine automatischen Aufstiegsbedingungen und keine Improvisationsaufträge.

## Komposition

Der Generator komponiert zuerst eine kurze rhythmische Zelle und eine Kontur. Wiederkehrende Zellen halten die Phrasen zusammen; Akkordtöne verankern die Anfänge. Kontrastabschnitte verändern Kontur oder Spielrolle. Wörtliche A-Rückkehr kopiert die Musik, A′ wird ausgeschrieben. Der Schluss verbindet ein tonales Bassfundament mit einem melodischen Zielton.

Harmonie ist vorgeplant, keine nachträglich erfundene Beschreibung. Die Stilvorlagen unterscheiden Riffpuls, lange Doom-Dauern, Gothic-Bassfiguren, Progressive-Kontrast/Gruppierung, barocke Figuration, Lounge-Begleitung und Filmmusik-Akkordkreise. Der Algorithmus wählt innerhalb dieser Vorlagen Tonzentrum, Rhythmuszelle, Kontur, Fokus, Form und Tempo. Ein Seed ist reproduzierbar.

Grade 0 verwendet drei bis fünf Melodietöne, Viertel und Halbe mit einem ruhigen Bass. Wiedererkennung und Schluss sind bereits vorhanden. Ein Keyboardstück enthält seine eigene Begleitung; zusätzliche Bandstimmen sind optional. Grade und Stil sind getrennte Parameter.

## Begrenzte Variation

Ein Stück erhält einen Schwerpunkt. Andere Merkmale stammen überwiegend aus früheren Stufen. Ein neuer ungerader Takt erhält regelmäßige Abschnittslängen. Eine verkürzte Phrase erscheint in 4/4. Swing wird nicht gleichzeitig auf Triolen- oder Sechzehntelfiguren angewendet. Register und Handrollen wechseln erst in der fortgeschrittenen Variante. Stilvarianten können einen bereits bekannten Schwerpunkt wiederverwenden, auch in einem höheren Grade.

Die Grade sind Inhaltsbereiche, keine beobachteten Fähigkeiten. Auswahl und Klick auf „Neues Stück“ sagen nicht, ob ein Spieler das bisherige Stück beherrscht. Der Nutzer kann ein Stück behalten, erneut spielen oder bookmarken. Ein Generator ersetzt keine Rückmeldung zu Körperhaltung, Tonbildung oder tatsächlicher Ausführung.

Die Entscheidung für begrenzte Variation ist eine didaktische Ableitung, kein Nachweis der Wirksamkeit dieser Anwendung. Eine Studie mit 48 musikalischen Anfängern untersuchte zeitliche Variabilität und Übungsreihenfolge, nicht diese Songformen: [PLOS ONE, 2018](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0193580). Ihre Ergebnisse begründen kein pauschales „mehr Zufall ist besser“. Das Projekt setzt deshalb auf klar erkennbare Figuren und kontrollierte Anforderungen statt beliebiger Notenfolgen.

## Was die Einordnung zeigt

Die Beschreibung wird aus dem tatsächlichen Notenstand gewonnen: Akkordfolgen pro geschriebenem Abschnitt, bei höheren Grades Stufen, häufige Intervalle und gegebenenfalls größere tatsächliche Sprünge, harmonische Quinten, verwendete Dauern, Form und Fokus. Rhythmus- und Intervallnamen werden nicht nur aus den erlaubten Generatorparametern übernommen. Es gibt keine Liste der gesamten Melodie und keine Fingersatzlösung.

Eine römische Stufe benennt die Beziehung zum Grundton. In Moll verwendet die Darstellung etwa ♭III, ♭VI und ♭VII gegenüber der Durreferenz. Natürlich Moll kann über v–i schließen; harmonisch Moll nutzt V–i mit Leitton. Das sind unterschiedliche Klangmittel. Die Benennung von Septakkorden folgt ihrer tatsächlichen Terz, Quinte und Septime.

## Umfang und Grenzen

Die vorhandenen [Gigajam-Auswertungen](GIGAJAM_COVERAGE.md) liefern Anforderungsbereiche: Rhythmus, Akkordanschläge, Koordination, Stimmen, Pausen, Form, Register und Tempo. Die Miniaturen nehmen ausgewählte Bereiche auf. Sie decken keine vollständigen 96–144-Takt-Bandformen, alle Symbol-/Sprungzeichen, Standardstimmungsgriffe oder die höchsten Originaltempi ab. P4-Griffe unterscheiden sich von Standardstimmung. Eine Prüfungsgleichwertigkeit wird nicht behauptet.

Spielbarkeit wird für P4 E2–F4 plus die Grade-Bundgrenze und Keyboard C2–C6 geprüft. Die Notation stellt ein rhythmisches und harmonisches Stimmengerüst dar; reale Plektrumtechnik, Legato, Dämpfung und Pedalgebrauch werden nicht vollständig durch MIDI abgebildet. Klangqualität und Ausdruck lassen sich nicht allein durch Tonbereichs- und Taktprüfungen belegen.

## Musiklehre

Vier neue Kapitel ergänzen das Buch um 25 originale Modelle: sieben Stilbauweisen, Filmmusik am Klavier, Lounge und musikalischer Zusammenhang. Die Kapitel bleiben erklärend. Kleine Modelle zeigen konkret, wie Bass, gemeinsamer Ton, Stimmführung, Rhythmus, Register und Form zusammenwirken. Sie sind weder Cover noch Aufgaben.

Fachliche Vergleichsquellen: [Open Music Theory: ii–V–I](https://viva.pressbooks.pub/openmusictheory/chapter/ii-v-i/) für Terz-/Septimverbindungen; [Open Music Theory, Inhaltsverzeichnis](https://viva.pressbooks.pub/openmusictheory/table-of-contents/) für die Einordnung von Form, Phrasen und Swing; [Berklee: Music Composition for Film and TV 1](https://online.berklee.edu/courses/music-composition-for-film-and-tv-1) für die Verbindung von Stil, dramatischer Funktion und musikalischen Bausteinen. Die konkreten Notenmodelle und Stilvorlagen sind eigene Gestaltungsentscheidungen.

## Nachvollziehbarkeit

Bookmarks enthalten vollständige Partituren, Generatorversion, Auswahl und freiwillige Geschmacksnotiz. JSON ermöglicht Wiederherstellung, CSV eine musikalische Übersicht. Import ergänzt bestehende Einträge nach Validierung. Speichern wird zuerst im Browser abgeschlossen, bevor sich die interne Liste ändert. Die Exporte erlauben manuelle Weiterentwicklung des Generators anhand bevorzugter Stücke; sie behaupten keine automatische Analyse des Lernfortschritts.
