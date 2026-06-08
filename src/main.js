import cytoscape from 'cytoscape'
import * as d3 from 'd3'
import i18next from 'i18next'
import { w2layout } from 'w2ui/w2ui-2.0.es6.js'
import 'w2ui/w2ui-2.0.min.css'

i18next.init({
  lng: 'fr',
  resources: {
    fr: {
      translation: {
        welcome: 'Bienvenue'
      }
    }
  }
}).then(() => {
  document.getElementById('app').innerHTML = `
    <h1>test: ${i18next.t('welcome')}</h1>
  `
})