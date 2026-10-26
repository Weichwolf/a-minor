# Stufen des Praxisgenerators · 2026-10-26

Die Stufen 0–5 beschreiben den Schwierigkeitsaufbau dieses Generators. Auf Deutsch heißt die Auswahl **Stufe**, auf Englisch **Level**. Jede Stufe verbindet eigene Anforderungen an Rhythmus, Tonumfang, Koordination und Spieldauer. Die vier Instrumente besitzen getrennte Profile.

Die Profile stehen in [practice-curriculum.json](../data/practice-curriculum.json); der Browser lädt die identische [JS-Fassung](../js/practice-curriculum.js). Der [Staffelungsplan](PRACTICE_PROGRESSION.md) dokumentiert Tonarten, Skalen, Stilfreigaben und Tempo. Die [didaktische Beschreibung](PRACTICE_DIDACTICS.md) erläutert Phrasen, Begleitrollen und Auswahl.

## Instrumentbezogene Anforderungen

| Stufe | Gitarre | Keyboard | Bass | Drums |
|---|---|---|---|---|
| 0 | Gehaltene und Viertel-Powerchords, Pausen, Melodien und einfache Riffs | Rechte Melodie/Dreiklänge, lange Werte und Pausen; linke Hand pausiert | Grundtonviertel/-achtel und Grundtonwechsel | Viertelbecken, Achtel-Bassdrum, kurze Achtelfills und gemeinsame Stopps |
| 1 | Achtel-Powerchords, Handkantendämpfung, Akkordwechsel und gespielte Arpeggien | Linke Dreiklänge, Handdialog und Melodie über Akkorden | Achtelfiguren, Durchgangstöne und Grundtonwechsel | Lokal begrenzte Sechzehntel- und Tomfills über stabilem Groove |
| 2 | Chromatische Powerchords, Dreiklangsarpeggien und melodische Riffs | Akkorde mit Bass, gemeinsame Rhythmen und Handdialog | Oktav-/Quintfiguren und bewegte Skalenfiguren | Achtelbecken, versetzte Bassdrum und Akzentfills |
| 3 | Dur-/Moll-/Septarpeggien, Registerwechsel und Melodien | Akkordwechsel, aufgelöste chromatische Nachbartöne und Melodie über Begleitung | Skalen-/Akkordfiguren und Registerwechsel | Crash-Anfänge, Akzent-Sechzehntel und Tomfills |
| 4 | Sechzehntel-Powerchords, Synkopen, Bindungen und Arpeggien | Synkopen, unabhängige Hände, Septakkorde und Bindungen | Synkopen, chromatische Annäherungen und präzise Pausen | Versetzte/punktierte Grooves, offene Hi-Hat, Beckenwechsel und kurze Sechzehntelfills |
| 5 | Rhythmuscharts, Quint-/Sextlinien, Shuffle, Septarpeggien, ausgeschriebene Soloabschnitte und Navigation | Swing-Begleitung, unabhängige Hände, Triolenauftakt, 12/8, Soloabschnitte und Navigation | Walking-/Shuffle-Bass, 12/8, Soloabschnitte und Navigation | Swing/Shuffle, Triolenfills, 12/8, Soloabschnitte und Navigation |

Neue Schwerpunkte ergänzen die grundlegenden Bausteine. Drum-Sechzehntel in Stufe 1 verlangen beispielsweise keine Keyboard-Sechzehntel derselben Stufe. Gitarrenmelodien, Riffs und Arpeggien sind einstimmig; gleichzeitige Gitarrenanschläge bestehen aus Grundton und reiner Quinte. Keyboard behält vollständige Akkorde und seine eigenen Handprofile. Soloabschnitte sind ausnotiert.

## Umfang und Spieldauer

| Stufe | Max. Vorzeichen | Max. Bund im Saitenmodell | Zielspieldauer | Abschnittslänge | Neu verfügbare Stile |
|---|---:|---:|---|---|---|
| 0 | 0 | 5 | 0:45 | 4 Takte | Rock, Doom |
| 1 | 1 | 7 | 1:05 | 4 Takte | Blues |
| 2 | 2 | 9 | 1:30 | 4 Takte | Gothic, Barock |
| 3 | 3 | 12 | 2:00 | 4 oder 8 Takte | Lounge |
| 4 | 4 | 15 | 2:35 | 4 oder 8 Takte | Progressive |
| 5 | 6 | 18 | 3:15 | 4 oder 8 Takte | Vertiefung aller sieben Stile |

Bisherige Tonarten, Skalen und Stile bleiben verfügbar. Die Zielzeit erlaubt ungefähr zehn Prozent Abweichung und enthält alle gespielten Wiederholungen und Rückkehrstellen. Einzählen und zusätzliche Player-Schleifen zählen nicht dazu. Langsame Stile benötigen bei gleicher Dauer weniger Takte. Höchstens 24 verschiedene Takte halten die Partitur kompakt; wiederkehrende Abschnitte werden einmal notiert.

Die Stilbereiche in [practice-design.js](../js/practice-design.js) und die Belastung der tatsächlichen Stimmen bestimmen das Tempo. Dichte, kurze Anschlagsabstände, schnelle Sprünge, sichtbare Versetzungszeichen und Handunabhängigkeit werden gemeinsam berücksichtigt. Höhere Stufen müssen deshalb nicht durchgehend schneller sein. MIDI verwendet Vierteltempo; in 12/8 zeigt der Player den punktierten Viertelpuls, in 5/8 und 7/8 den Achtelpuls.

## Darstellung, Speicherung und Prüfung

Stücktitel, Auswahlfelder, Stilhinweise, Bookmarks und PDFs verwenden Stufe/Level. Die bisherigen numerischen URLs und das JSON-Datenfeld `grade` bleiben aus Kompatibilitätsgründen erhalten. Gespeicherte Noten und benutzerdefinierte Bookmark-Namen werden durch die Umbenennung nicht verändert. MIDI-Titel verwenden sprachunabhängig „Level“, der CSV-Export die Spalte `level`.

Die Tests prüfen vollständige Takte, tatsächliche Technikschwerpunkte, Hand-/Saitengrenzen, wörtliche Wiederkehr, vorbereitete Schlüsse und die Übereinstimmung der vier geschriebenen Parts mit MIDI. Browserprüfungen kontrollieren beide Sprachen, Auswahlfelder, gespeicherte Stücke und einseitige PDF-Downloads. Die [Fallprüfung](MUSICAL_REVIEW.md) beschreibt konkrete musikalische Befunde. Haltung, Klang und Ausdruck werden zusätzlich am Instrument beurteilt.
