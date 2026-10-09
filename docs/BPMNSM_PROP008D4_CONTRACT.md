# BPMNSM — Complément au contrat d'architecture et de collaboration

Statut : exigences approuvées lors de la revue PROP-008D4, 9 octobre 2026.
Portée : extension des directives existantes ; ce document ne les remplace pas.

## 1. Périmètre de validation

Les diagrammes de référence sont **Process** et **Collaboration**. La **Choreography est hors périmètre**. Des modèles BPMN XML avec BPMN DI doivent être générés et conservés comme fixtures Git, indépendamment de tout export Sparx EA. Fixtures de référence : `src/tests/bpmn-fixtures/PROP-008D3/PROP008D3_PROCESS.bpmn` et `PROP008D3_COLLABORATION.bpmn`.

## 2. Organisation systématique des panneaux

Respecter l'ordre suivant pour tous les éléments concernés :

1. **General** : champs usuels `name`, `id`, `documentation` / description (selon la sémantique réelle), et autres champs natifs usuels pertinents. Aucun détail de descripteur, de type moddle ni d'héritage sous ces champs.
2. **BPMN Core** : propriétés OMG BPMN standard non déjà affichées dans General, y compris structures, références, collections et entrées/sorties. Présentation contextualisée et lisible, sans accumulation de champs techniques bruts.
3. **BPMN Extension** : propriétés des extensions BPMNSM et autres extensions déclarées, distinctes du standard.

Masquer les sections vides. Les sous-groupes peuvent être adaptés au type d'élément, sans modifier l'ordre général. Les métadonnées d'héritage sont accessibles uniquement via aide ou inspection avancée, sans polluer les champs usuels.

## 3. Coexistence avec bpmn.io

- Le fournisseur natif bpmn-js-properties-panel est prioritaire. **Ne jamais réimplémenter** un éditeur natif opérationnel (`id`, `name`, `documentation`, etc.).
- Une propriété ne doit disposer que d'un éditeur responsable ; pas de concurrence entre General, BPMN Core et Extension.
- Les ajouts BPMNSM doivent utiliser les composants et services natifs bpmn.io, intégrés aux conteneurs W2UI existants, sans second framework de formulaire.
- Toute édition persistante passe par les services de modélisation et mécanismes de commande adaptés à bpmn-js ; proscrire les mutations moddle directes non contrôlées.
- La sélection, les modifications du diagramme, le panneau, les événements, l'undo/redo, l'export XML et le rechargement doivent rester cohérents. La présence d'un champ ne prouve ni son édition ni sa synchronisation.
- Distinguer explicitement les propriétés d'une référence graphique, celles de l'objet maître référencé et les informations techniques en lecture seule. Pour un Participant, distinguer Participant et Process associé.
- Les actions de collection et leurs libellés doivent être visuellement séparés, avec des composants natifs adaptés.

## 4. Couverture BPMN et preuves

L'inventaire des descripteurs n'est pas une preuve de couverture UI. Statuts de suivi : `NATIVE_REUSED`, `BPMNSM_ADDED`, `DUPLICATE`, `INCONSISTENT`, `UNVERIFIED`, `NOT_EDITABLE`. Ne déclarer la couverture effective qu'après observation des entrées et vérification de l'édition, de la commande, de l'undo/redo et de la persistance XML. Tester par lots fonctionnels Process puis Collaboration, en recherchant rapidement des résultats visibles, sans micro-audits successifs.

## 5. Protocole Mac de livraison et d'exécution

- Livrer un ZIP complet contenant un lanceur et, si nécessaire, des scripts séparés ; une seule commande de lancement courte pour macOS.
- Précontrôler archive, dépendances, branche, HEAD, statut Git, cibles et risques d'écrasement. Sauvegarder hors du dépôt avant modification. Ne jamais écraser silencieusement un fichier local.
- Conserver un journal complet et produire un résumé `RESULT.txt` **même en cas d'échec** avec code retour et contexte utile.
- Copier le résumé automatiquement par `pbcopy` et vérifier réellement avec `pbpaste` ; signaler le résultat de la vérification.
- Utiliser `npx vitest run` (pas `npm test` en mode watch), puis le build quand approprié.
- Aucun commit ou push GitHub sans autorisation explicite.

### BPMNSM-EXEC-ERR-001 — commande recollée

Si l'utilisateur recolle uniquement la commande fournie sans résultat, l'interpréter **en priorité comme un incident potentiel du livrable**, pas comme une demande de confirmation. Examiner le ZIP, le lanceur, les chemins, les journaux et la restitution ; ne pas répéter la commande ; livrer une correction robuste et complète, en limitant les itérations.

## 6. Documentation et traçabilité

Une règle « retenue en conversation » n'est pas « enregistrée dans le dépôt ». Identifier explicitement les fichiers effectivement modifiés, les tests exécutés, les éventuels conflits et le statut Git. Les compléments doivent référencer les documents existants et ne pas les écraser.

## 7. Critères de réception PROP-008D4

Sur les fixtures Process et Collaboration : structure des sections conforme, champs usuels natifs non dupliqués et sans métadonnées visibles, collections lisibles, objets référencés distincts, cohérence panneau ↔ diagramme ↔ XML, undo/redo. La validation XML seule ne valide pas le comportement UI.
