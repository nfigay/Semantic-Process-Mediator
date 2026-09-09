export function createLintResultStore({
  onResult
} = {}) {

  const resultsBySource =
    new Map()


  function getAll() {

    return Array
      .from(
        resultsBySource.values()
      )
      .flat()
  }


  function publish() {

    const issues =
      getAll()

    onResult?.(
      issues
    )

    return issues
  }


  function set(
    source,
    issues = []
  ) {

    resultsBySource.set(
      source,
      Array.isArray(issues)
        ? issues
        : []
    )

    return publish()
  }


  function clear(
    source
  ) {

    if (source) {

      resultsBySource.delete(
        source
      )

    } else {

      resultsBySource.clear()
    }

    return publish()
  }


  return {
    set,
    clear,
    getAll
  }
}