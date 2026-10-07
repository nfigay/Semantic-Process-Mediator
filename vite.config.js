import {
  defineConfig
} from 'vite'

import {
  resolve
} from 'path'

import {
  viteSingleFile
} from 'vite-plugin-singlefile'

import fs from 'fs'


const ROOT =
  import.meta.dirname


const REPOSITORY_NAME =
  'Semantic-Process-Mediator'


const PAGES_PATH =
  process.env.BPMNSM_PAGES_PATH
    ?.replace(
      /^\/+|\/+$/g,
      ''
    )


const PAGES_BASE =
  PAGES_PATH
    ? `/${REPOSITORY_NAME}/${PAGES_PATH}/`
    : `/${REPOSITORY_NAME}/`


const TEMP_BUILD_DIR =
  resolve(
    ROOT,
    '.semarch-build'
  )


/*
 * ------------------------------------------------------------
 * SemArch application mode
 *
 * We deliberately keep a single src/main.js.
 *
 * During production builds only, this plugin replaces:
 *
 *   mode: 'editor'
 *
 * with the requested target mode.
 *
 * npm run dev remains editor by default and keeps normal Vite
 * hot reload behaviour.
 * ------------------------------------------------------------
 */

function semarchAppModePlugin(
  appMode
) {

  return {

    name:
      `semarch-app-mode-${appMode}`,

    enforce:
      'pre',

    transform(
      code,
      id
    ) {

      if (
        !id.endsWith(
          '/src/main.js'
        )
      ) {

        return null
      }


      const pattern =
        /mode\s*:\s*(?:['"](?:editor|viewer)['"]|resolveApplicationMode\(\))/


      if (
        !pattern.test(
          code
        )
      ) {

        throw new Error(
          'SemArch Vite build could not locate mode: editor/viewer in src/main.js.'
        )
      }


      return {

        code:
          code.replace(
            pattern,
            `mode: '${appMode}'`
          ),

        map:
          null
      }
    }
  }
}


/*
 * ------------------------------------------------------------
 * Standalone post-processing
 *
 * This preserves the behaviour of the original SemArch Vite
 * configuration:
 *
 * 1. rename index.html
 * 2. inline remaining SVG files as base64
 * 3. remove the external SVG files
 *
 * The plugin is now parameterized so it works for both Viewer
 * and Editor.
 * ------------------------------------------------------------
 */

function renameAndInlineSvgPlugin({
  distDir,
  htmlFileName
}) {

  return {

    name:
      `rename-and-inline-svg-${htmlFileName}`,

    writeBundle() {

      const oldHtmlPath =
        resolve(
          distDir,
          'index.html'
        )


      const newHtmlPath =
        resolve(
          distDir,
          htmlFileName
        )


      /*
       * --------------------------------------------------------
       * 1. Rename index.html
       * --------------------------------------------------------
       */

      if (
        fs.existsSync(
          oldHtmlPath
        )
      ) {

        fs.renameSync(
          oldHtmlPath,
          newHtmlPath
        )
      }


      /*
       * --------------------------------------------------------
       * Nothing else can be done if HTML was not produced.
       * --------------------------------------------------------
       */

      if (
        !fs.existsSync(
          newHtmlPath
        )
      ) {

        throw new Error(
          `Standalone HTML was not generated: ${newHtmlPath}`
        )
      }


      /*
       * --------------------------------------------------------
       * 2. Inline remaining SVG files
       * --------------------------------------------------------
       */

      const files =
        fs.readdirSync(
          distDir,
          {
            recursive:
              true
          }
        )


      for (
        const file
        of files
      ) {

        const filePath =
          String(
            file
          )


        if (
          !filePath.endsWith(
            '.svg'
          )
        ) {

          continue
        }


        const svgFullPath =
          resolve(
            distDir,
            filePath
          )


        if (
          !fs.existsSync(
            svgFullPath
          )
        ) {

          continue
        }


        const svgBuffer =
          fs.readFileSync(
            svgFullPath
          )


        const base64Svg =
          svgBuffer.toString(
            'base64'
          )


        const fileName =
          filePath
            .replaceAll(
              '\\',
              '/'
            )
            .split(
              '/'
            )
            .pop()


        let htmlContent =
          fs.readFileSync(
            newHtmlPath,
            'utf8'
          )


        if (
          htmlContent.includes(
            fileName
          )
        ) {

          htmlContent =
            htmlContent.replaceAll(
              fileName,
              `data:image/svg+xml;base64,${base64Svg}`
            )


          fs.writeFileSync(
            newHtmlPath,
            htmlContent,
            'utf8'
          )
        }


        /*
         * ------------------------------------------------------
         * 3. Remove external SVG
         * ------------------------------------------------------
         */

        fs.unlinkSync(
          svgFullPath
        )
      }
    }
  }
}


/*
 * ------------------------------------------------------------
 * Publish one standalone deliverable into dist/standalone
 * ------------------------------------------------------------
 */

function publishStandalonePlugin({
  distDir,
  htmlFileName
}) {

  return {

    name:
      `publish-standalone-${htmlFileName}`,

    closeBundle() {

      const source =
        resolve(
          distDir,
          htmlFileName
        )


      if (
        !fs.existsSync(
          source
        )
      ) {

        throw new Error(
          `Standalone HTML is missing: ${source}`
        )
      }


      const standaloneDir =
        resolve(
          ROOT,
          'dist',
          'standalone'
        )


      fs.mkdirSync(
        standaloneDir,
        {
          recursive:
            true
        }
      )


      fs.copyFileSync(
        source,
        resolve(
          standaloneDir,
          htmlFileName
        )
      )
    }
  }
}


/*
 * ------------------------------------------------------------
 * Copy standalone deliverables into GitHub Pages output
 * ------------------------------------------------------------
 */

function copyStandaloneToPagesPlugin() {

  return {

    name:
      'copy-semarch-standalone-to-pages',

    closeBundle() {

      const standaloneDir =
        resolve(
          ROOT,
          'dist',
          'standalone'
        )


      fs.mkdirSync(
        standaloneDir,
        {
          recursive:
            true
        }
      )


      const viewerSource =
        resolve(
          TEMP_BUILD_DIR,
          'viewer',
          'coc-bpmn-viewer.html'
        )


      const editorSource =
        resolve(
          TEMP_BUILD_DIR,
          'editor',
          'coc-bpmn-editor.html'
        )


      const viewerTarget =
        resolve(
          standaloneDir,
          'coc-bpmn-viewer.html'
        )


      const editorTarget =
        resolve(
          standaloneDir,
          'coc-bpmn-editor.html'
        )


      if (
        !fs.existsSync(
          viewerSource
        )
      ) {

        throw new Error(
          'Standalone Viewer is missing. Build Viewer before GitHub Pages.'
        )
      }


      if (
        !fs.existsSync(
          editorSource
        )
      ) {

        throw new Error(
          'Standalone Editor is missing. Build Editor before GitHub Pages.'
        )
      }


      fs.copyFileSync(
        viewerSource,
        viewerTarget
      )


      fs.copyFileSync(
        editorSource,
        editorTarget
      )


      /*
       * ------------------------------------------------------
       * Presentation catalogue + generated distributions
       * ------------------------------------------------------
       */

      const presentationsSource =
        resolve(
          ROOT,
          'presentations'
        )


      const presentationsBuildSource =
        resolve(
          presentationsSource,
          'dist'
        )


      const presentationsTarget =
        resolve(
          ROOT,
          'dist',
          'presentations'
        )


      const presentationsIndex =
        resolve(
          presentationsSource,
          'index.html'
        )


      if (
        !fs.existsSync(
          presentationsIndex
        )
      ) {

        throw new Error(
          'Presentation catalogue is missing: presentations/index.html'
        )
      }


      if (
        !fs.existsSync(
          presentationsBuildSource
        )
      ) {

        throw new Error(
          'Presentation distributions are missing. Run build:presentations before GitHub Pages.'
        )
      }


      fs.mkdirSync(
        presentationsTarget,
        {
          recursive:
            true
        }
      )


      fs.copyFileSync(
        presentationsIndex,
        resolve(
          presentationsTarget,
          'index.html'
        )
      )


      fs.cpSync(
        presentationsBuildSource,
        presentationsTarget,
        {
          recursive:
            true
        }
      )
    }
  }
}



/*
 * ------------------------------------------------------------
 * Copy server deployment variants into GitHub Pages output
 *
 * Four server-served variants are produced independently:
 *
 * - server/publisher : normal optimized Vite build
 * - server/viewer    : normal optimized Vite build
 * - modules/publisher: preserveModules, non-minified
 * - modules/viewer   : preserveModules, non-minified
 *
 * The module variants intentionally keep the application module
 * graph visible instead of collapsing it into production bundles.
 * ------------------------------------------------------------
 */

function copyServerDeploymentsToPagesPlugin() {

  return {

    name:
      'copy-semarch-server-deployments-to-pages',

    closeBundle() {

      const deployments = [
        [
          'server-publisher',
          'server/publisher'
        ],
        [
          'server-viewer',
          'server/viewer'
        ],
        [
          'modules-publisher',
          'modules/publisher'
        ],
        [
          'modules-viewer',
          'modules/viewer'
        ]
      ]


      /*
       * GitHub Pages must bypass Jekyll because preserveModules emits
       * required runtime modules below "_virtual" directories.
       */
      fs.writeFileSync(
        resolve(
          ROOT,
          'dist',
          '.nojekyll'
        ),
        ''
      )


      for (
        const [
          sourceName,
          targetName
        ]
        of deployments
      ) {

        const source =
          resolve(
            TEMP_BUILD_DIR,
            sourceName
          )


        if (
          !fs.existsSync(
            source
          )
        ) {

          throw new Error(
            `Server deployment is missing: ${sourceName}. Build all six deployment targets before GitHub Pages.`
          )
        }


        const target =
          resolve(
            ROOT,
            'dist',
            targetName
          )


        fs.mkdirSync(
          target,
          {
            recursive:
              true
          }
        )


        fs.cpSync(
          source,
          target,
          {
            recursive:
              true
          }
        )
      }
    }
  }
}


/*
 * ------------------------------------------------------------
 * Vite configuration
 * ------------------------------------------------------------
 */

export default defineConfig(
  ({
    mode
  }) => {

    /*
     * ==========================================================
     * Standalone Viewer
     * ==========================================================
     */

    if (
      mode ===
      'standalone-viewer'
    ) {

      const distDir =
        resolve(
          TEMP_BUILD_DIR,
          'viewer'
        )


      return {

        base:
          './',

        plugins: [

          semarchAppModePlugin(
            'viewer'
          ),

          viteSingleFile({
            useRecommendedBuildConfig:
              true
          }),

          renameAndInlineSvgPlugin({

            distDir,

            htmlFileName:
              'coc-bpmn-viewer.html'
          }),

          publishStandalonePlugin({

            distDir,

            htmlFileName:
              'coc-bpmn-viewer.html'
          })
        ],

        build: {

          outDir:
            distDir,

          emptyOutDir:
            true,

          target:
            'esnext',

          cssCodeSplit:
            false,

          rollupOptions: {

            input:
              resolve(
                ROOT,
                'index.html'
              )
          }
        }
      }
    }


    /*
     * ==========================================================
     * Standalone Editor
     * ==========================================================
     */

    if (
      mode ===
      'standalone-editor'
    ) {

      const distDir =
        resolve(
          TEMP_BUILD_DIR,
          'editor'
        )


      return {

        base:
          './',

        plugins: [

          semarchAppModePlugin(
            'editor'
          ),

          viteSingleFile({
            useRecommendedBuildConfig:
              true
          }),

          renameAndInlineSvgPlugin({

            distDir,

            htmlFileName:
              'coc-bpmn-editor.html'
          }),

          publishStandalonePlugin({

            distDir,

            htmlFileName:
              'coc-bpmn-editor.html'
          })
        ],

        build: {

          outDir:
            distDir,

          emptyOutDir:
            true,

          target:
            'esnext',

          cssCodeSplit:
            false,

          rollupOptions: {

            input:
              resolve(
                ROOT,
                'index.html'
              )
          }
        }
      }
    }



    /*
     * ==========================================================
     * Server Publisher — normal optimized Vite/Rollup build
     * ==========================================================
     */

    if (
      mode ===
      'server-publisher'
    ) {

      return {

        base:
          './',

        plugins: [

          semarchAppModePlugin(
            'editor'
          )
        ],

        build: {

          outDir:
            resolve(
              TEMP_BUILD_DIR,
              'server-publisher'
            ),

          emptyOutDir:
            true,

          target:
            'esnext',

          minify:
            true,

          rollupOptions: {

            input:
              resolve(
                ROOT,
                'publisher.html'
              )
          }
        }
      }
    }


    /*
     * ==========================================================
     * Server Viewer — normal optimized Vite/Rollup build
     * ==========================================================
     */

    if (
      mode ===
      'server-viewer'
    ) {

      return {

        base:
          './',

        plugins: [

          semarchAppModePlugin(
            'viewer'
          )
        ],

        build: {

          outDir:
            resolve(
              TEMP_BUILD_DIR,
              'server-viewer'
            ),

          emptyOutDir:
            true,

          target:
            'esnext',

          minify:
            true,

          rollupOptions: {

            input:
              resolve(
                ROOT,
                'viewer.html'
              )
          }
        }
      }
    }


    /*
     * ==========================================================
     * Server Publisher — preserved ES module graph
     * ==========================================================
     *
     * Rollup still resolves npm dependencies and assets, but it
     * does not collapse the JavaScript graph into production
     * bundles. No minification or standalone post-processing.
     * ==========================================================
     */

    if (
      mode ===
      'modules-publisher'
    ) {

      return {

        base:
          './',
        build: {

          outDir:
            resolve(
              TEMP_BUILD_DIR,
              'modules-publisher'
            ),

          emptyOutDir:
            true,

          target:
            'esnext',

          minify:
            false,

          sourcemap:
            true,

          cssCodeSplit:
            true,

          rollupOptions: {

            input:
              resolve(
                ROOT,
                'publisher.html'
              ),

            output: {

              preserveModules:
                true,

              preserveModulesRoot:
                ROOT,

              entryFileNames:
                'modules/[name].js',

              chunkFileNames:
                'modules/[name].js',

              assetFileNames:
                'assets/[name][extname]'
            }
          }
        }
      }
    }


    /*
     * ==========================================================
     * Server Viewer — preserved ES module graph
     * ==========================================================
     */

    if (
      mode ===
      'modules-viewer'
    ) {

      return {

        base:
          './',
        build: {

          outDir:
            resolve(
              TEMP_BUILD_DIR,
              'modules-viewer'
            ),

          emptyOutDir:
            true,

          target:
            'esnext',

          minify:
            false,

          sourcemap:
            true,

          cssCodeSplit:
            true,

          rollupOptions: {

            input:
              resolve(
                ROOT,
                'viewer.html'
              ),

            output: {

              preserveModules:
                true,

              preserveModulesRoot:
                ROOT,

              entryFileNames:
                'modules/[name].js',

              chunkFileNames:
                'modules/[name].js',

              assetFileNames:
                'assets/[name][extname]'
            }
          }
        }
      }
    }


    /*
     * ==========================================================
     * GitHub Pages
     * ==========================================================
     *
     * This one deliberately remains a normal Vite build.
     *
     * It therefore keeps source bundles/assets suitable for
     * GitHub Pages and additionally receives the two standalone
     * HTML files.
     * ==========================================================
     */

    if (
      mode ===
      'pages'
    ) {

      return {

        base:
          PAGES_BASE,

        plugins: [

          semarchAppModePlugin(
            'editor'
          ),

          copyStandaloneToPagesPlugin(),

          copyServerDeploymentsToPagesPlugin()
        ],

        build: {

          outDir:
            resolve(
              ROOT,
              'dist'
            ),

          emptyOutDir:
            true,

          target:
            'esnext',

          rollupOptions: {

            input: {

              editor:
                resolve(
                  ROOT,
                  'index.html'
                ),

              processViewer:
                resolve(
                  ROOT,
                  'viewer/process/index.html'
                ),

              bpmnProofViewer:
                resolve(
                  ROOT,
                  'viewer/bpmn-proof/index.html'
                )
            }
          }
        }
      }
    }


    /*
     * ==========================================================
     * Development
     * ==========================================================
     *
     * No viteSingleFile.
     * No rename.
     * No production copy.
     *
     * Normal Vite dev server + HMR.
     * ==========================================================
     */

    return {

      base:
        './',

      plugins: [

        semarchAppModePlugin(
          'editor'
        )
      ],

      build: {

        outDir:
          resolve(
            ROOT,
            'dist'
        ),

        target:
          'esnext',

        rollupOptions: {

          input:
            resolve(
              ROOT,
              'index.html'
            )
        }
      }
    }
  }
)
