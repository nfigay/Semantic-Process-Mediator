import{A as e,An as t,Gn as n,Kn as r,Pn as i,bn as a,it as o,on as s,qn as c,sn as l,t as u,un as d,vn as f}from"./bpmn-Cb9RxoYV.js";function p({modeler:e,container:t=`#bpmn-props`}={}){let n=typeof t==`string`?document.querySelector(t):t;if(!n)throw Error(`Read-only properties container not found: ${t}`);let r=e.get(`eventBus`),i=null,a=null,o=`model`;function s(e){return String(e??``).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function c(){try{return e.getDefinitions()}catch{return null}}function l(e){return e?.extensionElements?.values||[]}function u(e){return l(c()).find(t=>t.$type===e)||null}function d(){return u(`semarch:RepositoryContext`)}function f(){return u(`semarch:MethodConfiguration`)}function p(e){let t=e?.documentation;return Array.isArray(t)?t.map(e=>e?.text||``).filter(Boolean).join(`

`):``}function m(e){if(!e)return[];let t=[];for(let[n,r]of Object.entries(e))n.startsWith(`$`)||r!=null&&typeof r!=`object`&&t.push({key:n,value:r});return t}function h(e){return e?.$type?.startsWith(`semarch:`)===!0}function g(e){return e.length?`
      <div
        style="
          display:grid;
          grid-template-columns:
            minmax(100px, 120px)
            minmax(0, 1fr);
          gap:8px 12px;
        "
      >
        ${e.map(e=>`
                <div
                  style="
                    font-weight:600;
                    color:#555555;
                  "
                >
                  ${s(e.key)}
                </div>

                <div
                  style="
                    overflow-wrap:anywhere;
                  "
                >
                  ${s(e.value)}
                </div>
              `).join(``)}
      </div>
    `:`
        <div
          style="
            color:#888888;
            font-style:italic;
          "
        >
          No data
        </div>
      `}function _(e){return`
      <div
        style="
          margin-bottom:10px;

          font-size:11px;
          font-weight:700;

          letter-spacing:.08em;
          text-transform:uppercase;

          color:#666666;
        "
      >
        ${s(e)}
      </div>
    `}function v({title:e,object:t}){return`
      <div
        style="
          margin-top:10px;
          padding:10px;

          border:1px solid #dddddd;
          border-radius:4px;

          background:#fafafa;
        "
      >

        <div
          style="
            margin-bottom:8px;

            font-size:11px;
            font-weight:700;
            letter-spacing:.04em;

            color:#333333;
          "
        >
          ${s(e)}
        </div>

        ${t?g(m(t)):`
              <div
                style="
                  color:#888888;
                  font-style:italic;
                "
              >
                Not defined
              </div>
            `}

      </div>
    `}function y(){let e=d(),t=f();return`
      <div>

        ${_(`Model`)}


        ${v({title:`Repository Context`,object:e})}


        ${v({title:`Method Configuration`,object:t})}

      </div>
    `}function b(e){let t=m(e);return`
      <div
        style="
          margin-top:10px;
          padding:10px;

          border:1px solid #dddddd;
          border-radius:4px;

          background:#fafafa;
        "
      >

        <div
          style="
            margin-bottom:8px;

            font-size:11px;
            font-weight:700;
            letter-spacing:.04em;

            color:#333333;
          "
        >
          ${s(e.$type||`Extension`)}
        </div>

        ${g(t)}

      </div>
    `}function x({title:e,extensions:t,emptyMessage:n}){return`
      <div
        style="
          margin-top:18px;
          padding-top:14px;

          border-top:1px solid #dddddd;
        "
      >

        ${_(e)}


        ${t.length?t.map(b).join(``):`
              <div
                style="
                  color:#888888;
                  font-style:italic;
                "
              >
                ${s(n)}
              </div>
            `}

      </div>
    `}function S(){let e=a||i?.businessObject;if(!e)return`
        <div>

          ${_(`Element`)}


          <div
            style="
              color:#777777;
            "
          >
            Select a BPMN element
            to inspect its properties.
          </div>

        </div>
      `;let t=p(e),n=l(e),r=n.filter(e=>h(e)),o=n.filter(e=>!h(e));return`
      <div>

        ${_(`BPMN`)}


        <div
          style="
            display:grid;
            grid-template-columns:
              90px
              minmax(0, 1fr);
            gap:8px 12px;
          "
        >

          <div
            style="
              font-weight:600;
              color:#555555;
            "
          >
            Type
          </div>

          <div>
            ${s(e.$type)}
          </div>


          <div
            style="
              font-weight:600;
              color:#555555;
            "
          >
            ID
          </div>

          <div
            style="
              overflow-wrap:anywhere;
              font-family:monospace;
            "
          >
            ${s(e.id)}
          </div>


          <div
            style="
              font-weight:600;
              color:#555555;
            "
          >
            Name
          </div>

          <div>
            ${e.name?s(e.name):`
                  <span
                    style="
                      color:#888888;
                      font-style:italic;
                    "
                  >
                    —
                  </span>
                `}
          </div>

        </div>


        <div
          style="
            margin-top:18px;
            padding-top:14px;

            border-top:1px solid #dddddd;
          "
        >

          <div
            style="
              margin-bottom:8px;
              font-weight:700;
            "
          >
            Documentation
          </div>

          <div
            style="
              white-space:pre-wrap;
              overflow-wrap:anywhere;
            "
          >
            ${t?s(t):`
                  <span
                    style="
                      color:#888888;
                      font-style:italic;
                    "
                  >
                    No documentation
                  </span>
                `}
          </div>

        </div>


        ${x({title:`SemArch`,extensions:r,emptyMessage:`No SemArch properties`})}


        ${x({title:`Other Extensions`,extensions:o,emptyMessage:`No other extensions`})}

      </div>
    `}function C(){let e=o===`element`,t=o===`model`;return`
      <div
        style="
          display:flex;

          margin-bottom:16px;

          border-bottom:1px solid #d0d0d0;
        "
      >

        <button
          type="button"
          data-properties-tab="element"

          style="
            appearance:none;

            padding:8px 12px;

            border:0;
            border-bottom:
              2px solid
              ${e?`#333333`:`transparent`};

            background:transparent;

            font-size:12px;
            font-weight:
              ${e?`700`:`500`};

            color:
              ${e?`#222222`:`#777777`};

            cursor:pointer;
          "
        >
          Element
        </button>


        <button
          type="button"
          data-properties-tab="model"

          style="
            appearance:none;

            padding:8px 12px;

            border:0;
            border-bottom:
              2px solid
              ${t?`#333333`:`transparent`};

            background:transparent;

            font-size:12px;
            font-weight:
              ${t?`700`:`500`};

            color:
              ${t?`#222222`:`#777777`};

            cursor:pointer;
          "
        >
          Model
        </button>

      </div>
    `}function w(){n.innerHTML=`
        <div
          style="
            box-sizing:border-box;

            height:100%;
            overflow:auto;

            padding:16px;

            font-family:
              Arial,
              sans-serif;

            font-size:12px;
            line-height:1.4;

            color:#333333;
          "
        >

          <div
            style="
              font-size:13px;
              font-weight:700;

              margin-bottom:10px;
            "
          >
            Properties
          </div>


          ${C()}


          ${o===`element`?S():y()}

        </div>
      `,T()}function T(){n.querySelectorAll(`[data-properties-tab]`).forEach(e=>{e.addEventListener(`click`,()=>{o=e.dataset.propertiesTab,w()})})}function E(e){let t=e.newSelection||[];a=null,i=t.length===1?t[0]:null,i&&(o=`element`),w()}function D(){a=null,i=null,o=`model`,w()}return r.on(`selection.changed`,E),r.on(`import.done`,D),w(),{render:w,showBusinessObject(e){a=e||null,i=null,o=e?`element`:`model`,w()},showElement(){o=`element`,w()},showModel(){o=`model`,w()},clear(){a=null,i=null,o=`model`,w()},destroy(){r.off(`selection.changed`,E),r.off(`import.done`,D)}}}var m=n(((e,t)=>{function n(e){return[`String`,`Boolean`,`Integer`,`Real`].includes(e)}t.exports=function e(t,r){let i=r.enter,a=r.leave,o=i&&i(t),s=t.$descriptor;o!==!1&&!s.isGeneric&&s.properties.filter(e=>!e.isAttr&&!e.isReference&&!n(e.type)).forEach(n=>{if(n.name in t){let i=t[n.name];n.isMany?i.forEach(t=>{e(t,r)}):e(i,r)}}),a&&a(t)}})),h=n(((e,t)=>{var n=m(),{isArray:r,isObject:i,isFunction:o}=(a(),c(d)),s=class{constructor({moddleRoot:e,rule:t}){this.rule=t,this.moddleRoot=e,this.messages=[],this.report=this.report.bind(this)}report(e,t,n){let a={id:e,message:t};n&&r(n)&&(a={...a,path:n}),n&&i(n)&&(a={...a,...n}),this.messages.push(a)}};t.exports=function({moddleRoot:e,rule:t}){let r=new s({rule:t,moddleRoot:e}),i=t.check||{},a=`leave`in i?i.leave:void 0,c=`enter`in i?i.enter:o(i)?i:void 0;if(!c&&!a)throw Error(`no check implemented`);return n(e,{enter:c?e=>c(e,r):void 0,leave:a?e=>a(e,r):void 0}),r.messages}})),g=n(((e,t)=>{var n=h(),r=(e,t)=>e,i={0:`off`,1:`warn`,2:`error`,3:`info`},a=`rule-error`;function o(e){let{config:t={},resolver:n,transformRule:i=r}=e||{};if(n===void 0)throw Error(`must provide <options.resolver>`);this.config=t,this.resolver=n,this.transformRule=i,this.cachedRules={},this.cachedConfigs={}}t.exports=o,o.prototype.applyRule=function(e,t){let{config:r,rule:i,category:o,name:s}=t;try{return n({moddleRoot:e,rule:i,config:r}).map(function(e){return{...e,meta:i.meta,category:o}})}catch(e){return console.error(`rule <`+s+`> failed with error: `,e),[{message:e.message,category:a}]}},o.prototype.resolveRule=function(e,t){let{pkg:n,ruleName:r}=this.parseRuleName(e),i=`${n}-${r}`,a=this.cachedRules[i];return a?Promise.resolve(a):Promise.resolve(this.resolver.resolveRule(n,r)).then(a=>{if(!a)throw Error(`unknown rule <${e}>`);return this.cachedRules[i]=this.transformRule(a(t),{pkg:n,ruleName:r})})},o.prototype.resolveConfig=function(e){let{pkg:t,configName:n}=this.parseConfigName(e),r=`${t}-${n}`,i=this.cachedConfigs[r];return i?Promise.resolve(i):Promise.resolve(this.resolver.resolveConfig(t,n)).then(n=>{if(!n)throw Error(`unknown config <${e}>`);return this.cachedConfigs[r]=this.normalizeConfig(n,t)})},o.prototype.resolveRules=function(e){return this.resolveConfiguredRules(e).then(e=>{let t=Object.entries(e).map(([e,t])=>{let{category:n,config:r}=this.parseRuleValue(t);return{name:e,category:n,config:r}}).filter(e=>e.category!==`off`).map(e=>{let{name:t,config:n}=e;return this.resolveRule(t,n).then(function(t){return{...e,rule:t}})});return Promise.all(t)})},o.prototype.resolveConfiguredRules=function(e){let t=e.extends;return typeof t==`string`&&(t=[t]),t===void 0&&(t=[]),Promise.all(t.map(e=>this.resolveConfig(e).then(e=>this.resolveConfiguredRules(e)))).then(t=>{let n=this.normalizeConfig(e,`bpmnlint`).rules;return[...t,n].reduce((e,t)=>({...e,...t}),{})})},o.prototype.lint=function(e,t){return t||=this.config,this.resolveRules(t).then(t=>{let n={};return t.forEach(t=>{let{name:r}=t,i=this.applyRule(e,t);i.length&&(n[r]=i)}),n})},o.prototype.parseRuleValue=function(e){let t,n;return Array.isArray(e)?(t=e[0],n=e[1]):(t=e,n={}),typeof t==`string`&&(t=t.toLowerCase()),t=i[t]||t,{config:n,category:t}},o.prototype.parseRuleName=function(e,t=`bpmnlint`){let n=/^(?:(?:(@[^/]+)\/)?([^@]{1}[^/]*)\/)?([^/]+)$/.exec(e);if(!n)throw Error(`unparseable rule name <${e}>`);let[r,i,a,o]=n;return a?{pkg:`${i?i+`/`:``}${s(a)}`,ruleName:o}:{pkg:t,ruleName:o}},o.prototype.parseConfigName=function(e){let t=/^(?:(?:plugin:(?:(@[^/]+)\/)?([^@]{1}[^/]*)\/)|bpmnlint:)([^/]+)$/.exec(e);if(!t)throw Error(`unparseable config name <${e}>`);let[n,r,i,a]=t;return i?{pkg:`${r?r+`/`:``}${s(i)}`,configName:a}:{pkg:`bpmnlint`,configName:a}},o.prototype.getSimplePackageName=function(e){let t=/^(?:(@[^/]+)\/)?([^/]+)$/.exec(e);if(!t)throw Error(`unparseable package name <${e}>`);let[n,r,i]=t;return`${r?r+`/`:``}${c(i)}`},o.prototype.normalizeConfig=function(e,t){let n=e.rules||{},r=Object.keys(n).reduce((e,r)=>{let i=n[r],{pkg:a,ruleName:o}=this.parseRuleName(r,t),s=a===`bpmnlint`?o:`${this.getSimplePackageName(a)}/${o}`;return e[s]=i,e},{});return{...e,rules:r}};function s(e){return e===`bpmnlint`?`bpmnlint`:e.startsWith(`bpmnlint-plugin-`)?e:`bpmnlint-plugin-${e}`}function c(e){return e.startsWith(`bpmnlint-plugin-`)?e.substring(16):e}})),_=n(((e,t)=>{t.exports={Linter:g()}}))();a();function v(e,t){var n=e.get(`editorActions`,!1);n&&n.register({toggleLinting:function(){t.toggle()}})}v.$inject=[`injector`,`linting`];var y=`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   version="1.1"
   viewBox="0 0 512 512"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <path
     d="M 339.07183,256.00001 463.66713,131.4047 c 15.28961,-15.2896 15.28961,-40.079175 0,-55.381227 l -27.6906,-27.690611 c -15.28961,-15.289602 -40.07917,-15.289602 -55.38123,0 L 256,172.92818 131.4047,48.332862 c -15.2896,-15.289602 -40.079177,-15.289602 -55.381228,0 L 48.332861,76.023473 c -15.2896,15.2896 -15.2896,40.079177 0,55.381227 L 172.92815,256.00001 48.332861,380.59531 c -15.2896,15.2896 -15.2896,40.07917 0,55.38123 l 27.690611,27.69061 c 15.289601,15.28959 40.091628,15.28959 55.381228,0 L 256,339.07184 380.5953,463.66715 c 15.2896,15.28959 40.09162,15.28959 55.38123,0 l 27.6906,-27.69061 c 15.28961,-15.2896 15.28961,-40.07918 0,-55.38123 z"
     fill="currentColor" />
</svg>
`,b=`<svg version="1.1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path d="m256 323.95c-45.518 0-82.419 34.576-82.419 77.229 0 42.652 36.9 77.229 82.419 77.229 45.518 0 82.419-34.577 82.419-77.23 0-42.652-36.9-77.229-82.419-77.229zm-80.561-271.8 11.61 204.35c.544 9.334 8.78 16.64 18.755 16.64h100.39c9.975 0 18.211-7.306 18.754-16.64l11.611-204.35c.587-10.082-7.98-18.56-18.754-18.56h-123.62c-10.775 0-19.34 8.478-18.753 18.56z" fill="currentColor"/>
</svg>
`,x=`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   viewBox="0 0 512 512"
   version="1.1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <path
     fill="currentColor"
     d="m 173.898,439.40356 -166.4,-166.4 c -9.997,-9.997 -9.997,-26.206 0,-36.204 l 36.203,-36.204 c 9.997,-9.998 26.207,-9.998 36.204,0 L 192,312.68956 432.095,72.595562 c 9.997,-9.997 26.207,-9.997 36.204,0 l 36.203,36.203998 c 9.997,9.997 9.997,26.206 0,36.204 l -294.4,294.401 c -9.998,9.997 -26.207,9.997 -36.204,-10e-4 z" />
</svg>
`,S=`<svg
  viewBox="3.5 3.5 9 9"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg">
  <path
    fill="currentColor" d="M6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
</svg>`,C=-7,w=-7,T=500,E={resolver:{resolveRule:function(){return null}},config:{}},D={error:y,warning:b,success:x,info:S,inactive:x};function O(e,t,n,r,i,a,o){this._bpmnjs=e,this._canvas=t,this._elementRegistry=r,this._eventBus=i,this._overlays=a,this._translate=o,this._issues={},this._active=n&&n.active||!1,this._linterConfig=E,this._overlayIds={};var s=this;i.on([`import.done`,`elements.changed`,`linting.configChanged`,`linting.toggle`],T,function(e){s.update()}),i.on(`linting.toggle`,function(e){e.active||(s._clearIssues(),s._updateButton())}),i.on(`diagram.clear`,function(){s._clearIssues()});var c=n&&n.bpmnlint;c&&i.once(`diagram.init`,function(){if(s.getLinterConfig()===E)try{s.setLinterConfig(c)}catch{console.error(`[bpmn-js-bpmnlint] Invalid lint rules configured. Please doublecheck your linting.bpmnlint configuration, cf. https://github.com/bpmn-io/bpmn-js-bpmnlint#configure-lint-rules`)}}),this._init()}O.prototype.setLinterConfig=function(e){if(!e.config||!e.resolver)throw Error(`Expected linterConfig = { config, resolver }`);this._linterConfig=e,this._eventBus.fire(`linting.configChanged`)},O.prototype.getLinterConfig=function(){return this._linterConfig},O.prototype._init=function(){this._createButton(),this._updateButton()},O.prototype.isActive=function(){return this._active},O.prototype._formatIssues=function(e){let n=this,r=i(e,function(e,t,n){return e.concat(t.map(function(e){return e.rule=n,e}))},[]),a=n._elementRegistry.filter(e=>o(e,`bpmn:Participant`)).map(e=>e.businessObject);return r=t(r,function(e){if(!n._elementRegistry.get(e.id)){e.isChildIssue=!0,e.actualElementId=e.id;let t=a.filter(t=>t.processRef&&t.processRef.id&&t.processRef.id===e.id);e.id=t.length?t[0].id:n._canvas.getRootElement().id}return e}),r=f(r,function(e){return e.id}),r},O.prototype.toggle=function(e){return e=e===void 0?!this.isActive():e,this._setActive(e),e},O.prototype._setActive=function(e){this._active!==e&&(this._active=e,this._eventBus.fire(`linting.toggle`,{active:e}))},O.prototype.update=function(){var e=this;if(this._bpmnjs.getDefinitions()){var t=this._lintStart=Math.random();this.lint().then(function(n){if(e._lintStart===t){n=e._formatIssues(n);var r={},i={},a={};for(var o in e._issues)n[o]||(r[o]=e._issues[o]);for(var s in n)e._issues[s]?n[s]!==e._issues[s]&&(i[s]=n[s]):a[s]=n[s];r=l(r,i),a=l(a,i),e._clearOverlays(),e.isActive()&&e._createIssues(a),e._issues=n,e._updateButton(),e._fireComplete(n)}})}},O.prototype._fireComplete=function(e){this._eventBus.fire(`linting.completed`,{issues:e})},O.prototype._createIssues=function(e){for(var t in e)this._createElementIssues(t,e[t])},O.prototype._createElementIssues=function(e,t){var n=this._elementRegistry.get(e);if(n){var r=this._elementRegistry.get(e+`_plane`);r&&this._createElementIssues(r.id,t);var i,a,c=!n.parent;c&&o(n,`bpmn:Process`)?(i=`bottom-right`,a={top:20,left:150}):c&&o(n,`bpmn:SubProcess`)?(i=`bottom-right`,a={top:50,left:150}):(i=`top-right`,a={top:C,left:w});var l=f(t,function(e){return(e.isChildIssue?`child`:``)+e.category}),u=l.error,d=l.warn,p=l.info,m=l.childerror,h=l.childwarn,g=l.childinfo;if(!(!p&&!u&&!d&&!m&&!h&&!g)){var _=s(`<div class="bjsl-overlay bjsl-issues-`+i+`"></div>`),v=s(u||m?`<div class="bjsl-icon bjsl-icon-error">`+y+`</div>`:d||h?`<div class="bjsl-icon bjsl-icon-warning">`+b+`</div>`:`<div class="bjsl-icon bjsl-icon-info">`+S+`</div>`),x=s(`<div class="bjsl-dropdown"></div>`),T=s(`<div class="bjsl-dropdown-content"></div>`),E=s(`<div class="bjsl-issues"></div>`),D=s(`<div class="bjsl-current-element-issues"></div>`),O=s(`<ul></ul>`);if(_.appendChild(v),_.appendChild(x),x.appendChild(T),T.appendChild(E),E.appendChild(D),D.appendChild(O),u&&this._addErrors(O,u),d&&this._addWarnings(O,d),p&&this._addInfos(O,p),m||h||g){var k=s(`<div class="bjsl-child-issues"></div>`),A=s(`<ul></ul>`),j=this._translate(`Issues for child elements`),M=s(`<a class="bjsl-issue-heading">`+j+`:</a>`);if(m&&this._addErrors(A,m),h&&this._addWarnings(A,h),g&&this._addInfos(A,g),u||d){var N=s(`<hr/>`);k.appendChild(N)}k.appendChild(M),k.appendChild(A),E.appendChild(k)}this._overlayIds[e]=this._overlays.add(n,`linting`,{position:a,html:_,scale:{min:.7}})}}},O.prototype._addErrors=function(e,t){var n=this;t.forEach(function(t){n._addEntry(e,`error`,t)})},O.prototype._addWarnings=function(e,t){var n=this;t.forEach(function(t){n._addEntry(e,`warning`,t)})},O.prototype._addInfos=function(e,t){var n=this;t.forEach(function(t){n._addEntry(e,`info`,t)})},O.prototype._addEntry=function(t,n,r){var i=r.rule,a=r.meta?.documentation.url,o=this._translate(r.message),c=r.actualElementId,l=D[n],u=s(`
    <li class="${n}" data-rule="${e(i)}">
      <span class="icon">${l}</span>
      <span class="message">${e(o)}</span>
      <span class="rule">(${a?`<a href="${e(a)}" target="_blank">${e(i)}</a>`:e(i)})</span>
      ${c?`<span class="bjsl-id-hint"><code>${e(c)}</code></span>`:``}
    </li>
  `);t.appendChild(u)},O.prototype._clearOverlays=function(){this._overlays.remove({type:`linting`}),this._overlayIds={}},O.prototype._clearIssues=function(){this._issues={},this._clearOverlays()},O.prototype._setButtonState=function(e){var{errors:t,warnings:n,infos:r}=e,i=this._button,a=t&&`error`||n&&`warning`||`success`,o=`
    <span class="icon">${D[a]}</span>
    <span>${this._translate(t||n?`{errors} Errors, {warnings} Warnings`:`No Issues`,{errors:String(t),warnings:String(n),infos:String(r)})}</span>`;a=this.isActive()?a:`inactive`,[`error`,`inactive`,`success`,`warning`].forEach(function(e){a===e?i.classList.add(`bjsl-button-`+e):i.classList.remove(`bjsl-button-`+e)}),i.innerHTML=o},O.prototype._updateButton=function(){var e=0,t=0,n=0;for(var r in this._issues)this._issues[r].forEach(function(r){r.category===`error`?e++:r.category===`warn`?t++:r.category===`info`&&n++});this._setButtonState({errors:e,warnings:t,infos:n})},O.prototype._createButton=function(){var e=this;this._button=s(`<button class="bjsl-button bjsl-button-inactive" title="`+this._translate(`Toggle linting overlays`)+`"></button>`),this._button.addEventListener(`click`,function(){e.toggle()}),this._canvas.getContainer().appendChild(this._button)},O.prototype.lint=function(){var e=this._bpmnjs.getDefinitions();return new _.Linter(this._linterConfig).lint(e)},O.$inject=[`bpmnjs`,`canvas`,`config.linting`,`elementRegistry`,`eventBus`,`overlays`,`translate`];var k={__init__:[`linting`,`lintingEditorActions`],linting:[`type`,O],lintingEditorActions:[`type`,v]},A=r({config:()=>X,default:()=>Q,moddleExtensions:()=>Z,resolver:()=>Y});function j(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,`default`)?e.default:e}function M(e){if(Object.prototype.hasOwnProperty.call(e,`__esModule`))return e;var t=e.default;if(typeof t==`function`){var n=function e(){var n=!1;try{n=this instanceof e}catch{}return n?Reflect.construct(t,arguments,this.constructor):t.apply(this,arguments)};n.prototype=t.prototype}else n={};return Object.defineProperty(n,"__esModule",{value:!0}),Object.keys(e).forEach(function(t){var r=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(n,t,r.get?r:{enumerable:!0,get:function(){return e[t]}})}),n}function N(e,t){return t.indexOf(`:`)===-1&&(t=`bpmn:`+t),typeof e.$instanceOf==`function`?e.$instanceOf(t):e.$type===t}function P(e,t){return t.some(function(t){return N(e,t)})}var F=M(Object.freeze({__proto__:null,is:N,isAny:P})),I={},L;function R(){if(L)return I;L=1;let{is:e}=F;function t(t,n){return function(){function r(n,r){e(n,t)&&r.report(n.id,`Element type <`+t+`> is discouraged`)}return i(n,{check:r})}}I.checkDiscouragedNodeType=t;function n(t,r){if(!t)return null;let i=t.$parent;return i?e(i,r)?i:n(i,r):t}I.findParent=n;function r(e){let t=n(e,`bpmn:Process`);return t&&t.isExecutable}I.isInExecutableProcess=r;function i(e,t){let{meta:{documentation:n={},...r}={},...i}=t;return{meta:{documentation:{url:`https://github.com/bpmn-io/bpmnlint/blob/main/docs/rules/${e}.md`,...n},...r},...i}}return I.annotateRule=i,I}var z,B;function V(){if(B)return z;B=1;let{is:e,isAny:t}=F,{annotateRule:n}=R();z=function(){function a(n,a){t(n,[`bpmn:ParallelGateway`,`bpmn:EventBasedGateway`])||e(n,`bpmn:Gateway`)&&!r(n)||e(n,`bpmn:SubProcess`)||e(n,`bpmn:SequenceFlow`)&&!i(n)||t(n,[`bpmn:FlowNode`,`bpmn:SequenceFlow`,`bpmn:Participant`,`bpmn:Lane`])&&(n.name||``).trim().length===0&&a.report(n.id,`Element is missing label/name`,[`name`])}return n(`label-required`,{check:a})};function r(e){return(e.outgoing||[]).length>1}function i(e){return e.conditionExpression}return z}var H=j(V()),U=[`bpmn:Task`,`bpmn:UserTask`,`bpmn:ServiceTask`,`bpmn:ManualTask`,`bpmn:BusinessRuleTask`,`bpmn:ScriptTask`,`bpmn:CallActivity`,`bpmn:SubProcess`,`bpmn:ExclusiveGateway`,`bpmn:InclusiveGateway`,`bpmn:ParallelGateway`,`bpmn:EventBasedGateway`,`bpmn:ComplexGateway`,`bpmn:StartEvent`,`bpmn:EndEvent`,`bpmn:IntermediateCatchEvent`,`bpmn:IntermediateThrowEvent`,`bpmn:BoundaryEvent`,`bpmn:DataObjectReference`,`bpmn:DataStoreReference`];function W(){function e(e,t){if(U.includes(e.$type)&&(!e.name||e.name.trim()===``)){let n=e.$type.replace(`bpmn:`,``);t.report(e.id,`${n} "${e.id}" has no name — unnamed elements break traceability`)}}return{check:e}}var G=/^[A-Za-z]+_[0-9a-zA-Z]{7,}$/;function K(){function e(e,t){if(!(!e||!e.id)){if(e.$type===`bpmn:Process`&&e.id===`Process_1`){t.report(e.id,`Default "Process_1" ID — rename to something like "CoC_Avionics_AssemblyVerification"`);return}G.test(e.id)&&t.report(e.id,`Auto-generated ID "${e.id}". Use semantic naming: {ProcessId}_{Type}_{Name}`)}}return{check:e}}var q={};function J(){}J.prototype.resolveRule=function(e,t){let n=q[e+`/`+t];if(!n)throw Error(`cannot resolve rule <`+e+`/`+t+`>: not bundled`);return n},J.prototype.resolveConfig=function(e,t){throw Error(`cannot resolve config <`+t+`> in <`+e+`>: not bundled`)};var Y=new J,X={rules:{"label-required":`warn`,"semarch/named-element":`info`,"semarch/stable-id":`warn`}},Z={},Q={resolver:Y,config:X,moddleExtensions:Z};q[`bpmnlint/label-required`]=H,q[`bpmnlint-plugin-semarch/named-element`]=W,q[`bpmnlint-plugin-semarch/stable-id`]=K;var $={name:`SemArch`,uri:`http://semarch.io/schema/1.0`,prefix:`semarch`,types:[{name:`Meta`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`stableGuid`,isAttr:!0,type:`String`,description:`Canonical persistent SemArch identity, independent from BPMN IDs and external platform identifiers`},{name:`cocRef`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`},{name:`maturity`,isAttr:!0,type:`String`},{name:`platformRef`,isAttr:!0,type:`String`},{name:`programRef`,isAttr:!0,type:`String`},{name:`bmsRef`,isAttr:!0,type:`String`},{name:`version`,isAttr:!0,type:`String`},{name:`status`,isAttr:!0,type:`String`}]},{name:`SemanticType`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`ref`,isAttr:!0,type:`String`,description:`Reference to a type defined by an external semantic or structural schema`},{name:`schemaRef`,isAttr:!0,type:`String`,description:`Optional reference to the schema defining the external type`}]},{name:`DataProperty`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`propertyRef`,isAttr:!0,type:`String`,description:`Reference to a data property defined by an external semantic or structural schema`},{name:`schemaRef`,isAttr:!0,type:`String`,description:`Optional reference to the schema defining the external property`},{name:`value`,isAttr:!0,type:`String`,description:`Literal value of the externally defined data property`},{name:`businessObjectRef`,isAttr:!0,type:`String`,description:`Optional reference to the canonical Business Object identifier owning a contextual value`},{name:`cocRef`,isAttr:!0,type:`String`,description:`Optional reference to semarch:CoC.id owning a contextual value`}]},{name:`ObjectProperty`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`propertyRef`,isAttr:!0,type:`String`,description:`Reference to an object property defined by an external semantic or structural schema`},{name:`schemaRef`,isAttr:!0,type:`String`,description:`Optional reference to the schema defining the external property`},{name:`businessObjectRef`,isAttr:!0,type:`String`,description:`Reference to the canonical Business Object identifier owning the contextual relation`},{name:`cocRef`,isAttr:!0,type:`String`,description:`Reference to semarch:CoC.id owning the contextual relation`},{name:`targetBusinessObjectRef`,isAttr:!0,type:`String`,description:`Reference to the canonical target Business Object identifier`}]},{name:`DataStoreContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`role`,isAttr:!0,type:`String`},{name:`systemRef`,isAttr:!0,type:`String`},{name:`accessLevel`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`}]},{name:`MessageContract`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`schemaRef`,isAttr:!0,type:`String`},{name:`version`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`},{name:`encoding`,isAttr:!0,type:`String`}]},{name:`BusinessContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`systemType`,isAttr:!0,type:`String`,description:`BMS | CoC | Programme | Activite`},{name:`systemName`,isAttr:!0,type:`String`,description:`Name of the applicative system this repository serves`},{name:`owner`,isAttr:!0,type:`String`},{name:`organization`,isAttr:!0,type:`String`},{name:`governanceFramework`,isAttr:!0,type:`String`},{name:`normativeRefs`,isAttr:!0,type:`String`,description:`Space-separated list of normative references`},{name:`programs`,isAttr:!0,type:`String`,description:`Space-separated programme identifiers`},{name:`communities`,isAttr:!0,type:`String`,description:`Space-separated community identifiers (MIWG, ASD-SSG...)`}]},{name:`ApplicationSystem`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`id`,isAttr:!0,type:`String`,description:`Stable identifier for this application system`},{name:`name`,isAttr:!0,type:`String`,description:`Human name of the applicative system (not the product)`},{name:`purpose`,isAttr:!0,type:`String`},{name:`interfaces`,isAttr:!0,type:`String`,description:`Space-separated IDs of interfaced application systems`}]},{name:`TechnicalRealization`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`applicationSystemId`,isAttr:!0,type:`String`,description:`References ApplicationSystem.id`},{name:`softwareProduct`,isAttr:!0,type:`String`,description:`Name of the software product (ARIS, Sparx EA, Windchill...)`},{name:`productVersion`,isAttr:!0,type:`String`},{name:`nativeFormat`,isAttr:!0,type:`String`,description:`Native serialisation format of the product (AML, XMI, AP242...)`},{name:`exchangeFormat`,isAttr:!0,type:`String`,description:`Exchange format used for interoperability (BPMN 2.0 XML...)`},{name:`idScheme`,isAttr:!0,type:`String`,description:`How this product generates IDs (EA_GUID, ARIS_ID...)`},{name:`url`,isAttr:!0,type:`String`}]},{name:`RepositoryLifecycle`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`version`,isAttr:!0,type:`String`},{name:`status`,isAttr:!0,type:`String`,description:`Draft | Active | Archived | Deprecated`},{name:`maturity`,isAttr:!0,type:`String`,description:`L1 | L2 | L3 | L4`},{name:`lastReview`,isAttr:!0,type:`String`},{name:`nextReview`,isAttr:!0,type:`String`},{name:`reviewCycle`,isAttr:!0,type:`String`},{name:`governedBy`,isAttr:!0,type:`String`}]},{name:`Correspondence`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`id`,isAttr:!0,type:`String`},{name:`type`,isAttr:!0,type:`String`,description:`derivation | equivalence | specialization | abstraction`},{name:`sourceRepositoryId`,isAttr:!0,type:`String`},{name:`sourceModelId`,isAttr:!0,type:`String`},{name:`targetRepositoryId`,isAttr:!0,type:`String`},{name:`targetModelId`,isAttr:!0,type:`String`},{name:`confidence`,isAttr:!0,type:`String`,description:`high | medium | low | unverified`},{name:`preservedAttributes`,isAttr:!0,type:`String`,description:`Space-separated list of preserved attributes`},{name:`lostAttributes`,isAttr:!0,type:`String`,description:`Space-separated list of attributes lost in translation`},{name:`notes`,isAttr:!0,type:`String`}]},{name:`MediationContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`sourceSystem`,isAttr:!0,type:`String`,description:`Name of source applicative system`},{name:`targetSystem`,isAttr:!0,type:`String`,description:`Name of target applicative system`},{name:`sourceSoftwareProduct`,isAttr:!0,type:`String`},{name:`targetSoftwareProduct`,isAttr:!0,type:`String`},{name:`direction`,isAttr:!0,type:`String`,description:`unidirectional | bidirectional`},{name:`strategy`,isAttr:!0,type:`String`,description:`by-semarch-id | by-name | by-platformRef | manual`},{name:`lastSynchronized`,isAttr:!0,type:`String`}]},{name:`RepositoryContext`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`repositoryId`,isAttr:!0,type:`String`,description:`Stable identifier of the SemArch repository`},{name:`mode`,isAttr:!0,type:`String`,description:`single-coc | multi-coc`},{name:`repositoryVersion`,isAttr:!0,type:`String`},{name:`cocOwner`,isAttr:!0,type:`String`},{name:`organization`,isAttr:!0,type:`String`},{name:`maturity`,isAttr:!0,type:`String`},{name:`stdRef`,isAttr:!0,type:`String`},{name:`targetPlatform`,isAttr:!0,type:`String`},{name:`programContext`,isAttr:!0,type:`String`},{name:`lastReview`,isAttr:!0,type:`String`}]},{name:`CoC`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`id`,isAttr:!0,type:`String`,description:`Stable identifier of the Centre de Competence`},{name:`name`,isAttr:!0,type:`String`,description:`Human-readable name of the Centre de Competence`}]},{name:`Membership`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`cocRef`,isAttr:!0,type:`String`,description:`Reference to semarch:CoC.id`},{name:`componentRef`,isAttr:!0,type:`String`,description:`Reference to the BPMN id of the repository component`}]},{name:`ReferentialMembership`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`referentialRef`,isAttr:!0,type:`String`,description:`Reference to the canonical Business Object id of a Referential`},{name:`componentRef`,isAttr:!0,type:`String`,description:`Reference to the BPMN id of the repository component`}]},{name:`BusinessObjectType`,superClass:[`Element`],meta:{allowedIn:[`BusinessObject`]},properties:[{name:`typeRef`,isAttr:!0,type:`String`,description:`Reference to a canonical Business Object semantic type`}]},{name:`BusinessObject`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`id`,isAttr:!0,type:`String`,description:`Stable canonical Business Object identifier`},{name:`name`,isAttr:!0,type:`String`,description:`Optional human-readable Business Object name; not an identity`},{name:`typeRefs`,type:`BusinessObjectType`,isMany:!0}]},{name:`BusinessObjectRepresentation`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`businessObjectRef`,isAttr:!0,type:`String`,description:`Reference to a canonical Business Object identifier`},{name:`representationRef`,isAttr:!0,type:`String`,description:`Reference to the BPMN id of the represented semantic object`}]},{name:`BusinessRelation`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`sourceBusinessObjectRef`,isAttr:!0,type:`String`,description:`Reference to the source canonical Business Object identifier`},{name:`targetBusinessObjectRef`,isAttr:!0,type:`String`,description:`Reference to the target canonical Business Object identifier`},{name:`relationType`,isAttr:!0,type:`String`,description:`Reference to the semantic type of the autonomous Business Relation`}]},{name:`MethodConfiguration`,superClass:[`Element`],meta:{allowedIn:[`*`]},properties:[{name:`profileId`,isAttr:!0,type:`String`},{name:`profileVersion`,isAttr:!0,type:`String`},{name:`cocOwner`,isAttr:!0,type:`String`},{name:`maturity`,isAttr:!0,type:`String`},{name:`validatedAt`,isAttr:!0,type:`String`},{name:`configHash`,isAttr:!0,type:`String`}]}]};function ee({container:e=`#bpmn-canvas`}={}){return new u({container:e,linting:{bpmnlint:A,active:!0},additionalModules:[k],moddleExtensions:{semarch:$}})}export{p as a,k as i,$ as n,A as r,ee as t};