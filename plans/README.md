# BPMNSM --- paquet de continuité 2026-09-19

## Ordre de lecture pour un nouveau chat

1. `HANDOVER_BPMNSM_2026-09-19.md`
2. `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
3. `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
4. `BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
5. `BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_GUIDE.md`
6. `PROJECT_CONTEXT_BPMNSM_2026-09-17.md` pour le contexte historique détaillé
7. `BPMNSM_PROCESS_INTEROPERABILITY_VISION.md`
8. `NEXT_CHAT_PROMPT_BPMNSM_2026-09-19.md` pour ouvrir une nouvelle discussion

Les checkpoints datés antérieurs restent des archives de continuité. Le repository réel reste l'autorité pour le code exact.

## Baseline courante

La baseline consolidée `HEAD + index91` a été démontrée de manière autonome à partir du HEAD `8bb4954828e6f54ad449c1e1ab46344da90b99ed` et des 91 fichiers staged : installation fraîche, patch `archimate-js`, régression, build complet, artefacts attendus, régression post-build et contrôle du diff staged.

```text
baseline technique locale                [IMPLÉMENTÉ + DÉMONTRÉ]
commit consolidé                         [NON IMPLÉMENTÉ]
publication GitHub de cette baseline     [NON IMPLÉMENTÉ]
GitHub Actions sur cette baseline        [NON IMPLÉMENTÉ]
Pages multi-version                      [NON IMPLÉMENTÉ]
```

Les preuves Pages antérieures restent historiques et ne doivent pas être interprétées comme la publication de cette baseline.

## Business Model

E11, E12 et E13 sont fermées dans leurs limites documentées. E14 est la prochaine expérience Business Model ouverte. Le registre `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` reste l'autorité pour E1–E20.

## Décision de publication/repository

La cible opérationnelle sépare :

```text
BPMNSM deployment × resource repository × repository revision
```

Le repository de ressources est un repository Git de fichiers, pas une base distante commune. Deux modes futurs sont préservés : workspace local avec Git externe et accès distant via API de forge. GitHub est le premier provider ; la frontière doit rester compatible avec une évolution GitLab.

La cible Pages comprend releases conservées, `latest`, previews et éventuelles distributions custom, lançables simultanément. Elle sera implémentée progressivement après la première preuve CI distante.

## Réutilisation multi-projets

ArchiCG et StandardisationRadarChart sont des candidats futurs à la réutilisation de composants ou patterns. Aucun monorepo ni package partagé n'est décidé maintenant. BPMNSM reste prioritaire ; l'extraction ne doit suivre qu'un besoin commun démontré.

## Discipline de livraison

- étapes atomiques ;
- aucune commande Git destructive ;
- repository réel autorité du code ;
- inspections sous `~/Downloads`, jamais `/tmp` ;
- modifications livrées en ZIP avec fichiers complets et arborescence ;
- tests via `npm test -- --run ...` ;
- pas de commit/push sans demande explicite ;
- statuts exclusivement `[IMPLÉMENTÉ + DÉMONTRÉ]`, `[DÉMONTRÉ PAR INSPECTION]`, `[NON IMPLÉMENTÉ]`.

## Point de reprise

Après preuve d'installation de cette capitalisation : inspecter le style des commits récents et la frontière exacte de l'index, puis préparer le commit consolidé de baseline. Ensuite : push GitHub, preuve GitHub Actions, minimum Pages utile au test en ligne, puis reprise E14.
