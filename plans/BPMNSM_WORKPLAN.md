# BPMNSM — Workplan expérimental courant

## 1. Rôle et autorité

Ce document est la vue opérationnelle courante des travaux BPMNSM. Il ordonne les fronts ouverts et leurs gates expérimentaux ; il ne remplace ni les cibles détaillées, ni le protocole DEPP/EDED, ni le runbook de publication, ni les preuves historiques.

Le repository réel reste l'autorité du code et du worktree exact. Les statuts de capacité restent ceux établis dans les documents de cible et de capitalisation. Une ligne de ce workplan ne devient pas « implémentée » parce qu'elle est planifiée ici.

Checkpoint de référence au 2026-09-22 :

```text
branch   main
HEAD     be5f6b355a3da39dc1b51591a5ccdd7000ec9633
status   worktree volontairement chargé ; à préserver
product  Development Preview / Progress Demonstrator
```

LW13 reste suspendu. TECH-INSPECT-01 n'est pas M7. Aucun numéro M7 n'est attribué au prochain front par anticipation.

## 2. Acquis à ne pas rouvrir sans nouvelle preuve contradictoire

- Local Workspace LW01–LW12 démontré dans les frontières documentées.
- Maturation Workspace / Repository M1–M6 démontrée dans ses frontières documentées.
- M6 qualifie une Business Object Representation par `documentId` lorsqu'il est disponible sans rendre `representationId` globalement unique.
- TECH-INSPECT-01 est [IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ] : état canonique -> façade/catalogue read-only -> Technical Inspector ; principe `observer != modifier`.
- Le catalogue d'introspection est extensible ; les six sources actuelles constituent le périmètre démontré, pas une liste fermée.
- Toute nouvelle structure canonique significative doit faire l'objet d'une décision explicite d'inspectabilité.
- Architecture de distribution cible : statique/serverless ; Git externe et sous contrôle utilisateur.

## 3. Règle d'exécution

Chaque front suit la boucle :

```text
inspection ciblée du repository réel
-> précédent BPMNSM établi
-> reproduction du problème / état courant
-> expérience minimale falsifiable
-> preuve ciblée
-> régression groupée
-> décision
-> capitalisation documentaire
```

Un front suivant n'est pas automatiquement autorisé par la réussite du précédent. Une expérience peut conclure qu'aucune modification de production n'est nécessaire.

## 4. Front actif — Workspace Tree + Search

### 4.1 Pourquoi ce front est premier

La cible produit demande une navigation Workspace plus expressive tout en préparant une sémantique de Workspace capable d'héberger plusieurs référentiels autonomes et des collections indépendantes de modèles. La recherche doit préserver le contexte structurel plutôt que transformer l'arbre en liste plate.

L'inspection ciblée du 2026-09-22 a établi que :

- `src/ui/repository-browser.js` projette l'environnement dans `w2sidebar` ;
- `src/repository/environment-projection.js` produit une projection dérivée et ne porte pas le confinement BPMN comme source de vérité ;
- une même entité sémantique, notamment un Process, peut avoir plusieurs occurrences contextuelles dans l'arbre ;
- les identités d'occurrence UI et les identités sémantiques sont distinctes ;
- `render()` sait reconstruire l'arbre et restaurer d'abord l'occurrence sélectionnée, puis à défaut une occurrence portant la même identité sémantique ;
- aucun test dédié de `repository-browser` n'a été trouvé lors de cette inspection ; Vitest et jsdom sont disponibles.

Conséquence : la première expérience de recherche doit rester une transformation de projection UI. Elle ne doit pas muter `RepositoryModel`, `RepositoryDocumentStore` ni `createEnvironmentProjection()`.

### 4.2 E1 — filtre structurel pur

Statut : **[IMPLEMENTED + TARGETED TESTED + DEMONSTRATED AT MECHANISM LEVEL]**.

E1 introduit un mécanisme de filtrage structurel du Workspace Tree au niveau de la projection UI, sans modification de la projection canonique de l'Environment.

Contrat démontré :

- une requête vide restitue l'arbre complet sans reconstruction sémantique ;
- le matching porte sur `node.text` et est insensible à la casse ;
- lorsqu'un nœud correspond, ses descendants restent disponibles ;
- lorsqu'un descendant correspond, ses ancêtres sont conservés afin de préserver son contexte hiérarchique ;
- une branche sans correspondance est éliminée ;
- les données d'entrée ne sont pas mutées ;
- les identités d'occurrence existantes sont préservées ;
- `createEnvironmentProjection()` et le modèle canonique ne sont pas modifiés.

Preuve au checkpoint `be5f6b355a3da39dc1b51591a5ccdd7000ec9633` :

- `src/ui/workspace-tree-filter.test.js` : **6/6 tests verts** ;
- `src/repository/environment-projection.test.js` : **11/11 tests verts** ;
- contrôles syntaxiques verts pour le filtre, ses tests et `repository-browser.js` ;
- intégration minimale dans `repository-browser.js` via `buildVisibleNodes()`, `searchQuery`, `setSearchQuery()` et `getSearchQuery()`.

Limite de la preuve : E1 démontre le mécanisme de filtrage et son raccordement au repository browser. Il ne démontre pas encore une interface Search utilisable par l'utilisateur, ni l'ergonomie du filtrage dans W2UI.

Le gate E1 est franchi au niveau mécanisme. La capitalisation documentaire de cette preuve est portée par le présent workplan et les addenda courants de continuité.

### 4.3 E2 — intégration Search dans le Workspace Tree

Statut : **[IMPLEMENTED + TARGETED TESTED + DEMONSTRATED IN BROWSER + CAPITALIZED]**.

E2 rend le mécanisme E1 accessible dans la surface produit Workspace Tree au moyen d'un contrôle Search placé au-dessus du repository browser. Le contrôle ne porte aucun moteur de filtrage parallèle : la query utilisateur est transmise à `repositoryBrowser.setSearchQuery()` et le rendu continue d'utiliser le filtre structurel E1.

Comportement démontré :

- le champ Search est visible au-dessus du Workspace Tree ;
- le matching reste celui d'E1 : **contains**, insensible à la casse, sur `node.text` ;
- les branches sans correspondance sont masquées tout en conservant le contexte hiérarchique défini par E1 ;
- vider la query restaure l'arbre complet ;
- sélection et navigation restent fonctionnelles ;
- les refresh ultérieurs du repository browser restent cohérents avec la query courante ;
- aucune erreur E2 n'a été observée dans la console pendant la démonstration.

Preuves au checkpoint `be5f6b355a3da39dc1b51591a5ccdd7000ec9633` :

- `src/ui/workspace-tree-search.test.js` : **3/3 tests verts** ;
- régression filtre E1 : **6/6 tests verts** ;
- régression Environment projection : **11/11 tests verts** ;
- contrôles syntaxiques des fichiers E2 concernés : verts ;
- `npm run build` : succès pour Viewer, Editor et Pages ; les warnings observés n'ont pas fait échouer le build ;
- démonstration interactive dans l'application réelle via le précédent BPMNSM `npm run dev` / Vite : succès.

Limite : E2 ne généralise pas la recherche à `name + type`, Business Objects, documents ou métadonnées et n'introduit pas d'indexation générique. Ces enrichissements restent hors du Claim E2.

### 4.4 E3 — enrichissement de recherche

Statut : **[DIFFÉRÉ]**.

Nom + type est la première extension candidate après la preuve E1/E2. Business Objects, documents, métadonnées et autres facettes ne doivent être ajoutés qu'à partir d'un besoin démontré et d'une source de données clairement identifiée. Pas de moteur d'indexation générique par anticipation.

### 4.5 UX visuelle ultérieure

Icônes distinctes Workspace / CoC / Repository / Process / Collaboration / ArchiMate, identité SVG BPMNSM, About et réorganisation cohérente toolbar/menu restent dans la cible UX, mais viennent après clarification suffisante de la sémantique d'arbre. Le style ne doit pas figer prématurément une taxonomie repository encore ouverte.

## 5. Front ouvert — Repository Scope / Workspace semantics

Statut : **[CIBLE DÉCIDÉE — EXPÉRIENCES À DÉFINIR]**.

Cible : distinguer explicitement :

- Workspace comme environnement/contenant ;
- référentiels autonomes et agrégés, dont CoCs et repositories métier/BMS ;
- portée canonique propre à chaque référentiel pour objets/relations métier, règles de lint, extensions et documents/modèles participants ;
- collections non agrégées de Process, Collaboration et modèles d'entreprise/ArchiMate pouvant exister indépendamment avant inclusion éventuelle dans un référentiel.

Le comportement actuel de l'arbre ne vaut pas preuve de cette sémantique cible. Avant toute nouvelle structure canonique, inspecter ownership, persistance, activation et conséquences sur TECH-INSPECT-01.

## 6. Front ouvert — Source / Repository Inspection & Provenance

Statut : **[CIBLE DÉCIDÉE — INSPECTION D'ABORD]**.

Besoin : rendre traçable la chaîne :

```text
source document -> source element -> transformation -> canonical object
```

TECH-INSPECT-01 montre l'état canonique mais ne constitue pas à lui seul cette provenance. Première gate : inventorier ce que les adapters/imports/stores conservent déjà, ce qui est dérivable et ce qui est perdu. Aucun modèle de provenance générique ne doit être introduit avant cette preuve. Toute structure canonique nouvelle devra également satisfaire la règle d'inspectabilité.

## 7. Front ouvert — Publication Catalog

Statut : **[CIBLE DÉCIDÉE — NON DÉMONTRÉE]**.

Cible de navigation humaine :

```text
/current/
/previews/<immutable-id>/
/releases/<version>/
```

La vue GitHub Deployments n'est pas le catalogue utilisateur cible. Le front doit préserver l'architecture statique/serverless, l'identité de publication régie par `publication/versions.json` et le contrôle Git explicite. Le runbook reste l'autorité procédurale de publication.

## 8. Frontières métier encore ouvertes

Restent notamment ouvertes :

- équivalence canonique hétérogène Folder/Archive au-delà des scénarios démontrés ;
- ownership canonique général des enrichissements BPMN / Business Model ;
- certains aspects d'identités externes ;
- critère strict E15 nécessitant de vrais cas produit ;
- futures structures canoniques justifiées par des cas produit.

La frontière BOR multi-document historique est fermée par M6 dans son périmètre ; elle ne doit plus être présentée comme prochain chantier automatique.

## 9. Ordre de travail courant

Ordre décidé au 2026-09-22 :

1. finaliser et maintenir la cohérence documentaire de ce workplan ;
2. exécuter Workspace Tree + Search E1 ;
3. décider E2 à partir de la preuve E1 ;
4. poursuivre le front Workspace Tree/Search jusqu'à une tranche produit démontrable ;
5. choisir explicitement le front suivant parmi Repository Scope, Provenance, Publication Catalog ou une frontière métier réellement prioritaire ;
6. traiter identité visuelle/menu comme évolution UX alignée sur la sémantique démontrée, pas comme architecture.

Cet ordre n'est pas une promesse de réaliser tous les fronts : chaque gate peut modifier la suite.

## 10. Definition of Done d'un incrément de ce workplan

Un incrément n'est capitalisable que si : le claim et sa limite sont explicites ; les fichiers réels ont été inspectés avant solution ; la preuve ciblée est fournie ; les régressions pertinentes sont vertes ; aucune mutation canonique implicite n'est introduite ; toute nouvelle structure canonique a une décision d'inspectabilité ; la preuve runtime est fournie lorsque l'UX ou la persistance est revendiquée ; et les documents d'autorité sont mis à jour sans réécrire l'historique.

---

## Addendum — Repository Scope / Source / Resource qualification — 2026-09-22

### Statut

**[INSPECTION + EXPÉRIENCE + VALIDATION VITE — QUALIFICATION SÉMANTIQUE EN COURS]**

Le front Repository Scope a produit une preuve intégrée : plusieurs scopes techniques peuvent coexister avec leurs propres documents et états canoniques, et l'activation A → B → A restaure la projection correspondant au scope actif. La persistance Folder Save a en outre été vérifiée physiquement dans son périmètre testé.

Cette preuve ne démontre pas qu'un scope technique correspond nécessairement à un référentiel autonome au sens produit. L'ouverture réelle du dossier `BPMNSM_M6_BROWSER_PROOF` dans Vite a montré simultanément ce dossier et `runtime` dans la projection `Repositories`. L'inspection du code établit que les scopes techniques sont actuellement projetés comme Repositories et qu'un dossier ouvert reçoit un scope technique nommé d'après le dossier.

La validation utilisateur invalide donc comme sémantique cible l'assimilation automatique `folder/source == autonomous Repository`. Un dossier ouvert constitue d'abord une source ou un groupe physique de ressources dont la distribution sémantique interne n'est pas connue par le seul fait de l'ouverture. Il peut potentiellement contribuer à zéro, un ou plusieurs référentiels autonomes, à des collections non agrégées, ou à d'autres structures encore à qualifier.

Le scope `runtime` est établi comme scope technique initial. Aucune preuve ne justifie de le présenter comme un Repository métier autonome.

La frontière de travail devient :

```text
physical source
    -> resource inventory
        -> technical isolated scope
            -> qualification / membership
                -> autonomous referential and/or non-aggregated collection
```

Cette frontière est une qualification expérimentale, pas encore un nouveau modèle canonique.

L'UI emploie encore le langage « Import ... into Environment » alors que les handlers BPMN et ArchiMate ajoutent actuellement les documents au Repository actif. Les tests active-repository démontrent ce comportement technique ; la validation Vite a remis en question le contrat produit sous-jacent. La démonstration manuelle supplémentaire « import into B » est donc suspendue tant que cette sémantique n'est pas qualifiée.

Une Distribution métier/produit est identifiée comme concept potentiel à qualifier. Elle ne doit pas être confondue avec la distribution statique/serverless de l'application. Aucune structure canonique `Distribution` n'est décidée. Une éventuelle Distribution ne doit notamment pas être supposée contenue par une Source : elle pourrait être multisource et croiser plusieurs ressources ou référentiels.

### Prochaine gate

Inspecter et éprouver la chaîne réelle `Source -> Resource -> resource kind -> materializer -> RepositoryDocument -> technical scope` afin de déterminer l'identité/provenance déjà conservée, le moment où une appartenance à un référentiel autonome peut être établie, les collections restant non agrégées, la nécessité éventuelle d'une Distribution canonique et les conséquences d'inspectabilité TECH-INSPECT-01.

Ne pas refondre l'arbre avant cette gate. Ne pas considérer `folder = Repository`, `runtime = business Repository` ou `Import = membership in active Repository` comme décisions cibles acquises. Repository Scope reste donc ouvert au niveau de sa qualification sémantique, même si ses mécanismes d'isolation sont démontrés dans le périmètre testé.

## Transverse tranche — W2UI 2 functional mastery

Status: **ACTIVE DOCUMENTATION / CAPITALIZATION**.

Purpose: exploit W2UI as a system of interactive macro-components rather than as a low-level rendering library.

Authority: `BPMNSM_W2UI_2_FUNCTIONAL_MAP.md` and `BPMNSM_W2UI_2_TRACEABILITY_MATRIX.md`.

Before significant UI implementation:
1. classify the BPMNSM interaction pattern;
2. inspect the relevant official W2UI 2 component documentation;
3. inspect official examples demonstrating the composition;
4. inspect exact installed source only for unresolved behavior;
5. experiment minimally if ambiguity remains;
6. implement through public W2UI widget APIs;
7. prove unit → integration → Vite/Chrome.

This tranche is transverse and does not redefine business semantics. It temporarily precedes further ergonomic design of Resource duplication. Context-menu display is GREEN; duplication execution remains RED/unlocalized.

### W2UI completion gate

Before a new major UI tranche is declared implementation-ready, its design record must reference the applicable `UI-W2-*` requirements from `BPMNSM_W2UI_2_TRACEABILITY_MATRIX.md`.

The first planned use of this gate is the continuation of Resource duplication after localization of the current execution RED.

## Tranche UI — Environment / Diagrams / Sources — état 2026-09-23

Status `Diagrams repository-wide` : **GREEN / CLOSED IN CURRENT SCOPE**.

La composition principale utilise un unique niveau W2UI Tabs `Environment | Diagrams | Sources`. `Environment` est la projection logique, `Sources` la projection physique Source/Resource, et `Diagrams` la projection des représentations reconnues dans le Repository/workspace projeté. Aucun onglet ne doit répéter son propre rôle par une racine homonyme artificielle.

Pour BPMN, la liste `Diagrams` doit être repository-wide : elle ne dépend pas du seul document chargé dans le modeler. Les feuilles BPMN portent `documentId + diagramId`; leur activation charge le `RepositoryDocument` propriétaire puis ouvre le `BPMNDiagram` et le panneau de propriétés existant. Les représentations sont regroupées sous `BPMN Processes`, `BPMN Collaborations` et `ArchiMate`. La projection ArchiMate reste issue des documents projetés et son rendu existant est conservé.

Gate fermée par preuves concordantes : **20/20 tests ciblés GREEN**, build Viewer/Editor/Pages GREEN, preuve Chrome multi-document BPMN GREEN et ArchiMate GREEN.

### Prochaine gate UI : Sources minimal workspace

Ne pas rouvrir `Diagrams` sans nouvelle preuve de régression. Continuer sur `Sources` : garantir une représentation centrale physique minimale et fiable des Resources (`name`, `extension`, `size`), sans ouverture de BPMN/ArchiMate depuis la sélection physique ; fermer la preuve produit du `menu-check` / toggle `Show Sources tab`; conserver la duplication comme copie physique au même `relativePath` avec conflit sans mutation. La correspondance générale Resource ↔ objet logique reste hors de cette gate.
