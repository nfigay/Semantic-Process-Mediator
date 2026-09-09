export function createFileInput({
  id = 'file-input',
  accept = '.bpmn, .xml',
  onLoad
} = {}) {

  // Callback modifiable après la création du file input
  let loadHandler = onLoad

  let input =
    document.getElementById(id)

  if (!input) {
    input =
      document.createElement('input')

    input.type = 'file'
    input.id = id
    input.accept = accept
    input.style.display = 'none'

    document.body.appendChild(input)
  }

  input.addEventListener(
    'change',
    () => {
      const file =
        input.files?.[0]

      if (!file) {
        return
      }

      const reader =
        new FileReader()

      reader.onload =
        event => {
          loadHandler?.(
            event.target.result,
            file
          )
        }

      reader.readAsText(file)

      // Permet de réimporter deux fois de suite le même fichier.
      input.value = ''
    }
  )

  return {
    open() {
      input.click()
    },

    setOnLoad(handler) {
      loadHandler = handler
    },

    element: input
  }
}