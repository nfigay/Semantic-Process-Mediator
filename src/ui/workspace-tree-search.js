/*
 * Workspace Tree Search UI.
 *
 * This component owns only the user-facing query control. The Repository
 * Browser remains responsible for search state and structural filtering.
 */
export function createWorkspaceTreeSearch({
  container,
  initialQuery = '',
  initialContext = 'environment',
  onQueryChange
} = {}) {

  if (
    !container
  ) {

    throw new Error(
      'Workspace tree search requires a container'
    )
  }


  container.innerHTML =
    `
      <div
        style="
          padding:6px;
          border-bottom:1px solid #D4DCE6;
          background:#F4F6F9;
        "
      >
        <input
          type="search"
          aria-label="Search Environment"
          placeholder="Search Environment"
          autocomplete="off"
          spellcheck="false"
          style="
            box-sizing:border-box;
            width:100%;
            height:28px;
            padding:4px 8px;
            border:1px solid #B8C3D1;
            border-radius:3px;
            background:#FFFFFF;
          "
        >
      </div>
    `


  const input =
    container.querySelector(
      'input[type="search"]'
    )


  input.value =
    String(initialQuery || '')


  function setContext(context) {
    const normalized = context === 'sources' ? 'sources' : 'environment'
    const label = normalized === 'sources' ? 'Search Sources' : 'Search Environment'
    input.setAttribute('aria-label', label)
    input.setAttribute('placeholder', label)
  }


  setContext(initialContext)


  function handleInput() {

    onQueryChange?.(
      input.value
    )
  }


  input.addEventListener(
    'input',
    handleInput
  )


  return {
    input,

    getQuery() {
      return input.value
    },

    setContext,

    setQuery(
      query
    ) {

      input.value =
        String(query || '')

      handleInput()
    },

    destroy() {

      input.removeEventListener(
        'input',
        handleInput
      )

      container.innerHTML = ''
    }
  }
}
