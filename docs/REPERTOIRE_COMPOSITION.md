# Komposition: Szene, Motiv und Form

Die vorherige Fassung ging von Lernzielen und wiederverwendbaren Begleitmustern aus. Die neue Fassung beginnt pro Stück mit einer Szene und einem konkreten musikalischen Gedanken. Der technische Schwierigkeitsgrad begrenzt dessen Umsetzung.

## Arbeitsmaterial

- `scripts/composition-notes.json`: Bilder, eigene Textentwürfe, musikalische Absicht, Referenzen, Formgedanke, Entscheidungen und offene Revisionsfragen, verknüpft über die Stück-ID.
- `scripts/repertoire-themes.json`: ausgeschriebene Parts für jede Formsektion, einschließlich Pausen, Artikulation, Harmonie, Bass, Drum-Einsätzen und Phrasendynamik.
- `scripts/build-repertoire.mjs`: prüft und übersetzt die Parts in Notation und MIDI. Er erfindet keine allgemeinen Begleitfiguren, Bassverdopplungen oder Schlüsse mehr.

Die Texte sind ein Werkzeug für Sprachrhythmus, Atemstellen und Vokallängen. Sie sind keine zusätzlichen Gesangsspuren. Noten und Verzierungen müssen nicht Silbe für Silbe einem Text entsprechen. Instrumentale Programme ersetzen bei den klassisch geprägten Stücken den Text. Arbeitsnotizen werden nicht in den Katalog, die Scores, PDFs oder MIDI-Dateien exportiert und nicht von der Oberfläche geladen.

## Referenzen und Übertragung

Die folgenden Übertragungen sind eigene kompositorische Interpretationen, keine Behauptung, dass die Referenzmusiker nach einem festen Rezept arbeiten.

| Referenz | Übertragenes Verfahren |
|---|---|
| My Dying Bride · *Turn Loose the Swans* | Gewicht im tiefen Riff gegen eine eigenständige klagende Linie; langsame harmonische Spannung; Wechsel von Textur und Dichte. |
| Type O Negative · *October Rust* | Einprägsame gesangliche Hooks, tiefer Puls, Keyboard als Atmosphäre und Gegenstimme; Wärme und bitterer Humor innerhalb schwerer Musik. |
| Anathema · *Eternity* | Lange vokale Phrasen; Wiederkehr mit verändertem Ausdruck; Öffnung durch Register und Dichte statt bloßer Notenmenge. |
| Vivaldi · *Le quattro stagioni* | Ein konkretes Bild begründet Gesten und Kontraste; wiedererkennbares Ritornell und abweichende Episoden; Sequenz und Registerentwicklung. |
| Biber · *Harmonia artificioso-ariosa* | Dialog zweier selbständiger Linien, unterschiedliche Tanzgewichte, Variation einer erkennbaren Idee. Historische Skordaturen werden nicht auf die P4-Gitarre übertragen. |

Text zuerst ist dabei keine Pflicht: Andrew Craighan beschreibt bei My Dying Bride auch den umgekehrten Weg, Musik vor Text, mit vorgesehenem Raum für Violine und Keyboard. [Interview mit Andrew Craighan](https://www.nocleansinging.com/2015/09/08/get-to-the-point-andrew-craighan-my-dying-bride/).

Weitere Arbeitsreferenzen: [Josh Silver zu October Rust](https://chroniclesofchaos.com/articles.aspx?id=1-76), [Danny Cavanagh über sein Schreiben](https://www.decibelmagazine.com/2014/06/27/danny-cavanagh-anathema-interviewed/), [Vivaldi-Partituren](https://imslp.org/wiki/Il_cimento_dell%27armonia_e_dell%27inventione,_Op.8_(Vivaldi,_Antonio)), [Biber-Partituren und Satzfolge](https://imslp.org/wiki/Harmonia_artificioso-ariosa_(Biber,_Heinrich_Ignaz_Franz_von)). Das spätere Cavanagh-Interview belegt keinen konkreten Entstehungsablauf von *Eternity*. Übernommen werden Verfahren; die Melodien, Riffs und Textentwürfe sind eigene.

## Stückgedanken

Die englischen Arbeitsbilder bleiben hier als knappe Dokumentation; vollständige Textentwürfe stehen ausschließlich in der JSON-Quelle.

| Stück | Bezug | Bild / Absicht | Musikalische Konsequenz |
|---|---|---|---|
| Ember | Anathema | Protecting one small flame while the room goes dark. Intimacy, not triumph. | A single held call, a three-note reply, then room for the reply to matter. |
| Stone and Breath | My Dying Bride | A person stops under a weight, breathes, and takes one more step. | Low separated impacts; the silence is part of the weight. The return gets shorter, not busier. |
| Empty Halls | Heinrich Ignaz Franz Biber | Calling into a deserted house and hearing an answer from the wrong room. | A three-beat call with a rest before its echo; the keyboard replies at a different height. |
| Beneath the Ash | Type O Negative | A buried ember becomes a pulse; restrained defiance. | Repeated A notes insist before the minor third opens the phrase. Bass and drums answer the insistence. |
| Last Light | Anathema | Watching a departing person until the last patch of light disappears. | The melody reaches once and falls back; the final answer descends instead of trying to win. |
| Mossbound | Type O Negative | Roots catch a walker who is trying to leave. Uneasy persistence. | Two short pickups meet a stubborn long note; the answer changes direction and leaves space. |
| The Second Threshold | My Dying Bride | A hand approaches a forbidden door, recoils, then opens it. | The phrygian semitone is a hesitation with a rest after it, not a scale demonstration. |
| Black Glass | Heinrich Ignaz Franz Biber, Anathema | A reflection fractures; the fragments do not agree on the face. | Broken arpeggios, interrupted answers, and a deliberately incomplete first cadence. |
| Iron Rain | Type O Negative | People keep walking together through industrial noise. Anger with discipline. | A low repeated-note hook with a clipped gap; a broad response makes the chorus feel collective. |
| November Window | Type O Negative, Heinrich Ignaz Franz Biber | A familiar room is warm, but the person who belonged there is absent. | A lilting three-beat song with delayed answers and one rising appeal before the descent. |
| The Descent | My Dying Bride, Heinrich Ignaz Franz Biber | A procession cannot stop the ground sinking beneath it. | The bass descends E–D–C–B while the melody resists on a repeated pitch, then finally yields. |
| Crooked Footsteps | Type O Negative | Someone tries to look confident while being followed. A crooked grin. | Anticipated attacks, clipped gaps and an answer that lands late; the band leaves the jokes audible. |
| Shards of Rain | Antonio Vivaldi | Rain strikes broken metal; sudden memories arrive in flashes. | A few sharp sixteenth bursts interrupt sustained tones. Long rests separate the flashes. |
| Circle of Dust | Heinrich Ignaz Franz Biber | Dust turns in a shaft of light; the same figures return slightly altered. | A small turning figure migrates through the circle of fifths; the bass keeps moving while the top voice occasionally stays still. |
| Beyond the Gate | Anathema | The speaker stops asking permission and crosses an uncertain threshold. | A suspended question becomes a rhythmically broader answer; the last return resolves the original question. |
| Threshold of Fire | My Dying Bride | A difficult decision is held until avoiding it becomes impossible. | Slow harmonic pressure, a exposed leading tone, and a rest before the decisive return. |
| Dance of Lead | Heinrich Ignaz Franz Biber, Type O Negative | A heavy, ungainly dance at a wake. Bitter humour rather than background elegance. | Angular dotted gestures and diminished pivots; short power-chord stomps answer the keyboard. The groove must limp deliberately. |
| Blackwater | My Dying Bride, Anathema | A river pulls someone under; struggling gives way to finding its current. | Long vocal arcs over a rolling compound pulse; the second half breathes where the first half pushed. |
| Pendulum of Thorns | Type O Negative | A taunting voice circles someone who finally refuses to answer. | A lopsided swung low riff, dry replies and an unexpectedly empty last response. |
| Threads of Smoke | Anathema | Trying to hold a memory that changes whenever it is named. | Legato fragments climb, break off, and return lower; the accompaniment must not fill their empty ends. |
| Light Through Lead | Anathema, Type O Negative | A slit of daylight crosses a heavy metal door. Hope without certainty. | The opening minor weight makes room for a suspended bright F-sharp over C; fewer attacks create the lift. |
| Cold Bells | Heinrich Ignaz Franz Biber | Bells from a frozen town arrive out of order across a lake. | Separate registers call across wide silences. A recognisable interval returns, but the answer changes its distance. |
| Stone Against Water | Heinrich Ignaz Franz Biber, Antonio Vivaldi | A stream repeatedly meets a stone; neither is the villain. | A square pulse and a three-against-two figure coexist. They separate, exchange material and briefly agree at the cadence. |
| Seven Shadows | My Dying Bride | A pursued walker counts seven shadows but only six footsteps. | The 2+2+3 grouping propels the pursuit; a missing attack makes the last group feel longer instead of merely odd. |
| The Broken Circle | Type O Negative | A repetitive machine is interrupted by someone finding their own voice. | Rigid 3+3+2 power chords give way to an offbeat pentatonic solo; the returning riff retains one deliberate gap. |
| House of Rain | My Dying Bride, Type O Negative | Returning to an abandoned childhood home during a storm. Each room changes the same memory. | An exposed doorway motif becomes a low riff, a remembered song, and finally a quiet fragment. Density follows the rooms. |
| Ashen Garden | Anathema, My Dying Bride | Tending a ruined garden without knowing whether anything will grow. | A breathing compound-time melody, a high appeal, then a bend that reaches rather than decorates. The last return is gentler. |
| Clockwork Winter | Antonio Vivaldi, Heinrich Ignaz Franz Biber | A frozen mechanism begins turning, jams, and eventually moves freely. | A baroque ritornello uses a recognisable rhythmic cell, contrary-motion answers and episodes that interrupt the expected cadence. |
| Two Shores | Heinrich Ignaz Franz Biber, Anathema | Two people describe the same loss from opposite sides of a river. | Guitar and keyboard begin with different versions of one question, borrow each other’s rhythms in their solos, and meet in the coda. |
| Where the Night Ends | Anathema, Antonio Vivaldi | Walking through the last hours of darkness; morning is possible but not promised. | A three-beat night motif expands into a four-beat walking song. The final opening is created by removing weight, not by adding a triumphant crash. |

## Form und Spiel

Die Stücke haben eigene Eröffnungsrhythmen, Basslinien und Drumfiguren. Wiederholung hat weiterhin eine Funktion: Ein Hook darf wiederkehren. Veränderungen stehen ausdrücklich in den Parts; eine allgemeine Oktavverschiebung oder ein zufälliger Anschlag ersetzt keine Entwicklung.

Die Gitarre bleibt Bandinstrument: Einzeltonriffs, Powerchords, Themen und ausgeschriebene Soli. Bass und Keyboard übernehmen ihr eigenes Fundament bzw. Innen- und Gegenstimmen. Die Parts enthalten gemeinsame Stopps und bewusst unbesetzte Stellen. Beim linken Keyboardthema in „Ashen Garden“ erhält die linke Hand auch in der Wiedergabe die melodische Führung.

Die Drumfiguren haben ausgeschriebene Dynamik, Akzente und stellenweise bewusst verzögerte Backbeats. Es gibt keine zufällige Timing-Streuung. Die neuen Formen, Noten und Tempi stehen in der [Stücktabelle](REPERTOIRE_PROPOSAL.md).

## Prüfung und Weiterarbeit

Spielbarkeit, vollständige Takte, Instrumentenbereiche, Noten/MIDI-Übereinstimmung, Velocity, Lernmerkmale und der Schutz der Arbeitsnotizen werden automatisch geprüft. PDF-Stichproben prüfen die Darstellung. Anschließend werden sämtliche Stücke für den [Rollenmix](audio/REPERTOIRE_MIX.md) vollständig gerendert.

Diese Prüfungen belegen technische Eigenschaften. Ob eine Szene trägt, ein Motiv hängenbleibt und eine Wiederkehr sinnvoll wirkt, ist eine musikalische Beurteilung. Dafür bleiben Absichten und Revisionsfragen in den Quellen erhalten.
