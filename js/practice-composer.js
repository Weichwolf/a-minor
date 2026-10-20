AM.practiceComposer = (() => {
  const M=AM.music,N=AM.notation,R=AM.practiceRhythm,T=AM.practiceMotifs,D=AM.practiceDesign,clone=x=>JSON.parse(JSON.stringify(x));
  const profiles=AM.practiceCurriculum,styles=[...profiles[5].styles],instruments=['guitar','keys','bass','drums'];
  const availableStyles=grade=>profiles[grade]?.styles??[];
  const styleForGrade=(grade,style)=>availableStyles(grade).includes(style)?style:'rock';
  const styleGrade=style=>profiles.find(p=>p.styles.includes(style))?.grade;
  const voicingCache=new Map(),romans=['I','II','III','IV','V','VI','VII'];
  const styleForms={rock:['ABA','ABAB','ABACAB'],doom:['ABA′','AABA','ABCA'],gothic:['ABA′','ABAB','ABACB'],progressive:['ABA′','ABCA′'],baroque:['AABB','ABA','ABACA'],lounge:['ABA','AABA','ABAC']};
  const styleTextures={rock:['riff','melody','chords'],doom:['riff','melody','riff'],blues:['riff','melody','arpeggio'],gothic:['arpeggio','melody','chords'],progressive:['riff','melody','arpeggio'],baroque:['melody','arpeggio','melody'],lounge:['melody','arpeggio','chords']};
  function random(seed){let state=seed>>>0;return()=>{state+=0x6D2B79F5;let n=Math.imul(state^state>>>15,1|state);n^=n+Math.imul(n^n>>>7,61|n);return((n^n>>>14)>>>0)/4294967296;};}
  function settings(grade,seed,style='rock'){
    if(!Number.isInteger(grade)||grade<0||grade>5||!Number.isInteger(seed)||seed<0||seed>0xffffffff||!availableStyles(grade).includes(style))throw Error('Invalid practice settings');
    const rng=random(seed),pick=xs=>xs[Math.floor(rng()*xs.length)],profile=profiles[grade];
    const modes=style==='blues'?(grade===1?['minorPentatonic']:grade<4?['minorBlues']:['minorBlues','majorBlues']):
      style==='rock'?['major','major','aeolian','minorPentatonic','mixolydian','majorPentatonic']:style==='lounge'?['major','dorian','aeolian','majorPentatonic']:
      style==='baroque'?['major','aeolian','harmonicMinor']:style==='doom'?['aeolian','aeolian','phrygian']:style==='gothic'?['aeolian','dorian','harmonicMinor']:['major','aeolian','dorian','lydian'];
    const scale=pick(modes.filter(s=>profile.scales.includes(s))),harmonyScale=style==='blues'?'major':scale==='minorPentatonic'?'aeolian':scale==='majorPentatonic'?'major':scale;
    const major=['major','mixolydian','lydian'].includes(harmonyScale),maxSignature=profile.maxSignature;
    const keys=Object.keys(M.KEYS).filter(k=>k.endsWith('m')!==major&&Math.abs(M.KEYS[k])<=maxSignature);
    const previousMax=profiles[Math.max(0,grade-1)].maxSignature,newKeys=keys.filter(k=>Math.abs(M.KEYS[k])>previousMax),knownKeys=keys.filter(k=>Math.abs(M.KEYS[k])<=previousMax);
    const key=pick(newKeys.length&&rng()<.5?newKeys:knownKeys),root=key.replace(/m$/,''),iv=M.SCALES[harmonyScale].iv;
    const groove=D.groove(grade,style,grade===5?rng():0);
    const melodicSkills=['melodyReading','melodicRiff','pickedArpeggio','triadArpeggio','majorMinorArpeggio','seventhArpeggio','fifthSixthLine'];
    const roleFocus=Object.fromEntries(instruments.map(role=>{
      let choices=profile.skills[role].filter(f=>groove==='compound'?!/shuffle|swing/i.test(f):groove==='swing'?!/compound/i.test(f):!/compound|shuffle|swing/i.test(f));
      // Balance single-note playing and chord playing independently of the number of skills.
      if(role==='guitar'){const melodic=rng()<.5;choices=choices.filter(f=>melodicSkills.includes(f)===melodic);}
      return[role,pick(choices)];
    }));
    const rhythmicFigure=['pulse','paired','space'][Math.floor(random((seed^0x51ed270b)>>>0)()*3)];
    const time=groove==='compound'?'12/8':groove!=='swing'&&style==='progressive'&&grade>=4&&rng()<.3?pick(['5/8','7/8']):'4/4',meter=M.meter(time),swing=groove==='swing'&&time==='4/4';
    return{rng,pick,profile,scale,harmonyScale,major,key,root,iv,groove,melodicSkills,roleFocus,time,meter,swing,rhythmicFigure};
  }
  function generate(grade,seed,style='rock'){
    const {rng,pick,profile,scale,harmonyScale,major,key,root,iv,groove,melodicSkills,roleFocus,time,meter,swing,rhythmicFigure}=settings(grade,seed,style);
    const blues=style==='blues',melodyIv=M.SCALES[scale].iv,motifPlan=T.plan(grade,seed,style),accent=motifPlan.accent;
    const tempoRange=D.tempoRange(grade,style,time,swing),quarterTempo=tempoRange[0]+Math.floor(rng()*(tempoRange[1]-tempoRange[0]+1)),tempo=Math.round(quarterTempo/meter.q*100)/100;
    const length=pick(profile.sectionLengths);
    const navigation=grade===5&&Object.values(roleFocus).includes('navigation')?(blues?'DC':pick(['DC','DS','Fine'])):null;
    const solo=grade===5&&Object.values(roleFocus).includes('soloReturn'),featured=pick(solo?instruments.filter(role=>roleFocus[role]==='soloReturn'):instruments);
    const splitForm=form=>form.match(/[ABCSO]′?/g);
    const forms=blues?['ABC']:grade===0?(style==='doom'?['AB']:['ABA','ABA′']):grade===1?['ABA','ABA′']:styleForms[style];
    let unit=solo?['A','B','S','A']:splitForm(pick(forms));
    if(navigation)unit=navigation==='DS'?(solo?['A','B','S','C']:['A','B','C']):(solo?['A','S','B']:['A','B']);
    if(blues)unit=['A','B',solo?'S':'C'];
    const names=[...new Set([...unit,...(navigation!=='Fine'?['O']:[])])];
    const bluesAnswer=blues&&accent&&grade>=2&&!navigation;
    if(bluesAnswer)names.splice(names.indexOf('O'),0,'B′');
    const sizes=Object.fromEntries(names.map(name=>[name,blues||name==='O'?4:length]));
    const shorten=name=>{for(const related of names)if(related.replace('′','')===name.replace('′',''))sizes[related]=4;};
    for(const name of [...names].reverse()){if(Object.values(sizes).reduce((n,v)=>n+v,0)<=24)break;shorten(name);}
    const formOptions={grade,unit,sizes,navigation,blues,bluesAnswer,range:tempoRange,requested:quarterTempo,time};
    // A long written phrase must also fit the grade at the slow end of the
    // style range. Keep source/variation lengths together when shortening.
    for(const name of [...names].reverse()){
      const slow=D.form({...formOptions,range:[tempoRange[0],tempoRange[0]]});
      if(Math.abs(slow.duration/profile.durationSeconds-1)<=profile.durationTolerance)break;
      if(sizes[name]===8)shorten(name);
    }
    let planned=D.form(formOptions),order=planned.order,repeatCount=planned.copies;
    // Most pieces develop contrasting sections; occasional focused pieces retain one texture.
    const contrasting=rng()<.85||blues||!!accent,sourceName=name=>name.replace('′',''),sectionPlans={},focusSections={};
    const focusTexture=role=>role==='guitar'?(/melodicRiff|fifthSixthLine/.test(roleFocus.guitar)?'riff':/Arpeggio/.test(roleFocus.guitar)?'arpeggio':/melodyReading|registerChanges|soloReturn/.test(roleFocus.guitar)?'melody':'chords'):
      /rightTriads|chordsWithBass|homorhythm|chordChanges|seventhVoicing/.test(roleFocus.keys)?'chords':'melody';
    for(const role of ['guitar','keys']){
      const textures=styleTextures[style].map(texture=>grade===0&&texture==='arpeggio'?'riff':texture),wanted=focusTexture(role);
      let slot=['A','B','C'].find((name,i)=>names.includes(name)&&textures[i]===wanted);
      if(role==='guitar'&&roleFocus.guitar==='registerChanges')slot='B';
      if(!slot)slot=names.includes('C')?'C':['gothic','baroque','lounge'].includes(style)?'B':'A';
      if(blues&&wanted==='chords')slot='A';
      focusSections[role]=slot;
      for(const name of names){const source=sourceName(name),index=source==='B'?1:source==='C'?2:0;
        const texture=!contrasting?wanted:source===slot?wanted:textures[index];
        (sectionPlans[name]??={})[role]=texture;
      }
      // An inserted grade focus must not erase the contrast between A and B.
      if(contrasting&&sectionPlans.A[role]===sectionPlans.B[role]){
        const other=slot==='B'?'A':'B';sectionPlans[other][role]=wanted==='melody'?'riff':'melody';
      }
      for(const name of names)if(name.endsWith('′'))sectionPlans[name][role]=sectionPlans[sourceName(name)][role];
      if(sectionPlans.S)sectionPlans.S[role]=featured===role?'melody':featured===(role==='guitar'?'keys':'guitar')?(role==='guitar'?'rest':'chords'):'chords';
    }
    for(const name of names){const source=sourceName(name),light=contrasting&&source==='B',build=contrasting&&source==='C';
      Object.assign(sectionPlans[name],{bass:light?'support':'moving',drums:light?'lightGroove':build?'build':'riffGroove'});
    }
    for(const [name,plan] of Object.entries(sectionPlans)){
      if(plan.guitar==='chords')plan.guitar='power';
      const source=sourceName(name);
      plan.lead=name==='S'?featured:source===focusSections.guitar?'guitar':source===focusSections.keys?'keys':source==='B'?'keys':'guitar';
    }
    const pitch=(degree,octave)=>M.scaleName(M.midi(root+octave)+iv[((degree%7)+7)%7]+Math.floor(degree/7)*12,root,harmonyScale);
    const spell=m=>M.scaleName(m,root,scale),pcAt=d=>M.pc(M.midi(pitch(d,2)));
    const lowest=(pc,min)=>{let m=min;while(M.pc(m)!==M.pc(pc))m++;return m;};
    function harmony(degree,alteration=0,quality){
      const triad=M.chord(root,harmonyScale,degree),q=quality??triad.quality,rpc=M.pc(pcAt(degree)+alteration),intervals=q==='m'?[0,3,7]:q==='°'?[0,3,6]:q==='+'?[0,4,8]:[0,4,7];
      const accidental=iv[degree]-M.SCALES.major.iv[degree]+alteration,prefix=accidental<0?'b'.repeat(-accidental):'#'.repeat(accidental);
      const seventh=grade>=3&&(q!=='°')&&(blues||/seventh|swingComping|rhythmChart/i.test(roleFocus.guitar+' '+roleFocus.keys)||style==='lounge');
      // Major-chord sevenths follow the mode (e.g. IV7 in Dorian, bVII7
      // in Aeolian). Minor chords retain the common minor-seventh colour,
      // including modal mixture when the melody uses harmonic minor.
      if(seventh)intervals.push(blues||q==='m'?10:M.pc(pcAt((degree+6)%7)-rpc)===10?10:11);
      const rp=M.parse(pitch(degree,2)),acc=rp.acc+alteration,rootName=rp.letter+(acc<0?'b'.repeat(-acc):'#'.repeat(acc));
      const suffix=seventh?(q==='m'?'m7':(intervals[3]===11?'maj7':'7')+(q==='+'?'#5':'')):q;
      return{degree,alteration,quality:q,pcs:intervals.map(i=>M.pc(rpc+i)),rootPc:rpc,root:rootName,chord:rootName+suffix,
        roman:prefix+(q==='m'||q==='°'?romans[degree].toLowerCase():romans[degree])+(q==='°'?'°':q==='+'?'+':'')+(seventh?(intervals[3]===11?'maj7':'7'):'')};
    }
    // Original harmonic grammars: these are functional degree plans, not
    // transcriptions of songs. Each piece keeps its selected plan on returns.
    const harmonicPlans={
      rock:[[0,0,3,0],[0,3,4,0],[0,0,6,0]],
      doom:[[0,0,5,0],[0,5,6,0],[0,0,6,0]],
      gothic:[[0,5,6,0],[0,3,4,0],[0,6,5,0]],
      progressive:[[0,3,0,4],[0,6,3,0],[0,3,5,4]],
      baroque:[[0,3,4,0],[0,1,4,0],[0,4,4,0]],
      lounge:[[0,3,4,0],[0,1,4,0],[0,0,3,0]],
      blues:[[0,0,0,0],[0,3,0,0],[0,0,0,0]]
    };
    const themeHarmony=pick(harmonicPlans[style]);
    const cadenceDegree=style==='doom'?(scale==='phrygian'?1:6):style==='rock'&&seed%2===0?3:4;
    function progression(name,count){
      if(blues){
        const degrees=sourceName(name)==='A'?themeHarmony:sourceName(name)==='B'?[3,3,0,0]:name==='O'?[4,3,4,0]:[4,3,0,4];
        return degrees.map(d=>harmony(d));
      }
      const base=themeHarmony,source=sourceName(name),answer=style==='baroque'||style==='lounge'?[3,1,4,0]:style==='gothic'?[5,3,6,4]:style==='doom'?[5,5,6,4]:[3,0,5,4];
      return Array.from({length:count},(_,i)=>{
        // Early contrasts share the progression; later bridges prepare the return harmonically.
        let d=name==='O'?[3,4,cadenceDegree,0][i%4]:source==='C'?[5,3,1,4][i%4]:grade>=2&&(source==='B'||source==='S')?answer[i%4]:base[i%4];
        // An eight-bar phrase has an open midpoint and a prepared answer,
        // rather than two identical four-bar harmonic loops.
        if(count===8&&i===3)d=cadenceDegree;
        if(count===8&&i===6||name===order.at(-1)&&i===count-2)d=cadenceDegree;
        if(count===8&&i===7||name===order.at(-1)&&i===count-1)d=0;
        // In the beginner position some dominant roots have no low adjacent-
        // string power chord (notably C# in F# minor on P4). A plagal close
        // keeps the key and musical function of a prepared return without
        // introducing a two-octave register jump merely to satisfy a pattern.
        if(grade===0&&d===4&&Object.values(sectionPlans).some(p=>p.guitar==='power')){
          const dominant=pcAt(d),lowPower=M.TUNING.slice(0,-1).some((open,s)=>{
            const m=lowest(dominant,M.midi(open)),f=m-M.midi(open),upper=m+7-M.midi(M.TUNING[s+1]);
            return m<60&&f<=profile.maxFret&&upper>=0&&upper<=profile.maxFret;
          });
          if(!lowPower)d=3;
        }
        if(grade===0&&major&&d===6)d=3;
        if(d===6&&(grade===0||style==='rock'))return harmony(6,major&&scale!=='mixolydian'?-1:0,'');
        if(d===4&&grade>=3&&['aeolian','harmonicMinor'].includes(scale)&&(name==='O'||source==='C'||i===count-2))return harmony(d,0,'');
        return harmony(d);
      });
    }
    const spellChord=(m,h)=>{
      const degree=h.pcs.indexOf(M.pc(m));if(degree<0)return spell(m);
      const letter=M.LETTERS[(M.LETTERS.indexOf(h.root[0])+2*degree)%7],natural=M.pc(M.midi(letter+'4')),acc=M.pc(M.pc(m)-natural+6)-6;
      return letter+(acc<0?'b'.repeat(-acc):'#'.repeat(acc))+((m-natural-acc)/12-1);
    };
    const atHarmony=(h,t)=>h.changes?.findLast(c=>c.t<=t+1e-9)?.h??h;
    const voiced=(pattern,h,play)=>{let at=0;return pattern.map((n,i)=>{const now=at;at+=N.dur(n.d);return n.r?n:{...n,...play(atHarmony(h,now),i,n,now)};});};
    let previousKeys={},previousPower=null,previousBass=null;
    const melodicHistory=new Map();
    function remember(name,bar){
      for(const [voice,hand] of [['notes','right'],['bass','left']]){
        const last=bar.keys[voice]?.findLast(n=>!n.r);
        if(last){previousKeys[hand]=[].concat(last.p).map(M.midi);if(!Array.isArray(last.p))melodicHistory.set('keys:'+name+':'+(hand==='left'?'low':'high'),M.midi(last.p));}
      }
      const last=bar.guitar.notes.findLast(n=>!n.r);
      if(last){if(Array.isArray(last.p))previousPower=M.midi(last.p[0]);else for(const register of ['low','high'])melodicHistory.set('guitar:'+name+':'+register,M.midi(last.p));}
      const bass=bar.bass.findLast(n=>!n.r);if(bass)previousBass=M.midi(bass.p);
      return bar;
    }
    function keyVoicing(h,center,size=Math.min(grade===0?3:4,h.pcs.length)){
      const pcs=h.pcs.slice(0,size),choices=[];
      const floor=center<60?36:60,ceiling=center<60?59:84;
      for(let m=Math.max(floor,Math.floor(center)-12);m<=Math.min(ceiling,Math.floor(center)+5);m++)if(pcs.includes(M.pc(m))){const ps=[m];for(let k=m+1;k<=Math.min(m+11,ceiling)&&ps.length<pcs.length;k++)if(pcs.includes(M.pc(k)))ps.push(k);if(ps.length===pcs.length)choices.push(ps);}
      if(!choices.length)throw Error('Unplayable keyboard chord');
      const previous=previousKeys[center<60?'left':'right'];
      const cost=ps=>Math.abs(ps.reduce((s,p)=>s+p,0)/ps.length-center)*(accent&&style==='lounge'?.1:.25)+(previous?ps.reduce((sum,p)=>sum+Math.min(...previous.map(q=>Math.abs(q-p))),0):0);
      choices.sort((a,b)=>cost(a)-cost(b));return choices[0].map(m=>spellChord(m,h));
    }
    function guitarPower(h){
      const tag=h.rootPc+':'+profile.maxFret;
      if(!voicingCache.has(tag)){
        const options=[];
        for(let string=0;string<5;string++)for(let fret=0;fret<=profile.maxFret;fret++){
          const rootMidi=M.midi(M.TUNING[string])+fret,fifthMidi=rootMidi+7,fifthFret=fifthMidi-M.midi(M.TUNING[string+1]);
          if(M.pc(rootMidi)===h.rootPc&&fifthFret>=0&&fifthFret<=profile.maxFret)options.push({midis:[rootMidi,fifthMidi],s:[string,string+1],score:rootMidi+fret*2});
        }
        options.sort((a,b)=>a.score-b.score);if(!options.length)throw Error('Unplayable guitar power chord');voicingCache.set(tag,options);
      }
      const options=voicingCache.get(tag);
      // Retain the random stream for the other parts, but never pick an
      // unrelated octave just to create variety in a chord progression.
      if(grade>0)pick(rng()<.85?options.slice(0,3):options);
      const anchor=previousPower??lowest(M.rootPc(root),40);
      const chosen=options.reduce((a,b)=>Math.abs(a.midis[0]-anchor)+a.score*.01<=Math.abs(b.midis[0]-anchor)+b.score*.01?a:b);
      previousPower=chosen.midis[0];
      return{p:chosen.midis.map(m=>spellChord(m,h)),s:[...chosen.s]};
    }
    const contour=[...motifPlan.degrees];if(rng()<.5)contour.splice(4,4,...contour.slice(4).reverse());
    if(grade===0)for(let i=0;i<contour.length;i++)contour[i]=Math.min(2,contour[i]);
    const motif=Object.fromEntries(instruments.map(role=>[role,[rhythm(role,0),rhythm(role,1)]]));
    const pulsePattern=d=>R.pulse(d,Math.round(meter.len/N.dur(d)),'C4').map(({d})=>({d}));
    const flowing=pulsePattern(meter.compound?'e':grade===0?'q':'e');
    const singing=time==='4/4'?[rhythmicFigure==='space'?[{d:'h'},{d:'h'}]:rhythmicFigure==='paired'?pulsePattern('q'):[{d:'q'},{d:'q'},{d:'h'}],[{d:'h'},{d:'q'},{d:'q'}]]:
      meter.compound?[pulsePattern('q.'),[{d:'h.'},{d:'q.'},{d:'q.'}]]:
      [R.generate({shortest:'e',dotted:true},{rng,length:meter.len}),R.generate({shortest:'e',dotted:true},{rng,length:meter.len})];
    const themeFor=(name,bar)=>T.contour(contour,{style,accent,section:sourceName(name),bar,variation:name.endsWith('′')});
    function partPattern(role,name,bar){
      const texture=sectionPlans[name][role];
      let pattern=!contrasting||sourceName(name)===focusSections[role]?motif[role][bar%2]:texture==='melody'?singing[bar%2]:
        ['chords','power'].includes(texture)?(time==='4/4'?pulsePattern(style==='doom'?'h':'q'):singing[bar%2]):flowing;
      if(accent&&sourceName(name)==='B'&&sourceName(name)!==focusSections[role]&&time==='4/4'){
        if(['doom','lounge','gothic','rock'].includes(style)&&texture==='melody')pattern=bar%2?[{d:'q'},{d:'q'},{d:'h'}]:[{d:'h'},{d:'h'}];
        if(style==='lounge'&&grade>=4&&bar%2===0)pattern=[{r:1,d:'e'},{d:'q.'},{d:'h'}];
        if(style==='progressive'&&grade>=4&&bar%2===0)pattern=[{r:1,d:'e'},{d:'q.'},{d:'q'},{d:'q'}];
      }
      if(role==='guitar'&&/Arpeggio/.test(roleFocus.guitar)&&sourceName(name)===focusSections.guitar&&bar%4===0&&pattern.filter(n=>!n.r).length<4){
        pattern=[...Array.from({length:4},()=>({d:'e'})),...R.generate({...profile.rhythms.guitar,triplets:false},{rng,length:meter.len-2,restChance:.05})];
      }
      // Give the line room to arrive. The other bars retain the selected
      // technique, including fast values; a phrase ending need not stay busy.
      if(texture==='melody'&&(bar===sizes[name]-1||sizes[name]===8&&bar===3)){
        pattern=time==='4/4'?(bar===3&&sizes[name]===8?[{d:'h'},{d:'h'}]:singing[0]):meter.compound?singing[1]:R.held('C4',time).map(({d,tie})=>({d,...(tie?{tie}: {})}));
      }
      // Even a held-chord theme gets an audible, grade-safe change in its returning phrase.
      if(name.endsWith('′')&&bar===sizes[name]-2){
        const choices=time==='4/4'?[[{d:'h'},{d:'h'}],...singing]:meter.compound?[[{d:'h.'},{d:'h.'}],pulsePattern('q.')]:[R.held('C4',time).map(({d})=>({d})),flowing];
        pattern=choices.find(p=>JSON.stringify(p)!==JSON.stringify(pattern))??pattern;
      }
      // Supporting melody lines breathe while the other part carries the
      // section. The selected instrumental focus keeps its original cell.
      if(sectionPlans[name].lead!==role&&sourceName(name)!==focusSections[role]&&texture==='melody'&&style!=='baroque')pattern=clone(singing[bar%2]);
      return clone(pattern);
    }
    function rhythm(role,variant=0){
      const rp={...profile.rhythms[role],triplets:profile.rhythms[role].triplets&&groove!=='compound'&&!swing};
      if(swing)rp.shortest='e';
      const focus=roleFocus[role];let ds;
      if(/shuffleRiff|shuffleBass|swingComping/.test(focus)&&variant===0)return R.pulse('e',meter.len*2,'C4').map(({d})=>({d}));
      if(focus==='ties'&&variant===1)return[{r:1,d:'e'},{d:'q'},...R.generate(rp,{rng,length:meter.len-1.5,restChance:.05})];
      if(role==='guitar'&&grade===0&&focus==='heldPower')return R.held('E2',time).map(({d,tie})=>({d,...(tie?{tie:1}:{})}));
      if(role==='guitar'&&melodicSkills.includes(focus)&&grade===0)return R.pulse(variant?'h':'q',variant?2:4,'C4').map(({d})=>({d}));
      if(role==='guitar'&&/melodicRiff|Arpeggio|fifthSixthLine/.test(focus)&&grade<4)return R.pulse('e',8,'C4').map(({d})=>({d}));
      if(focus==='quarterPower')return R.pulse('q',meter.len,'C4').map(({d})=>({d}));
      if(role==='bass'&&focus==='rootQuarters')return R.pulse('q',meter.len,'C2').map(({d})=>({d}));
      if(role==='keys'&&grade===0&&focus==='heldValues')return R.pulse('h',2,'C4').map(({d})=>({d}));
      if(/syncop/i.test(focus))return[{r:1,d:'e'},{d:'q.'},...R.generate(rp,{rng,length:meter.len-2,restChance:.08,required:variant?'e':undefined})];
      if(time==='12/8'&&focus==='tripletPickup')return[{r:1,d:'h.'},{r:1,d:'q.'},...Array.from({length:3},()=>({d:'e'}))];
      if(grade===5&&focus==='tripletPickup'&&!meter.compound){
        const lead=time==='5/8'?[{r:1,d:'q.'}]:time==='7/8'?[{r:1,d:'h'},{r:1,d:'e'}]:[{r:1,d:'h'},{r:1,d:'q'}];
        return[...lead,...Array.from({length:3},(_,i)=>({d:'et',...(i===0?{tuplet:3}:i===2?{tupletEnd:true}:{})}))];
      }
      if(time==='12/8')return R.generate({...rp,dotted:true,triplets:false},{rng,length:meter.len,restChance:.07,required:variant?'e':'q.'});
      if(meter.d===8)return R.generate({...rp,dotted:true},{rng,length:meter.len,restChance:.05});
      const pulse=grade===0&&['guitar','keys'].includes(role)?(rhythmicFigure==='space'?'h':rhythmicFigure==='paired'?'q':pick(['q','h','w'])):rhythmicFigure==='space'?'q':rhythmicFigure==='paired'?'e':pick(['q','e']);
      if(role==='guitar'&&/sixteenth/.test(focus))ds=R.generate(rp,{rng,length:4,dense:true,required:'s',restChance:.06});
      else if(/eighthPower|palmMute|rootEighths|eighthBass|octaveBass|fifthBass|movingBass|passingBass|scaleBass|arpeggioBass|registerChanges/.test(focus))ds=R.pulse('e',8,'C4').map(({d})=>({d}));
      else if(role==='bass'&&/walking/.test(focus))ds=R.pulse('q',4,'C2').map(({d})=>({d}));
      else if(/syncop|dotted|ties/i.test(focus)||rng()<.4)ds=R.generate(rp,{rng,length:4,required:grade>=4&&variant?'s':undefined,restChance:grade>=2?.1:.04});
      else ds=R.pulse(pulse,4/N.dur(pulse),'C4').map(({d})=>({d}));
      if(/rests|stops/.test(focus)){if(ds.length===1)ds=[{d:'h'},{d:'h'}];ds[ds.length-1].r=1;}
      if(grade>=4&&/syncop|ties/i.test(focus)&&ds.length>1)ds[0].r=1;
      return ds;
    }
    function line(h,name,bar,role,register){
      const pattern=partPattern(role,name,bar),notes=[],theme=themeFor(name,bar),historyKey=role+':'+name+':'+(register<60?'low':'high'),phraseShape=T.phrase(grade,bar,sizes[name]);let lastLeap=0,previous=melodicHistory.get(historyKey)??register,at=0;
      const tonicAnchor=role==='guitar'||grade===0?register:lowest(M.rootPc(root),register-5);
      const candidates=[];for(let m=register-(role==='guitar'||grade===0?0:7);m<=register+(grade===0?7:12);m++)if(m>=36&&m<=84&&(M.scalePcs(root,scale).includes(M.pc(m))||h.pcs.includes(M.pc(m))))candidates.push(m);
      for(let i=0;i<pattern.length;i++){
        const n=pattern[i];if(n.r){notes.push(n);at+=N.dur(n.d);continue;}
        const current=atHarmony(h,at),arrival=i===pattern.length-1&&(bar===sizes[name]-1||sizes[name]===8&&bar===3),chord=at===0||Math.abs(at-2)<1e-9||arrival,sequence=style==='baroque'&&sourceName(name)==='B'?(accent?Math.floor(bar/2)%2:bar%3):0;
        const development=phraseShape.lift;
        const degree=theme[(i+bar%2*2+(name.endsWith('′')?1:0))%theme.length]+sequence+development,desired=arrival&&current.degree===0?tonicAnchor:tonicAnchor+melodyIv[Math.min(melodyIv.length-1,degree)];
        const pool=chord?candidates.filter(m=>current.pcs.includes(M.pc(m))):candidates;
        const sorted=(pool.length?pool:candidates).sort((a,b)=>Math.abs(a-desired)+Math.abs(a-previous)*.45-Math.abs(b-desired)-Math.abs(b-previous)*.45);
        const recovery=sorted.filter(m=>Math.abs(m-previous)<=4&&(m-previous)*lastLeap<0);
        const midi=Math.abs(lastLeap)>5&&!arrival&&recovery.length?recovery[0]:sorted[0];lastLeap=midi-previous;notes.push({...n,p:spellChord(midi,current),...(grade>=2&&i===0?{accent:1}:{})});previous=midi;at+=N.dur(n.d);
      }
      const phrase=bluesPhrase(notes,bar,role),last=phrase.findLast(n=>!n.r);
      if(last)melodicHistory.set(historyKey,M.midi(last.p));return phrase;
    }
    function bluesPhrase(notes,bar,role){
      if(!blues)return notes;
      // A short blue note resolves locally; it is never a random sustained
      // replacement for a chord tone. Keep arpeggios purely harmonic.
      if(grade>=2&&bar%4===1){
        const i=roleFocus[role]==='ties'?-1:notes.findIndex((n,i)=>i>0&&!n.r&&n.d==='q');
        const pair=i<0?notes.findIndex((n,i)=>!n.r&&n.d==='e'&&notes[i+1]?.d==='e'&&!notes[i+1].r):i;
        if(pair>=0){
          const n=notes[pair],target=M.midi(n.p),bluePc=M.pc(M.rootPc(root)+(scale==='majorBlues'?3:6));
          const candidates=[];for(let m=36;m<=83;m++)if(M.pc(m)===bluePc&&(role!=='guitar'||M.position(m+1,{maxFret:profile.maxFret})&&M.position(m,{maxFret:profile.maxFret})))candidates.push(m);
          const blue=candidates.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0];
          if(blue!==undefined){const first={d:'e',p:spell(blue)},second={d:'e',p:spell(blue+1)};notes.splice(pair,n.d==='q'?1:2,first,second);}
        }
      }
      // Leave an audible answer-space at the end of the second bar of each
      // two-bar thought, while preserving focus-specific pickup patterns.
      if(bar%2===1){const last=notes.at(-1);if(last&&!last.r&&['q','h'].includes(last.d))notes[notes.length-1]={r:1,d:last.d};}
      return notes;
    }
    function figure(h,name,bar,role,register,texture,pattern=partPattern(role,name,bar)){
      if(texture==='melody')return line(h,name,bar,role,register);
      const theme=themeFor(name,bar);let attacks=0;
      const notes=voiced(pattern,h,(current,i)=>{
        const base=lowest(current.rootPc,register);
        if(role==='guitar'&&roleFocus.guitar==='fifthSixthLine'&&texture==='riff')return{p:spellChord(base+[0,7,0,9][i%4],current)};
        const tones=texture==='arpeggio'?current.pcs.map(pc=>lowest(pc,base)).sort((a,b)=>a-b):
          [base,...Array.from({length:7},(_,j)=>base+j+1).filter(m=>M.scalePcs(root,scale).includes(M.pc(m)))];
        const establish=role==='guitar'&&texture==='arpeggio'&&/Arpeggio/.test(roleFocus.guitar)&&sourceName(name)===focusSections.guitar&&bar%4===0&&attacks<4;
        const index=establish?(tones.length===4?[0,2,1,3]:[0,2,1,2])[attacks]:theme[(i+bar%2*2+(name.endsWith('′')?1:0))%theme.length]+(accent&&style==='baroque'?Math.floor(bar/2):0);
        attacks++;
        return{p:spellChord(tones[index%tones.length],current)};
      });
      return texture==='arpeggio'?notes:bluesPhrase(notes,bar,role);
    }
    function guitarPart(h,name,bar){
      const focus=roleFocus.guitar,planned=sectionPlans[name].guitar;
      // A perfect fifth must belong to every harmony in a power-chord bar.
      // Diminished/augmented harmonies are picked one note at a time instead.
      const fallback=planned==='power'&&[h,...(h.changes||[]).map(c=>c.h)].some(current=>!current.pcs.includes(M.pc(current.rootPc+7)));
      const texture=fallback?'arpeggio':planned;
      if(texture==='rest')return{texture,notes:R.held('E2',time,true),bass:R.held('E2',time,true)};
      if(texture!=='power'){
        const register=texture==='melody'?lowest(M.rootPc(root),grade>=3&&sourceName(name)==='B'?53:48):48;
        const notes=figure(h,name,bar,'guitar',register,texture,fallback?pulsePattern(grade===0?'q':'e'):partPattern('guitar',name,bar));
        return{texture,notes:notes.map(n=>{if(n.r)return n;const pos=M.position(M.midi(n.p),{maxFret:profile.maxFret});if(!pos)throw Error('Unplayable guitar melody');return{...n,s:pos.s};}),bass:R.held('E2',time,true)};
      }
      const voicing=guitarPower(h),notes=voiced(partPattern('guitar',name,bar),h,(current,i,n)=>{
        let v=current===h?voicing:guitarPower(current);
        if(focus==='chromaticPower'&&bar%4===2&&i>0){const delta=i%3,shifted={...current,root:M.pcName(current.rootPc+delta,M.usesFlats(key)),rootPc:M.pc(current.rootPc+delta),pcs:current.pcs.map(pc=>M.pc(pc+delta))};v=guitarPower(shifted);}
        return{...n,...clone(v),...(grade>=1&&i%2===0&&/palmMute|eighthPower/.test(focus)?{palmMute:1}:{}),...(grade>=3&&i===0?{accent:1}:{})};
      });
      return{texture,notes,bass:R.held('E2',time,true),...(focus==='rhythmChart'?{rhythmSlash:true}:{})};
    }
    function keysPart(h,name,bar){
      const focus=roleFocus.keys;if(name==='S'&&featured==='guitar')return{notes:R.held(keyVoicing(h,70),time),bass:R.held(spell(lowest(h.rootPc,36)),time)};
      const texture=sectionPlans[name].keys,melody=texture!=='chords';
      let notes=melody?figure(h,name,bar,'keys',texture==='melody'?(grade===0?lowest(M.rootPc(root),60):70):60,texture):voiced(partPattern('keys',name,bar),h,current=>({p:keyVoicing(current,70)}));
      let bass;
      if(grade===0)bass=R.held('C3',time,true);
      else if(grade===1&&/leftTriads|melodyOver/.test(focus)||grade>=3&&melody){
        const ps=keyVoicing(h,49),independent=grade>=4&&/independentHands|swingComping/.test(focus)&&sourceName(name)===focusSections.keys,pattern=grade===1||grade===3?(h.changes?R.pulse('h',2,ps):R.held(ps,time)):independent?R.generate({...profile.rhythms.keys,shortest:swing?'e':profile.rhythms.keys.shortest,triplets:false},{rng,length:meter.len,restChance:.2,required:swing?'e':'s'}):partPattern('keys',name,bar);bass=voiced(pattern,h,current=>({p:keyVoicing(current,49)}));
      }else{
        const bm=lowest(h.rootPc,36),pattern=grade===1?(h.changes?R.pulse('h',2,spell(bm)):R.held(spell(bm),time)):partPattern('keys',name,bar);
        bass=voiced(pattern,h,(current,i)=>({p:spellChord(lowest(current.rootPc,36)+(grade>=2&&i%2?7:0),current)}));
      }
      if(focus==='handDialogue'&&(!contrasting||sourceName(name)===focusSections.keys)){
        const leftTurn=bar%2===1;
        if(leftTurn){bass=line(h,name,bar,'keys',49);notes=R.held('C4',time,true);}
        else{notes=line(h,name,bar,'keys',70);bass=R.held('C3',time,true);}
      }
      if(focus==='chromaticColour'&&sourceName(name)===focusSections.keys&&notes.some(n=>!n.r)){
        const i=notes.findLastIndex(n=>!n.r),target=notes[i],ps=[].concat(target.p),top=M.midi(ps.at(-1)),scalePcs=M.scalePcs(root,scale);
        const neighbour=[top-1,top+1].find(m=>m>=36&&m<=84&&!scalePcs.includes(M.pc(m))&&!ps.slice(0,-1).some(p=>M.midi(p)===m));
        if(neighbour!==undefined){
          const p=Array.isArray(target.p)?ps.map((p,j)=>j===ps.length-1?spell(neighbour):p):spell(neighbour);
          const split={w:'h',h:'q',q:'e'}[target.d];
          // Resolve the chromatic approach locally instead of leaving a
          // randomly lowered phrase ending without a destination.
          if(split)notes.splice(i,1,{...target,p,d:split},{...target,d:split});
          else{const before=notes.findLastIndex((n,j)=>j<i&&!n.r);if(before>=0)notes[before]={...notes[before],p};}
        }
      }
      if(grade>=3&&['gothic','baroque'].includes(style)&&melody){
        const right=notes.filter(n=>!n.r&&typeof n.p==='string'),rising=right.length>1&&M.midi(right.at(-1).p)>M.midi(right[0].p);
        bass=voiced(pulsePattern('e'),h,(current,i)=>{
          const tones=keyVoicing(current,49);
          if(accent&&style==='baroque'&&sourceName(name)!==focusSections.keys)tones.sort((a,b)=>(rising?-1:1)*(M.midi(a)-M.midi(b)));
          return{p:tones[i%3]};
        });
      }
      if(name==='S'&&featured==='bass'||name==='S'&&featured==='drums'){notes=R.held(keyVoicing(h,70),time);bass=R.held('C3',time,true);}
      if(grade>=2&&sectionPlans[name].lead==='guitar'&&sourceName(name)!==focusSections.keys&&style!=='baroque')bass=R.held(spell(lowest(h.rootPc,36)),time);
      let inner;
      if(grade===5&&focus==='independentHands'&&texture==='melody'&&sourceName(name)===focusSections.keys&&name!=='O'&&notes.every(n=>n.r||!Array.isArray(n.p))){
        const middle=keyVoicing(h,67,3).slice(0,2);
        const permitted=new Set([...M.scalePcs(root,scale),...h.pcs,...(h.changes||[]).flatMap(c=>c.h.pcs)]),available=[];
        for(let m=M.midi(middle.at(-1))+1;m<=M.midi(middle[0])+12;m++)if(permitted.has(M.pc(m)))available.push(m);
        notes=notes.map(n=>n.r?n:{...n,p:spell(available.reduce((best,m)=>Math.abs(m-M.midi(n.p))<Math.abs(best-M.midi(n.p))?m:best,available[0]))});
        inner=rng()<.5?R.held(middle,time):R.generate({shortest:'q',dotted:true},{rng,length:meter.len,restChance:.12}).map(n=>n.r?n:{...n,p:clone(middle)});
      }
      return{notes,bass,...(inner?{inner}:{})};
    }
    function bassPart(h,name,bar,nextHarmony){
      const focus=roleFocus.bass,support=sectionPlans[name].bass==='support'&&name!=='S';
      let pattern=support?clone(meter.compound?pulsePattern('q.'):meter.d===8?singing[bar%2]:pulsePattern('q')):clone(motif.bass[bar%2]);
      if(accent&&support&&['doom','lounge'].includes(style)&&focus!=='rootQuarters')pattern=R.held('C2',time).map(({d,tie})=>({d,...(tie?{tie}:{})}));
      return voiced(pattern,h,(current,i,n,at)=>{
        let bm=lowest(current.rootPc,28);
        if(accent&&style==='lounge'&&support&&focus!=='registerChanges'&&previousBass!==null){const roots=[bm,bm+12].filter(m=>m<=47&&M.position(m,{tuning:M.BASS_TUNING,maxFret:profile.maxFret}));bm=roots.sort((a,b)=>Math.abs(a-previousBass)-Math.abs(b-previousBass))[0]??bm;}
        const third=M.pc(current.pcs[1]-current.rootPc),fifth=M.pc(current.pcs[2]-current.rootPc);
        const scaleSteps=Array.from({length:13},(_,d)=>d).filter(d=>M.scalePcs(root,scale).includes(M.pc(bm+d)));
        let interval=support?0:focus==='octaveBass'&&i%2?12:focus==='fifthBass'?[0,fifth,0,fifth][i%4]:focus==='arpeggioBass'?[0,third,fifth,12,fifth,third,fifth,0][i%8]:focus==='walkingBass'?[0,third,fifth,0][i%4]:/scaleBass|movingBass/.test(focus)?scaleSteps[[0,1,2,3,4,3,2,1][i%8]%scaleSteps.length]:0;
        if(!support&&/scaleBass|movingBass/.test(focus)&&(at===0||at===2))interval=at===0?0:fifth;
        if(!support&&i===pattern.length-1&&nextHarmony){
          const nextRoot=lowest(nextHarmony.rootPc,28),below=bm+fifth-12;
          if(focus==='fifthBass'&&interval===fifth&&below>=28&&Math.abs(below-nextRoot)<Math.abs(bm+interval-nextRoot)&&M.position(below,{tuning:M.BASS_TUNING,maxFret:profile.maxFret}))interval-=12;
          if(focus==='octaveBass'&&Math.abs(bm+interval-nextRoot)>12)interval=0;
        }
        // A passing/approach tone has a destination. Root-reading patterns do
        // not acquire unrelated pitches from per-note random choices.
        if(!support&&/passingBass|walkingBass|chromaticBass/.test(focus)&&i===pattern.length-1&&nextHarmony){
          const target=lowest(nextHarmony.rootPc,28);
          const approaches=(focus==='chromaticBass'?[-1,1]:[-1,1,-2,2]).map(d=>target+d).filter(m=>m>=28&&m<=55&&(focus==='chromaticBass'||M.scalePcs(root,scale).includes(M.pc(m)))&&M.position(m,{tuning:M.BASS_TUNING,maxFret:profile.maxFret}));
          if(approaches.length)interval=approaches.sort((a,b)=>Math.abs(a-bm)-Math.abs(b-bm))[0]-bm;
        }
        if(name==='S'&&featured==='bass')interval=[0,7,12,10,7,M.pc(current.pcs[1]-current.rootPc),2,0][i%8];
        if(focus==='registerChanges'&&name==='B')interval+=12;
        let midi=bm+interval;while(midi>61)midi-=12;const pos=M.position(midi,{tuning:M.BASS_TUNING,maxFret:profile.maxFret});if(!pos){midi-=12;}
        const final=M.position(midi,{tuning:M.BASS_TUNING,maxFret:profile.maxFret});if(!final)throw Error('Unplayable bass');return{...n,p:spellChord(midi,current),s:final.s,...(i===0?{accent:1}:{})};
      });
    }
    function riffBass(guitar,name,bar){
      if(!accent||style!=='rock'||grade<2||sourceName(name)!=='A'||bar%2!==1||guitar.texture!=='riff'||!/^(movingBass|scaleBass)$/.test(roleFocus.bass)||!R.supports(guitar.notes,profile.rhythms.bass,meter.len))return null;
      let previous=previousBass??lowest(M.rootPc(root),28);const notes=[];
      for(const n of guitar.notes){
        if(n.r){notes.push({r:1,d:n.d});continue;}
        const pc=M.pc(M.midi(n.p)),choices=[];
        for(let m=28;m<=55;m++)if(M.pc(m)===pc&&M.position(m,{tuning:M.BASS_TUNING,maxFret:profile.maxFret}))choices.push(m);
        const midi=choices.sort((a,b)=>Math.abs(a-previous)-Math.abs(b-previous))[0];if(midi===undefined)return null;
        notes.push({p:spell(midi),d:n.d,s:M.position(midi,{tuning:M.BASS_TUNING,maxFret:profile.maxFret}).s,...(n.tie?{tie:n.tie}:{}),...(n.tuplet?{tuplet:n.tuplet}:{}),...(n.tupletEnd?{tupletEnd:true}:{})});previous=midi;
      }
      return notes;
    }
    function phraseExpression(part,role,name,bar){
      const shape=[0,3,5,2,0,-2,-4,-6],light=sourceName(name)==='B',base=(sectionPlans[name].lead===role?82:66)-(light?(style==='doom'?10:4):0);
      let at=0,groupAt=0;const strong=meter.groups.map(g=>{const t=groupAt;groupAt+=g*4/meter.d;return t;});
      for(const [i,n] of part.notes.entries()){
        if(!n.r){
          if(style==='progressive'&&grade>=4&&meter.d===8&&strong.some(t=>Math.abs(t-at)<1e-9))n.accent=1;
          if(n.velocity===undefined)n.velocity=base+shape[(i+bar%2*2)%shape.length]+(n.accent?8:0);
        }
        at+=N.dur(n.d);
      }
    }
    const grooveCache=new Map();
    function drumsPart(name,bar,bassLine){
      const focus=roleFocus.drums,fillFocus=/Fill|Sixteenths/.test(focus),boundary=bar===sizes[name]-1,
        fill=boundary&&(sourceName(name)===(fillFocus?'A':'B')||grade>=2&&sourceName(name)==='C')||name==='S'&&featured==='drums'&&bar%2===1,light=sectionPlans[name].drums==='lightGroove',build=sectionPlans[name].drums==='build',hat=grade<2||light?'q':'e';
      const cacheKey=name+':'+(fill?'fill':bar===0?'entry':bar%2),finish=part=>{grooveCache.set(cacheKey,clone(part));return part;};
      if(grooveCache.has(cacheKey))return clone(grooveCache.get(cacheKey));
      if(focus==='stops'&&bar%4===2){
        // A shared quarter-rest before the fill is an actual ensemble break
        // in the drum part, not merely a rest somewhere in one voice.
        const notes=[...Array.from({length:3},()=>({p:'F#2',d:'q',velocity:52})),{r:1,d:'q'}];
        const bass=style==='doom'?[{p:'C2',d:'q'},{r:1,d:'q'},{p:'D2',d:'q'},{r:1,d:'q'}]:[{p:'C2',d:'q'},{p:'D2',d:'q'},{p:'C2',d:'q'},{r:1,d:'q'}];
        return finish({notes,bass});
      }
      if(fill){
        const triplets=grade===5&&groove!=='compound'&&(groove==='swing'||focus==='tripletFill');
        const fillBeats=meter.compound?1.5:Math.min(meter.len,grade<3||['doom','lounge','baroque'].includes(style)?1:2),lead=meter.len-fillBeats;
        const grammar={...profile.rhythms.drums,shortest:grade===0?'e':fillFocus||grade>=3&&!['doom','lounge'].includes(style)?'s':'e',triplets};
        const ds=R.generate(grammar,{rng,length:fillBeats,dense:true,required:triplets?'et':grammar.shortest});
        const opening=R.generate({shortest:meter.d===8?'e':'q',dotted:grade>=4},{rng,length:lead});
        const notes=[...opening.map(n=>({...n,p:'F#2',velocity:50})),...ds.map((n,i)=>n.r?n:{...n,p:M.name(/tom|accentSixteenths/.test(focus)?[38,48,45,43][Math.floor(i/2)%4]:38),velocity:i%4===0?86:grade>=3?50:68,...((grade>=3||focus==='accentFill')&&i%4===0?{accent:1}:{})})];
        let at=0;const bass=[...opening.map(n=>{const t=at;at+=N.dur(n.d);return{...n,p:style==='doom'?(Math.floor(t)===2?'D2':'C2'):Math.floor(t)%2?'D2':'C2',velocity:78};}),...R.generate({shortest:'e',dotted:grade>=4},{rng,length:fillBeats}).map(n=>({r:1,d:n.d}))];
        return finish({notes,bass,fillBeats});
      }
      const hatDur=meter.compound?'e':meter.d===8?'e':hat,count=Math.round(meter.len/N.dur(hatDur));
      const cymbal=grade>=4&&/cymbalChanges/.test(focus)?(name==='B'?51:42):42;
      const notes=Array.from({length:count},(_,i)=>({p:M.name(grade>=3&&!light&&i===0&&bar===0?49:grade>=4&&focus==='openHat'&&i===count-1?46:cymbal),d:hatDur,velocity:(i%2?44:57)-(light?8:0)+(build?8:0)}));
      let lower=R.generate({shortest:grade===0?'e':grade>=4?'s':'e',dotted:grade>=4},{rng,length:meter.len,restChance:.35});
      if(rng()<.8){const d=meter.compound?'q.':meter.d===8?'e':'q';lower=Array.from({length:Math.round(meter.len/N.dur(d))},(_,i)=>{const snare=i%2===1,split=!snare&&meter.d===4&&rng()<.4;return split?[{d:'e'},{d:'e',...(rng()<.5?{r:1}:{})}]:[{d}];}).flat();}
      if(light)lower=clone(meter.compound?pulsePattern('q.'):meter.d===8?singing[bar%2]:pulsePattern('q'));
      else if(contrasting&&bassLine.length>=4&&R.supports(bassLine,profile.rhythms.drums,meter.len))lower=bassLine.map(({d,r,tuplet,tupletEnd})=>({d,...(r?{r}:{}),...(tuplet?{tuplet}:{}),...(tupletEnd?{tupletEnd}:{})}));
      if(!light&&bar===0&&time==='4/4'){
        if(focus==='eighthKick'||focus==='kickVariation')lower=[{d:'e'},{d:'e'},{d:'q'},{d:'q'},{d:'q'}];
        if(focus==='syncopatedKick')lower=[{d:'e'},{d:'e'},{d:'q'},{d:'q'},{d:'q'}];
        if(focus==='dottedGroove')lower=[{d:'q.'},{d:'e'},{d:'q.'},{d:'e'}];
      }
      if(!light&&bar===0&&meter.d===8&&!meter.compound){
        if(focus==='dottedGroove')lower=R.generate(profile.rhythms.drums,{rng,length:meter.len,required:'e.'});
        if(focus==='syncopatedKick')lower=[{d:'e'},{d:'e'},...R.generate(profile.rhythms.drums,{rng,length:meter.len-1})];
      }
      let t=0;
      const bass=lower.map(n=>{const at=t;t+=N.dur(n.d);if(n.r)return n;const snare=meter.compound?Math.floor(at/1.5)%2===1:style==='doom'?Math.floor(at)===2:Math.floor(at)%2===1;return{...n,p:grade>=4&&!light&&snare&&at%1===0&&rng()<.25?['C2','D2']:M.name(snare?38:36),velocity:(snare?86:90)-(light?14:0)+(build?5:0)};});
      return finish({notes,bass});
    }
    const sectionsByName={},toneChanges=grade>=4&&['rock','doom','gothic','progressive'].includes(style)&&rng()<.4;
    for(const name of names){const size=sizes[name],hs=progression(name,size);for(let i=0;i<size;i++)if(!blues&&grade>=1&&time==='4/4'&&i%4===2&&!(i===size-2&&(size===8||name===order.at(-1)))&&rng()<.3){const h=hs[i],next=harmony(pick([0,3,4,5]));if(next.chord!==h.chord)h.changes=[{t:2,h:next}];}
      sectionsByName[name]=hs.map((h,bar)=>{
      if(name.endsWith('′')&&bar<size-2)return remember(name,clone(sectionsByName[sourceName(name)][bar]));
      const guitar=guitarPart(h,name,bar);if(toneChanges)guitar.program=27;const keys=keysPart(h,name,bar),bass=riffBass(guitar,name,bar)??bassPart(h,name,bar,hs[bar+1]??hs[0]),drumPart=drumsPart(name,bar,bass);
      const closing=name===order.at(-1)&&bar===size-1;
      if(closing){delete drumPart.fillBeats;const final=harmony(0);const single=guitar.texture!=='power',tonic=lowest(final.rootPc,48),v=single?{p:spell(tonic),s:M.position(tonic,{maxFret:profile.maxFret}).s}:guitarPower(final);guitar.notes=R.held(v.p,time).map(n=>({...n,s:clone(v.s)}));keys.notes=R.held(sectionPlans[name].keys==='chords'?keyVoicing(final,70):spell(lowest(final.rootPc,60)),time);keys.bass=grade===0?R.held('C3',time,true):R.held(spell(lowest(final.rootPc,36)),time);delete keys.inner;bass.splice(0,bass.length,...R.held(spell(lowest(final.rootPc,28)),time).map(n=>({...n,s:M.position(M.midi(n.p),{tuning:M.BASS_TUNING,maxFret:profile.maxFret}).s})));h=final;drumPart.notes=R.held('C2',time,true);drumPart.bass=R.held('C2',time,true);drumPart.notes[0]={p:['C2','C#3'],d:meter.compound?'q.':meter.d===8?'e':'q',velocities:[90,65]};const used=N.dur(drumPart.notes[0].d);const tail=R.generate({shortest:'e',dotted:profile.rhythms.drums.dotted,triplets:false},{rng,length:meter.len-used});drumPart.notes.splice(1,drumPart.notes.length-1,...tail.map(n=>({r:1,d:n.d})));}
      if(/ties/.test(roleFocus.guitar+' '+roleFocus.keys)&&bar%4===1){for(const p of [guitar,keys]){const n=p.notes.find(n=>!n.r);if(n&&N.dur(n.d)>=1&&!n.d.endsWith('t')){const i=p.notes.indexOf(n),d=n.d==='w'?'h':n.d==='h'?'q':n.d==='q'?'e':null;if(d)p.notes.splice(i,1,{...n,d,tie:1},{...clone(n),d});}}}
      phraseExpression(guitar,'guitar',name,bar);phraseExpression(keys,'keys',name,bar);
      return remember(name,{time,key,chord:[h,...(h.changes||[]).map(c=>c.h)].map(h=>h.chord).join('→'),harmony:{...h,roman:[h,...(h.changes||[]).map(c=>c.h)].map(h=>h.roman).join('→')},guitar,keys,bass,drumPart,swing,dynamics:{guitar:sectionPlans[name].lead==='guitar'?86:68,keys:sectionPlans[name].lead==='keys'?84:64,bass:sectionPlans[name].bass==='support'?70:78,drums:sectionPlans[name].drums==='lightGroove'?71:85},
        drums:N.events({...drumPart,time,swing}).map(n=>({t:n.t,midi:n.midi,dur:n.dur,velocity:n.velocity??85}))});
    });}
    if(grade>=4)for(const role of ['guitar','keys'])if(roleFocus[role]==='ties')for(const name of names){
      const bs=sectionsByName[name];for(let i=0;i<bs.length-1;i++){const last=bs[i][role].notes.at(-1),first=bs[i+1][role].notes[0];
        // Do not overwrite the composed resolution with the preceding chord.
        if(name===order.at(-1)&&i===bs.length-2)continue;
        if(role==='guitar'&&bs[i].guitar.texture!==bs[i+1].guitar.texture)continue;
        if(names.includes(sourceName(name)+'′')&&i===bs.length-3)continue;
        if(last&&!last.r&&![].concat(last.p).every(p=>bs[i+1].harmony.pcs.includes(M.pc(M.midi(p)))))continue;
        if(last&&!last.r&&first&&!first.r&&rng()<.65){last.tie=1;delete last.palmMute;first.p=clone(last.p);delete first.accent;if(role==='guitar')first.s=clone(last.s);}
      }
    }
    // Common notation devices are authored from our own music.
    if(roleFocus.guitar==='rhythmChart')for(const name of names){
      if(name==='O')continue;
      const bs=sectionsByName[name],eligible=i=>i>0&&bs[i-1].guitar.texture==='power'&&!(bs.length===8&&[3,6,7].includes(i))&&!(name===order.at(-1)&&i>=bs.length-2);
      let i=bs.findIndex((bar,i)=>eligible(i)&&bar.guitar.texture==='power'&&(!blues||bar.chord===bs[i-1].chord));
      // A diminished passing harmony may separate every pair of power bars.
      // Prolong a playable harmony locally so the chosen reading technique
      // still exists; open midpoints and prepared endings stay protected.
      if(i<0&&!blues)i=bs.findIndex((bar,i)=>eligible(i));
      if(i>=0){bs[i]=clone(bs[i-1]);bs[i].guitar.percentRepeat=true;}
    }
    for(const name of names){
      const bars=sectionsByName[name],prefix=name.endsWith('′')?sizes[name]-2:0;
      for(let bar=0;bar<prefix;bar++)bars[bar]=clone(sectionsByName[sourceName(name)][bar]);
      for(const role of ['guitar','bass']){
        const voice=b=>role==='guitar'?b.guitar.notes:b.bass;
        if(role==='guitar')AM.practicePhrasing.powerRegisters(bars.flatMap(voice),{maxFret:profile.maxFret,locked:bars.slice(0,prefix).flatMap(voice).length});
        AM.practicePhrasing.place(bars.flatMap(voice),{maxFret:profile.maxFret,tuning:role==='guitar'?M.TUNING:M.BASS_TUNING,locked:bars.slice(0,prefix).flatMap(voice).length});
      }
    }
    if(navigation){const ns=sectionsByName;if(blues){ns.B.at(-1).instruction='To Coda';ns[unit[2]].at(-1).instruction='D.C. al Coda';}else if(navigation==='Fine'){ns.A[0].sign='segno';ns.B.at(-1).instruction='D.S. al Fine / Fine';}else if(navigation==='DC'){ns.A.at(-1).instruction='To Coda';ns.B.at(-1).instruction='D.C. al Coda';}else{ns.B[0].sign='segno';ns.B.at(-1).instruction='To Coda';ns.C.at(-1).instruction='D.S. al Coda';}if(ns.O)ns.O[0].sign='coda';}
    let number=0,startBeat=0;const sections=order.map(name=>{const bars=clone(sectionsByName[name]).map(b=>({...b,number:++number})),section={name,character:clone(sectionPlans[name]),...(name.endsWith('′')?{variationOf:sourceName(name)}:{}),startBar:number-bars.length+1,startBeat,time,groups:meter.groups,bars};startBeat+=bars.length*meter.len;return section;});
    const piece={id:`practice-${grade}-${style}-${seed}`,generatorVersion:6,grade,seed,style,requestedStyle:style,focus:roleFocus.guitar,roleFocus,contrasting,theme:contour,motifFamily:motifPlan.family,musicalAccent:accent,rhythmicFigure,root,scale,harmonyScale,key,time,tempo,quarterTempo,swing,maxFret:profile.maxFret,form:sections.map(s=>s.name).join(''),bars:number,uniqueBars:names.reduce((n,name)=>n+sizes[name],0),featured,navigation,repeat:navigation?{from:1,to:unit.reduce((n,name)=>n+sizes[name],0),times:repeatCount}:null,
      ...(blues?{chorusBars:12,choruses:number/12}:{}),
      programs:{guitar:27,keys:0,bass:33,drums:0},sections};
    const fitted=AM.practicePhrasing.fitTempo(piece,tempoRange);
    // Tempo is measured against the actual written parts before the final
    // duration plan; a demanding part must not be sped up to meet a length.
    planned=D.form({...formOptions,range:[Math.min(tempoRange[0],fitted.tempoCeiling),fitted.tempoCeiling],requested:piece.quarterTempo});
    let finalNumber=0,finalBeat=0;
    piece.sections=planned.order.map(name=>{const original=sections.find(s=>s.name===name),bars=clone(original.bars).map(b=>({...b,number:++finalNumber}));const section={...original,bars,startBar:finalNumber-bars.length+1,startBeat:finalBeat};finalBeat+=bars.length*meter.len;return section;});
    piece.form=planned.order.join('');piece.bars=finalNumber;piece.quarterTempo=planned.tempo;piece.tempo=Math.round(planned.tempo/meter.q*100)/100;
    if(piece.repeat)piece.repeat.times=planned.copies;
    if(blues)piece.choruses=finalNumber/12;
    piece.durationSeconds=D.seconds(piece);piece.targetDurationSeconds=profile.durationSeconds;

    return{piece,score:piece,bytes:AM.practiceGenerator.encode(piece)};
  }
  return{styles,availableStyles,styleForGrade,styleGrade,instruments,profiles,generate,selectionFor:(grade,seed,style)=>{const s=settings(grade,seed,style),motif=T.plan(grade,seed,style);return{focus:s.roleFocus,key:s.key,family:motif.family,rhythm:s.rhythmicFigure};},focusFor:(grade,seed,style)=>settings(grade,seed,style).roleFocus};
})();
