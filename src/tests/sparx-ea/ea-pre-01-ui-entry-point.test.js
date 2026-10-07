import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

const main =
  fs.readFileSync(
    new URL('../../main.js', import.meta.url),
    'utf8'
  )

const toolbar =
  fs.readFileSync(
    new URL('../../ui/toolbar.js', import.meta.url),
    'utf8'
  )

const createApp =
  fs.readFileSync(
    new URL('../../app/create-app.js', import.meta.url),
    'utf8'
  )


describe(
  'EA-PRE-01 — Sparx EA product UI entry point',
  () => {

    it(
      'exposes a dedicated Sparx EA import action in the canonical toolbar',
      () => {

        expect(toolbar).toContain(
          "id: 'import-sparx-ea-environment'"
        )

        expect(toolbar).toContain(
          'Import from Sparx EA…'
        )

        expect(toolbar).toContain(
          'onImportSparxEa'
        )
      }
    )


    it(
      'wires the Sparx EA action through createApp into the canonical toolbar',
      () => {

        expect(createApp).toContain(
          'onImportSparxEa:'
        )

        expect(createApp).toContain(
          'actions.onImportSparxEa'
        )

        expect(toolbar).toContain(
          'onImportSparxEa?.()'
        )

        expect(toolbar).not.toContain(
          'actions.onImportSparxEa?.()'
        )
      }
    )


    it(
      'routes the product action through the Sparx EA two-file dialog',
      () => {

        const start =
          main.indexOf(
            'onImportSparxEa()'
          )

        const end =
          main.indexOf(
            'onImportArchimate()',
            start
          )

        expect(start).toBeGreaterThan(-1)
        expect(end).toBeGreaterThan(start)

        const handler =
          main.slice(
            start,
            end
          )

        expect(handler).toContain(
          'openSparxEaImportDialog({'
        )

        expect(handler).toContain(
          'sparxEaBpmnFileInput.open()'
        )

        expect(handler).toContain(
          'sparxEaXmiFileInput.open()'
        )

        expect(handler).not.toContain(
          'importFileInput.open()'
        )

        expect(handler).not.toContain(
          'archimateImportFileInput.open()'
        )
      }
    )
  }
)
