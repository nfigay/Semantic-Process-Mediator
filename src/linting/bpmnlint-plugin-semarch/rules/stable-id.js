const AUTO_GEN_RE =
  /^[A-Za-z]+_[0-9a-zA-Z]{7,}$/


export default function() {

  function check(
    node,
    reporter
  ) {

    if (
      !node ||
      !node.id
    ) {
      return
    }


    if (
      node.$type ===
        'bpmn:Process' &&
      node.id ===
        'Process_1'
    ) {

      reporter.report(
        node.id,

        'Default "Process_1" ID — rename to something like ' +
        '"CoC_Avionics_AssemblyVerification"'
      )

      return
    }


    if (
      AUTO_GEN_RE.test(
        node.id
      )
    ) {

      reporter.report(
        node.id,

        `Auto-generated ID "${node.id}". ` +
        'Use semantic naming: {ProcessId}_{Type}_{Name}'
      )
    }
  }


  return {
    check
  }
}