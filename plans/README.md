# BPMNSM --- paquet de continuité 2026-09-17

Ce paquet est le point de continuité opérationnel courant. Les documents historiques restent des archives ; ils ne doivent pas être écrasés pour reconstruire artificiellement l'historique.

## Ordre de lecture pour un nouveau chat

1. `HANDOVER_BPMNSM_2026-09-17.md` — état court, discipline de travail, point de reprise.
2. `PROJECT_CONTEXT_BPMNSM_2026-09-17.md` — contexte consolidé ; la section 26 contient le delta Business View le plus récent.
3. `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md` — cible produit ; la section 42 contient la mise à jour Business Object / Business View.
4. ce `README.md` — index et règles de cohérence.

## Baseline courant démontré

```text
59 fichiers de test
267 tests
267 passent
0 échec
```

Business View Avionics v1.0, projection de ses six propriétés, `ActiveBusinessView`, résolution, relais applicatif et activation depuis `CoC_Avionics` sont **[IMPLÉMENTÉS + DÉMONTRÉS]**.

Business Object générique, multi-typing BO, object properties, persistance des Business Views et attach/detach BO ↔ représentation BPMN restent **[NON IMPLÉMENTÉS]**.

## Sources de vérité

Le dépôt réel reste l'autorité pour le code exact. Les documents de continuité sont une capitalisation de décisions et preuves, pas un substitut à l'inspection du repository.

Avant toute modification : lire les fichiers actuels concernés. Ne jamais reconstruire un gros fichier depuis le Handover, le Project Context ou la mémoire d'une conversation.

## Discipline de livraison

- étapes atomiques ;
- fichiers complets dans un ZIP préservant l'arborescence ;
- pas de patch manuel comme livraison normale ;
- l'utilisateur décompresse et distribue lui-même les fichiers, donc pas de commande `unzip -o` d'installation ;
- collecte macOS normalement via `2>&1 | pbcopy` ;
- tests en mode `--run`, avec sortie visible et copiée lorsque demandée ;
- statuts de preuve explicites ;
- aucune abstraction, fonctionnalité ou numérotation inventée ;
- ne pas demander une permission lorsque la prochaine étape atomique est évidente.

## Priorité produit et point de reprise

La priorité produit historique reste :

```text
Sparx EA → BPMN → BPMNSM Publisher/Viewer
```

Le vertical Avionics apporte désormais une Business View réelle. Le prochain besoin structurant est de faire émerger le Business Object distinct de sa représentation BPMN, avec typage/multi-typing et vues stakeholder, sans casser les frontières publication/Viewer ni généraliser prématurément le modèle.

## Prompt de reprise minimal

```text
Nous reprenons BPMNSM depuis le checkpoint du 2026-09-17.
Lis HANDOVER_BPMNSM_2026-09-17.md puis PROJECT_CONTEXT_BPMNSM_2026-09-17.md, BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md et README.md.
Le dépôt réel est l'autorité. Respecte strictement la discipline du Handover et commence par vérifier le dépôt réel avant toute modification.
Baseline démontré : 59/59 fichiers, 267/267 tests, 0 échec.
Business View Avionics est démontrée ; Business Object générique et multi-typing restent non implémentés.
```
