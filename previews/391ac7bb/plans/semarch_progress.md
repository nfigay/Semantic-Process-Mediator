# SemArch — journal de travail avec ChatGPT

> **Nature du document.** Ce fichier est une reconstitution structurée et détaillée de l’échange disponible dans la session de travail, destinée à analyser notre manière de travailler. Ce n’est pas un export verbatim garanti de l’interface ChatGPT : je n’ai pas accès à une fonction d’export intégral de l’historique UI. Pour un verbatim juridiquement/exhaustivement fidèle, il faut compléter ce document avec l’export natif de la conversation depuis ChatGPT.

## 1. Objectif initial et vision produit

Le travail porte sur **SemArch**, un démonstrateur de repository/editor BPMN modulaire construit autour de **bpmn.io / bpmn-js**, **w2ui**, **Vite** et **Git**.

La cible n’est pas « un autre outil BPMN », mais un environnement où des Centres de Compétence (CoC) peuvent :

- produire des ensembles cohérents de processus et collaborations BPMN ;
- restreindre l’usage de BPMN selon une méthode de modélisation ;
- gérer des métadonnées contrôlées et des formulaires ;
- sérialiser les extensions nécessaires dans BPMN 2.0 ;
- construire des vues d’intégration par CoC et multi-CoC ;
- importer/exporter un repository sous Git ;
- préparer l’interopérabilité avec Sparx Enterprise Architect, ARIS et d’autres plateformes ;
- exécuter des règles proches du langage métier/méthodologique via bpmnlint et les mécanismes natifs bpmn-js.

Principe directeur retenu :

> Le guideline explique la méthode. Le code exécute la méthode. Les IDs assurent la traçabilité.

## 2. Manière de travailler convenue

Le développement est conduit par petites étapes testables.

Règles de collaboration établies :

1. annoncer à chaque étape les fichiers à créer, modifier et ne pas toucher ;
2. expliquer le but avant le code ;
3. fournir le **fichier complet** lorsqu’un fichier est modifié — pas de patch partiel ;
4. rappeler à chaque fois les commandes terminal complètes, notamment `npm run dev` ;
5. préciser le test exact et le résultat attendu ;
6. ne pas anticiper plusieurs étapes à la fois ;
7. privilégier les patterns natifs bpmn.io/w2ui plutôt qu’un méta-framework maison ;
8. ne pas inférer une sémantique BPMN depuis la géométrie ;
9. demander le fichier courant lorsqu’il n’est pas connu avec certitude ;
10. privilégier VS Code pour les recherches/modifications et le terminal pour les builds/tests.

Un point de friction a été identifié : les liens de téléchargement de fichiers générés n’étaient pas fiables dans l’environnement de travail. Nous avons donc privilégié le passage des fichiers complets dans le chat.

## 3. Architecture conceptuelle consolidée

La distinction centrale est devenue :

> **MODEL = ce qui existe.**  
> **CONTEXT = dans quelle interaction / participation cet élément est utilisé.**  
> **VIEW = quelle partie du Model + Context est représentée graphiquement.**

Et, côté UI :

> **Selection = état temporaire SemArch, non sérialisé.**

Correspondances BPMN :

- `bpmn:Process` → objet sémantique Process ;
- `bpmn:Collaboration` → objet sémantique Collaboration ;
- `bpmn:Participant` → contexte / pool ;
- `Participant.processRef` → référence vers un Process ;
- Lane/LaneSet → partition d’un Process, pas un Process supplémentaire ;
- `BPMNDiagram` / BPMN-DI → View graphique.

Conséquences :

- un Process peut être réutilisé dans plusieurs Collaborations ;
- un Participant sans `processRef` est réellement black-box ;
- un Participant avec `processRef` peut être représenté de manière opaque ou white-box selon le diagramme ;
- une vue peut être une projection composée de Collaboration + Participants + Process + Lanes + FlowNodes + MessageFlows ;
- le Repository navigue les concepts ; le canvas montre leurs représentations BPMN-DI.

## 4. Repository : concepts retenus

Le CoC est traité comme un conteneur d’information de premier rang, sans être assimilé automatiquement à un dossier ou un diagramme.

Distinction retenue :

- métadonnées intrinsèques du Process/Collaboration → avec le modèle ;
- métadonnées du CoC → avec le conteneur ;
- informations sur « Process A utilisé dans CoC Avionics » → métadonnées extrinsèques sur une référence réifiée.

Une référence Repository est un objet indépendant avec :

- `id` ;
- `sourceId` ;
- `targetId` ;
- `type` ;
- `role` ;
- `metadata`.

Les références non résolues sont considérées comme normales et doivent rester visibles.

## 5. Forme canonique et interopérabilité

Forme canonique visée : **BPMN 2.0 XML**, enrichi uniquement lorsque nécessaire par des `extensionElements` SemArch normalisés.

Règle :

- si BPMN sait exprimer la relation, utiliser BPMN natif ;
- utiliser SemArch extensionElements uniquement pour ce que BPMN ne sait pas exprimer proprement.

L’adaptation EA/ARIS reste aux frontières via des adapters.

Classification d’interopérabilité retenue :

- PRESERVED ;
- MAPPED ;
- DEGRADED ;
- LOST.

Les champs Notes/Description EA sont vus comme une projection d’interopérabilité, pas comme la forme canonique.

## 6. Trois surfaces produit

Architecture cible :

1. **Process Viewer** — publication standalone/embedded ;
2. **Repository Viewer** — navigation complète en lecture seule, propriétés, lint, review, intégration ;
3. **Repository Editor** — Viewer + authoring.

API cible déjà mise en place autour de :

`createApp({ mode: 'viewer' | 'editor' })`

Le Viewer utilise `BpmnNavigatedViewer`, l’Editor `BpmnModeler`.

## 7. Linting et méthode exécutable

Le lint live a été mis en place avec `bpmn-js-bpmnlint` / `bpmnlint`.

Configuration utilisée :

- `label-required`: warn ;
- `semarch/named-element`: info ;
- `semarch/stable-id`: warn.

Le lint est vu comme filet normatif, particulièrement important pour les modèles importés. Les contraintes UI assistent l’auteur mais ne remplacent pas la validation.

## 8. Repository Context / Method Configuration

Un `RepositoryContext` et une `MethodConfiguration` SemArch au niveau `definitions` ont été mis en place et testés.

Profils utilisés notamment :

- `semarch-core` ;
- `avionics-standard`.

États de validation :

- NOT_VALIDATED ;
- CURRENT ;
- OUTDATED.

Le round-trip XML et la dérive de version ont été testés.

## 9. Identité : trois niveaux clairement séparés

La collision volontaire de BPMN IDs entre documents a conduit à formaliser :

1. **runtime Repository ID** : ex. `imported-2::Process_A` — temporaire et session/document-scoped ;
2. **BPMN XML ID** : ex. `Process_A` — local au document ;
3. **SemArch stableGuid** : UUID persistant, canonique, indépendant de la plateforme.

Règles :

- ne jamais renommer les BPMN IDs pour résoudre une collision inter-document ;
- ne jamais sérialiser le runtime ID comme identité persistante ;
- ne jamais supposer `EA GUID = SemArch GUID = ARIS ID` avant essais réels.

`stableGuid` a été ajouté à `semarch:Meta` et son round-trip XML a été validé.

Politique d’identité :

- création native SemArch → génération stableGuid ;
- import avec stableGuid → conservation ;
- import sans stableGuid → rester `null` tant que la résolution d’identité externe n’a pas eu lieu ;
- Viewer → aucune génération/mutation d’identité.

La génération automatique a été testée pour Process/Collaboration/Participant dans les chemins de création couverts.

## 10. Platform Adapter Registry

Une architecture d’adapters a été introduite :

SemArch canonical model → Platform Adapter Registry → EA / ARIS / futurs outils.

Un adapter Sparx EA minimal a été créé et testé pour la normalisation/formattage de GUID.

L’identité ARIS reste volontairement non affirmée tant que les comportements réels n’ont pas été testés.

## 11. Synchronisation Editor ↔ Repository

La synchronisation automatique du Repository avec les commandes d’édition BPMN a été mise en place.

Tests validés :

- création d’un pool → nouveaux composants Repository ;
- suppression → projection mise à jour ;
- Undo / Redo → projection cohérente ;
- une référence runtime indépendante survit aux reconstructions de projection BPMN.

Les références issues de BPMN sont marquées par metadata de projection (`projection: 'bpmn'`, `documentId`) afin de ne supprimer que ce qui appartient à cette projection.

## 12. Participant / Process / black-box

Le Repository enregistre les Participants comme composants runtime distincts.

Relations :

- Collaboration → Participant ;
- Participant → Process via `processRef` uniquement si le `processRef` existe.

Test black-box validé :

- Participant sans processRef ;
- aucun Process inventé ;
- clic Repository sélectionne bien le `bpmn:Participant` ;
- `processRef === undefined`.

## 13. White-box et opaque : distinction validée expérimentalement

Une représentation contextuelle d’un Participant avec Process peut être :

- **opaque** : le Process existe via `processRef`, mais aucun de ses éléments internes n’est représenté dans cette vue de Collaboration ;
- **white-box** : certains éléments internes du Process sont représentés dans la vue.

Cette propriété est dérivée de la sémantique BPMN + BPMN-DI, sans analyse géométrique.

Test white-box validé avec détection de Lanes, FlowNodes et SequenceFlows.

Test opaque validé sur des Collaborations ne représentant que les Participants.

Règle importante :

- `blackBox` = état sémantique du Participant, absence de `processRef` ;
- `opaque/white-box` = propriété d’une représentation contextuelle dans un BPMNDiagram donné.

## 14. Plusieurs BPMNDiagram pour un même sujet sémantique

Un test décisif a été construit avec deux `BPMNDiagram` ayant le même :

`BPMNPlane.bpmnElement = Collaboration_1`

mais des géométries différentes.

Résultat : `modeler.open(exactDiagram)` permet bien d’ouvrir successivement les deux vues exactes.

Cela confirme :

> l’identité de la racine sémantique ne suffit pas à identifier une View.

Politique de navigation retenue :

- 0 vue → pas de diagramme ;
- 1 vue → ouverture automatique ;
- N vues → choix explicite ;
- vue explicitement désignée → ouverture exacte par `diagramId`.

## 15. BpmnViewIndex

Un index runtime BPMN-DI a été introduit avec :

- `getViews()` ;
- `getView(diagramId)` ;
- `getViewsForSubject(bpmnElementId)` ;
- `getSubjects()`.

Test validé : un sujet `Collaboration_1` expose deux vues distinctes A/B.

## 16. Import ≠ navigation Repository

Un comportement parasite a été supprimé : après import, SemArch ne sélectionne plus arbitrairement le premier composant Repository.

Règle :

> **Importer un document n’est pas naviguer vers un objet du Repository.**

Le document importé est déjà chargé ; la navigation Repository doit rester une action utilisateur explicite.

## 17. Diagram Browser

Un navigateur distinct a été décidé puis introduit.

Il ne liste pas tous les éléments représentés dans un diagramme. Il liste les **BPMNDiagram regroupés par leur sujet principal `BPMNPlane.bpmnElement`**.

Exemple :

```text
Diagram Browser

Shared Collaboration
├─ Collaboration View A
└─ Collaboration View B
```

Le BPMNDiagram ne devient pas pour autant un Repository Component.

Distinction UI :

- Repository Browser → Model + Context ;
- Diagram Browser → Views BPMN-DI.

Le Diagram Browser a été rendu cliquable. Les tests ont confirmé que A et B ouvrent réellement les deux géométries différentes, donc l’ouverture se fait bien par `diagramId` exact.

## 18. Propriétés d’un Diagram

Observation utilisateur importante : après sélection d’un Diagram, le panneau Properties ne changeait pas.

Cette observation a conduit à affiner le modèle :

> Un `BPMNDiagram` est lui-même une cible de propriétés. Son sujet Process/Collaboration est une relation de la View, pas un substitut de la View.

Comportement visé :

- clic Diagram Browser → ouvrir la vue exacte + afficher les propriétés du BPMNDiagram ;
- clic élément canvas → propriétés de l’objet BPMN sélectionné ;
- synchronisation future du sujet Repository sans écraser la cible Properties du Diagram.

Une première étape read-only du `diagram-properties-panel` a été proposée pour afficher notamment :

- type ;
- ID ;
- name ;
- resolution ;
- BPMNPlane ;
- sujet principal du plane.

## 19. Extraits de diagnostic

Quatre extracts permanents ont été mis en place :

- UI Tree ;
- Repository Graph ;
- BPMN Model ;
- BPMN Views.

Ils sont observateurs uniquement.

Radiographie synthétique :

- BPMN Model — **EXISTE** ;
- Repository Graph — **RELIE** ;
- UI Tree — **NAVIGUE** ;
- BPMN Views — **MONTRE**.

## 20. Priorités et roadmap

Roadmap de référence :

- D0 — Build / Pages : acquis ;
- D1 — Process Viewer : acquis / alignement ;
- D2 — Repository Viewer : en cours, fortement avancé ;
- D3 — Method Review ;
- D4 — Repository Editor ;
- D5 — Forms + canonical BPMN ;
- D6 — EA round-trip ;
- D7 — full multi-CoC ;
- D8 — integration / assembly ;
- D9 — ARIS / distributed ownership.

## 21. Ce qui est démontré à ce stade

Les résultats les plus structurants sont moins les écrans que les invariants validés :

1. Viewer et Editor peuvent partager le même cœur applicatif.
2. BPMN reste le pivot sémantique canonique.
3. Repository, BPMN Model, UI Tree et BPMN-DI sont des structures différentes.
4. Process, Participant, Collaboration et Lane ne sont pas confondus.
5. Un Process peut être partagé entre plusieurs contextes.
6. Black-box, opaque et white-box sont distingués proprement.
7. Plusieurs BPMNDiagram peuvent représenter le même sujet sémantique.
8. La navigation peut cibler le BPMNDiagram exact.
9. Les identités runtime, BPMN et stables sont séparées.
10. Les projections Repository peuvent être reconstruites sans détruire les références indépendantes.
11. La méthode est progressivement exécutable via lint, contraintes UI et métadonnées.
12. L’architecture reste ouverte à EA, ARIS et d’autres plateformes sans polluer le cœur canonique.

## 22. Analyse de la méthode de collaboration

### Ce qui fonctionne bien

- Les expériences white-box/opaque/multi-view ont permis de décider sur des faits plutôt que sur des hypothèses.
- Les petites étapes avec tests explicites limitent les régressions.
- La séparation « Model / Context / View » fournit un vocabulaire stable pour arbitrer les choix.
- Le refus de créer prématurément un DSL SemArch évite de dupliquer les capacités natives de bpmn.io.
- Les fichiers complets réduisent le risque de collage incorrect dans VS Code.

### Points de vigilance observés

- Lorsque le fichier courant n’est pas disponible, une proposition de fichier complet peut diverger du code réellement appliqué.
- Les changements touchant `create-app.js` sont coûteux car le fichier est devenu long ; il faudra probablement extraire progressivement des responsabilités cohérentes, sans créer un framework artificiel.
- Les sélections Repository, Diagram et Canvas deviennent trois états distincts ; il faut éviter un « global selection manager » prématuré tout en clarifiant qui pilote Properties.
- Les tests EA/ARIS réels restent nécessaires avant de figer la stratégie d’identité externe et de round-trip.

## 23. Pause de présentation — 9 septembre 2026

À ce point, le développement est mis en pause pour préparer une présentation des progrès.

Travaux de préparation demandés :

1. sauvegarder/reconstituer l’échange en Markdown pour analyser la méthode de travail ;
2. mettre à jour la présentation PowerPoint du démonstrateur : pourquoi, valeur, faits, reste à faire, adhérence aux priorités ;
3. mettre à jour Vite pour produire avec une commande :
   - un Viewer standalone HTML ;
   - un Editor standalone HTML ;
   - la production GitHub Pages ;
   - les deux standalone également publiés sous GitHub Pages.

Repository cible : `nfigay/Semantic-Process-Mediator`.


## 24. Checkpoint Business Object / Repository / distribution --- 18 septembre 2026

Depuis le journal initial, le démonstrateur a franchi un vertical complet Business Object.

État démontré :

```text
BusinessObject + typeRefs[]                 [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectStore                         [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectRepresentation                [IMPLÉMENTÉ + DÉMONTRÉ]
attach/detach via Properties Panel          [IMPLÉMENTÉ + DÉMONTRÉ]
persistance BO et représentation            [IMPLÉMENTÉ + DÉMONTRÉ]
restauration après réouverture              [IMPLÉMENTÉ + DÉMONTRÉ]
Business Objects browser                    [IMPLÉMENTÉ + DÉMONTRÉ]
67 fichiers / 305 tests / 0 échec           [IMPLÉMENTÉ + DÉMONTRÉ]
```

La présentation Reveal.js, le Viewer et l'Editor single-file ainsi qu'un package offline complet sont intégrés au pipeline de build et publiés sur GitHub Pages.

Un défaut de `Repository → Open BPMN…` spécifique au Viewer standalone a conduit à deux corrections structurantes :
1. conserver `ActiveProfileRuntime` optionnel dans le Viewer plutôt que de l'y injecter ;
2. publier immédiatement chaque standalone fraîchement construit dans `dist/standalone`, afin que le package offline ne puisse plus consommer normalement un artefact périmé.

La chaîne source → build → dist → package offline → GitHub Pages → runtime Viewer public a été démontrée.

Le prochain sujet structurant est la frontière du repository : BO sans représentation BPMN, BusinessRelation, multi-BPMN et contextualisation distribuée restent non implémentés. Ils doivent être instruits par un vertical observable avant création d'un manifest ou d'un métamodèle générique.
