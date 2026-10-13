AM.practice = (() => {
  const t=k=>AM.i18n.t(k),K='a-minor-practice',C=AM.practiceComposer,instruments=C.instruments;
  const labels={guitar:'guitarInstrument',keys:'keyboardInstrument',bass:'bassInstrument',drums:'drums'},title=i=>t(labels[i]),seed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
  const validGrade=g=>Number.isInteger(g)&&g>=0&&g<=5,validSeed=s=>Number.isInteger(s)&&s>=0&&s<=0xffffffff;
  const validStyle=s=>C.styles.includes(s),identifier=n=>'0x'+n.toString(16).padStart(8,'0').toUpperCase();
  const link=(i,g,n,style='rock')=>`#/practice/${i}/${g}/${style}/${identifier(n)}`;
  let saved={};try{const v=JSON.parse(localStorage.getItem(K));for(const i of instruments)if(validGrade(v?.[i]?.grade)&&validSeed(v[i].seed))saved[i]={grade:v[i].grade,seed:v[i].seed,style:validStyle(v[i].style)?v[i].style:'rock'};}catch{}
  function page(spec=''){
    const [instrument,gText,styleText,nText]=spec.split('/');
    if(!instruments.includes(instrument))return `<h1>${t('practiceMode')}</h1><p class="lead">${t('practiceLead')}</p><div class="tracks">${instruments.map(i=>`<a class="track" href="#/practice/${i}"><h2>${title(i)}</h2><p>${t('practice'+i[0].toUpperCase()+i.slice(1)+'Lead')}</p><p class="meta">Grade 0–5 · ${t('styleChoice')}</p></a>`).join('')}</div>`;
    const previous=saved[instrument],g=gText===undefined?previous?.grade:Number(gText),grade=validGrade(g)?g:0;
    const style=validStyle(styleText)?styleText:previous?.style??'rock',requested=nText===undefined?gText===undefined?previous?.seed:undefined:Number(nText),n=validSeed(requested)?requested:seed();
    const url=link(instrument,grade,n,style);history.replaceState(null,'',url);saved[instrument]={grade,seed:n,style};
    try{localStorage.setItem(K,JSON.stringify(saved));}catch{}
    const bookmark=AM.bookmarks.fromURL(url),result=bookmark?{piece:bookmark.piece,score:bookmark.piece,bytes:AM.practiceGenerator.encode(bookmark.piece)}:C.generate(grade,n,style);
    const {piece,score,bytes}=result;piece.title=t('practicePiece')+' · '+t('style_'+style)+' · Grade '+grade+' · '+identifier(n);
    const controlsHTML=`<span id="practice-controls"><label>${t('difficulty')} <select id="practice-grade">${Array.from({length:6},(_,i)=>`<option value="${i}"${i===grade?' selected':''}>Grade ${i}</option>`).join('')}</select></label><label>${t('style')} <select id="practice-style">${C.styles.map(s=>`<option value="${s}"${s===style?' selected':''}>${t('style_'+s)}</option>`).join('')}</select></label><button id="practice-new">${t('newPracticePiece')}</button><button id="piece-bookmark" aria-pressed="false">☆ ${t('bookmark')}</button></span>`;
    const partOptions=instruments.map(i=>({id:i,title:title(i),href:link(i,grade,n,style)}));
    const formText=t('pieceForm').replace('{form}',AM.practiceInfo.form(piece)).replace('{written}',piece.uniqueBars).replace('{played}',piece.bars);
    return AM.repertoire.generated(piece,instrument,score,bytes,{partOptions,formText,infoHTML:AM.practiceInfo.html(piece,instrument),controlsHTML,onReady:target=>{
      if(location.hash!==url)return;
      const change=()=>{location.hash=link(instrument,Number(target.querySelector('#practice-grade').value),seed(),target.querySelector('#practice-style').value);};
      target.querySelector('#practice-grade').onchange=change;target.querySelector('#practice-style').onchange=change;
      target.querySelector('#practice-new').onclick=()=>{let next=seed();if(next===n)next=(next+1)>>>0;location.hash=link(instrument,grade,next,style);};
      AM.bookmarks.bindPiece(target,piece,instrument,url);
    }});
  }
  return{page,link,identifier};
})();
