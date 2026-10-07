BPMNSM six-deployment Vite patch

Adds four server-served targets while preserving the two standalone targets:
- build:server:publisher
- build:server:viewer
- build:modules:publisher
- build:modules:viewer

The modules targets use Rollup preserveModules with minify=false and do not use
the target-specific source-rewrite plugin. Publisher/Viewer mode is selected by
a meta element in the HTML entry point. src/main.js therefore contains one
generic runtime mode resolver shared by all deployments.

The pages build copies all four server targets into dist/server and dist/modules.
