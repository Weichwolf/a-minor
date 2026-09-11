AM.store = (() => {
  const K = 'a-minor', listeners = new Set();
  const compare = (a,b) => a.clock - b.clock || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const text = v => typeof v === 'string' && v.length <= 12000;
  const eventId = v => typeof v === 'string' && v.length > 0 && v.length <= 150000;
  const note = e => e && text(e.ex) && text(e.note) && /^\d{4}-\d{2}-\d{2}$/.test(e.date);
  function validate(e) {
    if (!e || !eventId(e.id) || !Number.isSafeInteger(e.clock) || e.clock < 0) throw Error('Invalid journal event');
    const base = {id:e.id,clock:e.clock,type:e.type};
    if (e.type === 'mark' && text(e.ex) && typeof e.done === 'boolean') return {...base,ex:e.ex,done:e.done};
    if (e.type === 'note' && note(e)) return {...base,ex:e.ex,note:e.note,date:e.date};
    if (e.type === 'remove' && eventId(e.target)) return {...base,target:e.target};
    throw Error('Invalid journal event');
  }
  function decode(st) {
    if (st?.version === 2 && Array.isArray(st.journal)) return st.journal.map(validate);
    if (!st || !Array.isArray(st.log) || !st.done || typeof st.done !== 'object' || Array.isArray(st.done) || !Object.values(st.done).every(v => typeof v === 'boolean') || !st.log.every(note)) throw Error('Invalid backup');
    const occurrences = new Map();
    const legacy = (type,value) => {
      const key = JSON.stringify([type,value]), count = occurrences.get(key) || 0;
      occurrences.set(key,count + 1);
      return validate({id:'legacy-' + count + '-' + key,clock:0,type,...value});
    };
    return [...Object.entries(st.done).map(([ex,done]) => legacy('mark',{ex,done})),...st.log.map(({ex,note,date}) => legacy('note',{ex,note,date}))];
  }
  function combine(...groups) {
    const map = new Map();
    for (const group of groups) for (const raw of group) {
      const e = validate(raw), previous = map.get(e.id);
      if (previous && JSON.stringify(previous) !== JSON.stringify(e)) throw Error('Conflicting event ID');
      map.set(e.id,e);
    }
    return [...map.values()].sort(compare);
  }
  const disk = () => { const raw = localStorage.getItem(K); return raw ? decode(JSON.parse(raw)) : []; };
  let journal;
  try { journal = combine(disk()); } catch { journal = []; }
  function project() {
    const done = {}, notes = new Map(), removed = new Set();
    for (const e of journal) {
      if (e.type === 'mark') Object.defineProperty(done,e.ex,{value:e.done,writable:true,enumerable:true,configurable:true});
      if (e.type === 'note') notes.set(e.id,{id:e.id,ex:e.ex,note:e.note,date:e.date});
      if (e.type === 'remove') removed.add(e.target);
    }
    return {done,log:[...notes.values()].filter(e => !removed.has(e.id)).reverse()};
  }
  let state = project();
  const snapshot = () => ({version:2,journal:structuredClone(journal),...structuredClone(state)});
  function merge(events,source = 'remote') {
    const next = combine(journal,disk(),events);
    if (JSON.stringify(next) === JSON.stringify(journal)) return false;
    localStorage.setItem(K,JSON.stringify({version:2,journal:next})); journal = next; state = project();
    listeners.forEach(fn => fn(source)); return true;
  }
  function append(value) {
    const known = combine(journal,disk()), clock = known.reduce((n,e) => Math.max(n,e.clock),0) + 1;
    merge([{id:crypto.randomUUID(),clock,...value}],'local');
  }
  const date = () => { const d = new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
  window.addEventListener?.('storage',e => { if (e.key === K && e.newValue) { try { merge(decode(JSON.parse(e.newValue)),'remote'); } catch {} } });
  return {
    get:snapshot,
    entries:() => structuredClone(journal),
    subscribe:fn => { listeners.add(fn); return () => listeners.delete(fn); },
    merge:events => merge(events),
    addLog:e => append({type:'note',ex:e.ex,note:e.note,date:date()}),
    removeLog:id => { const entry = typeof id === 'number' ? snapshot().log[id] : snapshot().log.find(e => e.id === id); if (entry) append({type:'remove',target:entry.id}); },
    toggleDone:ex => append({type:'mark',ex,done:!state.done[ex]}),
    isDone:ex => Object.hasOwn(state.done,ex) && !!state.done[ex],
    export:() => JSON.stringify(snapshot(),null,2),
    import:json => merge(decode(JSON.parse(json)),'local')
  };
})();
