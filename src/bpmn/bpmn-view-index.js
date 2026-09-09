export function createBpmnViewIndex(
  definitions
) {

  const diagrams =
    Array.isArray(
      definitions?.diagrams
    )
      ? definitions.diagrams
      : []


  const views =
    diagrams
      .map(
        createView
      )
      .filter(
        Boolean
      )


  const viewsById =
    new Map()


  const viewsBySubjectId =
    new Map()


  for (
    const view
    of views
  ) {

    if (
      view.diagramId
    ) {

      viewsById.set(
        view.diagramId,
        view
      )
    }


    if (
      !view.subject?.bpmnId
    ) {

      continue
    }


    const subjectViews =
      viewsBySubjectId.get(
        view.subject.bpmnId
      ) || []


    subjectViews.push(
      view
    )


    viewsBySubjectId.set(
      view.subject.bpmnId,
      subjectViews
    )
  }


  function getViews() {

    return [
      ...views
    ]
  }


  function getView(
    diagramId
  ) {

    return (
      viewsById.get(
        diagramId
      ) ||
      null
    )
  }


  function getViewsForSubject(
    bpmnElementId
  ) {

    return [
      ...(
        viewsBySubjectId.get(
          bpmnElementId
        ) ||
        []
      )
    ]
  }


  function getSubjects() {

    return Array
      .from(
        viewsBySubjectId.entries()
      )
      .map(
        ([
          bpmnId,
          subjectViews
        ]) => {

          const subject =
            subjectViews[0]
              ?.subject ||
            null


          return {
            bpmnId,

            type:
              subject?.type ||
              null,

            name:
              subject?.name ||
              null,

            views: [
              ...subjectViews
            ]
          }
        }
      )
  }


  return {
    getViews,
    getView,
    getViewsForSubject,
    getSubjects
  }
}


function createView(
  diagram
) {

  if (
    !diagram
  ) {

    return null
  }


  const plane =
    diagram.plane ||
    null


  const subject =
    plane?.bpmnElement ||
    null


  return {

    diagramId:
      diagram.id ||
      null,

    diagramName:
      diagram.name ||
      null,

    planeId:
      plane?.id ||
      null,

    subject:
      subject
        ? {
            bpmnId:
              subject.id ||
              null,

            type:
              subject.$type ||
              null,

            name:
              subject.name ||
              null
          }
        : null
  }
}