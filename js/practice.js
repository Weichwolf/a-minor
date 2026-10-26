AM.practice = (() => {
  const t=k=>AM.i18n.t(k),K='a-minor-practice',C=AM.practiceComposer,instruments=C.instruments;
  const labels={guitar:'guitarInstrument',keys:'keyboardInstrument',bass:'bassInstrument',drums:'drums'},title=i=>t(labels[i]),seed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
  const validGrade=g=>Number.isInteger(g)&&g>=0&&g<=5,validSeed=s=>Number.isInteger(s)&&s>=0&&s<=0xffffffff;
  const validStyle=s=>C.styles.includes(s),identifier=n=>'0x'+n.toString(16).padStart(8,'0').toUpperCase();
  const link=(i,g,n,style='rock')=>`#/practice/${i}/${g}/${style}/${identifier(n)}`;
  const pieceTitle=piece=>t('practicePiece')+' · '+t('style_'+piece.style)+' · '+t('difficulty')+' '+piece.grade+' · '+identifier(piece.seed);
  const selectionKey='a-minor-practice-selection',diversityKey='a-minor-practice-diversity';
  let diversity={};try{const v=JSON.parse(localStorage.getItem(diversityKey));if(v&&typeof v==='object'&&!Array.isArray(v))diversity=v;}catch{}
  let selection={};try{const v=JSON.parse(localStorage.getItem(selectionKey));if(v&&typeof v==='object'&&!Array.isArray(v))selection=v;}catch{}
  function nextSeed(instrument,grade,style,current){
    if(!instruments.includes(instrument)||!validGrade(grade)||!C.availableStyles(grade).includes(style))throw Error('Invalid practice selection');
    const key=instrument+':'+grade+':'+style,skills=C.profiles[grade].skills[instrument],stored=selection[key];
    const counts=Object.fromEntries(skills.map(skill=>[skill,Number.isSafeInteger(stored?.[skill])&&stored[skill]>=0&&stored[skill]<10000?stored[skill]:0]));
    const least=Math.min(...Object.values(counts)),start=seed(),history=diversity[key],recent=Array.isArray(history?.recent)?history.recent.slice(-4):[];
    const usage=(category,value)=>Number.isSafeInteger(history?.[category]?.[value])&&history[category][value]>=0&&history[category][value]<10000?history[category][value]:0;
    const cost=meta=>usage('keys',meta.key)+usage('families',meta.family)+usage('rhythms',meta.rhythm)+recent.reduce((sum,last,i)=>sum+(i+1)*((last?.key===meta.key?3:0)+(last?.family===meta.family?2:0)+(last?.rhythm===meta.rhythm?1:0)),0);
    let best;
    // Balance focus first, then musical variety. Never compose trial scores;
    // the URL still determines every note without depending on this history.
    for(let attempt=0;attempt<1024;attempt++){
      if(attempt>=256&&best?.count===least)break;
      const candidate=(start+Math.imul(attempt,0x9e3779b9))>>>0;if(candidate===current)continue;
      const meta=C.selectionFor(grade,candidate,style),focus=meta.focus[instrument],count=counts[focus],variety=cost(meta);
      if(!best||count<best.count||count===best.count&&variety<best.variety)best={seed:candidate,focus,count,variety,meta};
    }
    const nextHistory={recent:[...recent,{key:best.meta.key,family:best.meta.family,rhythm:best.meta.rhythm}].slice(-4)};
    for(const [category,value] of [['keys',best.meta.key],['families',best.meta.family],['rhythms',best.meta.rhythm]]){
      const valid=Object.entries(history?.[category]??{}).slice(0,100).filter(([k,v])=>k.length<40&&Number.isSafeInteger(v)&&v>=0&&v<10000);
      nextHistory[category]=Object.fromEntries(valid);nextHistory[category][value]=usage(category,value)+1;
    }
    diversity[key]=nextHistory;
    counts[best.focus]++;
    const floor=Math.min(...Object.values(counts));
    selection[key]=Object.fromEntries(skills.map(skill=>[skill,counts[skill]-floor]));
    try{localStorage.setItem(selectionKey,JSON.stringify(selection));localStorage.setItem(diversityKey,JSON.stringify(diversity));}catch{}
    return best.seed;
  }
  let saved={};try{const v=JSON.parse(localStorage.getItem(K));for(const i of instruments)if(validGrade(v?.[i]?.grade)&&validSeed(v[i].seed))saved[i]={grade:v[i].grade,seed:v[i].seed,style:validStyle(v[i].style)?v[i].style:'rock'};}catch{}
  function page(spec=''){
    const [instrument,gText,styleText,nText]=spec.split('/');
    if(!instruments.includes(instrument))return `<h1>${t('practiceMode')}</h1><p class="lead">${t('practiceLead')}</p><div class="tracks">${instruments.map(i=>`<a class="track" href="#/practice/${i}"><h2>${title(i)}</h2><p>${t('practice'+i[0].toUpperCase()+i.slice(1)+'Lead')}</p><p class="meta">${t('difficulty')} 0–5 · ${t('styleChoice')}</p></a>`).join('')}</div>`;
    const previous=saved[instrument],g=gText===undefined?previous?.grade:Number(gText),grade=validGrade(g)?g:0;
    const candidate=validStyle(styleText)?styleText:previous?.style??'rock',requested=nText===undefined?gText===undefined?previous?.seed:undefined:Number(nText);
    // An archived score is immutable, including styles formerly available in
    // lower grades. New pieces and ordinary deep links use today's curriculum.
    const archived=validSeed(requested)?AM.bookmarks.fromURL(link(instrument,grade,requested,candidate)):null;
    const style=archived?candidate:C.styleForGrade(grade,candidate),n=validSeed(requested)?requested:nextSeed(instrument,grade,style,previous?.seed);
    const url=link(instrument,grade,n,style);history.replaceState(null,'',url);saved[instrument]={grade,seed:n,style};
    try{localStorage.setItem(K,JSON.stringify(saved));}catch{}
    const bookmark=AM.bookmarks.fromURL(url),result=bookmark?{piece:bookmark.piece,score:bookmark.piece,bytes:AM.practiceGenerator.encode(bookmark.piece)}:C.generate(grade,n,style);
    const {piece,score,bytes}=result;piece.title=pieceTitle(piece);
    const controlsHTML=`<span id="practice-controls"><label>${t('difficulty')} <select id="practice-grade">${Array.from({length:6},(_,i)=>`<option value="${i}"${i===grade?' selected':''}>${t('difficulty')} ${i}</option>`).join('')}</select></label><label>${t('style')} <select id="practice-style">${C.styles.map(s=>{const locked=!C.availableStyles(grade).includes(s);return `<option value="${s}"${s===style?' selected':''}${locked?' disabled':''}>${t('style_'+s)}${locked?' · '+t('styleFromGrade').replace('{grade}',C.styleGrade(s)):''}</option>`;}).join('')}</select></label><button id="practice-new">${t('newPracticePiece')}</button><button id="piece-bookmark" aria-pressed="false">☆ ${t('bookmark')}</button></span>`;
    const partOptions=instruments.map(i=>({id:i,title:title(i),href:link(i,grade,n,style)}));
    const formText=t('pieceForm').replace('{form}',AM.practiceInfo.form(piece)).replace('{written}',piece.uniqueBars).replace('{played}',piece.bars);
    return AM.repertoire.generated(piece,instrument,score,bytes,{partOptions,formText,infoHTML:AM.practiceInfo.html(piece,instrument),controlsHTML,onReady:target=>{
      if(location.hash!==url)return;
      const change=()=>{const nextGrade=Number(target.querySelector('#practice-grade').value),nextStyle=C.styleForGrade(nextGrade,target.querySelector('#practice-style').value);location.hash=link(instrument,nextGrade,nextSeed(instrument,nextGrade,nextStyle,n),nextStyle);};
      target.querySelector('#practice-grade').onchange=change;target.querySelector('#practice-style').onchange=change;
      target.querySelector('#practice-new').onclick=()=>{const nextStyle=C.styleForGrade(grade,style);location.hash=link(instrument,grade,nextSeed(instrument,grade,nextStyle,n),nextStyle);};
      AM.bookmarks.bindPiece(target,piece,instrument,url);
    }});
  }
  return{page,link,identifier,nextSeed,pieceTitle};
})();
