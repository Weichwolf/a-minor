AM.practiceComposer = (() => {
  const M=AM.music,N=AM.notation,R=AM.practiceRhythm,clone=x=>JSON.parse(JSON.stringify(x));
  const styles=['rock','doom','gothic','progressive','baroque','lounge'],instruments=['guitar','keys','bass','drums'],profiles=AM.practiceCurriculum;
  const voicingCache=new Map(),romans=['I','II','III','IV','V','VI','VII'];
  function random(seed){let state=seed>>>0;return()=>{state+=0x6D2B79F5;let n=Math.imul(state^state>>>15,1|state);n^=n+Math.imul(n^n>>>7,61|n);return((n^n>>>14)>>>0)/4294967296;};}
  function generate(grade,seed,style='rock'){
    if(!Number.isInteger(grade)||grade<0||grade>5||!Number.isInteger(seed)||seed<0||seed>0xffffffff||!styles.includes(style))throw Error('Invalid practice settings');
    const rng=random(seed),pick=xs=>xs[Math.floor(rng()*xs.length)],profile=profiles[grade];
    const modes=style==='rock'?['major','major','mixolydian','mixolydian','aeolian']:style==='lounge'?['major','dorian','aeolian']:style==='baroque'?['major',...(grade>=3?['harmonicMinor']:['aeolian'])]:style==='doom'?['aeolian','aeolian','phrygian']:style==='gothic'?['aeolian','dorian']:['major','aeolian',...(grade>=4?['lydian']:[])];
    const scale=pick(modes),major=['major','mixolydian','lydian'].includes(scale),maxSignature=[3,4,4,5,6,6][grade];
    const key=pick(Object.keys(M.KEYS).filter(k=>k.endsWith('m')!==major&&Math.abs(M.KEYS[k])<=maxSignature)),root=key.replace(/m$/,''),iv=M.SCALES[scale].iv;
    const groove=grade===5?pick(['straight','straight','straight','swing','compound']):'straight';
    const melodicSkills=['melodyReading','melodicRiff','pickedArpeggio'];
    const roleFocus=Object.fromEntries(instruments.map(role=>{
      let choices=profile.skills[role].filter(f=>groove==='compound'?!/shuffle|swing/i.test(f):groove==='swing'?!/compound/i.test(f):!/compound|shuffle|swing/i.test(f));
      // Balance single-note playing and chord playing independently of the number of skills.
      if(role==='guitar'){const melodic=rng()<.5;choices=choices.filter(f=>melodicSkills.includes(f)===melodic);}
      return[role,pick(choices)];
    }));
    const time=groove==='compound'?'12/8':style==='progressive'&&grade>=4&&rng()<.3?pick(['5/8','7/8']):'4/4',meter=M.meter(time),swing=groove==='swing'&&time==='4/4';
    const quarterTempo=profile.quarterTempo[0]+Math.floor(rng()*(profile.quarterTempo[1]-profile.quarterTempo[0]+1)),tempo=Math.round(quarterTempo/meter.q*100)/100;
    const length=pick(profile.sectionLengths);
    const navigation=grade===5&&Object.values(roleFocus).includes('navigation')?pick(['DC','DS','Fine']):null;
    const solo=grade===5&&!navigation&&Object.values(roleFocus).includes('soloReturn'),featured=pick(instruments);
    let unit=grade===0?pick([['A','B','A'],['A','B','A','C']]):grade===1?pick([['A','A','B','A'],['A','B','A','C']]):solo?['A','B','S','A']:pick([['A','A','B','A'],['A','B','A','B'],['A','B','A','C'],['A','B','C','A']]);
    if(navigation)unit=navigation==='DS'?['A','B','C']:['A','B'];
    const names=[...new Set([...unit,...(grade>=2&&navigation!=='Fine'?['O']:[])])];
    const sizes=Object.fromEntries(names.map(name=>[name,name==='O'?4:length]));
    for(const name of [...names].reverse()){if(Object.values(sizes).reduce((n,v)=>n+v,0)<=24)break;if(sizes[name]===8)sizes[name]=4;}
    let order=[...unit],repeatCount=1;
    if(grade>=2){
      const target=pick(profile.playedBars),tail=navigation==='DC'?['A','O']:navigation==='DS'?['B','O']:navigation==='Fine'?['A','B']:['O'];
      for(const name of [...names].reverse()){const u=unit.reduce((n,x)=>n+sizes[x],0),v=tail.reduce((n,x)=>n+sizes[x],0);if(Math.ceil((profile.playedBars[0]-v)/u)<=Math.floor((profile.playedBars[1]-v)/u))break;if(sizes[name]===8)sizes[name]=4;}
      const unitBars=unit.reduce((n,name)=>n+sizes[name],0),tailBars=tail.reduce((n,name)=>n+sizes[name],0);
      const minCopies=Math.max(1,Math.ceil((profile.playedBars[0]-tailBars)/unitBars)),maxCopies=Math.max(minCopies,Math.floor((profile.playedBars[1]-tailBars)/unitBars));
      const copies=Math.max(minCopies,Math.min(maxCopies,Math.round((target-tailBars)/unitBars)));
      repeatCount=copies;order=[...Array.from({length:copies},()=>unit).flat(),...tail];
    }
    const pitch=(degree,octave)=>M.scaleName(M.midi(root+octave)+iv[((degree%7)+7)%7]+Math.floor(degree/7)*12,root,scale);
    const spell=m=>M.scaleName(m,root,scale),pcAt=d=>M.pc(M.midi(pitch(d,2)));
    const lowest=(pc,min)=>{let m=min;while(M.pc(m)!==M.pc(pc))m++;return m;};
    function harmony(degree,alteration=0,quality){
      const triad=M.chord(root,scale,degree),q=quality??triad.quality,rpc=M.pc(pcAt(degree)+alteration),intervals=q==='m'?[0,3,7]:q==='°'?[0,3,6]:q==='+'?[0,4,8]:[0,4,7];
      const accidental=iv[degree]-M.SCALES.major.iv[degree]+alteration,prefix=accidental<0?'b'.repeat(-accidental):'#'.repeat(accidental);
      const seventh=grade>=3&&(q!=='°')&&(/seventh|swingComping|rhythmChart/i.test(roleFocus.guitar+' '+roleFocus.keys)||style==='lounge');
      if(seventh)intervals.push(q==='m'||scale==='mixolydian'||degree===4?10:11);
      const rp=M.parse(pitch(degree,2)),acc=rp.acc+alteration,rootName=rp.letter+(acc<0?'b'.repeat(-acc):'#'.repeat(acc));
      const suffix=seventh?(q==='m'?'m7':intervals[3]===11?'maj7':'7'):q;
      return{degree,alteration,quality:q,pcs:intervals.map(i=>M.pc(rpc+i)),rootPc:rpc,root:rootName,chord:rootName+suffix,
        roman:prefix+(q==='m'||q==='°'?romans[degree].toLowerCase():romans[degree])+(q==='°'?'°':'')+(seventh?(intervals[3]===11?'maj7':'7'):'')};
    }
    function progression(name,count){
      const base=grade===0?(style==='rock'?[0,0,6,0]:style==='baroque'?[0,3,4,0]:style==='lounge'?[0,3,1,4]:[0,6,5,0]):style==='doom'?[0,0,5,4]:style==='gothic'?[0,6,5,4]:style==='baroque'?[0,3,4,0]:style==='lounge'?[1,4,0,0]:[0,3,0,4];
      const contrasting=name==='B'||name==='C'||name==='S';
      return Array.from({length:count},(_,i)=>{
        const d=name==='O'?[3,4,4,0][i%4]:contrasting&&grade>0?[3,0,5,4][i%4]:base[i%4];
        if(grade===0&&d===6)return harmony(6,major&&scale!=='mixolydian'?-1:0,'');
        if(name==='O'&&d===4&&grade>=3&&['aeolian','harmonicMinor'].includes(scale))return harmony(d,0,'');
        return harmony(d);
      });
    }
    const spellChord=(m,h)=>h.pcs.includes(M.pc(m))?M.scaleName(m,h.root,h.quality==='m'?'aeolian':h.quality==='°'?'locrian':h.quality==='+'?scale:h.pcs.length===4&&M.pc(h.pcs[3]-h.rootPc)===10?'mixolydian':'major'):spell(m);
    const atHarmony=(h,t)=>h.changes?.findLast(c=>c.t<=t+1e-9)?.h??h;
    const voiced=(pattern,h,play)=>{let at=0;return pattern.map((n,i)=>{const now=at;at+=N.dur(n.d);return n.r?n:{...n,...play(atHarmony(h,now),i,n)};});};
    function keyVoicing(h,center,size=Math.min(grade===0?3:4,h.pcs.length)){
      const pcs=h.pcs.slice(0,size),choices=[];
      for(let m=Math.max(36,Math.floor(center)-12);m<=Math.min(82,Math.floor(center)+5);m++)if(pcs.includes(M.pc(m))){const ps=[m];for(let k=m+1;k<=Math.min(m+11,84)&&ps.length<pcs.length;k++)if(pcs.includes(M.pc(k)))ps.push(k);if(ps.length===pcs.length)choices.push(ps);}
      if(!choices.length)throw Error('Unplayable keyboard chord');
      choices.sort((a,b)=>Math.abs(a.reduce((s,p)=>s+p,0)/a.length-center)-Math.abs(b.reduce((s,p)=>s+p,0)/b.length-center));return choices[0].map(m=>spellChord(m,h));
    }
    function guitarVoicing(h,power=false,sixth=false){
      const pcs=power?[h.rootPc,M.pc(h.rootPc+(sixth?9:7))]:h.pcs,tag=[pcs.join(','),profile.maxFret,power,grade>=2?6:4].join(':');
      if(!voicingCache.has(tag)){
        const result=[],maxNotes=power?2:grade>=2?6:4;
        const search=(s,ps,ss,fs)=>{
          if(s===6){if(ps.length<pcs.length||ps.length>maxNotes||new Set(ps.map(M.pc)).size!==pcs.length)return;const used=fs.filter(f=>f>0);if(used.length&&Math.max(...used)-Math.min(...used)>4)return;
            const frets=Array(6).fill(null);ss.forEach((s,i)=>frets[s]=fs[i]);if(M.fingerCount(frets)>4)return;
            if(power&&(ps.length!==2||ps[0]%12!==pcs[0]||ps[1]-ps[0]!== (sixth?9:7)||ss[1]-ss[0]>(sixth?2:1)))return;
            result.push({p:ps.map(spell),s:ss,score:(maxNotes-ps.length)*5+fs.reduce((a,b)=>a+b,0)+(used.length?Math.max(...used)-Math.min(...used):0)*3});return;}
          search(s+1,ps,ss,fs);
          for(let f=0;f<=profile.maxFret;f++){const m=M.midi(M.TUNING[s])+f;if(!pcs.includes(M.pc(m))||ps.includes(m))continue;const used=[...fs,f].filter(x=>x>0);if(used.length&&Math.max(...used)-Math.min(...used)>4)continue;if(ps.length<maxNotes)search(s+1,[...ps,m],[...ss,s],[...fs,f]);}
        };search(0,[],[],[]);result.sort((a,b)=>a.score-b.score);if(!result.length)throw Error('Unplayable guitar voicing');voicingCache.set(tag,result);
      }
      // Stored voicings contain MIDI spellings from their originating key: respell on reuse.
      const options=voicingCache.get(tag),lowestRoot=Math.min(...options.map(v=>M.midi(v.p[0]))),chosen=grade===0?options.find(v=>M.midi(v.p[0])===lowestRoot):pick(rng()<.85?options.slice(0,grade<2?3:12):options);return{p:chosen.p.map(p=>spellChord(M.midi(p),h)),s:[...chosen.s]};
    }
    const melodyContours={rock:[0,0,2,1,0,3,2,1],doom:[0,2,1,0,0,3,2,0],gothic:[0,1,2,1,0,2,3,1],progressive:[0,2,0,3,1,2,4,1],baroque:[0,2,4,2,1,3,5,3],lounge:[0,1,2,1,3,2,1,0]},contour=melodyContours[style];
    const motif=Object.fromEntries(instruments.map(role=>[role,[rhythm(role,0),rhythm(role,1)]]));
    function rhythm(role,variant=0){
      const rp={...profile.rhythms[role],triplets:profile.rhythms[role].triplets&&groove!=='compound'&&!swing};
      if(swing)rp.shortest='e';
      const focus=roleFocus[role];let ds;
      if(role==='guitar'&&grade===0&&focus==='heldPower')return R.held('E2',time).map(({d,tie})=>({d,...(tie?{tie:1}:{})}));
      if(role==='guitar'&&melodicSkills.includes(focus)&&grade===0)return R.pulse(variant?'h':'q',variant?2:4,'C4').map(({d})=>({d}));
      if(role==='guitar'&&/melodicRiff|pickedArpeggio/.test(focus)&&grade<4)return R.pulse('e',8,'C4').map(({d})=>({d}));
      if(focus==='quarterPower')return R.pulse('q',meter.len,'C4').map(({d})=>({d}));
      if(role==='keys'&&grade===0&&focus==='heldValues')return R.pulse('h',2,'C4').map(({d})=>({d}));
      if(time==='12/8'&&focus==='tripletPickup')return[{r:1,d:'h.'},{r:1,d:'q.'},...Array.from({length:3},()=>({d:'e'}))];
      if(time==='12/8')return R.generate({...rp,dotted:true,triplets:false},{rng,length:meter.len,restChance:.07,required:variant?'e':'q.'});
      if(meter.d===8)return R.generate({...rp,dotted:true},{rng,length:meter.len,restChance:.05});
      const pulse=grade===0&&['guitar','keys'].includes(role)?pick(['q','h','w']):pick(['q','e']);
      if(role==='guitar'&&/sixteenth/.test(focus))ds=R.generate(rp,{rng,length:4,dense:true,required:'s',restChance:.06});
      else if(/eighthPower|palmMute|rootEighths|eighthBass|octaveBass|fifthBass|movingBass|passingBass|scaleBass|arpeggioBass|registerChanges/.test(focus))ds=R.pulse('e',8,'C4').map(({d})=>({d}));
      else if(role==='bass'&&/walking/.test(focus))ds=R.pulse('q',4,'C2').map(({d})=>({d}));
      else if(/syncop|dotted|ties/i.test(focus)||rng()<.4)ds=R.generate(rp,{rng,length:4,required:grade>=4&&variant?'s':undefined,restChance:grade>=2?.1:.04});
      else ds=R.pulse(pulse,4/N.dur(pulse),'C4').map(({d})=>({d}));
      if(/rests|stops/.test(focus)){if(ds.length===1)ds=[{d:'h'},{d:'h'}];ds[ds.length-1].r=1;}
      if(grade>=4&&/syncop|ties/i.test(focus)&&ds.length>1)ds[0].r=1;
      if(grade===5&&focus==='tripletPickup'&&time==='4/4')ds=[{r:1,d:'h'},{r:1,d:'q'},...Array.from({length:3},(_,i)=>({d:'et',...(i===0?{tuplet:3}:i===2?{tupletEnd:true}:{})}))];
      return ds;
    }
    function line(h,name,bar,role,register){
      const pattern=clone(motif[role][bar%2]),notes=[];let previous=register,at=0;
      const candidates=[];for(let m=register-(role==='guitar'?0:7);m<=register+(grade===0?7:12);m++)if(m>=36&&m<=84&&(M.scalePcs(root,scale).includes(M.pc(m))||h.pcs.includes(M.pc(m))))candidates.push(m);
      for(let i=0;i<pattern.length;i++){
        const n=pattern[i];if(n.r){notes.push(n);at+=N.dur(n.d);continue;}
        const current=atHarmony(h,at),chord=at===0||Math.abs(at-2)<1e-9,desired=register+iv[Math.min(6,contour[(i+bar*2+(name==='B'?1:0))%contour.length])];
        const pool=chord?candidates.filter(m=>current.pcs.includes(M.pc(m))):candidates;
        const sorted=(pool.length?pool:candidates).sort((a,b)=>Math.abs(a-desired)+Math.abs(a-previous)*.45-Math.abs(b-desired)-Math.abs(b-previous)*.45);
        const midi=role==='guitar'?sorted[0]:pick(rng()<.9?sorted.slice(0,Math.min(2,sorted.length)):candidates);notes.push({...n,p:spellChord(midi,current),...(grade>=2&&i===0?{accent:1}:{})});previous=midi;at+=N.dur(n.d);
      }
      return notes;
    }
    function guitarPart(h,name,bar){
      const focus=roleFocus.guitar,isSolo=name==='S'&&featured==='guitar',melodic=isSolo||melodicSkills.includes(focus)||focus==='registerChanges'&&name==='B';
      if(name==='S'&&featured==='keys')return{notes:R.held('E2',time,true),bass:R.held('E2',time,true)};
      if(melodic){
        const register=lowest(h.rootPc,48),pattern=clone(motif.guitar[bar%2]);
        const notes=focus==='pickedArpeggio'?voiced(pattern,h,(current,i)=>{
          const base=lowest(current.rootPc,48),tones=current.pcs.map(pc=>lowest(pc,base)).sort((a,b)=>a-b),index=[0,1,2,1,0,2,1,2][(i+bar%2)%8];
          return{p:spellChord(tones[index%tones.length],current)};
        }):focus==='melodicRiff'?voiced(pattern,h,(current,i)=>{
          const base=lowest(current.rootPc,48),neighbours=[base];for(let m=base+1;m<=base+7;m++)if(M.scalePcs(root,scale).includes(M.pc(m)))neighbours.push(m);
          const shape=style==='doom'?[0,0,1,0,0,2,1,0]:style==='baroque'?[0,1,2,1,0,2,1,0]:[0,0,2,1,0,0,1,0];
          return{p:spellChord(neighbours[shape[i%8]%neighbours.length],current)};
        }):line(h,name,bar,'guitar',register);
        return{notes:notes.map(n=>{if(n.r)return n;const pos=M.position(M.midi(n.p),{maxFret:profile.maxFret});if(!pos)throw Error('Unplayable guitar melody');return{...n,s:pos.s};}),bass:R.held('E2',time,true)};
      }
      const power=grade<2||/Power|fifthSixth|shuffleRiff/.test(focus)||focus==='palmMute',voicing=guitarVoicing(h,power),pattern=clone(motif.guitar[bar%2]);
      const notes=voiced(pattern,h,(current,i,n)=>{
        let v=current===h?voicing:guitarVoicing(current,power);
        if(focus==='fifthSixth'&&i%4>=2)v=guitarVoicing(current,true,true);
        if(focus==='chromaticPower'&&bar%4===2&&i>0){const delta=i%3,shifted={...current,root:M.pcName(current.rootPc+delta,M.usesFlats(key)),rootPc:M.pc(current.rootPc+delta),pcs:current.pcs.map(pc=>M.pc(pc+delta))};v=guitarVoicing(shifted,true);}
        return{...n,...clone(v),...(grade>=1&&i%2===0&&/palmMute|eighthPower/.test(focus)?{palmMute:1}:{}),...(grade>=3&&i===0?{accent:1}:{})};
      });
      return{notes,bass:R.held('E2',time,true),...(focus==='rhythmChart'?{rhythmSlash:true}:{})};
    }
    function keysPart(h,name,bar){
      const focus=roleFocus.keys;if(name==='S'&&featured==='guitar')return{notes:R.held(keyVoicing(h,70),time),bass:R.held(spell(lowest(h.rootPc,36)),time)};
      const melody=grade===0?(focus==='rightTriads'?name==='B':name==='A'):/Melody|melody|independent|swing|Pickup|leftTriads/.test(focus)||name==='S';
      let notes=melody?line(h,name,bar,'keys',70):voiced(clone(motif.keys[bar%2]),h,current=>({p:keyVoicing(current,pick([68,70,73]))}));
      let bass;
      if(grade===0)bass=R.held('C3',time,true);
      else if(grade===1&&/leftTriads|melodyOver/.test(focus)||grade>=3&&melody){
        const ps=keyVoicing(h,49),independent=grade>=4&&/independentHands|swingComping/.test(focus),pattern=grade===1?(h.changes?R.pulse('h',2,ps):R.held(ps,time)):independent?R.generate({...profile.rhythms.keys,shortest:swing?'e':profile.rhythms.keys.shortest,triplets:false},{rng,length:meter.len,restChance:.2,required:swing?'e':'s'}):clone(motif.bass[bar%2]);bass=voiced(pattern,h,current=>({p:keyVoicing(current,49)}));
      }else{
        const bm=lowest(h.rootPc,36),pattern=grade===1?(h.changes?R.pulse('h',2,spell(bm)):R.held(spell(bm),time)):clone(motif.keys[bar%2]);
        bass=voiced(pattern,h,(current,i)=>({p:spellChord(lowest(current.rootPc,36)+(grade>=2&&i%2?7:0),current)}));
      }
      if(focus==='handDialogue'){
        const leftTurn=bar%2===1;
        if(leftTurn){bass=line(h,name,bar,'keys',49);notes=R.held('C4',time,true);}
        else{notes=line(h,name,bar,'keys',70);bass=R.held('C3',time,true);}
      }
      if(focus==='chromaticColour'&&notes.some(n=>!n.r)){
        const i=notes.findLastIndex(n=>!n.r);const n=notes[i];if(!Array.isArray(n.p))n.p=spell(M.midi(n.p)-1);
        else{const top=M.midi(n.p.at(-1)),delta=n.p.slice(0,-1).some(p=>M.midi(p)===top-1)?1:-1;n.p=n.p.map((p,i)=>spell(M.midi(p)+(i===n.p.length-1?delta:0)));}
      }
      if(grade>=3&&style==='gothic'&&melody||grade>=3&&style==='baroque'&&melody){const ps=keyVoicing(h,49);bass=R.pulse(meter.compound?'e':meter.d===8?'e':'e',Math.round(meter.len/.5),'C3').map((n,i)=>({...n,p:ps[i%ps.length]}));}
      if(name==='S'&&featured==='bass'||name==='S'&&featured==='drums'){notes=R.held(keyVoicing(h,70),time);bass=R.held('C3',time,true);}
      let inner;
      if(grade===5&&focus==='independentHands'&&melody&&name!=='O'&&notes.every(n=>n.r||!Array.isArray(n.p))){
        const middle=keyVoicing(h,67,3).slice(0,2);
        notes=notes.map(n=>n.r?n:{...n,p:spell(Math.max(M.midi(middle.at(-1))+1,Math.min(M.midi(middle[0])+12,M.midi(n.p))))});
        inner=rng()<.5?R.held(middle,time):R.generate({shortest:'q',dotted:true},{rng,length:meter.len,restChance:.12}).map(n=>n.r?n:{...n,p:clone(middle)});
      }
      return{notes,bass,...(inner?{inner}:{})};
    }
    function bassPart(h,name,bar){
      const focus=roleFocus.bass,pattern=clone(motif.bass[bar%2]);
      return voiced(pattern,h,(current,i,n)=>{
        const bm=lowest(current.rootPc,28);let interval=/octave/.test(focus)&&i%2?12:/fifth|arpeggio/.test(focus)?[0,7,12,7][i%4]:/scale|moving|passing|walking/.test(focus)?[0,2,M.pc(current.pcs[1]-current.rootPc),7][i%4]:0;
        if(focus==='chromaticBass'&&i===pattern.length-1)interval=11;
        if(name==='S'&&featured==='bass')interval=[0,7,12,10,7,M.pc(current.pcs[1]-current.rootPc),2,0][i%8];
        if(focus==='registerChanges'&&name==='B')interval+=12;
        if(grade>=1&&rng()<.12){const candidates=[];for(let m=28;m<=Math.min(61,bm+17);m++)if(M.position(m,{tuning:M.BASS_TUNING,maxFret:profile.maxFret})&&(M.scalePcs(root,scale).includes(M.pc(m))||current.pcs.includes(M.pc(m))||grade>=3))candidates.push(m);interval=pick(candidates)-bm;}
        let midi=bm+interval;while(midi>61)midi-=12;const pos=M.position(midi,{tuning:M.BASS_TUNING,maxFret:profile.maxFret});if(!pos){midi-=12;}
        const final=M.position(midi,{tuning:M.BASS_TUNING,maxFret:profile.maxFret});if(!final)throw Error('Unplayable bass');return{...n,p:spellChord(midi,current),s:final.s,...(i===0?{accent:1}:{})};
      });
    }
    function drumsPart(name,bar){
      const focus=roleFocus.drums,fill=bar%4===3||name==='S'&&featured==='drums',hat=grade<2?'q':'e';
      if(fill){
        const ds=R.generate({...profile.rhythms.drums,triplets:grade===5&&groove!=='compound'&&(groove==='swing'||focus==='tripletFill')},{rng,length:meter.len,dense:true,required:grade===0?'e':groove==='swing'||focus==='tripletFill'&&groove!=='compound'?'et':'s'});
        const notes=ds.map((n,i)=>n.r?n:{...n,p:M.name(/tom|accentSixteenths/.test(focus)?[38,48,45,43][Math.floor(i/4)%4]:38),velocity:i%4===0?88:grade>=3?50:72,...(grade>=3&&i%4===0?{accent:1}:{})});
        return{notes,bass:R.held('C2',time,true)};
      }
      const hatDur=meter.compound?'e':meter.d===8?'e':hat,count=Math.round(meter.len/N.dur(hatDur));
      const cymbal=grade>=4&&/cymbalChanges/.test(focus)?(name==='B'?51:42):42;
      const notes=Array.from({length:count},(_,i)=>({p:M.name(grade>=3&&i===0&&bar%4===0?49:grade>=4&&focus==='openHat'&&i===count-1?46:cymbal),d:hatDur,velocity:i%2?44:57}));
      let lower=R.generate({shortest:grade===0?'e':grade>=4?'s':'e',dotted:grade>=4},{rng,length:meter.len,restChance:.35});
      if(rng()<.8){const d=meter.compound?'q.':meter.d===8?'e':'q';lower=Array.from({length:Math.round(meter.len/N.dur(d))},(_,i)=>{const snare=i%2===1,split=!snare&&meter.d===4&&rng()<.4;return split?[{d:'e'},{d:'e',...(rng()<.5?{r:1}:{})}]:[{d}];}).flat();}
      let t=0;
      const bass=lower.map(n=>{const at=t;t+=N.dur(n.d);if(n.r)return n;const snare=meter.compound?Math.floor(at/1.5)%2===1:style==='doom'?Math.floor(at)===2:Math.floor(at)%2===1;return{...n,p:grade>=4&&snare&&at%1===0&&rng()<.25?['C2','D2']:M.name(snare?38:36),velocity:snare?86:90};});
      return{notes,bass};
    }
    const sectionsByName={},toneChanges=grade>=4&&['rock','doom','gothic','progressive'].includes(style)&&rng()<.4;
    for(const name of names){const size=sizes[name],hs=progression(name,size);for(let i=0;i<size;i++)if(grade>=1&&time==='4/4'&&i%4===2&&rng()<.3){const h=hs[i],next=harmony(pick([0,3,4,5]));if(next.chord!==h.chord)h.changes=[{t:2,h:next}];}
      sectionsByName[name]=hs.map((h,bar)=>{
      const guitar=guitarPart(h,name,bar);if(toneChanges)guitar.program=name==='B'||name==='S'?27:29;const keys=keysPart(h,name,bar),bass=bassPart(h,name,bar),drumPart=drumsPart(name,bar);
      const closing=name===order.at(-1)&&bar===size-1;
      if(closing){const final=harmony(0);const single=melodicSkills.includes(roleFocus.guitar)||guitar.notes.some(n=>!n.r&&!Array.isArray(n.p)),tonic=lowest(final.rootPc,48),v=single?{p:spell(tonic),s:M.position(tonic,{maxFret:profile.maxFret}).s}:guitarVoicing(final,grade<2||/Power|palmMute|fifthSixth|shuffleRiff/.test(roleFocus.guitar));guitar.notes=R.held(v.p,time).map(n=>({...n,s:clone(v.s)}));keys.notes=R.held(keyVoicing(final,70),time);keys.bass=grade===0?R.held('C3',time,true):R.held(spell(lowest(final.rootPc,36)),time);delete keys.inner;bass.splice(0,bass.length,...R.held(spell(lowest(final.rootPc,28)),time).map(n=>({...n,s:M.position(M.midi(n.p),{tuning:M.BASS_TUNING,maxFret:profile.maxFret}).s})));h=final;drumPart.notes=R.held('C2',time,true);drumPart.bass=R.held('C2',time,true);drumPart.notes[0]={p:['C2','C#3'],d:meter.compound?'q.':meter.d===8?'e':'q',velocities:[90,65]};const used=N.dur(drumPart.notes[0].d);const tail=R.generate({shortest:'e',dotted:true},{rng,length:meter.len-used});drumPart.notes.splice(1,drumPart.notes.length-1,...tail.map(n=>({r:1,d:n.d})));}
      if(/ties/.test(roleFocus.guitar+' '+roleFocus.keys)&&bar%4===1){for(const p of [guitar,keys]){const n=p.notes.find(n=>!n.r);if(n&&N.dur(n.d)>=1&&!n.d.endsWith('t')){const i=p.notes.indexOf(n),d=n.d==='w'?'h':n.d==='h'?'q':n.d==='q'?'e':null;if(d)p.notes.splice(i,1,{...n,d,tie:1},{...clone(n),d});}}}
      return{time,key,chord:[h,...(h.changes||[]).map(c=>c.h)].map(h=>h.chord).join('→'),harmony:{...h,roman:[h,...(h.changes||[]).map(c=>c.h)].map(h=>h.roman).join('→')},guitar,keys,bass,drumPart,swing,dynamics:{guitar:76+(name==='B'?6:0),keys:72+(name==='B'?4:0),bass:78,drums:85},
        drums:N.events({...drumPart,time,swing}).map(n=>({t:n.t,midi:n.midi,dur:n.dur,velocity:n.velocity??85}))};
    });}
    if(grade>=4)for(const role of ['guitar','keys'])if(roleFocus[role]==='ties')for(const name of names){
      const bs=sectionsByName[name];for(let i=0;i<bs.length-1;i++){const last=bs[i][role].notes.at(-1),first=bs[i+1][role].notes[0];
        if(last&&!last.r&&first&&!first.r&&rng()<.65){last.tie=1;delete last.palmMute;first.p=clone(last.p);delete first.accent;if(role==='guitar')first.s=clone(last.s);}
      }
    }
    // Common notation devices are authored from our own music.
    if(roleFocus.guitar==='rhythmChart'){for(const name of names){const bs=sectionsByName[name];if(bs.length>=2&&name!=='O'){bs[1]=clone(bs[0]);bs[1].guitar.percentRepeat=true;}}}
    if(navigation){const ns=sectionsByName;if(navigation==='Fine'){ns.A[0].sign='segno';ns.B.at(-1).instruction='D.S. al Fine / Fine';}else if(navigation==='DC'){ns.A.at(-1).instruction='To Coda';ns.B.at(-1).instruction='D.C. al Coda';}else{ns.B[0].sign='segno';ns.B.at(-1).instruction='To Coda';ns.C.at(-1).instruction='D.S. al Coda';}if(ns.O)ns.O[0].sign='coda';}
    let number=0,startBeat=0;const sections=order.map(name=>{const bars=clone(sectionsByName[name]).map(b=>({...b,number:++number})),section={name,startBar:number-bars.length+1,startBeat,time,groups:meter.groups,bars};startBeat+=bars.length*meter.len;return section;});
    const piece={id:`practice-${grade}-${style}-${seed}`,generatorVersion:3,grade,seed,style,requestedStyle:style,focus:roleFocus.guitar,roleFocus,root,scale,key,time,tempo,quarterTempo,swing,maxFret:profile.maxFret,form:sections.map(s=>s.name).join(''),bars:number,uniqueBars:names.reduce((n,name)=>n+sizes[name],0),featured,navigation,repeat:navigation?{from:1,to:unit.reduce((n,name)=>n+sizes[name],0),times:repeatCount}:null,
      programs:{guitar:style==='baroque'||style==='lounge'?24:grade===0?27:29,keys:0,bass:33,drums:0},sections};
    return{piece,score:piece,bytes:AM.practiceGenerator.encode(piece)};
  }
  return{styles,instruments,profiles,generate};
})();
