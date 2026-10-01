# BPMNSM / Semantic Process Mediator --- Document de continuité du projet

**Version de continuité :** 2026-09-11\
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

## 4. Référentiel et sérialisation

### 4.1 Format canonique

> **Le format canonique d'un composant est un BPMN 2.0 XML autonome,
> comportant éventuellement des extensions CoC.**

Le référentiel est un ensemble de fichiers BPMN autonomes et
versionnables, et non un gros document propriétaire.

Exemples de composants :

``` text
CoC A
  process-a.bpmn
  process-b.bpmn
  collaboration-a.bpmn

CoC B
  process-c.bpmn

Integration
  collaboration-a-b.bpmn
```

Un BPMN global peut être **assemblé à la demande** pour échange avec un
outil tiers.

Le monolithe global est un artefact d'échange/publication, pas la source
de vérité Git.

### 4.2 Modèle vs diagramme

Les fonctions repository et multi-CoC doivent travailler sur les **BPMN
models / moddle elements et leurs références**, et non sur les seules
shapes du canvas.

Un processus peut être référencé dans plusieurs contextes/diagrammes
sans être dupliqué sémantiquement.

### 4.3 Identité

Les IDs BPMN doivent être préservés autant que possible lors des
imports/exports.

La stratégie définitive d'identité externe (`BPMN id`, éventuel
`platformRef`, éventuel `semarchId`) doit rester guidée par les tests
réels EA/ARIS. Ne pas transformer prématurément `semarch/stable-id` en
vérité architecturale absolue.

Les références sémantiques entre composants ne doivent pas dépendre
uniquement d'un chemin Git physique.

### 4.4 Assemble / split

Architecture visée :

``` text
fichiers BPMN composants
        ↓
repository / resolver
        ↓
modèle sémantique
     ↙       ↘
 editor    assembler
             ↓
         global.bpmn
```

L'assemblage doit résoudre les références inter-composants et produire
du BPMN standard chaque fois que la relation peut être exprimée
nativement dans un document global.

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

État explicitement confirmé après le chantier datatype / Properties
Panel :

``` text
24 fichiers de test
96 tests
96 passent
0 échec
```

Les tests ajoutés ou renforcés couvrent désormais plusieurs niveaux
complémentaires :

``` text
src/model/datatype-ref.test.js
    identité canonique { namespaceUri, localName }

src/model/datatype-runtime.test.js
    DataTypeRef → RuntimeDatatype

src/schemas/schema-datatype.test.js
    compatibilité de la façade de normalisation XSD

src/schemas/xsd-schema-adapter.test.js
    QName XSD réel → DataTypeRef + datatype runtime

src/bpmn/item-definition-structure-ref.test.js
    ItemDefinition.structureRef QName → DataTypeRef
    + préservation round-trip bpmn-moddle

src/bpmn/item-definition-runtime.test.js
    ItemDefinition.structureRef → DataTypeRef → RuntimeDatatype

src/properties/semarch-property-descriptors.test.js
    préservation du même objet propriété normalisé jusqu'au descriptor

src/properties/semarch-property-widget.test.js
    RuntimeDatatype → PropertyWidget

src/properties/semarch-property-widget-integration.test.js
    vraie propriété XSD string → descriptor → PropertyWidget.TEXT

src/properties/semarch-property-boolean-widget-integration.test.js
    xs:boolean → descriptor → PropertyWidget.BOOLEAN

src/properties/semarch-properties-provider.test.js
    PropertyWidget.BOOLEAN → CheckboxEntry
    lecture XML "true" → booléen true
    édition false → valeur XML "false"
    création d'une semarch:DataProperty absente
    création de bpmn:ExtensionElements si nécessaire
    persistance via modeling.updateModdleProperties()
```

Invariants désormais testés :

``` text
unsupported != invalid

DataTypeRef = identité sémantique canonique
RuntimeDatatype = capacité dérivée

un QName valide inconnu doit être préservé
un préfixe QName réellement non résolu est une erreur

les widgets dépendent du RuntimeDatatype,
pas du type métier ni de la technologie source

les modifications du modèle passent par le command stack bpmn-js
```

Avant toute nouvelle modification, `npm test` reste le moyen de prendre
l'état réel du dépôt comme référence.

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

## 12. Navigation / Repository Browser

Le projet a évolué vers une distinction entre navigation repository et
navigation des vues/diagrammes.

Des composants cités incluent :

``` text
Repository Browser
BPMN View Index
resolve-repository-view
register-bpmn-document
read-only-properties-panel
diagram-properties-panel
```

Un principe important acquis :

> le panneau de propriétés doit pouvoir afficher un **businessObject
> BPMN directement**, sans fabriquer un faux élément graphique.

API conceptuelle introduite :

``` js
readOnlyPropertiesPanel.showBusinessObject(
  businessObject
)
```

Cela permet par exemple :

``` text
clic Repository sur Process_A
        ↓
canvas     → contexte graphique approprié
Properties → vrai bpmn:Process Process_A
```

sans confondre `Participant` graphique et `Process` sémantique.

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

## 16. Méthode de développement assisté par IA

L'objectif n'est pas de déléguer la maîtrise de BPMNSM à une IA, mais
d'utiliser l'IA pour accélérer l'exploration, la formalisation,
l'implémentation et la critique tout en conservant humainement la
maîtrise de l'architecture fonctionnelle et du code.

Principe directeur :

> **BPMNSM doit rester maintenable par un développeur compétent disposant
> du code, des tests et de la documentation, sans dépendre d'un historique
> de conversations IA.**

Une connaissance nécessaire à la maintenance de BPMNSM ne doit donc
jamais exister uniquement dans une conversation avec une IA.

### 16.1 Répartition des responsabilités

La collaboration est volontairement asymétrique.

``` text
Humain
  → définit le sens métier et fonctionnel
  → arbitre les invariants et frontières
  → accepte ou rejette les décisions
  → exécute et observe dans l'environnement réel
  → reste responsable de la validation et de la maîtrise

IA
  → explore des solutions
  → explicite les hypothèses
  → critique le raisonnement
  → aide à produire le code et les tests
  → analyse les écarts
  → aide à documenter les décisions
```

L'IA peut proposer une architecture ; elle ne lui confère pas le statut
de vérité.

### 16.2 Distinguer décidé, implémenté et démontré

Toute évolution structurante peut avoir trois statuts distincts :

``` text
DÉCIDÉ
  une option architecturale a été retenue

IMPLÉMENTÉ
  le code correspondant existe

DÉMONTRÉ
  une expérience réelle ou un test pertinent confirme
  le comportement attendu
```

Ne jamais confondre une décision répétée dans une conversation avec une
preuve.

Un test vert prouve uniquement ce que son scénario vérifie réellement.

### 16.3 Boucle d'architecture expérimentale

Pour un changement significatif, utiliser si nécessaire la boucle :

``` text
BESOIN
  ↓
QUESTION
  ↓
HYPOTHÈSE
  ↓
INVARIANTS CONCERNÉS
  ↓
EXPÉRIENCE MINIMALE
  ↓
DÉCISION                         [DÉCIDÉ]
  ↓
IMPLÉMENTATION ATOMIQUE          [IMPLÉMENTÉ]
  ↓
TEST / EXÉCUTION RÉELLE
  ↓
OBSERVATION
  ↓
RÉVISION éventuelle
  ↓
PREUVE                           [DÉMONTRÉ]
  ↓
RÉGRESSION COMPLÈTE
  ↓
REVUE DE MAÎTRISE
  ↓
DOCUMENTATION / STABILISATION
```

Toutes les petites modifications ne nécessitent pas de formaliser
l'ensemble de la boucle. Elle devient importante lorsqu'une hypothèse
sur BPMN, bpmn.io, le repository, un format externe ou une frontière
architecturale doit être établie.

### 16.4 Format standard d'une étape

Format préféré pour une évolution significative :

``` text
OBJECTIF

QUESTION / HYPOTHÈSE
(si le comportement n'est pas déjà démontré)

INVARIANT(S)

ÉTAT ACTUEL
(code exact et comportement observé)

DÉCISION
(et alternatives importantes si elles existent)

STATUT
DÉCIDÉ / IMPLÉMENTÉ / DÉMONTRÉ

FICHIERS À CRÉER

FICHIERS À MODIFIER

FICHIERS À NE PAS TOUCHER

CODE COMPLET

EXPÉRIENCE / TEST CIBLÉ

RÉSULTAT ATTENDU

RÉGRESSION
npm test

INVARIANT ACQUIS

PREUVE DISPONIBLE

POINT DE MAÎTRISE
(ce qu'il faut être capable d'expliquer)

SUITE
```

### 16.5 Ne pas deviner l'état des fichiers

Avant de modifier une chaîne fonctionnelle existante, lire les
**versions actuelles exactes** des fichiers concernés.

Ne jamais reconstruire un gros fichier de mémoire si son contenu courant
n'est pas disponible.

Le dépôt réel prime toujours sur ce document de continuité et sur
l'historique des conversations.

### 16.6 Fournir les fichiers complets

Pour les fichiers à remplacer, préférer le **contenu complet du fichier**
aux patches partiels afin de réduire les erreurs de fusion manuelle.

Les modifications doivent rester limitées aux fichiers nécessaires.

### 16.7 Étapes atomiques et réversibles

Chaque étape doit autant que possible :

``` text
porter une seule décision
+
être testable isolément
+
préserver les invariants précédents
+
laisser l'application dans un état utilisable
+
être facile à relire et à révoquer
```

Ne pas profiter d'une évolution fonctionnelle pour effectuer des
nettoyages sans rapport.

### 16.8 Test comme preuve d'invariant

Un test ne doit pas être ajouté seulement pour augmenter la couverture.

Question à poser :

> **Quel comportement important ne doit plus pouvoir être cassé sans que
> nous le sachions ?**

Après le test ciblé, exécuter la régression complète lorsque l'étape
modifie le code :

``` bash
npm test
```

Le compteur de tests constitue un checkpoint, mais ne remplace pas
l'analyse de ce que les tests démontrent effectivement.

### 16.9 Revue de maîtrise

À la clôture d'un chantier architectural important, vérifier que le
mainteneur peut reconstruire le raisonnement sans dépendre de l'IA.

Questions utiles :

``` text
Pourquoi cette abstraction existe-t-elle ?
Quelle responsabilité porte-t-elle ?
Pourquoi cette responsabilité est-elle dans cette couche ?
Quelle information est normative ?
Quelle information est dérivée ?
Quels invariants seraient cassés par une autre solution ?
Quels tests ou expériences démontrent ces invariants ?
Quels fichiers seraient probablement concernés par une évolution proche ?
```

Il n'est pas nécessaire de transformer chaque petite modification en
examen. Cette revue sert surtout à empêcher que la vitesse de production
du code dépasse durablement la compréhension du système.

### 16.10 Utiliser l'IA comme contradicteur

Lorsque l'utilisateur propose lui-même une architecture ou une
modification, l'IA doit d'abord chercher :

``` text
hypothèses cachées
violations d'invariants
confusion entre couches
comportements supposés mais non démontrés
abstraction prématurée
risque de perte d'information ou d'interopérabilité
```

avant de pousser automatiquement vers l'implémentation.

Prompt utile :

> Voici mon interprétation de l'architecture et ma proposition.
> Identifie d'abord mes hypothèses cachées, les violations possibles
> d'invariants et ce qui n'est pas démontré. Ne propose ensuite que le
> changement minimal nécessaire.

### 16.11 Dettes à surveiller

Trois formes de dette sont explicitement surveillées :

``` text
DETTE TECHNIQUE
le code ou l'architecture comporte un compromis à corriger

DETTE D'INTENTION
la raison d'une décision n'est plus retrouvable

DETTE COGNITIVE
le code fonctionne mais sa logique n'est plus suffisamment
maîtrisée par son mainteneur
```

Une violation intentionnelle d'un invariant doit être documentée avec sa
raison et, si possible, sa condition de suppression.

### 16.12 Qualités non fonctionnelles humaines

En plus des qualités logicielles classiques, BPMNSM recherche :

``` text
INTELLIGIBILITÉ
l'architecture peut être expliquée et reconstruite

CONTESTABILITÉ
une décision peut être remise en question à partir
de ses hypothèses et de ses preuves

RÉVERSIBILITÉ
une décision ou un outil peut être remplacé sans dépendre
d'informations détenues uniquement par une IA

AUTONOMIE
le développement, le diagnostic et la maintenance restent
possibles sans l'IA ayant participé au projet
```

Ces qualités complètent notamment maintenabilité, lisibilité,
testabilité et interopérabilité.

### 16.13 Documentation progressive, sans bureaucratie prématurée

Pour l'instant, `PROJECT_CONTEXT_BPMNSM.md` reste le document principal
de continuité et peut contenir :

``` text
architecture actuelle
invariants
décisions importantes
expériences / preuves
méthode de développement
état des tests
points ouverts
```

Ne créer `architecture.md`, `decisions.md`, `experiments.md` ou
`ai-development-method.md` séparément que lorsque le volume ou le besoin
de traçabilité le justifie réellement.

La documentation doit conserver le **pourquoi** et les preuves, pas
seulement inventorier les fichiers.

### 16.14 Toujours distinguer les couches

``` text
modèle BPMN
projection UI
repository
schéma externe
profil/méthode
runtime BPMNSM
gateway
```

Éviter les raccourcis qui fusionnent ces responsabilités.

### 16.15 Code lisible plutôt qu'abstraction prématurée

Préférer les abstractions naturelles des bibliothèques bpmn.io et de
petits modules lisibles à un framework générique lourd.

La vitesse de développement ne se mesure pas au nombre de lignes
générées par itération, mais au nombre d'invariants compris,
implémentés et démontrés sans régression.

------------------------------------------------------------------------

## 17. Invariants à ne pas casser

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
17. **Aucune connaissance nécessaire à la maintenance de BPMNSM ne doit
    exister uniquement dans une conversation avec une IA.**
18. **Une décision architecturale, son implémentation et sa démonstration
    sont trois statuts distincts.**
19. **La production de code assistée par IA ne doit pas progresser
    durablement plus vite que la compréhension du mainteneur.**
20. **Les décisions structurantes doivent rester intelligibles,
    contestables et réversibles.**
21. **BPMNSM doit pouvoir être développé et maintenu sans dépendre de
    l'IA ayant participé à sa construction.**

------------------------------------------------------------------------

## 18. Prompt de reprise conseillé

Dans une nouvelle conversation, joindre ce document et écrire :

> Nous continuons le développement de BPMNSM. Utilise
> `PROJECT_CONTEXT_BPMNSM.md` comme contexte de continuité, mais considère
> le dépôt réel comme source de vérité pour l'état du code.
>
> Notre objectif est de conserver humainement la maîtrise de
> l'architecture fonctionnelle et du code afin que BPMNSM reste
> maintenable sans dépendre de l'IA.
>
> Avant une modification structurante :
> 1. distingue ce qui est décidé, implémenté et démontré ;
> 2. explicite les hypothèses non encore vérifiées ;
> 3. cherche les violations possibles des invariants et les confusions
>    entre couches ;
> 4. privilégie une expérience minimale avant une abstraction importante ;
> 5. propose le changement atomique le plus petit ;
> 6. donne les fichiers complets à remplacer ;
> 7. associe le changement à un test ou une observation réelle ;
> 8. termine par l'invariant acquis et ce que je dois être capable
>    d'expliquer pour en garder la maîtrise.
>
> Ne suppose pas que les fichiers du dépôt sont identiques à ceux décrits
> dans le document : lis/demande les fichiers actuels nécessaires avant
> de produire du code. Nous travaillons en JavaScript avec Vite et les
> bibliothèques bpmn.io. Respecte les invariants d'interopérabilité,
> notamment la préservation non destructive des informations BPMN et des
> QNames/datatype refs inconnus valides.
>
> Si je propose moi-même une solution, commence par critiquer mon
> raisonnement : hypothèses cachées, invariants menacés, comportement non
> démontré et alternative plus simple éventuelle. Ne remplace pas ma
> décision architecturale par une décision implicite de l'IA.

Puis fournir idéalement :

``` text
npm test
git status --short
tree src -L 3
```

ou leur équivalent, ainsi que les fichiers exacts concernés par la
prochaine étape.

Pour une simple correction locale dont l'architecture est déjà
démontrée, alléger cette procédure afin de ne pas créer de bureaucratie
inutile.

------------------------------------------------------------------------

## 19. Point de reprise immédiat

Le chantier **datatype interoperability → widget → persistance** est
terminé et validé à :

``` text
24 fichiers de test
96 tests
96 passent
```

Il n'est pas recommandé d'ajouter immédiatement des tests répétitifs
pour chaque datatype (`integer`, `decimal`, etc.) : les responsabilités
et les raccordements essentiels sont déjà couverts.

La prochaine reprise doit partir d'un **nouveau besoin fonctionnel** ou
d'une évolution clairement identifiée, en conservant les invariants
acquis :

``` text
DataTypeRef ouvert et non destructif
RuntimeDatatype dérivé
QName inconnu valide préservé
BPMN XML comme pivot
widgets indépendants des types métier
modifications via bpmn-js modeling / command stack
```

Avant toute modification d'une chaîne existante :

``` bash
npm test
```

Puis demander/lire la version exacte des fichiers concernés avant de
produire du code.

------------------------------------------------------------------------

# Résumé en une phrase

**BPMNSM est un runtime JavaScript/Vite basé sur bpmn.io qui utilise
BPMN 2.0 XML comme modèle pivot, ajoute une méthode CoC par
extensions/règles/modules lisibles, conserve le repository sous Git,
privilégie le round-trip et la préservation non destructive, et est
développé selon une architecture expérimentale assistée par IA dont les
décisions, preuves et connaissances doivent rester maîtrisables sans
dépendre de l'IA.**
