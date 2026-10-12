# BPMNSM — Guide méthodologique : structurer les modèles EA 16.1 pour les exports

**Référence :** BPMNSM-EA-METH-01  
**Statut :** proposition méthodologique, à confirmer par qualification  
**Date :** 2026-10-08

## 1. Contexte et besoin

BPMNSM importe et enrichit des modèles BPMN, notamment depuis Sparx Enterprise Architect (EA) 16.1. EA peut rester le système maître : les modèles évoluent dans EA et doivent pouvoir être réexportés, comparés et réconciliés avec les ressources BPMNSM. Un workspace BPMNSM peut agréger plusieurs modèles externes. Sa structure de persistance n'est pas obligatoirement celle de l'arborescence EA.

La gestion de configuration est **hybride** : exports sources externes conservés comme unités *black box* versionnées, et ressources natives BPMNSM persistées sous forme *shattered*. La provenance, les correspondances d'identité, les dépendances et les transformations doivent être traçables.

## 2. Problème méthodologique

Un Root Model, un package EA, un processus BPMN, une collaboration BPMN et une unité d'export sont des concepts distincts. Le contenu exporté peut varier selon le niveau de sélection, le containment, les stéréotypes, les options et le mécanisme de publication. Une observation utilisateur dans EA 16.1 : l'export BPMN 2.0 XML d'un modèle racine a produit un résultat vide. **Cette observation ne doit pas être généralisée aux autres sélections ni aux autres formats sans test.**

Le guide doit établir quels conteneurs peuvent être sélectionnés pour produire des unités d'export suffisamment complètes, stables, reproductibles et interprétables.

## 3. Choix de formats — état des décisions

- **BPMN 2.0 XML** : référence pour vérifier la sémantique BPMN, les collaborations, processus et représentations BPMN-DI.
- **XMI 2.5.1** : candidat **prioritaire de travail** pour les exports EA et leurs prétraitements avant import BPMNSM, en raison de sa lisibilité et de sa moindre verbosité observées dans l'expérience de modélisation. La fidélité et la couverture restent à vérifier.
- **XMI 1.1** : mécanismes historiques de baselines / comparaison EA ; ne pas assimiler leur sérialisation aux exports BPMN ou UML/XMI via Publish.
- Distinguer **version XMI** et **version du métamodèle UML**. Relever les libellés et versions exacts proposés par EA 16.1 ; ne pas présumer que toutes les variantes sont disponibles dans le même dialogue.

## 4. Recommandations provisoires aux modeleurs

**M01 — Séparer navigation et publication.** Les packages de classement ne sont pas automatiquement des unités d'export. Désigner explicitement les périmètres publiables.

**M02 — Préserver les containments BPMN.** Un processus contient ses éléments de flux ; un sous-processus embarqué contient son flux interne ; un Call Activity référence un élément appelé ; une collaboration contient les participants et échanges. Ne pas utiliser la hiérarchie des packages pour simuler ces relations.

**M03 — Éviter la dispersion d'un processus.** Regrouper ses définitions et représentations dans un périmètre cohérent ; qualifier les références externes lorsqu'elles sont nécessaires.

**M04 — Identifier les processus réutilisables.** Conserver leur identité propre et documenter les relations d'appel inter-unités.

**M05 — Distinguer collaboration et processus.** Identifier les participants, leurs processus, les Message Flows et les dépendances entre unités.

**M06 — Stabiliser les identités.** Préférer la modification d'éléments existants à leur duplication/remplacement lorsque l'identité métier doit être conservée ; mesurer l'effet des déplacements EA.

**M07 — Documenter les dépendances.** Pour toute unité candidate, identifier les éléments externes requis, les références et les éventuelles lacunes de sérialisation.

**M08 — Ne pas calquer la persistance BPMNSM sur l'arborescence EA.** L'organisation source et le découpage des ressources *shattered* sont indépendants et reliés par une correspondance explicite.

**M09 — Conserver l'export original.** Les prétraitements produisent des dérivés reproductibles, sans écraser la source *black box*.

**M10 — Ne rendre normative une règle de sélection qu'après qualification.** Les structures ci-dessous sont des **patrons candidats**, non des garanties d'export EA.

## 5. Patron candidat de structure EA

```text
Root Model (organisation seulement)
├── Domaine A (package de classement)
│   ├── Processus A1 (unité candidate)
│   │   └── Définition BPMN / diagrammes
│   └── Processus A2 (unité candidate)
├── Collaborations (classement)
│   └── Collaboration C1 (unité candidate)
└── Processus réutilisables (classement)
    └── Processus R1 (unité candidate)
```

La structure physique exacte (package, élément BPMN, diagramme) sera ajustée selon la couverture réellement obtenue à l'export. Une racine ou un package parent peut organiser les modèles sans être directement exportable en BPMN XML.

## 6. Qualification à effectuer

Qualifier la sélection (racine, package parent, feuille, BPMN/non-BPMN, mixte), la profondeur (direct/descendants), les formats et options, la présence des processus/collaborations/diagrammes, les références externes, la stabilité des identifiants, les diffs sans changement et les modifications contrôlées. Voir `EA_16_1_QUALIFICATION_PLAN.md` et `EA_16_1_TEST_MATRIX.csv`.

## 7. Critères de validation d'un patron

Un patron est recommandable si le périmètre est reproductible, sa couverture connue et suffisante, les dépendances traçables, les identités exploitables et les limitations documentées. Les résultats de tests deviennent alors des règles du guide ; les hypothèses non vérifiées restent explicitement provisoires.

## 8. Références

- Sparx Enterprise Architect 16.1, documentation *Model Exchange* : https://sparxsystems.com/resources/user-guides/16.1/publish/model-exchange.pdf
- Sparx Enterprise Architect 16.1, documentation BPMN 2.0 : https://www.sparxsystems.com/enterprise_architect_user_guide/16.1/modeling_languages/modeling_with_bpmn_2_0.html
- Contexte BPMNSM et contrats EA-PRE du dépôt : à rapprocher des documents existants avant validation normative.
