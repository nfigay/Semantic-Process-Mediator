# BPMNSM — Handover opérationnel — 2026-09-20

## 0. Autorité de ce checkpoint

Ce document est le point d'entrée court pour reprendre BPMNSM au checkpoint
du 20 septembre 2026. Il est dérivé du handover du 19 septembre, dont le
contenu historique utile est conservé ci-dessous.

Ordre de lecture pour une nouvelle conversation :

1. `public/plans/HANDOVER_BPMNSM_2026-09-20.md` ;
2. `public/plans/NEXT_CHAT_PROMPT_BPMNSM_2026-09-20.md` ;
3. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` ;
4. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md` ;
5. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
   avant toute nouvelle expérimentation.

### Checkpoint exact

```text
branch                              main
HEAD                                be5f6b355a3da39dc1b51591a5ccdd7000ec9633
HEAD subject                        feat(model): add autonomous business relations
index                               vide au dernier contrôle
worktree                            non propre ; changements sans rapport à préserver
git diff --check                    silencieux au dernier contrôle
```

Ne jamais nettoyer, resetter, stager globalement ou réécrire ce worktree.

### Decision gate Business Model

- E14 autoritaire : **[IMPLÉMENTÉ + DÉMONTRÉ]**.
- E15 autoritaire : **[NON IMPLÉMENTÉ]** ; E15-01/02/03 démontrent seulement
  la comparaison architecturale contrôlée. La preuve manquante reste un
  **cas produit réel**.
- E16 autoritaire : **[IMPLÉMENTÉ + DÉMONTRÉ]** quant à la nécessité ;
  E16-01/02 conservent la preuve de faisabilité technique BO -> BO + BR et
  de round-trip, désormais complétée par le cas produit irréductible
  `Path --aggregation--> Application`.
- E17-01 : parqué ; ne pas poursuivre E17 avant la prochaine décision
  explicite sur la séquence expérimentale.

Le fixture `Aircraft --hasEngine--> Engine` reste un fixture architectural de
test, pas une exigence métier. Le cas produit désormais démontré est
`Path --aggregation--> Application` : la composition d'un `Path` par les
`Application` impliquées est un fait métier autonome, non une topologie BPMN,
une contextualisation BO × CoC ou une relation dérivée.

### Collision historique de numérotation

Le commit HEAD et la preuve runtime/persistance `BusinessRelation` ont été
désignés E14/E15 avant récupération du registre Business Model autoritaire.
Conserver leurs preuves, mais ne jamais réutiliser ces anciens identifiants
comme statuts E14/E15 autoritaires.

### Prochaine question autoritaire

Le decision gate E16 est désormais résolu par un cas produit réel ; ne pas
étendre `BusinessRelation` par inertie et ne pas transformer E14–E19 en
micro-workflow bloquant. Le démonstrateur vertical peut poursuivre
l'inspection du lien `Application` / `DataStore` puis de la sémantique
`use` / `serve`, en réutilisant les mécanismes BPMN et SemArch existants
avant toute nouvelle abstraction.

### Invariants de travail

Réutiliser le précédent BPMNSM avant toute nouvelle méthode. Respecter les
frontières source / test / round-trip / build / bundle / runtime. Une
insuffisance de preuve n'autorise pas une nouvelle infrastructure.

Les modifications sont livrées par ZIP complet depuis les fichiers exacts du
worktree. Ne pas demander à l'utilisateur de modifier manuellement du code.
Aucun commit, push, tag, release, staging global ou suppression sans
autorisation explicite.

---

## Historique consolidé issu du handover 2026-09-19

## 1. Autorité et ordre de lecture

Le repository réel reste l'autorité pour le code exact. Ne jamais reconstruire un fichier de code depuis ce handover.

Ordre de reprise :

1. `public/plans/HANDOVER_BPMNSM_2026-09-19.md` ;
2. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md` ;
3. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` ;
4. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md` ;
5. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_GUIDE.md` ;
6. `public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-17.md` pour le contexte historique détaillé ;
7. `public/plans/BPMNSM_PROCESS_INTEROPERABILITY_VISION.md` pour la vision.

## 2. Checkpoint Git exact avant changement de discussion

```text
branch                              main
HEAD                                be5f6b355a3da39dc1b51591a5ccdd7000ec9633
HEAD subject                        feat(model): add autonomous business relations
prototype BusinessRelation modèle/store      commit au HEAD
preuve runtime/persistance BusinessRelation   [IMPLÉMENTÉ + DÉMONTRÉ] dans son périmètre technique, worktree non commitée
index                               vide au dernier contrôle documentaire
publication de E14                  [NON IMPLÉMENTÉ]
```

La baseline technique `HEAD + index91` a été reconstruite dans un environnement frais et a passé `npm ci`, application du patch `archimate-js`, régression, build complet, contrôle des cinq artefacts attendus, régression post-build et `git diff --cached --check`.

Frontière normalisée démontrée :

```text
patches/archimate-js+0.0.4.patch
sha256 e4b750591d3dfbf8ac0c81bff07429e97c3edfadd9167f276eb2426efd1d2445

src/properties/business-object-contextual-properties.js
sha256 a85df4c0cce6b71103b6bffe867a8cb3ff589cd309e293f30547c47a1f42e8df
```

Ne pas refaire l'histoire en commits artificiellement atomiques. Ce checkpoint de baseline a depuis été consolidé et publié ; il reste une preuve historique distincte du HEAD courant et des changements E15 non commités.

## 3. État Business Model

E11, E12 et E13 sont fermées dans leurs limites documentées. Le HEAD `be5f6b355a3da39dc1b51591a5ccdd7000ec9633` contient le prototype autonome `BusinessRelation` et son store ; ce commit est antérieur à la récupération de la numérotation autoritaire E14–E16 et ne doit pas être assimilé à l'E14 autoritaire. La preuve runtime/persistance `BusinessRelation` ultérieure est `[IMPLÉMENTÉ + DÉMONTRÉ]` dans son périmètre technique et reste non commitée. Le statut autoritaire E14–E16 est donné par le decision gate ci-dessous.

Ne pas modifier le registre E1–E20 pour enregistrer des décisions de CI/Pages/Git qui ne changent pas le résultat d'une expérience Business Model.

Invariants majeurs à préserver :

```text
BusinessObject.id
  ≠ semarch:stableGuid
  ≠ BPMN element id
  ≠ RepositoryComponent.id

BusinessObject + CoC → contextualisation logique
BusinessObject → 0..n BusinessObjectRepresentation → BPMN element
```

La représentation BPMN reste orthogonale à la contextualisation. Le prototype `BusinessRelation` commit au HEAD est distinct de la contextualisation et de `BusinessObjectRepresentation`; son existence technique ne constitue pas une décision d'adoption au titre d'E16. Ne pas créer prématurément `BusinessObjectViewpoint` ni un artefact repository complémentaire.

## 4. Décisions de publication prises le 2026-09-19

Séparer la version de BPMNSM de la version du repository de ressources :

```text
BPMNSM deployment × resource repository × repository revision
```

Le repository distant visé est un repository Git de fichiers représentant les processus intégrés et ressources associées justifiées ; ce n'est pas une base de données distante commune.

Deux modes d'édition restent possibles : workspace local avec Git externe, ou interaction distante via API de forge. GitHub est le premier provider visé ; préserver une frontière permettant GitLab sans prétendre que leurs API sont identiques.

Cible Pages : releases officielles conservées et immuables, `latest`, previews de développement et distributions personnalisées si nécessaire. Plusieurs versions doivent pouvoir être lancées simultanément. L'isolation de l'état navigateur doit être inspectée et démontrée avant conception détaillée.

La baseline consolidée a été publiée et validée par CI avant E14. Cette preuve ne signifie pas que l'architecture Pages multi-version cible existe : `/releases` et `/latest` restent absents au checkpoint documenté, et les previews historiques restent des preuves historiques distinctes.

## 5. CI et publication : frontière franchie avant E14

La frontière baseline / CI / publication a été franchie avant E14.

Checkpoint de preuve conservé :

```text
baseline publiée sur origin/main    313d5d554fc2681f44122ea7c40efa38c22dff95
GitHub Actions                      run 35465425073, succès
publication gh-pages                c6697a5467c05b51182f3a9e54f7853ebec62323
Pages root / runbook / previews     HTTP 200 au contrôle documenté
/releases et /latest                absents au contrôle documenté
```

Cette preuve ferme la frontière minimale qui précédait la reprise fonctionnelle ; elle ne démontre pas l'architecture Pages multi-version cible.

Ordre courant :

```text
prototype BusinessRelation modèle/store commit au HEAD
→ preuve runtime/persistance BusinessRelation démontrée dans son périmètre technique
→ registre autoritaire récupéré et decision gate E14–E16 capitalisé
→ E14 autoritaire fermé ; E15 reste ouvert ; E16 est depuis fermé par le cas produit `Path --aggregation--> Application`
```

## 6. Réutilisation multi-projets

ArchiCG et StandardisationRadarChart peuvent plus tard partager des composants ou patterns avec BPMNSM. Ne pas lancer maintenant un chantier monorepo, packages communs ou architecture transverse.

Règle : éviter le couplage BPMNSM inutile pour une capacité manifestement générique, mais n'extraire un composant partagé qu'après démonstration d'au moins un autre besoin concret compatible.

## 7. Discipline obligatoire

- repository réel autorité du code exact ;
- inspection avant modification ;
- aucune commande Git destructive ;
- étapes atomiques ;
- ne pas commit/push sans demande explicite ;
- archives d'inspection utilisateur sous `~/Downloads` ;
- modifications livrées en ZIP avec fichiers complets et arborescence repository ;
- commandes zsh compatibles, sans variable `path`, sans commentaires `#` dans les blocs à coller ;
- commandes de preuve avec `2>&1 | tee /dev/tty | pbcopy` ;
- tests via `npm test -- --run ...` ;
- statuts exclusivement `[IMPLÉMENTÉ + DÉMONTRÉ]`, `[DÉMONTRÉ PAR INSPECTION]`, `[NON IMPLÉMENTÉ]` ;
- préserver les checkpoints historiques ;
- ne pas inventer de nouveaux identifiants d'exigence ou d'expérience sans autorité du repository.

## 8. Point de reprise exact

Le HEAD `be5f6b355a3da39dc1b51591a5ccdd7000ec9633` contient le prototype `BusinessRelation` modèle/store. La preuve runtime/persistance `BusinessRelation` est `[IMPLÉMENTÉ + DÉMONTRÉ]` dans son périmètre technique et reste non commitée. Ces éléments sont antérieurs à la récupération du registre et ne doivent pas être renommés E14/E15 autoritaires.

La preuve technique runtime/persistance `BusinessRelation`, réalisée avant récupération de la numérotation autoritaire, a exécuté le standalone Editor généré sous Chrome : création UI de deux BO, création applicative d'une `BusinessRelation`, observation runtime et canonique, Export XML physique, Open Repository du fichier exporté, puis restauration identique des deux BO et de la relation. La régression finale sous Node `v22.22.2` a passé 23/23 tests ciblés ; `build:editor` a réussi avec Vite 8.2.2 et 880 modules transformés ; `git diff --check` était silencieux et l'index vide. Cette preuve ne ferme pas E15 autoritaire et ne démontre pas la nécessité E16.

Le registre Business Model réel a depuis été récupéré. Le decision gate ci-dessous est désormais autoritaire pour E14–E16 : E14 est fermé par la preuve relation BPMN enrichie ; E15 reste ouvert selon son critère produit ; E16 est fermé par le cas produit irréductible `Path --aggregation--> Application`. Aucun commit ni push des changements courants sans demande explicite de l'utilisateur.

## 10. Invariant de continuité méthodologique

Le changement de discussion ne remet pas à zéro la méthode du projet.

La conversation suivante doit reprendre le protocole démontré avant de
chercher une autre manière de procéder.

Règles impératives de reprise :

- ne pas inventer un nouveau protocole de validation, test, runtime,
  publication, navigateur ou repository parce qu'une nouvelle
  conversation commence ;
- rechercher d'abord le précédent BPMNSM applicable ;
- distinguer la propriété à démontrer du moyen technique utilisé pour la
  démontrer ;
- ne changer de méthode qu'après avoir établi l'insuffisance du précédent ;
- exposer cette insuffisance et la nouvelle méthode proposée avant son
  adoption ;
- ne pas confondre build, présence dans le bundle, round-trip et exécution
  runtime ;
- ne pas élargir le périmètre d'une expérience pour résoudre un problème
  adjacent non requis ;
- inspecter le repository réel avant toute reconstruction depuis le
  contexte conversationnel ;
- conserver la séquence inspection ciblée → expérience falsifiable →
  evidence → régression groupée → décision → capitalisation.

Le checkpoint d'une conversation doit donc transmettre non seulement
l'état Git et les résultats expérimentaux, mais aussi les contraintes
méthodologiques nécessaires pour poursuivre sans réinterprétation.

## Decision gate Business Model E14–E16 — 2026-09-20

Le registre autoritaire `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` reste
la source de vérité pour la séquence E14–E19.

- E14 est **[IMPLÉMENTÉ + DÉMONTRÉ]** : une `bpmn:SequenceFlow` native peut
  porter un `SemanticType` SemArch compatible, résoudre une propriété de
  schéma et conserver cet enrichissement après sérialisation/réouverture.
  Preuve ciblée : 2 fichiers / 4 tests / 0 échec.
- E15 reste **[NON IMPLÉMENTÉ]** au sens du critère autoritaire « cas produit
  réels ». E15-01 à E15-03 démontrent néanmoins la comparaison architecturale
  contrôlée : `ObjectProperty` couvre l'axe BO × CoC, une relation BPMN
  native porte la topologie lorsqu'elle convient, et ses endpoints peuvent
  être dérivés vers les BO canoniques. Régression finale : 1 fichier /
  3 tests / 0 échec.
- E16 est **[IMPLÉMENTÉ + DÉMONTRÉ]** quant à la nécessité architecturale.
  E16-01/E16-02 conservent la preuve de faisabilité technique BO -> BO + BR :
  `BusinessRelation` porte un triplet canonique indépendant du CoC et de la
  représentation et survit à un round-trip BPMN XML sans
  `BusinessObjectRepresentation`, `SequenceFlow` relationnelle ni
  `ObjectProperty` substitutive. Le cas produit `Path --aggregation-->
  Application` apporte la preuve irréductible manquante : cette composition
  est un fait métier autonome, ni topologie BPMN, ni contextualisation
  BO × CoC, ni relation dérivée. La régression groupée du démonstrateur
  vertical passe 7 fichiers / 66 tests / 0 échec ; `git diff --check` est
  silencieux.
- Le fixture `Aircraft --hasEngine--> Engine` est un cas de test
  architectural contrôlé, pas une exigence métier normative ni un cas
  produit réel.
- L'existence actuelle du code `BusinessRelation`, de son store et de sa
  persistance démontre une capacité ; elle ne décide pas par inertie de
  l'architecture finale.
- E17-01 reste parqué. Il ne clôt pas E17 et ne doit pas être approfondi avant
  résolution du decision gate produit E15-E16.

Le cas produit réel `Path --aggregation--> Application` ferme la preuve
manquante de nécessité E16 sans imposer `BusinessRelation` aux autres
catégories relationnelles. E15 reste distinct et **[NON IMPLÉMENTÉ]** selon
son critère autoritaire propre. La suite du démonstrateur vertical doit
inspecter le lien `Application` / `DataStore` puis la sémantique
`use` / `serve` avant toute nouvelle abstraction.

## Direction UI Business Model Explorer — décision 2026-09-20

La prochaine tranche produit ne doit pas être réduite à un formulaire isolé `BusinessRelation`. La direction retenue est un **Business Model Explorer**, centré d'abord sur les Business Objects, avec deux accès complémentaires partageant les mêmes stores/actions : depuis le BPMN et depuis l'Explorer.

Contraintes à préserver lors de la reprise :

- utiliser **w2ui v2** et ses widgets natifs : `w2layout`/panes, `w2grid`, `w2form`, toolbar et interactions adaptées ;
- exploiter les fonctions avancées des grids : recherches globales/structurées, filtres, tris, sélection et colonnes configurables ;
- ne pas prolonger le HTML ad hoc du popup historique comme architecture cible ;
- construire les tableaux en partie dynamiquement par introspection du schéma sémantique, des stores Business Model et du BPMN ;
- placer cette logique dans une couche de projection indépendante de w2ui, produisant records, colonnes/recherches, facettes et navigation ;
- préserver la provenance `identity` / `schema` / `business-model` / `representation` / `bpmn-native` / `bpmn-derived` et en déduire l'éditabilité ;
- ne pas persister en `BusinessRelation` un fait qui reste correctement porté ou dérivable depuis BPMN.

UI-01 doit rester minimale : grid Business Objects + sélection/détail + types + représentations + relations entrantes/sortantes + premiers usages BPMN déjà démontrables. Les perspectives Relations, BPMN Usages et Information/Data viendront ensuite sur la même projection.

Avant UI-01, inspecter les précédents réels w2ui v2 du dépôt (`w2layout`, `w2grid`, `w2form`, toolbar et panes) puis constituer un INPUT ZIP avec les fichiers exacts nécessaires. Ne pas inventer une infrastructure UI parallèle.

## Identité Business Object — acquis au 2026-09-20

Le contrat Business Object démontré est désormais `{ id, name?, typeRefs[] }`. `name` est un libellé humain optionnel distinct de l'identité ; son unicité n'est pas requise. Le round-trip BPMN XML réel préserve `id + name? + typeRefs[]`, y compris la compatibilité avec un BO historique sans `name`.

`src/identity/guid-generator.js` est le générateur UUID BPMNSM établi. La création produit d'un nouveau BO ne demande plus d'ID : le dialogue recueille `name + typeRefs[]`, puis `main.js` génère `id: createGuid()` à la frontière applicative avant `BusinessObjectStore.addBusinessObject(...)`. `createBusinessObject()` reste un normaliseur à ID explicite et ne génère rien implicitement, afin de préserver les imports et identités historiques.

BO-IDENTITY-01 et BO-CREATION-UUID-01 sont **[IMPLÉMENTÉ + DÉMONTRÉ]**. La régression identité/BO/XML passe 5 fichiers / 26 tests / 0 échec ; le standalone Editor construit avec succès ; `git diff --check` est silencieux. La validation runtime a créé deux BO de même nom avec deux UUID distincts, confirmant que le nom n'est ni une clé ni une identité.

Ne pas généraliser cette décision au-delà de la preuve : aucun remplacement massif des IDs existants par UUID ; aucune identité externe n'est convertie en ID BPMNSM. Les prochaines frontières d'identité sont `Origin` + identités externes lossless. Les précédents `ApplicationSystem`, `TechnicalRealization`, `BusinessContext`, l'adapter Sparx EA et `RepositoryComponent.externalIds` doivent être inspectés comme précédents, mais ils ne constituent pas encore un modèle Origin opérationnel. La qualification `documentId` des représentations multi-document et le format d'une ressource Business Model autonome restent également ouverts.

---

