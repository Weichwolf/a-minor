export const roles=['keys','bass','guitar','drums'];
export const baseVolume={keys:100,bass:88,guitar:100,drums:92};
export function group(piece,section,bar,role){
 const program=role==='guitar'&&piece.style==='power'?(bar.number-1)%2?30:28:piece.programs[role];
 const keysLead=['B','Keyboard solo'].includes(section.name);
 const voice=role==='keys'?keysLead?'lead':'backing':role==='guitar'?keysLead?'backing':bar.guitar.notes.some(n=>Array.isArray(n.p))?'riff':'lead':'band';
 return `${role}/${program}/${voice}`;
}
export function groups(piece){
 return piece.sections.flatMap(section=>section.bars.map((bar,i)=>{
  const reference=bar.number===piece.bars&&i?{...bar,guitar:section.bars[i-1].guitar}:bar;
  return {number:bar.number,section:section.name,time:bar.time,groups:Object.fromEntries(roles.map(role=>[role,group(piece,section,reference,role)]))};
 }));
}

export function measure(score,measured,seq,channels){
 const bars=groups(score);
 const occupied=new Map(),held=new Map();
 for(const e of seq.events){const [status,n,v]=e.data,ch=status&15,key=ch+':'+n;
  if(status>>4===9&&v)held.set(key,e.t);
  if(status>>4===8||status>>4===9&&!v){const start=held.get(key);if(start!==undefined){for(let i=Math.floor(start/.1);i<Math.ceil(e.t/.1);i++){const overlap=Math.min(e.t,(i+1)*.1)-Math.max(start,i*.1);if(overlap>=.04){if(!occupied.has(i))occupied.set(i,new Set());occupied.get(i).add(ch);}}held.delete(key);}}
 }
 const buckets={};
 for(const [wi,w] of measured.windows.entries()){
  const section=measured.sections[w.section],sc=score.sections[w.section];if(w.t>=measured.duration||section.name==='Intro')continue;
  const bi=Math.min(sc.bars.length-1,Math.floor((w.t+.05-section.start)/(section.end-section.start)*sc.bars.length)),bar=sc.bars[bi];if(bar.number===score.bars)continue;
  for(const [r,role] of roles.entries())if(role==='drums'||occupied.get(wi)?.has(channels[role])){const key=bars[bar.number-1].groups[role];(buckets[key]??=[]).push(w.db[r]);}
 }
 const calibration={};
 for(const [key,values] of Object.entries(buckets)){
  const [role]=key.split('/'),top=Math.max(...values),audible=values.filter(v=>v>top-24).sort((a,b)=>a-b),level=role==='drums'?10*Math.log10(values.reduce((n,v)=>n+10**(v/10),0)/values.length):audible[Math.floor((audible.length-1)*.8)];
  calibration[key]={levelDb:level,windows:role==='drums'?values.length:audible.length};
 }
 return calibration;
}
