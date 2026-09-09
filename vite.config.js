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
        /mode\s*:\s*['"](?:editor|viewer)['"]/


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
          `/${REPOSITORY_NAME}/`,

        plugins: [

          semarchAppModePlugin(
            'editor'
          ),

          copyStandaloneToPagesPlugin()
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