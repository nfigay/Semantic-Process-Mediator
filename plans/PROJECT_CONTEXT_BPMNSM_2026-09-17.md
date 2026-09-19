# BPMNSM / Semantic Process Mediator --- Document de continuité du projet

**Version de continuité :** 2026-09-17\
**But :** permettre de reprendre le développement dans une nouvelle
conversation sans reconstruire l'historique complet.

> Ce document synthétise les décisions, invariants, architecture et état
> de développement issus des échanges du projet. En cas de contradiction
> avec un fichier source réel du dépôt, **le fichier actuel du dépôt
> prime** et doit être relu avant modification.

------------------------------------------------------------------------

## 1. Vision du produit

BPMNSM (historiquement nommé aussi **SemArch / Semantic Process
Mediator** dans le code et les échanges) est un atelier de modélisation
BPMN gouverné par méthode, organisé par **Centre de Compétence (CoC)**.

L'objectif n'est pas de créer un méta-modèle propriétaire remplaçant
BPMN. **BPMN 2.0 XML reste le langage pivot et le format d'échange
principal.**

Le produit doit permettre :

-   de créer, importer, modifier et exporter des processus et
    collaborations BPMN ;
-   d'organiser un référentiel par CoC et par composants d'architecture
    ;
-   de restreindre les constructions BPMN selon une méthode de
    modélisation ;
-   d'attacher des métadonnées non standard aux éléments BPMN ;
-   de sérialiser ces métadonnées avec les mécanismes d'extension BPMN ;
-   de représenter aussi des concepts purement CoC lorsque BPMN ne les
    couvre pas ;
-   de lint/valider les modèles selon des règles proches du vocabulaire
    métier ;
-   de travailler avec des modèles provenant de plateformes externes
    (notamment ARIS et Sparx Enterprise Architect) ;
-   de conserver le référentiel sous Git, indépendamment de l'éditeur ;
-   de produire une application statique déployable en Pages ou sous
    forme d'un HTML autonome/serverless.

Principe directeur :

> **BPMN constitue le langage pivot. La méthode CoC contraint son usage
> et l'enrichit de manière normalisée. Les gateways rendent explicites
> les différences avec les plateformes externes.**

------------------------------------------------------------------------

## 2. Stack technique

Le projet est une application **JavaScript ES modules** construite avec
**Vite**.

Technologies structurantes :

-   JavaScript ;
-   Vite ;
-   `bpmn-js` ;
-   `bpmn-moddle` ;
-   `bpmn-js-properties-panel` et bibliothèques bpmn.io associées ;
-   `bpmnlint` / mécanismes de lint associés ;
-   w2ui pour l'intégration UI ;
-   Vitest pour les tests ;
-   Git pour la gestion de configuration du code **et surtout des
    modèles sérialisés**.

Deux distributions sont visées à partir du même code :

1.  site statique pour GitHub/GitLab Pages ;
2.  single HTML autonome/serverless.

Le build de l'outil et le contenu du référentiel doivent rester
découplables.

------------------------------------------------------------------------

## 3. Philosophie d'architecture

### 3.1 Ne pas remplacer BPMN

Règle fondamentale :

> **Si BPMN sait exprimer une information, utiliser BPMN. Sinon
> seulement utiliser une extension.**

Trois catégories sont distinguées :

1.  **BPMN natif** --- `Process`, `Collaboration`, `Participant`,
    `MessageFlow`, `ItemDefinition`, etc. ;
2.  **BPMN enrichi** --- un élément BPMN standard portant des propriétés
    CoC dans `extensionElements` ;
3.  **Concept CoC autonome** --- concept méthodologique ou architectural
    sans équivalent BPMN raisonnable.

Le niveau 3 ne doit jamais être utilisé comme raccourci pour réinventer
un concept déjà couvert par BPMN.

### 3.2 BPMN est un langage, pas une méthodologie

La méthode CoC est matérialisée au plus près des abstractions bpmn.io :

-   moddle descriptor → sérialisation ;
-   properties provider / Forms → édition ;
-   bpmn-js modeling rules → contraintes interactives ;
-   palette / context pad → constructions proposées ;
-   bpmnlint → validation normative, y compris des modèles importés.

On ne cherche **pas** à créer un gros DSL de règles. Les règles peuvent
rester du JavaScript si elles sont courtes, lisibles, localisées et
immédiatement testables.

### 3.3 Le lint est le filet normatif

Une restriction UI n'est jamais suffisante puisqu'un BPMN peut venir de
l'extérieur.

Pattern :

``` text
règle méthodologique
       ↓
      lint                 ← contrôle normatif
       ↓
contrainte UI éventuelle   ← aide à la modélisation
```

### 3.4 Développement vertical et incrémental

Préférer de petites tranches complètes :

``` text
concept
  → sérialisation
  → lecture
  → properties/forms
  → validation
  → round-trip
  → test
```

Chaque étape doit être testable et laisser l'application dans un état
utilisable.

------------------------------------------------------------------------

## 4. Référentiel, documents et sérialisation

### 4.1 Contrat de persistance du Repository BPMNSM

La conception a évolué depuis l'hypothèse initiale d'un simple arbre Git
organisé par CoC. Le contrat actuellement retenu est :

> **Un Repository BPMNSM est un `bpmn:Definitions` enrichi d'extensions
> SemArch minimales décrivant le repository, son mode
> `single-coc | multi-coc`, les CoC et leurs relations d'appartenance.
> Les éléments métier restent des éléments BPMN natifs.
> `RepositoryModel` est une projection runtime de cette sérialisation.**

Structure conceptuelle actuelle :

``` text
bpmn:Definitions
│
├── extensionElements
│   ├── semarch:RepositoryContext
│   │      repositoryId
│   │      mode = single-coc | multi-coc
│   ├── semarch:CoC *
│   │      id
│   │      name
│   └── semarch:Membership *
│          cocRef
│          componentRef
│
├── bpmn:Process *
├── bpmn:Collaboration *
└── ...
```

La présence de `semarch:RepositoryContext` dans `bpmn:Definitions`
constitue la signature explicite d'un Repository BPMNSM.

États distingués :

``` text
BPMN_DOCUMENT
    aucun RepositoryContext

BPMNSM_REPOSITORY
    RepositoryContext présent et cohérent

INVALID_BPMNSM_REPOSITORY
    RepositoryContext présent mais métadonnées incohérentes
```

Un document BPMN ordinaire ne devient jamais implicitement un Repository
BPMNSM du seul fait qu'il contient plusieurs processus ou une
Collaboration.

### 4.2 Repository, documents et runtime

Trois notions doivent rester séparées :

``` text
Repository BPMNSM
    sérialisation canonique enrichie

RepositoryDocumentStore
    documents BPMN présents dans la session / l'environnement

RepositoryModel
    projection runtime : containers, components, references
```

`RepositoryDocumentStore` n'est pas la persistance canonique du
Repository.

Le Repository reste indépendant de l'éditeur et compatible avec une
gestion de configuration Git. Les fichiers BPMN sources/importés peuvent
rester autonomes et versionnables ; l'assemblage et la transposition ne
doivent pas imposer un monolithe propriétaire comme source unique de
vérité.

### 4.3 Import et assemblage

La chaîne conceptuelle retenue est :

``` text
Import BPMN into Environment
        ↓
source / temporary BPMN document
        ↓
analyse / sélection / transposition
        ↓
Assemble into Repository
        ↓
canonical enriched BPMN
```

`Import BPMN into Environment…` accepte un BPMN valide sans lui imposer
de CoC ou de Membership.

`Open Repository…` vérifie la présence de `RepositoryContext`. En son
absence, l'utilisateur peut être averti et choisir d'importer néanmoins
le BPMN dans l'Environment, sans transformation implicite en Repository.

À terme, ces deux commandes doivent converger vers un moteur commun
d'import/distribution, la différence portant sur la validation de
l'intention utilisateur.

### 4.4 Identité et références

Les IDs BPMN doivent être préservés autant que possible lors des
imports/exports.

Il faut distinguer :

``` text
Repository object identity
≠
BPMN model element id
≠
Business identity
```

Pour l'ingestion fragmentaire de référentiels externes, l'identité
source est conceptuellement :

``` text
SourceIdentity
{
  sourceSystem
  sourceRepository
  sourceObjectId
}
```

avec comme clé :

``` text
(sourceSystem, sourceRepository, sourceObjectId)
```

Les références peuvent être :

``` text
UNRESOLVED
RESOLVED
INVALID
```

Invariant :

> **UNRESOLVED ≠ INVALID.**

Une référence non résolue doit pouvoir survivre à l'import et se
résoudre ultérieurement lorsqu'un fragment complémentaire est chargé.

### 4.5 Projection des métadonnées Repository

`projectRepositoryMetadata()` projette actuellement les extensions
Repository vers `RepositoryModel` :

-   `semarch:CoC` → containers runtime ;
-   `semarch:Membership` résolu → références runtime de containment ;
-   `Membership.componentRef` référence l'ID BPMN sérialisé, pas l'ID
    runtime ;
-   une cible absente reste diagnostiquée comme membership non résolu ;
-   la projection résolue est idempotente.

Le `Meta.cocRef` historique reste toléré pour compatibilité mais n'est
pas la relation canonique de membership.

### 4.6 Modèle vs diagramme

Les fonctions repository et multi-CoC travaillent sur les **BPMN models
/ moddle elements et leurs références**, et non sur les seules shapes du
canvas.

Un processus peut être référencé ou projeté dans plusieurs
contextes/diagrammes sans être dupliqué sémantiquement.

### 4.7 Assemblage

Un BPMN global peut être assemblé à la demande pour échange avec un
outil tiers.

L'assemblage doit résoudre les références inter-composants et produire
du BPMN standard chaque fois que la relation peut être exprimée
nativement dans un document global.

Le monolithe global d'échange/publication ne doit pas devenir par défaut
une représentation propriétaire irréversible du référentiel.

------------------------------------------------------------------------

## 5. Contrat des extensions CoC

Chaque concept d'extension doit être documenté avec quatre dimensions :

``` text
Concept
Sérialisation
Édition
Validation
```

Idéalement ajouter aussi :

``` text
Support BPMN natif
Import externe
Export externe
```

Exemple conceptuel :

``` text
Concept: Process Owner
Support BPMN: non natif
Support CoC: extension de bpmn:Process
UI: Properties > Governance > Owner
Validation: obligatoire selon le profil
Gateway: mapping explicite selon plateforme
```

Une gateway doit suivre le principe :

> **Parse what you know; preserve what you don't.**

Catégories :

``` text
BPMN natif
  → conserver / mapper directement

extension CoC connue
  → interpréter / mapper

extension tierce connue
  → plugin gateway spécifique

extension inconnue
  → préserver sans destruction
  → éventuellement signaler
```

La compatibilité avec ARIS/EA doit être mesurée **concept par concept**,
et non déclarée globalement.

------------------------------------------------------------------------

## 6. Architecture schémas / profils déjà introduite

Une couche d'adaptation de schémas externes a été introduite afin que le
cœur BPMNSM ne dépende pas directement d'un formalisme particulier.

Chaîne conceptuelle :

``` text
BPMN
  semarch:SemanticType
  semarch:DataProperty
        ↓
Schema Binding
        ↓
Schema Adapter
        ↓
Normalized Schema
        ↓
Profile Runtime
        ↓
Properties / Forms / Lint
```

Le contrat `SchemaAdapter` expose une vue normalisée minimale tout en
conservant le schéma source comme autorité.

Des modules/fichiers cités dans l'état actuel incluent notamment :

``` text
src/schemas/schema-adapter.js
src/schemas/schema-binding.js
src/schemas/schema-datatype.js
src/schemas/xsd-schema-adapter.js
src/schemas/schema-property-resolver.js
src/schemas/bpmn-schema-binding.js
src/schemas/profile-schema-loader.js

src/profiles/profile-runtime.js

src/properties/semarch-properties-provider.js
src/properties/semarch-property-widget.js

src/bpmn/create-modeler.js
src/bpmn/bpmn-view-index.js

src/app/create-app.js

src/ui/layout.js
src/ui/repository-browser.js
src/ui/read-only-properties-panel.js
src/ui/diagram-properties-panel.js
src/ui/toolbar.js

src/repository/resolve-repository-view.js
src/repository/register-bpmn-document.js

src/extensions/semarch.json
```

Cette liste est un **repère de continuité**, pas une garantie que
l'arborescence actuelle du dépôt est exactement identique. Toujours
demander/lire les fichiers actuels avant modification.

------------------------------------------------------------------------

## 7. Profile Runtime

Le Profile Runtime est la façade commune destinée aux consommateurs.

Invariant déjà établi :

``` text
SemanticType.ref dans BPMN
        =
type.id dans le profil BPMNSM
```

Chaîne :

``` text
BPMN SemanticType
    ↓
Profile Runtime
    ↓
Type Binding
    ↓
schéma externe normalisé
    ↓
propriété métier
```

Règle de maintenance :

``` text
nouvelle propriété métier
    → schéma / profil

nouvelle capacité générique
    → code du core
```

Le Properties Panel ne doit pas coder en dur une propriété métier comme
`documentNumber`.

------------------------------------------------------------------------

## 8. Datatypes --- décision architecturale critique

### 8.1 Deux problèmes différents à ne plus confondre

Les échanges ont fait apparaître deux niveaux distincts :

**A. Datatype du schéma externe utilisé pour l'outillage BPMNSM**

Le code actuel a commencé à normaliser des types XSD vers des catégories
pratiques :

``` text
xs:string             → string
xs:boolean            → boolean
xs:int                → integer
xs:positiveInteger    → integer
xs:decimal            → decimal
xs:date               → date
xs:dateTime           → datetime
```

Ces catégories servent notamment à choisir un widget UI.

**B. Référence de datatype BPMN**

Pour BPMN, `ItemDefinition.structureRef` est une référence ouverte de
type QName. Cette référence ne doit **jamais** être réduite à
l'enum/catégorie UI ci-dessus.

### 8.2 Nouvelle règle impérative

> **Represent what BPMN can express; interpret only what BPMNSM
> understands.**

Et :

> **Unknown to BPMNSM must never mean unknown to the BPMN model.**

Donc BPMNSM doit distinguer :

``` text
DataTypeRef / QName BPMN
    { namespaceUri, localName }
            ↓ résolution éventuelle
Runtime / normalized datatype
    string | boolean | integer | ...
```

La représentation BPMN doit rester **ouverte**.

Exemple conceptuel JavaScript :

``` js
{
  namespaceUri: 'http://www.w3.org/2001/XMLSchema',
  localName: 'positiveInteger'
}
```

ou :

``` js
{
  namespaceUri: 'https://example.org/customer',
  localName: 'Customer'
}
```

doivent pouvoir être importés et réexportés même si BPMNSM ne sait pas
les exploiter.

### 8.3 Ne pas utiliser `UNKNOWN` de façon destructive

`SchemaDatatype.UNKNOWN` peut être utile comme **catégorie runtime/UI de
fallback**, mais il ne doit jamais remplacer la référence source.

Ceci est interdit comme transformation canonique :

``` text
foo:Customer
xsd:duration
bar:Invoice
        ↓
     UNKNOWN
```

si le QName original est perdu.

Il faut conserver séparément la source native/référence :

``` text
source datatype / DataTypeRef
        +
normalized/runtime category
```

Exemple :

``` text
xsd:positiveInteger
        ├── source/ref : {XSD namespace}positiveInteger
        └── UI category: integer
```

Cela permet un widget numérique sans perdre la contrainte sémantique
originale.

### 8.4 Invariant de round-trip

Pour tout QName valide :

``` text
IMPORT(qname)
```

doit réussir indépendamment du support runtime BPMNSM, puis :

``` text
EXPORT(IMPORT(qname))
```

doit préserver l'expanded QName :

``` text
namespaceURI original == namespaceURI exporté
localName original    == localName exporté
```

Le préfixe XML (`xs`, `xsd`, `ns1`, etc.) n'est pas l'identité
sémantique.

### 8.5 Conséquence pour le code existant

`schema-datatype.js` et son vocabulaire normalisé ne doivent pas devenir
la représentation canonique de `bpmn:ItemDefinition.structureRef`.

Il faut conserver deux couches :

``` text
BPMN datatype reference
        ↓
DataTypeRef / QName ouvert
        ↓
resolver facultatif
        ↓
datatype normalisé/runtime
        ↓
widget / validation / forms
```

La registry des datatypes connus est une registry de **capacités**,
jamais une whitelist d'import.

------------------------------------------------------------------------

## 9. Widget resolver

Une étape récente a introduit un résolveur générique de widget :

``` text
Schema Adapter
    datatype natif
        ↓
datatype normalisé
        ↓
Property Descriptor
        ↓
Widget Resolver
        ↓
composant natif du Properties Panel
```

Module cité :

``` text
src/properties/semarch-property-widget.js
```

Le provider doit orchestrer l'affichage ; il ne doit pas choisir un
widget à partir d'un type métier (`Deliverable`, `Specification`, etc.)
ni connaître XSD.

Le mapping doit dépendre de la catégorie normalisée.

Attention : la décision d'interopérabilité ci-dessus
**complète/corrige** cette stratégie : la normalisation sert à
l'UI/runtime, mais la valeur native ou le QName doit rester disponible.

------------------------------------------------------------------------

## 10. État de test au dernier point enregistré

Le chantier datatype / Properties Panel avait historiquement atteint :

``` text
24 fichiers de test
96 tests
96 passent
0 échec
```

Ce nombre n'est plus le baseline courant :
`src/bpmn/item-definition-runtime.test.js` a ensuite été identifié comme
un fichier résiduel mal nommé contenant du code de production dupliqué
et aucun test. Il a été supprimé.

Le baseline historique après les évolutions Repository Browser /
Environment était :

``` text
24 fichiers de test
95 tests
95 passent
0 échec
```

Le **baseline global courant explicitement démontré après A10.2.2** est
désormais :

``` text
38 fichiers de test
181 tests
181 passent
0 échec
```

Ce baseline a été complété par un build réussi des trois cibles
actuelles :

``` text
standalone Viewer
standalone Editor
GitHub Pages
```

Les avertissements de build observés restent non bloquants : ordre des
`@import` PostCSS, usage de `eval` dans `archimate-js`, assets SVG non
inline dans les builds standalone et chunk Pages supérieur à 500 kB.

Le chantier datatype reste considéré comme démontré. Il couvre notamment
:

``` text
DataTypeRef = identité sémantique canonique
RuntimeDatatype = capacité dérivée

QName valide inconnu préservé
préfixe réellement non résolu = erreur

RuntimeDatatype → PropertyWidget
boolean → CheckboxEntry
integer / decimal → NumberFieldEntry
fallback texte pour les types non supportés

modifications du modèle via bpmn-js modeling / command stack
```

Des tests Repository / Environment démontrent en outre :

``` text
repository BPMN
    → moddle
    → RepositoryModel
    → membership résolu

UNRESOLVED
    → RESOLVED lorsque la cible apparaît

projection Repository idempotente

environment-projection.test.js
    → 6 tests passés
```

Les six cas de projection Environment démontrés couvrent :

1.  Process isolé → racine Processes ;
2.  Process contextualisé par Collaboration → non racine ;
3.  Collaboration sous CoC → non racine ;
4.  CoC sous Repository lorsque cette relation est fournie ;
5.  `processRef` non résolu préservé dans le contexte Collaboration ;
6.  même Process projetable sous plusieurs Collaborations.

Avant toute nouvelle modification, `npm test` reste le moyen de prendre
l'état réel du dépôt comme référence. Le nombre 95 est un repère de
continuité, pas une garantie si le dépôt a évolué depuis.

------------------------------------------------------------------------

## 11. État fonctionnel après le chantier datatype

Le chantier datatype / widget est considéré comme terminé.

La version actuelle reste globalement iso-fonctionnelle sur le périmètre
préexistant, avec une infrastructure de typage désormais plus correcte,
interopérable et extensible.

Chaîne acquise :

``` text
XSD / BPMN datatype QName
        ↓
DataTypeRef
{ namespaceUri, localName }
        ↓
RuntimeDatatype
        ↓
ProfileRuntime
        ↓
PropertyDescriptor
        ↓
PropertyWidget
        ↓
composant bpmn.io
        ↓
persistance semarch:DataProperty
```

Exemples actuellement démontrés :

``` text
xsd:string
→ string
→ TextFieldEntry

xsd:boolean
→ boolean
→ CheckboxEntry

xsd:positiveInteger
→ integer
→ NumberFieldEntry (mapping runtime/widget couvert)

xsd:duration
→ DataTypeRef préservé
→ RuntimeDatatype.UNKNOWN
→ fallback texte

custom:ApprovalCode
→ DataTypeRef préservé
→ RuntimeDatatype.UNKNOWN
→ fallback texte
```

Le fallback texte ne transforme pas le type sémantique en `string` : il
ne décrit que la capacité UI actuelle.

Principe de release :

> **BPMNSM comprend les types qu'il connaît et préserve ceux qu'il ne
> connaît pas encore.**

Formulation release note :

> **Gestion interopérable des datatypes** --- BPMNSM distingue désormais
> l'identité sémantique d'un type de sa prise en charge par
> l'application. Les types connus bénéficient automatiquement d'une
> représentation adaptée dans l'interface (par exemple une case à cocher
> pour `xsd:boolean`), tandis que les types valides mais non encore
> supportés sont préservés sans perte et restent éditables via un
> comportement générique.

Un BPMN de démonstration a également été préparé pour illustrer les
références de datatype suivantes :

``` text
xsd:string
xsd:boolean
xsd:positiveInteger
xsd:duration
demo:ApprovalCode
```

Pour une démonstration complète du `CheckboxEntry` SemArch, le BPMN doit
être utilisé avec un profil/XSD déclarant une propriété `xs:boolean`,
car le Properties Panel est piloté par le schéma et non par une liste de
propriétés codées en dur.

------------------------------------------------------------------------

## 12. Repository runtime, Environment Browser et état UI

### 12.1 Runtime Repository

Les composants structurants introduits incluent notamment :

``` text
repository-model.js
repository-document-store.js
register-bpmn-document.js
synchronize-bpmn-document.js
repository-editor-sync.js
project-repository-metadata.js
environment-projection.js
repository-browser.js
```

`RepositoryModel` expose une projection runtime de containers,
components et references. Les références ne nécessitent pas que source
et cible soient déjà présentes, ce qui permet de préserver les
références non résolues.

`registerBpmnDocument()` enregistre notamment `Process`, `Collaboration`
et `Participant`, avec des IDs runtime dérivés du document et de l'ID
BPMN. Le `containerId` est optionnel : un BPMN importé sans contexte CoC
ne reçoit plus d'appartenance implicite.

### 12.2 Projection Environment démontrée

`createEnvironmentProjection()` construit une projection sans muter
`RepositoryModel`.

Le contrat de navigation retenu avant la généralisation par profils est
:

``` text
Environment
├── Repositories
├── CoCs
├── Collaborations
└── Processes
```

Règle :

> **Un objet est affiché sous le parent pertinent le plus spécifique
> actuellement résolu.**

Exemples :

``` text
Repository
    → toujours sous Repositories

CoC
    → sous son Repository si résolu
    → sinon sous CoCs

Collaboration
    → sous son CoC si résolu
    → sinon sous Collaborations

Process
    → sous sa Collaboration si contextualisé
    → sinon sous son CoC si directement associé
    → sinon sous Processes
```

La hiérarchie UI est une projection, pas le containment BPMN.

Un même Process peut avoir plusieurs occurrences UI dans plusieurs
contextes de Collaboration sans duplication de l'objet sémantique.

### 12.3 Repository Browser

Le Repository Browser a été réécrit autour de la projection Environment
:

``` text
Environment
  Repositories
  CoCs
  Collaborations
  Processes
```

Les quatre catégories sont toujours présentes. `Unassigned BPMN` n'est
plus utilisé comme branche sémantique.

La sélection programmatique recherche l'objet sémantique dans l'arbre
rendu au lieu de supposer un node ID unique, ce qui permet plusieurs
occurrences UI du même objet.

Cette structure est désormais à lire avec la décision de la section 16 :
elle constitue le **premier profil de projection CoC-centric**, et non
la taxonomie universelle définitive de BPMNSM.

### 12.4 Panneaux de propriétés

Principe conservé :

> le panneau de propriétés doit pouvoir afficher un **businessObject
> BPMN directement**, sans fabriquer un faux élément graphique.

API conceptuelle :

``` js
readOnlyPropertiesPanel.showBusinessObject(
  businessObject
)
```

Cela évite notamment de confondre `Participant` graphique et `Process`
sémantique.

### 12.5 Cold start neutre

Le démarrage de BPMNSM ne crée plus implicitement :

``` text
CoC_Avionics
ni
modèle BPMN métier initial
```

Invariants :

``` text
Démarrage BPMNSM
≠ création implicite d'un CoC

Démarrage BPMNSM
≠ création implicite d'un modèle BPMN métier
```

Le profil/méthode Avionics peut rester disponible dans les registries
sans qu'un CoC Avionics soit instancié au démarrage.

### 12.6 État NO_ACTIVE_MODEL et Welcome

Le cold start UI démontré est :

``` text
NO_ACTIVE_MODEL
├── top toolbar              visible
│   ├── Repository / Model   enabled
│   └── commandes BPMN       disabled
├── left Environment         visible
├── main Welcome             visible
├── right Properties         hidden
├── bottom Lint              visible
└── nested left palette      hidden
```

La toolbar affiche `NO MODEL` et désactive les commandes dépendant d'un
modèle.

L'architecture centrale retenue est :

``` text
W2UI central panel
        ↓
CentralViewHost
        ↓
active View
        ├── id
        ├── html
        ├── onActivate()
        └── onDeactivate()
```

`WelcomeView` est la vue active initiale. Le panneau central W2UI reste
propriétaire de sa géométrie.

Invariant W2UI acquis : ne pas écraser avec `position:relative` le style
de `.w2ui-panel-content` utilisé par W2UI pour dimensionner le contenu
du panneau.

Le passage automatique vers l'état `ACTIVE_MODEL` après chargement d'un
modèle reste à démontrer sur la version courante de `create-app.js`;
relire le fichier exact avant toute modification.

------------------------------------------------------------------------

## 13. Extracts / diagnostics

Une piste récente consiste à ajouter des extracts de diagnostic sous
`Utilities > Extracts`.

Premier extract envisagé :

``` text
UI Tree
```

avec un module dédié de lecture passive, sans interprétation du modèle :

``` text
sidebar.nodes
    ↓
formatUiTreeExtract(...)
    ↓
texte
```

Les extracts suivants envisagés :

``` text
Repository Graph
BPMN Model
BPMN Views
```

Règle : chaque extract doit dire explicitement **ce qu'il représente**
afin d'éviter de confondre projection UI, repository et modèle BPMN.

------------------------------------------------------------------------

## 14. Interopérabilité ARIS / Enterprise Architect

Une matrice de tests doit guider les choix au lieu d'hypothèses.

Scénarios prioritaires déjà identifiés :

``` text
A1  EA → BPMNSM → ARIS          process seul
B1  BPMNSM → EA → BPMNSM       process seul
B2  BPMNSM → ARIS → BPMNSM     process seul
C1  EA(P1) + ARIS(P2) → BPMNSM assemblage
```

À observer :

``` text
structure BPMN
IDs
BPMN-DI
extensionElements
namespaces propriétaires
références
processus / collaborations
propriétés non standard
reconnaissance de l'identité au retour
modifications externes
capacité d'assemblage après round-trip
```

Modes d'échange à tester :

``` text
composant seul
contexte d'intégration partiel
ensemble global assemblé
```

------------------------------------------------------------------------

## 15. Build, Git et déploiement

Le référentiel Git ne doit pas contenir les artefacts générés
localement.

Politique déjà envisagée :

``` gitignore
node_modules/
dist/
.semarch-build/
.DS_Store
```

Le build cible doit pouvoir produire :

``` text
Pages
+
single HTML
```

À terme, une CI devrait avoir quatre portes :

``` text
tests unitaires
+
tests lint
+
tests round-trip BPMN/XML
+
build Vite des deux distributions
```

Git reste le système de configuration du référentiel. L'application ne
doit pas devenir propriétaire du repository.

------------------------------------------------------------------------

## 16. Environment Browser --- projections et catégorisations croisées

### 16.1 Décision d'architecture

L'arbre BPMNSM ne représente pas directement la structure ontologique du
référentiel.

La position d'un objet BPMN dans l'arbre est le résultat d'une
projection construite à partir :

-   des objets BPMN ;
-   de leurs classifications ;
-   de leurs relations sémantiques ;
-   du profil de vue actif.

Invariant :

> **La position d'un processus dans l'arbre n'est pas une propriété
> intrinsèque du processus. Elle est le résultat d'une projection
> construite à partir de ses classifications, de ses relations et du
> profil de vue actif.**

Architecture conceptuelle :

``` text
Semantic repository
        │
        ├── BPMN objects
        ├── classifications
        └── semantic relationships
                 │
                 ↓
          ProjectionProfile
                 │
                 ↓
       BPMN Environment Browser
```

L'Environment Browser est donc une vue du graphe BPMNSM, et non le
graphe lui-même.

### 16.2 Premier profil de projection : CoC-centric

Le besoin industriel actuellement prioritaire concerne des Centres de
Compétence du domaine spatial qui souhaitent rationaliser leurs
référentiels de processus.

Le premier profil de vue BPMNSM est donc volontairement orienté CoC :

``` text
Environment
├── Centres of Competence
│   ├── CoC A
│   │   ├── Collaborations
│   │   └── Processes
│   ├── CoC B
│   │   ├── Collaborations
│   │   └── Processes
│   └── ...
├── Collaborations
└── Processes
```

Les branches racines `Collaborations` et `Processes` accueillent
notamment les objets qui ne disposent pas encore d'un contexte CoC
résolu.

Un CoC peut être structurant dans cette vue sans être le parent
ontologique universel d'un Process.

Conceptuellement :

``` text
CoC
 ─ governs →
 ─ maintains →
 ─ contributesTo →
 Process / Collaboration
```

La vue CoC-centric peut transformer certaines de ces relations en
parenté visuelle.

### 16.3 Catégorisations croisées

Un même processus peut être catégorisé simultanément selon plusieurs
axes, notamment :

``` text
Process
├── provenance
│   └── Repository / source
├── governance
│   └── CoC / owner
├── capability
├── organization
│   ├── Group
│   ├── Business Unit
│   ├── Business Line
│   └── Programme
├── process domain
├── applicability
│   ├── Space
│   ├── Defence
│   └── ...
├── reference framework
│   ├── BMS
│   ├── ECSS
│   ├── NASA
│   ├── ESA
│   └── ...
├── lifecycle
│   ├── Reference
│   ├── Generic
│   ├── Tailored
│   ├── Enacted
│   └── Executable
└── process nature
    ├── Private
    ├── Public
    └── Collaboration
```

Ces dimensions ne doivent pas être fusionnées dans une hiérarchie
unique.

À terme, un profil de projection pourra choisir et croiser plusieurs
axes, par exemple :

``` text
PRIMARY    CoC
SECONDARY  Capability
FILTER     Programme = X
FILTER     Standard = ECSS
```

ou :

``` text
PRIMARY    Capability
SECONDARY  Business Unit
TERTIARY   Programme
```

Le même modèle sémantique pourra ainsi produire plusieurs arbres sans
modifier les objets BPMN.

### 16.4 Concepts à prévoir, sans implémentation immédiate

La généralisation future pourra s'appuyer sur des concepts du type :

``` text
ClassificationScheme
Category
ClassificationAssignment
ProjectionProfile
```

Exemple conceptuel :

``` text
ClassificationScheme = CoC
Category             = Systems Engineering
ClassificationAssignment
    elementRef       = Process_X
    categoryRef      = Systems Engineering
```

Le modèle mental cible est :

``` text
BPMN objects
       +
ClassificationAssignments
       +
semantic relationships
       +
ProjectionProfile
       ↓
Environment tree
```

Ces abstractions sont à prévoir architecturalement mais ne doivent pas
être généralisées dans le code tant que le besoin CoC-centric actuel ne
le justifie pas.

### 16.4.1 État démontré de ProjectionProfile

Le profil de projection n'est plus seulement une abstraction prévue. Le
chantier A10.2 a démontré à la fois la **pluralité des stratégies de
projection** et leur **injection runtime** jusqu'au consommateur réel.

Architecture actuelle :

``` text
RepositoryModel
      │ data + relations
      ↓
ProjectionProfile
      │ view policy
      ↓
createEnvironmentProjection()
      │ generic mechanism
      ↓
Environment Projection
      ↓
Repository Browser
```

Le profil CoC courant reste le comportement historique par défaut et
exprime notamment :

``` js
export const cocProjectionProfile = {
  id: 'coc',
  label: 'Centres of Competence',
  rootComponentTypes: [
    'collaboration',
    'process'
  ],
  contextualizeProcessesUnderCollaborations: true,
  collaborationProcessContext: {
    participantReferenceType: 'participant',
    processReferenceType: 'processRef'
  },
  preferCollaborationContextOverDirectCocMembership: true
}
```

Les cinq incréments initiaux de `ProjectionProfile` restent \[DÉMONTRÉ\]
:

``` text
1. ProjectionProfile explicite ; profil CoC par défaut ; profil CoC explicite
   équivalent à la projection historique ; profil non supporté rejeté.

2. Politique des types de composants racines déplacée dans le profil.

3. Politique de contextualisation des Process sous Collaboration déplacée
   dans le profil.

4. Politique de priorité du contexte Collaboration sur l'appartenance CoC
   directe déplacée dans le profil.

5. Politique Collaboration → Participant → processRef → Process déplacée
   dans le profil.
```

Ils sont désormais complétés par :

``` text
A10.2.1 [IMPLÉMENTÉ + DÉMONTRÉ]
    second profil minimal explicite : flatProjectionProfile

    même RepositoryModel
        → cocProjectionProfile
            Process contextualisé sous Collaboration
        → flatProjectionProfile
            Process projeté à la racine

    aucune mutation du RepositoryModel
    aucune nouvelle sémantique métier

A10.2.2 [IMPLÉMENTÉ + DÉMONTRÉ]
    injection runtime du ProjectionProfile :

    createApp({ projectionProfile })
            ↓
    createRepositoryBrowser({ projectionProfile })
            ↓
    createEnvironmentProjection({ projectionProfile })

    absence d'injection
        → comportement historique cocProjectionProfile conservé
```

Invariant acquis :

> **Un même `RepositoryModel` peut être projeté structurellement de
> manière différente par plusieurs `ProjectionProfile` explicitement
> supportés, sans mutation du modèle source. Le profil de projection est
> une dépendance runtime injectable jusqu'à l'Environment Browser ; son
> absence conserve le profil CoC historique par défaut.**

Aucune dimension déclarative `projectionRef` n'a été ajoutée à
`CoCConfiguration`. Aucun resolver ou registry de profils de projection
n'est introduit à ce stade. Cette éventuelle étape devra être justifiée
séparément par un besoin démontré.

Le baseline global courant après A10.2.2 est :

``` text
38 fichiers de test
181 tests
181 passent
0 échec
```

Les builds standalone Viewer, standalone Editor et Pages passent
également.

Décision de méthode maintenue : ne pas transformer prématurément
`ProjectionProfile` en DSL générique. La preuve de généralité demandée
par le plan précédent est désormais acquise par `flatProjectionProfile`.

### 16.5 Membership

Le `semarch:Membership` actuel reste utile pour le démonstrateur et la
projection CoC courante.

Cependant il ne doit pas être considéré comme le modèle sémantique
définitif de toutes les relations entre CoC et objets BPMN.

À terme, il faudra distinguer :

``` text
relation sémantique
        ↓
règle de projection
        ↓
parent UI
```

Des relations plus précises pourront exister, par exemple :

``` text
governs
maintains
owns
contributesTo
uses
applies
conformsTo
derivedFrom
tailors
```

Aucune migration de `Membership` n'est décidée ou implémentée à ce
stade.

### 16.6 Articulation avec ArchiMate / ArchiCG

Le graphe sémantique porté par les extensions et schémas BPMNSM devra
permettre un alignement avec ArchiMate.

Objectif futur :

``` text
BPMNSM semantic graph
        │
        ├── BPMN projection
        │
        └── ArchiMate projection
                ↓
              ArchiCG
```

Cela permettra notamment des vues capability-centric,
organization-centric, programme-centric, governance-centric et
roadmap/transformation. Ces vues ne sont pas à implémenter maintenant.

BPMNSM doit préserver la séparation entre les formalismes :

``` text
BPMN
    behavioral / process viewpoint

ArchiMate
    enterprise architecture / governance viewpoint

BPMNSM
    semantic links + transposition mechanisms
```

BPMNSM ne doit pas reconstruire ArchiMate dans son arbre BPMN.

### 16.7 Import / Export / Transposition

Les mécanismes d'import, export et transposition seront les moyens de
passer d'une représentation ou d'un point de vue à un autre.

Invariant :

> **Importer, exporter et transposer ne sont pas des opérations de
> navigation. Ce sont des mécanismes de transformation entre
> représentations qui doivent préserver autant que possible identité,
> provenance, relations et traçabilité.**

Les représentations restent ancrées dans leurs formalismes naturels. Une
transposition ne doit pas supprimer silencieusement la représentation
source.

### 16.8 Standards, BMS et traçabilité

Les référentiels d'entreprise et standards externes peuvent participer à
plusieurs classifications et relations : BMS, ECSS, NASA, ESA, DoD, MoD,
cadres réglementaires, etc.

Un processus peut être lié à ces sources sans que celles-ci deviennent
nécessairement ses parents dans l'arbre BPMN.

Une cible importante de BPMNSM est de préserver la chaîne de traçabilité
entre :

``` text
External Standard
        ↓
Interpretation / Tailoring
        ↓
Derived Requirement
        ↓
BPMN Process Element
        ↓
Operational Practice
        ↓
Executable / Tool-supported realization
```

Lorsque la norme source fournit déjà une représentation structurée ou
formelle, BPMNSM doit chercher à préserver cette représentation et ses
relations plutôt qu'à la réduire définitivement à du texte ou à des
exigences dérivées.

Principe :

> **Conserver les représentations dans leur formalisme naturel et
> formaliser les transpositions entre elles.**

Cela rejoint la logique d'hypermodèle utilisée comme fondement
conceptuel du projet.

### 16.9 Statut

``` text
[DÉCIDÉ]

- Environment Browser = projection, pas graphe BPMNSM.
- Premier profil de projection = CoC-centric.
- Les catégorisations sont potentiellement multiples et croisées.
- CoC peut structurer la vue sans être le parent ontologique du Process.
- La généralisation par ClassificationScheme / Category /
  ClassificationAssignment / ProjectionProfile est à prévoir,
  mais pas à implémenter maintenant.
- Des projections ArchiMate / ArchiCG sont prévues ultérieurement.
- Import / Export / Transposition constitueront les mécanismes de
  passage entre représentations.
- Standards et BMS doivent conserver provenance et traçabilité
  vers les pratiques et processus dérivés.
```

------------------------------------------------------------------------

## 17. Convention de travail avec ChatGPT

Cette convention est importante pour poursuivre le développement
efficacement.

### 17.1 Ne pas deviner l'état des fichiers

Avant de modifier une chaîne fonctionnelle existante, demander/lire les
**versions actuelles exactes** des fichiers concernés.

Ne jamais reconstruire un gros fichier de mémoire si son contenu courant
n'est pas disponible.

### 17.2 Fournir les fichiers complets

L'utilisateur préfère recevoir le **contenu complet des fichiers à
remplacer**, plutôt que des patches partiels, car les modifications
ciblées sont laborieuses et sujettes aux erreurs.

Convention de livraison désormais stabilisée :

-   ne jamais fournir un patch comme mode normal de modification ;
-   avant de remplacer un fichier existant, lire sa version actuelle
    exacte ;
-   livrer les fichiers à créer/remplacer sous forme d'un **ZIP
    téléchargeable** conservant exactement l'arborescence du repository
    ;
-   le ZIP d'une étape ne contient que les fichiers à créer/remplacer,
    sauf besoin explicitement justifié ;
-   les fichiers contenus dans le ZIP sont toujours complets.

Convention de collecte macOS :

-   toute commande destinée à fournir du source, un `grep`, des logs,
    des tests, un `git diff`, un `tree` ou une autre information au chat
    doit normalement envoyer directement stdout et stderr vers le
    presse-papiers avec `2>&1 | pbcopy` ;
-   pour plusieurs commandes, utiliser un bloc `{ ... } 2>&1 | pbcopy` ;
-   l'absence de sortie visible dans le terminal est alors normale ;
-   ne pas utiliser `tee /dev/tty | pbcopy` ;
-   une sortie terminal directe n'est utilisée que lorsqu'elle est
    nécessaire pour diagnostiquer un processus bloqué qui empêcherait
    `pbcopy` d'être atteint.

Format attendu pour une étape :

``` text
OBJECTIF

FICHIERS À CRÉER

FICHIERS À MODIFIER

FICHIERS À NE PAS TOUCHER

CODE COMPLET

COMMANDES DE TEST

RÉSULTAT ATTENDU

INVARIANT ARCHITECTURAL ACQUIS
```

### 17.3 Étapes atomiques

Chaque étape doit être petite, testable et réversible.

Ne pas modifier des fichiers non nécessaires « pour nettoyer ».

### 17.4 Toujours distinguer

``` text
modèle BPMN
projection UI
repository
schéma externe
profil/méthode
runtime BPMNSM
gateway
```

Éviter les raccourcis qui fusionnent ces couches.

### 17.5 Code lisible plutôt qu'abstraction prématurée

L'objectif est un développement rapide et itératif.

Préférer les abstractions naturelles des bibliothèques bpmn.io et de
petits modules lisibles à un framework générique lourd.

------------------------------------------------------------------------

## 18. Invariants à ne pas casser

1.  **BPMN XML est le pivot.**
2.  **Ce que BPMN sait représenter reste BPMN natif.**
3.  **Les extensions CoC enrichissent BPMN ; elles ne le remplacent
    pas.**
4.  **Les concepts CoC autonomes sont explicitement séparés des concepts
    BPMN.**
5.  **Un BPMN externe ne doit pas être détruit parce que BPMNSM ne
    comprend pas tout son contenu.**
6.  **Un datatype inconnu est unsupported, pas invalid, si sa référence
    BPMN est valide.**
7.  **La référence de datatype BPMN est ouverte ; le runtime supporté
    peut être fermé/extensible.**
8.  **La normalisation d'un datatype ne doit jamais détruire sa
    référence native.**
9.  **Le lint contrôle aussi les modèles importés ; les restrictions UI
    seules ne sont pas normatives.**
10. **Le référentiel Git reste indépendant de l'outil.**
11. **Un composant BPMN doit rester autant que possible intelligible
    hors du repository BPMNSM.**
12. **Les modèles multi-fichiers sont assemblables en BPMN global
    lorsque BPMN permet d'exprimer les relations nativement.**
13. **Les IDs et informations inconnues doivent être préservés autant
    que les bibliothèques le permettent.**
14. **Le Profile Runtime, Properties, Forms et Lint ne doivent pas
    interpréter directement la syntaxe XSD.**
15. **Une nouvelle propriété métier vient du schéma/profil ; une
    nouvelle capacité générique vient du core.**
16. **Avant de coder une représentation CoC, vérifier d'abord si BPMN
    possède déjà le concept ou le mécanisme approprié.**

------------------------------------------------------------------------

## 19. Prompt de reprise conseillé

Dans une nouvelle conversation, joindre ce document et écrire :

> Nous continuons le développement de BPMNSM. Utilise
> `PROJECT_CONTEXT_BPMNSM.md` comme contexte de continuité. Ne suppose
> pas que les fichiers du dépôt sont identiques à ceux décrits dans le
> document : demande-moi les fichiers actuels nécessaires avant de
> produire du code. Nous travaillons en JavaScript avec Vite et les
> bibliothèques bpmn.io. Respecte les invariants d'interopérabilité,
> notamment la préservation des QNames/datatype refs inconnus. Donne-moi
> les fichiers complets lorsqu'une modification est nécessaire et avance
> par étapes atomiques avec tests.

Puis fournir idéalement :

``` text
npm test
git status --short
tree src -L 3
```

ou leur équivalent, ainsi que les fichiers exacts concernés par la
prochaine étape.

------------------------------------------------------------------------

## 20. Point de reprise immédiat

Le baseline global courant explicitement confirmé après A10.2.2 est :

``` text
38 fichiers de test
181 tests
181 passent
0 échec
```

Les builds suivants sont également démontrés :

``` text
standalone Viewer
standalone Editor
GitHub Pages
```

A9 reste démontré jusqu'à la coexistence documentaire ArchiMate, la
navigation multi-document et la persistance des modifications.

A10.1 est désormais \[IMPLÉMENTÉ + DÉMONTRÉ\] : `CoCConfiguration` porte
les choix déclaratifs propres au CoC (`profileRef`, `publicationRef`,
`defaultMaturity`) et ceux-ci deviennent causaux à la frontière de
composition.

A10.2 est désormais \[IMPLÉMENTÉ + DÉMONTRÉ\] :

``` text
A10.2.1
    deux ProjectionProfile explicitement supportés
    → projections différentes du même RepositoryModel

A10.2.2
    ProjectionProfile injectable
    → createApp
    → createRepositoryBrowser
    → createEnvironmentProjection
```

Le comportement par défaut reste CoC-centric lorsqu'aucun profil n'est
injecté.

**Aucun `projectionRef` n'existe dans `CoCConfiguration` à ce stade.**
Aucun resolver ou registry de `ProjectionProfile` n'a été introduit. Ne
pas créer ces abstractions sans nouvelle preuve architecturale.

La prochaine étape doit partir du code réel après A10.2 et distinguer
explicitement :

``` text
définition d'une stratégie de projection
≠
injection runtime d'une stratégie
≠
éventuelle sélection/résolution déclarative d'une stratégie
```

Avant toute modification du code :

``` bash
npm test
```

Puis prendre le dépôt réel et les versions exactes des fichiers comme
autorité.

------------------------------------------------------------------------

## 21. ArchiMate dans BPMNSM --- diagramming, viewpoint CoC et médiation vers BPMN

### 21.1 Besoin et finalité

\[DÉCIDÉ\]

Un besoin concret existe de réutilisation d'un référentiel ArchiMate
legacy et, lorsque cela est pertinent, de transposition vers BPMN.

Cette transposition est comprise au sens hypermodel : elle relie des
représentations construites sur des « sols » de modélisation différents
sans prétendre que leurs concepts sont équivalents ni détruire la
représentation source.

Invariant :

> **ArchiMate source ≠ BPMN cible. La transposition doit préserver le
> legacy ArchiMate et rendre explicites l'interprétation, les décisions
> de correspondance et les écarts de sémantique ou d'expressivité.**

Le cas est directement pertinent pour BPMNSM : certains CoC ont utilisé
BPMN pour décrire des informations qui relèvent aussi de préoccupations
architecturales, souvent parce que les utilisateurs ne sont ni
spécialistes BPMN ni architectes. Le but n'est pas de déclarer ces
modèles « faux », mais de clarifier les finalités respectives des
langages et les ponts utiles entre eux.

### 21.2 ArchiCG et diagramming ArchiMate

ArchiCG reste adapté à l'exploration interactive d'un modèle complet
sous forme de graphe composite Cytoscape : navigation sémantique,
projections, filtrage et analyse globale.

Pour du diagramming ArchiMate conventionnel, ce paradigme peut toutefois
devenir plus lourd et cognitivement différent des outils de modélisation
habituels.

\[DÉCIDÉ\]

BPMNSM explorera donc un viewer/modeler ArchiMate fondé sur la grammaire
d'interaction `diagram-js` / bpmn.io :

``` text
palette
selection
context pad
append / create-next
connect
replace / specialization
delete
rules
modeling
command stack
undo / redo
renderer
properties
```

ArchiCG et ce diagrammer ne sont pas concurrents :

``` text
ArchiCG
    exploration globale du graphe / modèle complet

ArchiMate diagrammer dans BPMNSM
    vues locales conventionnelles / édition guidée / médiation
```

### 21.3 Stratégie technique initiale pour archimate-js

\[DÉCIDÉ\]

`archimate-js` sera d'abord évalué comme **dépendance externe** de
BPMNSM. Il ne sera pas intégré dans `bpmn-js`, mais comme moteur frère
dans l'application :

``` text
BPMNSM
│
├── BPMN view
│     └── bpmn-js
│
└── ArchiMate view
      └── archimate-js
           └── diagram-js
```

Priorité :

``` text
1. consommer archimate-js existant sans fork si possible ;
2. vérifier sa compatibilité avec le build Vite actuel ;
3. afficher un modèle ArchiMate réel ;
4. identifier les limites concrètes ;
5. ajouter autour de lui les extensions nécessaires ;
6. modifier/forker le moteur seulement lorsqu'un besoin réel le justifie.
```

Principe :

> **Extension avant modification upstream.**

Si une localisation/fork devient nécessaire, le code générique ArchiMate
devra rester séparé du code d'intégration BPMNSM afin de préserver sa
provenance et sa réutilisabilité.

\[OPPORTUNITÉ FUTURE, NON PRIORITAIRE\]

Les améliorations génériques produites à partir des besoins réels
pourront éventuellement contribuer à une nouvelle version modernisée de
`archimate-js`, alignée sur une version récente de `diagram-js`. Cette
cible ne doit pas ralentir le prototype actuel.

### 21.4 Viewpoint ArchiMate CoC

\[DÉCIDÉ\]

Deux niveaux de support sont distingués initialement.

``` text
Modèles ArchiMate externes / legacy
    → visualisation aussi complète que possible
    → préservation des informations non prises en charge
    → pas d'obligation d'édition complète

Modèles ArchiMate gérés dans les référentiels CoC
    → édition guidée par un viewpoint spécifique
    → palette et interactions restreintes au noyau supporté
    → règles d'édition explicites
```

Invariant :

> **Unsupported for editing ≠ invalid ≠ discarded.**

Le langage ArchiMate complet n'a donc pas à être supporté immédiatement
pour l'édition. Les éléments hors viewpoint doivent pouvoir rester
visibles et préservés dans les modèles legacy.

### 21.5 Noyau de médiation initial

\[HYPOTHÈSE\]

Le premier noyau sera centré sur les besoins processus effectivement
rencontrés :

``` text
Concepts
--------
Process
Business Object
Data Object
Artifact

Relations / intentions
----------------------
Decomposition
Trigger
Flow
Data Flow
Access
```

Ce noyau n'est **pas** un métamodèle universel et ne doit pas résulter
d'une fusion théorique préalable d'ArchiMate et BPMN.

Règle méthodologique :

> **Le pivot évolue à partir des différences sémantiques effectivement
> rencontrées dans les modèles concrets et validées avec les
> utilisateurs.**

Une difficulté de transposition ne doit donc pas automatiquement
produire un nouveau concept pivot. Elle doit d'abord être qualifiée :
limitation du viewer, information absente, ambiguïté du modèle source,
différence intrinsèque de langage, différence de viewpoint ou décision
contextuelle de transposition.

### 21.6 Représentation statique/dynamique et cycle de vie

\[HYPOTHÈSE\]

Deux dimensions doivent être considérées séparément :

``` text
Nature de la représentation
    static
    dynamic

Niveau / cycle de vie
    logical
    operational
    puis, si les cas réels le justifient :
    reference / tailored / executable / enacted / ...
```

Ces dimensions caractérisent une représentation du processus et ne
doivent pas être confondues avec l'identité intrinsèque du processus.

ArchiMate possède des éléments de comportement, mais une vue ArchiMate
ne porte pas la même sémantique dynamique d'exécution que BPMN.

Cas structurant :

``` text
ArchiMate process decomposition
        ≠
BPMN CallActivity
        ≠
BPMN SubProcess
```

La décomposition architecturale ne doit donc pas être transformée
mécaniquement en appel ou sous-processus BPMN. La transposition dépend
du sens du modèle BPMN cible et de son niveau logique/opérationnel.

### 21.7 Protocole d'itération sur les modèles réels

\[DÉCIDÉ\]

La médiation sera construite empiriquement à partir de fragments de
modèles réels et du retour utilisateur. Pour chaque cas significatif :

``` text
CAS DE MÉDIATION #n

1. Source
   fragment ArchiMate réel

2. Intention utilisateur
   ce que l'auteur pense avoir représenté

3. Concepts observés

4. Interprétation pivot vN

5. Transposition BPMN proposée

6. Écart
   information perdue / ajoutée / ambiguë

7. Retour utilisateur
   accepted / modified / rejected

8. Conséquence
   aucune
   ou évolution du viewpoint
   ou évolution du pivot
   ou évolution d'une règle de transposition
```

Les trois niveaux suivants doivent rester distingués :

``` text
SOURCE
    représentation ArchiMate originale préservée

INTERPRÉTATION
    sens retenu pour la médiation

TRANSPOSITION
    représentation BPMN produite ou proposée
```

La valeur du mécanisme ne réside pas seulement dans la génération d'un
BPMN, mais dans la capacité à expliquer et contester pourquoi un élément
ou une relation BPMN est relié à un élément ou une relation ArchiMate.

### 21.8 Premier incrément expérimental

\[HYPOTHÈSE À DÉMONTRER\]

Question :

> `archimate-js` peut-il être consommé comme dépendance externe par le
> build Vite actuel de BPMNSM et afficher une vue ArchiMate dans le
> `CentralViewHost` sans modifier le comportement BPMN existant ?

Critère de succès :

``` text
ArchiMate XML
    ↓
archimate-js
    ↓
CentralViewHost
    ↓
vue visible et navigable
```

Hors périmètre du premier incrément :

``` text
médiation ArchiMate → BPMN
modification du RepositoryModel
nouveau format de persistance Repository
viewpoint CoC complet
modernisation générale de archimate-js
```

Le premier incrément doit donc démontrer l'intégration technique avant
de généraliser le modèle pivot ou le repository.

------------------------------------------------------------------------

## 22. A9 --- ArchiMate comme document de premier rang de l'Environment

### 22.1 Statut

-   **A9.1 --- Documents ArchiMate standalone dans la projection
    Environment : \[DÉMONTRÉ\]**
-   **A9.2 --- Navigation Environment vers la représentation ArchiMate :
    \[DÉMONTRÉ\]**
-   **A9.3 --- New ArchiMate Model et persistance des modifications :
    \[DÉMONTRÉ\]**

### 22.2 Capacité acquise

BPMNSM peut créer plusieurs documents ArchiMate standalone via
`Model → New ArchiMate Model`. Chaque modèle possède une identité
documentaire propre, un nom par défaut distinct (`Untitled-1.archimate`,
`Untitled-2.archimate`, ...), reste stocké comme document ArchiMate
natif dans `RepositoryDocumentStore`, apparaît sous
`Environment → ArchiMate`, possède sa propre représentation et conserve
ses modifications après navigation vers un autre modèle puis
réouverture.

### 22.3 Invariants A9

1.  **Document de premier rang.** Un document ArchiMate est un document
    de premier rang de l'Environment. Il n'est pas transformé en
    composant BPMN pour participer à l'Environment.

2.  **Représentation native.** Un document ArchiMate reste représenté
    par son XML ArchiMate natif. L'Environment fournit navigation et
    cycle de vie ; il ne remplace pas cette représentation par un modèle
    sémantique propriétaire BPMNSM.

3.  **Dispatch par type de document.** La sélection dans l'Environment
    est indépendante du langage au niveau navigation ; le `kind` du
    document détermine le moteur de représentation. Un document
    ArchiMate ne doit jamais être envoyé au parseur BPMN du seul fait
    qu'il provient de l'arbre commun.

4.  **Identité de représentation par document.** Chaque document
    ArchiMate possède sa propre identité de vue, dérivée de l'identité
    documentaire, afin que plusieurs modèles puissent coexister sans
    partager accidentellement leur état d'éditeur.

5.  **Cible de persistance.** Une mutation ArchiMate est persistée dans
    le XML du document propriétaire de la vue qui a produit cette
    mutation. La cible ne doit pas dépendre uniquement du document actif
    lorsque se termine une sérialisation asynchrone. Une mutation de A
    ne doit jamais écraser B.

6.  **Frontière de mutation.** BPMNSM n'expose pas l'infrastructure
    `diagram-js` comme contrat applicatif.
    `ArchimateAdapter.onModelChanged(callback)` encapsule le mécanisme
    sous-jacent (`eventBus` / `commandStack.changed`).

7.  **Chargement ≠ édition.** Création et import initiaux ne sont pas
    considérés comme une édition utilisateur. L'observation des
    mutations est installée après `createNewModel()` ou `importXML()`,
    ce qui permet au document initial de rester `dirty: false`.

8.  **Cycle de vie de l'observation.** La vue ArchiMate possède le cycle
    de vie de son abonnement : activation = `create/import → subscribe`
    ; désactivation = `unsubscribe → destroy adapter`. Un éditeur
    détruit ne doit plus provoquer de persistance.

9.  **Autorité de persistance actuelle.** À la fin d'A9, le XML
    ArchiMate persistant est l'autorité de l'état du modèle ArchiMate.
    BPMNSM ne reconstruit pas encore de projection sémantique
    `RepositoryModel` à partir des mutations ArchiMate.

10. **Pas d'unification prématurée des synchronisations.** La
    synchronisation BPMN combine persistance XML et projection
    sémantique `RepositoryModel`; la synchronisation ArchiMate requiert
    actuellement la persistance XML sans projection équivalente.
    `repository-editor-sync.js` ne doit donc pas être généralisé
    uniquement pour rendre les deux implémentations structurellement
    identiques. Une abstraction commune ne sera introduite que
    lorsqu'une responsabilité sémantique commune sera démontrée.

### 22.4 Architecture de synchronisation démontrée

``` text
BPMN mutation
    → commandStack.changed
    → repository-editor-sync
    → saveXML
    → RepositoryDocumentStore
    → synchronizeBpmnDocument
    → RepositoryModel

ArchiMate mutation
    → ArchimateAdapter.onModelChanged
    → ArchiMateView
    → callback applicatif de persistance
    → saveXML
    → RepositoryDocumentStore
```

Cette asymétrie est intentionnelle.

### 22.5 Preuves A9.3

-   tests automatisés ciblés : `archimate-adapter.test.js` +
    `archimate-view.test.js`, **8/8** ;
-   régression globale : **28/28 fichiers de test, 116/116 tests** ;
-   build de production : **succès, exit status 0** ;
-   preuve navigateur : création de deux modèles distincts, édition
    indépendante, navigation alternée et conservation du contenu propre
    à chacun, avec noms générés distincts.

Résultat : **\[DÉMONTRÉ\]**.

### 22.6 Conséquence architecturale

À la fin d'A9, l'Environment BPMNSM sait contenir, projeter, créer,
ouvrir, naviguer et maintenir plusieurs documents de représentation
natifs sans exiger qu'ils utilisent le même langage ou le même moteur
d'édition.

> **A9 démontre la coexistence documentaire, pas l'unification
> sémantique.**

L'Environment devient ainsi une frontière d'intégration au niveau
document. Cela ne démontre pas encore l'existence d'un repository
sémantique universel commun à BPMN et ArchiMate.

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  \## 23. A10 --- Configuration causale du CoC et stratégie de projection

  \### 23.1 Statut

  \- **A10.1 --- `CoCConfiguration` causale : \[IMPLÉMENTÉ + DÉMONTRÉ\]** - **A10.1e --- `profileRef` : \[DÉMONTRÉ\]** - **A10.1f --- `defaultMaturity` : \[DÉMONTRÉ\]** - **A10.1g --- `publicationRef` : \[IMPLÉMENTÉ + DÉMONTRÉ\]** - **A10.2 --- `ProjectionProfile` comme stratégie réelle de projection
  : \[IMPLÉMENTÉ + DÉMONTRÉ\]** - **A10.2.1 --- second profil minimal `flat` : \[IMPLÉMENTÉ + DÉMONTRÉ\]** - **A10.2.2 --- injection runtime du `ProjectionProfile` : \[IMPLÉMENTÉ + DÉMONTRÉ\]**

  \### 23.2 A10.1 --- `CoCConfiguration` causale

  Le contrat courant de `CoCConfiguration` est :

  `text { id, label, profileRef, publicationRef, defaultMaturity }`

  La configuration Engineering courante déclare :

  `text id              = engineering label           = Engineering profileRef      = engineering publicationRef  = engineering defaultMaturity = L2`

  À la frontière de composition, les références déclaratives sont résolues avant d'être fournies aux consommateurs runtime :

  `text CoCConfiguration ├── profileRef │      ↓ résolution │   ProfileRuntime │ ├── publicationRef │      ↓ résolution │   PublicationConfiguration │ └── defaultMaturity ↓ contexte effectif`

  `APP_MODE` reste une dimension séparée de la configuration de publication.

  Invariant A10.1 :

  \> **Une `CoCConfiguration` porte les choix déclaratifs propres à un CoC. À la frontière de composition, les références sont résolues en dépendances runtime et les valeurs par défaut alimentent les contextes effectifs. Les composants consomment ces dépendances ou contextes résolus plutôt que de
  résoudre eux-mêmes les références du CoC.**

  \### 23.3 A10.2.1 --- deuxième stratégie de projection

  Un second profil minimal est désormais supporté :

  \`\`\` text cocProjectionProfile contextualise les Process sous les Collaborations lorsque Collaboration → Participant → processRef → Process est résolu

  flatProjectionProfile ne contextualise pas ces Process sous les Collaborations et les laisse apparaître comme composants racines \`\`\`

  La preuve utilise le **même `RepositoryModel`** pour les deux projections.

  Résultat conceptuel :

  `text même RepositoryModel │ ├── cocProjectionProfile │       Collaboration A │           └── Process A │ └── flatProjectionProfile Collaboration A Process A        ← racine`

  Le modèle source n'est pas muté et aucune nouvelle sémantique métier n'est ajoutée au moteur générique de projection.

  Invariant A10.2.1 :

  \> **Un même `RepositoryModel` peut être projeté structurellement de manière différente par deux `ProjectionProfile` explicitement supportés, sans mutation du modèle source et sans ajout de sémantique métier à la mécanique générique de projection.**

  \### 23.4 A10.2.2 --- injection runtime

  La stratégie de projection peut désormais être injectée depuis la frontière applicative :

  `text createApp({ projectionProfile }) │ ↓ createRepositoryBrowser({ projectionProfile }) │ ↓ createEnvironmentProjection({ projectionProfile })`

  L'absence de profil injecté laisse `createEnvironmentProjection()` utiliser son comportement historique par défaut : `cocProjectionProfile`.

  A10.2.2 n'introduit volontairement :

  `text ni projectionRef dans CoCConfiguration ni resolver de ProjectionProfile ni registry applicative de ProjectionProfile ni modification du RepositoryModel`

  Invariant A10.2.2 :

  \> **Le `ProjectionProfile` est une dépendance runtime injectable depuis la frontière applicative jusqu'à la mécanique de projection de l'Environment Browser. Son absence conserve explicitement le comportement historique via le profil CoC par défaut ; son injection permet de substituer une
  stratégie de projection sans modifier le `RepositoryModel`, sans coupler l'UI à un profil particulier et sans introduire de nouvelle dimension dans `CoCConfiguration`.**

  \### 23.5 Preuves A10

  Pour A10.1g, la preuve navigateur a confirmé que la configuration de publication Engineering affecte réellement la composition du Viewer, notamment en masquant `Utilities` selon la configuration résolue.

  Pour A10.2.1, la suite ciblée `environment-projection-profile.test.js` passe **11/11**.

  Après A10.2.2, la validation ciblée des deux suites de projection passe :

  `text 2 fichiers de test 22 tests 22 passent 0 échec`

  La régression globale passe :

  `text 38 fichiers de test 181 tests 181 passent 0 échec`

  Les trois builds passent :

  `text standalone Viewer standalone Editor GitHub Pages`

  Les avertissements observés restent non bloquants et déjà connus : ordre des `@import` PostCSS, `eval` provenant de `archimate-js`, assets SVG non inline dans les standalone et chunk Pages supérieur à 500 kB.

  \### 23.6 Frontière architecturale actuelle

  À la fin d'A10.2, trois responsabilités doivent rester distinguées :

  `text ProjectionProfile ├── définition de stratégie │      cocProjectionProfile │      flatProjectionProfile │ ├── injection runtime │      createApp │          → createRepositoryBrowser │          → createEnvironmentProjection │ └── sélection / résolution déclarative NON MATÉRIALISÉE À CE STADE`

  Le fait que plusieurs profils existent et soient injectables ne démontre pas qu'un `projectionRef` doive appartenir à `CoCConfiguration`.

  Principe de poursuite :

  \> **Ne pas confondre capacité d'injection et nécessité d'une configuration déclarative. Une éventuelle résolution de `ProjectionProfile` devra constituer un incrément séparé, motivé et démontré.**
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 24. P3 --- Activation dynamique du profil par contexte CoC dans l'Editor

### 24.1 Statut

``` text
P3.3a  cocId → CoCConfiguration                 [IMPLÉMENTÉ + DÉMONTRÉ]
P3.3b  CoCConfiguration → ProfileRuntime A/B    [IMPLÉMENTÉ + DÉMONTRÉ]
P3.3c  cocId → ActiveProfileRuntime             [IMPLÉMENTÉ + DÉMONTRÉ]

P3.4a  RepositoryContextActions → cocs[]        [IMPLÉMENTÉ + DÉMONTRÉ]
P3.4b  RepositoryContext → activation runtime   [IMPLÉMENTÉ + DÉMONTRÉ]
P3.4c  refresh Properties Panel A ↔ B           [IMPLÉMENTÉ + DÉMONTRÉ]
```

Le chantier démontre qu'un contexte CoC actif dans l'Editor peut
sélectionner une `CoCConfiguration`, résoudre son `profileRef`,
remplacer le `ProfileRuntime` actif et recalculer immédiatement les
propriétés SemArch du même élément BPMN sélectionné.

### 24.2 ActiveProfileRuntime

Le Modeler possède désormais une référence runtime mutable :

``` text
ActiveProfileRuntime
    ├── get()
    └── set(ProfileRuntime)
```

Le `SemArchPropertiesProvider` ne conserve pas irréversiblement le
`ProfileRuntime` fourni lors de la création du Modeler. À chaque calcul
de ses groupes, il consulte le runtime courant via
`ActiveProfileRuntime.get()`.

Invariant :

> **Le `SemArchPropertiesProvider` n'est plus lié irréversiblement au
> `ProfileRuntime` fourni à la création du Modeler. Son `ProfileRuntime`
> actif peut être remplacé à l'exécution, et les propriétés applicables
> sont recalculées à partir du nouveau runtime, sans recréer le
> Modeler.**

### 24.3 P3.3a --- résolution de CoCConfiguration

`resolveCocConfiguration({ cocConfigurations, cocId })` fournit une
résolution explicite d'une identité de CoC vers la `CoCConfiguration`
correspondante.

Le resolver ne consulte pas le registre CoC historique et n'invente
aucun mapping entre ses identités et celles des configurations modernes.

Espaces d'identité actuellement distincts :

``` text
RepositoryContext / ancien catalogue
    CoC_Avionics
    CoC_Space_ESA
    ...

CoCConfiguration / profils expérimentaux
    engineering
    experimental-a
    experimental-b
```

Aucun mapping tel que `CoC_Avionics → engineering` n'est implicitement
introduit.

### 24.4 P3.3b --- profils expérimentaux A et B

Deux configurations/profils minimaux ont été ajoutés uniquement pour
démontrer la mécanique de bascule sans fabriquer de sémantique métier :

``` text
experimental-a
    demo:Deliverable
        businessId
        propertyA

experimental-b
    demo:Deliverable
        businessId
        propertyB
```

Les deux profils utilisent le même identifiant de type sémantique
`demo:Deliverable`, mais leurs propriétés XSD possèdent des références
canoniques distinctes, car elles proviennent de namespaces de schéma
distincts.

`businessId` est donc commun conceptuellement et par nom dans cette
expérience ; cela ne démontre pas encore une identité technique Core
partagée.

### 24.5 P3.3c --- activation transactionnelle

La chaîne d'activation démontrée est :

``` text
cocId
  ↓
resolveCocConfiguration(...)
  ↓
CoCConfiguration.profileRef
  ↓
resolveEmbeddedProfileRuntime(...)
  ↓
ActiveProfileRuntime.set(...)
```

La `CoCConfiguration` puis le `ProfileRuntime` sont résolus avant la
mutation de l'`ActiveProfileRuntime`.

Invariant :

> **L'activation d'un profil à partir d'une identité de CoC est une
> opération de composition explicite et transactionnelle au niveau du
> runtime : la `CoCConfiguration` puis le `ProfileRuntime` sont résolus
> avant toute mutation de l'`ActiveProfileRuntime`. Cette mécanique
> reste indépendante du `RepositoryContext`, du registre CoC historique,
> de la publication et du rafraîchissement UI.**

### 24.6 P3.4a --- source explicite des CoC du RepositoryContext

`RepositoryContextActions` consomme désormais une liste explicite
`cocs[]` plutôt que `cocRegistry.cocs`.

Cette évolution évite de coupler les actions de contexte au catalogue
CoC historique. `RepositoryContextActions` reste ignorant des profils et
de leur résolution.

Le `RepositoryContext` demeure le contexte métier/méthode persistant
actif. Aucun `ProfileContext` parallèle n'est introduit.

### 24.7 P3.4b --- RepositoryContext vers activation runtime

À la frontière de composition de l'Editor, les `CoCConfiguration`
Engineering, Experimental A et Experimental B sont fournies au dialogue
de contexte.

Lors de la sauvegarde :

``` text
RepositoryContext.cocOwner
        ↓
onContextChanged(values)
        ↓
activateCocProfileRuntime(...)
        ↓
resolveCocConfiguration(...)
        ↓
resolveEmbeddedProfileRuntime(...)
        ↓
ActiveProfileRuntime.set(...)
```

`RepositoryContextActions` conserve son comportement synchrone. La
résolution asynchrone du profil est consommée explicitement à la
frontière de composition, sans transformer silencieusement le contrat de
`save()`.

La publication et `APP_MODE` restent hors de cette chaîne dynamique de
l'Editor.

### 24.8 P3.4c --- rafraîchissement du Properties Panel

Après activation réussie du nouveau runtime, l'Editor émet l'événement
standard du Properties Panel :

``` text
propertiesPanel.providersChanged
        ↓
Properties Panel _update(selectedElement)
        ↓
provider.getGroups(selectedElement)
        ↓
SemArchPropertiesProvider
        ↓
ActiveProfileRuntime.get()
        ↓
propriétés du profil actif
```

La sélection BPMN n'est pas simulée, le Modeler n'est pas recréé et
aucune API privée du Properties Panel n'est utilisée.

La preuve navigateur a été réalisée sur le même
`bpmn:DataObjectReference` sélectionné.

Représentation démontrée :

``` text
demo:Deliverable
        │
        ├── master
        │     bpmn:DataObject
        │         └── bpmn:extensionElements
        │               └── semarch:SemanticType
        │                     ref="demo:Deliverable"
        │
        └── occurrence
              bpmn:DataObjectReference
```

Le profil déclare explicitement :

``` text
bpmnAnchor      = bpmn:DataObject
master          = bpmn:DataObject
occurrence      = bpmn:DataObjectReference
```

Cette preuve ne repose donc ni sur `bpmn:Task` ni sur `bpmn:DataStore`.
`semarch:DataStoreContext` existe par ailleurs dans le moddle, mais son
existence ne démontre aucune relation d'héritage entre
`Deliverable`/`Document` et `DataStore`.

Résultat visible démontré :

``` text
même Experimental Deliverable sélectionné

Experimental A                    Experimental B
────────────────                  ────────────────
SemArch                           SemArch
Experimental Deliverable         Experimental Deliverable
demo:Deliverable                 demo:Deliverable
Business Id                      Business Id
Property A              ⇄        Property B
```

La bascule est donc observable dans le Properties Panel sans recréer le
Modeler et sans remplacer le BPMN.

Invariant P3.4c :

> **Un changement de CoC actif peut remplacer le `ProfileRuntime` de
> l'Editor à l'exécution et provoquer le recalcul immédiat des
> propriétés SemArch du même élément BPMN sélectionné, sans recréer le
> Modeler et sans modifier le modèle BPMN source.**

### 24.9 Preuves automatisées et build

Les validations enregistrées pour cette chaîne comprennent :

``` text
P3.3a
    resolver CoCConfiguration
    4/4 tests ciblés

P3.3b
    profils/configurations expérimentaux
    validation ciblée : 3 fichiers / 12 tests

P3.3c
    activation CoC → ActiveProfileRuntime
    validation ciblée de la chaîne : 4 fichiers / 16 tests

P3.4a
    RepositoryContextActions avec cocs[]
    8 tests

P3.4b
    RepositoryContext → activation runtime
    validation ciblée : 5 fichiers / 24 tests
    build standalone Editor : succès

P3.4c
    RepositoryContextActions
    SemArchPropertiesProvider
    CoC Profile Runtime Activation
    3 fichiers / 16 tests
    build standalone Editor : succès
    preuve navigateur A ↔ B : succès
```

Pour P3.4c, une commande avait également nommé
`active-profile-runtime.test.js`, mais la sortie Vitest observée ne
listait que trois fichiers. Le présent document conserve donc le
résultat effectivement observé : **3 fichiers / 16 tests**.

Le baseline global post-P3 est désormais explicitement démontré :

``` text
41 fichiers de test
194 tests
194 passent
0 échec
```

Cette régression globale a été exécutée après P3.4c avec Vitest en mode
non interactif (`vitest --run`). Elle constitue le baseline global
courant enregistré pour la fermeture du périmètre P3.3--P3.4c.

### 24.10 Frontières volontairement non introduites

Le chantier P3.3/P3.4 n'introduit volontairement :

``` text
ni ProfileContext parallèle
ni mapping CoC_Avionics → engineering
ni enrichissement de l'ancien coc-registry avec profileRef/publicationRef
ni projectionRef dans CoCConfiguration
ni resolver/registry de ProjectionProfile
ni recréation du Modeler lors d'un changement de CoC
ni résolution de profil dans SemArchPropertiesProvider
ni modification dynamique du Viewer à partir du RepositoryContext de l'Editor
```

La politique future « masquer les propriétés non pertinentes sans
détruire les données existantes » n'est pas encore implémentée. Le
mécanisme actuel de descriptors préserve volontairement les
`semarch:DataProperty` existantes même lorsqu'elles ne sont pas résolues
par le profil courant afin de maintenir l'interopérabilité.

La préservation sérialisée et la visibilité UI devront donc rester deux
responsabilités distinctes.

### 24.11 Conséquence pour la tranche P1 → P4

P3 démontre désormais la partie dynamique Editor de la tranche verticale
:

``` text
P1 — sérialisation
        ↓
P2 — Profile Runtime
        ↓
P3 — Editor multi-CoC
        ✓ contexte sélectionnable
        ✓ activation runtime
        ✓ propriétés recalculées
        ↓
P4 — publication
```

Le Viewer reste une cible de publication gouvernée par sa
`PublicationConfiguration`, et non un miroir dynamique du contexte
Editor.

La suite doit continuer à distinguer :

``` text
Profile
    ce que le contexte sémantique supporte

RepositoryContext
    quel CoC/contexte métier est actif dans l'Editor

ProjectionProfile / Viewpoint
    comment le repository est organisé ou présenté

PublicationConfiguration
    ce qui est publié dans une cible Viewer
```

------------------------------------------------------------------------

## 25. P4 --- Publication BPMN dérivée et consommation par le Viewer

### 25.1 Statut

``` text
P4.1   frontière PublicationConfiguration                 [DÉMONTRÉE PAR INSPECTION]
P4.6   primitive publishBpmnXml(ProfileRuntime)           [IMPLÉMENTÉ + DÉMONTRÉ]
P4.8a  DiagramActions → Publisher                         [IMPLÉMENTÉ + DÉMONTRÉ]
P4.8b  câblage applicatif + runtime actif à l'export      [IMPLÉMENTÉ + DÉMONTRÉ]
P4.9a  Published BPMN → moteur Viewer réel                [IMPLÉMENTÉ + DÉMONTRÉ]
P4.9b  Published BPMN → standalone Viewer                 [IMPLÉMENTÉ + DÉMONTRÉ]

régression globale post-P4.9
    44 fichiers de test
    204 tests
    204 passent
    0 échec

build standalone Editor    [DÉMONTRÉ]
build standalone Viewer    [DÉMONTRÉ]
build GitHub Pages         [DÉMONTRÉ]
```

P4 démontre désormais une chaîne de publication BPMN distincte de la
persistance du document source. La publication est une dérivation,
jamais une mutation destructive du BPMN conservé dans le Repository.

### 25.2 Frontière persistance / publication

La persistance Editor conserve le BPMN édité comme document source :

``` text
Editor / BPMN source
        │
        ├──→ RepositoryEditorSync
        │       → RepositoryDocument source intact
        │
        └──→ frontière d'export
                → Publisher
                → Published BPMN
```

`RepositoryEditorSync` n'appelle pas le Publisher.

Invariant :

> **La persistance conserve le BPMN édité comme document source. Une
> publication est une dérivation distincte de ce document et ne modifie
> pas le BPMN source pour exprimer les choix de publication.**

### 25.3 Primitive de publication sémantique

`publishBpmnXml({ sourceXml, profileRuntime })` parse le BPMN avec le
moddle SemArch, examine les `semarch:DataProperty` et conserve dans
l'artefact publié les propriétés résolues par le `ProfileRuntime`
effectif.

Les autres extensions ne sont pas supprimées par cette primitive.

La preuve P4.6 utilise le même BPMN source contenant simultanément :

``` text
demo:Deliverable
    Property A
    Property B
```

Le résultat dépend du runtime :

``` text
ProfileRuntime A → Published BPMN contenant Property A seulement
ProfileRuntime B → Published BPMN contenant Property B seulement
```

Le BPMN source conserve A et B dans les deux cas.

Invariant P4.6 :

> **Un artefact BPMN publié peut être dérivé du document BPMN source
> selon un `ProfileRuntime`, en excluant de l'artefact les
> `DataProperty` non résolues par ce runtime, sans modifier ni appauvrir
> le document BPMN source.**

### 25.4 Frontière d'export de l'Editor

`DiagramActions.exportXML()` sérialise d'abord le modèle courant avec le
pipeline BPMN historique, puis délègue facultativement la dérivation au
Publisher injecté.

L'absence des dépendances de publication conserve le comportement
d'export historique.

Après P4.8b, l'Editor injecte au `DiagramActions` :

``` text
publishBpmnXml
ActiveProfileRuntime
```

Le runtime n'est pas figé au démarrage. `DiagramActions` consulte
`ActiveProfileRuntime.get()` au moment exact de l'export.

Invariant P4.8 :

> **L'export BPMN de l'Editor consomme le `ProfileRuntime` actif au
> moment de la publication. Un changement de CoC peut donc modifier
> l'artefact BPMN publié sans recréer le Modeler, sans figer le profil
> initial et sans modifier le document BPMN source persisté.**

### 25.5 PublicationConfiguration et ProfileRuntime restent distincts

Le contrat démontré de `PublicationConfiguration` reste minimal :

``` text
{
  capabilities: {
    utilities
  }
}
```

La configuration Engineering porte `publicationRef = engineering` et sa
configuration de publication peut notamment masquer `Utilities`.

La politique sémantique de P4.6 ne justifie pas d'ajouter un
`profileRef` dans `PublicationConfiguration`. `CoCConfiguration` porte
actuellement séparément :

``` text
profileRef
publicationRef
defaultMaturity
```

À la frontière de composition, le Publisher consomme un `ProfileRuntime`
déjà résolu. Il ne résout pas lui-même le CoC ou son profil.

Frontières conservées :

``` text
PublicationConfiguration.profileRef
    [NON IMPLÉMENTÉ — NON JUSTIFIÉ]

resolver de ProfileRuntime dans Publisher
    [NON IMPLÉMENTÉ — À ÉVITER]

politique sémantique supplémentaire dans PublicationConfiguration
    [NON IMPLÉMENTÉ — À JUSTIFIER PAR UN BESOIN OBSERVABLE]
```

### 25.6 Published BPMN → Viewer réel

P4.9a démontre avec le vrai `createViewer()` et `viewer.importXML()`
qu'un BPMN publié selon le runtime A ou B peut être chargé directement
par le moteur du Viewer BPMNSM.

La chaîne démontrée est :

``` text
BPMN source
    → publishBpmnXml(ProfileRuntime A/B)
    → Published BPMN A ou B
    → createViewer()
    → viewer.importXML()
    → DataObject réellement chargé
```

Le Viewer moderne possède déjà l'extension moddle SemArch et le lint. Il
n'a pas besoin de résoudre un `ProfileRuntime` pour interpréter le
résultat de publication.

Invariant P4.9a :

> **Un artefact BPMN dérivé par le Publisher BPMNSM selon le
> `ProfileRuntime` effectif peut être consommé directement par le moteur
> du Viewer BPMNSM, sans résolution de profil ni nouvelle transformation
> sémantique côté Viewer, tandis que le BPMN source conserve l'ensemble
> de ses propriétés.**

### 25.7 Standalone Viewer → Open BPMN

P4.9b introduit dans le standalone Viewer une action distincte :

``` text
Open BPMN…
    → lecture du fichier
    → loadDiagram(xml)
    → consultation
```

Cette action est volontairement différente de `Open Repository…` et de
l'import BPMN de l'Editor.

Elle n'effectue :

``` text
ni import dans l'Environment d'édition
ni reconstruction du Repository canonique
ni résolution de ProfileRuntime
ni nouvelle publication
ni nouvelle transformation sémantique
```

L'Editor n'expose pas cette action directe `Open BPMN…`.

Invariant P4.9b :

> **Un artefact BPMN déjà dérivé par le Publisher BPMNSM peut être
> ouvert directement par le standalone Viewer comme document de
> consultation, sans être importé dans l'environnement d'édition, sans
> devenir Repository canonique, sans résolution de `ProfileRuntime` et
> sans nouvelle transformation sémantique.**

### 25.8 Preuves P4.9 et baseline global

Les preuves ciblées finales de P4.9 comprennent :

``` text
src/ui/toolbar.test.js
    8 tests

src/publication/bpmn-publication.test.js
    2 tests

src/publication/bpmn-publication-viewer.test.js
    2 tests

total ciblé P4.9b
    3 fichiers / 12 tests
```

La preuve Viewer réelle P4.9a repose sur `jsdom` avec des shims locaux
au test pour la géométrie SVG et le contexte Canvas 2D nécessaires à
bpmn-js. Aucun shim de production ni dépendance native `canvas` n'a été
ajouté.

Le baseline global après P4.9 est :

``` text
44 fichiers de test
204 tests
204 passent
0 échec
```

Les trois builds passent :

``` text
standalone Editor
standalone Viewer
GitHub Pages
```

Les avertissements restent non bloquants et connus : ordre des `@import`
PostCSS, `eval` provenant de `archimate-js`, certains SVG non inlinés et
chunk Pages supérieur à 500 kB.

### 25.9 Nuance de preuve

Les preuves automatisées démontrent séparément :

1.  Publisher → vrai moteur Viewer ;
2.  UI du standalone Viewer → dispatch `Open BPMN…` → chargement direct.

Il n'existe pas encore de test navigateur E2E unique traversant le build
standalone, le sélecteur de fichier réel et l'ouverture d'un artefact
produit dans la même exécution.

Ne pas transformer cette nuance en exigence architecturale sans besoin
produit.

### 25.10 Frontière de reprise après P4.9

Avant de nommer un nouvel incrément P4 ou de déclarer toute la cible P4
définitivement close, inspecter la frontière restante :

``` text
CoCConfiguration
    → PublicationConfiguration
    → Publisher
```

La question à résoudre par inspection du dépôt est : **quelle part de «
publication configurable par CoC » est réellement encore non démontrée
après P4.9 ?**

Ne pas introduire par symétrie :

``` text
PublicationConfiguration.profileRef
projectionRef
resolver de ProfileRuntime dans le Viewer
resolver de ProfileRuntime dans le Publisher
nouvelle politique sémantique de publication
```

sans besoin observable et preuve correspondante.

# Résumé en une phrase

**BPMNSM est un atelier/runtime JavaScript/Vite basé sur bpmn.io qui
utilise BPMN 2.0 XML comme langage pivot, enrichit et projette les
référentiels selon des configurations CoC explicites, permet à l'Editor
de remplacer dynamiquement le `ProfileRuntime` selon le contexte actif
et démontre désormais une chaîne de publication non destructive dans
laquelle le runtime actif dérive un Published BPMN directement
consommable par le standalone Viewer sans résolution de profil ni
transformation sémantique côté consultation.**

------------------------------------------------------------------------

## 26. Checkpoint Business View et démonstrateur Avionics --- 2026-09-17

Cette section est le **delta de continuité courant** après P4.9. En cas de baseline historique contradictoire dans les sections précédentes, ce checkpoint plus récent prévaut pour la continuité ; le dépôt réel reste l'autorité sur le code.

### 26.1 Baseline courant démontré

```text
59 fichiers de test
267 tests
267 passent
0 échec
```

### 26.2 Business View versionnée

Une primitive `BusinessView` normalisée est désormais implémentée et testée :

```text
BusinessView
  id
  version
  stakeholderRef
  projections[]
    typeRef
    propertyRefs[]
```

`propertyRefs[]` référence les identités canoniques des propriétés normalisées. Ce choix est volontairement générique : la propriété normalisée possède déjà un `kind`, un `targetType` et une cardinalité, ce qui permet d'étendre ultérieurement le runtime à des relations/object properties sans changer le format de la vue.

La Business View ne fait pas partie du `ProfileRuntime`.

```text
ProfileRuntime
    quelles propriétés existent / sont résolubles

BusinessView
    lesquelles sont projetées pour une vue/stakeholder
```

### 26.3 Projection dans le Properties Panel

`createSemArchPropertyDescriptors()` accepte désormais une Business View facultative. Lorsqu'elle est présente, seules les propriétés de schéma référencées par la projection du type sont générées pour ce type.

Les `semarch:DataProperty` déjà présentes dans le BPMN restent préservées même lorsqu'elles sont hors vue ou non résolues, afin de conserver l'invariant d'interopérabilité et de non-destruction.

### 26.4 ActiveBusinessView et câblage runtime

Un holder mutable `ActiveBusinessView` est injecté dans le Modeler. Le provider lit la vue active à chaque recalcul, comme il lit déjà `ActiveProfileRuntime`.

Chaîne démontrée :

```text
createApp({ businessView })
        ↓
createBpmnEngine({ businessView })
        ↓
createModeler({ businessView })
        ↓
ActiveBusinessView
        ↓
SemArchPropertiesProvider
```

Le Viewer reste hors de cette chaîne et ne reçoit pas de Business View runtime.

### 26.5 Résolution et sélection

Deux responsabilités sont séparées :

```text
resolveStakeholderBusinessViewRef(...)
    stakeholderRef → businessViewRef

resolveBusinessView(...)
    businessViewRef → BusinessView resource
```

Le resolver de Business View utilise l'identité logique de la ressource. La version appartient à la ressource ; aucune convention `id@version` ou `versionRef` n'existe actuellement dans BPMNSM. Plusieurs ressources portant le même id logique sont donc considérées ambiguës.

`stakeholderRef` ne constitue pas implicitement une politique de sélection. Le démonstrateur utilise une association explicite séparée. Aucun `businessViewRef` n'a été ajouté à `CoCConfiguration`.

### 26.6 Business View Avionics v1.0

La vue démontrée est :

```text
id             avionics
version        1.0
stakeholderRef CoC_Avionics
```

Projection `PAF_Deliverable` :

```text
urn:semarch:test:coc-avionics#PAFDeliverableType.domain
urn:semarch:test:coc-avionics#PAFDeliverableType.isKID
urn:semarch:test:coc-avionics#PAFDeliverableType.isProcessIO
urn:semarch:test:coc-avionics#PAFDeliverableType.template
```

Projection `PAF_Document` :

```text
urn:semarch:test:coc-avionics#PAFDocumentType.URL
urn:semarch:test:coc-avionics#PAFDocumentType.domain
```

Ces six propriétés correspondent au vertical Avionics réellement utilisé pour le démonstrateur. L'état du Deliverable reste porté par `bpmn:dataState` sur l'occurrence ; il n'est pas transformé en `semarch:DataProperty`.

### 26.7 Activation dynamique par contexte

Lors d'un changement de `RepositoryContext.cocOwner`, l'Editor active d'abord le ProfileRuntime du CoC puis résout la sélection de Business View du stakeholder et met à jour `ActiveBusinessView`. Le Properties Panel est ensuite rafraîchi via `propertiesPanel.providersChanged`.

```text
RepositoryContext.cocOwner
        ├──→ ActiveProfileRuntime
        └──→ stakeholder selection
                → BusinessView resolver
                → ActiveBusinessView
                → Properties Panel refresh
```

Pour le démonstrateur courant :

```text
CoC_Avionics → businessViewRef avionics → Avionics Business View v1.0
```

La preuve UI a montré les propriétés attendues sur PAF Deliverable et PAF Document.

### 26.8 Business Object : cible émergente, pas encore implémentée

Les travaux Avionics ont clarifié la séparation cible :

```text
Business Object
  businessObjectId
  typeRefs[] 1..n
        ↓ represented by
BPMN Representation
        ↓ 0..n lorsque BPMN le justifie
BPMN Occurrence
        ↓
state / context
```

Le Business Object doit nécessairement être typé et la cible prévoit le multi-typing. Les types doivent provenir d'un catalogue extensible alimenté par des modèles BO ingérés et mappés vers des constructions BPMN compatibles.

Une Business View versionnée, associée à un stakeholder, détermine les propriétés projetées sur une représentation. Un même Business Object doit pouvoir être vu différemment par plusieurs stakeholders sans duplication d'identité.

Le modèle actuel ne possède toutefois pas encore de `BusinessObject` explicite dans `semarch.json`, ni de `typeRefs[]` BO, ni de relation BO → représentation BPMN.

### 26.9 Identités

L'inspection du Repository confirme qu'il faut conserver :

```text
Business Object identity
    ≠ semarch:stableGuid
    ≠ BPMN element id
    ≠ RepositoryComponent.id
```

`semarch:stableGuid` reste une identité persistante de représentation SemArch ; il ne doit pas être promu implicitement en identifiant de Business Object.

### 26.10 Multi-typing existant : portée exacte

Le BPMN peut déjà porter plusieurs `semarch:SemanticType` et le provider peut agréger des propriétés de plusieurs types. Ce mécanisme est utile mais ne démontre pas encore le Business Object multi-typé cible.

La résolution actuelle d'une propriété parcourt les types et retient le premier binding qui résout le `propertyRef`; les descriptors dédupliquent par `propertyRef`. La qualification complète d'une propriété par type en cas de collision reste non implémentée.

### 26.11 Relation BPMN objet / occurrence

Le vertical courant exploite les relations BPMN natives :

```text
bpmn:DataStoreReference.dataStoreRef → bpmn:DataStore
bpmn:DataObjectReference.dataObjectRef → bpmn:DataObject
```

Une référence absente peut être un choix intentionnel ; ne pas la qualifier automatiquement d'anomalie ou d'« orphan ».

Les futures opérations envisagées sont : standalone, attach, detach, reattach, création d'une nouvelle cible ou choix d'une cible existante. Elles ne sont pas encore implémentées. Le detach ne devra pas supprimer automatiquement la cible et le reattach ne devra pas recopier aveuglément état/contexte.

Ne pas extrapoler le pattern DataStore/DataObject à `Participant` ou à tout `*Ref` sans preuve BPMN spécifique.

### 26.12 Frontières encore ouvertes

```text
Business Object générique                         [NON IMPLÉMENTÉ]
Business Object multi-typing                      [NON IMPLÉMENTÉ]
object properties / relations génériques          [NON IMPLÉMENTÉ]
Business View persistence / ingestion             [NON IMPLÉMENTÉ]
plusieurs vues par stakeholder + choix/version    [NON IMPLÉMENTÉ]
BO ↔ BPMN Representation attach/detach/reattach   [NON IMPLÉMENTÉ]
création standalone/new/existing target           [NON IMPLÉMENTÉ]
label calculé/configurable                        [NON IMPLÉMENTÉ]
vocabulaire final remplaçant Master               [NON IMPLÉMENTÉ]
```

Le terme `Master` encore visible dans le prototype Properties Panel est un vocabulaire transitoire. La direction conceptuelle est `Business Object → BPMN Representation → BPMN Occurrence` lorsque ces trois niveaux sont réellement nécessaires.

### 26.13 Point de reprise

La prochaine tranche doit partir d'un besoin produit observable autour du Business Object et de ses représentations, et réutiliser les primitives déjà démontrées avant d'introduire un nouveau métamodèle.

Avant toute modification : inspecter les fichiers exacts du dépôt. En particulier, ne pas modifier `semarch.json`, le RepositoryModel ou les comportements de création/référence sur la seule base de cette cible conceptuelle.

------------------------------------------------------------------------

## 17. Continuity update --- publication and Git repositories --- 2026-09-19

This dated context remains historical; the following update records decisions needed to resume work without reconstructing them from chat history.

The current operational model separates four concerns:

```text
BPMNSM source/configuration
    → Git commit
    → CI/build
    → static deployment

resource repository
    → files (BPMN and justified companion resources)
    → Git branch/tag/commit
```

An execution is identified conceptually by the BPMNSM deployment together with the selected resource repository and its resolved revision. There is no requirement for a shared remote database.

For editing, preserve both a local-workspace mode with external Git and a future remote-forge mode using an application-side provider. GitHub is the first target, but provider-specific API details must not become the repository business model. GitLab portability is a design constraint to preserve, not an implemented capability.

The publication target now includes retained immutable official releases, `latest`, development previews and optional tailored distributions, all potentially launchable simultaneously. Exact URL layout, browser-storage isolation and remote authentication remain to be demonstrated.

The immediate delivery sequence is deliberately smaller: commit the demonstrated consolidated baseline, publish it to GitHub, obtain the first GitHub Actions proof from a fresh checkout, then establish the minimum useful Pages deployment before returning to the Business Model experimental sequence. E14 remains the next open Business Model experiment.

Cross-project reuse with ArchiCG and StandardisationRadarChart is deferred. Do not reorganize the projects into a monorepo or create shared packages solely from anticipated similarity. Keep potentially reusable mechanisms weakly coupled and extract them only after a second concrete consumer demonstrates the common contract.
