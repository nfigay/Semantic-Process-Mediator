# BPMNSM — Handover opérationnel — 2026-09-21

## 0. Autorité et ordre de lecture

Ce document est le point d'entrée court du checkpoint post-LW12. Le repository réel reste l'autorité du code et du worktree.

Lire dans cet ordre :

1. `public/plans/HANDOVER_BPMNSM_2026-09-21.md`
2. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
3. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
4. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
5. `public/plans/BPMNSM_PUBLICATION_RUNBOOK.md` avant toute publication

## 1. Checkpoint Git observé

```text
branch       main
HEAD         be5f6b355a3da39dc1b51591a5ccdd7000ec9633
subject      feat(model): add autonomous business relations
worktree     très chargé ; nombreux changements et fichiers non suivis à préserver
diff check   silencieux au checkpoint de capitalisation
```

Ne pas reconstruire le repository depuis ce handover. Ne pas utiliser `git add -A`, `reset`, `clean` ou une opération destructive. Aucun commit, push, tag ou release sans autorisation explicite.

## 2. Gate Business Model

- E14 — enrichissement de relation BPMN : **[IMPLÉMENTÉ + DÉMONTRÉ]**.
- E15 — Object Properties vs relations BPMN : **[NON IMPLÉMENTÉ]** au sens strict « cas produit réels » ; E15-01/02/03 restent des comparaisons architecturales contrôlées.
- E16 — nécessité de `BusinessRelation` : **[IMPLÉMENTÉ + DÉMONTRÉ]** grâce au cas produit `Path --aggregation--> Application`.
- E17-01 reste parqué.

Règle : BPMN natif reste BPMN natif ; une ObjectProperty porte une propriété contextuelle ; une BusinessRelation porte un fait métier BO→BO autonome lorsqu'il n'est pas correctement exprimé ou dérivable autrement.

## 3. Business Model autonome acquis

Sont démontrés : BusinessModelResource, BusinessModelDocument format-agnostique, codec JSON `formatVersion: "1"`, coexistence comme `RepositoryDocument kind: business-model`, identité externe préservée par le codec, et Business Model Explorer w2ui comme vue centrale.

Les BO créés par l'utilisateur sont des données de modèle, pas des instances codées en dur. Les nouvelles identités BPMNSM utilisent `createGuid()` ; `BusinessObject.name` est un libellé humain optionnel et non unique.

## 4. Local Workspace LW01–LW12

LW01 à LW12 sont **[IMPLÉMENTÉ + DÉMONTRÉ]** dans leurs frontières respectives ; LW08 a été démontré sans modification de production.

Acquis principaux :

- sélection d'un répertoire arbitraire autorisé par le navigateur ;
- inventaire récursif ;
- classification `.bpmn`, `.archimate`, `.business.json` ;
- RepositoryDocuments conservant les chemins relatifs ;
- plusieurs BPMN projetés séquentiellement ;
- ArchiMate réel ouvrable depuis le workspace ;
- Save Local Workspace multi-document ;
- chargement d'un Business Model JSON vers les stores canoniques BO/BR ;
- mutation canonique BO/BR resérialisée vers le RepositoryDocument Business Model ;
- Save physique et fresh reload du Business Model.

Principe physique : **Read permissively — Create conventionally — Save conservatively.**

## 5. Preuve finale LW12

Fixture initial : 2 BO + 1 BR (`Path --demo:aggregation--> Application`).

Runtime : création UI de `LW12 Persisted Application` avec UUID `09788079-2bf9-4c58-8642-d47cac5fa20b`. `Save Local Workspace` observe exactement un document dirty, `enterprise.business.json`, l'écrit et le relit avec `contentMatchesPhysicalFile: true`.

Le fichier physique est ensuite relu par le codec comme 3 BO + 1 BR. SHA observé :

```text
ab037f1d50db009a66ea1cdcb245d5c80af7021b5fa71a99957816cd9348db75
```

Après reload complet du navigateur et nouvel Inventory du même workspace, le Business Model Explorer retrouve les 3 BO et la relation. LW12 est donc **[IMPLÉMENTÉ + DÉMONTRÉ]** sur la chaîne session → fichier → session fraîche.

## 6. Ce que LW12 ne démontre pas

Ne pas déclarer l'équivalence canonique complète du repository. Restent ouverts : qualification multi-document des BusinessObjectRepresentation, round-trip conjoint des liens BO↔BPMN et enrichissements, édition canonique des Identity Origins / external identities, et scénario global hétérogène complet.

Le contrat actuel de représentation `{ businessObjectId, representationId }` peut être ambigu si deux BPMN réutilisent le même id local ; ce point doit être inspecté avant toute modification.

## 7. Workspace Archive portable LW-ZIP-01–LW-ZIP-11

La voie Workspace Archive est maintenant **[IMPLÉMENTÉE + DÉMONTRÉE]** jusqu'à la matérialisation produit, l'activation/hydratation du Business Model et la projection/registration BPMN par les mêmes primitives que le Local Workspace.

Acquis :

- LW-ZIP-01/02 : génération et commande `Save Workspace Archive…` à partir des `RepositoryDocument` dirty ;
- LW-ZIP-03 : lecture du sous-ensemble ZIP produit par BPMNSM vers des ressources `{ path, content }`, avec préservation UTF-8/chemins et vérification CRC32 ;
- LW-ZIP-04 : ressources reconnues matérialisées comme `RepositoryDocument`, `fileName = path`, contenu exact, `dirty = false`, ressources `unknown` ignorées ;
- LW-ZIP-05 : commande editor-only `Open Workspace Archive…`, picker `.zip`, lecture binaire, matérialisation et rendu dans le Repository Browser sans `showDirectoryPicker()` ;
- LW-ZIP-06 : primitive commune `activateRepositoryBusinessModel()` à partir de `RepositoryDocument` déjà matérialisés ;
- LW-ZIP-07 : `Open Local Workspace…` réutilise cette activation commune ; preuve navigateur de l'hydratation BO/BR ;
- LW-ZIP-08 : `Open Workspace Archive…` réutilise la même activation ; preuve ZIP → 4 `RepositoryDocument` → Business Model activé → 3 BO + 1 BR ;
- LW-ZIP-09 : primitive commune `projectRepositoryBpmnDocuments()` ; filtrage BPMN, ordre séquentiel, activation, `loadDiagram()`, `registerBpmnDocument()` et agrégation des composants démontrés ;
- LW-ZIP-10 : `Open Local Workspace…` réutilise cette projection commune ; preuve navigateur avec 4 `RepositoryDocument`, 3 BO + 1 BR, 2 BPMN projetés et 2 composants ;
- LW-ZIP-11 : `Open Workspace Archive…` réutilise la même projection ; preuve navigateur avec les mêmes primitives BM et BPMN après matérialisation.

Preuve ciblée finale LW-ZIP-11 : Node 22.22.2, 5 fichiers de tests, 10 tests, 0 échec, `git diff --check` silencieux.

Archive de preuve réutilisée pour LW-ZIP-11 :

```text
BPMNSM_LW_ZIP_08_PROOF.zip
SHA-256 9502b28ecf0042c08f7ba8a68144924b81ffccc9fee033e3a4fda030e2356104
resourceCount: 4
repositoryDocumentCount: 4
loadedBusinessModelState.repositoryDocumentId: "imported-1"
Business Model: 3 BO + 1 BR
projectedBpmnDocuments: 2
projectedBpmnComponents: 2
```

La preuve navigateur observe les BPMN dans l'ordre `processes/order.bpmn`, puis `processes/nested/secondary.bpmn`, et les composants `Order Process`, puis `Local Workspace Process`. `architecture/landscape.archimate` reste matérialisé comme quatrième document.

Les deux voies convergent donc désormais, après matérialisation, sur **la même activation du Business Model et la même projection BPMN**. Le modèle de workspace conserve deux modes complémentaires de premier rang : **Direct folder access** lorsque la File System Access API est disponible, et **Portable Workspace Archive** sans cette dépendance. Git reste externe et sous contrôle utilisateur. L'architecture statique/serverless reste valide.

Frontière : ne pas déclarer une équivalence fonctionnelle ou canonique complète. Direct folder conserve ses `FileSystemFileHandle` et l'écriture physique directe ; Workspace Archive repose sur l'export/import ZIP. Le codec ZIP reste limité au sous-ensemble BPMNSM démontré. L'application Git automatique, l'équivalence canonique hétérogène complète et les round-trips encore ouverts restent non démontrés.

## 8. Itération de maturation décidée avant publication et avant LW13

LW13 reste suspendu. Le prochain front n'est plus un choix ouvert entre round-trip, représentations ou publication : une **itération de maturation Workspace / Repository / Import sémantique** est décidée avant toute décision de push/publication.

Cette itération n'est pas une release et ne constitue pas un gel fonctionnel. D'autres modifications pourront être nécessaires avant qu'une frontière de release soit définie.

Le contrat directeur est : `1 Workspace ouvert = 1 Repository actif`. Le Repository est l'ensemble logique des documents et connaissances ; le Workspace est son mécanisme d'accès/persistance. Les deux modes restent **Direct Folder** et **Portable Workspace Archive**. `Open Workspace…` établit le Repository actif ; `Import into Repository…` l'enrichit ; `Save` persiste selon le mode de Workspace.

Fronts de l'itération :

- standalone autonome, sans liens vers des HTML absents de l'artefact ;
- UX Workspace/Repository nettoyée, avec détection dynamique de l'accès dossier et explication intégrée du workflow ZIP ;
- distinction explicite Open Workspace / Import into Repository et ownership/persistance des imports ;
- conservation d'un BPMN multi-process/collaboration comme un `RepositoryDocument` pouvant projeter plusieurs composants ;
- import sémantique progressif et non destructif : références absentes conservées, ressources `unresolved` enrichissables ultérieurement, conflits explicites ;
- distinction stricte entre une valeur/ressource sans définition complète et l'état `unresolved` : l'absence d'une information descriptive n'implique pas à elle seule une référence non résolue.

Le contrat détaillé d'import sémantique est capitalisé dans `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`. La cible Workspace/UX/standalone et ses critères d'acceptation sont capitalisés dans `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`.

`BPMNSM_PUBLICATION_RUNBOOK.md` reste l'autorité pour une future publication. Aucun commit, push, tag ou promotion de release n'est impliqué par cette décision d'itération.

## 9. Discipline de travail

Séquence impérative : inspection ciblée → précédent établi → reproduction → expérience falsifiable minimale → evidence → régression groupée → décision → capitalisation.

Pour toute modification : ZIP d'entrée depuis les fichiers exacts du worktree, ZIP de sortie avec fichiers complets et chemins repository, installation manuelle puis vérification. Les archives de transfert sont placées dans `~/Downloads`. Les inspections finies utilisent `2>&1 | tee /dev/tty | pbcopy`. `rg` n'est pas disponible. Pour Vitest 5, Node 22.22.2 via nvm. Ne pas demander à l'utilisateur d'éditer manuellement le code.

## 10. Point de reprise — itération Workspace / Repository / Import sémantique

LW-ZIP-01 à LW-ZIP-11 restent démontrés dans leurs frontières. La convergence BM+BPMN entre Direct Folder et Workspace Archive est acquise, mais l'équivalence fonctionnelle/canonique complète n'est pas déclarée.

Le prochain travail commence par **une inspection ciblée unique du worktree réel**, avant toute modification. Elle doit cartographier :

1. les commandes et menus actuels Workspace / Repository / import / chargement de modèle ;
2. la détection et l'usage actuels de `showDirectoryPicker()` et les comportements lorsque cette API est absente ou désactivée ;
3. les liens/pages de contexte exposés par l'accueil et leur disponibilité réelle dans les artefacts standalone ;
4. le chemin actuel d'import BPMN jusqu'aux `RepositoryDocument`, leur `fileName`, leur dirty state, leur ownership et leur sauvegarde ;
5. la projection d'un document BPMN contenant plusieurs Process/Collaboration ;
6. l'encodage des enrichissements BPMNSM dans BPMN, notamment références Business Object / relations / identités ;
7. le comportement actuel lorsqu'une ressource sémantique référencée est absente ;
8. la sémantique actuelle des identités ainsi que les points de fusion/résolution éventuels.

À partir de cette inspection seulement, formuler des expériences falsifiables minimales. L'ordre cible est : contrat réel Document/Component/références -> import partiel/résolution -> ownership et persistance -> UX Open/Import/Save -> standalone autonome -> scénario navigateur intégré -> capitalisation.

Ne pas demander à l'utilisateur d'éditer manuellement le code. Pour chaque modification, repartir des fichiers exacts du worktree via ZIP d'entrée et fournir un ZIP complet d'installation. Ne pas inventer un numéro LW avant d'avoir identifié une hypothèse expérimentale précise.

LW13 sur `BusinessObjectRepresentation` reste suspendu pendant cette itération, sauf si une expérience minimale démontre qu'il doit être abordé pour satisfaire le contrat d'import. Ne pas déclarer une release prête à l'issue de cette seule itération : une décision de maturité et une frontière de publication devront être prises séparément après les preuves.



## 11. Capitalisation de l'itération de maturation M1–M3

L'itération Workspace / Repository / Import sémantique décrite en section 8 et préparée en section 10 a été exécutée en trois tranches rapides M1–M3, avec deux corrections UX M3 FIX1/FIX2. **Elle est démontrée dans ses frontières et devient le nouveau checkpoint fonctionnel de reprise.** La section 10 reste l'historique du plan qui a conduit à cette campagne ; elle ne décrit plus le prochain travail à effectuer.

Résultats capitalisés :

- `1 Workspace ouvert = 1 Repository actif` est le contrat utilisateur retenu ; Workspace est l'accès/persistance, Repository le contenu logique ;
- l'éditeur expose un seul menu principal `Workspace`, structuré par intentions Open / Import / Save ; les anciennes entrées concurrentes Repository ne sont plus exposées dans ce menu ;
- Direct Folder et Portable Workspace Archive restent deux modes de premier rang ; la capability Folder est centralisée et testable avec `workspaceFolderAccess = auto | enabled | disabled` ;
- l'absence/désactivation simulée du picker et le refus runtime sont couverts par tests déterministes ; la preuve navigateur réelle de cette campagne a été faite avec picker présent et autorisé ;
- l'import sémantique progressif conserve les références valides non résolues, permet leur enrichissement/résolution ultérieur par identité et rend les contradictions éprouvées explicites plutôt que silencieusement écrasées ;
- le scénario `unresolved -> Save Workspace Archive -> reopen -> unresolved -> import identité -> resolved/enriched` est démontré ;
- un fichier BPMN physique reste un `RepositoryDocument` unique pouvant projeter plusieurs composants associés au même `documentId`, sans split implicite ;
- la campagne finale M3 FIX2 est verte : 13 fichiers de tests, 46 tests passés, syntaxe valide, `git diff --check` silencieux et contrôle navigateur du menu Workspace conforme.

Le menu éditeur démontré expose : `Open Workspace Folder…`, `Open Workspace Archive…`, `Import BPMN…`, `Import ArchiMate…`, `Save Workspace Folder`, `Save Workspace Archive…`. Le mot Repository reste légitime dans le modèle et les vues de contenu, mais ne doit pas redevenir une hiérarchie concurrente pour Open/Import/Save.

Les limites à ne pas surinterpréter restent : environnement Enterprise réellement bloqué non observé dans le navigateur  ; équivalence canonique hétérogène complète Direct Folder/Archive non déclarée ; création/ownership de nouveaux chemins Direct Folder encore à qualifier ; ownership canonique complet BPMN enrichi / Business Model non tranché ; `BusinessObjectRepresentation` multi-document et ambiguïtés d'identifiants toujours ouverts ; aucune conclusion de readiness de publication.

## 12. Nouveau point de reprise après M3 FIX2

Ne pas recommencer l'inspection générale prévue en section 10 : elle a été exécutée et a conduit à M1–M3. Reprendre depuis les preuves capitalisées ci-dessus et choisir la prochaine expérience uniquement à partir d'une frontière encore ouverte.

LW13 reste **suspendu** tant qu'une décision explicite ne choisit pas la qualification multi-document de `BusinessObjectRepresentation` comme prochain front. Les autres candidats légitimes incluent la qualification réelle d'un déploiement Archive-only/Enterprise, les règles de création/persistance de nouveaux documents dans Direct Folder, l'ownership canonique des enrichissements sémantiques, ou la maturation standalone/publication. Ne pas en sélectionner un par défaut sans hypothèse falsifiable et inspection ciblée des seuls fichiers nécessaires.

La discipline reste inchangée : repository réel autoritaire ; ZIP d'entrée exact avant modification ; patch minimal ; preuve groupée ; capitalisation. Aucun commit, push, tag, release ou publication n'est autorisé par cette capitalisation. `BPMNSM_PUBLICATION_RUNBOOK.md` reste l'autorité si une future décision de publication est prise.

## 13. Capitalisation M3.1 FIX1 — fermeture des contenus contextuels standalone

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

M3.1 a fermé une lacune urgente des distributions standalone : les contenus
HTML contextuels accessibles depuis la page d'accueil ne dépendent plus de
pages HTML voisines absentes d'un artefact standalone.

La solution démontrée conserve les pages de présentation séparées pour les
distributions web et embarque dans le bundle applicatif les quatre contenus
contextuels utilisés par l'accueil :

- Interoperability of Meaning ;
- BPMNSM ;
- ArchiCG ;
- Strategic Standards Radar.

Dans les standalone Viewer et Editor, les cartes de contexte ouvrent ces
présentations dans une boîte de dialogue interne via un document embarqué.
La première preuve navigateur M3.1 a révélé une insuffisance : les menus
internes fondés sur des ancres `#...` pouvaient sortir du document embarqué
et renvoyer vers BPMNSM. M3.1 FIX1 intercepte ces ancres dans la présentation
embarquée et effectue la navigation vers la section cible sans quitter cette
présentation.

Preuves finales M3.1 FIX1 :

- SHA du paquet FIX1 :
  `c5bb119f1e58021acb5ad7a88a197a2179d0526d840426e9d347ab8bb41aaaf5` ;
- SHA installé de `src/ui/views/welcome-view.js` :
  `e998ccacce543b5b68d11228ac8d64d02960d0b00921c257c860a624741c1bd3` ;
- `npm run build:viewer` et `npm run build:editor` réussis ;
- logique de navigation interne (`scrollIntoView` et interception des ancres)
  présente dans les deux artefacts standalone ;
- aucune dépendance locale `presentations/*.html` détectée dans les deux
  standalone ;
- `git diff --check` silencieux ;
- contrôle navigateur final : les quatre présentations s'ouvrent et leurs
  navigations internes restent dans la présentation correspondante.

Frontière de preuve : M3.1 démontre l'autonomie des contenus contextuels
accessibles depuis l'accueil vis-à-vis de fichiers HTML voisins. Il ne
démontre pas l'absence de toute ressource réseau éventuellement référencée
par le contenu des présentations (par exemple des polices web).

Cette fermeture est distincte de la décision de publication : elle ne
constitue ni une release ni une autorisation de commit, push, tag ou
publication.

## 14. Point de reprise après M3.1 FIX1

M1–M3 et M3.1 FIX1 sont démontrés dans leurs frontières respectives. LW13
reste suspendu. Le prochain incrément de maturation à examiner est M4, avec
en priorité la fermeture du cycle de persistance Direct Folder pour les
nouveaux imports et la preuve de la configuration déployable de la capacité
Workspace Folder.

## 15. Capitalisation M4 — persistance Direct Folder des nouveaux imports

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

M4 ferme la frontière de persistance Direct Folder identifiée après M3.1 pour
les nouveaux `RepositoryDocument` importés dans un Workspace Folder actif.

Le contrat démontré est : **Import enrichit le Repository actif ; Save
Workspace Folder persiste cet état dans le Workspace Folder**. L'import ne
crée pas immédiatement un fichier physique. Lors du Save, un document dirty
qui ne possède pas encore de `FileSystemFileHandle` est matérialisé à partir
de son `RepositoryDocument.fileName`, interprété comme chemin relatif au
Workspace. Les répertoires intermédiaires sont résolus/créés récursivement si
nécessaire. Les chemins absolus, segments vides, `.` / `..`, antislash et NUL
sont rejetés par le résolveur de chemin.

La sauvegarde conserve la règle de sûreté déjà établie : écriture, fermeture,
relecture physique, comparaison exacte avec `RepositoryDocument.content`,
puis seulement passage de `dirty` à `false`. Un échec laisse le document dans
la liste des échecs et ne prétend pas l'avoir persisté.

M4 supprime également la création anticipée d'un fichier vide lors des imports
BPMN/ArchiMate en mode Folder : la matérialisation physique appartient au Save.

Preuves automatisées M4 :

- `src/workspace/workspace-repository-file-handle.test.js` : 9/9 tests verts ;
- campagne Workspace groupée : 5 fichiers / 22 tests verts ;
- syntaxe valide et `git diff --check` silencieux après correction documentaire.

La preuve navigateur a exercé le cycle réel File System Access API avec un BPMN
absent du dossier avant import : ouverture du Workspace Folder, import dans le
Repository, absence physique avant Save, `Save Workspace Folder`, présence
physique après Save, réouverture du même Workspace et redécouverte/utilisation
du BPMN.

Pendant cette preuve, un défaut indépendant du mécanisme de persistance a été
révélé : après le renommage du menu principal en `Workspace`, le dispatcher du
toolbar ne reconnaissait pas `workspace:import-environment` ni
`workspace:import-archimate-environment`. Le FIX ajoute ces deux cibles et un
test de non-régression ; les commandes Import BPMN et Import ArchiMate
retrouvent leur confirmation et leur sélecteur de fichier.

Frontière de preuve : le navigateur démontre la matérialisation d'un BPMN à la
racine du Workspace. La résolution/création de chemins relatifs imbriqués est
démontrée par tests automatisés. M4 ne déclare pas une équivalence canonique
hétérogène complète Direct Folder/Archive et ne ferme pas les questions
multi-document de `BusinessObjectRepresentation`, Identity Origins/identités
externes ou ownership canonique complet.

LW13 reste **suspendu** jusqu'à décision explicite. Aucun commit, push, tag,
release ou publication n'est autorisé par cette capitalisation.


## 16. Capitalisation M5 — état canonique de session des identités

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

M5 ferme l'asymétrie de session qui subsistait après LW12/M4 pour les deux
collections d'identité du Business Model. `IdentityOrigin` et
`BusinessObjectExternalIdentity` appartiennent désormais à l'état canonique
actif de session au même titre que `BusinessObject` et `BusinessRelation`.

Un `IdentityOriginStore` dédié complète les stores existants. Le
`BusinessObjectExternalIdentityStore` existant est également instancié comme
store actif de l'application. `activateRepositoryBusinessModel()` hydrate les
quatre collections depuis le document Business Model et remplace leur état
antérieur ; l'ouverture d'un Workspace Folder et celle d'un Workspace Archive
utilisent ce même contrat d'activation.

La synchronisation du Business Model est extraite dans un mécanisme dédié et
reconstruit le document à sérialiser depuis les **quatre stores actifs**. Elle
ne recopie plus `identityOrigins` ni `businessObjectExternalIdentities` depuis
le snapshot du document initial. Une preuve falsifiable injecte volontairement
des identités stale dans ce snapshot et des identités différentes dans les
stores : le document synchronisé reflète les stores actifs.

Preuves M5 :

- campagne ciblée : 9 fichiers / 44 tests, tous verts ;
- régression groupée Workspace / Repository / Business Model M1–M5 :
  18 fichiers / 86 tests, tous verts ;
- syntaxe valide et `git diff --check` silencieux ;
- preuve navigateur : cycle réel `Open Workspace Folder -> activation ->
  mutation métier -> Save Workspace Folder -> changement de Workspace ->
  reopen`, avec Business Model retrouvé et mutation persistée.

Frontière : M5 démontre l'activation, la conservation et la sérialisation
canoniques en session des Identity Origins et identités externes. Il
n'introduit pas d'interface d'édition spécifique de ces identités, ne définit
pas une politique générale de résolution/fusion au-delà des règles déjà
démontrées, ne tranche pas l'ownership canonique complet entre BPMN enrichi et
Business Model, et ne reprend pas la qualification multi-document de
`BusinessObjectRepresentation`.

Les exemples antérieurs d'éléments « blancs » fondés sur une technologie de
graphe particulière ne font pas partie de la cible produit BPMNSM et sont
retirés des frontières de maturation. Le principe général reste : une
information absente ou un élément sans valeur descriptive complète n'est pas,
à lui seul, synonyme d'une référence `unresolved`.

## 17. Point de reprise après M5

M1–M5 et M3.1 FIX1 sont démontrés dans leurs frontières documentées. Le
prochain incrément ne doit pas réouvrir M5 par défaut. Il doit être choisi à
partir des frontières encore réelles : équivalence canonique hétérogène
Folder/Archive, environnement Enterprise réellement contraint, ownership
canonique des enrichissements, maturation publication/standalone, ou
qualification multi-document de `BusinessObjectRepresentation`.

LW13 reste **suspendu** jusqu'à décision explicite. Aucun commit, push, tag,
release ou publication n'est autorisé par cette capitalisation.

## 18. Capitalisation M6 — qualification documentaire des Business Object Representations

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

M6 ferme la frontière multi-document identifiée après M5 pour
`BusinessObjectRepresentation`. `representationId` reste la référence vers une
représentation dans un modèle BPMN ; il n'est ni remplacé par un UUID, ni rendu
globalement unique dans le Repository. Lorsqu'un contexte documentaire existe,
la représentation canonique porte en plus le `documentId` du
`RepositoryDocument` qui contient le BPMN.

Le store conserve donc distinctement, pour un même `BusinessObject`, deux
représentations portant le même `representationId` lorsque leurs `documentId`
diffèrent. Le contexte documentaire n'est pas sérialisé dans l'extension
SemArch BPMN : il est fourni par le `RepositoryDocument` contenant lors de la
projection.

La projection Repository BPMN transmet désormais ce contexte à
`projectBusinessObjectRepresentations(...)`. Les chemins réels
`Open Workspace Folder` et `Open Workspace Archive` fournissent les stores
Business Object / Business Object Representation à cette projection. Le chemin
historique `Open Repository` transmet également son `repositoryDocument`.

Preuves M6 :

- RED primitive : deux documents portant le même `representationId` étaient
  initialement réduits à une seule représentation ;
- GREEN primitive : qualification par `documentId`, sans contrainte d'unicité
  globale de `representationId` ;
- RED d'intégration : la projection Repository n'appelait pas encore la
  projection des représentations ;
- GREEN d'intégration et wiring runtime Folder / Archive / Open Repository ;
- régression groupée : 18 fichiers / 83 tests, tous verts ;
- `git diff --check` silencieux ;
- preuve navigateur Folder : `process-a.bpmn` (`imported-2`) et
  `process-b.bpmn` (`imported-3`) portent tous deux
  `BO_PERSISTENCE_PROOF / DataStore_1ici771` et le store canonique contient
  simultanément les deux entrées qualifiées par leurs `documentId` ;
- preuve navigateur Archive : le même scénario produit les mêmes deux entrées
  canoniques distinctes.

Frontière : M6 ne définit pas `representationId` comme identité globale, ne
modifie pas la sérialisation SemArch de la représentation, ne crée pas
d'éditeur d'identités ou de représentations, et ne tranche pas l'ownership
canonique général des enrichissements entre ressources.

LW13 reste **suspendu**. M6 traite la qualification documentaire nécessaire à
la maturation Workspace / Repository ; il ne constitue pas une reprise
automatique de la séquence historique LW13. Aucun commit, push, tag, release
ou publication n'est autorisé par cette capitalisation.

## 19. Capitalisation TECH-INSPECT-01 — Technical Inspector / Repository Query

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ]**.

TECH-INSPECT-01 établit une frontière d'observabilité technique explicitement
**read-only** au-dessus de l'état canonique. `window.semarchApp` reste un escape
hatch de développement, mais l'Inspector ne dépend ni de cette globale ni des
stores mutables : `app.technicalIntrospection` fournit la façade d'observation
consommée par l'UI et reste également accessible depuis la console via
`window.semarchApp.technicalIntrospection`. Le contrat est `observer != modifier`.

L'implémentation introduit un catalogue extensible (`getSources()` / `addSource()`)
qui pilote génériquement le sélecteur, les champs et les colonnes de l'Inspector.
Les six sources démontrées au checkpoint sont : Repository Documents, Business
Objects, Business Object Representations, Business Relations, Identity Origins
et Business Object External Identities. Cette liste est un **périmètre démontré
actuel**, pas une liste fermée : toute nouvelle structure canonique significative
introduite par le design doit faire l'objet d'une décision explicite
d'inspectabilité ; lorsqu'elle est pertinente, elle rejoint le catalogue sans
auto-exposer les objets JavaScript internes ou transitoires.

La première surface reste volontairement bornée : résultats tabulaires, filtre
structuré par égalité, aucune mutation, aucun JavaScript/SQL/SPARQL, aucune
jointure générique, requête sauvegardée, export, vue graphique, requête ArchiMate
ou lint. `RepositoryDocument.content` reste accessible par l'API mais est masqué
dans la table pour préserver la lisibilité. Les résultats de lint, analytiques et
transitoires, ne font pas partie du premier catalogue canonique.

Preuves automatisées et de régression :

- contrat TECH-INSPECT / UI / intégration : 3 fichiers / 3 tests verts lors de
  l'incrément catalogue ;
- ajustement final de toolbar + Inspector + introspection + intégration :
  4 fichiers / 19 tests verts ;
- stores canoniques disponibles : 5 fichiers / 29 tests verts ; le fichier
  `src/model/business-relation-store.test.js` n'existe pas, les preuves Business
  Relations sont réparties dans les tests relationnels existants ;
- Workspace : 2 fichiers / 16 tests verts ;
- build viewer, editor et pages vert ; `git diff --check` silencieux ;
- avertissements de build connus seulement : ordre des `@import` CSS, `eval`
  dans `archimate-js`, chunk pages > 500 kB.

Preuve runtime sur le Workspace M6 : 3 Repository Documents sans colonne
`content` dans la table, 5 Business Objects, deux Business Object Representations
`BO_PERSISTENCE_PROOF / DataStore_1ici771` qualifiées par `imported-2` et
`imported-3`, une Business Relation réelle
`BO-LW11-PATH --demo:aggregation--> BO-LW11-APP`, et les sources Identity Origins
et Business Object External Identities vides mais interrogeables proprement. La
preuve visuelle finale confirme également que `Technical -> Inspector…` est
isolé à droite de la toolbar, après le spacer, séparé des commandes fonctionnelles.

TECH-INSPECT-01 n'est pas renommé M7. Il ne modifie pas le statut de publication,
ne réactive pas LW13 et n'autorise aucun commit, push, tag, release ou publication.

## 20. Point de reprise après M6

M1–M6 et M3.1 FIX1 sont démontrés dans leurs frontières documentées.
TECH-INSPECT-01 est désormais implémenté, démontré et capitalisé dans sa
frontière read-only. Son catalogue est extensible avec le design ; les six sources
actuelles constituent le périmètre démontré au checkpoint, pas une liste fermée.

Le prochain front doit être choisi par hypothèse falsifiable parmi les
frontières encore réelles et les candidats documentés. LW13 reste suspendu.
Le statut de publication reste Development Preview / Progress Demonstrator ;
aucun commit, push, tag, release ou publication n'est autorisé par cette
capitalisation.

