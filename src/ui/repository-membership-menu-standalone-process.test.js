import { describe, expect, it, vi } from 'vitest'
import { createRepositoryMembershipMenu } from './repository-membership-menu.js'
import { createRepositoryModel } from '../repository/repository-model.js'

function sidebarDouble(node) {
  const handlers = new Map()
  return {
    menu: [],
    get: () => node,
    on: (name, fn) => handlers.set(name, fn),
    off: () => {},
    fire(name, event) { handlers.get(name)?.(event) }
  }
}

describe('standalone Process CoC assignment menu', () => {
  it('offers canonical CoC assignment without replacing resource duplication', () => {
    const model = createRepositoryModel()
    model.addComponent({ id: 'process-1', type: 'process', name: 'Process One' })
    const sidebar = sidebarDouble({ repositoryKind: 'component', repositoryId: 'process-1' })
    const onAssign = vi.fn()
    const menu = createRepositoryMembershipMenu({
      sidebar,
      repositoryModel: model,
      getAssignableContainers: () => [
        { id: 'coc-system', name: 'Space System Engineering' },
        { id: 'coc-equipment', name: 'Equipment Engineering' }
      ],
      getAdditionalMenuItems: () => [ { id: 'duplicate-resource', text: 'Duplicate resource to…' } ],
      onAssignProcessToContainer: onAssign
    })

    sidebar.fire('contextMenu', { target: 'process-node', preventDefault() {} })
    expect(sidebar.menu.map(item => item.text)).toEqual([
      'Assign to CoC: Space System Engineering',
      'Assign to CoC: Equipment Engineering',
      'Duplicate resource to…'
    ])

    sidebar.fire('menuClick', {
      target: 'process-node',
      detail: { menuItem: { id: 'assign-process-to-coc:coc-system' } }
    })
    expect(onAssign).toHaveBeenCalledWith({ containerId: 'coc-system', processId: 'process-1' })
    menu.destroy()
  })
})
