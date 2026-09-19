export function createWelcomeView({
  mode = 'editor',
  onNewProcess,
  onOpenRepository,
  onImportBpmn
} = {}) {

  const isViewer =
    mode === 'viewer'


  const baseUrl =
    import.meta.env.BASE_URL ||
    './'


  const normalizedBaseUrl =
    baseUrl.endsWith('/')
      ? baseUrl
      : `${baseUrl}/`


  const presentationHubUrl =
    `${normalizedBaseUrl}presentations/index.html`


  function presentationUrl(
    documentId
  ) {

    return (
      `${presentationHubUrl}` +
      `?doc=${encodeURIComponent(documentId)}`
    )
  }


  function actionButton({
    action,
    label,
    primary = false
  }) {

    return `
      <button
        data-welcome-action="${action}"
        type="button"
        style="
          border:${primary ? '0' : '1px solid #A8B7C8'};
          border-radius:4px;
          padding:10px 16px;
          background:${primary ? '#1E3A5F' : '#FFFFFF'};
          color:${primary ? '#FFFFFF' : '#1E3A5F'};
          cursor:pointer;
          font-size:13px;
          font-weight:600;
        "
      >
        ${label}
      </button>
    `
  }


  function contextCard({
    href,
    eyebrow,
    title,
    description,
    highlighted = false
  }) {

    return `
      <a
        href="${href}"
        target="_blank"
        rel="noopener"
        style="
          display:block;
          box-sizing:border-box;
          border:1px solid ${highlighted ? '#91A9C0' : '#C9D5E1'};
          border-radius:8px;
          padding:16px;
          background:${highlighted ? '#F8FBFD' : '#FFFFFF'};
          color:#1E3A5F;
          text-decoration:none;
        "
      >
        <div
          style="
            margin-bottom:8px;
            font-family:sans-serif;
            font-size:10px;
            font-weight:700;
            letter-spacing:.1em;
            text-transform:uppercase;
            color:#55708F;
          "
        >
          ${eyebrow}
        </div>

        <strong
          style="
            display:block;
            margin-bottom:7px;
            font-family:'Syne',sans-serif;
            font-size:15px;
          "
        >
          ${title} ↗
        </strong>

        <span
          style="
            display:block;
            font-family:sans-serif;
            font-size:12px;
            line-height:1.5;
            color:#64748B;
          "
        >
          ${description}
        </span>
      </a>
    `
  }


  const actionsHtml =
    isViewer
      ? actionButton({
          action: 'open-repository',
          label: 'Open Repository…',
          primary: true
        })
      : [
          actionButton({
            action: 'new-process',
            label: 'New Process',
            primary: true
          }),
          actionButton({
            action: 'open-repository',
            label: 'Open Repository…'
          }),
          actionButton({
            action: 'import-bpmn',
            label: 'Import BPMN…'
          })
        ].join('')


  const viewerRepositoryNavigation =
    isViewer
      ? `
        <section style="margin-top:38px;">
          <h2
            style="
              margin:0 0 6px 0;
              font-family:'Syne',sans-serif;
              font-size:18px;
              color:#1E3A5F;
            "
          >
            Repository navigation
          </h2>

          <p
            style="
              max-width:950px;
              margin:0;
              font-family:sans-serif;
              font-size:13px;
              line-height:1.55;
              color:#64748B;
            "
          >
            Repository navigation is the primary entry point in the Viewer.
            The Environment projects repository context toward governance,
            collaboration and process knowledge without changing the
            underlying BPMN model.
          </p>

          <div
            style="
              display:grid;
              grid-template-columns:minmax(260px,0.9fr) minmax(0,1.4fr);
              gap:18px;
              margin-top:16px;
            "
          >
            <div
              style="
                border:1px solid #AFC1D3;
                border-radius:8px;
                background:#FFFFFF;
                padding:18px 20px;
                font-family:monospace;
                font-size:13px;
                line-height:1.75;
                color:#334155;
              "
            >
              Environment<br>
              ├── Repositories<br>
              ├── CoCs<br>
              ├── Collaborations<br>
              └── Processes
            </div>

            <div
              style="
                border:1px solid #D8E0E8;
                border-radius:8px;
                background:#F8FAFC;
                padding:18px 20px;
              "
            >
              <div style="display:grid;gap:10px;">
                <div>
                  <strong style="font-family:'Syne',sans-serif;font-size:13px;color:#1E3A5F;">
                    Repositories
                  </strong>
                  <span style="font-family:sans-serif;font-size:12px;color:#64748B;">
                    &nbsp;— establish source, provenance and repository context.
                  </span>
                </div>

                <div>
                  <strong style="font-family:'Syne',sans-serif;font-size:13px;color:#1E3A5F;">
                    CoCs
                  </strong>
                  <span style="font-family:sans-serif;font-size:12px;color:#64748B;">
                    &nbsp;— expose governance and competence context.
                  </span>
                </div>

                <div>
                  <strong style="font-family:'Syne',sans-serif;font-size:13px;color:#1E3A5F;">
                    Collaborations
                  </strong>
                  <span style="font-family:sans-serif;font-size:12px;color:#64748B;">
                    &nbsp;— reveal interaction and participant context.
                  </span>
                </div>

                <div>
                  <strong style="font-family:'Syne',sans-serif;font-size:13px;color:#1E3A5F;">
                    Processes
                  </strong>
                  <span style="font-family:sans-serif;font-size:12px;color:#64748B;">
                    &nbsp;— open BPMN views and inspect semantic properties.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      `
      : ''


  const contextHtml =
    `
      <section style="margin-top:38px;">
        <h2
          style="
            margin:0 0 6px 0;
            font-family:'Syne',sans-serif;
            font-size:18px;
            color:#1E3A5F;
          "
        >
          ${
            isViewer
              ? 'About BPMNSM and its context'
              : 'Explore the context'
          }
        </h2>

        <p
          style="
            max-width:950px;
            margin:0;
            font-family:sans-serif;
            font-size:13px;
            line-height:1.55;
            color:#64748B;
          "
        >
          ${
            isViewer
              ? `
                These presentations provide optional background on BPMNSM,
                Interoperability of Meaning, semantic cartography and strategic
                standards governance. Repository exploration remains the primary
                purpose of this Viewer.
              `
              : `
                BPMNSM is one experimental instrument in a wider interoperability
                exploration. These interactive presentations explain the common
                vision and show how BPMNSM, semantic cartography and standards
                governance address complementary questions.
              `
          }
        </p>

        <div
          style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
            gap:12px;
            margin-top:16px;
          "
        >
          ${contextCard({
            href: presentationUrl('overview'),
            eyebrow: 'Umbrella vision',
            title: 'Interoperability of Meaning',
            description:
              'Semantic plurality, controlled mediation, human-machine interpretability and Continuous Operational Interoperability.'
          })}

          ${contextCard({
            href: presentationUrl('bpmnsm'),
            eyebrow: 'Process interoperability',
            title: 'BPMNSM',
            description:
              'BPMN preservation, semantic mediation, repositories, multiple viewpoints, collaboration and enactment.',
            highlighted: true
          })}

          ${contextCard({
            href: presentationUrl('archicg'),
            eyebrow: 'Semantic cartography',
            title: 'ArchiCG',
            description:
              'Interactive compound graphs, Enterprise Architecture, analytical projections and cross-model semantic navigation.'
          })}

          ${contextCard({
            href: presentationUrl('radar'),
            eyebrow: 'Standards governance',
            title: 'Strategic Standards Radar',
            description:
              'Community standards choices, governance rationale and their connection to architecture, processes and ecosystem evolution.'
          })}
        </div>
      </section>
    `


  const editorEnvironmentAndTutorials =
    !isViewer
      ? `
        <div
          style="
            display:grid;
            grid-template-columns:minmax(0,1.2fr) minmax(320px,0.8fr);
            gap:32px;
            margin-top:38px;
          "
        >
          <section>
            <h2
              style="
                margin:0 0 12px 0;
                font-family:'Syne',sans-serif;
                font-size:17px;
                color:#1E3A5F;
              "
            >
              Environment
            </h2>

            <div
              style="
                border:1px solid #D8E0E8;
                border-radius:6px;
                background:#FFFFFF;
                padding:16px 18px;
                font-family:monospace;
                font-size:13px;
                line-height:1.7;
                color:#334155;
              "
            >
              Environment<br>
              ├── Repositories<br>
              ├── CoCs<br>
              ├── Collaborations<br>
              └── Processes
            </div>

            <p
              style="
                margin:12px 0 0 0;
                font-family:sans-serif;
                font-size:13px;
                line-height:1.55;
                color:#64748B;
              "
            >
              The Environment is a process-oriented semantic projection,
              not a file browser. The position of a process in a tree is a
              result of the active projection, its classifications and its
              relationships — not an intrinsic property of the process itself.
            </p>
          </section>

          <section>
            <h2
              style="
                margin:0 0 12px 0;
                font-family:'Syne',sans-serif;
                font-size:17px;
                color:#1E3A5F;
              "
            >
              Guided tutorials
            </h2>

            <div
              style="
                border:1px solid #D8E0E8;
                border-radius:6px;
                background:#FFFFFF;
                padding:16px 18px;
              "
            >
              <p
                style="
                  margin:0;
                  font-family:sans-serif;
                  font-size:13px;
                  line-height:1.55;
                  color:#475569;
                "
              >
                Tutorials are distinct from the contextual presentations above.
                They will later guide users through concrete BPMNSM actions using
                semi-automated scenarios.
              </p>

              <div
                style="
                  display:grid;
                  gap:8px;
                  margin-top:14px;
                "
              >
                <button
                  type="button"
                  disabled
                  style="
                    text-align:left;
                    border:1px solid #E2E8F0;
                    border-radius:4px;
                    padding:9px 11px;
                    background:#F8FAFC;
                    color:#94A3B8;
                    cursor:not-allowed;
                  "
                >
                  Understand the Environment
                </button>

                <button
                  type="button"
                  disabled
                  style="
                    text-align:left;
                    border:1px solid #E2E8F0;
                    border-radius:4px;
                    padding:9px 11px;
                    background:#F8FAFC;
                    color:#94A3B8;
                    cursor:not-allowed;
                  "
                >
                  Build a BPMN Process
                </button>

                <button
                  type="button"
                  disabled
                  style="
                    text-align:left;
                    border:1px solid #E2E8F0;
                    border-radius:4px;
                    padding:9px 11px;
                    background:#F8FAFC;
                    color:#94A3B8;
                    cursor:not-allowed;
                  "
                >
                  Work with Collaborations
                </button>

                <div
                  style="
                    margin-top:2px;
                    font-family:sans-serif;
                    font-size:11px;
                    color:#94A3B8;
                  "
                >
                  Tutorial scripting is intentionally deferred until the
                  BPMNSM interaction model is stabilised.
                </div>
              </div>
            </div>
          </section>
        </div>
      `
      : ''


  const html =
    `
      <div
        class="bpmnsm-welcome"
        style="
          width:100%;
          min-height:100%;
          box-sizing:border-box;
          padding:40px 32px;
          background:linear-gradient(
            145deg,
            #F8FAFC 0%,
            #FFFFFF 55%,
            #EEF3F8 100%
          );
        "
      >
        <div
          style="
            width:100%;
            max-width:1400px;
            margin:0 auto;
          "
        >
          <div
            style="
              margin-bottom:12px;
              font-family:'Syne',sans-serif;
              font-size:12px;
              font-weight:700;
              letter-spacing:.14em;
              text-transform:uppercase;
              color:#55708F;
            "
          >
            BPMNSM · BPMN Semantic Mediator
          </div>

          <h1
            style="
              margin:0 0 14px 0;
              font-family:'Syne',sans-serif;
              font-size:34px;
              font-weight:700;
              line-height:1.15;
              color:#1E3A5F;
            "
          >
            ${
              isViewer
                ? 'Explore BPMN Repositories and Process Knowledge'
                : 'Business Process Modeling with Semantic Mediation'
            }
          </h1>

          <p
            style="
              max-width:1050px;
              margin:0;
              font-family:sans-serif;
              font-size:15px;
              line-height:1.65;
              color:#475569;
            "
          >
            ${
              isViewer
                ? `
                  BPMNSM Viewer provides a read-only environment for navigating
                  BPMN repositories, Centres of Competence, collaborations and
                  processes while preserving their semantic and repository context.
                `
                : `
                  BPMNSM is the BPMN and process-interoperability workbench within
                  a broader <strong>Interoperability of Meaning</strong> research
                  and engineering trajectory. It keeps BPMN 2.0 as the behavioral
                  pivot while adding controlled semantic enrichment, repository
                  projections, provenance and mediation with other semantic grounds.
                `
            }
          </p>

          <p
            style="
              max-width:1050px;
              margin:12px 0 0 0;
              font-family:sans-serif;
              font-size:15px;
              line-height:1.65;
              color:#475569;
            "
          >
            ${
              isViewer
                ? `
                  Start from a Repository to establish provenance and governance
                  context, then follow the Environment projection toward CoCs,
                  Collaborations, Processes and their BPMN views. Semantic properties
                  remain available for inspection without modifying the source models.
                `
                : `
                  The objective is not to replace BPMN with a universal proprietary
                  model. Specialized representations remain meaningful for people,
                  while their identities, data, metamodel semantics and transformations
                  remain explicit enough for machines to process and relate them.
                `
            }
          </p>

          <div
            style="
              display:flex;
              flex-wrap:wrap;
              gap:10px;
              margin-top:26px;
            "
          >
            ${actionsHtml}
          </div>

          ${viewerRepositoryNavigation}
          ${contextHtml}
          ${editorEnvironmentAndTutorials}
        </div>
      </div>
    `


  function onActivate({
    container
  } = {}) {

    if (
      !container
    ) {

      return
    }


    if (
      onNewProcess
    ) {

      container
        .querySelector(
          '[data-welcome-action="new-process"]'
        )
        ?.addEventListener(
          'click',
          onNewProcess
        )
    }


    if (
      onOpenRepository
    ) {

      container
        .querySelector(
          '[data-welcome-action="open-repository"]'
        )
        ?.addEventListener(
          'click',
          onOpenRepository
        )
    }


    if (
      onImportBpmn
    ) {

      container
        .querySelector(
          '[data-welcome-action="import-bpmn"]'
        )
        ?.addEventListener(
          'click',
          onImportBpmn
        )
    }
  }


  return {

    id:
      'welcome',

    title:
      'Welcome',

    html,

    onActivate
  }
}