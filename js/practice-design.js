// App design choices, separate from the reference curriculum's recorded tempos.
AM.practiceDesign = (() => {
  const M=AM.music;
  const tempos={
    rock:[[72,92],[76,100],[80,108],[84,116],[84,128],[80,132]],
    doom:[[50,66],[52,70],[54,74],[54,78],[54,82],[52,86]],
    blues:[null,[72,96],[64,104],[72,112],[68,120],[66,126]],
    gothic:[null,null,[68,96],[70,104],[68,112],[66,120]],
    baroque:[null,null,[76,104],[76,112],[72,120],[72,128]],
    lounge:[null,null,null,[66,94],[64,102],[62,110]],
    progressive:[null,null,null,null,[74,116],[72,126]]
  };
  // Straight / swung / compound probabilities; all retain the Grade 5 gates.
  const grooves={rock:[.67,.18],doom:[.55,.10],blues:[.25,.60],gothic:[.60,.10],baroque:[.70,.10],lounge:[.40,.45],progressive:[.55,.10]};
  function tempoRange(grade,style,time='4/4',swing=false){
    const range=[...tempos[style][grade]];
    if(time==='12/8'){range[0]=Math.round(range[0]*1.25);range[1]=Math.round(range[1]*1.25);}
    else if(time!=='4/4'){range[0]=Math.round(range[0]*.8);range[1]=Math.round(range[1]*.8);}
    if(swing)range[1]=Math.round(range[1]*.94);
    return range;
  }
  function groove(grade,style,value){const [straight,swing]=grooves[style];return grade<5||value<straight?'straight':value<straight+swing?'swing':'compound';}
  const seconds=piece=>piece.sections.reduce((n,s)=>n+s.bars.length*M.meter(s.time).len,0)*60/(piece.quarterTempo??piece.tempo*M.meter(piece.time).q);
  // Consider complete phrases at the desired tempo. Fine/Da Capo/Da Segno
  // and twelve-bar blues retain their complete return/chorus units.
  function form({grade,unit,sizes,navigation,blues,bluesAnswer,range,requested,time}){
    const target=AM.practiceCurriculum[grade].durationSeconds,beatSeconds=M.meter(time).len*60;
    const tail=blues?['A',bluesAnswer?'B′':'B','O']:navigation==='Fine'?unit:navigation==='DC'?['A','O']:navigation==='DS'?['B','O']:['O'];
    let best;
    for(let copies=1;copies<=16;copies++)for(let prefix=0;prefix<(blues||navigation?1:unit.length);prefix++){
      const order=[...Array.from({length:copies},()=>unit).flat(),...unit.slice(0,prefix),...tail];
      const bars=order.reduce((n,name)=>n+sizes[name],0);if(bars>256||order.length>64)continue;
      const ideal=bars*beatSeconds/target,tempo=Math.round(Math.max(range[0],Math.min(range[1],ideal))*10)/10,duration=bars*beatSeconds/tempo;
      const error=Math.abs(duration/target-1),cost=error*100+Math.abs(tempo-requested)/Math.max(1,range[1]-range[0])*.08;
      if(!best||cost<best.cost)best={order,copies,tempo,duration,cost};
    }
    if(!best)throw Error('No playable duration plan');return best;
  }
  return{tempos,grooves,tempoRange,groove,seconds,form};
})();
