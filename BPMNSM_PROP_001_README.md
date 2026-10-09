# BPMN-PROP-001 — première consolidation additive

## Installation

Depuis la racine du dépôt, extraire l'archive de livraison (sans remplacer les fichiers historiques), puis exécuter :

```bash
node --test scripts/consolidate-bpmn-native-properties.test.mjs
node scripts/consolidate-bpmn-native-properties.mjs
```

Le fichier `test/evidence/bpmn-native-properties/bpmn-native-properties-consolidated.tsv` est régénéré à partir de la matrice statique existante, des preuves runtime et des modules BPMNSM fournis.

## Portée et limites

- Les 318 déclarations de propriétés déjà présentes dans la matrice statique sont conservées, sans présumer qu'elles représentent toutes les propriétés effectives héritées.
- La détection source 15R est limitée à `bpmn:SequenceFlow.conditionExpression` et exige la présence du module et son import dans le modeleur.
- `SOURCE_VERIFIED` ne signifie pas qu'un test d'interface, un round-trip XML ou un rendu graphique a été exécuté.
- Les indices de `bpmn-js` et du provider officiel ne sont pas assimilés à des preuves d'édition.
- Les preuves runtime existantes sont corrélées uniquement sur une correspondance exacte entre type et identifiant d'entrée ; cette correspondance ne suffit pas à certifier une propriété métier.
- Le script ne modifie aucun fichier source existant ; il écrit uniquement le TSV consolidé.
- Étapes futures : générer la matrice des propriétés effectives (héritages), ajouter BPMN DI, identifier les entrées de panneau de façon sémantique et valider les round-trips.
