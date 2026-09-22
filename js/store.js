AM.store = (() => {
  const K = 'a-minor', listeners = new Set();
  const text = v => typeof v === 'string' && v.length <= 12000;
  const id = v => typeof v === 'string' && v.length > 0 && v.length <= 150000;
  const note = e => e && text(e.ex) && text(e.note) && typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date);
  const empty = () => ({version:3,done:{},log:[]});
  function legacy(st) {
    const events = new Map();
    for (const e of st.journal) {
      if (!e || !id(e.id) || !Number.isSafeInteger(e.clock) || e.clock < 0) throw Error('Invalid legacy event');
      let value = {id:e.id,clock:e.clock,type:e.type};
      if (e.type === 'mark' && text(e.ex) && typeof e.done === 'boolean') value = {...value,ex:e.ex,done:e.done};
      else if (e.type === 'note' && note(e)) value = {...value,ex:e.ex,note:e.note,date:e.date};
      else if (e.type === 'remove' && id(e.target)) value.target = e.target;
      else throw Error('Invalid legacy event');
      if (events.has(e.id) && JSON.stringify(events.get(e.id)) !== JSON.stringify(value)) throw Error('Conflicting legacy event');
      events.set(e.id,value);
    }
    const state = empty(), notes = new Map(), removed = new Set();
    const ordered = [...events.values()].sort((a,b) => a.clock - b.clock || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    for (const e of ordered) {
      if (e.type === 'mark') Object.defineProperty(state.done,e.ex,{value:e.done,writable:true,enumerable:true,configurable:true});
      if (e.type === 'note') notes.set(e.id,{id:e.id,ex:e.ex,note:e.note,date:e.date});
      if (e.type === 'remove') removed.add(e.target);
    }
    state.log = [...notes.values()].filter(e => !removed.has(e.id)).reverse();
    return state;
  }
  function decode(st) {
    if (st?.version === 2 && Array.isArray(st.journal)) return legacy(st);
    if (!st || ![undefined,1,3].includes(st.version) || !Array.isArray(st.log) || !st.done || typeof st.done !== 'object' || Array.isArray(st.done) || !Object.entries(st.done).every(([k,v]) => text(k) && typeof v === 'boolean') || !st.log.every(note)) throw Error('Invalid backup');
    const ids = new Set();
    const log = st.log.map((e,i) => {
      const key = e.id ?? 'legacy-note-' + i;
      if (!id(key) || ids.has(key)) throw Error('Invalid note ID');
      ids.add(key); return {id:key,ex:e.ex,note:e.note,date:e.date};
    });
    return {version:3,done:{...st.done},log};
  }
  const read = () => { const raw = localStorage.getItem(K); return raw ? decode(JSON.parse(raw)) : empty(); };
  let state;
  try { state = read(); } catch { state = empty(); }
  const snapshot = () => structuredClone(state);
  function save(next) {
    localStorage.setItem(K,JSON.stringify(next)); state = next;
  }
  function update(fn) { const next = read(); fn(next); save(next); }
  const date = () => { const d = new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
  window.addEventListener?.('storage',e => {
    if (e.key !== K && e.key !== null) return;
    try { state = read(); listeners.forEach(fn => fn('storage')); } catch {}
  });
  return {
    get:snapshot,
    subscribe:fn => { listeners.add(fn); return () => listeners.delete(fn); },
    addLog:e => {
      const entry = {id:crypto.randomUUID(),ex:e.ex,note:e.note,date:date()};
      if (!note(entry)) throw Error('Invalid note');
      update(next => next.log.unshift(entry));
    },
    removeLog:id => update(next => { const key = typeof id === 'number' ? next.log[id]?.id : id; next.log = next.log.filter(e => e.id !== key); }),
    toggleDone:ex => {
      if (!text(ex)) throw Error('Invalid exercise');
      update(next => { const done = Object.hasOwn(next.done,ex) && next.done[ex]; Object.defineProperty(next.done,ex,{value:!done,writable:true,enumerable:true,configurable:true}); });
    },
    isDone:ex => Object.hasOwn(state.done,ex) && !!state.done[ex],
    export:() => JSON.stringify(snapshot(),null,2),
    import:json => save(decode(JSON.parse(json)))
  };
})();
