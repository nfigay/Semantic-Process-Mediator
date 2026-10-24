import fs from 'node:fs';
import path from 'node:path';
const root = path.join(import.meta.dirname, 'registry');
const defs = {
 milestones:['id','kind','name','source_commit','publication_commit','qualification','limit'],
 gates:['id','milestone_id','gate_type','outcome','observed_at','contract_version_id','limit'],
 claims:['id','gate_id','claim_text','context','limit'],
 sources:['id','locator','sha256','origin','verification','limit'],
 evidence:['id','claim_id','source_id','source_member','qualification','limit'],
 relations:['id','from_id','type','to_id','basis_evidence_id','qualification','limit'],
 interventions:['id','gate_id','actor','tool','event','evidence_id','duration_minutes','limit'],
 contract_versions:['id','source_id','normative_claim','applicability','limit']
};
let errors=[]; const tables={}; const ids=new Map();
for (const [name,headers] of Object.entries(defs)) {
  const p=path.join(root,`${name}.tsv`);
  const lines=fs.readFileSync(p,'utf8').trimEnd().split('\n').map(line=>line.split('\t'));
  if (lines[0].join('\t')!==headers.join('\t')) errors.push(`${name}:HEADER`);
  tables[name]=lines.slice(1).map((parts,i)=>{
    if(parts.length!==headers.length) errors.push(`${name}:${i+2}:COLUMN_COUNT`);
    const obj=Object.fromEntries(headers.map((h,j)=>[h,parts[j]??'']));
    if(!obj.id||ids.has(obj.id))errors.push(`${name}:${i+2}:ID_DUPLICATE_OR_EMPTY`);
    ids.set(obj.id,name); return obj;
  });
}
const check=(table,col,target)=>tables[table].forEach((row,i)=>{ if(row[col] && ids.get(row[col])!==target)errors.push(`${table}:${i+2}:${col}:BAD_FK`); });
for (const [t,c,target] of [
 ['gates','milestone_id','milestones'],['gates','contract_version_id','contract_versions'],
 ['claims','gate_id','gates'],['evidence','claim_id','claims'],['evidence','source_id','sources'],
 ['relations','basis_evidence_id','evidence'],['interventions','gate_id','gates'],
 ['interventions','evidence_id','evidence'],['contract_versions','source_id','sources']])check(t,c,target);
tables.relations.forEach((r,i)=>{for(const col of ['from_id','to_id']) if(!ids.has(r[col]))errors.push(`relations:${i+2}:${col}:BAD_REF`);});
tables.sources.forEach((r,i)=>{if(r.sha256&&!/^[a-f0-9]{64}$/.test(r.sha256))errors.push(`sources:${i+2}:BAD_SHA256`);});
for(const [name,rows] of Object.entries(tables))console.log(`${name.toUpperCase()}=${rows.length}`);
console.log(`VALIDATION=${errors.length?'FAIL':'PASS'}`);
for(const err of errors)console.error(err);
process.exitCode=errors.length?1:0;
