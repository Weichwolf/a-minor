// Gitarren-Track. Neue Übung = neues Objekt im passenden exercises-Array. Felder siehe README.
AM.tracks = AM.tracks || {};
const FI = {0:0, 1:1, 2:1, 3:2, 4:3, 5:4};
const AEOL_E = ['E2','F#2','G2','A2','B2','C3','D3','E3'];
AM.tracks.gitarre = { title:'Gitarre', instrument:'guitar', lead:'Quartenstimmung E A D G C F. Vom Blatt, ohne Tabs.', phases:[
{ id:'p0', title:'Fundament', goal:'Haltung, Anschlag, Griffbrett-Geometrie, erste Noten. Hier sitzen die alten Fehler.', units:[
  { id:'u0-1', title:'Haltung und Anschlag', goal:'Jeder Ton klingt sauber aus, bis der nächste kommt. Nichts schnarrt, nichts wird abgewürgt.',
    text:`Alles Spätere steht auf diesem Fundament. Nimm dir dafür so lange Zeit wie nötig.

- Gitarre so halten, dass beide Handgelenke fast gerade sind. Kein Abknicken.
- Greifhand: Daumen mittig hinter dem Hals, Finger gewölbt, Kuppe drückt knapp hinter dem Bund.
- Anschlag: Aus dem Handgelenk, nicht aus dem Arm. Plektrum nur 2–3 mm tief.
- Jede Übung zum Klick. Ohne Klick keine Übung.`,
    exercises:[
      { id:'e0-1-1', kind:'read', title:'Leere Saiten, ganze Noten', tempo:60,
        instructions:'Jede Saite eine ganze Note. Ton muss bis zum nächsten Anschlag klingen. Achte auf gleichmäßige Lautstärke aller Saiten.',
        score:{key:'C', time:'4/4', notes:[{p:'E2',d:'w'},{p:'A2',d:'w'},{p:'D3',d:'w'},{p:'G3',d:'w'},{p:'C4',d:'w'},{p:'F4',d:'w'}]},
        aids:['names','strings'], backing:{type:'click', time:'4/4', bars:6},
        checklist:['Klingt jede Saite gleich laut?','Bleibt das Handgelenk gerade?','Hörst du den Klick noch, während du spielst?'] },
      { id:'e0-1-2', kind:'technique', title:'Chromatik 1-2-3-4', tempo:60,
        instructions:'Bund 5–8 auf jeder Saite, ein Finger pro Bund, Viertel zum Klick. Aufwärts von E nach F, abwärts zurück. Finger bleiben liegen, bis der nächste Ton auf derselben Saite kommt. Danach dasselbe in Bund 1–4.',
        score:{key:'C', time:'4/4', maxFret:8, notes:[{p:'A2',d:'q',s:0,fi:1},{p:'Bb2',d:'q',s:0,fi:2},{p:'B2',d:'q',s:0,fi:3},{p:'C3',d:'q',s:0,fi:4},{p:'D3',d:'q',s:1,fi:1},{p:'Eb3',d:'q',s:1,fi:2},{p:'E3',d:'q',s:1,fi:3},{p:'F3',d:'q',s:1,fi:4}]},
        aids:['strings','fingers'], backing:{type:'click', time:'4/4', bars:2},
        checklist:['Bleiben die Finger liegen?','Sind alle vier Töne gleich lang?','Hast du das Tempo erhöht, obwohl es noch nicht sauber war? Dann zurück.'] },
    ]},
  { id:'u0-2', title:'Das Quarten-Griffbrett', goal:'Du siehst Intervalle als Formen, nicht als Bundzahlen. In P4-Stimmung ist jede Form überall gleich.',
    text:`Stimmung E A D G C F. Jede Saite eine reine Quarte über der vorigen. Das ist der ganze Trick: Was auf zwei Saiten funktioniert, funktioniert auf allen.

**Intervalle als Formen** (Saite darüber = 5 Halbtöne):

- kleine Sekunde: gleiche Saite, 1 Bund höher
- große Sekunde: 2 Bünde höher
- kleine Terz: 3 Bünde höher, oder nächste Saite 2 Bünde tiefer
- große Terz: nächste Saite 1 Bund tiefer
- Quarte: nächste Saite, gleicher Bund
- Quinte: nächste Saite, 2 Bünde höher
- Oktave: zwei Saiten höher, 2 Bünde höher

Merke: Terzen liegen 'schräg nach unten', Quinten 'schräg nach oben'. Das Griffbrett-Werkzeug zeigt dir jede Skala mit Stufenzahlen.`,
    exercises:[
      { id:'e0-2-1', kind:'shape', title:'Alle E finden', instructions:'Spiele jedes E auf dem Griffbrett, tief nach hoch. Sag den Bund laut. Dann ohne Anzeige aus dem Kopf.',
        fretboard:{root:'E', pcs:[4], show:'name'}, checklist:['Alle 13 E bis Bund 15 gefunden?','Siehst du das Oktav-Muster (2 Saiten hoch, 2 Bünde hoch)?'] },
      { id:'e0-2-2', kind:'shape', title:'Alle C finden', instructions:'Wie vorher mit C. Danach mit einem Ton deiner Wahl.',
        fretboard:{root:'C', pcs:[0], show:'name'}, checklist:['Ohne Anzeige geschafft?'] },
      { id:'e0-2-3', kind:'shape', title:'Quinten und Terzen', instructions:'Wähle einen Ton. Spiele Quinte (nächste Saite +2) und große Terz (nächste Saite −1) dazu. Wandere über das ganze Griffbrett. Die Form ändert sich nie.',
        fretboard:{root:'E', pcs:[4, 8, 11], show:'degree'}, checklist:['Klingt die Quinte hohl und stabil, die Terz bunt?','Kannst du die Form blind greifen?'] },
    ]},
  { id:'u0-3', title:'Notenschrift I', goal:'Stammtöne der ersten Lage vom Blatt. Keine Tabs, ab jetzt nie wieder.',
    text:`Gitarre wird im Violinschlüssel notiert und klingt eine Oktave tiefer als geschrieben. Die tiefe E-Saite liegt darum auf der dritten Hilfslinie unter dem System.

Linien von unten: E G B D F. Zwischenräume: F A C E. Wir nutzen internationale Namen: **B** ist das deutsche H, **Bb** das deutsche B.

Hilfen: Tonname unter der Note, Saitennummer im Kreis (1 = höchste Saite). Schalte sie ab, sobald es geht.`,
    exercises:[
      { id:'e0-3-1', kind:'read', title:'Leere Saiten lesen', tempo:60, instructions:'Erst lesen, Namen sagen, dann spielen. Ganze Noten.',
        score:{key:'C', time:'4/4', notes:[{p:'E2',d:'w'},{p:'A2',d:'w'},{p:'D3',d:'w'},{p:'G3',d:'w'},{p:'C4',d:'w'},{p:'F4',d:'w'},{p:'C4',d:'w'},{p:'A2',d:'w'}]},
        aids:['names','strings'], backing:{type:'click', time:'4/4', bars:8} },
      { id:'e0-3-2', kind:'read', title:'C-Dur, erste Lage', tempo:60, instructions:'Halbe Noten, aufwärts und abwärts. Fingersatz: Bund = Finger.',
        score:{key:'C', time:'4/4', notes:[{p:'C3',d:'h',fi:3},{p:'D3',d:'h',fi:0},{p:'E3',d:'h',fi:2},{p:'F3',d:'h',fi:3},{p:'G3',d:'h',fi:0},{p:'A3',d:'h',fi:2},{p:'B3',d:'h',fi:4},{p:'C4',d:'h',fi:0},{p:'B3',d:'h'},{p:'A3',d:'h'},{p:'G3',d:'h'},{p:'F3',d:'h'},{p:'E3',d:'h'},{p:'D3',d:'h'},{p:'C3',d:'w'}]},
        aids:['names','strings','fingers'], backing:{type:'click', time:'4/4', bars:8}, fretboard:{root:'C', scale:'major', frets:5, show:'name'} },
      { id:'e0-3-3', kind:'read', title:'Zufallsfolge C-Dur', tempo:50, instructions:'Neue Folge erzeugen, zuerst nur lesen und singen, dann spielen. Hilfen erst abschalten, wenn du drei Folgen fehlerfrei geschafft hast.',
        generate:{root:'C', scale:'major', key:'C', range:['E2','A3'], bars:2, leap:3, durs:['q','h']}, score:{key:'C', time:'4/4'},
        aids:['names','strings'], backing:{type:'click', time:'4/4', bars:4} },
    ]},
  { id:'u0-4', title:'Rhythmus I', goal:'Viertel, Halbe, Achtel und Pausen sicher zum Klick. Timing ist Klang.',
    text:`Doom lebt von Raum. Wer Pausen nicht halten kann, kann nicht langsam spielen. Zähle laut: 1 und 2 und 3 und 4 und.`,
    exercises:[
      { id:'e0-4-1', kind:'read', title:'Viertel und Halbe', tempo:70, instructions:'Ein Ton, nur Rhythmus. Laut mitzählen.',
        score:{key:'C', time:'4/4', notes:[{p:'E2',d:'q'},{p:'E2',d:'q'},{p:'E2',d:'h'},{p:'E2',d:'h'},{p:'E2',d:'q'},{p:'E2',d:'q'},{p:'E2',d:'w'},{p:'E2',d:'q'},{r:1,d:'q'},{p:'E2',d:'h'}]},
        backing:{type:'click', time:'4/4', bars:4} },
      { id:'e0-4-2', kind:'read', title:'Achtel und Pausen', tempo:60, instructions:'Achtel gleichmäßig, Wechselschlag. Die Pause ist ein Ton, den du nicht spielst: abdämpfen, nicht ausklingen lassen.',
        score:{key:'C', time:'4/4', notes:[{p:'A2',d:'e'},{p:'A2',d:'e'},{p:'A2',d:'q'},{p:'A2',d:'q'},{r:1,d:'q'},{p:'A2',d:'e'},{p:'A2',d:'e'},{p:'A2',d:'q'},{p:'A2',d:'e'},{p:'A2',d:'e'},{r:1,d:'e'},{p:'A2',d:'e'}]},
        backing:{type:'click', time:'4/4', bars:2}, checklist:['Ist die Pause wirklich still?','Sind die Achtel gleich lang, auch abwärts?'] },
      { id:'e0-4-3', kind:'read', title:'Dreiviertel', tempo:60, instructions:'Walzer. Betonung auf 1, leicht auf 2 und 3.',
        score:{key:'C', time:'3/4', notes:[{p:'D3',d:'q'},{p:'D3',d:'q'},{p:'D3',d:'q'},{p:'D3',d:'h'},{p:'D3',d:'q'},{p:'D3',d:'h.'},{p:'D3',d:'q'},{r:1,d:'q'},{p:'D3',d:'q'}]},
        backing:{type:'click', time:'3/4', bars:4} },
    ]},
  { id:'u0-5', title:'Vibrato und Ton', goal:'Ein einziger Ton, der trägt. Das ist die halbe Miete für My Dying Bride.',
    text:`Vibrato kommt aus dem Unterarm, nicht aus dem Finger. Langsam und weit, dann schneller. Erst gerade anspielen, dann Vibrato einsetzen. Nie sofort.`,
    exercises:[
      { id:'e0-5-1', kind:'technique', title:'Ein Ton, vier Takte', tempo:50, instructions:'G auf der D-Saite, 5. Bund, Ringfinger. Ganze Note, halten. Takt 1 gerade, Takt 2 langsames Vibrato, Takt 3 schneller, Takt 4 ausklingen. Wiederhole mit jedem Finger.',
        score:{key:'C', time:'4/4', maxFret:5, notes:[{p:'G3',d:'w',s:2,fi:3},{p:'G3',d:'w',s:2},{p:'G3',d:'w',s:2},{p:'G3',d:'w',s:2}]},
        aids:['strings','fingers'], backing:{type:'click', time:'4/4', bars:4},
        checklist:['Bleibt die Tonhöhe im Zentrum, oder wird der Ton nur höher?','Klingt der Ton vier Takte?'] },
    ]},
]},
{ id:'p1', title:'Drone', goal:'Über einem Pedalton improvisieren. Äolisch, dann Phrygisch. Lange Töne, Atmen, Raum. Doom beginnt hier.', units:[
  { id:'u1-1', title:'E-Äolisch auf einer Saite', goal:'Die Skala als Abstände auf einer Saite hören und sehen: 2-1-2-2-1-2-2.',
    text:`Nimm den Looper: E leer als Drone, oder den Player hier. Spiele nur auf der tiefen E-Saite. Du lernst die Skala als Abfolge von Ganz- und Halbtonschritten, bevor du sie als Griff lernst.`,
    exercises:[
      { id:'e1-1-1', kind:'read', title:'Skala aufwärts, halbe Noten', tempo:60, instructions:'Nur E-Saite. Halbe Noten, jeder Ton mit Vibrato ab der zweiten Zählzeit.',
        score:{key:'Em', time:'4/4', maxFret:12, notes:AEOL_E.map(p => ({p, d:'h', s:0}))},
        aids:['names','strings'], backing:{type:'click', time:'4/4', bars:4}, fretboard:{root:'E', scale:'aeolian', window:[0,0], frets:12} },
      { id:'e1-1-2', kind:'improv', title:'Nur E-Saite, nur halbe Noten', tempo:60, instructions:'Zwei Minuten. Constraint: nur E-Saite, nur halbe und ganze Noten. Beginne und ende auf E. Höre, wie b6 (C) und b3 (G) zum Drone reiben.',
        backing:{type:'click', time:'4/4', bars:4}, fretboard:{root:'E', scale:'aeolian', window:[0,0], frets:12},
        checklist:['Hast du Pausen gemacht?','Hast du auf E geendet und die Spannung gespürt, wenn du auf D oder C stehen bliebst?'] },
    ]},
  { id:'u1-2', title:'Das 3-Saiten-Fenster', goal:'E-Äolisch auf E, A, D in der ersten Lage. Die Form, die du später überall wiederverwendest.',
    text:`Drei Saiten, vier Bünde. In P4 ist diese Form auf jeder Saitengruppe identisch. Lerne sie einmal richtig.`,
    exercises:[
      { id:'e1-2-1', kind:'read', title:'Fenster aufwärts und abwärts', tempo:60, instructions:'Fingersatz: Bund 0 leer, 2 = Zeigefinger, 3 = Mittelfinger, 5 = kleiner Finger. Viertel.',
        score:{key:'Em', time:'4/4', maxFret:5, notes:[...['E2','F#2','G2','A2','B2','C3','D3','E3','F#3','G3','F#3','E3','D3','C3','B2','A2','G2','F#2'].map(p => ({p, d:'q', fi:FI[AM.music.position(AM.music.midi(p),{maxFret:5}).f]})), {p:'E2', d:'h'}]},
        aids:['strings','fingers'], backing:{type:'click', time:'4/4', bars:5}, fretboard:{root:'E', scale:'aeolian', window:[0,2], frets:5} },
      { id:'e1-2-2', kind:'improv', title:'Fenster, Viertel und Halbe', tempo:60, instructions:'Drei Minuten. Nur das Fenster. Spiele Phrasen von 2 Takten, dann 2 Takte Pause. Jede Phrase endet auf E, G oder B.',
        backing:{type:'drums', time:'4/4', bars:4}, fretboard:{root:'E', scale:'aeolian', window:[0,2], frets:5},
        checklist:['2 Takte spielen, 2 Takte Pause eingehalten?','Kannst du deine letzte Phrase wiederholen?'] },
      { id:'e1-2-3', kind:'read', title:'Zufallsfolge E-Äolisch', tempo:50, instructions:'Lesen, singen, spielen. Vorzeichen F# steht in der Tonart.',
        generate:{root:'E', scale:'aeolian', key:'Em', range:['E2','G3'], bars:2, leap:3, durs:['q','h']}, score:{key:'Em', time:'4/4'},
        aids:['strings'], backing:{type:'click', time:'4/4', bars:4} },
    ]},
  { id:'u1-3', title:'Lange Töne und Atmen', goal:'Phrasieren wie ein Sänger. Haltebögen lesen. Die Pause ist Teil der Melodie.',
    text:`My Dying Bride, Anathema: Die Gitarre singt. Jede Phrase hat einen Anfang, einen Höhepunkt, ein Ende. Atme ein, bevor du eine Phrase beginnst. Wirklich.`,
    exercises:[
      { id:'e1-3-1', kind:'read', title:'Haltebögen', tempo:55, instructions:'Gebundene Noten werden nicht neu angeschlagen. Der Ton muss durchklingen.',
        score:{key:'Em', time:'4/4', notes:[{p:'G2',d:'h'},{p:'A2',d:'h',tie:1},{p:'A2',d:'w'},{p:'B2',d:'h.'},{p:'C3',d:'q',tie:1},{p:'C3',d:'h'},{p:'B2',d:'h'},{p:'E2',d:'w',tie:1},{p:'E2',d:'w'}]},
        aids:['strings'], backing:{type:'click', time:'4/4', bars:6} },
      { id:'e1-3-2', kind:'improv', title:'Vier auf, vier ab', tempo:55, instructions:'Vier Takte spielen, vier Takte Stille. Fünf Durchgänge. Jede Phrase steigt zu einem höchsten Ton und fällt zurück. Nur Halbe und Ganze.',
        backing:{type:'click', time:'4/4', bars:8}, fretboard:{root:'E', scale:'aeolian', window:[0,2], frets:5},
        checklist:['Hat jede Phrase einen hörbaren Höhepunkt?','Hast du in der Stille wirklich nichts gespielt?'] },
    ]},
  { id:'u1-4', title:'Phrygisch: die kleine Sekunde', goal:'b2 als Farbe. Der Halbton über dem Grundton ist der dunkelste Ton in Moll.',
    text:`Äolisch mit F statt F#. Ein Ton Unterschied, komplett andere Stimmung. Type O Negative und viel Doom leben davon. Im Notenbild steht F# in der Tonart, F braucht darum ein Auflösungszeichen.`,
    exercises:[
      { id:'e1-4-1', kind:'read', title:'F gegen F#', tempo:55, instructions:'Erster Takt äolisch, zweiter phrygisch. Höre den Unterschied, bevor du weiterspielst.',
        score:{key:'Em', time:'4/4', maxFret:5, notes:[{p:'E2',d:'q'},{p:'F#2',d:'q'},{p:'G2',d:'h'},{p:'E2',d:'q'},{p:'F2',d:'q'},{p:'G2',d:'h'},{p:'F2',d:'h'},{p:'E2',d:'h'},{p:'F2',d:'w'},{p:'E2',d:'w'}]},
        aids:['names'], backing:{type:'click', time:'4/4', bars:5}, fretboard:{root:'E', scale:'phrygian', window:[0,2], frets:5} },
      { id:'e1-4-2', kind:'improv', title:'Phrygisch, langsam, mit Drums', tempo:55, instructions:'Drei Minuten, Half-time-Drums. Constraint: Jede Phrase enthält F, und F löst sich immer nach E auf. Nach unten, nie nach oben.',
        backing:{type:'drums', time:'4/4', bars:4}, fretboard:{root:'E', scale:'phrygian', window:[0,2], frets:5},
        checklist:['F immer nach E aufgelöst?','Hast du das Tempo gehalten oder bist du mit den Drums schneller geworden?'] },
    ]},
  { id:'u1-5', title:'Transkription I', goal:'Ein Motiv aus einer Referenz heraushören und aufschreiben. Nach Gehör, nicht aus Tabs.',
    text:`My Dying Bride, „The Cry of Mankind", Eröffnungsmotiv der Gitarre. Vier Töne, sehr langsam. Hilfen: Es liegt in Moll, der Grundton ist der tiefste Ton, alles im 3-Saiten-Fenster.

Ablauf: Anhören, Grundton auf der Gitarre finden, Motiv summen, Töne suchen, auf Papier in Noten schreiben. Dann im Tempo des Stücks mitspielen.`,
    exercises:[
      { id:'e1-5-1', kind:'transcribe', title:'The Cry of Mankind, Motiv', instructions:'Motiv notieren, mitspielen, dann in E transponieren und über den Drone spielen. Im Log: Grundton des Originals und die Stufen des Motivs.',
        backing:{type:'click', time:'4/4', bars:4}, checklist:['Grundton gefunden?','Motiv in Stufen benannt (z.B. 1 b3 4 b3)?','Über E-Drone spielbar?'] },
    ]},
  { id:'u1-6', title:'Bilanz Phase 1', goal:'Zwei Minuten Improvisation, aufgenommen, angehört, ein Fehler benannt.',
    text:`Nimm mit dem Handy auf. Höre es am nächsten Tag an. Schreibe ins Log genau einen Fehler, den du in Phase 2 abstellen willst. Nur einen.`,
    exercises:[
      { id:'e1-6-1', kind:'improv', title:'Zwei Minuten E-Moll', tempo:58, instructions:'Äolisch oder Phrygisch, deine Wahl. Half-time-Drums. Alles aus Phase 1: Fenster, lange Töne, Pausen, Vibrato, b2-Auflösung.',
        backing:{type:'drums', time:'4/4', bars:4}, fretboard:{root:'E', scale:'aeolian', window:[0,2], frets:12},
        checklist:['Aufgenommen?','Am nächsten Tag angehört?','Genau ein Fehler im Log?'] },
    ]},
]},
{ id:'p2', title:'Triaden', goal:'Die sieben diatonischen Dreiklänge als Formen. Umkehrungen. Terz-Parallelen.', planned:true, units:[
  { id:'u2-1', title:'Dreiklänge im Fenster', goal:'i, ii°, III, iv, v, VI, VII als Griff.', text:'Geplant.', exercises:[] },
  { id:'u2-2', title:'Umkehrungen', goal:'Grundstellung, Sext-, Quartsextakkord.', text:'Geplant.', exercises:[] },
  { id:'u2-3', title:'Terz-Parallelen', goal:'Die MDB-Signatur: zwei Stimmen in Terzen über Drone.', text:'Geplant.', exercises:[] },
]},
{ id:'p3', title:'Lamento', goal:'i–VII–VI–V und Quintfall. Akkordwechsel hören und treffen. Biber-Passacaglia als Studienobjekt.', planned:true, units:[
  { id:'u3-1', title:'Der Lamento-Bass', goal:'Vier Akkorde, die Doom und Barock teilen.', text:'Geplant.', exercises:[] },
  { id:'u3-2', title:'Quintfall', goal:'i–iv–VII–III–VI–ii°–V–i.', text:'Geplant.', exercises:[] },
  { id:'u3-3', title:'Transkription II', goal:'Type O Negative, Love You to Death.', text:'Geplant.', exercises:[] },
]},
{ id:'p4', title:'Harmonisch Moll', goal:'Leitton, Dominantseptakkord, verminderter Septakkord, Neapolitaner.', planned:true, units:[
  { id:'u4-1', title:'Der Leitton', goal:'D# in E-Moll. Spannung nach oben.', text:'Geplant.', exercises:[] },
  { id:'u4-2', title:'Verminderter Septakkord', goal:'Symmetrisch, in P4 eine einzige Form.', text:'Geplant.', exercises:[] },
  { id:'u4-3', title:'Transkription III', goal:'Vivaldi, L’estate III, Eröffnung.', text:'Geplant.', exercises:[] },
]},
{ id:'p5', title:'Sequenz', goal:'Melodische Muster durch die Skala und durch den Quintfall verschieben. Bariolage.', planned:true, units:[
  { id:'u5-1', title:'Dreier- und Vierermuster', goal:'Ein Motiv, sieben Stufen.', text:'Geplant.', exercises:[] },
  { id:'u5-2', title:'Sequenz über Quintfall', goal:'Vivaldi-Motorik.', text:'Geplant.', exercises:[] },
  { id:'u5-3', title:'Bariolage', goal:'Leere Saite gegen gegriffene Töne.', text:'Geplant.', exercises:[] },
]},
{ id:'p6', title:'Quarten und Lydisch', goal:'Quart-Diaden als Klangfarbe, Lydisch als Kontrast. Offene Harmonik ohne AAL-Technik.', planned:true, units:[
  { id:'u6-1', title:'Quart-Diaden', goal:'Ein Bund quer über zwei Saiten.', text:'Geplant.', exercises:[] },
  { id:'u6-2', title:'Lydisch', goal:'#4 als Licht.', text:'Geplant.', exercises:[] },
]},
{ id:'p7', title:'Rhythmus II', goal:'3 über 4, 5er- und 7er-Gruppen mit bekanntem Material. Half-time gegen Double-time.', planned:true, units:[
  { id:'u7-1', title:'Triolen', goal:'Lesen und fühlen.', text:'Geplant.', exercises:[] },
  { id:'u7-2', title:'Gruppierung', goal:'Dasselbe Motiv in 3, 5, 7.', text:'Geplant.', exercises:[] },
  { id:'u7-3', title:'7/8', goal:'Ungerade, aber rund.', text:'Geplant.', exercises:[] },
]},
{ id:'p8', title:'Form', goal:'Spannungsbogen, Ritornell gegen Strophe/Refrain, Dynamik, Register. Improvisation wird Stück.', planned:true, units:[
  { id:'u8-1', title:'Der Bogen', goal:'Anfang, Höhepunkt, Ende über 32 Takte.', text:'Geplant.', exercises:[] },
  { id:'u8-2', title:'Biber, Passacaglia', goal:'Ganz lesen, ganz spielen.', text:'Geplant.', exercises:[] },
]},
]};
