import { describe, expect, it } from 'vitest'

import {
  loadHostedProcessPublication
} from './hosted-publication-loader.js'


describe('PUB-01 hosted publication loader', () => {
  it('reconstructs semantic runtime from a hosted publication package', async () => {
    const packageDocument = {
      format: 'bpmnsm-publication-package',
      version: 1,
      subject: { kind: 'process', id: 'Process_Test' },
      bpmnXml: '<definitions />',
      publicationContext: { cocRef: 'CoC_Test' },
      semanticClosure: {
        profileSource: {
          profileVersion: '0.1',
          id: 'test',
          name: 'Test',
          version: '1.0',
          schemas: [],
          types: [],
          relations: []
        },
        sources: {},
        businessView: { id: 'test-view', projections: [] }
      }
    }

    const calls = []
    const result = await loadHostedProcessPublication({
      baseUrl: '/Semantic-Process-Mediator/',
      publicationId: 'pub-01',
      fetchImpl: async url => {
        calls.push(url)
        return {
          ok: true,
          status: 200,
          json: async () => packageDocument
        }
      }
    })

    expect(calls).toEqual([
      '/Semantic-Process-Mediator/publications/process/pub-01.json'
    ])
    expect(result.bpmnXml).toBe('<definitions />')
    expect(result.publicationContext).toEqual({ cocRef: 'CoC_Test' })
    expect(result.businessView).toEqual({ id: 'test-view', projections: [] })
    expect(result.profileRuntime).toBeTruthy()
  })

  it('preserves legacy .bpmn publications when Vite serves HTML for a missing package', async () => {
    const calls = []
    const result = await loadHostedProcessPublication({
      baseUrl: '/',
      publicationId: 'gs-pub-01',
      fetchImpl: async url => {
        calls.push(url)

        if (url.endsWith('.json')) {
          return {
            ok: true,
            status: 200,
            json: async () => {
              throw new SyntaxError(
                `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
              )
            }
          }
        }

        return {
          ok: true,
          status: 200,
          text: async () => '<legacy />'
        }
      }
    })

    expect(calls).toEqual([
      '/publications/process/gs-pub-01.json',
      '/publications/process/gs-pub-01.bpmn'
    ])

    expect(result).toMatchObject({
      format: 'legacy-bpmn',
      bpmnXml: '<legacy />',
      profileRuntime: null,
      businessView: null
    })
  })

  it('preserves legacy .bpmn publications when no package exists', async () => {
    const calls = []
    const result = await loadHostedProcessPublication({
      baseUrl: '/',
      publicationId: 'gs-pub-01',
      fetchImpl: async url => {
        calls.push(url)
        if (url.endsWith('.json')) {
          return { ok: false, status: 404, statusText: 'Not Found' }
        }
        return {
          ok: true,
          status: 200,
          text: async () => '<legacy />'
        }
      }
    })

    expect(calls).toEqual([
      '/publications/process/gs-pub-01.json',
      '/publications/process/gs-pub-01.bpmn'
    ])
    expect(result).toMatchObject({
      format: 'legacy-bpmn',
      bpmnXml: '<legacy />',
      profileRuntime: null,
      businessView: null
    })
  })
})
