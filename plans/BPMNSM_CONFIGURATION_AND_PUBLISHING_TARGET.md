# BPMNSM --- Configuration, Publishing & Repository Target

**Statut : CIBLE DE RÉFÉRENCE FIGÉE --- mise à jour de continuité
2026-09-17**

> Ce document fixe la cible fonctionnelle et architecturale de référence
> avant la reprise d'A10. La cible est stable ; les mécanismes
> techniques proposés pour l'atteindre restent expérimentaux,
> falsifiables et soumis aux statuts `[HYPOTHÈSE]`, `[DÉCIDÉ]`,
> `[IMPLÉMENTÉ]`, `[DÉMONTRÉ]` et `[RÉFUTÉ]`.

------------------------------------------------------------------------

## 1. Finalité prioritaire

BPMNSM doit fournir une chaîne configurable, versionnée, reproductible
et explicable permettant de produire, enrichir, assembler, valider et
publier des référentiels de processus.

La chaîne industrielle prioritaire est :

``` text
Sparx Enterprise Architect
        │
        │ Profile / pratiques CoC
        ▼
EA Repository
        │
        │ preprocessing
        ▼
BPMN standard
+ informations SemArch transportables
        │
        │ import / postprocessing
        ▼
BPMN étendu SemArch
        │
        ▼
BPMNSM Publisher
        │
        ├── Viewer générique
        ├── Viewer spécifique CoC
        ├── Tutorial
        ├── Demonstration
        └── autres publications configurées
```

> **\[CIBLE\] Le support de la chaîne Sparx EA → BPMN → BPMNSM
> Publisher/Viewer est la priorité produit.**

La persistance, Git, les profils CoC, les builds Vite, les règles, les
extensions, les restrictions, la méthode et les tutoriels sont
développés progressivement au service de cette chaîne.

------------------------------------------------------------------------

## 2. Trois trajectoires fonctionnelles

``` text
                    BPMNSM
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     PRODUCT       TRANSITION     RESEARCH
        │             │             │
 EA → Publisher    ArchiMate      semantic
 → CoC Viewer      legacy         cartography
                   support        demonstrator
```

### 2.1 PRODUCT --- priorité 1

``` text
EA
→ BPMN
→ SemArch
→ validation
→ configuration
→ Publisher
→ Viewer / Tutorial / Demonstration
```

### 2.2 TRANSITION --- priorité 2

ArchiMate permet de conserver des représentations legacy pendant une
transformation lorsque leur retranscription immédiate en BPMN n'est pas
réaliste.

> **ArchiMate est principalement une capacité de continuité de chantier
> de transformation, pas la cible finale prioritaire de modélisation des
> processus.**

A9 démontre déjà la coexistence documentaire nécessaire à ce rôle.

### 2.3 RESEARCH --- priorité 3

La coexistence BPMN/ArchiMate et, à terme, d'autres représentations peut
alimenter la cartographie sémantique, les hypermodèles et des
démonstrateurs de recherche BPMNSM.

Les trois trajectoires peuvent partager des mécanismes lorsque
l'expérience démontre un besoin commun ; leur convergence n'est jamais
imposée a priori.

------------------------------------------------------------------------

## 3. Invariant directeur

> **BPMNSM ne cherche pas à uniformiser les modèles, outils, contextes
> et pratiques de l'entreprise ; il cherche à rendre leurs
> configurations explicites, reproductibles, navigables, échangeables et
> publiables, tout en préservant leurs sémantiques propres et en rendant
> leurs médiations traçables.**

Principe de développement associé :

> **La cible est globale ; sa démonstration est incrémentale. Chaque
> incrément doit livrer rapidement une capacité utilisable tout en
> produisant l'évidence permettant de décider le suivant.**

------------------------------------------------------------------------

## 4. Configuration et persistance

BPMNSM doit pouvoir gérer un état logique configurable composé de
modèles, contextes, profils, règles, vues, assemblages et artefacts
associés.

Deux formes de persistance sont visées :

``` text
                    Logical Project
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       DISTRIBUTED MODE          SNAPSHOT MODE
              │                       │
       files + metadata          global artifact
              │                       │
      incremental work          save / transport /
            + Git                  restore
```

Cible d'équivalence logique :

``` text
LOAD(snapshot(C))
        ≡
ASSEMBLE(LOAD(distributed(C)))
```

Cette équivalence concerne l'état logique pertinent de la configuration
`C`, pas l'égalité byte à byte.

**Statut : `[CIBLE]`, à démontrer.**

Le format physique n'est pas encore décidé.

------------------------------------------------------------------------

## 5. Git fait partie de l'architecture

``` text
Git commit
    =
état physique versionné des artefacts

BPMNSM Configuration
    =
sélection + usages + relations
+ assemblages + règles + contextes
```

> **Git commit ≠ BPMNSM configuration.**

Invariants cibles :

1.  Tout état nécessaire à la reproduction d'une configuration BPMNSM
    doit être matérialisable par des artefacts versionnables dans Git.
2.  Aucune connaissance indispensable à la reconstruction ne doit
    exister uniquement dans l'état interne de l'éditeur.
3.  Un changement métier local doit produire autant que possible un
    changement local et compréhensible des artefacts Git.
4.  Une sauvegarde sans changement sémantique ne doit pas produire de
    changement Git significatif.
5.  Les builds et publications doivent être reproductibles à partir des
    artefacts versionnés.

La sérialisation distribuée doit donc tendre vers un comportement stable
et déterministe.

------------------------------------------------------------------------

## 6. Identité, version, contexte et usage

La cible distingue conceptuellement :

``` text
Master identity
      │
      ▼
Version
      │
      ├── Contextual Usage A
      ├── Contextual Usage B
      └── Representations
```

Les patterns STEP/AP242 et OMG PDM Enablers constituent des sources
d'inspiration à analyser précisément.

**Statut : `[HYPOTHÈSE]`.**

BPMNSM ne crée pas encore un métamodèle `Master/Version/Usage`.

Invariant :

``` text
Business identity
    ≠
Representation identity
    ≠
BPMN element ID
    ≠
ArchiMate element ID
```

Une correspondance entre représentations doit être explicitée ou
démontrée, jamais déduite de la seule ressemblance des concepts.

------------------------------------------------------------------------

## 7. Plusieurs breakdowns et usages contextualisés

Une structure ne doit pas imposer un unique parent intrinsèque.

``` text
PRODUCTION BREAKDOWN             REPAIR BREAKDOWN

Assembly                         Repair Assembly
├── Production Part A            ├── Spare Part A
└── Production Part B            └── Repair Kit
```

Une structure hiérarchique peut donc être une configuration
d'usages/relations.

> **\[CIBLE\] Plusieurs breakdowns doivent pouvoir coexister sans
> dupliquer ou uniformiser artificiellement les objets.**

Des relations de type `AssemblyUsage` / `ContextualUsage` sont
candidates ; leur sémantique exacte reste à dériver des cas réels et de
l'analyse normative.

------------------------------------------------------------------------

## 8. Structure physique et structure sémantique

``` text
file hierarchy
    ≠
semantic containment
    ≠
assembly
    ≠
breakdown
    ≠
UI projection
```

La structure des fichiers doit rester logique et compréhensible pour
l'utilisateur et pour Git, mais ne doit pas devenir l'unique définition
de la structure sémantique.

------------------------------------------------------------------------

## 9. Core et contextualisation métier

``` text
Business Concept
       │
       ▼
Contextual Business Specialization
       │
       ├── context
       ├── properties
       ├── rules
       └── views
```

> **Seules les informations réellement communes doivent appartenir à un
> core partagé.**

Les CoCs peuvent disposer de propriétés, règles, restrictions et
spécialisations différentes autour de concepts partagés.

Les data properties peuvent être contextualisées ; leur uniformisation
globale n'est pas une cible.

------------------------------------------------------------------------

## 10. View, Viewpoint et Stakeholder

La cible s'inspire d'ISO/IEC/IEEE 42010 :

``` text
Person
   │
 plays
   ▼
Role
   │
 in
   ├── Organization
   └── Process
          │
          ▼
     Stakeholder
          │
     Concern / Purpose
          │
          ▼
       Viewpoint
          │
          ▼
         View
```

Une View répond à un Viewpoint orienté par des concerns/purposes.

Le `ProjectionProfile` actuel peut contribuer techniquement à cette
cible, mais :

> **ProjectionProfile ≠ Viewpoint tant que cette équivalence n'a pas été
> démontrée.**

------------------------------------------------------------------------

## 11. Représentations natives

``` text
Representation
     │
     ├── BPMN
     │     └── BPMN XML + SemArch extensions
     │
     └── ArchiMate
           └── native ArchiMate representation
```

Principes :

-   BPMN reste natif BPMN ;
-   ArchiMate reste natif ArchiMate ;
-   SemArch enrichit les langages et ne les remplace pas par un
    métamodèle propriétaire universel ;
-   unsupported ≠ invalid ≠ discarded ;
-   préserver les informations inconnues autant que les bibliothèques le
    permettent.

Pour ArchiMate, les mécanismes natifs de propriétés/extensions doivent
être utilisés avant une extension SemArch lorsque leur sémantique est
suffisante.

------------------------------------------------------------------------

## 12. Trois familles de configurations

``` text
REFERENCE / MODEL CONFIGURATION
              │
           alignment
              ▼
IMPLEMENTATION CONFIGURATION
              │
          supported by
              ▼
TOOL CONFIGURATION
```

À terme, cette séparation doit permettre la traçabilité entre changement
du référentiel, implémentations impactées, outils/configurations
nécessaires et publications affectées.

**Statut : `[CIBLE]`, sans modèle détaillé imposé à ce stade.**

------------------------------------------------------------------------

## 13. CoC comme axe de configuration

Un CoC peut nécessiter :

``` text
CoC
 │
 ├── semantic concepts
 ├── contextual specializations
 ├── properties
 ├── rules
 ├── restrictions
 ├── viewpoints / projections
 ├── modelling practices
 └── publication requirements
```

Une décomposition candidate est :

``` text
CoC
 ├── Semantic Profile
 ├── Validation Profile
 ├── View/Profile
 ├── Practice Profile
 └── Publication Profile
```

**Statut : `[HYPOTHÈSE]`.**

La bonne granularité doit être dérivée des expériences ; un unique objet
ou fichier CoC gouvernant tout n'est pas décidé.

------------------------------------------------------------------------

## 14. La configuration doit pouvoir générer le produit

Les configurations doivent progressivement contribuer aux builds Vite :

``` text
BPMNSM source
      +
Configuration
      │
      ▼
     Vite
      │
      ├── Editor
      ├── Generic Viewer
      ├── CoC Viewer A
      ├── CoC Viewer B
      ├── Tutorial
      └── Presentation
```

Un Viewer CoC doit pouvoir charger/exposer uniquement les capacités
nécessaires :

``` text
extensions
rules
restrictions
profiles
viewpoints
models
UI capabilities
tutorials
```

Invariant :

> **La sémantique d'un modèle ne doit jamais dépendre implicitement du
> Viewer particulier qui l'affiche.**

------------------------------------------------------------------------

## 15. Sparx Enterprise Architect est prioritaire

Le schéma d'extension BPMNSM doit pouvoir être projeté vers un Profile
EA :

``` text
SemArch extension schema
          ⇄
       EA Profile
```

Le schéma SemArch reste l'autorité sémantique ; le Profile EA est un
binding pour la modélisation dans Sparx EA.

Le mapping devra rendre explicites concepts, spécialisations
contextuelles, propriétés, datatypes, multiplicités, identités et
références.

------------------------------------------------------------------------

## 16. Préprocessing et transport BPMN

Lorsque l'export BPMN standard d'un outil ne préserve pas directement
les extensions SemArch, BPMNSM doit permettre un transport dégradé mais
réversible :

``` text
EA Model
   │
PRE-PROCESS
   │
   ▼
SemArch information
encoded into an exchangeable
text property
   │
   ▼
standard EA BPMN exporter
   │
   ▼
standard BPMN
+ semi-structured payload
   │
POST-PROCESS
   │
   ▼
BPMN + reconstructed
SemArch extensions
```

Invariant :

> **Le payload textuel de transport n'est jamais le modèle SemArch ; il
> est un codec de transit versionné permettant sa reconstruction.**

Le protocole exact reste à définir et à démontrer avec EA.

------------------------------------------------------------------------

## 17. Trois états BPMN

``` text
1. BPMN + native SemArch extensions
      persistance riche BPMNSM

2. BPMN standard + transport payload
      transit d’interopérabilité

3. pure standard BPMN
      réduction sémantique intentionnelle
```

Ces trois états ne doivent pas être confondus.

Le transit ne doit pas devenir une seconde sérialisation canonique
SemArch.

------------------------------------------------------------------------

## 18. ArchiMate et échange

Un mécanisme analogue pourra être étudié :

``` text
SemArch
   │
ArchiMate binding
   │
native properties / extensions
   │
Open Group exchange representation
```

L'analogie porte sur l'architecture de binding, pas sur l'identité des
encodages.

L'interopérabilité Open Group et l'enrichissement ArchiMate ne sont pas
prioritaires tant qu'un besoin opérationnel de transition ou un scénario
de recherche ne les réclame pas.

------------------------------------------------------------------------

## 19. Quatre couches à maintenir distinctes

``` text
1. SEMANTIC CONFIGURATION
   concepts / usages / contextes / vues / assemblages

2. NATIVE PERSISTENCE BINDING
   BPMN extensions / mécanismes ArchiMate

3. EXCHANGE BINDING
   EA BPMN standard / Open Group ArchiMate / autres

4. TOOL ADAPTER
   EA Profile + preprocessing / adapters / postprocessing
```

Principe :

> **semantic configuration ≠ native serialization ≠ exchange
> representation ≠ external-tool representation**

------------------------------------------------------------------------

## 20. Publisher comme consommateur majeur

``` text
Model Configuration
        +
CoC Configuration
        +
Publication Configuration
        │
        ▼
     Publisher
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
Viewer Tutorial   Presentation
```

La persistance et la configuration sont construites à partir des besoins
réels du Publisher, et non comme infrastructure abstraite indépendante.

------------------------------------------------------------------------

## 21. Méthode de production du référentiel

La méthode fait partie du produit BPMNSM.

``` text
business need
      ↓
identify CoC
      ↓
stakeholders / purpose / concerns
      ↓
architecture principles
      ↓
modelling practices
      ↓
EA Profile
      ↓
modelling
      ↓
validation
      ↓
pre-processing
      ↓
BPMN export
      ↓
BPMNSM post-processing
      ↓
publication
      ↓
Git configuration management
```

Elle comprend un core commun et des pratiques contextualisées par CoC.

Elle doit permettre de comprendre non seulement comment produire un
référentiel, mais pourquoi les règles, structures et choix de
configuration existent.

------------------------------------------------------------------------

## 22. Les tutoriels sont du code produit

> **\[CIBLE\] Les tutoriels BPMNSM sont des composants logiciels du
> produit, versionnés, testés et générés avec lui.**

Ils peuvent être publiés sous plusieurs formes :

``` text
Tutorial
   │
   ├── integrated application
   ├── single-file HTML
   ├── external HTML
   │      └── stable anchors
   └── Reveal.js presentation
```

Les tutoriels ne sont donc pas une documentation externe ajoutée après
le développement.

------------------------------------------------------------------------

## 23. Les tutoriels utilisent le produit réel

``` text
Tutorial Step
   │
   ├── explanatory content
   ├── modelRef
   ├── viewpoint/view
   ├── focus / selection
   ├── action
   └── expected result
             │
             ▼
        BPMNSM Viewer
```

Invariant cible :

> **Un tutorial doit consommer les composants publics du Viewer et ses
> configurations plutôt que reproduire artificiellement son comportement
> par accès direct aux internals.**

Le même modèle ou la même vue doit pouvoir être utilisé par le produit,
la démonstration et le tutorial.

------------------------------------------------------------------------

## 24. Method ≠ Tutorial ≠ Demonstration ≠ Test

``` text
METHOD
why / when / principles

TUTORIAL
how to reproduce

DEMONSTRATION
observable executable example

TEST
automated evidence
```

Ces artefacts sont distincts mais doivent pouvoir partager un scénario :

``` text
                 Practice
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      Rule       Tutorial      Model
        │           │           │
        └───────────┼───────────┘
                    ▼
               Demo Scenario
                /         \
               ▼           ▼
        automated test   presentation
```

Une capacité est mieux capitalisée lorsque son fonctionnement, sa
méthode d'utilisation et sa reproduction sont transmissibles.

------------------------------------------------------------------------

## 25. Reveal.js

Reveal.js est un candidat pertinent comme **renderer de présentation**,
notamment pour intégrer des modèles et vues BPMNSM interactifs dans des
slides.

La cible n'est pas de faire de Reveal.js le modèle canonique des
tutoriels :

``` text
Tutorial Definition
        │
    ┌───┼──────────────┐
    ▼   ▼              ▼
BPMNSM Reveal.js   HTML/anchors
mode   renderer       renderer
```

L'expérience antérieure `SemanticCartography.html` constitue un cas
d'étude pour ce pattern.

**Statut : `[CIBLE]` pour la capacité de présentation ; choix de
Reveal.js lui-même à valider dans le produit.**

------------------------------------------------------------------------

## 26. Single-file HTML et publication distribuée

Le Publisher doit pouvoir viser :

``` text
WEB / DISTRIBUTED

HTML
JS
CSS
models/
tutorials/
assets/
```

ou :

``` text
SINGLE FILE HTML

application
+ configuration
+ models
+ tutorial
+ CSS
+ JS
+ required assets
```

Le mode de sortie relève d'une configuration de publication.

------------------------------------------------------------------------

## 27. Tutoriels adressables

Les unités pédagogiques doivent disposer d'identités stables :

``` text
tutorial.html#apply-profile
tutorial.html#preprocess
tutorial.html#export-bpmn
tutorial.html#validation
```

Cela doit permettre à terme :

``` text
BPMNSM rule violation
        ↓
"Explain this rule"
        ↓
corresponding tutorial step
```

------------------------------------------------------------------------

## 28. Alignement configuration / outil / méthode / pédagogie

``` text
                    CoC Configuration
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 Semantic/Profile      Publication          Practices
       │                   │                   │
       ▼                   ▼                   ▼
 EA / BPMNSM rules     CoC Viewer        Tutorials
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                     Demonstration
```

> **\[CIBLE\] Une même configuration peut contribuer à la génération du
> Viewer, de ses règles/profils et de ses supports pédagogiques afin de
> réduire les divergences entre modèle, outil, méthode et formation.**

Mais :

> **Une source de configuration unique gouvernant absolument tout est
> une hypothèse, pas une décision.**

------------------------------------------------------------------------

## 29. Principe de capitalisation

Invariant historique :

> **Aucune connaissance nécessaire à la maintenance de BPMNSM ne doit
> exister uniquement dans une conversation avec une IA.**

Invariant complémentaire :

> **Une capacité BPMNSM n'est pleinement capitalisée que lorsque son
> architecture, sa preuve, sa méthode d'utilisation et les moyens de
> reproduire son comportement sont transmissibles.**

------------------------------------------------------------------------

## 30. Méthode de rapid development

``` text
BESOIN
  ↓
QUESTION
  ↓
ANALYSE DU CODE / DES CONTRATS EXISTANTS
  ↓
HYPOTHÈSE
  ↓
INVARIANTS
  ↓
EXPÉRIENCE MINIMALE
  ↓
OBSERVATION
  ↓
DÉCISION
  ↓
IMPLÉMENTATION ATOMIQUE
  ↓
PREUVE
  ↓
RÉGRESSION
  ↓
CAPITALISATION
  ├── architecture
  ├── méthode
  ├── tutorial
  └── demonstration
  ↓
REVUE DE MAÎTRISE
  ↓
CLÔTURE
```

> **Chaque incrément doit résoudre un problème observable du produit
> actuel, introduire le minimum de modèle nécessaire et produire une
> preuve susceptible de confirmer, modifier ou réfuter une hypothèse
> architecturale.**

------------------------------------------------------------------------

## 31. Statuts de connaissance

``` text
[CIBLE]
propriété souhaitée du système

[HYPOTHÈSE]
mécanisme candidat pour atteindre une cible

[DÉCIDÉ]
choix architectural effectivement pris

[IMPLÉMENTÉ]
présent dans le code

[DÉMONTRÉ]
preuve obtenue

[RÉFUTÉ]
expérience incompatible avec l’hypothèse
```

Exemples au gel de la cible :

``` text
[DÉMONTRÉ]
BPMN et ArchiMate peuvent coexister comme documents
indépendants dans l’Environment.

[CIBLE]
Persistance distribuée et snapshot peuvent représenter
un état logique équivalent.

[CIBLE]
Plusieurs breakdowns peuvent être configurés.

[HYPOTHÈSE]
Master / Version / Usage constitue un pattern adapté.

[CIBLE]
Les configurations sont reproductibles avec Git.

[HYPOTHÈSE]
Une propriété textuelle préservée par EA permet le
transport réversible des extensions SemArch.

[CIBLE]
Un CoC peut contribuer à des configurations de modèle,
publication et pédagogie.

[CIBLE]
Tutorials et démonstrations font partie des artefacts
logiciels BPMNSM.
```

------------------------------------------------------------------------

## 32. Falsifiabilité

La cible fonctionnelle est figée comme direction avant reprise d'A10.

Les mécanismes restent falsifiables :

``` text
hypothesis
    ↓
experiment
   / \
  /   \
confirm refute
  \   /
   \ /
refine implementation
```

Une abstraction ne doit jamais être protégée contre une observation qui
la contredit.

------------------------------------------------------------------------

## 33. Test permanent de cohérence architecturale

Pour toute décision future :

> **Cette décision permet-elle toujours à une information ou un concept
> de participer à plusieurs contextes, configurations, assemblages, vues
> et représentations sans duplication ou uniformisation artificielle,
> tout en restant sérialisable, versionnable, échangeable, traçable et
> compréhensible ?**

Et, compte tenu de la priorité produit :

> **Cette décision contribue-t-elle à la chaîne EA → BPMN → BPMNSM
> Publisher/Viewer ou à une capacité explicitement nécessaire à sa
> méthode, sa configuration, sa transition ou sa démonstration ?**

Si la réponse est non, le mécanisme doit être justifié par un besoin
distinct avant d'entrer dans le produit.

------------------------------------------------------------------------

## 34. Ordre des priorités

``` text
1  EA → BPMN → BPMNSM Publisher/Viewer

2  Configuration explicite et Git

3  Publication configurable par CoC

4  Méthode + tutorials + demonstrations
   produits parallèlement au logiciel

5  Persistance distribuée nécessaire
   à ces configurations

6  Assemblages / contextes / breakdowns
   introduits par besoins réels

7  Snapshot monolithique et restauration

8  ArchiMate pour continuité de transformation

9  Cartographie sémantique /
   démonstrateurs de recherche
```

Les points 2 à 5 peuvent progresser en parallèle dans une même tranche
verticale.

------------------------------------------------------------------------

## 35. A10 --- Configuration et stratégie de projection

### 35.1 A10.1 --- CoC Configuration Vertical Slice

**Statut : `[IMPLÉMENTÉ + DÉMONTRÉ]`.**

La tranche A10.1 a matérialisé une `CoCConfiguration` déclarative
minimale portant les choix propres à un CoC et résolus à la frontière de
composition. Les dimensions actuellement démontrées sont :

``` text
profileRef
publicationRef
defaultMaturity
```

Invariant acquis :

> **Une `CoCConfiguration` porte les choix déclaratifs propres à un CoC.
> À la frontière de composition, les références sont résolues en
> dépendances runtime et les valeurs par défaut alimentent les contextes
> effectifs. Les composants consomment ces dépendances ou contextes
> résolus plutôt que de résoudre eux-mêmes les références du CoC.**

La publication Engineering démontre notamment qu'une configuration de
publication résolue peut modifier observablement les capacités exposées
par un Viewer sans confondre ce choix avec le mode d'exécution de
l'application.

### 35.2 A10.2 --- ProjectionProfile comme stratégie explicite

**Statut : `[IMPLÉMENTÉ + DÉMONTRÉ]`.**

Deux `ProjectionProfile` explicitement supportés démontrent qu'un même
`RepositoryModel` peut être projeté différemment sans mutation du modèle
source et sans ajout de sémantique métier à la mécanique générique de
projection.

La stratégie peut en outre être injectée au runtime selon la chaîne :

``` text
createApp({ projectionProfile })
            │
            ▼
createRepositoryBrowser({ projectionProfile })
            │
            ▼
createEnvironmentProjection({ projectionProfile })
```

Invariant acquis :

> **Un même `RepositoryModel` peut être projeté structurellement de
> manière différente par deux `ProjectionProfile` explicitement
> supportés, sans mutation du modèle source et sans ajout de sémantique
> métier à la mécanique générique de projection.**

La sélection déclarative de cette stratégie par un CoC n'est pas
démontrée et n'est pas introduite par symétrie :

``` text
projectionRef dans CoCConfiguration
    [NON IMPLÉMENTÉ — NON JUSTIFIÉ À CE STADE]

ProjectionProfile resolver
    [NON IMPLÉMENTÉ — NON JUSTIFIÉ À CE STADE]

ProjectionProfile registry applicative
    [NON IMPLÉMENTÉ — NON JUSTIFIÉ À CE STADE]
```

> **A10 est clôturé. Le prochain incrément ne doit pas étendre la
> configuration par symétrie ; il doit partir d'un besoin produit ou
> d'une expérience observable.**

------------------------------------------------------------------------

## 36. Méthode multi-CoC d'émergence du Core

Le Core ne doit pas être défini par abstraction préalable ni par simple
ressemblance lexicale entre profils. Il doit émerger d'une comparaison
sémantique de besoins réels provenant de plusieurs CoCs.

La méthode de travail adoptée est :

``` text
NIVEAU 0 — BPMN NATIF
    ce que BPMN exprime déjà correctement

NIVEAU 1 — BESOINS CoC
    concepts, propriétés, relations et pratiques exprimés par chaque contexte

NIVEAU 2 — ALIGNEMENT SÉMANTIQUE
    équivalence ?
    spécialisation ?
    relation ?
    vue ?
    simple ressemblance lexicale ?
    ambiguïté non résolue ?

NIVEAU 3 — CONVERGENCE
    seulement après preuve :
    candidat commun au Core
```

La grille de décision pour chaque information historique ou besoin
nouveau est :

``` text
concept / propriété / relation source
              │
              ├── BPMN l’exprime déjà correctement
              │       → BPMN natif
              │
              ├── sémantique réellement commune démontrée
              │       → candidat CORE BPMNSM
              │
              ├── capacité BPMNSM générique mais avancée
              │       → capacité avancée à caractériser
              │
              └── besoin propre à un CoC ou sous-domaine
                      → contextualisation de profil
```

Un profil peut introduire une couche d'alignement intermédiaire vers un
Master/Core sans imposer une modification du stéréotypage des modèles
qui utilisent ce profil. Le mécanisme exact (héritage, mapping,
référence ou autre) reste expérimental tant que les profils réels et
leurs XMI n'ont pas fourni l'évidence nécessaire.

> **Le Core est un résultat progressif de la médiation entre contextes,
> pas un métamodèle conçu isolément.**

------------------------------------------------------------------------

## 37. Contextualisation, projection, View/Viewpoint et publication

Ces opérations doivent rester distinctes :

``` text
CONTEXTUALISATION
    quelles propriétés, règles et concepts sont applicables dans un contexte ?

PROJECTION
    comment le Repository est-il organisé ou représenté structurellement ?

VIEWPOINT / VIEW
    quelle représentation répond à quels stakeholders, concerns et purposes ?

PUBLICATION
    quelles capacités, configurations, modèles et représentations sont livrés à une audience ?
```

Un Viewer CoC relève principalement de la publication. Une publication
peut consommer profils, contextes, projections et, lorsque leur modèle
sera démontré, Viewpoints/Views.

> **Masquer une information dans un contexte, une projection, une View
> ou une publication ne doit jamais la détruire dans le Repository
> source.**

Les structures SIPOC, RASCI ou RAVI doivent d'abord être examinées comme
des candidats `Viewpoint/View` sur des concepts et relations existants
avant d'introduire des métamodèles autonomes.

------------------------------------------------------------------------

## 38. Deux axes expérimentaux synchronisés

La prochaine phase doit faire progresser simultanément
l'interopérabilité technique et l'interopérabilité de sens :

``` text
AXE 1 — INTEROPÉRABILITÉ TECHNIQUE

outil source / EA
→ injection de données transportables
→ export BPMN standard
→ import BPMNSM
→ préservation
→ agrégation
→ références différées


AXE 2 — INTEROPÉRABILITÉ DE SENS

CoC Avionic/Software ─┐
                      ├→ alignement → convergence éventuelle → Core
Second CoC ───────────┘
```

Pour l'axe technique, Sparx EA est le premier producteur expérimental,
mais le mécanisme recherché doit rester transposable : l'outil source
fournit du BPMN standard et un canal de transport opaque fiable ; BPMNSM
porte l'intelligence d'interprétation, de reconstruction, d'agrégation
et de médiation.

Le canal EA exact et le protocole de payload restent `[HYPOTHÈSE]` tant
qu'ils n'ont pas été observés et démontrés sur des exports réels.

------------------------------------------------------------------------

## 39. Séquence expérimentale après A10

Aucun nouveau jalon architectural n'est nommé avant que le dépôt et les
preuves ne le justifient. La séquence de travail suivante sert de guide
expérimental :

``` text
P0 — SOURCE SÉMANTIQUE
Deux CoCs réels
→ sources historiques préservées
→ concepts candidats
→ propriétés communes/contextuelles
→ ambiguïtés explicitement UNRESOLVED

P1 — SÉRIALISATION
Processus BPMN décoré
→ extensions BPMNSM
→ round-trip XML sans perte

P2 — PROFILE RUNTIME
Même élément BPMN
→ propriétés disponibles selon profil/contexte
→ propriété commune + propriété CoC

P3 — EDITOR MULTI-CoC
Repository avec CoC A + CoC B
→ changement de contexte
→ propriétés pertinentes différentes
→ données non pertinentes masquées, jamais détruites

P4 — PUBLICATION
Même Repository
→ Viewer A
→ Viewer B
→ résultats observablement différents
→ configuration explicite et reproductible

P5 — SOUS-DOMAINE
CoC A / sous-domaine
→ propriété ou règle contextualisée au sous-domaine
→ sans nouveau stéréotypage obligatoire

P6 — VIEW / VIEWPOINT
RASCI, RAVI ou SIPOC
→ démontrer qu’une vue peut être construite
   depuis les concepts et relations disponibles
→ seulement après les preuves précédentes
```

P0 doit préserver séparément les besoins sources et les décisions
d'alignement. Les termes `SOURCE`, `CLARIFIED`, `PROPOSED`, `VALIDATED`,
`REJECTED` et `UNRESOLVED` doivent permettre de distinguer l'observation
de la décision.

P1 à P4 constituent la première preuve verticale recherchée. P5 et P6 ne
doivent pas bloquer cette preuve.

La propriété à démontrer est :

> **Un même Repository BPMNSM peut contenir des processus BPMN enrichis
> par une sémantique partagée et des propriétés contextualisées par CoC
> ; l'Editor peut exploiter plusieurs contextes sans perte
> d'information, tandis qu'un Viewer publié pour un CoC donné n'expose
> que la sémantique et les capacités pertinentes pour sa
> configuration.**

Cette preuve ne requiert pas que tous les candidats Core soient déjà
validés. Les concepts peuvent rester `UNRESOLVED` pendant l'expérience
lorsque leur statut sémantique n'est pas encore démontré.

------------------------------------------------------------------------

## 40. Règle de reprise

À chaque reprise du développement :

1.  prendre le dépôt réel comme autorité ;
2.  exécuter la régression avant modification ;
3.  relire les fichiers exacts concernés ;
4.  choisir la plus petite expérience capable de faire progresser la
    séquence P0--P4 ;
5.  préserver les sources CoC historiques avant toute harmonisation ;
6.  ne pas promouvoir un concept dans le Core sans convergence
    sémantique démontrée ;
7.  ne pas généraliser le modèle de configuration avant qu'un besoin
    réel ne justifie l'abstraction ;
8.  capitaliser immédiatement les invariants démontrés dans le code, les
    tests, la méthode, les scénarios et les tutoriels concernés.

> **La cible reste fixée. Le travail consiste à la démontrer
> progressivement et à faire émerger les abstractions à partir des
> preuves, pas à les imposer avant l'expérience.**

------------------------------------------------------------------------

## 41. État expérimental après P4.9 --- 2026-09-17

Cette section capitalise les preuves obtenues depuis la définition de la
séquence P0--P6. Elle ne change pas la cible ; elle enregistre ce qui
est désormais démontré.

``` text
P1 — SÉRIALISATION
    base SemArch/BPMN et préservation déjà acquises

P2 — PROFILE RUNTIME
    ActiveProfileRuntime mutable
    [IMPLÉMENTÉ + DÉMONTRÉ]

P3 — EDITOR MULTI-CoC
    contexte CoC → runtime actif → propriétés recalculées
    [IMPLÉMENTÉ + DÉMONTRÉ]

P4 — PUBLICATION
    dérivation BPMN selon runtime effectif
    frontière d'export Publisher
    consommation par moteur Viewer réel
    ouverture directe dans standalone Viewer
    [CHAÎNE P4.6 → P4.9 IMPLÉMENTÉE + DÉMONTRÉE]
```

La propriété verticale désormais démontrée sur les profils expérimentaux
A/B est :

> **Un même BPMN source peut conserver simultanément des données de
> plusieurs contextes ; l'Editor peut changer de `ProfileRuntime` sans
> recréer le Modeler, et la publication peut dériver un artefact BPMN ne
> contenant que les `DataProperty` résolues par le runtime effectif,
> artefact que le Viewer charge ensuite sans résoudre de profil ni
> republier.**

Le baseline global post-P4.9 est :

``` text
44 fichiers de test
204 tests
0 échec

standalone Editor    build OK
standalone Viewer    build OK
GitHub Pages         build OK
```

### 41.1 Ce que P4.9 ne démontre pas encore

La configuration de publication Engineering est déjà causale pour les
capacités UI via `publicationRef`, et le Publisher est causal pour la
projection sémantique via le `ProfileRuntime` actif.

Il reste à inspecter, avant toute nouvelle abstraction, si la cible «
publication configurable par CoC » exige encore une frontière non
démontrée entre :

``` text
CoCConfiguration
    → PublicationConfiguration
    → Publisher
```

Cette inspection doit précéder tout nouveau numéro d'incrément.

Ne pas ajouter par symétrie un `profileRef` à
`PublicationConfiguration`, un resolver de profil dans le Publisher ou
le Viewer, ou une nouvelle dimension de configuration sans besoin
produit observable.

### 41.2 Point de reprise

Prochaine action atomique : **inspection uniquement, sans modification
de fichier**, de la frontière de publication restante.

Examiner exactement :

``` text
CoC configurations
PublicationConfiguration
PublicationConfiguration resolver
Publisher BPMN
références de composition publicationRef / publicationConfiguration /
publishBpmnXml
```

Puis décider, à partir du code réel, si P4 peut être clôturé ou si une
expérience supplémentaire est nécessaire.

------------------------------------------------------------------------

## 42. Mise à jour de cible après démonstration Business View --- 2026-09-17

Cette section complète la cible sans remettre en cause les frontières P4 acquises.

### 42.1 Business View : primitive désormais démontrée

La cible `View / Viewpoint / Stakeholder` dispose maintenant d'une première primitive produit concrète : une **Business View versionnée**, indépendante du `ProfileRuntime`, qui projette des propriétés de types pour un stakeholder.

```text
BusinessView
  id
  version
  stakeholderRef
  projections[]
    typeRef
    propertyRefs[]
```

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]** pour la normalisation, la projection de propriétés, le holder runtime, le resolver, le relais applicatif et l'activation du vertical Avionics.

Cette Business View n'est pas déclarée équivalente au `ProjectionProfile` de l'Environment Browser ni à un Viewpoint ISO/IEC/IEEE 42010 complet.

```text
BusinessView
    projection de propriétés d'un objet/representation pour stakeholder

ProjectionProfile
    stratégie structurelle de projection de l'Environment Browser

Viewpoint/View cible
    concerns/purpose/stakeholder plus généraux
```

Ne pas fusionner ces concepts sans preuve.

### 42.2 Sélection explicite et indépendante du CoCConfiguration

Le démonstrateur utilise une association explicite :

```text
stakeholderRef → businessViewRef
```

puis :

```text
businessViewRef → BusinessView resource
```

Pour Avionics :

```text
CoC_Avionics → avionics → Business View v1.0
```

Cette preuve ne justifie pas d'ajouter `businessViewRef` à `CoCConfiguration`. Les CoC sont un type de stakeholder parmi d'autres et un stakeholder pourra à terme avoir plusieurs vues/versionnements nécessitant une politique de choix distincte.

### 42.3 Business Object comme prochaine cible structurante

La cible se précise ainsi :

```text
Business Model / repository
├── BusinessObjectType
├── BusinessView (versionnée, stakeholder)
└── BusinessObject
      id
      typeRefs[] 1..n
          ↓ represented by
      BPMN Representation(s)
          ↓ occurrences lorsque BPMN le justifie
      BPMN Occurrence(s)
```

Le Business Object doit être typé ; le multi-typing est une cible. Les types doivent être extensibles et issus de modèles/référentiels BO ingérés puis associés aux constructions BPMN compatibles.

La Business View décore/projette une représentation selon les types du Business Object et le stakeholder, sans dupliquer l'identité métier.

### 42.4 Data properties et object properties

Le format de Business View reste fondé sur `propertyRefs[]`. La propriété normalisée générique possède déjà les hooks :

```text
id
kind
targetType
minOccurs
maxOccurs
```

Le runtime XSD courant produit des propriétés `kind = data`. Les relations/object properties génériques ne sont **pas** encore implémentées.

Cible : une Business View doit pouvoir sélectionner à terme des propriétés de valeur et des propriétés de relation sans obliger à représenter une relation BO comme une simple chaîne `semarch:DataProperty.value`.

### 42.5 Représentation et occurrence

Pour les cas où BPMN fournit une relation native objet/occurrence, elle doit être privilégiée :

```text
DataStore    ← dataStoreRef ─ DataStoreReference
DataObject   ← dataObjectRef ─ DataObjectReference
```

Le niveau occurrence n'est pas universel. Un futur Business Object de type Role/Organization peut par exemple être représenté par un `bpmn:Participant` sans qu'une occurrence native symétrique soit démontrée.

La cible ne doit donc pas imposer artificiellement trois niveaux à toutes les constructions BPMN.

### 42.6 Identité

Invariant cible renforcé :

```text
Business Object identity
    ≠ Representation identity / semarch:stableGuid
    ≠ BPMN element ID
    ≠ RepositoryComponent identity
```

Un Business Object doit pouvoir survivre conceptuellement à plusieurs représentations et plusieurs vues stakeholder.

### 42.7 Prochain critère de progression

La prochaine expérience doit démontrer un besoin observable de Business Object avec le minimum de modèle nécessaire. Elle doit répondre concrètement à au moins une question de ce type :

```text
Comment un objet métier typé existe-t-il indépendamment de sa représentation BPMN ?
Comment une représentation BPMN s'attache-t-elle / se détache-t-elle d'un BO ?
Comment plusieurs types et plusieurs Business Views projettent-ils le même BO sans duplication ?
Comment une relation objet est-elle représentée sans l'aplatir en valeur littérale ?
```

Ne pas commencer par un métamodèle BO complet, une registry universelle ou une refonte de `semarch.json` sans expérience verticale qui en exige les éléments.

### 42.8 Baseline de preuve

Au checkpoint de cette mise à jour :

```text
59 fichiers de test
267 tests
267 passent
0 échec
```

La Business View Avionics v1.0 et son activation depuis `CoC_Avionics` sont démontrées. Les builds Editor/Viewer/Pages restent démontrés au checkpoint P4 ; leur état post-Business-View doit être réétabli par exécution avant toute nouvelle affirmation de build courant.
