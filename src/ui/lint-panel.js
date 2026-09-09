export function createLintPanel(layout) {
  layout.el('bottom').innerHTML = `
    <div id="lint-panel" style="height:100%;display:flex;flex-direction:column;">
      <div style="display:flex;align-items:center;padding:4px 12px;background:#EDF0F5;border-bottom:1px solid #D4DCE6;gap:8px;flex-shrink:0;">
        <span style="font-family:monospace;font-size:10px;font-weight:600;color:#4A6580;letter-spacing:.08em;text-transform:uppercase;">
          Linting Results
        </span>
        <span id="lint-summary" style="font-family:monospace;font-size:10px;color:#8A9BB0;"></span>
      </div>
      <div id="lint-results" style="flex:1;overflow-y:auto;padding:4px 0;"></div>
    </div>
  `
}
export function createLintRenderer(modeler) {
  return function renderLintResults(issues) {
    const container = document.getElementById('lint-results')
    const summary = document.getElementById('lint-summary')
    const badge = document.getElementById('lint-badge')

    if (!container) return

    const errors = issues.filter(i => i.severity === 'error').length
    const warnings = issues.filter(i => i.severity === 'warning').length
    const infos = issues.filter(i => i.severity === 'info').length

    if (issues.length === 0) {
      if (badge) {
        badge.style.display = 'none'
      }

      if (summary) {
        summary.textContent = 'No issues'
      }

      container.innerHTML = `
        <div style="padding:8px 14px;font-family:monospace;font-size:11px;color:#6BAF92;">
          ✓ All rules passed
        </div>
      `

      return
    }

    if (badge) {
      badge.style.display = ''

      const parts = []

      if (errors) {
        parts.push(`${errors}E`)
      }

      if (warnings) {
        parts.push(`${warnings}W`)
      }

      if (infos) {
        parts.push(`${infos}I`)
      }

      badge.textContent = parts.join(' · ')
    }

    if (summary) {
      summary.textContent =
        `${issues.length} issue${issues.length > 1 ? 's' : ''}`
    }

    const severityColors = {
      error: {
        dot: '#B84040',
        bg: '#FBF3F3',
        text: '#7A2020'
      },
      warning: {
        dot: '#C47A2B',
        bg: '#FBF6F0',
        text: '#6A4010'
      },
      info: {
        dot: '#2E6DA4',
        bg: '#EEF4FB',
        text: '#1A3A5A'
      }
    }

    container.innerHTML = issues
      .map(issue => {
        const c =
          severityColors[issue.severity] ||
          severityColors.info

        const name =
          issue.element.businessObject?.name
            ? ` — ${issue.element.businessObject.name}`
            : ''

        return `
          <div
            class="lint-row"
            data-element-id="${issue.element.id}"
            style="
              display:flex;
              align-items:flex-start;
              gap:8px;
              padding:3px 12px;
              cursor:pointer;
              border-bottom:1px solid #EDF0F5;
            "
            onmouseover="this.style.background='${c.bg}'"
            onmouseout="this.style.background=''"
          >
            <span
              style="
                width:6px;
                height:6px;
                border-radius:50%;
                background:${c.dot};
                flex-shrink:0;
                margin-top:4px;
              "
            ></span>

            <div style="min-width:0;">
              <span
                style="
                  font-family:monospace;
                  font-size:10px;
                  color:#8A9BB0;
                "
              >
                ${issue.rule}
              </span>

              <span
                style="
                  font-family:monospace;
                  font-size:10px;
                  font-weight:600;
                  color:${c.text};
                  margin-left:6px;
                "
              >
                ${issue.element.id}${name}
              </span>

              <div
                style="
                  font-size:11px;
                  color:#4A6580;
                  line-height:1.35;
                "
              >
                ${issue.message}
              </div>
            </div>
          </div>
        `
      })
      .join('')

    container
      .querySelectorAll('.lint-row')
      .forEach(row => {
        row.addEventListener('click', () => {
          const id = row.dataset.elementId

          const el =
            modeler
              .get('elementRegistry')
              .get(id)

          if (el) {
            modeler
              .get('selection')
              .select(el)

            modeler
              .get('canvas')
              .scrollToElement(el)
          }
        })
      })
  }
}