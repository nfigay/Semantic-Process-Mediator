/** BPMNSM FLOW-CONV-04: portable DOM-only structural audit. */
const NS='http://www.omg.org/spec/BPMN/20100524/MODEL';
const all=(root,name)=>Array.from(root.getElementsByTagNameNS(NS,name));
const id=e=>e.getAttribute('id')||'';
const nearest=(e,name)=>{for(let p=e.parentNode;p&&p.nodeType===1;p=p.parentNode)if(p.namespaceURI===NS&&p.localName===name)return p;return null;};
const add=(issues,code,element,details)=>issues.push({code,id:id(element),details});
export function verifyStructure(doc){
 if(!doc?.documentElement)throw Error('BPMN DOM document required');
 const defs=doc.documentElement, issues=[];
 if(defs.namespaceURI!==NS||defs.localName!=='definitions')add(issues,'INVALID_ROOT',defs,'Expected bpmn:definitions');
 const elements=Array.from(doc.getElementsByTagName('*'));
 const byId=new Map();
 for(const el of elements){const k=id(el);if(k){if(byId.has(k))add(issues,'DUPLICATE_ID',el,k);else byId.set(k,el);}}
 const collaborations=all(doc,'collaboration'), processes=all(doc,'process'), participants=all(doc,'participant'), flows=all(doc,'messageFlow');
 const owners=new Map(), processRefs=new Map();
 for(const p of participants){
  const c=nearest(p,'collaboration');if(!c)add(issues,'PARTICIPANT_OUTSIDE_COLLABORATION',p,'');
  const ref=p.getAttribute('processRef');if(ref){const proc=byId.get(ref);if(!proc||proc.namespaceURI!==NS||proc.localName!=='process')add(issues,'INVALID_PROCESS_REF',p,ref);else{const list=processRefs.get(ref)||[];list.push(p);processRefs.set(ref,list);}}
  if(c)owners.set(id(p),c);
 }
 const processOf=e=>{for(let p=e;p&&p.nodeType===1;p=p.parentNode)if(p.namespaceURI===NS&&p.localName==='process')return p;return null;};
 const resolve=(ref,collab,flow,side)=>{
  const e=byId.get(ref);if(!e){add(issues,'UNKNOWN_ENDPOINT',flow,side+':'+ref);return null;}
  if(e.namespaceURI!==NS){add(issues,'NON_BPMN_ENDPOINT',flow,side+':'+ref);return null;}
  if(e.localName==='participant'){
   if(owners.get(ref)!==collab)add(issues,'PARTICIPANT_NOT_IN_FLOW_COLLABORATION',flow,side+':'+ref);
   return {participant:e,processRef:e.getAttribute('processRef')||null};
  }
  const process=processOf(e);
  if(!process){add(issues,'ENDPOINT_OUTSIDE_PROCESS',flow,side+':'+ref+' ('+e.localName+')');return null;}
  const matches=all(collab,'participant').filter(p=>p.getAttribute('processRef')===id(process));
  if(matches.length!==1)add(issues,'ENDPOINT_PARTICIPANT_RESOLUTION',flow,side+':'+ref+' process='+id(process)+' matches='+matches.length);
  return {participant:matches.length===1?matches[0]:null,processRef:id(process)};
 };
 for(const f of flows){
  const c=nearest(f,'collaboration');if(!c){add(issues,'MESSAGE_FLOW_OUTSIDE_COLLABORATION',f,'');continue;}
  const a=resolve(f.getAttribute('sourceRef')||'',c,f,'source');
  const b=resolve(f.getAttribute('targetRef')||'',c,f,'target');
  if(a?.participant&&b?.participant&&a.participant===b.participant)add(issues,'SAME_PARTICIPANT_FLOW',f,id(a.participant));
 }
 // Distinguish reused processes (potentially legitimate) from exact alias participants across collaborations.
 const aliases=[];
 for(const [ref, ps] of processRefs)if(ps.length>1)aliases.push({processRef:ref,participants:ps.map(id),collaborations:ps.map(p=>id(nearest(p,'collaboration')||p))});
 const recovery=collaborations.filter(c=>id(c)==='EA_FLOW03_RECOVERY');
 return {ok:issues.length===0,counts:{collaborations:collaborations.length,processes:processes.length,participants:participants.length,messageFlows:flows.length,uniqueIds:byId.size,recoveryCollaborations:recovery.length,sharedProcessReferences:aliases.length},issues,aliases};
}
export function formatReport(r){const out=['===== FLOW-CONV-04 STRUCTURE =====',...Object.entries(r.counts).map(([k,v])=>`${k.toUpperCase()}=${v}`),`STRUCTURAL_ANOMALIES=${r.issues.length}`,`STRUCTURE_STATUS=${r.ok?'OK':'REVIEW'}`];const freq=new Map();for(const i of r.issues)freq.set(i.code,(freq.get(i.code)||0)+1);for(const [k,v] of freq)out.push(`ISSUE_${k}=${v}`);for(const i of r.issues)out.push(`DETAIL=${i.code}\t${i.id}\t${i.details}`);for(const a of r.aliases)out.push(`SHARED_PROCESS=${a.processRef}\t${a.collaborations.join(',')}\t${a.participants.join(',')}`);return out.join('\n');}
