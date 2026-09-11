AM.i18n = (() => {
  let language = 'de', course, bundles;
  try { language = localStorage.getItem('a-minor-language') === 'en' ? 'en' : 'de'; } catch {}
  const json = async path => { const r = await fetch(path); if (!r.ok) throw Error(path + ': ' + r.status); return r.json(); };
  const ready = Promise.all([json('data/course.json'), json('locales/de.json'), json('locales/en.json')]).then(([data,de,en]) => { course = data; bundles = {de,en}; });
  const t = key => bundles[language].ui[key];
  const translate = value => {
    if (Array.isArray(value)) return value.map(translate);
    if (!value || typeof value !== 'object') return value;
    return {...Object.fromEntries(Object.entries(value).map(([k,v]) => [k, translate(v)])), ...(value.textId ? bundles[language].course[value.textId] : {})};
  };
  return {ready, t, get language() { return language; }, tracks:() => translate(course), set:lang => {
    if (!['de','en'].includes(lang)) throw Error('Unknown language');
    language = lang; try { localStorage.setItem('a-minor-language', lang); } catch {}
    document.documentElement.lang = lang;
  }};
})();
