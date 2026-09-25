# BPMNSM — Handover opérationnel — 2026-09-22

## 1. Autorité et ordre de reprise

Ce document est le point d'entrée court pour reprendre BPMNSM dans une nouvelle discussion. Le repository réel reste l'autorité du code et du worktree exact : ne jamais reconstruire le repository depuis ce handover ou depuis une archive de contexte.

Lire ensuite, dans cet ordre :

1. `public/plans/BPMNSM_WORKPLAN.md`
2. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
3. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
4. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
5. `public/plans/BPMNSM_PUBLICATION_RUNBOOK.md`
6. `public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-21.md` pour l'historique détaillé.

## 2. Checkpoint Git et sécurité du worktree

Checkpoint attendu :

```text
branch   main
HEAD     be5f6b355a3da39dc1b51591a5ccdd7000ec9633
subject  feat(model): add autonomous business relations
```

Le worktree est volontairement très chargé en fichiers modifiés et non suivis. Le préserver intégralement. Ne pas utiliser `git add -A`, `git reset`, `git clean`, commit, push, tag ou release sans autorisation explicite de l'utilisateur. `git diff --check` est silencieux au checkpoint de continuité 2026-09-22.

Pour toute modification nécessitant les fichiers exacts du worktree : collecter les fichiers ciblés dans un ZIP depuis le repository réel, modifier uniquement ces fichiers exacts, puis retourner des fichiers complets en conservant leurs chemins.

Protocole impératif pour un ZIP produit par l'assistant : fournir d'abord le ZIP et son SHA-256 ; attendre que l'utilisateur confirme son téléchargement ; seulement ensuite fournir la commande d'installation/test qui référence `~/Downloads/<zip>`. Ne jamais inverser cet ordre.

Les commandes d'inspection/preuve terminées doivent finir par :

```text
2>&1 | tee /dev/tty | pbcopy
```

Dans les gardes shell, utiliser `return`, jamais `exit`. Ne pas demander à l'utilisateur d'éditer manuellement du code.

## 3. État produit et publication

Le produit reste un **Development Preview / Progress Demonstrator**. La clôture d'une expérience ne vaut ni release nominale ni autorisation de publication. `publication/versions.json` et `BPMNSM_PUBLICATION_RUNBOOK.md` restent les autorités de publication. Aucun commit, push, tag, release ou publication n'est implicite.

L'architecture cible reste statique/serverless ; aucun backend applicatif n'est requis. Git reste externe et sous contrôle utilisateur.

## 4. Workspace / Repository

Le modèle de maturation retenu est :

- un Workspace donne accès à un Repository actif ;
- un Workspace ouvert correspond à un Repository actif ;
- `Open Workspace` établit le Repository ;
- `Import` enrichit ce Repository sans remplacer silencieusement son état ;
- `Save` persiste selon le mode de Workspace ;
- Direct Folder et Portable Workspace Archive ZIP sont deux modes d'accès/persistance ;
- `RepositoryDocument` reste l'unité physique de persistance : un `.bpmn` peut contenir plusieurs processus/collaborations/composants et n'est pas auto-découpé.

M1–M6 et M3.1 FIX1 sont démontrés dans leurs frontières documentées. LW13 reste suspendu jusqu'à décision explicite sur un nouveau front.

## 5. M6 — Business Object Representations multi-document

M6 est **[IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ]**.

`representationId` est une référence de représentation BPMN, pas une identité globale. Le même `representationId` dans plusieurs documents est légitime. `documentId` qualifie la représentation dans le Repository lorsqu'il est disponible. Il ne faut ni imposer l'unicité globale de `representationId`, ni le remplacer par un UUID, ni sérialiser `documentId` dans l'extension BPMN SemArch.

La preuve runtime Folder et Archive utilise deux documents distincts contenant le même `DataStore_1ici771` pour `BO_PERSISTENCE_PROOF`; le store canonique conserve simultanément les deux représentations qualifiées par `imported-2` et `imported-3`.

## 6. TECH-INSPECT-01 — état fermé

TECH-INSPECT-01 est **[IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ]**.

Architecture établie :

```text
état canonique
  -> façade/catalogue d'introspection read-only
      -> Technical Inspector
      -> app.technicalIntrospection
          -> window.semarchApp.technicalIntrospection pour la console
```

Principe : **observer != modifier**. L'Inspector ne dépend ni de `window.semarchApp` comme source de vérité, ni des stores mutables. `window.semarchApp` reste un escape hatch de développement utile.

Le catalogue est descriptif et extensible via `getSources()` / `addSource()`. Les six sources actuellement démontrées sont :

1. Repository Documents
2. Business Objects
3. Business Object Representations
4. Business Relations
5. Identity Origins
6. Business Object External Identities

Ces six sources sont le périmètre démontré au checkpoint, **pas une liste fermée**. Toute nouvelle structure canonique significative introduite par le design doit faire l'objet d'une décision explicite d'inspectabilité. Si elle est techniquement pertinente, elle rejoint le catalogue via une projection read-only. Ne pas auto-exposer des caches, objets UI transitoires ou autres internes JavaScript mutables.

Le Query Builder V1 reste volontairement borné à un filtre structuré par égalité et à une restitution tabulaire. Pas de mutation, JavaScript/SQL/SPARQL, jointure générique, requête sauvegardée, export, graph, requête ArchiMate ou lint dans cette frontière. `RepositoryDocument.content` reste accessible par API mais masqué dans la table. `lintResultStore`, analytique/transitoire, n'appartient pas au premier catalogue canonique.

Le menu `Technical -> Inspector…` est editor-only et placé à droite après le spacer W2UI, séparé visuellement des commandes fonctionnelles.

Preuves retenues : catalogue/UI/intégration verts ; preuve finale toolbar + Inspector + introspection + intégration 4 fichiers / 19 tests ; stores canoniques 5 fichiers / 29 tests (il n'existe pas de `src/model/business-relation-store.test.js`) ; Workspace 2 fichiers / 16 tests ; builds viewer/editor/pages verts ; `git diff --check` silencieux. Runtime M6 : 3 Repository Documents, 5 Business Objects, deux BOR qualifiées pour le même `DataStore_1ici771`, une relation `BO-LW11-PATH --demo:aggregation--> BO-LW11-APP`, deux collections d'identité vides mais interrogeables.

TECH-INSPECT-01 n'est pas renommé M7.

## 7. Règle d'évolution de l'Inspector

La Definition of Done expérimentale contient désormais cette règle : toute évolution introduisant une structure canonique significative doit décider explicitement si cette structure doit être techniquement inspectable. Si oui, l'extension se fait dans le même catalogue read-only et doit être couverte par une preuve de non-mutation et de compatibilité avec l'Inspector.

Le catalogue constitue ainsi un contrat d'observabilité technique extensible du Repository. Un futur Query Builder doit consommer ce même catalogue plutôt que créer un second modèle parallèle.

## 8. Frontières à préserver

Ne pas réintroduire RDF : l'exemple historique de valeur « blank » ne définissait pas une cible RDF.

Ne pas modifier les règles d'identité M6 par commodité d'UI. Ne pas créer d'éditeur d'identités ou de représentations sans hypothèse distincte. Ne pas confondre l'état analytique/transitoire avec l'état canonique du Repository.

Ne pas reprendre LW13 automatiquement. Le prochain incrément doit être choisi à partir d'une hypothèse falsifiable et d'une frontière encore réelle, après inspection ciblée du repository exact.

## 9. Méthode de reprise

Au début de la nouvelle discussion :

1. lire ce handover et les documents d'autorité dans l'ordre indiqué ;
2. vérifier le checkpoint Git et `git diff --check` sans modifier le worktree ;
3. considérer M1–M6 et TECH-INSPECT-01 comme acquis dans leurs frontières documentées ;
4. ne pas lancer spontanément LW13 ;
5. avant de proposer du code, identifier le prochain besoin avec l'utilisateur puis inspecter les fichiers exacts concernés ;
6. appliquer : inspection ciblée -> précédent BPMNSM établi -> reproduction -> expérience minimale falsifiable -> preuve -> régression groupée -> décision -> capitalisation.

Le point de reprise est donc volontairement ouvert : **choisir le prochain front de conception/développement à partir de l'état capitalisé, sans reconstruire ni réinterpréter les preuves déjà fermées.**
---

## Décisions produit ajoutées après constitution du checkpoint — 2026-09-22

Les décisions suivantes complètent le checkpoint sans transformer ces cibles en
fonctionnalités déjà démontrées :

1. BPMNSM doit pouvoir rendre inspectable la provenance des informations depuis
   les fichiers/référentiels jusqu'à leur état interne canonique, en complément
   de TECH-INSPECT-01.
2. Le Workspace cible distingue les référentiels autonomes et agrégés (CoCs,
   repositories métier/BMS) des collections indépendantes de processus,
   collaborations et modèles d'entreprise/ArchiMate. Chaque référentiel
   constitue notamment une portée propre pour objets/relations métier, règles
   de lint et extensions applicables.
3. La publication doit fournir un catalogue utilisateur des états persistants
   (`current`, previews/itérations, releases) au lieu de dépendre de la seule
   vue GitHub Deployments.
4. La navigation Workspace doit évoluer vers un arbre plus expressif, avec
   recherche/filtrage conservant le contexte structurel. Une identité BPMNSM
   SVG et des menus/toolbar visuellement enrichis font partie de la cible UX
   ultérieure.

**Décision de reprise :** le prochain front expérimental commence par
**Workspace Tree + Search**, en tenant compte de la structure de
l'environnement. Il doit commencer par l'inspection du worktree réel et une
expérience minimale falsifiable. Il ne constitue ni LW13 ni un « M7 » décidé
par avance.


## 10. Workplan consolidé avant reprise du code — 2026-09-22

`BPMNSM_WORKPLAN.md` est désormais la vue opérationnelle courante. Il ne remplace pas les cibles ni les preuves historiques. Il ordonne explicitement le front Workspace Tree + Search avant les autres fronts ouverts.

L'inspection préalable de `repository-browser.js` / `environment-projection.js` établit que l'arbre W2UI est une projection dérivée, que les occurrences UI et identités sémantiques doivent rester distinctes, et qu'un Process peut légitimement apparaître dans plusieurs contextes. Le premier incrément est donc **E1 — filtre structurel pur**, planifié mais non démontré : matching insensible à la casse sur `node.text`, conservation des descendants d'un match et de ses ancêtres, suppression des branches sans match, aucune mutation canonique et aucune réécriture d'identité d'occurrence.

Le patch E1 préparé avant cette consolidation reste non installé/non démontré. Après installation éventuelle, sa preuve doit précéder E2 (intégration Search visible). Repository Scope, Provenance et Publication Catalog restent des cibles ouvertes à instruire ; l'identité visuelle/menu vient après clarification suffisante de la sémantique d'arbre.

## Addendum — Workspace Tree + Search E1 — 2026-09-22

Workspace Tree + Search E1 a franchi son gate technique ciblé.

Le filtre structurel pur est implémenté au niveau de la projection UI et raccordé au repository browser sans modification de `createEnvironmentProjection()` ni du modèle canonique.

Preuves :

- filtre E1 : **6/6 tests verts** ;
- régression Environment projection : **11/11 tests verts** ;
- syntaxe des fichiers concernés validée ;
- checkpoint Git conservé : `be5f6b355a3da39dc1b51591a5ccdd7000ec9633`.

Qualification : **[IMPLEMENTED + TARGETED TESTED + DEMONSTRATED AT MECHANISM LEVEL + CAPITALIZED]**.

Cette preuve ne signifie pas que Search est déjà disponible dans l'interface produit. E2 — intégration Search dans le Workspace Tree — devient **[À INSTRUIRE]**, mais doit commencer par une inspection ciblée de l'intégration UI W2UI avant toute modification.

## Addendum — Workspace Tree + Search E2 — 2026-09-22

Workspace Tree + Search E2 a franchi son gate produit ciblé après inspection de l'intégration UI réelle.

Le contrôle Search est intégré au-dessus du Workspace Tree et délègue la query à `repositoryBrowser.setSearchQuery()` ; aucun second moteur de filtrage n'est introduit. Le matching démontré reste celui d'E1 : **contains**, insensible à la casse, sur `node.text`. Une query vide restaure l'arbre complet ; le contexte hiérarchique E1 est conservé ; sélection/navigation et refresh restent cohérents.

Preuves au checkpoint `be5f6b355a3da39dc1b51591a5ccdd7000ec9633` :

- Search UI E2 : **3/3 tests verts** ;
- régression filtre E1 : **6/6 tests verts** ;
- régression Environment projection : **11/11 tests verts** ;
- contrôles syntaxiques : verts ;
- `npm run build` : succès Viewer + Editor + Pages ;
- démonstration interactive réelle via **`npm run dev` / Vite** : succès, y compris visibilité, filtrage, restauration à query vide, navigation/sélection, cohérence au refresh et absence d'erreur E2 observée dans la console.

Qualification : **[IMPLEMENTED + TARGETED TESTED + DEMONSTRATED IN BROWSER + CAPITALIZED]**.

La preuve E2 reste limitée au Search visible fondé sur le mécanisme E1. `name + type`, Business Objects, documents, métadonnées et indexation générique restent hors de ce Claim.


---

## Addendum — point de reprise Repository Scope / Source qualification — 2026-09-22

Repository Scope a atteint un résultat expérimental intégré, mais l'incrément ne doit pas être considéré comme fermé au sens d'une sémantique produit définitive.

Acquis à préserver : coexistence de scopes techniques isolés ; stores et modèle canonique propres à chaque scope ; bascule/restauration A → B → A ; seams lifecycle Folder/Archive/Open/Import/Save couverts dans leurs frontières testées ; Save Folder physiquement vérifié puis fixture restaurée ; validation Vite de la coexistence et de la restauration de projection.

Correction sémantique essentielle pour la reprise :

```text
technical repository scope != necessarily autonomous semantic Repository
folder/source               != autonomous Repository
runtime                     != proven business Repository
```

`BPMNSM_M6_BROWSER_PROOF` est d'abord un groupe physique de fichiers dont la distribution sémantique n'est pas connue par le seul fait de l'ouverture. L'implémentation actuelle crée néanmoins un scope technique pour ce groupe et le projette sous `Repositories`; ce comportement constitue un mécanisme expérimental, pas la sémantique cible démontrée.

La cible documentaire antérieure reste pertinente : le Workspace/Environment doit pouvoir contenir plusieurs référentiels autonomes, dont CoCs et repositories métier/BMS, ainsi que des collections non agrégées de Process, Collaboration et modèles d'entreprise/ArchiMate. En revanche, les formulations antérieures « un Workspace ouvert correspond à un Repository actif », « Open Workspace établit le Repository » et « Import enrichit ce Repository » doivent désormais être lues comme modèle de maturation historique à requalifier, et non comme cible produit définitivement acquise.

Le front Source / Repository Inspection & Provenance rejoint donc directement Repository Scope. La prochaine gate doit inspecter/éprouver `Source -> Resource -> resource kind -> materializer -> RepositoryDocument -> technical isolated scope -> qualification / membership éventuelle`.

Ne pas reprendre automatiquement le scénario manuel « Import into B ». Les tests démontrent déjà que l'import résout le Repository actif, mais la validation produit a remis en question ce contrat : l'UI dit encore « Import into Environment ».

Une éventuelle Distribution métier est un concept ouvert, potentiellement multisource et orthogonal à Source/Repository. Aucune abstraction canonique `Distribution` n'est décidée.

Ne pas lancer LW13. Ne pas nommer arbitrairement la suite M7. Ne pas refondre l'arbre avant la gate Source/Resource/Repository. Toute nouvelle structure canonique significative doit faire l'objet d'une décision d'inspectabilité conformément à TECH-INSPECT-01.

Pour la prochaine conversation, commencer par l'inspection ciblée des contrats réels `repository-folder-resources.js`, `repository-resource-kind-resolver.js`, `repository-resource-materializer.js`, `repository-document-store.js`, `environment-projection.js` et `repository-scope-store.js`, puis confronter les observations au présent Workplan avant toute modification.

---

## Addendum — méthode pratique de preuve interactive — 2026-09-22

Pour la reprise, utiliser comme précédent établi la méthode de preuve croisée Terminal macOS + Console Chrome documentée dans le protocole DEPP.

Le Terminal porte les preuves du worktree réel, des tests, du build, des fichiers physiques, des SHA et de Git. La Console Chrome permet d’orchestrer et d’observer l’application réellement servie par Vite. Les deux peuvent constituer les deux faces d’une même expérience.

Quand un rapport textuel doit revenir dans la conversation, utiliser quasi systématiquement le presse-papiers lorsque cela est approprié : `2>&1 | tee /dev/tty | pbcopy` pour les preuves finales Terminal et `copy(report)` pour les rapports de Console Chrome.

Ne pas transformer les démonstrations UI en longues recettes manuelles lorsque la Console Chrome peut effectuer objectivement les manipulations. Réserver l’intervention humaine aux pickers système et aux validations réellement visuelles ou ergonomiques.

Éviter l’usage intempestif de Python, des heredocs Python, des ZIP et des fichiers intermédiaires comme mécanismes ordinaires de collaboration. Préférer les commandes Unix ciblées et les rapports Console Chrome directement copiables. Python ou un artefact fichier/ZIP n’est utilisé que lorsqu’il apporte une capacité ou un transfert réellement nécessaire.

Une anomalie de presse-papiers doit être diagnostiquée comme telle : ne jamais traiter comme preuve un collage contenant en réalité la commande, le script ou un prompt shell incomplet.

## Addendum — W2UI 2 as a structural UI capability — 2026-09-22

W2UI is now treated as a structural UI dependency whose macro-components and interaction logic must be understood before low-level UI code is introduced.

Read `BPMNSM_W2UI_2_FUNCTIONAL_MAP.md` before any significant W2UI design/debugging tranche. The required evidence vocabulary is `DOC / EX / SRC / EXP / BPMNSM-HYP`.

Method: official W2UI 2 documentation → official examples → exact installed source for ambiguity → minimal experiment if needed → BPMNSM integration/product proof.

Do not reimplement a native W2UI capability with manual DOM listeners/mutations without an explicit demonstrated reason.

Current Resource-duplication status at this checkpoint: the native W2UI context-menu surface is product-GREEN; the subsequent effective duplication into the selected target Source remains RED/unlocalized. Do not reopen context-menu debugging unless new evidence invalidates the existing proof.

## Addendum — navigation Environment / Diagrams / Sources et projection Diagrams repository-wide — 2026-09-23

Cet addendum supersède, pour cette tranche UI, les formulations antérieures qui décrivent encore la duplication Resource comme RED ou l'arbre comme une projection unique.

La navigation principale est désormais structurée par un unique composant W2UI Tabs : `Environment | Diagrams | Sources`. Ces onglets sont des vues de travail distinctes et ne doivent pas être redoublés par des racines homonymes dans leurs arbres.

- `Environment` porte la projection logique : Processes, Collaborations, CoCs, Repositories et ArchiMate selon les contrats de projection applicables.
- `Sources` porte la structure physique Source/Resource. Une Source n'est ni un Repository ni l'Environment. La structure physique ne doit pas être remodelée pour ressembler à l'Environment.
- `Diagrams` porte la projection des représentations disponibles dans le Repository/workspace projeté. Elle est organisée en `BPMN Processes`, `BPMN Collaborations` et `ArchiMate`.

La projection BPMN de `Diagrams` n'est plus dérivée seulement des `definitions` du modeler courant. Elle réutilise la projection repository-wide existante des documents BPMN. Chaque feuille BPMN conserve l'identité du `RepositoryDocument` propriétaire et l'identité du `BPMNDiagram`. Une sélection résout et charge d'abord le document propriétaire, ouvre ensuite le diagramme demandé, puis réutilise le panneau `Diagram` existant. ArchiMate conserve son chemin de rendu existant.

Preuves acquises le 2026-09-23 pour cette frontière : régression ciblée finale **20/20 tests GREEN** ; `npm run build` **GREEN** pour standalone viewer, standalone editor et pages ; preuve Chrome **GREEN** sur plusieurs BPMN appartenant à des documents différents, sur le panneau de propriétés du diagramme sélectionné et sur ArchiMate.

La frontière `Diagrams repository-wide` est donc **[IMPLEMENTED + TARGETED TESTED + BUILD GREEN + DEMONSTRATED IN BROWSER]**.

`Sources` reste la frontière suivante : la séparation physique est acquise, la duplication physique ciblée est testée, et la sélection Source ne doit pas ouvrir de diagramme. Restent notamment à fermer au niveau produit la représentation minimale fiable d'une Resource (`name / extension / size`) et la preuve interactive complète du toggle W2UI `Show Sources tab`. Ne pas introduire à ce stade une relation canonique générale Resource ↔ objet logique ; cette correspondance reste différée.

## Addendum — Workspace identity et Portable Workspace snapshot iteration — 2026-09-25

La frontière Workspace identity / Portable Workspace Archive a été clarifiée et démontrée en produit.

Le Workspace possède une identité logique propre, indépendante de son conteneur physique, de Git et du nom final choisi par le navigateur pour un téléchargement. Cette identité est portée par `.bpmnsm/workspace.json`. Le schéma courant est `formatVersion: 2` et porte notamment `workspaceId`, `name`, `createdAt`, `savedAt` et `snapshotIteration`.

Terminologie retenue :

```text
Workspace          = environnement logique identifié
Workspace snapshot = archive portable représentant un état du Workspace
snapshotIteration  = itération locale de production d'un snapshot dans la lignée ouverte
filename (1), (2)  = collision physique gérée par le navigateur, sans sémantique BPMNSM
```

Le nom demandé pour une archive suit `<workspace>-iNNN.zip`. `snapshotIteration` n'est pas une version globale et ne permet pas d'ordonner toutes les archives existantes. Le branchement est explicitement admis : réouvrir un snapshot `i001` et le sauvegarder peut produire un nouveau snapshot logique `i002` alors qu'un autre `i002` existe déjà. Le navigateur peut alors matérialiser physiquement `workspace-i002 (1).zip`; `(1)` n'est jamais une itération BPMNSM.

La compatibilité de lecture avec le manifeste historique `formatVersion: 1` est conservée : `workspaceVersion` est accepté à la lecture et projeté vers `snapshotIteration`; les nouveaux manifestes sont écrits en version 2. L'identité `workspaceId` et `createdAt` reste stable au travers des snapshots démontrés ; `savedAt` caractérise la sauvegarde du snapshot.

Preuves acquises : contrat ciblé final **8 fichiers / 31 tests GREEN** ; build Viewer/Editor/Pages GREEN lors du gate précédent ; preuve Chrome GREEN pour la progression `i001 -> i002`; preuve de branchement GREEN depuis `i001` vers un second `i002`; collision navigateur observée sous `workspace-i002 (1)` avec manifeste interne `snapshotIteration: 2`.

Conséquence d'usage : ne jamais interpréter le suffixe physique `(n)` du navigateur comme une version, une itération ou l'indication du snapshot BPMNSM le plus récent. En présence de plusieurs copies, inspecter le manifeste, notamment `workspaceId`, `snapshotIteration` et `savedAt`.

Qualification : **[IMPLEMENTED + TARGETED TESTED + BUILD GREEN + DEMONSTRATED IN BROWSER + CAPITALIZED]**.
