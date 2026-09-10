# a-minor

Improvisationskurs für Gitarre in Quartenstimmung (E A D G C F).

## Ziel

Improvisieren im Klang von My Dying Bride, Type O Negative, Anathema, Vivaldi und Biber. Nicht nachspielen, sondern das gemeinsame Material verinnerlichen: Moll-Modi, Pedalton, Lamento-Bass, Dreiklangsformen, Sequenzen. Rhythmische Ideen von Animals as Leaders, ohne deren Technik.

Nebenziel: Notenlesen. Keine Tabs. Hilfen (Tonnamen, Saiten, Finger) am Anfang, abschaltbar, später weg.

Der Kurs ist ein lebendes Projekt. Erster Wurf: Phase 0 und 1 vollständig, Phase 2–8 als Gerüst.

## Aufbau

| Phase | Thema |
|---|---|
| 0 | Fundament: Haltung, Griffbrett-Geometrie, Notenschrift, Rhythmus, Vibrato |
| 1 | Drone: Äolisch, Phrygisch, lange Töne, erste Transkription |
| 2 | Triaden und Terz-Parallelen |
| 3 | Lamento-Bass, Quintfall |
| 4 | Harmonisch Moll, verminderter Septakkord |
| 5 | Sequenz, Bariolage |
| 6 | Quarten, Lydisch |
| 7 | Rhythmus II: Triolen, Gruppierung, 7/8 |
| 8 | Form |

Methode pro Übung: Form lernen, singen, spielen, über Drone mit Constraint improvisieren, Referenz transkribieren, aufnehmen, einen Fehler ins Log.

## Benutzung

`index.html` im Browser öffnen. Kein Server, kein Build, keine Abhängigkeiten. Fortschritt und Log liegen in `localStorage`, Export/Import als JSON unter „Log".

Tempi sind Vorgaben pro Übung, im Player frei einstellbar. „⬇ MIDI" exportiert das Backing (Bass, Pad, Drums) für Looper oder DAW.

Tonnamen international: B = deutsches H, Bb = deutsches B.

## Übungen hinzufügen

Alles in `data/course.js`. Eine Übung ist ein Objekt im `exercises`-Array einer Einheit:

```js
{ id:'e2-1-1', kind:'read', title:'…', tempo:60, instructions:'…',
  score:{key:'Em', time:'4/4', maxFret:5, notes:[{p:'E2',d:'h'},{p:'F#2',d:'q',s:0,fi:1},{r:1,d:'q'},{p:'G2',d:'w',tie:1}]},
  generate:{root:'E', scale:'aeolian', key:'Em', range:['E2','G3'], bars:2, leap:3, durs:['q','h']},
  aids:['names','strings','fingers'],
  fretboard:{root:'E', scale:'aeolian', window:[0,2], frets:5, show:'degree', pcs:[4,7,11]},
  backing:{type:'drone', root:'E', scale:'aeolian', time:'4/4', bars:4, drums:'half', progression:['i','VII','VI','V']},
  checklist:['…'] }
```

| Feld | Bedeutung |
|---|---|
| `kind` | `read` `improv` `shape` `technique` `transcribe` |
| `score.notes` | `p` Tonhöhe klingend (E2 = tiefe E-Saite), `d` Dauer `w h q e s` mit optionalem `.`, `r:1` Pause, `tie:1` Bogen zur nächsten Note, `s` Saite 0–5 (0 = tiefes E), `fi` Finger |
| `score.maxFret` | Obergrenze für die automatische Saitenwahl der Saiten-Hilfe |
| `generate` | Ersetzt `notes` durch Zufallsfolge, Button „Neue Folge" |
| `fretboard.window` | Saitenindizes `[von, bis]`, Rest ausgegraut. `pcs` zeigt nur diese Tonklassen (0 = C) |
| `backing.type` | `drone` `loop` `click`. `progression` nur bei `loop`, Stufen römisch, Qualität aus `scale` |

Skalen: `aeolian phrygian harmonicMinor dorian major lydian chromatic`. Neue Skala in `js/music.js` unter `SCALES`.

## Dateien

```
index.html        Einstieg
css/style.css
js/music.js       Tonnamen, Skalen, Tonarten, Griffbrett-Positionen, Dreiklänge
js/fretboard.js   Griffbrett als SVG
js/notation.js    Noten als SVG, Zufallsgenerator
js/audio.js       Web-Audio-Synth, Sequencer, Backing-Builder
js/midi.js        Standard-MIDI-Export
js/store.js       localStorage
js/app.js         Router, Ansichten
data/course.js    Kursinhalt
assets/           Ursprungsdiagramm P4_Scales
```
