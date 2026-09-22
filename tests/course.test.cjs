const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const memory = new Map();
const context = vm.createContext({console, structuredClone, crypto:require('node:crypto').webcrypto, Date, Math, performance, setTimeout, clearTimeout, navigator:{}, localStorage:{getItem:k => memory.get(k), setItem:(k,v) => memory.set(k,v)}});
context.window = context;
for (const f of ['js/music.js','js/glyphs.js','js/notation.js','js/fretboard.js','js/piano.js','js/audio.js','js/store.js']) vm.runInContext(fs.readFileSync(f,'utf8'), context);
const {music:M, notation:N, backing:B, audio:A, store:S} = context.AM;
const de = JSON.parse(fs.readFileSync('locales/de.json','utf8')), en = JSON.parse(fs.readFileSync('locales/en.json','utf8'));
const raw = JSON.parse(fs.readFileSync('data/course.json','utf8')), rawBook = JSON.parse(fs.readFileSync('data/book.json','utf8'));
const translate = (x,texts) => Array.isArray(x) ? x.map(v => translate(v,texts)) : x && typeof x === 'object' ? {...Object.fromEntries(Object.entries(x).map(([k,v]) => [k,translate(v,texts)])), ...texts[x.textId]} : x;
const tracks = translate(raw,de.course), book = translate(rawBook,de.book);
const plain = x => JSON.parse(JSON.stringify(x));
const exercises = Object.values(tracks).flatMap(t => t.phases.filter(p => !p.planned).flatMap(p => p.units.flatMap(u => u.exercises.map(e => ({...e, instrument:t.instrument})))));
const chapters = book.parts.flatMap(p => p.chapters.map(c => ({...c, part:p})));
const examples = chapters.flatMap(c => c.examples.map(e => ({...e, instrument:e.instrument || 'theory', example:true, chapter:c.id})));
const scored = [...exercises, ...examples].filter(e => e.score);

test('course specifications: IDs, criteria, measure lengths, ties, ranges and finger positions', () => {
  const ids = new Set();
  for (const e of [...exercises, ...examples]) {
    assert(!ids.has(e.id), e.id); ids.add(e.id);
    if (e.example) { assert(!e.backing && !e.checklist && !e.aids, e.id + ': book examples carry no tasks'); assert(e.title && e.score, e.id); }
    else assert(e.checklist?.length, e.id);
    if (e.backing) assert(B.build(e.backing).len > 0, e.id);
    if (!e.score) continue;
    const sc = e.score, notes = e.generate ? N.generate({...e.generate, time:sc.time}) : sc.notes;
    const [b,u] = sc.time.split('/').map(Number), bar = b * 4 / u;
    const length = ns => ns.reduce((n,x) => n + N.ticks(x.d), 0) / N.ticks('q');
    assert.equal(length(notes) % bar, 0, e.id + ': complete measures');
    if (e.backing) assert.equal(N.barOrder({...sc,notes}).length * bar, e.backing.bars * bar, e.id + ': accompaniment length including form');
    for (const voice of [sc.bass,sc.inner].filter(Boolean)) assert.equal(length(voice),length(notes),e.id + ': aligned voices');
    for (const ns of [notes, sc.bass || [],sc.inner || []]) ns.forEach((n,i) => {
      if (n.tie) assert.deepEqual(n.p, ns[i + 1]?.p, e.id + ': tie target');
      if (n.r) return;
      for (const [pi,p] of [].concat(n.p).entries()) {
        const m = M.midi(p); assert(m >= 0 && m < 128, e.id);
        if (e.instrument === 'guitar') {
          const pos = M.position(m, {s:Array.isArray(n.s) ? n.s[pi] : n.s, maxFret:sc.maxFret ?? 5, window:sc.stringWindow});
          assert(pos && pos.f >= 0 && pos.f <= (sc.maxFret ?? 5), e.id + ': playable note ' + p);
          if (e.id === 'e1-2-1') assert(pos.s <= 2, e.id + ': three strings');
        } else assert(m >= M.midi('C2') && m <= M.midi('C6'), e.id);
      }
    });
    const el = {}; N.render(el, {...sc, notes, instrument:e.instrument}, {names:true, strings:true, fingers:true});
    assert(!/NaN|undefined/.test(el.innerHTML), e.id + ': SVG');
  }
});

test('ties sustain notes and chords, rests interrupt chains, voices remain independent', () => {
  assert.deepEqual(plain(N.events({notes:[{p:'E4',d:'h',tie:1},{p:'E4',d:'w',tie:1},{p:'E4',d:'h'},{r:1,d:'q'},{p:'E4',d:'q'}],bass:[{p:['E3','B3'],d:'w',tie:1},{p:['E3','B3'],d:'w'}]})), [
    {t:0,midi:64,dur:8,voice:0},{t:9,midi:64,dur:1,voice:0},{t:0,midi:52,dur:8,voice:1},{t:0,midi:59,dur:8,voice:1}
  ]);
});

test('half-time and straight drums implement different backbeats without harmonic events', () => {
  const half = B.build({type:'drums', drums:'half', bars:2, time:'4/4'});
  assert.deepEqual(plain(half.events.filter(e => e.type === 'snare').map(e => e.t)), [2,6]);
  assert.deepEqual(plain(half.events.filter(e => e.type === 'kick').map(e => e.t)), [0,4]);
  assert(!half.events.some(e => e.type === 'tone'));
  const straight = B.build({type:'drums', drums:'straight', bars:1, time:'4/4'});
  assert.deepEqual(plain(straight.events.filter(e => e.type === 'snare').map(e => e.t)), [1,3]);
  const click = B.build({type:'click', bars:2, time:'3/4'});
  assert.deepEqual(plain(click.events.filter(e => e.strong).map(e => e.t)), [0,3]);
  assert.throws(() => B.build({type:'click',bars:0}));
});

test('generator stays within range, fills bars and rejects impossible inputs', () => {
  for (const e of exercises.filter(e => e.generate)) for (let i=0; i<40; i++) {
    const g = e.generate, ns = N.generate({...g,time:e.score.time});
    assert.equal(ns.reduce((n,x) => n + N.dur(x.d),0), g.bars * 4);
    ns.forEach(n => { assert(M.midi(n.p) >= M.midi(g.range[0]) && M.midi(n.p) <= M.midi(g.range[1])); assert(M.scalePcs(g.root,g.scale).includes(M.pc(M.midi(n.p)))); });
  }
  assert.throws(() => N.generate({range:['C4','B3']}));
  assert.throws(() => N.generate({range:['C4','G4'],time:'3/4',durs:['w']}));
});

test('invalid imports leave live and persisted progress intact; imported text is data', () => {
  S.addLog({ex:'e0-1-1',note:'<script>example</script>'}); S.toggleDone('e0-1-1');
  const before = S.export(), disk = memory.get('a-minor');
  for (const invalid of ['null','{}','{"log":{},"done":{}}','{"log":[{}],"done":{}}','{"log":[],"done":{"x":1}}']) {
    assert.throws(() => S.import(invalid)); assert.equal(S.export(),before); assert.equal(memory.get('a-minor'),disk);
  }
  S.import(before); assert.equal(S.export(),before);
  const copy = S.get(); copy.log.length=0; assert.equal(S.get().log.length,1);
});

test('MIDI uses channel 10, stops queued notes, switches safely and rejects invalid tempo', () => {
  const sent=[], port={id:'test',name:'Test',state:'connected',send:(bytes,t) => sent.push({bytes:[...bytes],t}),clear:() => sent.push({clear:true})};
  A.out.access={outputs:new Map([['test',port]])}; A.midiSelect('test'); sent.length=0;
  const p = new A.Player(); p.load(B.build({type:'drums',bars:1,time:'4/4'}),60); p.play(); p.stop();
  assert(sent.some(x => x.bytes?.[0] === 0x99));
  assert(sent.some(x => x.clear));
  assert(sent.filter(x => x.bytes).every(x => (x.bytes[0] & 15) === 9));
  assert.throws(() => p.load(B.build({type:'click',bars:1}),0));
  A.midiSelect(''); assert.equal(A.out.port,null); assert.throws(() => p.play());
});

test('translations cover the same complete schema and UI keys; musical data has no prose', () => {
  assert.deepEqual(Object.keys(de.course).sort(),Object.keys(en.course).sort());
  assert.deepEqual(Object.keys(de.ui).sort(),Object.keys(en.ui).sort());
  for (const id of Object.keys(de.course)) {
    assert.deepEqual(Object.keys(de.course[id]).sort(),Object.keys(en.course[id]).sort(),id);
    for (const lang of [de,en]) for (const value of Object.values(lang.course[id])) assert(Array.isArray(value) ? value.every(v => typeof v === 'string' && v.length) : typeof value === 'string' && value.length,id);
  }
  const used = new Set(); const walk = x => { if (!x || typeof x !== 'object') return; if (x.textId) { assert(de.course[x.textId] || de.book[x.textId],x.textId); used.add(x.textId); } for (const [k,v] of Object.entries(x)) { assert(!['title','goal','text','instructions','checklist','position'].includes(k)); walk(v); } }; walk(raw); walk(rawBook);
  for (const id of Object.keys(de.course)) assert(used.has(id) || ['gitarre','keys'].includes(id),id + ': orphaned course text');
  assert.deepEqual(Object.keys(de.book).sort(),Object.keys(en.book).sort());
  for (const id of Object.keys(de.book)) { assert(used.has(id),id + ': orphaned book text'); assert.deepEqual(Object.keys(de.book[id]).sort(),Object.keys(en.book[id]).sort(),id); }
});

test('guitar polyphony shares one staff, preserves independent durations and uses opposing stems', () => {
  const ex = exercises.find(e => e.id === 'e1-pedal-1'), el = {};
  N.render(el,{...ex.score,instrument:'guitar'});
  assert.equal((el.innerHTML.match(/class="staff"/g) || []).length,5);
  assert.equal((el.innerHTML.match(/class="clef"/g) || []).length,1);
  const events = N.events(ex.score);
  assert(events.some(e => e.midi === 52 && e.t === 2 && e.dur === 6));
  assert.deepEqual(plain(events.filter(e => e.voice === 1).map(e => e.t)),[0,4,8,12]);
});

const localStore = (disk = new Map()) => {
  const handlers = {}, storage = {getItem:k => disk.get(k),setItem:(k,v) => disk.set(k,v)};
  const ctx = vm.createContext({AM:{},structuredClone,crypto:require('node:crypto').webcrypto,Date,localStorage:storage,window:{addEventListener:(type,fn) => handlers[type] = fn}});
  vm.runInContext(fs.readFileSync('js/store.js','utf8'),ctx);
  return {store:ctx.AM.store,storage,event:handlers.storage,disk};
};

test('old journals migrate locally, preserve marks and deletions, and expose no merge API', () => {
  const journal = [
    {id:'old-note-a',clock:10,type:'note',ex:'e0-1-1',note:'A',date:'2026-09-11'},
    {id:'old-note-b',clock:10,type:'note',ex:'ke0-1-1',note:'B',date:'2026-09-11'},
    {id:'old-mark-a',clock:11,type:'mark',ex:'e0-2-1',done:true},
    {id:'old-mark-b',clock:11,type:'mark',ex:'ke0-2-1',done:true},
    {id:'old-remove',clock:12,type:'remove',target:'old-note-a'},
    {id:'old-unmark',clock:13,type:'mark',ex:'e0-2-1',done:false}
  ];
  const backup = JSON.stringify({version:2,journal:[...journal].reverse().concat(journal[0])});
  const {store,disk} = localStore(new Map([['a-minor',backup]]));
  assert.equal(store.merge,undefined);assert.equal(store.entries,undefined);
  assert(!store.isDone('e0-2-1'));assert(store.isDone('ke0-2-1'));
  assert.deepEqual(plain(store.get().log),[{id:'old-note-b',ex:'ke0-1-1',note:'B',date:'2026-09-11'}]);
  store.toggleDone('e0-3-1');
  const persisted = JSON.parse(disk.get('a-minor'));
  assert.equal(persisted.version,3);assert.equal(persisted.journal,undefined);
  assert.equal(persisted.log.length,1);assert(persisted.done['e0-3-1']);
  store.import(backup);assert(!store.isDone('e0-3-1'));
  const before = store.export(), saved = disk.get('a-minor');
  assert.throws(() => store.import(JSON.stringify({version:2,journal:[...journal,{...journal[0],note:'conflicting ID'}]})));
  assert.equal(store.export(),before);assert.equal(disk.get('a-minor'),saved);
});

test('restore replaces browser progress and storage failures preserve the previous state', () => {
  const {store,storage,disk} = localStore();
  store.toggleDone('old');store.addLog({ex:'old',note:'local note'});
  store.import(JSON.stringify({version:3,done:{new:true},log:[]}));
  assert(!store.isDone('old'));assert(store.isDone('new'));assert.equal(store.get().log.length,0);
  const before = store.export(), saved = disk.get('a-minor');
  storage.setItem = () => { throw Error('Quota exceeded'); };
  for (const change of [() => store.toggleDone('new'),() => store.addLog({ex:'new',note:'unsaved'}),() => store.import('{"done":{},"log":[]}')]) {
    assert.throws(change);assert.equal(store.export(),before);assert.equal(disk.get('a-minor'),saved);
  }
});

test('local tabs read the latest browser state and react to storage changes and clearing', () => {
  const disk = new Map(), a = localStore(disk), b = localStore(disk), notices = [];
  b.store.subscribe(source => notices.push(source));
  a.store.toggleDone('first');b.store.toggleDone('second');
  assert(b.store.isDone('first'));assert(b.store.isDone('second'));
  a.event({key:'a-minor'});assert(a.store.isDone('second'));
  a.store.addLog({ex:'first',note:'saved'});b.event({key:'unrelated'});assert.equal(b.store.get().log.length,0);
  b.event({key:'a-minor'});assert.equal(b.store.get().log.length,1);assert.deepEqual(notices,['storage']);
  disk.clear();b.event({key:null});assert(!b.store.isDone('first'));assert.equal(b.store.get().log.length,0);
});

test('all written combinations fit separate guitar strings and reachable keyboard hands', () => {
  for (const e of scored.filter(e => !e.generate)) {
    const sc = e.score, events = [];
    [sc.notes,sc.bass || [],sc.inner || []].forEach((notes,voice) => {
      let t = 0;
      notes.forEach(n => {
        const length = N.ticks(n.d);
        if (!n.r) [].concat(n.p).forEach((p,i) => {
          const midi = M.midi(p), pos = e.instrument === 'guitar' ? M.position(midi,{s:Array.isArray(n.s) ? n.s[i] : n.s,maxFret:sc.maxFret ?? 5}) : null;
          events.push({t,end:t + length,midi,voice,pos});
        });
        t += length;
      });
    });
    for (const t of new Set(events.map(e => e.t))) {
      const active = events.filter(n => n.t <= t && n.end > t);
      if (e.instrument === 'guitar') {
        assert.equal(new Set(active.map(n => n.pos.s)).size,active.length,e.id + ': two active notes on one string at ' + t / N.ticks('q'));
        const frets = active.map(n => n.pos.f).filter(f => f > 0);
        if (frets.length) assert(Math.max(...frets) - Math.min(...frets) <= 4,e.id + ': excessive fret span at ' + t / N.ticks('q'));
      } else {
        assert.equal(new Set(active.map(n => n.midi)).size,active.length,e.id + ': simultaneous voices on one key');
        if (e.instrument === 'theory') continue;
        for (const hand of [active.filter(n => n.voice === 1),active.filter(n => n.voice !== 1)]) {
          assert(hand.length <= 5,e.id + ': more than five notes in one hand');
          if (hand.length) assert(Math.max(...hand.map(n => n.midi)) - Math.min(...hand.map(n => n.midi)) <= 12,e.id + ': hand wider than an octave');
        }
      }
    }
  }
});

test('legacy restore preserves repeated practice notes and remains idempotent', () => {
  const entry = {ex:'legacy-practice',note:'Repeated practice',date:'2026-09-11'};
  const backup = JSON.stringify({done:{'legacy-practice':true},log:[entry,entry,{...entry,note:'ä'.repeat(12000)}]});
  S.import(backup);
  assert.equal(S.get().log.filter(e => e.ex === entry.ex).length,3);
  const before = S.export(); S.import(backup); assert.equal(S.export(),before);
});

test('phases 2–8 contain seven guitar and six keyboard units with complete bilingual tasks', () => {
  const ids = new Set();
  assert.deepEqual(Object.keys(tracks),['gitarre','keys']);
  for (const track of Object.values(tracks)) for (const [i,phase] of track.phases.entries()) {
    assert(!phase.planned,phase.id);
    if (i >= 2) assert.equal(phase.units.length,track.instrument === 'guitar' ? 7 : 6,phase.id);
    for (const unit of phase.units) {
      assert(!ids.has(unit.id),unit.id);ids.add(unit.id);
      assert(!/Geplant\.|nicht ausgearbeitet/.test(unit.text),unit.id);
      if (i < 2) continue;
      assert.equal(unit.exercises.length,3,unit.id);
      assert(unit.exercises[0].score,unit.id + ': written example');
      assert.equal(unit.exercises[2].kind,'compose',unit.id + ': independent application');
      for (const ex of unit.exercises) for (const bundle of [de,en]) {
        assert(bundle.course[ex.textId].instructions.length > 80,ex.id);
        assert.equal(bundle.course[ex.textId].checklist.length,2,ex.id);
      }
    }
  }
});

test('triplet durations, compound pulse and odd-meter groups retain exact measure lengths', () => {
  assert.equal(N.ticks('et') * 3,N.ticks('q'));
  assert.equal(N.ticks('qt') * 3,N.ticks('h'));
  assert(Number.isInteger(N.ticks('s.')));
  const compound = B.build({type:'drums',time:'12/8',bars:1,drums:'compound'});
  assert.equal(compound.q,1.5);assert.equal(compound.beats,4);assert.equal(compound.len,6);
  assert.deepEqual(plain(compound.events.filter(e => e.type === 'snare').map(e => e.t)),[1.5,4.5]);
  const odd = B.build({type:'click',time:'7/8',bars:1,groups:[2,2,3]});
  assert.equal(odd.q,.5);assert.equal(odd.len,3.5);
  assert.deepEqual(plain(odd.events.filter(e => e.strong).map(e => e.t)),[0,1,2]);
  assert.throws(() => M.meter('7/8',[2,2,2]));
  const swung = N.events({swing:true,notes:[{p:'E3',d:'e'},{p:'G3',d:'e'},{p:'E3',d:'q'}]});
  assert.equal(swung[1].t,2/3);assert.equal(swung[2].t,1);
  for (const e of scored) {
    for (const notes of [e.score.notes || [],e.score.bass || [],e.score.inner || []]) {
      let group = false;
      for (const note of notes) {
        if (note.tuplet) { assert(!group,e.id);group = true; }
        if (note.d.endsWith('t')) assert(group,e.id + ': triplet bracket missing');
        if (note.tupletEnd) { assert(group,e.id);group = false; }
      }
      assert(!group,e.id + ': unclosed triplet bracket');
    }
  }
});

test('every offered drum accompaniment contains an audible closed hi-hat', () => {
  for (const e of exercises.filter(e => e.backing)) {
    const seq = B.build({...e.backing,type:'drums'}), hats = seq.events.filter(e => e.type === 'hat');
    assert(hats.length >= seq.steps.length,e.id);
    assert(hats.every(h => Math.round(h.vel * 110) >= 30),e.id);
    assert(seq.events.every(n => ['kick','snare','hat'].includes(n.type)),e.id);
  }
});

test('repeat endings, D.S. to coda and D.C. al Fine follow the written form', () => {
  const sc = id => exercises.find(e => e.id === id).score;
  assert.deepEqual(plain(N.barOrder(sc('e3-5-1'))),[1,2,3,1,2,4]);
  assert.deepEqual(plain(N.barOrder(sc('e7-solo-1'))),[1,2,3,4,2,3,5,6]);
  assert.deepEqual(plain(N.barOrder(sc('e8-4-1'))),[1,2,3,4,5,6,1,2,3,4]);
  for (const [id,returnAt] of [['e3-5-1',12],['e7-solo-1',16],['e8-4-1',24]]) {
    const score = sc(id), bars = N.barOrder(score), ev = N.events(score);
    assert(ev.every(n => n.t >= 0 && n.t + n.dur <= bars.length * 4),id);
    assert.equal(ev.filter(n => n.voice === 1 && n.midi === 40 && n.t === returnAt).length,1,id + ': returns at the correct moment');
  }
});

test('score wraps only at barlines and preserves ties and three-layer notation', () => {
  const ex = exercises.find(e => e.id === 'e1-pedal-1'), el = {clientWidth:300};
  N.render(el,{...ex.score,instrument:'guitar'});
  assert((el.innerHTML.match(/<svg /g) || []).length > 1);
  assert((el.innerHTML.match(/class="tie"/g) || []).length >= 2,'split tie continues across systems');
  const three = exercises.find(e => e.id === 'e5-2-1');
  N.render(el,{...three.score,instrument:'guitar'});
  assert.equal((el.innerHTML.match(/class="staff"/g) || []).length,(el.innerHTML.match(/<svg /g) || []).length * 5);
  assert(N.events(three.score).some(n => n.voice === 2));
  N.render(el,{...exercises.find(e => e.id === 'e6-7-1').score,instrument:'guitar'});
  assert.equal((el.innerHTML.match(/class="harmonic"/g) || []).length,6);
  N.render(el,{...exercises.find(e => e.id === 'e7-6-1').score,instrument:'guitar'});
  assert.equal((el.innerHTML.match(/class="bend"/g) || []).length,2);
  assert.equal(N.events(exercises.find(e => e.id === 'e7-6-1').score).filter(e => e.bend === 2).length,2);
});

test('MIDI scheduler uses the displayed dotted-quarter pulse in 12/8', () => {
  let now = 0, callback;
  const sent = [], sandbox = vm.createContext({console,performance:{now:() => now},navigator:{},setTimeout:fn => { callback = fn; return 1; },clearTimeout:() => { callback = null; }});
  sandbox.window = sandbox;
  for (const file of ['js/music.js','js/audio.js']) vm.runInContext(fs.readFileSync(file,'utf8'),sandbox);
  sandbox.AM.audio.out.port={state:'connected',clear:() => {},send:(bytes,t) => sent.push({bytes:[...bytes],t})};
  const p = new sandbox.AM.audio.Player();p.load(sandbox.AM.backing.build({type:'drums',time:'12/8',bars:1,drums:'compound'}),60);p.play();
  for(now=25;now<=3200;now+=25)callback?.();
  p.stop();
  const snare = sent.filter(x => x.bytes[0] === 0x99 && x.bytes[1] === 38).map(x => x.t);
  assert.deepEqual(snare,[1100,3100]);
});

test('harmonic references preserve authored chords and name actual bass motion without inventing harmony', () => {
  const score=id=>exercises.find(e=>e.id===id).score;
  const pedal=N.references(score('e1-pedal-1'));
  assert(pedal.every(r=>r.kind==='pedal'&&r.tones.join()==='E2'&&!r.chord));
  const texture=N.references(score('e6-4-1'));
  assert.deepEqual(plain(texture.map(r=>r.chord)),['Em','C','Am','B7','Em','C','B7','Em']);
  assert.deepEqual(plain(texture.map(r=>r.tones)),[['E2'],['C3'],['A2'],['B2'],['E2'],['C3'],['B2'],['E2']]);
  assert(N.references(score('ke0-1-1')).every(r=>r.kind==='single'&&!r.chord));
  const moving={time:'4/4',notes:[{p:'G4',d:'w'}],bass:[{p:['C3','E3'],d:'q'},{r:1,d:'q'},{p:'B2',d:'h'}]};
  assert.deepEqual(plain(N.references(moving)[0]),{chord:'',kind:'bass',tones:['C3',null,'B2']});
  const el={clientWidth:300};N.render(el,moving,{}, {bass:'Bass',rest:'Pause'});
  assert.match(el.innerHTML,/harmonic-reference/);assert.match(el.innerHTML,/Pause/);
  for(const e of scored)assert.equal(N.references(e.score).length,N.measures(e.score)[0].length);
});

test('guitar course uses pick-only right hand and introduces left-hand tapping after basic legato', () => {
  for(const locale of [de,en]) {
    const guitarText=Object.entries(locale.course).filter(([id])=>!/^(k|t)/.test(id)).map(([,v])=>JSON.stringify(v)).join('\n');
    assert(!/Fingeranschlag|Fingerzupfen|Bass mit Daumen|Daumen spielt|i–m–a|upper fingers|free fingers|Thumb plays/.test(guitarText));
    assert.match(locale.course['e6-4-1'].instructions,/Plektrum|[Pp]ick/);
    assert.match(locale.course['e5-6-2'].instructions,/Stille|silence/);
    assert.match(locale.course['u7-1'].text,/Hammer-ons|hammer-ons/);
    assert(locale.ui.guitarAttack);
  }
});

test('the theory book is complete, bilingual, verified and places every example exactly once', () => {
  assert(chapters.length >= 30,'chapters');
  for (const bundle of [de,en]) for (const c of chapters) {
    const text = bundle.book[c.id].text;
    assert(text.length > 1500,c.id + ': chapter length');
    assert(!/prüfen|\(verify\)/i.test(text),c.id + ': unverified marker');
    assert(!/Nord|Blofeld|Digitakt|SP-404|SR-18|G-Major|Nova System|2290/.test(text),c.id + ': the textbook names no specific devices');
    assert(/^## /m.test(text),c.id + ': numbered sections');
    const placed = [...text.matchAll(/^\[\[(.+)\]\]$/gm)].map(m => m[1]);
    for (const e of c.examples) assert.equal(placed.filter(p => p === e.id).length,1,c.id + ': example ' + e.id + ' placed once');
    for (const p of placed) assert(c.examples.some(e => e.id === p),c.id + ': unknown placeholder ' + p);
    if (!c.part.appendix) assert(c.examples.length >= 5,c.id + ': at least five notated examples');
  }
  assert(book.parts.filter(p => p.appendix).length === 1 && book.parts.at(-1).appendix,'appendices last');
  for (const e of examples) assert(!e.backing,e.id);
});

test('course miniatures have complete forms and literal returns where marked A–B–A–C', () => {
  for (const e of exercises.filter(e => e.score && !e.generate)) {
    const bars = N.measures(e.score)[0];
    assert(bars.length >= 4,e.id + ': written miniature has at least four bars');
    if (e.score.sections?.join() !== 'A,B,A,C') continue;
    const musical = ns => plain(ns.map(({p,d,r,tie,slur,slurEnd,tuplet,tupletEnd,accent,staccato}) => ({p,d,r,tie,slur,slurEnd,tuplet,tupletEnd,accent,staccato})));
    assert.deepEqual(musical(bars[0]),musical(bars[2]),e.id + ': A returns literally');
    assert.notDeepEqual(musical(bars[0]),musical(bars[3]),e.id + ': C has its own ending');
  }
});

test('reading generator builds ABAC, reaches a tonic and never chooses an unfillable remainder', () => {
  for (const e of exercises.filter(e => e.generate)) for (let i=0;i<30;i++) {
    const g = {...e.generate,time:e.score.time}, notes = N.generate(g), bars = N.measures({...e.score,notes})[0];
    assert.equal(bars.length,4,e.id);
    assert.deepEqual(plain(bars[0]),plain(bars[2]),e.id);
    assert.notDeepEqual(plain(bars[0]),plain(bars[1]),e.id);
    assert.notDeepEqual(plain(bars[0]),plain(bars[3]),e.id);
    assert.equal(M.pc(M.midi(notes.at(-1).p)),M.rootPc(g.root),e.id);
  }
  for (let i=0;i<80;i++) {
    const notes=N.generate({range:['C4','G4'],time:'3/4',durs:['h','q.'],bars:4});
    assert.equal(notes.reduce((sum,n)=>sum+N.ticks(n.d),0),4*3*24);
  }
  for (const bars of [0,-1,1.5,Infinity,65]) assert.throws(()=>N.generate({range:['C4','G4'],bars}));
  assert.throws(()=>N.generate({range:['C4','G4'],bars:4,form:'ABAC',durs:['w']}));
  assert.throws(()=>N.generate({range:['D4','G4'],bars:4,form:'ABAC',root:'C'}));
});

test('odd-meter beams respect group boundaries and never bridge bars', () => {
  for (const [time,groups] of [['5/8',[2,3]],['5/8',[3,2]],['7/8',[2,2,3]],['7/8',[3,2,2]]]) {
    const n=Number(time.split('/')[0]), el={};
    N.render(el,{time,groups,notes:Array.from({length:n*2},()=>({p:'E4',d:'e'}))});
    const stems=[...el.innerHTML.matchAll(/<line x1="([\d.]+)"[^>]+class="stem"/g)].map(m=>Number(m[1]));
    const beams=[...el.innerHTML.matchAll(/<line x1="([\d.]+)"[^>]+x2="([\d.]+)"[^>]+class="beam"/g)].map(m=>[Number(m[1]),Number(m[2])]);
    let at=0; const expected=[];
    for(let bar=0;bar<2;bar++) for(const size of groups) {for(let i=0;i<size-1;i++)expected.push([stems[at+i],stems[at+i+1]]);at+=size;}
    assert.deepEqual(beams,expected,time+' '+groups);
  }
});

test('accidentals belong to the shared staff and tied continuations do not rearticulate', () => {
  const sc={key:'C',time:'4/4',notes:[{p:'F#4',d:'q'},{r:1,d:'h.'}],inner:[{r:1,d:'q'},{p:'F4',d:'h.'}]},el={};
  N.render(el,sc);
  assert.equal((el.innerHTML.match(/class="acc"/g)||[]).length,2,'natural cancels the other voice’s sharp');
  N.render(el,{key:'C',time:'4/4',notes:[{p:'F#4',d:'w',tie:1},{p:'F#4',d:'h'},{p:'F4',d:'h'}]});
  assert.equal((el.innerHTML.match(/class="acc"/g)||[]).length,1,'tie carries the pitch, not a new accidental for the whole bar');
  for(const id of ['e4-4-1','ke4-4-1']) {
    const events=N.events(exercises.find(e=>e.id===id).score).filter(e=>e.voice===0);
    assert.equal(events.length,1,id);assert.equal(events[0].dur,16,id);
  }
});

test('theory diagrams use real P4 positions, exact keyboard octaves and valid bilingual visual text', () => {
  const visuals=examples.flatMap(e=>e.visuals||[]);
  assert(visuals.length>=40);
  for(const v of visuals) {
    assert(v.title&&v.text,v.textId);
    if(v.type==='fretboard') {
      for(const p of v.positions||[]) assert(Number.isInteger(p.s)&&p.s>=0&&p.s<6&&Number.isInteger(p.f)&&p.f>=0&&p.f<=24,v.textId);
      const el={};context.AM.fretboard.render(el,v);assert(!/NaN|undefined/.test(el.innerHTML),v.textId);
    } else if(v.type==='piano') {
      for(const p of v.notes||[])assert(M.midi(p)>=36&&M.midi(p)<=84,v.textId);
      const el={};context.AM.piano.render(el,v);assert(!/NaN|undefined/.test(el.innerHTML),v.textId);
    } else assert(['rhythm','form','flow','envelope'].includes(v.type),v.type);
  }
  const c4=examples.find(e=>e.id==='c02b-c4').visuals.find(v=>v.type==='fretboard');
  assert.deepEqual(plain(c4.positions.map(p=>M.fretMidi(p.s,p.f))),[60,60,60,60,60]);
  const el={};context.AM.piano.render(el,{notes:['C4'],show:'name'});
  assert.equal((el.innerHTML.match(/data-midi=/g)||[]).length,1);assert.match(el.innerHTML,/data-midi="60"/);
  assert.equal(M.degreeOf(66,'C','lydian'),'#4');
  assert.equal(M.scaleName(65,'C#','major'),'E#4');
  assert.equal(M.scaleName(59,'Gb','major'),'Cb4');
  for(const bundle of [de,en]) assert(!/MX49|SR-?18|Nord Lead|Blofeld|Digitakt|SP-404|G-Major|Nova System|2290/i.test(JSON.stringify(bundle)));
});
