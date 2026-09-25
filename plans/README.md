# BPMNSM — paquet de continuité 2026-09-22

## Ordre de lecture courant

1. `HANDOVER_BPMNSM_2026-09-22.md`
2. `BPMNSM_WORKPLAN.md` — ordre opérationnel des fronts et gates
3. `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
4. `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
5. `BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
6. `BPMNSM_PUBLICATION_RUNBOOK.md`
7. `PROJECT_CONTEXT_BPMNSM_2026-09-21.md` pour le contexte historique détaillé
8. `NEXT_CHAT_PROMPT_BPMNSM_2026-09-22.md` pour ouvrir une nouvelle discussion

Les handovers, prompts et contextes datés antérieurs restent des archives de continuité. Le repository réel reste l'autorité du code exact.

## Checkpoint courant

```text
branch       main
HEAD         be5f6b355a3da39dc1b51591a5ccdd7000ec9633
worktree     très chargé ; préserver les travaux existants
diff check   silencieux au checkpoint de continuité 2026-09-22
```

E14 est démontré ; E15 reste ouvert sous son critère strict ; E16 est démontré avec le cas produit `Path --aggregation--> Application`. Local Workspace LW01–LW12 est démontré dans les frontières documentées. LW12 ferme le round-trip physique BO/BR : mutation canonique -> Business Model JSON -> RepositoryDocument dirty -> Save -> codec reopen -> fresh reload.

La maturation Workspace / Repository M1–M6 est démontrée dans ses frontières documentées. TECH-INSPECT-01 est **[IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ]** comme couche d'observabilité read-only extensible ; les six sources actuelles sont le périmètre démontré, pas une liste fermée. Toute nouvelle structure canonique significative doit faire l'objet d'une décision explicite d'inspectabilité. LW13 reste suspendu. Le statut reste Development Preview / Progress Demonstrator ; la publication nominale reste régie par `BPMNSM_PUBLICATION_RUNBOOK.md` et `publication/versions.json`.

## Discipline

- repository réel autorité ;
- aucune commande Git destructive ;
- aucun commit/push/tag/release sans autorisation explicite ;
- modifications par ZIP de fichiers complets ;
- pour un ZIP produit par l'assistant : ZIP + SHA d'abord, confirmation de téléchargement, commande d'installation ensuite ;
- archives de transfert sous `~/Downloads` ;
- preuves distinctes pour inspection, tests, sérialisation, build et runtime ;
- ne pas déclarer l'équivalence canonique complète du repository avant sa preuve.


## Cartographie documentaire

- **Autorité opérationnelle courante** : `HANDOVER_BPMNSM_2026-09-22.md` + `BPMNSM_WORKPLAN.md`.
- **Cibles détaillées** : `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` et `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`.
- **Méthode normative** : `BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`; le `...GUIDE.md` est explicatif.
- **Publication** : `BPMNSM_PUBLICATION_RUNBOOK.md` est procédural ; `publication/versions.json` reste l'autorité d'identité nominale hors de ce paquet.
- **Contexte détaillé** : `PROJECT_CONTEXT_BPMNSM_2026-09-21.md`, complété par addenda ; les contextes datés antérieurs sont historiques.
- **Vision / positionnement / standards / contrats spécialisés** : documents de référence, non workplan.
- **Handovers et NEXT_CHAT_PROMPT antérieurs** : archives de continuité, non autorités courantes.

Des doublons byte-identiques existent dans l'historique (`INTEROPERABILITY_OF_MEANING_VISION (1).md` / `(2).md`, `PROJECT_CONTEXT_BPMNSM (2).md` / `(3).md`, les deux contrats datatype, et certaines variantes HTML). Ils sont conservés à ce checkpoint pour traçabilité ; aucune suppression n'est autorisée par cette consolidation.

## W2UI 2 functional reference

For UI design and debugging, read:

1. `BPMNSM_W2UI_2_FUNCTIONAL_MAP.md`
2. `BPMNSM_W2UI_2_TRACEABILITY_MATRIX.md`
3. `BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`

W2UI work must distinguish `DOC / EX / SRC / EXP / BPMNSM-HYP` and prefer native widget composition over low-level DOM reimplementation.

## Checkpoint UI complémentaire — 2026-09-23

La navigation de travail est désormais explicitement séparée en `Environment | Diagrams | Sources` via un unique niveau W2UI Tabs. La frontière `Diagrams repository-wide` est démontrée : projection typée `BPMN Processes / BPMN Collaborations / ArchiMate`, conservation de l'identité du `RepositoryDocument` propriétaire pour les BPMN, chargement du document avant ouverture du diagramme, et réemploi du panneau de propriétés Diagram existant.

Preuves : **20/20 tests ciblés GREEN**, build complet Viewer/Editor/Pages GREEN, Chrome multi-document BPMN GREEN et ArchiMate GREEN. Voir les addenda du Handover, Workplan, Functional Map, Traceability Matrix et Project Context.

La prochaine frontière est `Sources minimal workspace`; ne pas interpréter le statut GREEN de Diagrams comme une preuve d'une correspondance canonique Resource ↔ objet logique.

## Checkpoint Workspace snapshot — 2026-09-25

L'identité Workspace et la sauvegarde Archive utilisent désormais `.bpmnsm/workspace.json` `formatVersion: 2` avec `workspaceId`, `name`, `createdAt`, `savedAt` et `snapshotIteration`. Les manifestes v1 avec `workspaceVersion` restent lisibles par migration.

Terminologie : le ZIP est un **Workspace snapshot** ; `snapshotIteration` est une itération locale à la lignée ouverte. Le nom demandé suit `<workspace>-iNNN.zip`. Les suffixes `(1)`, `(2)`, etc. ajoutés par le navigateur pour éviter un écrasement sont externes à BPMNSM et ne constituent jamais des itérations.

Preuves : **8 fichiers / 31 tests GREEN**, build complet GREEN au gate associé, progression `i001 -> i002` GREEN et branchement `i001 -> second i002` GREEN dans Chrome. Le second `i002` a été matérialisé physiquement sous `workspace-i002 (1)` tout en conservant `snapshotIteration: 2`, ce qui ferme explicitement la confusion entre itération logique et collision de nom physique.
