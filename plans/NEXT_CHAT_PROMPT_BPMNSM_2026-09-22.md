# BPMNSM — Prompt de reprise — 2026-09-22

Tu reprends le projet **BPMNSM / Semantic Process Mediator** à un checkpoint documenté. Le repository réel est l'autorité : ne reconstruis jamais le code depuis ce prompt ou depuis les documents de continuité.

Commence par lire, dans cet ordre :

1. `public/plans/HANDOVER_BPMNSM_2026-09-22.md`
2. `public/plans/BPMNSM_WORKPLAN.md`
3. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
4. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
5. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
6. `public/plans/BPMNSM_PUBLICATION_RUNBOOK.md`
7. `public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-21.md` seulement si l'historique détaillé est nécessaire.

Checkpoint Git attendu :

```text
branch   main
HEAD     be5f6b355a3da39dc1b51591a5ccdd7000ec9633
subject  feat(model): add autonomous business relations
```

Le worktree est volontairement très chargé en modifications et fichiers non suivis. Préserve-le intégralement. Pas de `git add -A`, `git reset`, `git clean`, commit, push, tag, release ou publication sans autorisation explicite.

État à considérer acquis : maturation Workspace / Repository M1–M6 démontrée ; M6 qualifie les Business Object Representations par `documentId` sans rendre `representationId` globalement unique ; TECH-INSPECT-01 est **[IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ]** ; son architecture est `état canonique -> introspection read-only -> Inspector`, avec le principe `observer != modifier`; son catalogue `getSources()` / `addSource()` est extensible ; les six sources actuelles sont un périmètre démontré, pas une liste fermée. `Technical -> Inspector…` est isolé à droite de la toolbar. Toute nouvelle structure canonique significative doit désormais faire l'objet d'une décision explicite d'inspectabilité dans sa Definition of Done.

LW13 reste suspendu. TECH-INSPECT-01 n'est pas M7. Le statut produit reste **Development Preview / Progress Demonstrator**. L'architecture reste statique/serverless et Git reste externe.

Méthode obligatoire : inspection ciblée du repository réel -> précédent BPMNSM établi -> reproduction -> expérience minimale falsifiable -> preuve -> régression groupée -> décision -> capitalisation. Ne propose pas de réécriture globale ou d'architecture spéculative avant inspection des fichiers exacts.

Pour toute modification, demande/collecte d'abord les fichiers exacts concernés depuis le worktree si tu ne les possèdes pas. Ne demande pas d'édition manuelle. Pour un ZIP que tu produis, donne **d'abord le ZIP avec son SHA-256**, attends ma confirmation de téléchargement, puis seulement donne la commande d'installation/test visant `~/Downloads/<zip>`. Toute commande de preuve terminée doit finir par `2>&1 | tee /dev/tty | pbcopy`; dans les gardes shell, utiliser `return`, jamais `exit`.

Ne réintroduis pas RDF comme cible. Ne transforme pas `representationId` en identité globale/UUID. Ne fais pas dépendre l'Inspector de `window.semarchApp` ou de stores mutables ; la globale reste seulement un escape hatch de développement et expose aussi `technicalIntrospection` via l'app.

Le front courant est désormais décidé dans `BPMNSM_WORKPLAN.md` : **Workspace Tree + Search**. Reprendre par **E1 — filtre structurel pur**, qui est planifié mais non démontré. Ne relance ni LW13 ni un M7 arbitraire. Avant toute installation du patch E1 déjà préparé, vérifier qu'il correspond au workplan consolidé ; ensuite appliquer le protocole ZIP et obtenir la preuve ciblée avant E2.
