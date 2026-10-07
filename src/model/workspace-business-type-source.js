/*
 * BPMNSM — Workspace business type source
 *
 * The workspace contributes business type definitions as data.
 * Their provenance does not create a distinct semantic type category.
 */

import workspaceBusinessTypes
  from './workspace-business-types.json'


export function createWorkspaceBusinessTypeSource() {

  return {
    getTypes() {

      return [
        ...workspaceBusinessTypes.types
      ]
    }
  }
}


export function getWorkspaceBusinessContextRoles() {

  return {
    ...workspaceBusinessTypes.contextRoles
  }
}
