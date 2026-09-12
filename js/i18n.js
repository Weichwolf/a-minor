AM.i18n = (() => {
  let language = 'de', course, book, bundles;
  try { language = localStorage.getItem('a-minor-language') === 'en' ? 'en' : 'de'; } catch {}
  const json = async path => { const r = await fetch(path); if (!r.ok) throw Error(path + ': ' + r.status); return r.json(); };
  const ready = Promise.all([json('data/course.json'), json('data/book.json'), json('locales/de.json'), json('locales/en.json')]).then(([data,pages,de,en]) => { course = data; book = pages; bundles = {de,en}; });
  const t = key => bundles[language].ui[key];
  const translate = (value, texts) => {
    if (Array.isArray(value)) return value.map(v => translate(v, texts));
    if (!value || typeof value !== 'object') return value;
    return {...Object.fromEntries(Object.entries(value).map(([k,v]) => [k, translate(v, texts)])), ...(value.textId ? texts[value.textId] : {})};
  };
  return {ready, t, get language() { return language; }, tracks:() => translate(course, bundles[language].course), book:() => translate(book, bundles[language].book), set:lang => {
    if (!['de','en'].includes(lang)) throw Error('Unknown language');
    language = lang; try { localStorage.setItem('a-minor-language', lang); } catch {}
    document.documentElement.lang = lang;
  }};
})();
