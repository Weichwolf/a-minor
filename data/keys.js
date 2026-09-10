// Keyboard-Track. 49 Tasten C2–C6, multitimbral. Neue Übung = neues Objekt im passenden exercises-Array. Felder siehe README.
AM.tracks = AM.tracks || {};
const RH5 = (ps, fi) => ps.map((p, i) => ({p, d:'q', fi:fi[i]}));
AM.tracks.keys = { title:'Keyboard', instrument:'keys', lead:'49 Tasten, zwei Hände, mehrere Parts. Drone links, Melodie rechts.', phases:[
{ id:'k0', title:'Fundament', goal:'Sitz, Anschlag, Klaviatur-Geometrie, beide Schlüssel, Sound-Setup. Weiße Tasten zuerst.', units:[
  { id:'ku0-1', title:'Sitz und Hand', goal:'Runde Hand, lockeres Handgelenk, jeder Finger schlägt gleich laut an.',
    text:`Sitzhöhe so, dass die Unterarme waagerecht liegen. Hand wie über einem Apfel gewölbt. Finger schlagen aus dem Grundgelenk, nicht aus dem Arm.

Fingersatz-Zahlen: 1 = Daumen, 5 = kleiner Finger, beide Hände. Steht über der Note.

- Handgelenk nie tiefer als die Tastenoberkante
- Nach jedem Ton loslassen, außer es steht ein Bogen
- Jede Übung zum Klick`,
    exercises:[
      { id:'ke0-1-1', kind:'read', title:'Fünffingerlage A-Moll, rechte Hand', tempo:60, instructions:'Daumen auf A. Viertel, jeder Finger einzeln, gleich laut. Auf und ab.',
        score:{key:'Am', time:'4/4', notes:[...RH5(['A4','B4','C5','D5','E5'], [1,2,3,4,5]), ...RH5(['D5','C5','B4'], [4,3,2]), {p:'A4', d:'w', fi:1}]},
        aids:['names','fingers'], backing:{type:'click', time:'4/4', bars:3}, checklist:['Alle fünf Töne gleich laut?','Bleibt die Hand rund, auch beim kleinen Finger?'] },
      { id:'ke0-1-2', kind:'read', title:'Fünffingerlage A-Moll, linke Hand', tempo:60, instructions:'Kleiner Finger auf A. Bassschlüssel. Gleiche Regeln.',
        score:{key:'Am', time:'4/4', clef:'bass', notes:[...RH5(['A2','B2','C3','D3','E3'], [5,4,3,2,1]), ...RH5(['D3','C3','B2'], [2,3,4]), {p:'A2', d:'w', fi:5}]},
        aids:['names','fingers'], backing:{type:'click', time:'4/4', bars:3} },
    ]},
  { id:'ku0-2', title:'Sound-Setup', goal:'Ein Setup, das für den ganzen Kurs trägt: Pad links, Lead rechts, Drums von außen.',
    text:`Ein multitimbrales Keyboard spielt mehrere Sounds gleichzeitig, jeder auf einem eigenen Part und MIDI-Kanal. Wir brauchen drei Dinge:

- **Part 1, Kanal 1, Split unten (C2–B3):** Pad oder Streicher. Langsamer Einschwinger, langes Ausklingen. Das ist der Drone.
- **Part 2, Kanal 2, Split oben (C4–C6):** Klavier, E-Piano oder Lead. Klarer Anschlag, damit Phrasierung hörbar bleibt.
- **Kanal 10:** Drums. Kommen aus dem Backing-Player per MIDI-Out, entweder an den Drumcomputer oder an ein Drum-Part des Keyboards.

Splitpunkt C4. Sustain-Pedal auf Part 2, nicht auf Part 1. Der Drone hält von selbst, das Pedal würde ihn nur verschmieren.

Speicher das als Performance. Ab jetzt ist das dein Startpunkt.`,
    exercises:[
      { id:'ke0-2-1', kind:'sound', title:'Performance anlegen', instructions:'Setup wie beschrieben. Test: Linke Hand hält E2 und B2, rechte Hand spielt E-Moll darüber. Drums vom Player auf Kanal 10.',
        backing:{type:'drums', time:'4/4', bars:4}, piano:{root:'E', scale:'aeolian', show:'degree'},
        checklist:['Hält der Drone ohne Pedal?','Trennt der Split sauber bei C4?','Kommt der Klick auf dem richtigen Gerät an?','Performance gespeichert?'] },
    ]},
  { id:'ku0-3', title:'Klaviatur-Geometrie', goal:'Intervalle als Tastenabstände. A-Moll sind die weißen Tasten, E-Moll hat eine schwarze, D-Moll eine andere.',
    text:`Die Klaviatur ist nicht symmetrisch wie das Quarten-Griffbrett. Jede Tonart hat ihre eigene Form. Darum bleiben wir bei A, E und D: drei Formen, maximal eine schwarze Taste.

Halbtonschritt: benachbarte Taste, egal welche Farbe. Ganztonschritt: eine Taste dazwischen. Die Skala äolisch: 2-1-2-2-1-2-2.`,
    exercises:[
      { id:'ke0-3-1', kind:'keys', title:'A-Moll: weiße Tasten', instructions:'Über alle vier Oktaven mit beiden Händen spielen. Stufen laut mitsagen. Dann mit Anzeige „Namen".',
        piano:{root:'A', scale:'aeolian', show:'degree'}, checklist:['Stufen ohne Anzeige benennbar?','Wo liegt die b6 (F)? Wo die b2 wäre, wenn es phrygisch wäre?'] },
      { id:'ke0-3-2', kind:'keys', title:'E-Moll: ein F#', instructions:'Dieselbe Übung. Der Daumen meidet die schwarze Taste, das bestimmt später den Fingersatz.',
        piano:{root:'E', scale:'aeolian', show:'degree'} },
      { id:'ke0-3-3', kind:'keys', title:'D-Moll: ein Bb', instructions:'Dieselbe Übung.', piano:{root:'D', scale:'aeolian', show:'degree'} },
      { id:'ke0-3-4', kind:'keys', title:'Quinten und Terzen', instructions:'A und E gleichzeitig: Quinte, sieben Halbtöne, für die linke Hand 1 und 5. A und C: kleine Terz. A und C#: große Terz. Über die Klaviatur wandern, Form merken.',
        piano:{root:'A', pcs:[9, 0, 4], show:'degree', window:['C2','B3']}, checklist:['Quinte blind mit 5–1 greifbar?'] },
    ]},
  { id:'ku0-4', title:'Notenschrift I', goal:'Beide Schlüssel, Stammtöne um das mittlere C. Keine Tabs gab es hier nie, aber auch keine Akkordsymbole.',
    text:`Rechte Hand liest den Violinschlüssel, linke Hand den Bassschlüssel. Das mittlere C (C4) liegt in beiden auf einer Hilfslinie: unter dem Violinsystem, über dem Basssystem. Von dort aus lesen.

Bassschlüssel Linien von unten: G B D F A. Zwischenräume: A C E G.

Internationale Namen: **B** ist das deutsche H, **Bb** das deutsche B.`,
    exercises:[
      { id:'ke0-4-1', kind:'read', title:'Beide Hände vom mittleren C', tempo:60, instructions:'Rechte Hand aufwärts, linke Hand spiegelbildlich abwärts. Halbe Noten.',
        score:{key:'C', time:'4/4', notes:[{p:'C4',d:'h',fi:1},{p:'D4',d:'h',fi:2},{p:'E4',d:'h',fi:3},{p:'F4',d:'h',fi:4},{p:'G4',d:'h',fi:5},{p:'F4',d:'h',fi:4},{p:'E4',d:'h',fi:3},{p:'D4',d:'h',fi:2},{p:'C4',d:'w',fi:1}],
          bass:[{p:'C4',d:'h',fi:1},{p:'B3',d:'h',fi:2},{p:'A3',d:'h',fi:3},{p:'G3',d:'h',fi:4},{p:'F3',d:'h',fi:5},{p:'G3',d:'h',fi:4},{p:'A3',d:'h',fi:3},{p:'B3',d:'h',fi:2},{p:'C4',d:'w',fi:1}]},
        aids:['names','fingers'], backing:{type:'click', time:'4/4', bars:5} },
      { id:'ke0-4-2', kind:'read', title:'Zufallsfolge Violinschlüssel', tempo:50, instructions:'Neue Folge, lesen, singen, spielen. Rechte Hand.',
        generate:{root:'C', scale:'major', key:'C', range:['C4','A5'], bars:2, leap:3, durs:['q','h']}, score:{key:'C', time:'4/4'},
        aids:['names'], backing:{type:'click', time:'4/4', bars:2} },
      { id:'ke0-4-3', kind:'read', title:'Zufallsfolge Bassschlüssel', tempo:50, instructions:'Linke Hand. Der Bassschlüssel muss genauso schnell gehen wie der Violinschlüssel, sonst hinkt die linke Hand ein Leben lang.',
        generate:{root:'C', scale:'major', key:'C', range:['C2','E4'], bars:2, leap:3, durs:['q','h']}, score:{key:'C', time:'4/4', clef:'bass'},
        aids:['names'], backing:{type:'click', time:'4/4', bars:2} },
    ]},
  { id:'ku0-5', title:'Rhythmus I', goal:'Zwei Hände, zwei Rhythmen. Links hält, rechts bewegt sich.',
    text:`Die Unabhängigkeit der Hände ist am Keyboard das, was am Griffbrett die Quartenstimmung ist: das Fundament für alles. Links ganze Noten, rechts Viertel. Laut zählen.`,
    exercises:[
      { id:'ke0-5-1', kind:'read', title:'Ganze gegen Viertel', tempo:60, instructions:'Links A2, ganze Noten. Rechts A4 und E5 im Wechsel, Viertel. Dann Rollen tauschen.',
        score:{key:'Am', time:'4/4', notes:[{p:'A4',d:'q'},{p:'E5',d:'q'},{p:'A4',d:'q'},{p:'E5',d:'q'},{p:'A4',d:'q'},{r:1,d:'q'},{p:'E5',d:'h'}], bass:[{p:'A2',d:'w'},{p:'A2',d:'w'}]},
        backing:{type:'click', time:'4/4', bars:2} },
      { id:'ke0-5-2', kind:'read', title:'Achtel und Pausen', tempo:60, instructions:'Rechte Hand allein. Die Pause ist still: Finger hoch.',
        score:{key:'Am', time:'4/4', notes:[{p:'A4',d:'e'},{p:'A4',d:'e'},{p:'A4',d:'q'},{p:'A4',d:'q'},{r:1,d:'q'},{p:'A4',d:'e'},{p:'A4',d:'e'},{p:'A4',d:'q'},{p:'A4',d:'e'},{p:'A4',d:'e'},{r:1,d:'e'},{p:'A4',d:'e'}]},
        backing:{type:'click', time:'4/4', bars:2} },
      { id:'ke0-5-3', kind:'read', title:'Dreiviertel, beide Hände', tempo:60, instructions:'Links punktierte Halbe, rechts Viertel.',
        score:{key:'Am', time:'3/4', notes:[{p:'A4',d:'q'},{p:'C5',d:'q'},{p:'E5',d:'q'},{p:'C5',d:'h'},{r:1,d:'q'},{p:'A4',d:'h.'}], bass:[{p:'A2',d:'h.'},{p:'E2',d:'h.'},{p:'A2',d:'h.'}]},
        backing:{type:'click', time:'3/4', bars:3} },
    ]},
  { id:'ku0-6', title:'Anschlag und Pedal', goal:'Dynamik ist am Keyboard der Ersatz für Vibrato. Pedal ist Klang, nicht Krücke.',
    text:`Ein Ton von leise bis laut, dann von laut bis leise, ohne Sprung. Danach Pedal: Ton anschlagen, dann Pedal treten, nicht gleichzeitig. Wechsel beim nächsten Ton, kurz loslassen, wieder treten.`,
    exercises:[
      { id:'ke0-6-1', kind:'technique', title:'Crescendo auf einem Ton', tempo:50, instructions:'E4, acht Viertel, jeder lauter als der vorige. Dann acht leiser. Ohne Sprung.',
        score:{key:'Am', time:'4/4', notes:Array.from({length:8}, () => ({p:'E4', d:'q'}))}, backing:{type:'click', time:'4/4', bars:2},
        checklist:['Acht hörbar verschiedene Stufen?','Der leiseste Ton noch klar angeschlagen?'] },
      { id:'ke0-6-2', kind:'technique', title:'Pedalwechsel', tempo:50, instructions:'Ganze Noten A4, C5, E5, A4. Pedal nach jedem Anschlag treten. Kein Ton darf in den nächsten hineinklingen.',
        score:{key:'Am', time:'4/4', notes:[{p:'A4',d:'w'},{p:'C5',d:'w'},{p:'E5',d:'w'},{p:'A4',d:'w'}]}, backing:{type:'click', time:'4/4', bars:4},
        checklist:['Klingt zwischen zwei Tönen ein Matsch? Dann Pedal zu spät gelöst.'] },
    ]},
]},
{ id:'k1', title:'Drone', goal:'Linke Hand hält, rechte Hand singt. Äolisch, dann Phrygisch. Erste zweistimmige Sätze.', units:[
  { id:'ku1-1', title:'Die Quinte links', goal:'E2 und B2 als Pad. Darüber E-Äolisch mit der rechten Hand.',
    text:`Linke Hand: 5 auf E2, 1 auf B2, liegen lassen. Pad-Sound. Das ist dein Drone für den Rest der Phase. Der Player kann ihn ersetzen, wenn du beide Hände für anderes brauchst.

Rechte Hand: E-Äolisch in der Lage E4–E5. Fingersatz 1-2-3-1-2-3-4-5, Daumenuntersatz nach dem G.`,
    exercises:[
      { id:'ke1-1-1', kind:'read', title:'E-Äolisch über Quinte', tempo:60, instructions:'Links die Quinte, gebunden, hält durch. Rechts halbe Noten mit Fingersatz.',
        score:{key:'Em', time:'4/4', notes:[{p:'E4',d:'h',fi:1},{p:'F#4',d:'h',fi:2},{p:'G4',d:'h',fi:3},{p:'A4',d:'h',fi:1},{p:'B4',d:'h',fi:2},{p:'C5',d:'h',fi:3},{p:'D5',d:'h',fi:4},{p:'E5',d:'h',fi:5,tie:1},{p:'E5',d:'w'}],
          bass:[{p:['E2','B2'],d:'w',fi:[5,1],tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w'}]},
        aids:['names','fingers'], backing:{type:'click', time:'4/4', bars:5}, piano:{root:'E', scale:'aeolian', show:'degree', window:['C4','C6']} },
      { id:'ke1-1-2', kind:'improv', title:'Nur Halbe, nur eine Lage', tempo:60, instructions:'Zwei Minuten. Links hält. Rechts nur halbe und ganze Noten, nur E4–E5. Beginne und ende auf E. Höre die Reibung von C (b6) gegen B im Drone.',
        backing:{type:'click', time:'4/4', bars:4}, piano:{root:'E', scale:'aeolian', show:'degree', window:['C4','C6']},
        checklist:['Hat der Drone durchgehalten?','Pausen gemacht?','Auf E geendet?'] },
    ]},
  { id:'ku1-2', title:'Lange Töne und Atmen', goal:'Phrasieren wie ein Sänger. Anathema am Klavier: wenig Töne, viel Gewicht.',
    text:`Jede Phrase: leise beginnen, zum höchsten Ton hin lauter werden, zurücknehmen. Pedal pro Phrase, nicht pro Ton. Zwischen den Phrasen: Hände weg, atmen.`,
    exercises:[
      { id:'ke1-2-1', kind:'read', title:'Haltebögen über Drone', tempo:55, instructions:'Bögen nicht neu anschlagen. Dynamik zum C5 hin aufbauen.',
        score:{key:'Em', time:'4/4', notes:[{p:'G4',d:'h'},{p:'A4',d:'h',tie:1},{p:'A4',d:'w'},{p:'B4',d:'h.'},{p:'C5',d:'q',tie:1},{p:'C5',d:'h'},{p:'B4',d:'h'},{p:'E4',d:'w',tie:1},{p:'E4',d:'w'}],
          bass:[{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w'}]},
        aids:['names'], backing:{type:'click', time:'4/4', bars:6} },
      { id:'ke1-2-2', kind:'improv', title:'Vier auf, vier ab', tempo:55, instructions:'Vier Takte Phrase, vier Takte nur Drone. Fünf Durchgänge. Jede Phrase hat einen Höhepunkt, dynamisch und in der Tonhöhe.',
        backing:{type:'click', time:'4/4', bars:8}, piano:{root:'E', scale:'aeolian', show:'degree', window:['C4','C6']},
        checklist:['Höhepunkt hörbar?','In den vier leeren Takten wirklich nichts gespielt?'] },
    ]},
  { id:'ku1-3', title:'Terzen rechts', goal:'Zwei Stimmen in der rechten Hand. Die Gothic-Farbe schlechthin.',
    text:`Terzen in der Skala: Finger 1 und 3, oder 2 und 4, oder 3 und 5. Die Terz wechselt zwischen groß und klein, je nach Stufe. Das ist gewollt, das ist der Klang. Links hält weiter die Quinte.`,
    exercises:[
      { id:'ke1-3-1', kind:'read', title:'Terzen durch E-Äolisch', tempo:55, instructions:'Halbe Noten, Terzen mit 1–3, aufwärts von E4. Pedal pro Takt.',
        score:{key:'Em', time:'4/4', notes:[{p:['E4','G4'],d:'h'},{p:['F#4','A4'],d:'h'},{p:['G4','B4'],d:'h'},{p:['A4','C5'],d:'h'},{p:['B4','D5'],d:'h'},{p:['C5','E5'],d:'h'},{p:['B4','D5'],d:'h'},{p:['A4','C5'],d:'h'},{p:['G4','B4'],d:'h'},{p:['F#4','A4'],d:'h'},{p:['E4','G4'],d:'w'}],
          bass:[{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w'}]},
        aids:['names'], backing:{type:'click', time:'4/4', bars:6}, piano:{root:'E', scale:'aeolian', show:'degree', window:['C4','C6']},
        checklist:['Beide Töne der Terz gleich laut?','Welche Terzen sind groß, welche klein? Nenne sie.'] },
      { id:'ke1-3-2', kind:'improv', title:'Terzen-Phrasen', tempo:55, instructions:'Drei Minuten. Nur Terzen rechts, nur Halbe und Ganze. Half-time-Drums. Jede Phrase endet auf E–G oder G–B.',
        backing:{type:'drums', time:'4/4', bars:4}, piano:{root:'E', scale:'aeolian', show:'degree', window:['C4','C6']} },
    ]},
  { id:'ku1-4', title:'Phrygisch: die kleine Sekunde', goal:'F statt F#. Ein Ton, komplett andere Stimmung. Type O Negative lebt davon.',
    text:`Im Notenbild steht F# in der Tonart, F braucht ein Auflösungszeichen. Am Keyboard rutscht der zweite Finger von der schwarzen auf die weiße Taste. Die b2 löst sich nach unten auf. Immer.`,
    exercises:[
      { id:'ke1-4-1', kind:'read', title:'F gegen F#', tempo:55, instructions:'Erster Takt äolisch, zweiter phrygisch. Anhalten, hören, dann weiter.',
        score:{key:'Em', time:'4/4', notes:[{p:'E4',d:'q'},{p:'F#4',d:'q'},{p:'G4',d:'h'},{p:'E4',d:'q'},{p:'F4',d:'q'},{p:'G4',d:'h'},{p:'F4',d:'h'},{p:'E4',d:'h'},{p:'F4',d:'w'},{p:'E4',d:'w'}],
          bass:[{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w',tie:1},{p:['E2','B2'],d:'w'}]},
        aids:['names'], backing:{type:'click', time:'4/4', bars:5}, piano:{root:'E', scale:'phrygian', show:'degree', window:['C4','C6']} },
      { id:'ke1-4-2', kind:'improv', title:'Phrygisch mit Drums', tempo:55, instructions:'Drei Minuten. Jede Phrase enthält F, und F geht immer nach E. Terzen erlaubt.',
        backing:{type:'drums', time:'4/4', bars:4}, piano:{root:'E', scale:'phrygian', show:'degree', window:['C4','C6']},
        checklist:['F immer nach E aufgelöst?','Tempo gehalten?'] },
    ]},
  { id:'ku1-5', title:'Transkription I', goal:'Ein Klaviermotiv aus einer Referenz heraushören und aufschreiben.',
    text:`Type O Negative, „Love You to Death", Klavier-Intro. Wenige Töne, Moll, langsam. Grundton finden, Motiv summen, Töne suchen, in beiden Schlüsseln auf Papier notieren. Dann im Originaltempo mitspielen.`,
    exercises:[
      { id:'ke1-5-1', kind:'transcribe', title:'Love You to Death, Intro', instructions:'Motiv notieren, mitspielen, nach E transponieren, über den Drone spielen. Im Log: Grundton des Originals und die Stufen.',
        backing:{type:'click', time:'4/4', bars:4}, checklist:['Grundton gefunden?','Stufen benannt?','Nach E übertragen?'] },
    ]},
  { id:'ku1-6', title:'Bilanz Phase 1', goal:'Zwei Minuten, aufgenommen, ein Fehler im Log.',
    text:`Aufnehmen, am nächsten Tag anhören, genau einen Fehler eintragen.`,
    exercises:[
      { id:'ke1-6-1', kind:'improv', title:'Zwei Minuten E-Moll', tempo:58, instructions:'Links Drone oder Player, rechts alles aus Phase 1: lange Töne, Terzen, Phrygisch, Dynamik, Pedal.',
        backing:{type:'drums', time:'4/4', bars:4}, piano:{root:'E', scale:'aeolian', show:'degree'},
        checklist:['Aufgenommen?','Angehört?','Ein Fehler im Log?'] },
    ]},
]},
{ id:'k2', title:'Triaden', goal:'Dreiklänge in beiden Händen, Umkehrungen, Stimmführung. Hier ist das Keyboard der Gitarre überlegen.', planned:true, units:[
  { id:'ku2-1', title:'Diatonische Dreiklänge', goal:'i bis VII in Grundstellung.', text:'Geplant.', exercises:[] },
  { id:'ku2-2', title:'Umkehrungen', goal:'Kleinste Bewegung zwischen zwei Akkorden.', text:'Geplant.', exercises:[] },
  { id:'ku2-3', title:'Stimmführung', goal:'Gemeinsame Töne liegen lassen.', text:'Geplant.', exercises:[] },
]},
{ id:'k3', title:'Lamento und Generalbass I', goal:'i–VII–VI–V, Quintfall, erste Generalbass-Ziffern. Biber-Passacaglia als Bassmodell.', planned:true, units:[
  { id:'ku3-1', title:'Der Lamento-Bass', goal:'Links die vier Töne, rechts die Akkorde.', text:'Geplant.', exercises:[] },
  { id:'ku3-2', title:'Quintfall', goal:'Acht Akkorde, jede Hand ihre Aufgabe.', text:'Geplant.', exercises:[] },
  { id:'ku3-3', title:'Generalbass: 5, 6, 6/4', goal:'Ziffern lesen, Akkord greifen.', text:'Geplant.', exercises:[] },
]},
{ id:'k4', title:'Harmonisch Moll und Generalbass II', goal:'Leitton, Dominantseptakkord, verminderter Septakkord, Neapolitaner. Ziffern mit Vorzeichen.', planned:true, units:[
  { id:'ku4-1', title:'Der Leitton', goal:'D# in E-Moll.', text:'Geplant.', exercises:[] },
  { id:'ku4-2', title:'Verminderter Septakkord', goal:'Vier Auflösungen.', text:'Geplant.', exercises:[] },
  { id:'ku4-3', title:'Generalbass: 7, #, b', goal:'Vivaldi-Continuo.', text:'Geplant.', exercises:[] },
]},
{ id:'k5', title:'Sequenz und Figuration', goal:'Muster durch die Skala, Alberti-Bass, gebrochene Akkorde. Vivaldi in den Fingern.', planned:true, units:[
  { id:'ku5-1', title:'Dreier- und Vierermuster', goal:'Ein Motiv, sieben Stufen.', text:'Geplant.', exercises:[] },
  { id:'ku5-2', title:'Gebrochene Akkorde', goal:'Alberti und Arpeggio.', text:'Geplant.', exercises:[] },
  { id:'ku5-3', title:'Sequenz über Quintfall', goal:'Beide Hände.', text:'Geplant.', exercises:[] },
]},
{ id:'k6', title:'Quarten, Lydisch, Layer', goal:'Quartakkorde, Lydisch als Kontrast, mehrere Parts übereinander.', planned:true, units:[
  { id:'ku6-1', title:'Quartakkorde', goal:'Offen, schwebend.', text:'Geplant.', exercises:[] },
  { id:'ku6-2', title:'Lydisch', goal:'#4 als Licht.', text:'Geplant.', exercises:[] },
  { id:'ku6-3', title:'Layer und Split', goal:'Multitimbral als Kompositionsmittel.', text:'Geplant.', exercises:[] },
]},
{ id:'k7', title:'Rhythmus II', goal:'Triolen, Gruppierung, 7/8. Hände gegeneinander.', planned:true, units:[
  { id:'ku7-1', title:'Triolen', goal:'Lesen und fühlen.', text:'Geplant.', exercises:[] },
  { id:'ku7-2', title:'Gruppierung', goal:'Dasselbe Motiv in 3, 5, 7.', text:'Geplant.', exercises:[] },
  { id:'ku7-3', title:'Hände gegeneinander', goal:'3 gegen 2, 3 gegen 4.', text:'Geplant.', exercises:[] },
]},
{ id:'k8', title:'Form', goal:'Spannungsbogen, Ritornell, Dynamik, Register. Improvisation wird Stück.', planned:true, units:[
  { id:'ku8-1', title:'Der Bogen', goal:'32 Takte mit Anfang, Höhepunkt, Ende.', text:'Geplant.', exercises:[] },
  { id:'ku8-2', title:'Biber, Passacaglia', goal:'Bass links, Variationen rechts.', text:'Geplant.', exercises:[] },
]},
]};
