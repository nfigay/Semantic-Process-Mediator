# BPMNSM --- Handover opérationnel --- 2026-09-17

## 1. Autorité et ordre de lecture

Ce document est le point d'entrée court pour reprendre BPMNSM dans un nouveau chat.

Lire ensuite, dans cet ordre :

1. `public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-17.md`
2. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
3. `public/plans/README.md`

**Le dépôt réel est l'autorité pour l'état exact du code.** Les documents de continuité capitalisent décisions et preuves ; ils ne remplacent jamais l'inspection du fichier courant avant modification.

## 2. Baseline exact au checkpoint

```text
A10 / ProjectionProfile                    [IMPLÉMENTÉ + DÉMONTRÉ]
P2.4 ActiveProfileRuntime                  [IMPLÉMENTÉ + DÉMONTRÉ]
P3 Editor multi-CoC                        [IMPLÉMENTÉ + DÉMONTRÉ]
P4.6 → P4.9 publication / Viewer           [IMPLÉMENTÉ + DÉMONTRÉ]

Business View normalisée et versionnée     [IMPLÉMENTÉ + DÉMONTRÉ]
Business View → propertyRefs               [IMPLÉMENTÉ + DÉMONTRÉ]
ActiveBusinessView                         [IMPLÉMENTÉ + DÉMONTRÉ]
Business View resolver                     [IMPLÉMENTÉ + DÉMONTRÉ]
createApp → engine → modeler relay         [IMPLÉMENTÉ + DÉMONTRÉ]
stakeholderRef → businessViewRef           [IMPLÉMENTÉ + DÉMONTRÉ]
Avionics Business View v1.0                [IMPLÉMENTÉ + DÉMONTRÉ]
CoC_Avionics → activation Business View    [IMPLÉMENTÉ + DÉMONTRÉ]
preuve UI PAF Deliverable / PAF Document   [DÉMONTRÉE]

régression globale
    59 fichiers / 267 tests / 0 échec
```

Dernière régression démontrée : **59/59 fichiers de test, 267/267 tests, 0 échec**.

Les builds Editor, Viewer et Pages étaient démontrés au checkpoint P4 ; ne prétendre à aucun build plus récent sans le réexécuter.

## 3. Chaîne Business View désormais acquise

La Business View reste indépendante du `ProfileRuntime` :

```text
ProfileRuntime
    quelles propriétés existent / sont résolubles

BusinessView
    quelles propriétés sont projetées pour une vue/stakeholder

             ↓
SemArch Property Descriptors
             ↓
Properties Panel
```

Chaîne runtime :

```text
createApp({ businessView })
        ↓
createBpmnEngine({ businessView })
        ↓
createModeler({ businessView })
        ↓
ActiveBusinessView
        ↓
SemArchPropertiesProvider
```

Activation dynamique démontrée :

```text
RepositoryContext.cocOwner
        ├──→ activateCocProfileRuntime(...)
        │       → ActiveProfileRuntime
        │
        └──→ resolveStakeholderBusinessViewRef(...)
                → businessViewRef
                → resolveBusinessView(...)
                → ActiveBusinessView.set(...)
                → propertiesPanel.providersChanged
```

Le mapping courant est explicite et séparé de `CoCConfiguration` :

```text
CoC_Avionics → avionics
```

Ne pas ajouter `businessViewRef` à `CoCConfiguration` par symétrie sans nouveau besoin démontré.

## 4. Business View Avionics démontrée

Ressource :

```text
id             avionics
version        1.0
stakeholderRef CoC_Avionics
```

Projection `PAF_Deliverable` :

```text
domain
isKID
isProcessIO
template
```

Projection `PAF_Document` :

```text
URL
domain
```

Les références stockées dans la Business View sont les `property.id` canoniques issus du schéma normalisé. Le format de projection est générique : `propertyRefs[]`. Il n'est pas séparé artificiellement en data/object attributes.

## 5. Ce que Business View ne démontre pas encore

```text
Business Object générique                         [NON IMPLÉMENTÉ]
Business Object typeRefs[] / multi-typing BO      [NON IMPLÉMENTÉ]
Object properties / relations BO génériques       [NON IMPLÉMENTÉ]
Business View persistée / ingérée par repository  [NON IMPLÉMENTÉ]
plusieurs vues par stakeholder + politique choix  [NON IMPLÉMENTÉ]
BO ↔ représentation BPMN attach/detach/reattach   [NON IMPLÉMENTÉ]
création standalone/new target/existing target    [NON IMPLÉMENTÉ]
label calculé/configurable de diagramme            [NON IMPLÉMENTÉ]
vocabulaire final remplaçant « Master »            [NON IMPLÉMENTÉ]
```

Le `SemanticType` multiple actuel est un germe utile, mais **ne doit pas être présenté comme le Business Object multi-typé cible**.

## 6. Identités et représentation à ne pas confondre

```text
Business Object identity
    ≠ semarch:stableGuid
    ≠ BPMN element id
    ≠ RepositoryComponent.id
```

Modèle mental cible actuel :

```text
Business Object
  businessObjectId
  typeRefs[] 1..n
        ↓ represented by
BPMN Representation
        ↓ 0..n lorsque BPMN le justifie
BPMN Occurrence
        ↓
state / context
```

Exemples natifs déjà utiles :

```text
PAF_Deliverable → bpmn:DataStore → bpmn:DataStoreReference(s)
PAF_Document    → bpmn:DataObject → bpmn:DataObjectReference(s)
```

Ne pas généraliser ce pattern à `Participant` ou à tout `*Ref` sans preuve BPMN précise.

## 7. Frontières publication / Viewer à préserver

```text
RepositoryEditorSync → publication
    [NON IMPLÉMENTÉ — volontairement]

Viewer → ProfileRuntime resolver
    [NON IMPLÉMENTÉ — volontairement]

Viewer → nouvelle publication/transformation
    [NON IMPLÉMENTÉ — volontairement]

PublicationConfiguration.profileRef
    [NON IMPLÉMENTÉ — NON JUSTIFIÉ]

projectionRef dans CoCConfiguration
    [NON IMPLÉMENTÉ — NON JUSTIFIÉ]
```

Les causalités restent séparées :

```text
publicationRef → PublicationConfiguration → capacités de cible
profileRef     → ProfileRuntime effectif   → Publisher BPMN
```

## 8. Invariants essentiels

- BPMN 2.0 XML est le pivot.
- Ce que BPMN exprime reste BPMN natif.
- SemArch/CoC enrichit BPMN sans le remplacer.
- Le contenu externe valide mais inconnu est préservé autant que possible.
- `UNRESOLVED ≠ INVALID`.
- Persistance source et publication dérivée restent distinctes.
- Le Viewer consomme l'artefact publié sans résoudre de profil ni republier.
- Business View et ProfileRuntime sont des responsabilités distinctes.
- `stakeholderRef` décrit le stakeholder ; il ne constitue pas à lui seul une politique de sélection lorsque plusieurs vues existent.
- Une abstraction n'est ajoutée qu'après besoin observable.

## 9. Discipline de travail obligatoire

1. Avancer par étapes atomiques.
2. Avant toute modification, récupérer la version actuelle exacte des fichiers concernés.
3. Ne jamais reconstruire un fichier courant depuis ce Handover ou la mémoire du chat.
4. Ne jamais fournir un patch comme mode normal de livraison.
5. Livrer les fichiers complets à créer/remplacer dans un ZIP conservant exactement l'arborescence du repository.
6. L'utilisateur télécharge le ZIP, le décompresse et distribue manuellement les fichiers : **ne pas donner de commande `unzip -o` d'installation**.
7. Ne pas modifier des fichiers hors périmètre pour « nettoyer ».
8. Pour une collecte macOS destinée au chat, utiliser normalement `2>&1 | pbcopy`.
9. Pour les tests, utiliser le mode non interactif et une sortie visible + copiée : `npm test -- --run ... 2>&1 | tee /dev/tty | pbcopy`.
10. Ne pas inventer de numéro de roadmap, abstraction ou état non démontré.
11. Distinguer explicitement `[IMPLÉMENTÉ + DÉMONTRÉ]`, `[DÉMONTRÉ PAR INSPECTION]` et `[NON IMPLÉMENTÉ]`.
12. Ne pas terminer une étape évidente par une question de permission : donner directement la prochaine commande atomique.
13. Français, concis, pratique ; ne pas réexpliquer l'historique sauf nécessité.
14. Après une inspection suffisante, implémenter l'incrément minimal au lieu de prolonger l'exploration.

## 10. Point de reprise produit

Le démonstrateur Avionics possède maintenant une Business View réelle et visible. La prochaine tranche ne doit pas créer une nouvelle infrastructure de configuration par symétrie.

Le besoin produit ouvert le plus structurant est de faire émerger le **Business Object** distinct de sa représentation BPMN, avec multi-typing et vues stakeholder, tout en s'appuyant sur les primitives génériques déjà démontrées (`SemanticType`, propriétés normalisées, Business View, références BPMN natives).

Avant de coder cette tranche, inspecter le code exact touché. Ne pas modifier `semarch.json`, le modèle repository ou les références BPMN sur la seule base de ce document.

## 11. Prompt minimal du nouveau chat

```text
Nous reprenons BPMNSM depuis le checkpoint du 2026-09-17.

Lis d'abord :
1. public/plans/HANDOVER_BPMNSM_2026-09-17.md
2. public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-17.md
3. public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md
4. public/plans/README.md

Le dépôt réel est l'autorité pour le code exact. Ne reconstruis jamais un fichier courant depuis les documents ou le contexte du chat.

Respecte strictement la discipline du Handover : étapes atomiques, inspection exacte avant modification, fichiers complets dans un ZIP préservant l'arborescence, pas de patch manuel, pas de commande unzip d'installation, tests avec --run, statuts de preuve explicites, aucune abstraction/numérotation inventée, et pas de question de permission lorsqu'une prochaine étape est évidente.

Baseline démontré : 59/59 fichiers de test, 267/267 tests, 0 échec.

Business View Avionics v1.0 et son activation dynamique depuis CoC_Avionics sont [IMPLÉMENTÉES + DÉMONTRÉES]. Business Object générique, multi-typing BO, object properties, persistance des Business Views et attach/detach BO↔BPMN restent [NON IMPLÉMENTÉS].

Commence par vérifier le dépôt réel et l'état Git, puis prends la plus petite tranche produit observable vers le Business Object / multi-view sans généraliser prématurément l'architecture.
```
