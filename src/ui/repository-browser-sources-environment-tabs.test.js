// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { createRepositoryBrowser } from './repository-browser.js'
import { createRepositoryScopeStore } from '../repository/repository-scope-store.js'
import { createActiveRepository } from '../repository/active-repository.js'

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = TestResizeObserver

function nodePath(node) {
  return {
    id: node?.id,
    text: node?.text,
    nodes: (node?.nodes || []).map(nodePath)
  }
}

describe('Repository Browser top-level controlled views', () => {
  it('opens on Sources and projects each Source as its physical folder/file tree', () => {
    const scopeStore = createRepositoryScopeStore()
    const runtime = scopeStore.createRepository('runtime')
    const activeRepository = createActiveRepository(runtime)
    const container = document.createElement('div')
    document.body.appendChild(container)

    const browser = createRepositoryBrowser({
      activeRepository,
      container,
      getSources() {
        return [
          {
            id: 'workspace',
            name: 'workspace',
            mode: 'folder',
            resources: [
              { path: 'customer/order.bpmn' },
              { path: 'customer/contracts/schema.json' },
              { path: 'README.md' }
            ]
          },
          {
            id: 'test',
            name: 'Test',
            mode: 'folder',
            resources: [
              { path: 'customer/order.bpmn' }
            ]
          }
        ]
      },
      getRepositories() {
        return []
      }
    })

    browser.setView('sources')

    expect(browser.tabs).toBeUndefined()
    expect(browser.sidebar.nodes.map(node => node.id)).toEqual([
      'source:workspace',
      'source:test'
    ])

    expect(nodePath(browser.sidebar.get('source:workspace'))).toMatchObject({
      text: 'workspace',
      nodes: [
        {
          text: 'customer',
          nodes: [
            { text: 'contracts', nodes: [{ text: 'schema.json' }] },
            { text: 'order.bpmn' }
          ]
        },
        { text: 'README.md' }
      ]
    })

    expect(nodePath(browser.sidebar.get('source:test'))).toMatchObject({
      text: 'Test',
      nodes: [
        {
          text: 'customer',
          nodes: [{ text: 'order.bpmn' }]
        }
      ]
    })

    browser.destroy()
    container.remove()
  })

  it('activates Environment as a logical tree with no Source nodes', () => {
    const scopeStore = createRepositoryScopeStore()
    const source = scopeStore.createRepository('workspace')
    source.model.addComponent({
      id: 'process-a',
      type: 'process',
      name: 'Process A'
    })

    const activeRepository = createActiveRepository(source)
    const container = document.createElement('div')
    document.body.appendChild(container)

    const browser = createRepositoryBrowser({
      activeRepository,
      container,
      getSources() {
        return [{
          id: 'workspace',
          name: 'workspace',
          mode: 'folder',
          resources: [{ path: 'physical/a.bpmn' }]
        }]
      },
      getRepositories() {
        return []
      }
    })

    browser.setView('environment')

    expect(browser.tabs).toBeUndefined()
    expect(browser.sidebar.nodes.map(node => node.id)).toEqual([
      'environment:repositories',
      'environment:cocs',
      'environment:collaborations',
      'environment:processes',
      'environment:archimate'
    ])

    expect(browser.sidebar.get('environment')).toBeNull()
    expect(browser.sidebar.get('environment:sources')).toBeNull()
    expect(browser.sidebar.get('source:workspace')).toBeNull()
    expect(browser.sidebar.get('source-projection:workspace')).toBeNull()
    expect(
      browser.sidebar.get('environment:processes')?.nodes?.map(node => node.text)
    ).toEqual(['Process A'])

    browser.destroy()
    container.remove()
  })
})
