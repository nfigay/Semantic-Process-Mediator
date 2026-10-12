# BPMNSM — Plan de qualification Sparx EA 16.1

**Référence :** BPMNSM-EA-QUAL-01  
**Version :** 0.1 — 2026-10-08  
**Statut :** plan à exécuter ; aucun résultat de test EA n'est affirmé ici.

## 1. Objectif et limites

Déterminer les **unités exportables EA**, les structures de modélisation pertinentes, la couverture des exports standards et la stabilité nécessaire à la gestion de configuration et à la réimportation incrémentale BPMNSM. Il ne s'agit pas d'une qualification exhaustive d'EA ni d'une validation de l'implémentation BPMNSM.

## 2. Décisions de référence

| ID | Décision | État |
|---|---|---|
| DEC-01 | EA 16.1 est l'environnement de référence | Retenue |
| DEC-02 | BPMN 2.0 XML est le format de validation BPMN | Retenue |
| DEC-03 | XMI 2.5.1 est le candidat prioritaire pour le prétraitement des exports EA | Choix de travail |
| DEC-04 | Exports externes versionnés comme *black boxes* ; ressources BPMNSM natives *shattered* | Orientation retenue |
| DEC-05 | EA peut rester maître ; réexport et réconciliation incrémentale requis | Exigence cible |
| DEC-06 | La couverture dépend de la sélection, du containment, du format et des options | À caractériser |
| DEC-07 | XMI 1.1 demeure une référence pour les baselines EA, non le format d'import prioritaire | Contexte |

**Précaution :** vérifier les choix disponibles dans les dialogues EA 16.1 et distinguer Publish BPMN 2.0, export XMI de package et baseline.

## 3. Axes de qualification

- **Q1 Conteneurs :** Root Model, package standard/BPMN, parent/feuille, contenu direct/descendants, élément Process/Collaboration si sélection exportable.
- **Q2 Formats :** BPMN 2.0 XML et UML/XMI 2.5.1 en priorité ; versions, options et commandes exactes relevées.
- **Q3 Couverture BPMN :** processus, collaboration, participants, événements, activités, flux, sous-processus, Call Activity, données, messages, diagrammes BPMN-DI, extensions EA.
- **Q4 Configuration :** stabilité des IDs, bruit de sérialisation, changements sémantiques/graphiques, déplacement de packages, références externes.
- **Q5 BPMNSM :** provenance, identification d'unités, correspondances EA/BPMN/BPMNSM, prétraitements non destructifs, comparaison des versions.

## 4. Jeu de modèles EA à construire

```text
EA-QUAL-ROOT
├── PKG-01-Standard-Empty
├── PKG-02-Standard-Parent
│   ├── PKG-02A-BPMN-Process-A
│   └── PKG-02B-BPMN-Process-B
├── PKG-03-BPMN-Parent
│   ├── PKG-03A-BPMN-Process-C
│   └── PKG-03B-BPMN-Collaboration
├── PKG-04-BPMN-Leaf (Process-D + diagram)
├── PKG-05-Mixed (BPMN + non-BPMN)
├── PKG-06-Reusable-Processes (Process-Called)
└── PKG-07-Cross-References (Process-Caller + Call Activity)
```

Les stéréotypes et contenants réels doivent être relevés. Cette arborescence est un **montage expérimental**, pas un patron validé.

## 5. Campagnes et ordonnancement

**Phase 1 — Conteneurs (P0)** : A01, A03, A04, A05, A06, A07, A08. Objectif : identifier les périmètres exportables et la couverture des descendants.

**Phase 2 — BPMN (P0)** : B01 à B05. Objectif : vérifier les processus, collaborations, containments et références d'appel.

**Phase 3 — Stabilité (P0)** : C01, C02, C03, C05. Objectif : qualifier les identités et le bruit de sérialisation.

**Phase 4 — Exploitation (P0/P1)** : D01 à D05, puis D06 à D09 selon disponibilité BPMNSM. Objectif : déterminer les prétraitements et exigences d'import.

**Phase 5 — Consolidation** : convertir les résultats confirmés en règles de modélisation et en contrat d'unité d'export ; maintenir un registre des limites.

Les cas détaillés et leurs priorités sont dans `EA_16_1_TEST_MATRIX.csv`.

## 6. Protocole reproductible

1. Noter version et build EA, fichier modèle, version de référence et chemin exact du conteneur.
2. Décrire contenu direct, descendants, types/stéréotypes, diagrammes et références externes attendus.
3. Capturer la commande de publication, les options et les versions réellement sélectionnées.
4. Exporter **sans modifier l'original** et archiver le fichier brut.
5. Contrôler la validité XML, les éléments, relations, IDs, diagrammes et omissions.
6. Comparer contenu attendu et observé ; classer la couverture (complète, partielle, vide, non applicable).
7. Enregistrer preuves, écarts, causes possibles et conséquences pour BPMNSM.
8. Pour les cas C : conserver avant/après et comparer à la fois les fichiers bruts et les changements sémantiques.

**Statuts autorisés :** non exécuté, conforme, non conforme, à qualifier, non applicable, bloqué. Un export vide peut être un résultat de caractérisation valide et ne prouve pas à lui seul un défaut d'EA.

## 7. Fiche de résultat minimale

| Champ | Valeur à renseigner |
|---|---|
| ID de test et variante format | Ex. A07-BPMN-XML |
| Version/build EA et modèle | Valeurs exactes |
| Sélection et stéréotype | Chemin complet, type, stéréotype |
| Mécanisme et options | Menu exact, versions, options |
| Attendu / observé | Éléments, relations, diagrammes, descendants |
| Couverture et dépendances | Complète/partielle/vide ; références internes/externes |
| Identités et différences | Stable/instable/non vérifié |
| Statut et preuves | Statut, export, captures, diff |
| Conséquence BPMNSM | Prétraitement, contrat, limite ou règle méthodologique |

## 8. Critères de clôture initiale

- Un patron de processus et un patron de collaboration effectivement exportables.
- Comportement des packages parents/sous-packages connu dans les deux formats prioritaires.
- Dépendances et limites de couverture identifiées.
- Stabilité des identités contrôlée sur au moins un scénario sans changement et un scénario modifié.
- XMI 2.5.1 confirmé ou révisé sur preuves.
- Premières exigences de prétraitement et de réconciliation BPMNSM documentées.

## 9. Livrables

L1 matrice d'essais ; L2 catalogue des conteneurs exportables ; L3 guide de modélisation validé ; L4 contrat des unités *black box* ; L5 exigences d'import et de réconciliation BPMNSM ; L6 registre des décisions et anomalies.

## 10. Traçabilité avec le dépôt existant

Ce lot **complète** les travaux EA-PRE existants. Il ne remplace pas les cas, gates, contrats d'import, plans d'architecture ou documents de contexte déjà présents. Avant validation, établir des liens précis avec les identifiants et fichiers de référence du dépôt.
