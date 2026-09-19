# BPMNSM --- Handover opérationnel --- 2026-09-18

## 1. Autorité et ordre de lecture

Ce document remplace `HANDOVER_BPMNSM_2026-09-17.md` comme point d'entrée court.

Lire ensuite :

1. `public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-18.md`
2. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
3. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md` pour toute reprise d'une expérience ou décision architecturale ;
4. `public/plans/README.md` ;
5. le guide explicatif et les documents de vision uniquement lorsque la question traitée l'exige.

Le repository réel reste l'autorité pour le code exact. Les documents de continuité décrivent l'état démontré et les invariants ; ils ne remplacent jamais l'inspection du code.

## 2. Checkpoint démontré

Au 2026-09-18, le vertical Business Object et la chaîne de distribution ont franchi un nouveau seuil.

```text
BusinessObject                              [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObject.typeRefs[] 1..n             [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectStore                         [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectRepresentation                [IMPLÉMENTÉ + DÉMONTRÉ]
attach / detach                             [IMPLÉMENTÉ + DÉMONTRÉ]
création interactive BusinessObject         [IMPLÉMENTÉ + DÉMONTRÉ]
Properties Panel attach/detach              [IMPLÉMENTÉ + DÉMONTRÉ]
refresh immédiat après detach               [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObject → XML repository             [IMPLÉMENTÉ + DÉMONTRÉ]
XML repository → BusinessObjectStore        [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectRepresentation → XML          [IMPLÉMENTÉ + DÉMONTRÉ]
XML → RepresentationStore                   [IMPLÉMENTÉ + DÉMONTRÉ]
BO↔representation après réouverture         [IMPLÉMENTÉ + DÉMONTRÉ]
Business Objects browser/menu               [IMPLÉMENTÉ + DÉMONTRÉ]
BO → représentation/processus visible       [IMPLÉMENTÉ + DÉMONTRÉ]
régression globale 67 fichiers / 305 tests  [IMPLÉMENTÉ + DÉMONTRÉ]
```

Le démonstrateur réel a couvert création d'un BO, attachement à une représentation BPMN, visualisation, sérialisation, réouverture et restauration du lien sans réattachement manuel.

## 3. Contrat Business Object actuellement démontré

Le modèle minimal courant est :

```text
BusinessObject
    id
    typeRefs[] 1..n

BusinessObjectRepresentation
    businessObjectId
    representationId
```

L'identité reste strictement séparée :

```text
BusinessObject.id
    ≠ semarch:stableGuid
    ≠ BPMN element id
    ≠ RepositoryComponent.id
```

Le store de représentations accepte qu'un BO possède plusieurs représentations. Ne pas inventer de contrainte inverse globale sur `representationId`.

Pour DataStore/DataObject, les relations BPMN natives master/référence restent utilisées lorsque BPMN les fournit.

## 4. Persistance actuelle et portée

Le repository BPMNSM courant est sérialisé en BPMN XML.

Convention démontrée :

```xml
<semarch:BusinessObject id="...">
  <semarch:BusinessObjectType typeRef="..." />
</semarch:BusinessObject>
```

Les liens BO ↔ représentation sont eux aussi persistés et reprojetés lors de l'ouverture du repository.

Cette solution est le support canonique du démonstrateur courant. Elle ne tranche pas encore l'architecture finale d'un repository distribué composé de plusieurs fichiers BPMN et d'informations métier complémentaires.

## 5. Business View reste une responsabilité distincte

```text
ProfileRuntime
    quelles propriétés existent / se résolvent

BusinessView
    quelles propriétés sont projetées pour une vue/stakeholder
```

Invariant impératif :

```text
BusinessView = null
```

signifie absence de filtrage Business View. Cela ne signifie jamais « masquer les propriétés Avionics ». Les propriétés disponibles restent déterminées par le `ProfileRuntime` actif.

La Business View Avionics v1.0 et son activation par `CoC_Avionics` restent démontrées.

## 6. Distribution et publication désormais démontrées de bout en bout

Le correctif Viewer `Repository → Open BPMN…` est démontré en dev, standalone et sur le Viewer public.

Le Viewer n'injecte pas artificiellement `ActiveProfileRuntime`. Le lookup utilisé au démarrage Viewer est optionnel (`modeler.get('activeProfileRuntime', false)`), ce qui respecte la frontière de publication existante.

Le pipeline standalone a été durci afin que chaque build publie immédiatement son artefact vers `dist/standalone` :

```text
build:viewer
  → .semarch-build/viewer/coc-bpmn-viewer.html
  → dist/standalone/coc-bpmn-viewer.html

build:editor
  → .semarch-build/editor/coc-bpmn-editor.html
  → dist/standalone/coc-bpmn-editor.html
```

Cela supprime le risque démontré d'utiliser un standalone périmé lors de `build:presentations`.

État démontré :

```text
build:viewer → dist/standalone            [IMPLÉMENTÉ + DÉMONTRÉ]
build:editor → dist/standalone            [IMPLÉMENTÉ + DÉMONTRÉ]
pipeline standalone anti-stale            [IMPLÉMENTÉ + DÉMONTRÉ]
package offline BPMNSM                    [IMPLÉMENTÉ + DÉMONTRÉ]
pipeline npm run build complet            [IMPLÉMENTÉ + DÉMONTRÉ]
publication GitHub Pages                  [IMPLÉMENTÉ + DÉMONTRÉ]
Viewer public : Open BPMN                 [IMPLÉMENTÉ + DÉMONTRÉ]
```

Les avertissements CSS `@import`, `eval` provenant d'`archimate-js` et taille de chunk sont connus et non bloquants au checkpoint.

## 7. Livrables publics démontrés

```text
/standalone/coc-bpmn-viewer.html
/standalone/coc-bpmn-editor.html
/presentations/
/presentations/business-object-repository-demo/
/presentations/BPMNSM-offline-package.zip
```

Le package offline regroupe Viewer, Editor et présentation Reveal.js.

## 8. Frontières encore ouvertes

```text
ActiveBusinessObject                        [NON IMPLÉMENTÉ]
caractérisation BPMN du contenu métier      [NON IMPLÉMENTÉ]
BusinessRelation                            [NON IMPLÉMENTÉ]
Business Object sans représentation BPMN    [NON IMPLÉMENTÉ]
repository distribué / manifest             [NON IMPLÉMENTÉ]
navigation Business Object dans Viewer      [NON IMPLÉMENTÉ]
relations métier inter-modèles              [NON IMPLÉMENTÉ]
```

Ne pas transformer ces directions en décisions de métamodèle sans besoin produit observable et inspection du code réel.

## 9. Impact architectural du checkpoint

Le vertical démontre désormais que l'identité métier peut être séparée de l'identité BPMN tout en restant reliée à une représentation BPMN persistante.

La prochaine question structurante n'est donc plus « peut-on représenter un Business Object ? ». Elle devient :

```text
quelles informations métier doivent rester dans un BPMN canonique,
et quelles informations exigent un niveau repository complémentaire
lorsque :
- un BO n'a aucune représentation BPMN ;
- un BO traverse plusieurs fichiers BPMN ;
- une BusinessRelation traverse plusieurs modèles ;
- plusieurs représentations doivent être contextualisées ensemble ?
```

Hypothèse de travail à instruire, non implémentée :

```text
Repository BPMNSM
├── contextualisation / intégration
├── plusieurs fichiers .bpmn
└── données métier complémentaires uniquement lorsque BPMN
    ne peut pas porter correctement l'information
```

Ne pas introduire de manifest avant qu'un vertical observable l'exige.

## 10. Point de reprise produit

Reprendre par la plus petite tranche observable qui force une décision au-delà du vertical courant.

Priorité d'analyse : **Business Object sans représentation BPMN / relation métier ou navigation business**, afin de déterminer par l'expérience où doit vivre l'information qui n'est pas naturellement une représentation BPMN.

Avant toute modification :
- inspecter les fichiers exacts ;
- réutiliser les stores/actions déjà démontrés ;
- ne pas refondre `semarch.json` ou le RepositoryModel par symétrie ;
- préserver les frontières Viewer/publication.

## 11. Discipline de travail obligatoire

- aucune commande Git destructive ;
- étapes atomiques ;
- commandes affichant leur sortie et la copiant avec `2>&1 | tee /dev/tty | pbcopy` ;
- archives d'inspection utilisateur sous `~/Downloads`, jamais `/tmp` ;
- corrections livrées par ZIP avec fichiers complets et arborescence repository ;
- tests via `npm test -- --run ...` ;
- statuts exclusivement :
  - `[IMPLÉMENTÉ + DÉMONTRÉ]`
  - `[DÉMONTRÉ PAR INSPECTION]`
  - `[NON IMPLÉMENTÉ]`
- ne jamais reconstruire du code exact depuis les documents de continuité.
