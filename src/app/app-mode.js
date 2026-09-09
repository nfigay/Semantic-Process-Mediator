export const APP_MODES = {

  VIEWER:
    'viewer',

  EDITOR:
    'editor'

}


export function normalizeAppMode(
  mode
) {

  if (
    mode ===
    APP_MODES.VIEWER
  ) {

    return APP_MODES.VIEWER

  }


  return APP_MODES.EDITOR

}


export function isEditorMode(
  mode
) {

  return (
    normalizeAppMode(
      mode
    ) ===
    APP_MODES.EDITOR
  )

}


export function isViewerMode(
  mode
) {

  return (
    normalizeAppMode(
      mode
    ) ===
    APP_MODES.VIEWER
  )

}