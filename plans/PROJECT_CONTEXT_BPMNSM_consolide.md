# BPMNSM / Semantic Process Mediator --- Document de continuité du projet

**Version de continuité :** 2026-09-12\
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

La conception a évolué depuis l'hypothèse initiale d'un simple arbre Git organisé par CoC.
Le contrat actuellement retenu est :

> **Un Repository BPMNSM est un `bpmn:Definitions` enrichi d'extensions SemArch minimales décrivant le repository, son mode `single-coc | multi-coc`, les CoC et leurs relations d'appartenance. Les éléments métier restent des éléments BPMN natifs. `RepositoryModel` est une projection runtime de cette sérialisation.**

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

La présence de `semarch:RepositoryContext` dans `bpmn:Definitions` constitue la signature explicite d'un Repository BPMNSM.

États distingués :

``` text
BPMN_DOCUMENT
    aucun RepositoryContext

BPMNSM_REPOSITORY
    RepositoryContext présent et cohérent

INVALID_BPMNSM_REPOSITORY
    RepositoryContext présent mais métadonnées incohérentes
```

Un document BPMN ordinaire ne devient jamais implicitement un Repository BPMNSM du seul fait qu'il contient plusieurs processus ou une Collaboration.

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

`RepositoryDocumentStore` n'est pas la persistance canonique du Repository.

Le Repository reste indépendant de l'éditeur et compatible avec une gestion de configuration Git. Les fichiers BPMN sources/importés peuvent rester autonomes et versionnables ; l'assemblage et la transposition ne doivent pas imposer un monolithe propriétaire comme source unique de vérité.

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

`Import BPMN into Environment…` accepte un BPMN valide sans lui imposer de CoC ou de Membership.

`Open Repository…` vérifie la présence de `RepositoryContext`. En son absence, l'utilisateur peut être averti et choisir d'importer néanmoins le BPMN dans l'Environment, sans transformation implicite en Repository.

À terme, ces deux commandes doivent converger vers un moteur commun d'import/distribution, la différence portant sur la validation de l'intention utilisateur.

### 4.4 Identité et références

Les IDs BPMN doivent être préservés autant que possible lors des imports/exports.

Il faut distinguer :

``` text
Repository object identity
≠
BPMN model element id
≠
Business identity
```

Pour l'ingestion fragmentaire de référentiels externes, l'identité source est conceptuellement :

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

Une référence non résolue doit pouvoir survivre à l'import et se résoudre ultérieurement lorsqu'un fragment complémentaire est chargé.

### 4.5 Projection des métadonnées Repository

`projectRepositoryMetadata()` projette actuellement les extensions Repository vers `RepositoryModel` :

- `semarch:CoC` → containers runtime ;
- `semarch:Membership` résolu → références runtime de containment ;
- `Membership.componentRef` référence l'ID BPMN sérialisé, pas l'ID runtime ;
- une cible absente reste diagnostiquée comme membership non résolu ;
- la projection résolue est idempotente.

Le `Meta.cocRef` historique reste toléré pour compatibilité mais n'est pas la relation canonique de membership.

### 4.6 Modèle vs diagramme

Les fonctions repository et multi-CoC travaillent sur les **BPMN models / moddle elements et leurs références**, et non sur les seules shapes du canvas.

Un processus peut être référencé ou projeté dans plusieurs contextes/diagrammes sans être dupliqué sémantiquement.

### 4.7 Assemblage

Un BPMN global peut être assemblé à la demande pour échange avec un outil tiers.

L'assemblage doit résoudre les références inter-composants et produire du BPMN standard chaque fois que la relation peut être exprimée nativement dans un document global.

Le monolithe global d'échange/publication ne doit pas devenir par défaut une représentation propriétaire irréversible du référentiel.

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

Ce nombre n'est plus le baseline courant : `src/bpmn/item-definition-runtime.test.js` a ensuite été identifié comme un fichier résiduel mal nommé contenant du code de production dupliqué et aucun test. Il a été supprimé.

Après les évolutions Repository Browser / Environment, un baseline intermédiaire explicitement confirmé était :

``` text
24 fichiers de test
95 tests
95 passent
0 échec
```

Le **baseline courant explicitement démontré le 2026-09-12**, après les quatre incréments `ProjectionProfile`, est désormais :

``` text
25 fichiers de test
105 tests
105 passent
0 échec
```

Commande de preuve :

``` bash
npm test
```

Le chantier datatype reste considéré comme démontré. Il couvre notamment :

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

Les tests Repository / Environment démontrent en outre :

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

environment-projection-profile.test.js
    → 10 tests passés
```

Les six cas historiques de projection Environment démontrés couvrent :

1. Process isolé → racine Processes ;
2. Process contextualisé par Collaboration → non racine ;
3. Collaboration sous CoC → non racine ;
4. CoC sous Repository lorsque cette relation est fournie ;
5. `processRef` non résolu préservé dans le contexte Collaboration ;
6. même Process projetable sous plusieurs Collaborations.

Les dix tests `environment-projection-profile.test.js` démontrent en plus que la politique de projection CoC est explicitement déclarée et effectivement consommée par le moteur pour :

``` text
rootComponentTypes
contextualizeProcessesUnderCollaborations
collaborationProcessContext
    participantReferenceType
    processReferenceType
preferCollaborationContextOverDirectCocMembership
```

Ils démontrent également que :

``` text
profil CoC explicite
    =
projection par défaut historique

profil non supporté
    → rejet explicite
```

Avant toute nouvelle modification, `npm test` reste le moyen de prendre l'état réel du dépôt comme référence. Le baseline `25 / 105` est une preuve enregistrée, pas une garantie si le dépôt a évolué depuis.

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

> **Gestion interopérable des datatypes** — BPMNSM distingue désormais
> l'identité sémantique d'un type de sa prise en charge par
> l'application. Les types connus bénéficient automatiquement d'une
> représentation adaptée dans l'interface (par exemple une case à
> cocher pour `xsd:boolean`), tandis que les types valides mais non
> encore supportés sont préservés sans perte et restent éditables via un
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
être utilisé avec un profil/XSD déclarant une propriété `xs:boolean`, car
le Properties Panel est piloté par le schéma et non par une liste de
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
projection-profiles/coc-projection-profile.js
repository-browser.js
```

`RepositoryModel` expose une projection runtime de containers, components et references. Les références ne nécessitent pas que source et cible soient déjà présentes, ce qui permet de préserver les références non résolues.

`registerBpmnDocument()` enregistre notamment `Process`, `Collaboration` et `Participant`, avec des IDs runtime dérivés du document et de l'ID BPMN. Le `containerId` est optionnel : un BPMN importé sans contexte CoC ne reçoit plus d'appartenance implicite.

### 12.2 Architecture de projection Environment démontrée

`createEnvironmentProjection()` construit une projection sans muter `RepositoryModel`.

L'architecture courante est :

``` text
RepositoryModel
      │
      │ données + relations
      ▼
ProjectionProfile
      │
      │ politique de vue
      ▼
createEnvironmentProjection()
      │
      │ mécanisme de projection
      ▼
Environment Projection
      │
      ▼
Repository Browser
```

Le contrat de navigation visible reste :

``` text
Environment
├── Repositories
├── CoCs
├── Collaborations
└── Processes
```

Cette hiérarchie UI est une projection, pas le containment BPMN ni une ontologie universelle.

Le premier profil implémenté est `cocProjectionProfile`. Il reproduit le comportement CoC historique tout en rendant explicites plusieurs décisions qui étaient auparavant codées dans le moteur.

Contrat actuellement démontré :

``` text
cocProjectionProfile
├── id = coc
├── rootComponentTypes
│   ├── collaboration
│   └── process
├── contextualizeProcessesUnderCollaborations = true
├── collaborationProcessContext
│   ├── participantReferenceType = participant
│   └── processReferenceType = processRef
└── preferCollaborationContextOverDirectCocMembership = true
```

Le moteur consomme réellement ces propriétés. Elles ne constituent donc pas seulement de la documentation déclarative.

La règle historique « parent pertinent le plus spécifique » doit désormais être comprise comme **une politique du profil CoC**, et non comme une règle universelle du moteur.

Pour le profil CoC actuel :

``` text
Repository
    → sous Repositories

CoC
    → sous son Repository si résolu
    → sinon sous CoCs

Collaboration
    → sous son CoC si résolu
    → sinon sous Collaborations si le profil autorise ce type à la racine

Process
    → sous Collaboration si le profil active la contextualisation
      et si le chemin de références configuré est résolu
    → l'occurrence directe sous CoC peut être masquée lorsque
      le profil donne priorité au contexte Collaboration
    → sinon sous son CoC si directement associé
    → sinon sous Processes si le profil autorise ce type à la racine
```

Le chemin BPMN actuellement utilisé pour contextualiser un Process sous une Collaboration est explicitement porté par le profil :

``` text
Collaboration
    -- participant -->
Participant
    -- processRef -->
Process
```

Un même Process peut avoir plusieurs occurrences UI dans plusieurs contextes de Collaboration sans duplication de l'objet sémantique.

Table de comportement acquise pour les deux politiques de contextualisation :

``` text
contextualize = true
precedence    = true
    → Process sous Collaboration seulement
      lorsqu'il est aussi directement rattaché au CoC

contextualize = true
precedence    = false
    → Process sous Collaboration
      + directement sous CoC

contextualize = false
precedence    = true
    → pas d'occurrence Process sous Collaboration
      → Process directement sous CoC

contextualize = false
precedence    = false
    → Process directement sous CoC
```

Invariant désormais étayé par les tests :

> **La position d'un Process dans la projection n'est pas entièrement imposée par le moteur ; elle résulte du `ProjectionProfile` actif et des relations disponibles.**

### 12.3 Repository Browser

Le Repository Browser est construit autour de la projection Environment :

``` text
Environment
  Repositories
  CoCs
  Collaborations
  Processes
```

Les quatre catégories sont toujours présentes. `Unassigned BPMN` n'est plus utilisé comme branche sémantique.

La sélection programmatique recherche l'objet sémantique dans l'arbre rendu au lieu de supposer un node ID unique, ce qui permet plusieurs occurrences UI du même objet.

Cette structure constitue le **premier profil de projection CoC-centric**, et non la taxonomie universelle définitive de BPMNSM.

### 12.4 Panneaux de propriétés

Principe conservé :

> le panneau de propriétés doit pouvoir afficher un **businessObject BPMN directement**, sans fabriquer un faux élément graphique.

API conceptuelle :

``` js
readOnlyPropertiesPanel.showBusinessObject(
  businessObject
)
```

Cela évite notamment de confondre `Participant` graphique et `Process` sémantique.

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

Le profil/méthode Avionics peut rester disponible dans les registries sans qu'un CoC Avionics soit instancié au démarrage.

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

La toolbar affiche `NO MODEL` et désactive les commandes dépendant d'un modèle.

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

`WelcomeView` est la vue active initiale. Le panneau central W2UI reste propriétaire de sa géométrie.

Invariant W2UI acquis : ne pas écraser avec `position:relative` le style de `.w2ui-panel-content` utilisé par W2UI pour dimensionner le contenu du panneau.

Le passage automatique vers l'état `ACTIVE_MODEL` après chargement d'un modèle reste un sujet UI distinct. Il ne constitue plus le point de reprise immédiat du chantier de projection.

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

L'arbre BPMNSM ne représente pas directement la structure ontologique du référentiel.

La position d'un objet BPMN dans l'arbre est le résultat d'une projection construite à partir :

- des objets BPMN ;
- de leurs classifications ;
- de leurs relations sémantiques ;
- du profil de vue actif.

Invariant :

> **La position d'un processus dans l'arbre n'est pas une propriété intrinsèque du processus. Elle est le résultat d'une projection construite à partir de ses classifications, de ses relations et du profil de vue actif.**

Architecture désormais matérialisée :

``` text
RepositoryModel
      │
      │ données + relations
      ▼
ProjectionProfile
      │
      │ politique de vue
      ▼
createEnvironmentProjection()
      │
      │ mécanisme de projection
      ▼
Environment Projection
      │
      ▼
Repository Browser
```

L'Environment Browser est donc une vue du graphe BPMNSM, et non le graphe lui-même.

La séparation recherchée est maintenant partiellement effective :

``` text
environment-projection.js
    → mécanisme de construction de la projection

projection-profiles/coc-projection-profile.js
    → politique de la vue CoC
```

Le but n'est pas de déplacer mécaniquement chaque `if` du moteur vers un fichier de configuration. Le profil doit exprimer des décisions de projection utiles ; le moteur doit conserver les mécanismes génériques nécessaires à leur exécution.

### 16.2 Premier profil de projection : CoC-centric

Le besoin industriel actuellement prioritaire concerne des Centres de Compétence du domaine spatial qui souhaitent rationaliser leurs référentiels de processus.

Le premier profil de vue BPMNSM est donc volontairement orienté CoC.

La grammaire visible du Repository Browser reste :

``` text
Environment
├── Repositories
├── CoCs
├── Collaborations
└── Processes
```

À l'intérieur d'un contexte CoC, Collaborations et Processes peuvent être projetés selon les relations disponibles et les politiques du profil.

Le profil actuel est :

``` js
cocProjectionProfile
```

avec les décisions démontrées suivantes :

``` text
rootComponentTypes
    collaboration
    process

contextualizeProcessesUnderCollaborations
    true

collaborationProcessContext
    participantReferenceType = participant
    processReferenceType     = processRef

preferCollaborationContextOverDirectCocMembership
    true
```

Le chemin de contextualisation BPMN correspondant est :

``` text
Collaboration
    -- participant -->
Participant
    -- processRef -->
Process
```

Un CoC peut être structurant dans cette vue sans être le parent ontologique universel d'un Process.

Conceptuellement :

``` text
CoC
 ─ governs →
 ─ maintains →
 ─ contributesTo →
 Process / Collaboration
```

La vue CoC-centric peut transformer certaines relations en parenté visuelle.

### 16.3 Incréments `ProjectionProfile` démontrés

Quatre incréments atomiques ont été réalisés et démontrés.

#### Incrément 1 --- types de composants racine

Le profil déclare :

``` text
rootComponentTypes
```

Le moteur consomme cette politique pour déterminer quels types peuvent apparaître dans les catégories racines.

Une variante `process-only` démontre qu'une Collaboration peut être supprimée de la racine sans modifier `RepositoryModel`.

#### Incrément 2 --- contextualisation Process sous Collaboration

Le profil déclare :

``` text
contextualizeProcessesUnderCollaborations = true
```

Lorsque cette politique vaut `false`, une Collaboration reste visible mais ne porte plus d'occurrence Process ; le Process peut alors retomber dans un contexte moins spécifique.

#### Incrément 3 --- priorité du contexte Collaboration sur l'appartenance directe au CoC

Le profil déclare :

``` text
preferCollaborationContextOverDirectCocMembership = true
```

Lorsque cette politique vaut `true`, un Process directement rattaché au CoC et également contextualisé par une Collaboration du même CoC n'est affiché directement sous le CoC qu'en l'absence de contexte Collaboration prioritaire.

Lorsque cette politique vaut `false`, les deux occurrences peuvent coexister.

#### Incrément 4 --- chemin de références Collaboration vers Process

Le profil déclare :

``` text
collaborationProcessContext
    participantReferenceType = participant
    processReferenceType     = processRef
```

Le moteur ne décide plus en dur que ce parcours doit filtrer les types de référence `participant` puis `processRef`.

Un profil dérivé utilisant un autre `participantReferenceType` démontre que le moteur consomme effectivement cette politique.

Ce contrat reste volontairement étroit. Il ne constitue pas un DSL générique de parcours de graphe.

### 16.4 Preuve actuelle

Les tests ciblés démontrés sont :

``` text
environment-projection.test.js
    6 / 6

environment-projection-profile.test.js
    10 / 10

TOTAL PROJECTION
    16 / 16
```

La régression globale démontrée après ces incréments est :

``` text
Test Files  25 passed (25)
Tests       105 passed (105)
```

Ainsi :

``` text
[DÉCIDÉ]
ProjectionProfile sépare politique de vue et mécanisme de projection.

[IMPLÉMENTÉ]
cocProjectionProfile
createEnvironmentProjection(... projectionProfile)

[DÉMONTRÉ]
profil CoC par défaut
profil CoC explicite = comportement historique
consommation réelle des quatre politiques
profil non supporté rejeté
aucune régression globale sur 25 fichiers / 105 tests
```

### 16.5 Catégorisations croisées

Un même processus peut être catégorisé simultanément selon plusieurs axes, notamment :

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

Ces dimensions ne doivent pas être fusionnées dans une hiérarchie unique.

À terme, un profil de projection pourra choisir et croiser plusieurs axes, par exemple :

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

Le même modèle sémantique pourra ainsi produire plusieurs arbres sans modifier les objets BPMN.

Aucun de ces profils futurs n'est encore implémenté.

### 16.6 Concepts à prévoir, sans généralisation prématurée

La généralisation future pourra s'appuyer sur des concepts du type :

``` text
ClassificationScheme
Category
ClassificationAssignment
ProjectionProfile
```

`ProjectionProfile` existe désormais comme frontière architecturale concrète pour la projection Environment.

En revanche, `ClassificationScheme`, `Category` et `ClassificationAssignment` restent des concepts de trajectoire et ne sont pas implémentés comme méta-modèle générique.

Exemple conceptuel futur :

``` text
ClassificationScheme = CoC
Category             = Systems Engineering
ClassificationAssignment
    elementRef       = Process_X
    categoryRef      = Systems Engineering
```

Le modèle mental cible reste :

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

La prochaine preuve ne doit pas consister à introduire immédiatement ces abstractions. Elle doit d'abord vérifier qu'un **second profil minimal** peut produire une projection différente du même `RepositoryModel`.

### 16.7 Membership

Le `semarch:Membership` actuel reste utile pour le démonstrateur et la projection CoC courante.

Cependant il ne doit pas être considéré comme le modèle sémantique définitif de toutes les relations entre CoC et objets BPMN.

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

Aucune migration de `Membership` n'est décidée ou implémentée à ce stade.

### 16.8 Articulation avec ArchiMate / ArchiCG

Le graphe sémantique porté par les extensions et schémas BPMNSM devra permettre un alignement avec ArchiMate.

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

Cela permettra notamment des vues capability-centric, organization-centric, programme-centric, governance-centric et roadmap/transformation. Ces vues ne sont pas à implémenter maintenant.

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

### 16.9 Import / Export / Transposition

Les mécanismes d'import, export et transposition seront les moyens de passer d'une représentation ou d'un point de vue à un autre.

Invariant :

> **Importer, exporter et transposer ne sont pas des opérations de navigation. Ce sont des mécanismes de transformation entre représentations qui doivent préserver autant que possible identité, provenance, relations et traçabilité.**

Les représentations restent ancrées dans leurs formalismes naturels. Une transposition ne doit pas supprimer silencieusement la représentation source.

### 16.10 Standards, BMS et traçabilité

Les référentiels d'entreprise et standards externes peuvent participer à plusieurs classifications et relations : BMS, ECSS, NASA, ESA, DoD, MoD, cadres réglementaires, etc.

Un processus peut être lié à ces sources sans que celles-ci deviennent nécessairement ses parents dans l'arbre BPMN.

Une cible importante de BPMNSM est de préserver la chaîne de traçabilité entre :

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

Lorsque la norme source fournit déjà une représentation structurée ou formelle, BPMNSM doit chercher à préserver cette représentation et ses relations plutôt qu'à la réduire définitivement à du texte ou à des exigences dérivées.

Principe :

> **Conserver les représentations dans leur formalisme naturel et formaliser les transpositions entre elles.**

Cela rejoint la logique d'hypermodèle utilisée comme fondement conceptuel du projet.

### 16.11 Statut consolidé

``` text
[DÉCIDÉ]

- Environment Browser = projection, pas graphe BPMNSM.
- La position d'un Process est un résultat de projection.
- Premier profil de projection = CoC-centric.
- Politique de projection et mécanisme de projection doivent être séparés.
- Les catégorisations sont potentiellement multiples et croisées.
- CoC peut structurer la vue sans être le parent ontologique du Process.
- Des projections ArchiMate / ArchiCG sont prévues ultérieurement.
- Import / Export / Transposition constitueront les mécanismes de
  passage entre représentations.
- Standards et BMS doivent conserver provenance et traçabilité
  vers les pratiques et processus dérivés.

[IMPLÉMENTÉ]

- ProjectionProfile comme paramètre explicite de createEnvironmentProjection().
- cocProjectionProfile.
- rootComponentTypes.
- contextualizeProcessesUnderCollaborations.
- collaborationProcessContext.
- preferCollaborationContextOverDirectCocMembership.

[DÉMONTRÉ]

- 10 tests dédiés ProjectionProfile.
- 6 tests historiques Environment.
- 16 / 16 tests de projection ciblés.
- 25 fichiers / 105 tests sur la régression globale.
- Le profil CoC explicite reproduit la projection CoC par défaut.
- Les politiques du profil sont effectivement consommées par le moteur.
- Un profil non supporté est rejeté explicitement.

[NON IMPLÉMENTÉ / TRAJECTOIRE]

- second profil réel de projection ;
- capability-centric ;
- organization-centric ;
- programme-centric ;
- ClassificationScheme générique ;
- Category générique ;
- ClassificationAssignment générique ;
- DSL générique de projection.
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

Le chantier datatype / widget / persistance est terminé.

Le chantier `ProjectionProfile` CoC a maintenant franchi un point de stabilisation démontré.

Baseline complet explicitement confirmé :

``` text
25 fichiers de test
105 tests
105 passent
0 échec
```

État démontré :

``` text
RepositoryContext / CoC / Membership sérialisables par moddle
projection Repository metadata → RepositoryModel
UNRESOLVED → RESOLVED
projection Repository idempotente

environment-projection.test.js
    6 / 6

environment-projection-profile.test.js
    10 / 10

Repository Browser
    Environment / Repositories / CoCs / Collaborations / Processes

cold start neutre
    aucun CoC métier implicite
    aucun diagramme métier implicite

toolbar NO MODEL
WelcomeView visible
Properties caché sans modèle
palette cachée sans modèle
Lint visible
```

Architecture courante du chantier Environment :

``` text
RepositoryModel
      │
      │ données + relations
      ▼
ProjectionProfile
      │
      │ politique de vue
      ▼
createEnvironmentProjection()
      │
      │ mécanisme de projection
      ▼
Environment Projection
      │
      ▼
Repository Browser
```

Le premier profil concret est **CoC-centric** et porte actuellement :

``` text
rootComponentTypes
contextualizeProcessesUnderCollaborations
collaborationProcessContext
    participantReferenceType
    processReferenceType
preferCollaborationContextOverDirectCocMembership
```

Invariant acquis :

> **La position d'un processus dans l'arbre n'est pas une propriété intrinsèque du processus. Elle est le résultat d'une projection construite à partir de ses classifications, de ses relations et du profil de vue actif.**

Le prochain jalon architectural proposé est désormais :

> **Démontrer qu'un second `ProjectionProfile` minimal peut produire une projection différente du même `RepositoryModel`, sans modifier les données et sans introduire prématurément un méta-modèle générique de classifications.**

Cette expérience doit rester minimale.

Elle ne doit pas encore implémenter :

``` text
Capability
Organization
Business Unit
Programme
ClassificationScheme générique
Category générique
ClassificationAssignment générique
DSL générique de projection
```

Le but de la prochaine expérience est uniquement de répondre à la question :

``` text
ProjectionProfile
    =
simple objet de configuration du seul profil CoC ?

ou

véritable frontière architecturale permettant plusieurs projections ?
```

Avant de coder cette expérience :

1. formuler l'hypothèse ;
2. définir la différence minimale observable entre deux profils ;
3. écrire le test RED ;
4. ne modifier que les fichiers nécessaires ;
5. démontrer le GREEN ciblé ;
6. relancer `npm test`.

Le sujet UI `NO_ACTIVE_MODEL → ACTIVE_MODEL` reste ouvert mais distinct. Il pourra être repris ultérieurement à partir des fichiers sources exacts de `create-app.js` et `layout.js`; il ne constitue plus le point de reprise immédiat.

Avant toute nouvelle modification :

``` bash
npm test
```

Puis prendre le dépôt réel comme autorité.

------------------------------------------------------------------------

# Résumé en une phrase

**BPMNSM est un atelier/runtime JavaScript/Vite basé sur bpmn.io qui utilise BPMN 2.0 XML comme langage pivot, enrichit les modèles par profils, schémas et relations sémantiques, projette le référentiel selon des points de vue configurables — d'abord CoC-centric — et doit préserver identité, provenance, traçabilité et informations inconnues lors des imports, exports, assemblages et futures transpositions.**
