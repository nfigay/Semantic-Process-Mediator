// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { createRepositoryBrowser } from '../ui/repository-browser.js'
import { createRepositoryScopeStore } from '../repository/repository-scope-store.js'
import { createActiveRepository } from '../repository/active-repository.js'

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = TestResizeObserver

describe('Repository Browser Source selection', () => {
  it('projects physical acquisitions as Sources without inferring semantic Repositories', () => {
    const scopeStore = createRepositoryScopeStore()
    const runtime = scopeStore.createRepository('runtime')
    const sourceA = scopeStore.createRepository('repository-a')
    const sourceB = scopeStore.createRepository('repository-b')

    sourceA.workspace.mode = 'folder'
    sourceA.workspace.name = 'Source A'
    sourceB.workspace.mode = 'archive'
    sourceB.workspace.name = 'Source B.zip'

    const activeRepository = createActiveRepository(runtime)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const onSourceSelect = vi.fn()

    const browser = createRepositoryBrowser({
      activeRepository,
      container,
      getSources() {
        return scopeStore.getRepositories()
          .filter(scope => scope.workspace.mode !== 'memory')
          .map(scope => ({
            id: scope.id,
            name: scope.workspace.name || scope.id,
            mode: scope.workspace.mode
          }))
      },
      getRepositories() {
        return []
      },
      onSourceSelect
    })

    browser.setView('sources')

    expect(
      browser.sidebar.nodes.map(node => ({
        id: node.id,
        text: node.text,
        repositoryKind: node.repositoryKind,
        sourceId: node.sourceId,
        sourceMode: node.sourceMode
      }))
    ).toEqual([
      {
        id: 'source:repository-a',
        text: 'Source A',
        repositoryKind: 'source',
        sourceId: 'repository-a',
        sourceMode: 'folder'
      },
      {
        id: 'source:repository-b',
        text: 'Source B.zip',
        repositoryKind: 'source',
        sourceId: 'repository-b',
        sourceMode: 'archive'
      }
    ])

    browser.sidebar.onClick({ target: 'source:repository-b' })
    expect(onSourceSelect).toHaveBeenCalledWith('repository-b')

    browser.setView('environment')
    expect(browser.sidebar.get('environment:repositories')?.nodes).toEqual([])

    browser.destroy()
    container.remove()
  })
  it('keeps the active logical projection in Environment without Source wrappers', () => {
    const scopeStore = createRepositoryScopeStore()
    const sourceA = scopeStore.createRepository('repository-a-context')
    const sourceB = scopeStore.createRepository('repository-b-context')

    sourceA.workspace.mode = 'folder'
    sourceB.workspace.mode = 'folder'
    sourceA.model.addComponent({ id: 'process-a', type: 'process', name: 'Process A' })
    sourceB.model.addComponent({ id: 'process-b', type: 'process', name: 'Process B' })

    const activeRepository = createActiveRepository(sourceA)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const browser = createRepositoryBrowser({
      activeRepository,
      container,
      getSources: () => [],
      getRepositories: () => []
    })

    browser.setView('environment')
    expect(browser.sidebar.get('environment:processes')?.nodes?.map(node => node.text)).toEqual(['Process A'])
    expect(browser.sidebar.get('source-projection:repository-a-context')).toBeNull()

    activeRepository.set(sourceB)
    browser.render()
    expect(browser.sidebar.get('environment:processes')?.nodes?.map(node => node.text)).toEqual(['Process B'])
    expect(browser.sidebar.get('source-projection:repository-b-context')).toBeNull()

    browser.destroy()
    container.remove()
  })

})
