// main.js
import cytoscape from 'cytoscape'
import * as d3 from 'd3'
import i18next from 'i18next'
import { w2layout, w2popup } from 'w2ui/w2ui-2.0.es6.js'
import 'w2ui/w2ui-2.0.min.css'

// Initialisation i18next
i18next.init({
  lng: 'fr',
  resources: {
    fr: { translation: { welcome: 'Bienvenue' } }
  }
})