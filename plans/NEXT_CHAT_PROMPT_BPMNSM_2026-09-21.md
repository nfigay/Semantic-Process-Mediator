# BPMNSM — Prompt de reprise — 2026-09-21

Tu reprends BPMNSM / Semantic Process Mediator au checkpoint post-LW12. Le repository réel reste l'autorité ; ne reconstruis jamais le worktree depuis ce prompt.

Lis d'abord, dans cet ordre :

1. `public/plans/HANDOVER_BPMNSM_2026-09-21.md`
2. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
3. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
4. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
5. `public/plans/BPMNSM_PUBLICATION_RUNBOOK.md`

Checkpoint attendu :

```text
branch       main
HEAD         be5f6b355a3da39dc1b51591a5ccdd7000ec9633
subject      feat(model): add autonomous business relations
worktree     très chargé, à préserver
git diff --check silencieux au checkpoint
```

Ne fais aucun `git add -A`, reset, clean ou opération destructive. Aucun commit/push/tag/release sans autorisation explicite.

État autoritaire : E14 est `[IMPLÉMENTÉ + DÉMONTRÉ]`; E15 reste `[NON IMPLÉMENTÉ]` sous son critère strict de cas produit réels ; E16 est désormais `[IMPLÉMENTÉ + DÉMONTRÉ]` avec `Path --aggregation--> Application`; E17-01 reste parqué.

Local Workspace LW01–LW12 est démontré dans les frontières documentées. LW12 démontre le round-trip Business Model physique complet pour BO/BR : chargement du fixture 2 BO + 1 BR, création UI d'un troisième BO, sérialisation vers le RepositoryDocument Business Model dirty, `Save Local Workspace`, relecture codec 3 BO + 1 BR, puis fresh reload retrouvant les 3 BO et la relation. SHA du fixture physique post-save observé : `ab037f1d50db009a66ea1cdcb245d5c80af7021b5fa71a99957816cd9348db75`.

Ne prétends pas encore à l'équivalence canonique complète du repository. Les représentations BO↔BPMN multi-document, les enrichissements conjoints et les autres collections Business Model restent à éprouver ensemble.

Priorité immédiate : terminer le packaging/publication du checkpoint post-LW12 selon `BPMNSM_PUBLICATION_RUNBOOK.md`. Avant publication, définir explicitement la frontière source à committer dans le worktree chargé, exécuter la régression/build convenus et inspecter les artefacts. Commit/push uniquement après autorisation explicite.

Après publication, reprendre LW13 par inspection ciblée de `BusinessObjectRepresentation { businessObjectId, representationId }`, de son store, de sa persistance et de ses usages multi-document. Tester d'abord l'hypothèse d'ambiguïté si deux documents BPMN réutilisent le même id local. Ne pas ajouter `documentId` avant preuve de nécessité.

Méthode impérative :

```text
inspection ciblée
→ précédent BPMNSM établi
→ reproduction du précédent
→ expérience falsifiable minimale
→ evidence
→ régression groupée
→ décision
→ capitalisation
```

Pour toute modification, utiliser un ZIP d'entrée constitué des fichiers exacts du worktree et rendre un ZIP de sortie avec fichiers complets et chemins repository. Archives de transfert dans `~/Downloads`. Sorties d'inspection finies via `2>&1 | tee /dev/tty | pbcopy`. `rg` indisponible. Vitest 5 avec Node 22.22.2 via nvm. Ne jamais demander une édition manuelle de code.
