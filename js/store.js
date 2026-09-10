AM.store = (() => {
  const K = 'a-minor';
  const load = () => { try { return JSON.parse(localStorage.getItem(K)) || {log:[], done:{}}; } catch { return {log:[], done:{}}; } };
  let st = load();
  const save = () => localStorage.setItem(K, JSON.stringify(st));
  return {
    get: () => st,
    addLog: e => { st.log.unshift({...e, date:new Date().toISOString().slice(0, 10)}); save(); },
    removeLog: i => { st.log.splice(i, 1); save(); },
    toggleDone: id => { st.done[id] = !st.done[id]; save(); },
    isDone: id => !!st.done[id],
    export: () => JSON.stringify(st, null, 2),
    import: json => { st = JSON.parse(json); if (!st.log || !st.done) throw Error('Format'); save(); },
  };
})();
