// Backing-Templates. Jede Variation ist eine Player-Konfiguration. Stufen: römisch, Qualität aus der Skala; erzwingen mit :maj :min :dim.
AM.backings = [
{ id:'drone', title:'Drone', what:'Ein Grundton, Quinte und Oktave darüber, durchgehend. Keine Akkordwechsel.',
  why:'Jeder Ton, den du spielst, bekommt seine Bedeutung vom Grundton. Die b2 reibt, die 5 ruht, die b6 zieht nach unten. Du hörst Stufen statt Töne. Modale Musik, indische Klassik, Drone-Doom: alles steht auf diesem Prinzip. Der Modus entscheidet die Farbe, der Drone bleibt gleich.',
  variations:[
    { title:'E Äolisch', note:'Die Standardfarbe. My Dying Bride, Anathema.', cfg:{type:'drone', root:'E', scale:'aeolian', time:'4/4', bars:4, drums:'off', tempo:60} },
    { title:'E Phrygisch', note:'Ein Ton anders, F statt F#. Dunkler, spanischer, Type O Negative.', cfg:{type:'drone', root:'E', scale:'phrygian', time:'4/4', bars:4, drums:'half', tempo:55} },
    { title:'A Dorisch', note:'Große Sexte in Moll. Weniger schwer, mehr Anathema und Pink Floyd.', cfg:{type:'drone', root:'A', scale:'dorian', time:'4/4', bars:4, drums:'half', tempo:66} },
  ]},
{ id:'lamento', title:'Lamento-Bass', what:'i–VII–VI–V. Der Bass fällt stufenweise vom Grundton zur Quinte.',
  why:'Der abwärts gehende Bass ist seit dem 17. Jahrhundert das Zeichen für Klage. Biber, Purcell, Monteverdi. Type O Negative „Black No. 1" ist harmonisch dasselbe Objekt. Der Schritt VI–V ist ein Halbton und erzeugt die Spannung, V–i die Auflösung. In reinem Äolisch ist v Moll und weich, in harmonisch Moll wird V Dur und schiebt.',
  variations:[
    { title:'E Äolisch, weich', note:'v als Mollakkord. Kein Leitton, alles bleibt dunkel.', cfg:{type:'loop', root:'E', scale:'aeolian', progression:['i','VII','VI','v'], time:'4/4', bars:4, drums:'half', tempo:60} },
    { title:'E mit Dur-V', note:'V erzwungen Dur. Der Leitton D# will nach E. Barock und Doom zugleich.', cfg:{type:'loop', root:'E', scale:'aeolian', progression:['i','VII','VI','V:maj'], time:'4/4', bars:4, drums:'half', tempo:60} },
    { title:'D Passacaglia 3/4', note:'Bibers Passacaglia-Modell im Dreiertakt. Jeder Akkord ein Takt, endlos.', cfg:{type:'loop', root:'D', scale:'aeolian', progression:['i','VII','VI','V:maj'], time:'3/4', bars:4, drums:'off', tempo:72} },
  ]},
{ id:'quintfall', title:'Quintfall', what:'Jeder Akkord liegt eine Quinte unter dem vorigen: i–iv–VII–III–VI–ii°–V–i.',
  why:'Die stärkste Grundtonbewegung, die es gibt. Jeder Akkord wirkt wie die Dominante des nächsten. Vivaldi baut ganze Sätze daraus, Sequenzen laufen wie auf Schienen darüber. Acht Akkorde, dann bist du wieder zu Hause. Melodisch: Ein Motiv, das du auf i spielst, funktioniert auf jedem Akkord eine Stufe versetzt.',
  variations:[
    { title:'E Äolisch', note:'Rein diatonisch, v bleibt Moll.', cfg:{type:'loop', root:'E', scale:'aeolian', progression:['i','iv','VII','III','VI','ii°','v','i'], time:'4/4', bars:8, drums:'straight', tempo:80} },
    { title:'E mit Dur-V', note:'Letzter Schritt mit Leitton. Barocke Kadenz.', cfg:{type:'loop', root:'E', scale:'aeolian', progression:['i','iv','VII','III','VI','ii°','V:maj','i'], time:'4/4', bars:8, drums:'straight', tempo:80} },
    { title:'C Dur, Vivaldi', note:'Derselbe Fall in Dur: I–IV–vii°–iii–vi–ii–V–I. Sommer, dritter Satz.', cfg:{type:'loop', root:'C', scale:'major', progression:['I','IV','vii°','iii','vi','ii','V','I'], time:'4/4', bars:8, drums:'straight', tempo:96} },
  ]},
{ id:'phrygisch', title:'Phrygischer Vamp', what:'i–bII. Grundton und der Dur-Akkord einen Halbton darüber.',
  why:'bII ist der dunkelste Akkord, den Moll hergibt. Er teilt keinen Ton mit i und liegt einen Halbton daneben. Flamenco, Metal, Type O. Die Auflösung geht immer abwärts, bII nach i. Wer aufwärts auflöst, klingt nach Dur.',
  variations:[
    { title:'E: i–bII', note:'Zwei Akkorde, je zwei Takte.', cfg:{type:'loop', root:'E', scale:'phrygian', progression:[{deg:0, bars:2}, {deg:1, bars:2}], time:'4/4', bars:4, drums:'half', tempo:56} },
    { title:'E: i–bII–i–VII', note:'VII als Ausweg nach oben, dann zurück.', cfg:{type:'loop', root:'E', scale:'phrygian', progression:['i','II','i','VII'], time:'4/4', bars:4, drums:'half', tempo:56} },
    { title:'E in 7/8', note:'Ungerade, langsam. Ein Takt i, ein Takt bII. Zähle 2+2+3.', cfg:{type:'loop', root:'E', scale:'phrygian', progression:['i','II'], time:'7/8', bars:2, drums:'straight', tempo:70} },
  ]},
{ id:'doomvamp', title:'Doom-Vamp', what:'i–VI, oder i–VI–VII. Grundton und die Dur-Akkorde auf b6 und b7.',
  why:'VI und VII sind in Moll Dur-Akkorde. VI teilt zwei Töne mit i, klingt also verwandt und trotzdem heller. VII führt als Ganzton zurück nach i, ohne Leitton. Das ist die Kadenz des Rock und des Doom: schwer, ohne barocke Schärfe. Melodisch bleibt alles in Äolisch.',
  variations:[
    { title:'E: i–VI', note:'Zwei Akkorde, ewig. Type O Negative.', cfg:{type:'loop', root:'E', scale:'aeolian', progression:[{deg:0, bars:2}, {deg:5, bars:2}], time:'4/4', bars:4, drums:'half', tempo:58} },
    { title:'E: i–VI–VII', note:'Aufwärts, dann Ganzton-Rückkehr.', cfg:{type:'loop', root:'E', scale:'aeolian', progression:['i','i','VI','VII'], time:'4/4', bars:4, drums:'half', tempo:58} },
    { title:'A: i–III–VII–VI', note:'Anathema-Farbe. Vier Akkorde, alle diatonisch, kein einziger Leitton.', cfg:{type:'loop', root:'A', scale:'aeolian', progression:['i','III','VII','VI'], time:'4/4', bars:4, drums:'straight', tempo:72} },
  ]},
{ id:'dorisch', title:'Dorischer Vamp', what:'i–IV in Dorisch. Moll-Grundton, Dur-Subdominante.',
  why:'Die große Sexte macht IV zum Dur-Akkord. Das ist die Farbe von „Fragile Dreams", von Santana, von Pink Floyd. Weniger schwer als Äolisch, weil die b6 fehlt, die nach unten zieht. Für lange Soli der angenehmste Modus: alles liegt gut, nichts drängt.',
  variations:[
    { title:'A: i–IV', note:'Zwei Takte, zwei Takte.', cfg:{type:'loop', root:'A', scale:'dorian', progression:[{deg:0, bars:2}, {deg:3, bars:2}], time:'4/4', bars:4, drums:'straight', tempo:72} },
    { title:'A: i–IV–VII', note:'VII als Ganzton-Rückkehr wie im Doom-Vamp.', cfg:{type:'loop', root:'A', scale:'dorian', progression:['i','IV','VII','i'], time:'4/4', bars:4, drums:'straight', tempo:72} },
    { title:'E Dorisch 6/8', note:'Schwingend. Anathema-Balladen.', cfg:{type:'loop', root:'E', scale:'dorian', progression:['i','IV'], time:'6/8', bars:2, drums:'half', tempo:60} },
  ]},
{ id:'harmonisch', title:'Harmonisch Moll', what:'Kadenzen mit erhöhter Septime: V7 und vii° drängen nach i.',
  why:'Der Leitton ist der Unterschied zwischen Modal und Tonal. Ohne ihn schwebt Moll, mit ihm zielt es. Vivaldi und Biber sind ohne Leitton nicht denkbar. Der verminderte Akkord auf vii besteht nur aus kleinen Terzen und ist symmetrisch: Jede Umkehrung ist wieder ein verminderter Akkord. Über V und vii° spielst du harmonisch Moll, über alles andere äolisch.',
  variations:[
    { title:'E: i–iv–V–i', note:'Die Grundkadenz. iv Moll, V Dur.', cfg:{type:'loop', root:'E', scale:'harmonicMinor', progression:['i','iv','V','i'], time:'4/4', bars:4, drums:'half', tempo:60} },
    { title:'E: i–VI–vii°–i', note:'Verminderter Akkord als Dominantersatz.', cfg:{type:'loop', root:'E', scale:'harmonicMinor', progression:['i','VI','vii°','i'], time:'4/4', bars:4, drums:'half', tempo:60} },
    { title:'D: Neapolitaner', note:'i–bII–V–i. Der Dur-Akkord auf der b2 vor der Dominante. Dunkelste barocke Wendung.', cfg:{type:'loop', root:'D', scale:'harmonicMinor', progression:['i','II:maj','V','i'], time:'3/4', bars:4, drums:'off', tempo:66} },
  ]},
{ id:'ritornell', title:'Ritornell in Dur', what:'Dur-Folgen mit klarer Kadenz: I–IV–V–I und die Pachelbel-Sequenz.',
  why:'Dur ist im Kurs der Kontrast, nicht die Heimat. Vivaldi wechselt zwischen Dur-Ritornell und Moll-Episoden, Anathema zwischen Dur-Refrain und Moll-Strophe. Wer Dur als Ausnahme spielt, macht es zum Ereignis. I–V–vi–iii–IV–I–IV–V ist ein Quintfall mit Terzsprüngen dazwischen, darum funktioniert jede Sequenz darüber.',
  variations:[
    { title:'C: I–IV–V–I', note:'Die Kadenz. Dur, zum Aufwachen.', cfg:{type:'loop', root:'C', scale:'major', progression:['I','IV','V','I'], time:'4/4', bars:4, drums:'straight', tempo:90} },
    { title:'C: Pachelbel', note:'I–V–vi–iii–IV–I–IV–V. Acht Takte, Sequenz-Spielwiese.', cfg:{type:'loop', root:'C', scale:'major', progression:['I','V','vi','iii','IV','I','IV','V'], time:'4/4', bars:8, drums:'straight', tempo:84} },
    { title:'G Lydisch', note:'I–II in Lydisch. Die #4 als Licht. Kein Doom, aber ein Fenster.', cfg:{type:'loop', root:'G', scale:'lydian', progression:['I','II'], time:'4/4', bars:4, drums:'off', tempo:70} },
  ]},
];
