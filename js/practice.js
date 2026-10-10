AM.practice = (() => {
  const I=AM.i18n,t=I.t,K='a-minor-practice';
  const instruments=['guitar','keys'],title=instrument=>t(instrument==='guitar'?'guitarInstrument':'keyboardInstrument');
  const seed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
  const validGrade=g=>Number.isInteger(g)&&g>=0&&g<=5;
  const validSeed=s=>Number.isInteger(s)&&s>=0&&s<=0xffffffff;
  let saved={};
  try {
    const value=JSON.parse(localStorage.getItem(K));
    for(const instrument of instruments)if(validGrade(value?.[instrument]?.grade)&&validSeed(value[instrument].seed))saved[instrument]={grade:value[instrument].grade,seed:value[instrument].seed};
  } catch {}
  const link=(instrument,grade,n)=>'#/practice/'+instrument+'/'+grade+'/'+n;
  const pieceTitle=(grade,n)=>t('practicePiece')+' · Grade '+grade+' · '+n.toString(16).padStart(8,'0').toUpperCase();
  function page(spec='') {
    const [instrument,gradeText,seedText]=spec.split('/');
    if (!instruments.includes(instrument)) return `<h1>${t('practiceMode')}</h1><p class="lead">${t('practiceLead')}</p><div class="tracks">${instruments.map(k=>`<a class="track" href="#/practice/${k}"><h2>${title(k)}</h2><p>${t(k==='guitar'?'repertoireGuitar':'repertoireKeys')}</p><p class="meta">Grade 0–5 · A–B–A–C · 16 ${t('bars')}</p></a>`).join('')}</div>`;
    const remembered=saved?.[instrument],requestedGrade=gradeText===undefined?remembered?.grade:Number(gradeText);
    const grade=validGrade(requestedGrade)?requestedGrade:0,requestedSeed=seedText===undefined&&remembered?.grade===grade?remembered.seed:seedText===undefined?undefined:Number(seedText);
    const n=validSeed(requestedSeed)?requestedSeed:seed(),url=link(instrument,grade,n);
    history.replaceState(null,'',url);
    saved={...saved,[instrument]:{grade,seed:n}};
    try { localStorage.setItem(K,JSON.stringify(saved)); } catch {}
    const {piece,score,bytes}=AM.practiceGenerator.generate(grade,n);
    piece.title=pieceTitle(grade,n);
    const other=instrument==='guitar'?'keys':'guitar';
    setTimeout(()=>{
      const controls=document.querySelector('#practice-controls');if (!controls || location.hash!==url) return;
      controls.querySelector('select').onchange=e=>{location.hash=link(instrument,Number(e.target.value),seed());};
      controls.querySelector('button').onclick=()=>{let next=seed();if(next===n)next=(next+1)>>>0;location.hash=link(instrument,grade,next);};
    },0);
    return `<nav class="crumbs"><a href="#/practice">${t('practiceMode')}</a> › ${title(instrument)}</nav><h1 class="practice-heading">${t('practiceMode')} · ${title(instrument)}</h1><p class="lead practice-intro">${t('practiceLead')}</p>
      <div class="player" id="practice-controls"><div class="row"><label>${t('difficulty')} <select id="practice-grade">${Array.from({length:6},(_,i)=>`<option value="${i}"${i===grade?' selected':''}>Grade ${i} · ${t('repertoireGrade'+i)}</option>`).join('')}</select></label><button id="practice-new">${t('newPracticePiece')}</button></div></div>
      ${AM.repertoire.generated(piece,instrument,score,bytes,{exerciseId:'practice-'+instrument+'-'+grade+'-'+n,otherPartHref:link(other,grade,n),description:t('practiceGrade'+grade),formText:t('practiceForm')+' · '+t('scale_'+piece.scale)})}`;
  }
  function logEntry(id) {
    const match=/^practice-(guitar|keys)-([0-5])-(\d+)$/.exec(id);if (!match || !validSeed(Number(match[3]))) return;
    const grade=Number(match[2]),n=Number(match[3]);return {title:pieceTitle(grade,n)+' · '+title(match[1]),href:link(match[1],grade,n)};
  }
  return {page,logEntry};
})();
