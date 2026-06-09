import{n as e,t}from"./w2ui-US4uV9Ez.js";import{n,r,t as i}from"./bpmn-js-BLgObGIs.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var a={name:`SemArch`,uri:`http://semarch.io/schema/1.0`,prefix:`semarch`,types:[{name:`Meta`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`cocRef`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`},{name:`maturity`,isAttr:!0,type:`String`},{name:`platformRef`,isAttr:!0,type:`String`},{name:`programRef`,isAttr:!0,type:`String`},{name:`bmsRef`,isAttr:!0,type:`String`},{name:`version`,isAttr:!0,type:`String`},{name:`status`,isAttr:!0,type:`String`}]},{name:`DataStoreContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`role`,isAttr:!0,type:`String`},{name:`systemRef`,isAttr:!0,type:`String`},{name:`accessLevel`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`}]},{name:`MessageContract`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`schemaRef`,isAttr:!0,type:`String`},{name:`version`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`},{name:`encoding`,isAttr:!0,type:`String`}]},{name:`BusinessContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`systemType`,isAttr:!0,type:`String`,description:`BMS | CoC | Programme | Activite`},{name:`systemName`,isAttr:!0,type:`String`,description:`Name of the applicative system this repository serves`},{name:`owner`,isAttr:!0,type:`String`},{name:`organization`,isAttr:!0,type:`String`},{name:`governanceFramework`,isAttr:!0,type:`String`},{name:`normativeRefs`,isAttr:!0,type:`String`,description:`Space-separated list of normative references`},{name:`programs`,isAttr:!0,type:`String`,description:`Space-separated programme identifiers`},{name:`communities`,isAttr:!0,type:`String`,description:`Space-separated community identifiers (MIWG, ASD-SSG...)`}]},{name:`ApplicationSystem`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`id`,isAttr:!0,type:`String`,description:`Stable identifier for this application system`},{name:`name`,isAttr:!0,type:`String`,description:`Human name of the applicative system (not the product)`},{name:`purpose`,isAttr:!0,type:`String`},{name:`interfaces`,isAttr:!0,type:`String`,description:`Space-separated IDs of interfaced application systems`}]},{name:`TechnicalRealization`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`applicationSystemId`,isAttr:!0,type:`String`,description:`References ApplicationSystem.id`},{name:`softwareProduct`,isAttr:!0,type:`String`,description:`Name of the software product (ARIS, Sparx EA, Windchill...)`},{name:`productVersion`,isAttr:!0,type:`String`},{name:`nativeFormat`,isAttr:!0,type:`String`,description:`Native serialisation format of the product (AML, XMI, AP242...)`},{name:`exchangeFormat`,isAttr:!0,type:`String`,description:`Exchange format used for interoperability (BPMN 2.0 XML...)`},{name:`idScheme`,isAttr:!0,type:`String`,description:`How this product generates IDs (EA_GUID, ARIS_ID...)`},{name:`url`,isAttr:!0,type:`String`}]},{name:`RepositoryLifecycle`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`version`,isAttr:!0,type:`String`},{name:`status`,isAttr:!0,type:`String`,description:`Draft | Active | Archived | Deprecated`},{name:`maturity`,isAttr:!0,type:`String`,description:`L1 | L2 | L3 | L4`},{name:`lastReview`,isAttr:!0,type:`String`},{name:`nextReview`,isAttr:!0,type:`String`},{name:`reviewCycle`,isAttr:!0,type:`String`},{name:`governedBy`,isAttr:!0,type:`String`}]},{name:`Correspondence`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`id`,isAttr:!0,type:`String`},{name:`type`,isAttr:!0,type:`String`,description:`derivation | equivalence | specialization | abstraction`},{name:`sourceRepositoryId`,isAttr:!0,type:`String`},{name:`sourceModelId`,isAttr:!0,type:`String`},{name:`targetRepositoryId`,isAttr:!0,type:`String`},{name:`targetModelId`,isAttr:!0,type:`String`},{name:`confidence`,isAttr:!0,type:`String`,description:`high | medium | low | unverified`},{name:`preservedAttributes`,isAttr:!0,type:`String`,description:`Space-separated list of preserved attributes`},{name:`lostAttributes`,isAttr:!0,type:`String`,description:`Space-separated list of attributes lost in translation`},{name:`notes`,isAttr:!0,type:`String`}]},{name:`MediationContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`sourceSystem`,isAttr:!0,type:`String`,description:`Name of source applicative system`},{name:`targetSystem`,isAttr:!0,type:`String`,description:`Name of target applicative system`},{name:`sourceSoftwareProduct`,isAttr:!0,type:`String`},{name:`targetSoftwareProduct`,isAttr:!0,type:`String`},{name:`direction`,isAttr:!0,type:`String`,description:`unidirectional | bidirectional`},{name:`strategy`,isAttr:!0,type:`String`,description:`by-semarch-id | by-name | by-platformRef | manual`},{name:`lastSynchronized`,isAttr:!0,type:`String`}]},{name:`RepositoryContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`repositoryVersion`,isAttr:!0,type:`String`},{name:`cocOwner`,isAttr:!0,type:`String`},{name:`organization`,isAttr:!0,type:`String`},{name:`maturity`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`},{name:`targetPlatform`,isAttr:!0,type:`String`},{name:`programContext`,isAttr:!0,type:`String`},{name:`lastReview`,isAttr:!0,type:`String`}]}]},o={version:`1.0`,cocs:[{id:`BMS_Generic`,name:`BMS — Generic (all domains)`,organization:`Airbus D&S`,maturity:`L1`,stdRef:`ISO 9001 / EN 9100`,targetPlatform:`ARIS`,description:`Generic BMS processes applicable to all products and domains`},{id:`CoC_Avionics`,name:`CoC Avionics`,organization:`Airbus D&S`,maturity:`L2`,stdRef:`DO-178C / DO-254 / ARP 4754A`,targetPlatform:`EA`,description:`Avionics CoC — DO-178C software processes and ARP 4754A system processes`},{id:`CoC_Space_ESA`,name:`CoC Space — ESA programmes`,organization:`Airbus D&S`,maturity:`L2`,stdRef:`ECSS-M-ST-10 / ECSS-Q-ST-80`,targetPlatform:`EA`,description:`Space CoC processes aligned with ESA ECSS requirements`},{id:`CoC_Space_NASA`,name:`CoC Space — NASA programmes`,organization:`Airbus D&S`,maturity:`L2`,stdRef:`NPR 7120.5 / NASA-STD-7009`,targetPlatform:`EA`,description:`Space CoC processes adapted for NASA contractual requirements`},{id:`CoC_Confluence`,name:`CoC Confluence (informal)`,organization:`Airbus D&S`,maturity:`L1`,stdRef:``,targetPlatform:`Standalone`,description:`Teams using Confluence wiki for process documentation — on-ramp to L2`}],maturityProfiles:{L1:{label:`Drawing`,description:`Informal process drawings — on-ramp to formalism`,activeExtensions:[],lintRules:[`semarch/named-element`,`semarch/stable-id`]},L2:{label:`Modelling`,description:`Structured BPMN models aligned with standards and platform targets`,activeExtensions:[`cocRef`,`stdRef`,`maturity`,`platformRef`,`bmsRef`],lintRules:[`semarch/named-element`,`semarch/stable-id`,`semarch/require-coc-ref`,`semarch/typed-message-flow`]},L3:{label:`Executable`,description:`BPMN models enriched for workflow automation`,activeExtensions:[`cocRef`,`stdRef`,`maturity`,`platformRef`,`bmsRef`,`programRef`,`version`,`status`],lintRules:[`semarch/named-element`,`semarch/stable-id`,`semarch/require-coc-ref`,`semarch/typed-message-flow`]},L4:{label:`Simulation`,description:`BPMN models with simulation and KPI parameters`,activeExtensions:[`cocRef`,`stdRef`,`maturity`,`platformRef`,`bmsRef`,`programRef`,`version`,`status`],lintRules:[`semarch/named-element`,`semarch/stable-id`,`semarch/require-coc-ref`,`semarch/typed-message-flow`]}}},s=/^[A-Za-z]+_[0-9a-zA-Z]{7,}$/,c={id:`semarch/stable-id`,name:`Stable semantic ID`,severity:`warning`,appliesTo:null,check(e){return[`label`,`bpmn:Definitions`].includes(e.type)?[]:e.type===`bpmn:Process`&&e.id===`Process_1`?[{rule:`semarch/stable-id`,severity:`warning`,element:e,message:`Default "Process_1" ID — rename to something like "CoC_Avionics_AssemblyVerification"`}]:s.test(e.id)?[{rule:`semarch/stable-id`,severity:`warning`,element:e,message:`Auto-generated ID "${e.id}". Use semantic naming: {ProcessId}_{Type}_{Name}`}]:[]}},l={id:`semarch/require-coc-ref`,name:`CoC reference required`,severity:`info`,appliesTo:[`bpmn:Process`,`bpmn:Task`,`bpmn:UserTask`,`bpmn:ServiceTask`,`bpmn:ManualTask`,`bpmn:BusinessRuleTask`,`bpmn:ScriptTask`,`bpmn:CallActivity`,`bpmn:SubProcess`],check(e){if(!this.appliesTo.includes(e.type))return[];let t=e.businessObject.extensionElements?.values?.find(e=>e.$type===`semarch:Meta`);return t?t.cocRef?[]:[{rule:`semarch/require-coc-ref`,severity:`info`,element:e,message:`semarch:Meta on "${e.id}" is missing cocRef`}]:[{rule:`semarch/require-coc-ref`,severity:`info`,element:e,message:`No semarch:Meta on "${e.id}" — add cocRef to trace CoC ownership`}]}},u=[c,{id:`semarch/named-element`,name:`Element should have a name`,severity:`info`,appliesTo:[`bpmn:Task`,`bpmn:UserTask`,`bpmn:ServiceTask`,`bpmn:ManualTask`,`bpmn:BusinessRuleTask`,`bpmn:ScriptTask`,`bpmn:CallActivity`,`bpmn:SubProcess`,`bpmn:ExclusiveGateway`,`bpmn:InclusiveGateway`,`bpmn:ParallelGateway`,`bpmn:EventBasedGateway`,`bpmn:ComplexGateway`,`bpmn:StartEvent`,`bpmn:EndEvent`,`bpmn:IntermediateCatchEvent`,`bpmn:IntermediateThrowEvent`,`bpmn:BoundaryEvent`,`bpmn:DataObjectReference`,`bpmn:DataStoreReference`],check(e){if(!this.appliesTo.includes(e.type))return[];let t=e.businessObject;return!t.name||t.name.trim()===``?[{rule:`semarch/named-element`,severity:`info`,element:e,message:`${e.type.replace(`bpmn:`,``)} "${e.id}" has no name — unnamed elements break traceability`}]:[]}},{id:`semarch/typed-message-flow`,name:`Message flow should reference a message`,severity:`warning`,appliesTo:[`bpmn:MessageFlow`],check(e){return e.type===`bpmn:MessageFlow`?e.businessObject.messageRef?[]:[{rule:`semarch/typed-message-flow`,severity:`warning`,element:e,message:`MessageFlow "${e.id}" has no messageRef — define the exchanged message`}]:[]}}],d=[...u,l],f=class{constructor(e,t){this.modeler=e,this.onResult=t,this.rules=[...u],this._timer=null,this._active=!0,e.on(`commandStack.changed`,()=>{this._active&&(clearTimeout(this._timer),this._timer=setTimeout(()=>this.run(),900))}),e.on(`import.done`,()=>{this._active&&setTimeout(()=>this.run(),300)})}setProfile(e){switch(e){case`L1`:this.rules=u;break;case`L2`:case`L3`:case`L4`:this.rules=d;break;default:this.rules=u}}addRule(e){this.rules.find(t=>t.id===e.id)||this.rules.push(e)}setActive(e){this._active=e}run(){let e=this.modeler.get(`elementRegistry`);if(!e)return[];let t=e.getAll(),n=[];for(let e of this.rules)for(let r of t)if(r.type!==`label`)try{let t=e.check(r);t&&t.length&&n.push(...t)}catch(t){console.warn(`[SemArchLinter] Rule ${e.id} threw:`,t)}let r={error:0,warning:1,info:2};return n.sort((e,t)=>(r[e.severity]??3)-(r[t.severity]??3)),this.onResult(n),n}},p=`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:semarch="http://semarch.io/schema/1.0"
  targetNamespace="http://semarch.io/repository"
  id="Definitions_Repository">

  <bpmn:extensionElements>
    <semarch:RepositoryContext
      cocOwner=""
      organization=""
      maturity="L1"
      stdRef=""
      targetPlatform="Standalone"
      programContext=""
      repositoryVersion="1.0"
      lastReview=""/>
  </bpmn:extensionElements>

  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_A" name="System A" processRef="Process_A"/>
    <bpmn:participant id="Participant_B" name="System B" processRef="Process_B"/>
  </bpmn:collaboration>

  <bpmn:process id="Process_A" isExecutable="true">
    <bpmn:startEvent id="Process_A_Start" name="Start"/>
  </bpmn:process>

  <bpmn:process id="Process_B" isExecutable="false">
    <bpmn:startEvent id="Process_B_Start" name="Start"/>
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_Collaboration">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
      <bpmndi:BPMNShape id="Participant_A_di" bpmnElement="Participant_A" isHorizontal="true">
        <dc:Bounds x="120" y="80" width="600" height="160"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Process_A_Start_di" bpmnElement="Process_A_Start">
        <dc:Bounds x="200" y="142" width="36" height="36"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Participant_B_di" bpmnElement="Participant_B" isHorizontal="true">
        <dc:Bounds x="120" y="280" width="600" height="160"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Process_B_Start_di" bpmnElement="Process_B_Start">
        <dc:Bounds x="200" y="342" width="36" height="36"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,m=new t({box:`#app`,name:`main-layout`,panels:[{type:`top`,size:45,resizable:!1,style:`overflow:hidden; padding:0; background:#1E3A5F;`},{type:`left`,size:50,resizable:!1,style:`background:#F4F6F9; border-right:1px solid #D4DCE6; overflow:hidden; padding:0;`},{type:`main`,style:`background:#fff; overflow:hidden;`},{type:`right`,size:320,resizable:!0,style:`background:#F9FAFB; border-left:1px solid #D4DCE6; overflow:hidden;`},{type:`bottom`,size:130,resizable:!0,style:`background:#F4F6F9; border-top:1px solid #D4DCE6; overflow:hidden;`}]});m.el(`top`).innerHTML=`
  <div style="display:flex;align-items:center;height:45px;padding:0 10px;gap:2px;">
    <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:11px;
      letter-spacing:.1em;text-transform:uppercase;color:#fff;padding:0 12px;
      white-space:nowrap;">Semantic Process Mediator</span>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn" id="btn-new">New</button>
    <button class="tb-btn" id="btn-import">Import…</button>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn" id="btn-export-xml">Export XML</button>
    <button class="tb-btn" id="btn-export-svg">Export SVG</button>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn" id="btn-fit">Fit</button>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn tb-btn-accent" id="btn-context">⚙ CoC Context</button>
    <button class="tb-btn" id="btn-lint">⚡ Lint</button>
    <span style="flex:1"></span>
    <span id="lint-badge" style="display:none;font-family:monospace;font-size:11px;
      background:rgba(255,255,255,.12);color:#fff;padding:2px 10px;border-radius:20px;
      white-space:nowrap;"></span>
  </div>
`,m.el(`main`).innerHTML=`<div id="bpmn-canvas"  style="width:100%;height:100%;"></div>`,m.el(`right`).innerHTML=`<div id="bpmn-props"   style="height:100%;"></div>`,m.el(`bottom`).innerHTML=`
  <div id="lint-panel" style="height:100%;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;padding:4px 12px;
      background:#EDF0F5;border-bottom:1px solid #D4DCE6;gap:8px;flex-shrink:0;">
      <span style="font-family:monospace;font-size:10px;font-weight:600;
        color:#4A6580;letter-spacing:.08em;text-transform:uppercase;">
        Linting Results
      </span>
      <span id="lint-summary" style="font-family:monospace;font-size:10px;color:#8A9BB0;"></span>
    </div>
    <div id="lint-results" style="flex:1;overflow-y:auto;padding:4px 0;"></div>
  </div>
`;var h=new r({container:`#bpmn-canvas`,propertiesPanel:{parent:`#bpmn-props`},additionalModules:[n,i],moddleExtensions:{semarch:a}}),g=new f(h,_);g.setProfile(`L2`);function _(e){let t=document.getElementById(`lint-results`),n=document.getElementById(`lint-summary`),r=document.getElementById(`lint-badge`);if(!t)return;let i=e.filter(e=>e.severity===`error`).length,a=e.filter(e=>e.severity===`warning`).length,o=e.filter(e=>e.severity===`info`).length;if(e.length===0)r.style.display=`none`,n.textContent=`No issues`;else{r.style.display=``;let t=[];i&&t.push(`${i}E`),a&&t.push(`${a}W`),o&&t.push(`${o}I`),r.textContent=t.join(` · `),n.textContent=`${e.length} issue${e.length>1?`s`:``}`}if(e.length===0){t.innerHTML=`
      <div style="padding:8px 14px;font-family:monospace;font-size:11px;color:#6BAF92;">
        ✓ All rules passed
      </div>`;return}let s={error:{dot:`#B84040`,bg:`#FBF3F3`,text:`#7A2020`},warning:{dot:`#C47A2B`,bg:`#FBF6F0`,text:`#6A4010`},info:{dot:`#2E6DA4`,bg:`#EEF4FB`,text:`#1A3A5A`}};t.innerHTML=e.map(e=>{let t=s[e.severity]||s.info,n=e.element.businessObject?.name?` — ${e.element.businessObject.name}`:``;return`
      <div class="lint-row" data-element-id="${e.element.id}"
        style="display:flex;align-items:flex-start;gap:8px;padding:3px 12px;
          cursor:pointer;border-bottom:1px solid #EDF0F5;"
        onmouseover="this.style.background='${t.bg}'"
        onmouseout="this.style.background=''">
        <span style="width:6px;height:6px;border-radius:50%;background:${t.dot};
          flex-shrink:0;margin-top:4px;"></span>
        <div style="min-width:0;">
          <span style="font-family:monospace;font-size:10px;color:#8A9BB0;">
            ${e.rule}
          </span>
          <span style="font-family:monospace;font-size:10px;font-weight:600;
            color:${t.text};margin-left:6px;">
            ${e.element.id}${n}
          </span>
          <div style="font-size:11px;color:#4A6580;line-height:1.35;">
            ${e.message}
          </div>
        </div>
      </div>`}).join(``),t.querySelectorAll(`.lint-row`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.elementId,n=h.get(`elementRegistry`).get(t);n&&(h.get(`selection`).select(n),h.get(`canvas`).scrollToElement(n))})})}function v(){return o.cocs.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``)}function y(){let t=b();e.open({title:`⚙ CoC Context — Repository Settings`,width:560,height:420,body:`
      <div style="padding:16px;font-family:'DM Sans',sans-serif;font-size:13px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Centre of Competence</label>
            <select id="ctx-coc" style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;background:#fff;">
              <option value="">— select CoC —</option>
              ${v()}
            </select>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Maturity Level</label>
            <select id="ctx-maturity" style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;background:#fff;">
              <option value="L1">L1 — Drawing (informal)</option>
              <option value="L2">L2 — Modelling (structured)</option>
              <option value="L3">L3 — Executable (workflow-ready)</option>
              <option value="L4">L4 — Simulation (analytical)</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Organisation</label>
            <input id="ctx-org" type="text" placeholder="Airbus D&S"
              style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;box-sizing:border-box;"
              value="${t.organization||``}"/>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Target Platform</label>
            <select id="ctx-platform" style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;background:#fff;">
              <option value="Standalone">Standalone / BPMN.io</option>
              <option value="ARIS">ARIS (BMS)</option>
              <option value="EA">Enterprise Architect (CoC)</option>
              <option value="Camunda">Camunda / Zeebe (executable)</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Reference Standard</label>
            <input id="ctx-std" type="text" placeholder="DO-178C / ECSS-Q-ST-80 / ISO 9001"
              style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;box-sizing:border-box;"
              value="${t.stdRef||``}"/>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Programme / Contract</label>
            <input id="ctx-program" type="text" placeholder="ESA-2024-XXX / Internal"
              style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;box-sizing:border-box;"
              value="${t.programContext||``}"/>
          </div>

        </div>
        <div style="margin-top:12px;padding:8px 12px;background:#EEF4FB;
          border-left:3px solid #2E6DA4;border-radius:0 4px 4px 0;
          font-size:11px;color:#4A6580;line-height:1.4;">
          This context is serialised into the BPMN file as
          <code style="font-family:monospace;background:#D8E8F4;padding:1px 4px;
            border-radius:2px;">semarch:RepositoryContext</code>
          — it travels with the model and is transparent to ARIS and EA.
        </div>
      </div>`,buttons:`
      <button class="w2ui-btn" onclick="w2popup.close()">Cancel</button>
      <button class="w2ui-btn w2ui-btn-blue" id="btn-save-context">Save Context</button>`,onOpen:()=>{let n=document.getElementById(`ctx-maturity`),r=document.getElementById(`ctx-platform`),i=document.getElementById(`ctx-coc`);n&&t.maturity&&(n.value=t.maturity),r&&t.targetPlatform&&(r.value=t.targetPlatform),i&&t.cocOwner&&(i.value=t.cocOwner),i?.addEventListener(`change`,()=>{let e=o.cocs.find(e=>e.id===i.value);e&&(document.getElementById(`ctx-org`).value=e.organization||``,document.getElementById(`ctx-std`).value=e.stdRef||``,document.getElementById(`ctx-platform`).value=e.targetPlatform||`Standalone`,document.getElementById(`ctx-maturity`).value=e.maturity||`L1`)}),document.getElementById(`btn-save-context`)?.addEventListener(`click`,()=>{x({cocOwner:document.getElementById(`ctx-coc`).value,organization:document.getElementById(`ctx-org`).value,maturity:document.getElementById(`ctx-maturity`).value,stdRef:document.getElementById(`ctx-std`).value,targetPlatform:document.getElementById(`ctx-platform`).value,programContext:document.getElementById(`ctx-program`).value,repositoryVersion:t.repositoryVersion||`1.0`,lastReview:new Date().toISOString().split(`T`)[0]}),e.close()})}})}function b(){try{return(h.getDefinitions()?.extensionElements)?.values?.find(e=>e.$type===`semarch:RepositoryContext`)||{}}catch{return{}}}function x(e){try{let t=h.get(`moddle`);h.get(`modeling`);let n=h.getDefinitions();n.extensionElements||=t.create(`bpmn:ExtensionElements`,{values:[]}),n.extensionElements.values=(n.extensionElements.values||[]).filter(e=>e.$type!==`semarch:RepositoryContext`);let r=t.create(`semarch:RepositoryContext`,e);n.extensionElements.values.push(r),g.setProfile(e.maturity||`L2`),g.run()}catch(e){console.error(`saveRepositoryContext error:`,e)}}function S(){let e=document.querySelector(`#bpmn-canvas .djs-palette`);if(!e)return;let t=m.el(`left`);t.innerHTML=``,t.appendChild(e),Object.assign(e.style,{position:`relative`,left:`0`,top:`0`,width:`100%`,height:`100%`,border:`none`,borderRadius:`0`,boxShadow:`none`,background:`transparent`})}async function C(e){try{await h.importXML(e),h.get(`canvas`).zoom(`fit-viewport`),S();let t=b();t.maturity&&g.setProfile(t.maturity)}catch(e){alert(`Import failed: `+e.message)}}function w(e,t,n){let r=new Blob([e],{type:n}),i=document.createElement(`a`);i.href=URL.createObjectURL(r),i.download=t,i.click(),URL.revokeObjectURL(i.href)}document.getElementById(`btn-new`).addEventListener(`click`,()=>{confirm(`Create a new diagram? Unsaved changes will be lost.`)&&C(p)});var T=document.getElementById(`file-input`);document.getElementById(`btn-import`).addEventListener(`click`,()=>{T.value=``,T.click()}),T.addEventListener(`change`,()=>{let e=T.files[0];if(!e)return;let t=new FileReader;t.onload=e=>C(e.target.result),t.readAsText(e)}),document.getElementById(`btn-export-xml`).addEventListener(`click`,async()=>{try{let{xml:e}=await h.saveXML({format:!0});w(e,`diagram.bpmn`,`application/xml`)}catch(e){alert(`XML export failed: `+e.message)}}),document.getElementById(`btn-export-svg`).addEventListener(`click`,async()=>{try{let{svg:e}=await h.saveSVG();w(e,`diagram.svg`,`image/svg+xml`)}catch(e){alert(`SVG export failed: `+e.message)}}),document.getElementById(`btn-fit`).addEventListener(`click`,()=>{h.get(`canvas`).zoom(`fit-viewport`)}),document.getElementById(`btn-context`).addEventListener(`click`,y),document.getElementById(`btn-lint`).addEventListener(`click`,()=>{g.run()}),C(p);