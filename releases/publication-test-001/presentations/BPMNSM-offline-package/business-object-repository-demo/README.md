# BPMNSM — Business Objects & Repository — présentation Reveal.js

Présentation de démonstration 5–10 minutes sur la verticale Business Object → représentation BPMN → persistance → navigation, puis ouverture vers le repository distribué.

## Fichiers

- `index.html` : source Reveal.js sérialisable et versionnable dans Git ; Reveal.js est chargé depuis CDN.
- `presentation.css` : thème BPMNSM local.
- `SCRIPT.md` : conducteur oral minuté et limites à annoncer.
- `package.json` : commande de lancement locale pratique via `npm start`.

## Installation dans le dépôt

Conserver le répertoire tel quel sous :

```text
presentations/business-object-repository-demo/
```

Aucune dépendance npm n'est nécessaire pour la présentation elle-même. Une connexion réseau est requise au lancement, car `index.html` charge Reveal.js depuis CDN.

## Lancement recommandé

Depuis `presentations/business-object-repository-demo/` :

```bash
npm start
```

Puis ouvrir :

```text
http://localhost:1948/
```

`npm start` utilise le serveur HTTP fourni par Python 3 ; il ne lance ni build ni génération de fichiers. Cela évite les restrictions que certains navigateurs appliquent aux pages ouvertes directement en `file://`.

Alternative sans npm :

```bash
python3 -m http.server 1948
```

## Présentation

- Flèches gauche/droite ou espace : navigation.
- `S` : vue présentateur avec les notes orateur intégrées aux slides (`<aside class="notes">`).
- `F` : plein écran Reveal.js.
- `Esc` : vue d'ensemble des slides.

Le contenu présenté est statique : aucune donnée du repository BPMNSM n'est modifiée par la présentation.

## Périmètre démontré

La présentation distingue explicitement les capacités démontrées de leurs perspectives. Elle ne prétend pas que le manifest distribué, `BusinessRelation`, `ActiveBusinessObject` ou l'intégration Viewer/publication des informations métier sont implémentés.

## Versionnement

Les fichiers à versionner sont directement ceux de ce répertoire. Il n'y a pas de `dist/` généré à committer pour cette version de la présentation.

## Distribution offline

Après `npm install`, exécuter `npm run build`. Les artefacts sont générés sous `../dist/` : un HTML standalone et un package ZIP offline. Le build ne modifie pas les sources de la présentation.
