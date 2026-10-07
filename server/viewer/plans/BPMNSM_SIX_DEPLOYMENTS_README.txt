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

GitHub Pages compatibility:
- the pages build writes dist/.nojekyll so GitHub Pages serves Rollup/Vite
  preserveModules runtime paths such as modules/_virtual/... instead of
  filtering underscore-prefixed directories through Jekyll.
- the two preserved-module targets generate source maps (sourcemap=true).
