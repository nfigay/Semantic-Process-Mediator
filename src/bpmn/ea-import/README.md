# EA XMI → BPMN browser adapter (integration checkpoint 30)
This directory is an isolated, uncommitted integration checkpoint.
`ea-browser-converter.mjs` accepts browser File/ArrayBuffer and invokes Saxon-JS using a compiled SEF stylesheet.
`coverage-core.mjs` and `structure-core.mjs` are original DOM validation modules.
The `.xsl` is the original FLOW-CONV-06 source, not executable directly by Saxon-JS in the browser.
SEF compilation, UI wiring, full EA XMI test, BPMN DI, and collaboration semantics remain open.
No Node.js dependency is introduced into browser runtime modules.
