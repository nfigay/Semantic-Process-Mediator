# BPMNSM — Prompt de reprise — EA preprocessing — 2026-09-26

Tu reprends BPMNSM / Semantic Process Mediator depuis un checkpoint documenté. Le repository réel reste l'autorité : ne reconstruis jamais son état depuis ce prompt.

Lire d'abord :
1. `public/plans/HANDOVER_BPMNSM_2026-09-22.md`
2. `public/plans/BPMNSM_WORKPLAN.md`
3. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
4. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
5. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
6. `public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-21.md`
7. `public/plans/README.md`

Checkpoint attendu au transfert : branche `main`, HEAD `be5f6b355a3da39dc1b51591a5ccdd7000ec9633`. Le worktree est volontairement très chargé : préserver toutes les modifications et tous les fichiers non suivis. Aucun reset/clean, `git add -A`, commit, push, tag, release ou publication sans autorisation explicite.

## Priorité courante

La priorité n'est plus une architecture générale de tolérance aux BPMN invalides. L'incident observé sur un export Sparx Enterprise Architect est reclassé comme problème d'interopérabilité de la chaîne producteur, sous réserve de qualification exacte de sa cause.

Diagnostic de travail à vérifier : les groupings EA semblent relever d'une représentation/construction qui n'est pas exportée sous une forme directement exploitable par les consommateurs standards ; l'export BPMN produit alors des anomalies également visibles dans bpmn.io. Un phénomène analogue est rapporté pour ArchiMate. Ne pas présenter ces affirmations comme des faits Sparx/version tant qu'elles ne sont pas établies par artefact et documentation.

La chaîne prioritaire est :

`Sparx EA -> export standard -> preprocessing/adaptation ciblé -> BPMNSM Repository/Editor -> dérivation/publication -> BPMNSM Viewer`.

Le preprocessing doit traiter les anomalies d'export producteur caractérisées. Il est distinct de l'enrichissement sémantique BPMNSM portant les Business Objects, attributs, relations métier, extensions et modèles complémentaires du Repository.

La cible évite de reconstruire des publishers autonomes spécifiques au-dessus de Sparx EA, ARIS ou d'autres outils. Les capacités Web doivent être mutualisées entre Editor et Viewer ; le Publisher existant est une frontière/fonction de dérivation et publication gouvernée, pas nécessairement un produit autonome.

## Première gate — EA-PRE-01

Avant toute correction :
- obtenir un modèle EA minimal/source reproduisant le grouping et son export BPMN exact ;
- inspecter ce qui existe dans le modèle EA, ce qui est purement présentation, et ce que l'export produit réellement ;
- reproduire le comportement avec un consommateur standard indépendant, notamment bpmn.io ;
- rechercher la documentation Sparx correspondant à la construction et à la version déployée ;
- classer chaque conclusion selon les preuves du protocole (`DOC / EX / SRC / EXP / BPMNSM-HYP`) ;
- définir seulement ensuite le preprocessing minimal, explicite, déterministe et testable ;
- prouver la chaîne complète jusqu'au Viewer.

Le cas ArchiMate grouping sera traité avec la même méthode lorsqu'un fixture représentatif sera disponible.

Ne pas construire de registre générique de tolérance aux modèles invalides sans nouveaux cas indépendants démontrant ce besoin. Les invariants existants de non-destruction restent valides, mais ce sujet n'est plus le front prioritaire.

## Architecture à préserver

Respecter les distinctions Workspace/Environment, Source physique, Resource, scope technique, Repository autonome et RepositoryDocument. Ne jamais introduire `1 Workspace = 1 Repository` ni `folder = Repository`.

Le Repository BPMNSM doit pouvoir intégrer progressivement Process, Collaboration, Business Objects, relations métier et modèles ArchiMate. Les corrections d'export producteur ne doivent pas contaminer ces abstractions métier.

W2UI reste une dépendance structurelle : intention BPMNSM -> interaction pattern -> docs W2UI 2 -> exemples officiels -> source installée si ambigu -> expérience minimale -> implémentation -> tests -> preuve Vite/Chrome.

Pour tout sujet build/standalone/offline/Pages, inspecter d'abord la chaîne Vite réelle. Les standalone Editor et Viewer courants sont des HTML monofichier produits par la chaîne existante.

## Collaboration

Si une information manque pour continuer, fournir dans la même réponse le script Terminal exact pour la collecter, avec `2>&1 | tee /dev/tty | pbcopy` lorsqu'approprié. Ne jamais demander seulement « envoie tel fichier » sans script de collecte quand une collecte est nécessaire.

Ne pas demander d'édition manuelle du code. Pour les corrections déterministes, produire des ZIP installables. Si tests GREEN mais produit RED, rechercher la première divergence test/produit avant tout nouveau patch.

Première action de la nouvelle conversation : inspecter les documents d'autorité et confirmer que le replan EA preprocessing est bien capitalisé, puis préparer la collecte minimale des artefacts EA nécessaires à EA-PRE-01. Ne pas implémenter de correctif avant cette caractérisation.
