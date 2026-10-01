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

Dernier état explicitement enregistré dans l'historique :

``` text
16 fichiers de test
63 tests
58 passent
5 échouent
```

Le test suivant était validé :

``` text
src/properties/semarch-property-widget.test.js
8 tests passants
```

Les cinq échecs restants étaient attribués à d'anciennes assertions
attendant encore :

``` text
xs:string
```

alors que le contrat normalisé retournait :

``` text
string
```

Fichiers concernés :

``` text
src/profiles/profile-runtime.test.js
src/schemas/bpmn-schema-binding.test.js
src/schemas/profile-schema-loader.test.js
src/schemas/schema-property-resolver.test.js
```

**Important :** cet état est historique. Avant toute nouvelle
modification, exécuter `npm test` et prendre le résultat réel du dépôt
comme nouvel état de référence.

------------------------------------------------------------------------

## 11. Prochaine étape recommandée après reprise

Ne pas continuer immédiatement à ajouter des widgets.

La priorité est de **réconcilier le code datatype déjà commencé avec le
contrat d'interopérabilité BPMN**.

Ordre recommandé :

``` text
1. Revalider npm test
2. Relire les fichiers datatype/schéma actuels
3. Introduire/identifier une représentation ouverte DataTypeRef/QName
4. S'assurer que la normalisation runtime ne détruit jamais la référence native
5. Adapter ItemDefinition / structureRef import-export
6. Ajouter les tests de round-trip des datatypes inconnus
7. Reprendre ensuite boolean/integer/decimal/date/... → widgets
```

Cas de tests minimaux :

``` text
xsd:string
xsd:dateTime
xsd:duration
xsd:positiveInteger
custom:Customer
custom:PurchaseOrder
```

Pour chacun :

``` text
import
  → modèle BPMNSM
  → export
  → réimport
```

et vérifier :

``` text
expandedQName(original) == expandedQName(roundTrip)
```

Même lorsque le runtime ne sait pas interpréter le type.

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

## 16. Convention de travail avec ChatGPT

Cette convention est importante pour poursuivre le développement
efficacement.

### 16.1 Ne pas deviner l'état des fichiers

Avant de modifier une chaîne fonctionnelle existante, demander/lire les
**versions actuelles exactes** des fichiers concernés.

Ne jamais reconstruire un gros fichier de mémoire si son contenu courant
n'est pas disponible.

### 16.2 Fournir les fichiers complets

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

### 16.3 Étapes atomiques

Chaque étape doit être petite, testable et réversible.

Ne pas modifier des fichiers non nécessaires « pour nettoyer ».

### 16.4 Toujours distinguer

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

### 16.5 Code lisible plutôt qu'abstraction prématurée

L'objectif est un développement rapide et itératif.

Préférer les abstractions naturelles des bibliothèques bpmn.io et de
petits modules lisibles à un framework générique lourd.

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

------------------------------------------------------------------------

## 18. Prompt de reprise conseillé

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

## 19. Point de reprise immédiat

La reprise technique recommandée est :

> **Datatype interoperability --- séparer définitivement la référence
> BPMN ouverte (`DataTypeRef` / QName) de la catégorie normalisée
> utilisée par le runtime et le Properties Panel.**

Avant toute modification :

``` bash
npm test
```

Puis relire au minimum :

``` text
src/schemas/schema-datatype.js
src/schemas/xsd-schema-adapter.js
src/schemas/schema-adapter.js
src/schemas/schema-property-resolver.js
src/profiles/profile-runtime.js
src/properties/semarch-property-widget.js
src/properties/semarch-properties-provider.js
```

et les fichiers qui gèrent actuellement `bpmn:ItemDefinition` /
`structureRef`, s'ils existent déjà.

La question à poser au code est :

``` text
Où la référence native de datatype est-elle conservée aujourd'hui ?
```

Si la seule information restante après adaptation est :

``` text
string | boolean | integer | decimal | date | datetime | unknown
```

alors le contrat d'interopérabilité n'est pas encore satisfait et cette
couche doit être corrigée **avant** de poursuivre l'enrichissement des
widgets.

------------------------------------------------------------------------

# Résumé en une phrase

**BPMNSM est un runtime JavaScript/Vite basé sur bpmn.io qui utilise
BPMN 2.0 XML comme modèle pivot, ajoute une méthode CoC par
extensions/règles/modules lisibles, conserve le repository sous Git, et
doit toujours privilégier le round-trip et la préservation de ce qu'il
ne comprend pas plutôt qu'une normalisation destructive.**
