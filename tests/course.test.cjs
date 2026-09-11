const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const memory = new Map();
const context = vm.createContext({console, structuredClone, crypto:require('node:crypto').webcrypto, Date, Math, performance, setTimeout, clearTimeout, navigator:{}, localStorage:{getItem:k => memory.get(k), setItem:(k,v) => memory.set(k,v)}});
context.window = context;
for (const f of ['js/music.js','js/notation.js','js/audio.js','js/store.js']) vm.runInContext(fs.readFileSync(f,'utf8'), context);
const {music:M, notation:N, backing:B, audio:A, store:S} = context.AM;
const de = JSON.parse(fs.readFileSync('locales/de.json','utf8')), en = JSON.parse(fs.readFileSync('locales/en.json','utf8'));
const raw = JSON.parse(fs.readFileSync('data/course.json','utf8'));
const translate = x => Array.isArray(x) ? x.map(translate) : x && typeof x === 'object' ? {...Object.fromEntries(Object.entries(x).map(([k,v]) => [k,translate(v)])), ...de.course[x.textId]} : x;
const tracks = translate(raw);
const plain = x => JSON.parse(JSON.stringify(x));
const exercises = Object.values(tracks).flatMap(t => t.phases.filter(p => !p.planned).flatMap(p => p.units.flatMap(u => u.exercises.map(e => ({...e, instrument:t.instrument})))));

test('course specifications: IDs, criteria, measure lengths, ties, ranges and finger positions', () => {
  const ids = new Set();
  for (const e of exercises) {
    assert(!ids.has(e.id), e.id); ids.add(e.id);
    assert(e.checklist?.length, e.id);
    if (e.backing) assert(B.build(e.backing).len > 0, e.id);
    if (!e.score) continue;
    const sc = e.score, notes = e.generate ? N.generate({...e.generate, time:sc.time}) : sc.notes;
    const [b,u] = sc.time.split('/').map(Number), bar = b * 4 / u;
    const length = ns => ns.reduce((n,x) => n + N.dur(x.d), 0);
    assert.equal(length(notes) % bar, 0, e.id + ': complete measures');
    assert.equal(length(notes), e.backing.bars * bar, e.id + ': accompaniment length');
    if (sc.bass) assert.equal(length(sc.bass), length(notes), e.id + ': aligned hands');
    for (const ns of [notes, sc.bass || []]) ns.forEach((n,i) => {
      if (n.tie) assert.deepEqual(n.p, ns[i + 1]?.p, e.id + ': tie target');
      if (n.r) return;
      for (const p of [].concat(n.p)) {
        const m = M.midi(p); assert(m >= 0 && m < 128, e.id);
        if (e.instrument === 'guitar') {
          const pos = M.position(m, {s:n.s, maxFret:sc.maxFret ?? 5, window:sc.stringWindow});
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
  const walk = x => { if (!x || typeof x !== 'object') return; if (x.textId) assert(de.course[x.textId]); for (const [k,v] of Object.entries(x)) { assert(!['title','goal','text','instructions','checklist','position'].includes(k)); walk(v); } }; walk(raw);
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

test('shared journal merges independent devices, resolves repeated delivery and preserves deletion', () => {
  const entries=[
    {id:'device-a-note',clock:10,type:'note',ex:'e0-1-1',note:'A',date:'2026-09-11'},
    {id:'device-b-note',clock:10,type:'note',ex:'ke0-1-1',note:'B',date:'2026-09-11'},
    {id:'device-a-mark',clock:11,type:'mark',ex:'e0-2-1',done:true},
    {id:'device-b-mark',clock:11,type:'mark',ex:'ke0-2-1',done:true},
    {id:'device-b-remove',clock:12,type:'remove',target:'device-a-note'}
  ];
  S.merge(entries.slice().reverse());const before=S.export();S.merge(entries);assert.equal(S.export(),before);
  assert(S.isDone('e0-2-1'));assert(S.isDone('ke0-2-1'));
  assert(!S.get().log.some(e=>e.id==='device-a-note'));assert(S.get().log.some(e=>e.id==='device-b-note'));
  S.merge([entries[0]]);assert(!S.get().log.some(e=>e.id==='device-a-note'));
  assert.throws(()=>S.merge([{...entries[0],note:'forged duplicate ID'}]));assert.equal(S.export(),before);
  S.merge([{id:'conflict-a',clock:13,type:'mark',ex:'e0-2-1',done:false},{id:'conflict-b',clock:13,type:'mark',ex:'e0-2-1',done:true}]);
  assert(S.isDone('e0-2-1'));
});

test('independent voices use separate keys or strings while their notes overlap', () => {
  for (const e of exercises.filter(e => e.score?.bass)) {
    const events = N.events(e.score);
    for (const a of events.filter(n => n.voice === 0)) for (const b of events.filter(n => n.voice === 1)) {
      if (a.t >= b.t + b.dur || b.t >= a.t + a.dur) continue;
      assert.notEqual(a.midi,b.midi,e.id + ': simultaneous hands/voices on one pitch');
      if (e.instrument !== 'guitar') continue;
      const locate = (notes,event) => {
        let time = 0;
        for (const n of notes) {
          if (time === event.t) return M.position(event.midi,{s:n.s,maxFret:e.score.maxFret});
          time += N.dur(n.d);
        }
      };
      assert.notEqual(locate(e.score.notes,a).s,locate(e.score.bass,b).s,e.id + ': overlapping guitar notes on one string');
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
