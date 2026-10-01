# BPMNSM --- Handover opérationnel --- 2026-09-19

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
HEAD                                8bb4954828e6f54ad449c1e1ab46344da90b99ed
fichiers staged de la baseline      91
commit de baseline                  [NON IMPLÉMENTÉ]
publication origin/main             [NON IMPLÉMENTÉ]
GitHub Actions sur cette baseline   [NON IMPLÉMENTÉ]
```

La baseline technique `HEAD + index91` a été reconstruite dans un environnement frais et a passé `npm ci`, application du patch `archimate-js`, régression, build complet, contrôle des cinq artefacts attendus, régression post-build et `git diff --cached --check`.

Frontière normalisée démontrée :

```text
patches/archimate-js+0.0.4.patch
sha256 e4b750591d3dfbf8ac0c81bff07429e97c3edfadd9167f276eb2426efd1d2445

src/properties/business-object-contextual-properties.js
sha256 a85df4c0cce6b71103b6bffe867a8cb3ff589cd309e293f30547c47a1f42e8df
```

Ne pas refaire l'histoire en commits artificiellement atomiques. La baseline actuelle est un checkpoint consolidé à publier honnêtement comme tel.

## 3. État Business Model

E11, E12 et E13 sont fermées dans leurs limites documentées. E14 — enrichissement d'une relation BPMN — est la prochaine expérience Business Model ouverte.

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

La représentation BPMN reste orthogonale à la contextualisation. Ne pas créer prématurément `BusinessObjectViewpoint`, `BusinessRelation` ou un artefact repository complémentaire.

## 4. Décisions de publication prises le 2026-09-19

Séparer la version de BPMNSM de la version du repository de ressources :

```text
BPMNSM deployment × resource repository × repository revision
```

Le repository distant visé est un repository Git de fichiers représentant les processus intégrés et ressources associées justifiées ; ce n'est pas une base de données distante commune.

Deux modes d'édition restent possibles : workspace local avec Git externe, ou interaction distante via API de forge. GitHub est le premier provider visé ; préserver une frontière permettant GitLab sans prétendre que leurs API sont identiques.

Cible Pages : releases officielles conservées et immuables, `latest`, previews de développement et distributions personnalisées si nécessaire. Plusieurs versions doivent pouvoir être lancées simultanément. L'isolation de l'état navigateur doit être inspectée et démontrée avant conception détaillée.

Les publications Pages historiques restent des preuves historiques. Elles ne signifient pas que la baseline consolidée courante est déjà publiée ni que le multi-version existe.

## 5. CI : décision immédiate

La CI GitHub minimale doit être mise en service dès la publication de la baseline, avant la reprise des nouveaux incréments fonctionnels.

`.github/workflows/ci.yml` est déjà dans la baseline candidate. Sa présence locale est démontrée ; son exécution GitHub sur le futur commit ne l'est pas encore.

Ordre retenu :

```text
capitalisation continuité
→ commit consolidé baseline
→ push GitHub
→ GitHub Actions réel
→ minimum Pages utile au test en ligne
→ reprise E14
→ enrichissement progressif multi-release/preview/custom
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

Après installation et preuve de la présente capitalisation, la prochaine action atomique est l'inspection du style des commits récents et de la frontière exacte de l'index, puis la préparation du **commit consolidé de baseline**. Le commit lui-même nécessite une demande explicite de l'utilisateur.

Ne pas commencer E14 avant d'avoir publié la baseline et obtenu la première preuve GitHub Actions, sauf décision explicite contraire.
