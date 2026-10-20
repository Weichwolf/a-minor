AM.practiceMotifs = (() => {
  // Original scale-degree contours, not quotations of artists or recordings.
  // The first family in each style retains the former central contour.
  const families={
    rock:[
      {id:'anchor',degrees:[0,0,2,1,0,3,2,1]},
      {id:'hook',degrees:[0,2,0,1,0,2,1,0]},
      {id:'steps',degrees:[0,1,1,2,0,1,2,0]},
      {id:'answer',degrees:[2,1,0,0,1,2,1,0]},
      {id:'arch',degrees:[0,1,2,1,2,3,1,0]}
    ],
    doom:[
      {id:'weight',degrees:[0,2,1,0,0,3,2,0]},
      {id:'descent',degrees:[2,2,1,0,2,1,0,0]},
      {id:'pedal',degrees:[0,0,1,0,0,2,1,0]},
      {id:'lament',degrees:[1,2,1,0,1,3,2,0]},
      {id:'rise',degrees:[0,1,0,2,3,2,1,0]}
    ],
    blues:[
      {id:'call',degrees:[0,1,2,1,0,2,1,0]},
      {id:'reply',degrees:[2,1,0,0,1,2,1,0]},
      {id:'pickup',degrees:[0,0,1,2,1,0,2,0]},
      {id:'turn',degrees:[1,2,1,0,2,1,0,0]},
      {id:'refrain',degrees:[0,2,2,1,0,1,2,0]}
    ],
    gothic:[
      {id:'thread',degrees:[0,1,2,1,0,2,3,1]},
      {id:'arc',degrees:[0,2,3,2,1,3,2,0]},
      {id:'echo',degrees:[1,0,2,1,1,0,3,1]},
      {id:'suspension',degrees:[2,2,1,0,1,2,3,1]},
      {id:'spiral',degrees:[0,1,3,2,1,2,4,2]}
    ],
    baroque:[
      {id:'sequence',degrees:[0,2,4,2,1,3,5,3]},
      {id:'neighbour',degrees:[0,1,2,1,1,2,3,2]},
      {id:'broken',degrees:[0,2,1,3,1,3,2,4]},
      {id:'cascade',degrees:[3,2,1,0,4,3,2,1]},
      {id:'dialogue',degrees:[0,1,0,2,1,2,1,3]}
    ],
    lounge:[
      {id:'song',degrees:[0,1,2,1,3,2,1,0]},
      {id:'sigh',degrees:[2,1,1,0,1,2,1,0]},
      {id:'commonTone',degrees:[1,1,2,1,1,3,2,1]},
      {id:'wave',degrees:[0,2,3,2,1,2,1,0]},
      {id:'lateAnswer',degrees:[0,0,1,2,2,1,3,1]}
    ],
    progressive:[
      {id:'cells',degrees:[0,2,0,3,1,2,4,1]},
      {id:'displacement',degrees:[0,1,3,0,1,3,2,0]},
      {id:'expansion',degrees:[0,1,0,2,0,3,2,1]},
      {id:'mirror',degrees:[2,0,1,3,1,3,2,0]},
      {id:'return',degrees:[0,2,1,0,3,2,1,0]}
    ]
  };
  const accents={rock:'riffAnswer',doom:'space',blues:'chorusAnswer',gothic:'singingThread',baroque:'countermotion',lounge:'gentleMotion',progressive:'development'};
  function random(seed){let state=seed>>>0;return()=>{state+=0x6D2B79F5;let n=Math.imul(state^state>>>15,1|state);n^=n+Math.imul(n^n>>>7,61|n);return((n^n>>>14)>>>0)/4294967296;};}
  function plan(grade,seed,style){
    if(!families[style]||!Number.isInteger(grade)||grade<0||grade>5||!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid motif settings');
    const salt=Object.keys(families).indexOf(style)+1,rng=random((seed^Math.imul(salt,0x9e3779b9))>>>0);
    // A separate stream keeps key, focus, metre and form selection stable.
    const accent=rng()<.25?accents[style]:null,family=families[style][Math.floor(rng()*families[style].length)];
    return{family:family.id,accent,degrees:family.degrees.map(d=>Math.min(grade===0?2:grade===1?3:6,d))};
  }
  function contour(theme,{style,accent,section,bar,variation=false}){
    const degrees=[...theme];
    if(accent&&section==='B'){
      if(style==='doom')return degrees.sort((a,b)=>b-a);
      if(style==='gothic')return [...degrees.slice(0,4),...degrees.slice(4).reverse()];
      if(style==='progressive')return bar%2?[...degrees.slice(2),...degrees.slice(0,2)]:degrees;
      if(style==='rock'||style==='lounge')return [...degrees.slice(0,4),...degrees.slice(4).sort((a,b)=>b-a)];
      if(style==='blues'&&variation)return [...degrees.slice(0,4),...degrees.slice(4).reverse()];
    }
    return degrees;
  }
  function phrase(grade,bar,length){
    const climax=length===8?5:2,arrival=bar===length-1,open=length===8&&bar===3;
    return{stage:arrival?'arrival':open?'question':bar===climax?'climax':bar>climax?'resolution':bar===0?'statement':'continuation',
      lift:bar===climax?(grade<2?1:2):bar>climax?0:bar%2,arrival};
  }
  return{families,accents,plan,contour,phrase};
})();
