import {
  describe,
  expect,
  it
} from 'vitest'

import {
  filterWorkspaceTreeNodes
} from './workspace-tree-filter.js'


describe('filterWorkspaceTreeNodes', () => {

  function createNodes() {
    return [
      {
        id: 'environment',
        text: 'Environment',
        nodes: [
          {
            id: 'repositories',
            text: 'Repositories',
            nodes: [
              {
                id: 'repository:alpha',
                text: 'Alpha Repository',
                nodes: [
                  {
                    id: 'process:invoice',
                    text: 'Invoice Process'
                  },
                  {
                    id: 'process:shipment',
                    text: 'Shipment Process'
                  }
                ]
              }
            ]
          },
          {
            id: 'cocs',
            text: 'CoCs',
            nodes: [
              {
                id: 'coc:supplier',
                text: 'Supplier'
              }
            ]
          }
        ]
      }
    ]
  }


  it('returns the complete tree unchanged for an empty query', () => {
    const nodes = createNodes()

    expect(
      filterWorkspaceTreeNodes(nodes, '   ')
    ).toBe(nodes)
  })


  it('matches node text case-insensitively and preserves ancestors', () => {
    const nodes = createNodes()
    const filtered = filterWorkspaceTreeNodes(nodes, 'INVOICE')

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('environment')
    expect(filtered[0].nodes).toHaveLength(1)
    expect(filtered[0].nodes[0].id).toBe('repositories')
    expect(filtered[0].nodes[0].nodes).toHaveLength(1)
    expect(filtered[0].nodes[0].nodes[0].id).toBe('repository:alpha')
    expect(filtered[0].nodes[0].nodes[0].nodes.map(node => node.id))
      .toEqual(['process:invoice'])
  })


  it('keeps all descendants when a node itself matches', () => {
    const nodes = createNodes()
    const filtered = filterWorkspaceTreeNodes(nodes, 'alpha repository')
    const repository = filtered[0].nodes[0].nodes[0]

    expect(repository).toBe(nodes[0].nodes[0].nodes[0])
    expect(repository.nodes.map(node => node.id))
      .toEqual(['process:invoice', 'process:shipment'])
  })


  it('removes branches without a match', () => {
    const filtered = filterWorkspaceTreeNodes(createNodes(), 'supplier')

    expect(filtered[0].nodes.map(node => node.id))
      .toEqual(['cocs'])
  })


  it('does not mutate the input tree or recalculate occurrence identities', () => {
    const nodes = createNodes()
    const before = JSON.stringify(nodes)

    const filtered = filterWorkspaceTreeNodes(nodes, 'invoice')

    expect(JSON.stringify(nodes)).toBe(before)
    expect(filtered[0].id).toBe(nodes[0].id)
    expect(filtered[0].nodes[0].nodes[0].nodes[0].id)
      .toBe('process:invoice')
  })


  it('returns no nodes when nothing matches', () => {
    expect(
      filterWorkspaceTreeNodes(createNodes(), 'does-not-exist')
    ).toEqual([])
  })
})
