# DATASTATE-DELETE-LIFECYCLE — précédent d'intégration native (proposition)

Statut : précédent technique et méthodologique approuvé pour installation locale. Document non normatif ; DEPP/EDED reste l’autorité contractuelle.

## Claim
La matérialisation des labels composites `master.name [dataState.name]` pouvait fonctionner en création/édition tout en entrant en conflit avec le nettoyage natif des labels lors d'une suppression de `DataObjectReference` ou `DataStoreReference`.

## Context
`OccurrenceLabelMaterialization` réagit aux événements du `CommandStack`, appelle `modeling.createLabel`/`resizeShape`; BPMN.io peut supprimer le label via `updateLabel(..., null, ..., {removeShape:false})`. Un label et une référence peuvent partager `businessObject`, alors que le rôle graphique est marqué par `labelTarget`.

## Evidence
- `src/bpmn/occurrence-label-materialization.js` : filtre `!element?.labelTarget` et garde `context?.newLabel == null && context?.hints?.removeShape === false`.
- `src/bpmn/occurrence-label-identity.test.js` : vérification simulée de la non-rematérialisation et de l'identité, pour les deux types.
- Handoff DATASTATE du 30 octobre : suppression, Undo/Redo, sauvegarde/réouverture et propriétés fonctionnelles rapportés comme validés dans Chrome.
- Commit `b9033ed12a6cca52e436053dce58cf1484e4e69d` poussé sur GitHub main, selon le handoff.

## Limit
Le test simule des commandes et ne reproduit pas à lui seul l'intégration native `LabelBehavior`/`CommandStack`. Aucune pile du gel initial n'a été capturée ; la causalité est fortement corroborée, mais ne doit pas être présentée comme une trace exhaustive. GitHub Pages non vérifié. Les obligations DEPP actuelles sont issues d'une copie locale modifiée : leur date d'entrée en vigueur clause par clause n'est pas établie.

## Mécanisme en cause
1. Une donnée métier donne au label dérivé un texte non vide.
2. L'utilisateur supprime la référence.
3. Le système natif exécute la destruction et le nettoyage du label.
4. Un événement `updateLabel.postExecuted` pouvait amener BPMNSM à recréer le label au cours de cette même destruction.
5. La garde protège le nettoyage natif ; la distinction `labelTarget` évite de traiter les labels comme des références.

## Patterns réutilisables
- **Ownership before extension** : identifier les commandes natives et les propriétaires des transitions, y compris CLEAR/DELETE/UNDO/REDO selon pertinence.
- **Graphical role ≠ semantic object** : ne pas confondre label et référence partageant un `businessObject`.
- **Command-stack reentrancy scrutiny** : examiner la commande déclenchée depuis le callback de commande et sa transaction native.
- **Discriminating inverse path** : tester, lorsque pertinent, `master/state modifié → label matérialisé → suppression native`, pas seulement CREATE/UPDATE.
- **Evidence limits** : mocks, intégration native, Chrome, save/reopen et déploiement prouvent des claims différents.

## Antipatterns
- « Repair-on-every-event » pendant une destruction native.
- « Mocks verts = preuve d'intégration ».
- Correctifs successifs avant comparaison avec/sans matérialisation.
- Répétitions de gels Chrome reportées sur l'utilisateur au lieu de réduire la cause au chemin discriminant.
- Isolation de module sans contrôler les fonctionnalités collatérales.

## Application lors d'une évolution future
L'assistant démontre dans l'analyse DEVELOP : mécanisme natif existant et propriétaire, responsabilité réellement manquante, transitions et interactions susceptibles d'être affectées, preuve discriminante proportionnée et limites. Aucun formulaire ni gate additionnel. En cas de défaut, comparer d'abord BEFORE/AFTER **fonctionnels** et les mécanismes introduits, puis requalifier les preuves après échec ACCEPT.

## Évaluation de la méthode
Ne pas considérer une statistique avant/après des conversations comme preuve causale d'efficacité : type de fonctionnalité, complexité, bibliothèques, modèle, mémoire du contexte et intervention humaine varient. À chaque évolution comparable, observer seulement : inspection native réellement faite, risque anticipé, transition choisie, défaut échappé, reprises/interventions évitables. Capitaliser des cas contrastés et les limites, sans métrique obligatoire ni nouvel archivage systématique.

## Sources de continuité
- Handoff `BPMNSM_POSTMORTEM_HANDOFF_V2_20261030(1).zip`.
- Input technique `BPMNSM_DATASTATE_POSTMORTEM_INPUT_20261030T084026Z.zip`.
- Input contractuel `BPMNSM_DATASTATE_CONTRACTS_INPUT_20261030T084329Z.zip`.
- DEPP/EDED §§7–8, 11 ; `docs/BPMNSM_PROP008D4_CONTRACT.md` §3.
