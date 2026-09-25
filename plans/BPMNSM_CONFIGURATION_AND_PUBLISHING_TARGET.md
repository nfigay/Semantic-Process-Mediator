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


## 43. Mise à jour de cible après vertical Business Object et publication --- 2026-09-18

### 43.1 Business Object : passage de cible à capacité démontrée

Depuis la section 42, le Business Object minimal a été implémenté et démontré :

```text
BusinessObject
    id
    typeRefs[] 1..n

BusinessObjectRepresentation
    businessObjectId
    representationId
```

La création interactive, l'attachement/détachement à une représentation BPMN, la persistance repository et la restauration après réouverture sont démontrés.

La baseline associée est :

```text
67 fichiers de test
305 tests
0 échec
```

### 43.2 Ce que cette preuve change

La question structurante n'est plus l'existence d'un BO indépendant de son élément BPMN. Cette séparation est démontrée.

La cible doit maintenant tester les cas où le BPMN ne suffit plus comme seul conteneur de l'information métier :

```text
Business Object sans représentation BPMN
BusinessRelation
relation traversant plusieurs modèles
plusieurs représentations réparties dans plusieurs BPMN
contextualisation d'un repository distribué
```

La preuve technique `BusinessRelation` réalisée avant récupération de la numérotation autoritaire E14–E16 démontre l'abstraction autonome et sa conservation dans le repository BPMN courant : **[IMPLÉMENTÉ + DÉMONTRÉ]** dans ce périmètre technique. Elle ne constitue ni E15 autoritaire ni la preuve de nécessité E16. Les cas distribués ou traversant plusieurs modèles restent **[NON IMPLÉMENTÉ]**.

### 43.3 Repository BPMN courant vs repository distribué

Le repository canonique courant reste un BPMN XML enrichi. Les Business Objects et leurs liens de représentation y sont persistés pour le vertical démontré.

Une cible plus large peut nécessiter :

```text
Repository BPMNSM
├── intégration / contextualisation
├── plusieurs documents BPMN
└── données métier complémentaires
```

Cette structure est une hypothèse de travail, pas un contrat implémenté. Un manifest ne doit être introduit que lorsqu'un vertical produit démontre une information nécessaire qui ne peut pas être portée correctement dans les BPMN concernés.

### 43.4 Business View et Business Object restent orthogonaux

La Business View ne devient pas propriétaire du Business Object.

```text
BusinessObject
    identité métier + types

BusinessObjectRepresentation
    lien vers représentation BPMN

ProfileRuntime
    propriétés disponibles / résolues

BusinessView
    projection stakeholder des propriétés
```

`BusinessView = null` signifie toujours absence de filtrage Business View.

### 43.5 Distribution comme partie du contrat produit

Le Viewer, l'Editor, la présentation et le package offline sont maintenant produits et publiés par une chaîne démontrée.

Le pipeline doit conserver l'invariant :

```text
standalone fraîchement construit
    → dist/standalone
    → build:presentations / package offline
    → build:pages
    → GitHub Pages
```

Un build intermédiaire périmé dans `dist/standalone` n'est plus acceptable comme comportement normal.

### 43.6 Frontière Viewer confirmée

Le Viewer public sait ouvrir un BPMN depuis `Repository → Open BPMN…`.

Cette correction n'a pas changé la frontière P4 : le Viewer ne doit pas résoudre un ProfileRuntime ni republier le repository pour afficher un artefact publié.

### 43.7 Prochain critère de progression

E14/E15 ont démontré qu'une `BusinessRelation` autonome entre deux Business Objects peut appartenir au BPMN repository courant, être sérialisée puis restaurée dans le runtime réel de l'application générée.

La prochaine expérience utile doit donc porter sur une information qui dépasse cette capacité mono-BPMN déjà acquise et permettre de décider, par preuve, si elle :
1. appartient encore à un BPMN particulier ;
2. peut être dérivée de plusieurs BPMN ;
3. exige un artefact complémentaire au niveau repository.

Ne pas créer d'abstraction distribuée avant ce test.

------------------------------------------------------------------------

## 44. Cible de publication, CI et repositories Git --- décision de continuité 2026-09-19

Cette section capitalise les décisions prises avant la publication de la baseline consolidée. Elle complète les sections historiques sans réécrire leurs preuves.

### 44.1 Séparer version de l'application et version du repository de ressources

La distribution BPMNSM et le repository de processus/ressources sont deux axes de versionnement indépendants.

```text
BPMNSM deployment
    ×
resource repository
    ×
repository revision
```

Un repository de ressources peut contenir des fichiers BPMN et, lorsque le besoin est démontré, d'autres ressources versionnées utiles à l'environnement intégré. Il n'est pas assimilé à une base de données distante partagée.

La révision du repository doit pouvoir être désignée par une branche, un tag ou un commit. Une référence mobile peut être résolue vers un commit exact afin de rendre une exécution reproductible.

Cette décision ne modifie pas le contrat courant du repository BPMN monofichier démontré dans le registre Business Model. Elle définit une cible opérationnelle pour l'accès à des repositories de fichiers versionnés.

### 44.2 Deux modes d'édition à préserver

Deux modes restent légitimes et ne doivent pas être confondus :

```text
A. workspace local
   BPMNSM ↔ fichiers locaux ↔ Git local/externe ↔ forge

B. repository distant
   BPMNSM ↔ état de travail applicatif ↔ API de forge Git ↔ repository
```

Le mode A laisse Git extérieur à BPMNSM. Le mode B peut fournir lecture, branche, commit et synchronisation distante sans imposer l'embarquement d'un client Git complet dans le navigateur.

Aucun choix exclusif entre A et B n'est requis à ce checkpoint.

### 44.3 API de forge : GitHub d'abord, sans couplage métier

GitHub est le premier environnement visé pour la mise en service. L'accès distant ne doit toutefois pas disperser des hypothèses GitHub dans le modèle métier du repository.

Cible : exprimer les intentions repository/versioning nécessaires à BPMNSM derrière une frontière permettant ultérieurement un provider GitLab lorsque le besoin est démontré.

La portabilité GitHub/GitLab est une contrainte de conception, pas une abstraction logicielle déjà implémentée.

```text
GitHub provider                         [NON IMPLÉMENTÉ]
GitLab provider                         [NON IMPLÉMENTÉ]
édition/commit distant depuis BPMNSM    [NON IMPLÉMENTÉ]
authentification forge                  [NON IMPLÉMENTÉ]
```

### 44.4 Publication statique multi-version

La cible Pages doit permettre de conserver plusieurs distributions exécutables en parallèle :

```text
/releases/<version>/        release officielle immuable
/latest/                    dernier état intégré publié
/previews/<id>/             version de développement/test
/custom/<scope>/<version>/  distribution personnalisée si nécessaire
```

Une release officielle publiée sous une version donnée ne doit pas être silencieusement remplacée par un autre contenu. Une correction produit une nouvelle version.

Plusieurs versions doivent pouvoir être lancées simultanément. L'isolation de leur état navigateur (`localStorage`, IndexedDB, service worker ou autre) doit être déterminée par inspection et expérience avant implémentation ; aucune collision n'est affirmée à ce checkpoint.

Le repository de ressources sélectionné reste indépendant du chemin de déploiement BPMNSM. Une même révision de repository doit pouvoir servir à comparer plusieurs versions de BPMNSM.

```text
Pages multi-version                     [NON IMPLÉMENTÉ]
release versionnée lançable             [NON IMPLÉMENTÉ]
latest lançable                         [NON IMPLÉMENTÉ]
preview lançable                        [NON IMPLÉMENTÉ]
launcher/catalogue                      [NON IMPLÉMENTÉ]
isolation état navigateur               [NON IMPLÉMENTÉ]
publication custom                      [NON IMPLÉMENTÉ]
```

Les publications Pages historiques démontrées restent des preuves historiques. Elles ne démontrent pas la publication de la baseline consolidée 2026-09-19 ni cette architecture multi-version.

### 44.5 CI avant extension de la publication

La frontière CI minimale définie pour la baseline consolidée a été franchie avant la reprise des nouveaux incréments fonctionnels.

```text
baseline technique locale                [IMPLÉMENTÉ + DÉMONTRÉ]
commit/push de baseline                  [IMPLÉMENTÉ + DÉMONTRÉ]
GitHub Actions sur cette baseline        [IMPLÉMENTÉ + DÉMONTRÉ]
publication Pages minimale               [IMPLÉMENTÉ + DÉMONTRÉ]
architecture Pages multi-version cible   [NON IMPLÉMENTÉ]
```

Configuration de preuve capitalisée :

```text
origin/main baseline                     313d5d554fc2681f44122ea7c40efa38c22dff95
GitHub Actions                           run 35465425073, succès
gh-pages                                 c6697a5467c05b51182f3a9e54f7853ebec62323
```

Le contrôle documenté de Pages a démontré la racine, le runbook et les previews historiques accessibles ; `/releases` et `/latest` restaient absents. La publication minimale ne doit donc pas être promue implicitement en preuve de l'architecture multi-version décrite en 44.4.

### 44.6 Réutilisation avec d'autres projets : contrainte, pas chantier immédiat

BPMNSM, ArchiCG et StandardisationRadarChart peuvent à terme partager des composants ou patterns architecturaux, notamment autour de Git, publication, identité de déploiement ou méthodes de preuve.

Aucune décision monorepo/multi-repo ni extraction de package commun n'est prise maintenant. BPMNSM reste le chantier prioritaire. Une capacité potentiellement réutilisable doit simplement éviter un couplage métier inutile ; l'extraction ne devient justifiée qu'après comparaison de besoins réels dans plusieurs projets.

### 44.7 Ordre opérationnel retenu

```text
1. baseline consolidée / CI / publication minimale : franchies et capitalisées
2. E14 : commitée au HEAD be5f6b355a3da39dc1b51591a5ccdd7000ec9633
3. preuve runtime/persistance `BusinessRelation` antérieure à la récupération du registre : `[IMPLÉMENTÉ + DÉMONTRÉ]` dans son périmètre technique, worktree non commitée ; ne pas l'assimiler à E15 autoritaire
4. preuve runtime E15 : standalone généré sous Chrome, Export XML physique, Open Repository réel et restauration démontrée
5. régression E15 : 23 tests ciblés passés, build standalone Editor réussi
6. prochaine expérience Business Model : la déterminer depuis le registre expérimental réel, sans inventer d'identifiant ni élargir le périmètre
7. étendre multi-release / preview / custom seulement lorsqu'une nécessité démontrée le justifie
```

Ne pas ouvrir avant nécessité démontrée un chantier transverse ArchiCG/Radar, un client Git JavaScript complet ou une infrastructure de télémétrie utilisateur.

------------------------------------------------------------------------

## 45. Continuité du work plan et de la méthode

Le work plan est continu entre les conversations.

Un changement de conversation ne redéfinit ni l'expérience courante, ni
son claim, ni la frontière de preuve attendue, ni le protocole utilisé
pour l'établir.

À chaque reprise :

1. récupérer le checkpoint Git et l'état réel du worktree ;
2. relire le handover et le registre expérimental concernés ;
3. identifier l'expérience et la propriété actuellement ouvertes ;
4. récupérer les précédents méthodologiques déjà démontrés ;
5. poursuivre avec la plus petite expérience falsifiable compatible avec
   ces précédents.

Le choix d'un nouvel outil de test ou d'une nouvelle infrastructure n'est
jamais une étape implicite du work plan.

Si la méthode existante ne permet pas de démontrer la propriété ouverte,
cette insuffisance devient elle-même un résultat d'inspection. Une
nouvelle méthode peut alors être proposée explicitement, sans confondre
le moyen de preuve avec le besoin produit.

Le passage :

```text
conversation N
→ checkpoint
→ conversation N+1
```

doit préserver :

```text
besoin / objectif
claim
limites déjà établies
preuves acquises
preuves manquantes
méthode de preuve applicable
état Git exact
prochaine expérience minimale
```

Il ne doit pas provoquer :

```text
réinterprétation silencieuse du besoin
changement opportuniste de protocole
nouvelle infrastructure non justifiée
promotion d'une preuve vers une propriété plus forte
élargissement implicite du périmètre
```
------------------------------------------------------------------------

## 46. Clôture expérimentale E15 --- 2026-09-20

### 46.1 Claim démontré

E15 demandait si une relation métier autonome entre deux `BusinessObject` pouvait être créée/chargée, observée et conservée dans le runtime réel de l'application générée.

Statut : `[IMPLÉMENTÉ + DÉMONTRÉ]`.

La chaîne de preuve exécutée dans le standalone Editor généré est :

```text
création UI de E15-A / example:A et E15-B / example:B
→ présence des deux BO dans businessObjectStore
→ présence canonique des deux semarch:BusinessObject dans Definitions
→ création applicative E15-A → E15-B / example:relatedTo
→ présence dans businessRelationStore
→ présence canonique de semarch:BusinessRelation
→ Export XML physique
→ Open Repository du fichier exporté
→ projection des BusinessObject
→ projection de BusinessRelation
→ restauration identique dans les stores runtime et le modèle canonique
```

L'observation finale après réimport a restitué exactement les deux BO, leurs `typeRefs` et la relation `E15-A → E15-B / example:relatedTo` dans les collections runtime et canoniques.

### 46.2 Régression et build associés

Configuration de preuve :

```text
branch                              main
HEAD                                be5f6b355a3da39dc1b51591a5ccdd7000ec9633
HEAD subject                        feat(model): add autonomous business relations
E15                                 worktree non commitée
index                               vide au contrôle final
Node                                v22.22.2
npm                                 10.9.7
régression ciblée                   5 fichiers / 23 tests / 0 échec
build:editor                        succès, Vite 8.2.2, 880 modules transformés
git diff --check                    silencieux
```

Les avertissements CSS `@import` et `eval` provenant du build restent non bloquants et ne sont pas promus en défaut E15.

### 46.3 Frontière exacte de la preuve

E15 démontre la persistance et la restauration d'une `BusinessRelation` autonome dans le repository BPMN courant et dans le runtime réel du standalone généré.

Elle ne démontre pas :

```text
UI dédiée de création / modification de BusinessRelation    [NON IMPLÉMENTÉ]
relation traversant plusieurs BPMN                          [NON IMPLÉMENTÉ]
repository distribué complémentaire                        [NON IMPLÉMENTÉ]
persistance transactionnelle plus forte                    [NON IMPLÉMENTÉ]
```

Aucun commit ni push E15 n'a été réalisé à ce checkpoint. La prochaine expérience doit être récupérée depuis le registre Business Model réel avant de lui attribuer un identifiant ou un périmètre.

## Decision gate Business Model E14–E16 — 2026-09-20

Le registre autoritaire `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` reste
la source de vérité pour la séquence E14–E19.

- E14 est **[IMPLÉMENTÉ + DÉMONTRÉ]** : une `bpmn:SequenceFlow` native peut
  porter un `SemanticType` SemArch compatible, résoudre une propriété de
  schéma et conserver cet enrichissement après sérialisation/réouverture.
  Preuve ciblée : 2 fichiers / 4 tests / 0 échec.
- E15 reste **[NON IMPLÉMENTÉ]** au sens du critère autoritaire « cas produit
  réels ». E15-01 à E15-03 démontrent néanmoins la comparaison architecturale
  contrôlée : `ObjectProperty` couvre l'axe BO × CoC, une relation BPMN
  native porte la topologie lorsqu'elle convient, et ses endpoints peuvent
  être dérivés vers les BO canoniques. Régression finale : 1 fichier /
  3 tests / 0 échec.
- E16 reste **[NON IMPLÉMENTÉ]** quant à la nécessité architecturale :
  aucun « cas produit irréductible » n'est encore démontré. E16-01/E16-02
  démontrent en revanche la faisabilité technique de BO -> BO + BR :
  `BusinessRelation` porte un triplet canonique indépendant du CoC et de la
  représentation et survit à un round-trip BPMN XML sans
  `BusinessObjectRepresentation`, `SequenceFlow` relationnelle ni
  `ObjectProperty` substitutive. Régression finale : 1 fichier / 2 tests /
  0 échec.
- Le fixture `Aircraft --hasEngine--> Engine` est un cas de test
  architectural contrôlé, pas une exigence métier normative ni un cas
  produit réel.
- L'existence actuelle du code `BusinessRelation`, de son store et de sa
  persistance démontre une capacité ; elle ne décide pas par inertie de
  l'architecture finale.
- E17-01 reste parqué. Il ne clôt pas E17 et ne doit pas être approfondi avant
  résolution du decision gate produit E15-E16.

La prochaine preuve manquante n'est donc pas une extension technique
supplémentaire de `BusinessRelation`, mais un cas produit réel permettant de
tester E15 puis, seulement si nécessaire, un cas produit irréductible pour
E16. Le futur cas de démonstration métier n'est pas encore défini.

## Checkpoint du work plan — 2026-09-20

### Frontière courante

Le decision gate Business Model E14–E16 capitalisé dans le registre
`BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` est la frontière autoritaire
de reprise :

1. E14 — enrichissement d'une relation BPMN :
   **[IMPLÉMENTÉ + DÉMONTRÉ]** dans son périmètre documenté ;
2. E15 — Object Properties versus relations BPMN :
   **[NON IMPLÉMENTÉ]** au sens de la preuve autoritaire « cas produit
   réels » ; E15-01, E15-02 et E15-03 constituent des preuves
   architecturales intermédiaires démontrées ;
3. E16 — nécessité éventuelle de `BusinessRelation` :
   **[NON IMPLÉMENTÉ]** quant à la nécessité architecturale ; E16-01 et
   E16-02 démontrent la faisabilité technique BO -> BO + BR et sa
   persistance, pas le « cas produit irréductible » ;
4. E17-01 est parqué. Il ne ferme pas E17 et ne doit pas être utilisé comme
   justification rétroactive de `BusinessRelation` ou d'un artefact
   repository.

Le fixture `Aircraft --hasEngine--> Engine` reste un fixture architectural
contrôlé. Il n'est ni une exigence métier normative ni le futur cas de
démonstration métier, qui reste à définir.

### Désambiguïsation historique

Le HEAD `be5f6b355a3da39dc1b51591a5ccdd7000ec9633`
(`feat(model): add autonomous business relations`) contient le prototype
`BusinessRelation` modèle/store. Une preuve technique ultérieure a démontré
son intégration runtime et sa persistance par Export XML physique puis Open
Repository réel. Ces travaux ont été appelés E14/E15 dans la conversation
avant récupération du registre autoritaire. Ils restent des preuves
techniques valides, mais ces anciens identifiants ne doivent plus être
assimilés aux E14/E15 autoritaires.

### État Git à préserver au checkpoint

```text
branche                             main
HEAD                                be5f6b355a3da39dc1b51591a5ccdd7000ec9633
HEAD subject                        feat(model): add autonomous business relations
index                               vide au contrôle du 2026-09-20
worktree                            non propre ; nombreux changements sans rapport à préserver
git diff --check                    silencieux au contrôle du 2026-09-20
```

Aucune opération de reprise ne doit utiliser `git add -A`, `git reset`, un
nettoyage global ou une autre commande susceptible d'altérer les changements
sans rapport présents dans le worktree.

### Ordre de reprise

La prochaine étape n'est pas E17 et n'est pas une extension technique
supplémentaire de `BusinessRelation`.

Ordre autoritaire :

```text
checkpoint documentaire 2026-09-20
→ préserver le worktree et l'index vide
→ reprendre E15 depuis son critère manquant : cas produit réel
→ définir le futur cas de démonstration métier lorsqu'il sera disponible
→ comparer sur ce cas ObjectProperty / relation BPMN enrichie / dérivation
→ seulement si ces alternatives sont insuffisantes, éprouver E16 par un cas
  produit irréductible
→ ne reprendre E17 qu'après résolution du decision gate E15–E16
```

Une absence actuelle de cas métier défini n'autorise ni à fabriquer un cas
produit, ni à fermer E15/E16, ni à faire avancer E17 par défaut.

### Protocole de modification

Pour toute modification de code ou de documents : récupérer les fichiers
exacts du worktree, constituer un ZIP d'entrée, travailler à partir de ces
fichiers exacts, produire un ZIP de remplacement complet avec arborescence
repository, puis effectuer une vérification groupée après installation
manuelle. Ne pas demander de modification manuelle de code.

## 47. Local Workspace et persistance repository — checkpoint 2026-09-21

### 47.1 Décision produit pour le démonstrateur

Pour le démonstrateur courant, le **Local Workspace navigateur** est la voie primaire. L'utilisateur choisit un répertoire arbitraire auquel le navigateur autorise l'accès. BPMNSM ne force pas un répertoire global, un manifest propriétaire ou une arborescence physique obligatoire.

Principe retenu :

```text
Read permissively — Create conventionally — Save conservatively
```

Un workspace est un ensemble hétérogène de ressources. Le type appartient au fichier, pas au dossier. BPMN, ArchiMate, Business Model JSON et fichiers inconnus peuvent coexister dans le même arbre. Les chemins relatifs existants sont préservés lors du Save.

### 47.2 Reconnaissance et chargement démontrés

La reconnaissance minimale démontrée est :

```text
*.bpmn          -> bpmn
*.archimate     -> archimate
*.business.json -> business-model
autre           -> unknown
```

La reconnaissance est insensible à la casse. `.xml` reste volontairement `unknown` tant qu'une reconnaissance par contenu n'est pas démontrée, car BPMN et ArchiMate peuvent tous deux utiliser XML.

Le chargement Local Workspace démontre l'inventaire récursif, la lecture physique, la création de `RepositoryDocument { id, fileName, kind, content, dirty }`, la projection séquentielle de plusieurs BPMN, l'ouverture d'ArchiMate et l'hydratation du Business Model autonome.

### 47.3 Save repository-level démontré

`Save Local Workspace` est désormais la commande de sauvegarde repository-level du démonstrateur. Elle parcourt les `RepositoryDocument` dirty, écrit leur `content` vers leur `FileSystemFileHandle`, relit le fichier et ne remet `dirty=false` qu'après égalité exacte. Les échecs restent dirty et sont rapportés sans annuler les autres écritures.

LW10 démontre la sauvegarde physique de plusieurs BPMN dirty dans une seule opération. LW12 démontre en plus la chaîne Business Model : mutation canonique → JSON → RepositoryDocument dirty → Save → fichier physique → fresh reload.

La commande historique mono-document `Save Local Workspace Document` a été retirée afin d'éviter l'ambiguïté produit.

### 47.4 Save, Export et Git restent distincts

La frontière opérationnelle est maintenant :

```text
Save Local Workspace  = persister les ressources repository modifiées
Export BPMN XML       = exporter le BPMN actif comme artefact individuel
Git commit/push       = versionner/publier une révision du repository de ressources
```

Le Save ne doit pas devenir implicitement un commit Git. Le repository de ressources reste un ensemble de fichiers versionnables indépendamment du déploiement BPMNSM.

### 47.5 Business Model physique démontré

Le Business Model autonome dispose maintenant d'un codec JSON physique `formatVersion: "1"` et peut coexister avec BPMN et ArchiMate dans un Local Workspace. LW11 démontre le sens fichier → session ; LW12 démontre session → fichier → session fraîche pour BO/BR.

Cela ne ferme pas encore le critère global :

```text
Repository A -> SAVE -> fichiers -> LOAD -> Repository B ≡ A
```

sur toute l'information persistante canonique. La qualification multi-document des représentations BO↔BPMN, les enrichissements BPMN et les autres collections du Business Model doivent encore être éprouvés ensemble.

### 47.6 Publication du checkpoint avant LW13

Le checkpoint 2026-09-21 doit être capitalisé et publiable avant de lancer LW13. L'objectif est de montrer un état reproductible du démonstrateur comprenant au minimum :

- Business Model Explorer ;
- Local Workspace hétérogène ;
- plusieurs BPMN et une ressource ArchiMate ;
- Business Model JSON autonome ;
- Save Local Workspace multi-document ;
- round-trip physique LW12 démontré.

La publication nominale reste régie par `BPMNSM_PUBLICATION_RUNBOOK.md` et `publication/versions.json`. Aucun numéro de release, tag, commit ou push n'est implicite dans cette capitalisation.

### 47.7 Workspace Archive portable — LW-ZIP-01 / LW-ZIP-02 démontrés

L'accès direct au répertoire par la File System Access API reste une voie de travail lorsque le navigateur et l'environnement l'autorisent. Il ne constitue toutefois pas une dépendance obligatoire du modèle repository BPMNSM. Le même ensemble de `RepositoryDocument` peut être matérialisé sous forme d'une **Workspace Archive** ZIP portable, destinée à être manipulée comme un workspace de ressources puis, le cas échéant, appliquée au repository Git par les outils externes de l'utilisateur.

Les deux voies sont présentées comme des modes de travail complémentaires :

```text
Direct folder access      = travailler directement sur les fichiers autorisés par le navigateur
Workspace Archive         = transporter les ressources repository modifiées dans un ZIP portable
Git commit/push           = versionner/publier ensuite avec l'outil Git externe choisi
```

La voie archive ne doit donc pas être présentée comme une erreur ou comme un mode dégradé. Elle préserve la séparation déjà établie entre persistance des ressources et opérations Git, et permet notamment un usage statique/serverless de BPMNSM sans imposer de backend applicatif pour la sauvegarde.

**LW-ZIP-01** démontre la primitive de génération d'archive à partir des `RepositoryDocument` dirty. Les entrées ZIP utilisent exactement leur `fileName` comme chemin relatif repository ; seuls les documents dirty sont inclus ; leur contenu est sérialisé dans l'archive sans modifier leur état `dirty`. La preuve automatisée couvre notamment des chemins imbriqués et du contenu UTF-8.

**LW-ZIP-02** démontre l'intégration produit de la commande `Save Workspace Archive…`. Une première preuve navigateur a révélé que l'action définie dans `main.js` n'était pas transmise par `create-app.js` au toolbar réellement instancié ; le menu était donc visible mais son callback restait absent. La correction minimale consiste à transmettre `actions.onSaveWorkspaceArchive` à `createToolbar`. Après correction, la régression ciblée passe avec 4 fichiers de tests, 27 tests et 0 échec, et `git diff --check` reste silencieux.

La preuve navigateur finale part d'un Local Workspace chargé, modifie `processes/order.bpmn`, puis exécute `Save Workspace Archive…`. BPMNSM observe exactement un `RepositoryDocument` dirty et produit `BPMNSM-workspace.zip`. L'archive observée est valide (`unzip -t` sans erreur), contient exactement :

```text
processes/order.bpmn
```

et le contenu extrait correspond au BPMN modifié. Le SHA-256 de cet artefact de preuve est :

```text
a8347f4e48fec25bde6aa4d8c2cd283d48bd9ebb271c3fe961edc47222df69dc
```

LW-ZIP-02 établit donc la chaîne :

```text
RepositoryDocument dirty
  -> Save Workspace Archive…
  -> ZIP portable
  -> chemin repository relatif préservé
  -> contenu modifié préservé
```

Cette preuve porte sur la **sauvegarde** d'une Workspace Archive. Elle ne démontre pas à elle seule l'ouverture d'une archive dans une session fraîche, l'application automatique de l'archive à un worktree Git, ni l'équivalence canonique complète `Repository A -> archive -> Repository B ≡ A`. L'ouverture et la matérialisation sont éprouvées séparément par LW-ZIP-03 à LW-ZIP-05 ci-dessous ; l'application Git et l'équivalence canonique complète restent hors de la frontière démontrée.

### 47.8 Workspace Archive portable — LW-ZIP-03 / LW-ZIP-04 / LW-ZIP-05 démontrés

Les expériences LW-ZIP-03 à LW-ZIP-05 complètent la voie d'ouverture d'une Workspace Archive sans dépendre de la File System Access API. Elles réutilisent le modèle `RepositoryDocument` et le resolver de ressources déjà établis, sans introduire de backend ni déplacer les opérations Git dans BPMNSM.

**LW-ZIP-03** démontre la lecture d'une archive produite par le codec Workspace Archive BPMNSM. `readRepositoryWorkspaceArchive()` reçoit les octets du ZIP et restitue des ressources `{ path, content }` en préservant exactement le chemin relatif repository et le contenu UTF-8. La primitive vérifie notamment les bornes, le CRC32 et les signatures attendues. Sa frontière est volontairement étroite : elle lit le sous-ensemble ZIP actuellement produit par BPMNSM, avec entrées stockées/non compressées ; elle ne constitue pas une promesse de lecture de ZIP arbitraires ou de toutes les méthodes de compression ZIP. La régression ciblée de cette expérience passe avec 3 fichiers de tests, 8 tests et 0 échec.

**LW-ZIP-04** démontre la matérialisation des ressources lues vers le `RepositoryDocumentStore`. `materializeRepositoryResources()` réutilise `resolveRepositoryResourceKind()` ; pour chaque ressource reconnue, `fileName` reste exactement le chemin repository relatif, `content` reste le contenu lu et `dirty` vaut `false`. Les ressources `unknown` ne deviennent pas des `RepositoryDocument` et ne consomment pas d'identifiant. La stratégie d'identifiants reste fournie par l'appelant afin de préserver la sémantique existante de `createImportedDocumentId()` dans `main.js`. La preuve groupée passe avec 4 fichiers de tests, 9 tests et 0 échec ; `git diff --check` reste silencieux.

**LW-ZIP-05** démontre l'intégration produit de la commande editor-only `Open Workspace Archive…`. Le `createFileInput()` existant est étendu de façon additive avec un mode de lecture binaire `array-buffer` tout en conservant la lecture texte comme comportement par défaut. Le callback est transmis explicitement par `create-app.js` au toolbar. Le chemin d'ouverture devient :

```text
Open Workspace Archive…
  -> sélection d'un .zip
  -> ArrayBuffer / Uint8Array
  -> readRepositoryWorkspaceArchive()
  -> ressources { path, content }
  -> materializeRepositoryResources()
  -> RepositoryDocumentStore
  -> Repository Browser
```

Cette voie ne fait aucun appel à `showDirectoryPicker()` et ne crée aucun `FileSystemFileHandle` artificiel pour les documents provenant de l'archive. Les changements ultérieurs peuvent donc être transportés à nouveau par `Save Workspace Archive…`, tandis que l'accès direct au répertoire conserve sa capacité de sauvegarde physique lorsque l'environnement l'autorise.

La régression automatisée finale de LW-ZIP-05 passe avec 6 fichiers de tests, 25 tests et 0 échec ; `git diff --check` reste silencieux. Une première exécution des nouveaux tests `file-input` avait échoué avant toute lecture parce que le faux élément DOM du test n'exposait pas `style`. Le harness a été corrigé sans modification supplémentaire du code de production, puis la régression complète est devenue verte.

La preuve navigateur finale ouvre dans l'éditeur l'artefact `BPMNSM-workspace.zip` produit lors de LW-ZIP-02. Le log produit est cohérent avec l'archive :

```text
fileName: "BPMNSM-workspace.zip"
resourceCount: 1
resources: ["processes/order.bpmn"]
repositoryDocumentCount: 1
```

Le `RepositoryDocument` correspondant est matérialisé et rendu dans le Repository Browser. LW-ZIP-05 établit ainsi l'ouverture produit d'une Workspace Archive jusqu'au modèle repository, indépendamment de la disponibilité de `showDirectoryPicker()`.

L'architecture de workspace désormais démontrée comporte donc deux modes complémentaires de premier rang :

```text
Direct folder access
  -> File System Access API lorsque disponible
  -> lecture et sauvegarde physiques directes

Portable Workspace Archive
  -> sélection / téléchargement de ZIP
  -> aucune dépendance à showDirectoryPicker()
  -> transport des ressources repository

Git
  -> reste externe à BPMNSM
  -> application, commit, push et publication sous contrôle de l'utilisateur
```

Cette architecture reste compatible avec un déploiement statique/serverless : aucun backend applicatif n'est requis pour ces deux voies.

La frontière démontrée doit rester explicite. LW-ZIP-03 à LW-ZIP-05 ne démontrent pas encore :

- le chargement automatique d'un BPMN de l'archive dans le canvas ;
- la projection / registration BPMN équivalente à celle du Local Workspace ;
- le parsing et l'hydratation du Business Model depuis une archive ouverte ;
- l'équivalence fonctionnelle complète entre `Open Workspace Archive…` et `Local Workspace Inventory…` ;
- l'application automatique de l'archive à un worktree Git ;
- l'équivalence canonique complète `Repository A -> archive -> Repository B ≡ A` ;
- la lecture générale de ZIP arbitraires ou de méthodes de compression non produites par le codec BPMNSM.

Ces propriétés doivent être éprouvées par des expériences distinctes avant toute conclusion plus large. Cette capitalisation décrit un **Development Preview / Progress Demonstrator** ; elle n'introduit aucune release nominale et ne modifie pas les règles de `publication/versions.json` ou du runbook de publication.

### 47.9 Workspace Archive portable — LW-ZIP-06 / LW-ZIP-07 / LW-ZIP-08 démontrés

Les expériences LW-ZIP-06 à LW-ZIP-08 poursuivent l'équivalence fonctionnelle progressive entre l'accès direct au Local Workspace et l'ouverture d'une Workspace Archive. Elles extraient puis réutilisent l'activation du Business Model à partir de `RepositoryDocument` déjà matérialisés. Cette convergence reste indépendante de la File System Access API et n'introduit aucun backend.

**LW-ZIP-06** démontre une primitive d'activation du Business Model indépendante de l'origine des ressources : `activateRepositoryBusinessModel()`. À partir d'une collection de `RepositoryDocument`, elle accepte zéro ou un document `business-model`. En l'absence de Business Model, elle retourne `null` sans effacer les stores existants, conformément au comportement inline précédent. Avec un document, elle parse son `content` avec le codec canonique, remplace le contenu des Business Object et Business Relation stores et retourne `{ repositoryDocumentId, document }`. Plusieurs Business Models sont rejetés avant mutation des stores. La preuve automatisée couvre ces trois cas. La régression groupée observée pour l'expérience passe avec 4 fichiers de tests, 13 tests et 0 échec ; `git diff --check` reste silencieux.

**LW-ZIP-07** démontre que le chemin `Open Local Workspace…` réutilise cette primitive commune. Le parsing du Business Model, son contrôle d'unicité et l'hydratation BO/BR ne sont plus implémentés directement dans la séquence Local Workspace : après matérialisation des `RepositoryDocument`, `main.js` appelle `activateRepositoryBusinessModel()`, puis rafraîchit le Business Model Explorer lorsqu'un modèle est activé. La preuve navigateur montre que les trois Business Objects du workspace sont hydratés, dont `BO-LW11-PATH` (`demo:Path`) et `BO-LW11-APP` (`demo:Application`), et que la relation existante reste visible. Dans la même preuve, la projection BPMN préexistante du Local Workspace reste fonctionnelle : `Order Process` est sélectionné et son canvas contient la tâche démontrée précédemment. LW-ZIP-07 est donc une extraction/réutilisation du comportement existant, sans extension de la frontière fonctionnelle Local Workspace.

**LW-ZIP-08** démontre l'utilisation de la même activation depuis `Open Workspace Archive…`. Le chemin produit devient :

```text
Open Workspace Archive…
  -> readRepositoryWorkspaceArchive()
  -> ressources { path, content }
  -> materializeRepositoryResources()
  -> RepositoryDocument
  -> activateRepositoryBusinessModel()
  -> Business Object / Business Relation stores
  -> Business Model Explorer
  -> Repository Browser
```

La preuve navigateur utilise `BPMNSM_LW_ZIP_08_PROOF.zip`, SHA-256 :

```text
9502b28ecf0042c08f7ba8a68144924b81ffccc9fee033e3a4fda030e2356104
```

Cette archive contient exactement quatre entrées stockées/non compressées et non chiffrées :

```text
enterprise.business.json
processes/order.bpmn
processes/nested/secondary.bpmn
architecture/landscape.archimate
```

Le log `[Workspace Archive Opened]` observe `resourceCount: 4` et `repositoryDocumentCount: 4`. Les chemins sont conservés exactement et les kinds résolus sont respectivement `business-model`, `bpmn`, `bpmn` et `archimate`. Les quatre documents sont matérialisés avec `dirty: false`. `enterprise.business.json` devient `imported-1` et `loadedBusinessModelState.repositoryDocumentId` vaut `imported-1`. Le document activé contient 3 Business Objects et 1 Business Relation.

La preuve UI confirme dans la même session ouverte depuis l'archive que les trois Business Objects sont effectivement hydratés et visibles dans le Business Model Explorer : `BO-LW11-PATH` (`demo:Path`, 1 relation), `BO-LW11-APP` (`demo:Application`, 1 relation) et le troisième objet `demo:Application`. La ressource `architecture/landscape.archimate` est également visible dans l'Environment. La régression ciblée finale passe avec 4 fichiers de tests, 13 tests et 0 échec ; `git diff --check` reste silencieux.

LW-ZIP-06 à LW-ZIP-08 établissent donc la convergence suivante :

```text
Direct folder access
  -> RepositoryDocument
  -> activation commune du Business Model

Portable Workspace Archive
  -> ressources ZIP
  -> RepositoryDocument
  -> activation commune du Business Model
```

La frontière démontrée reste volontairement limitée. L'ouverture d'une Workspace Archive ne projette pas encore automatiquement ses BPMN dans le canvas et ne rejoue pas encore leur registration/projection runtime comme le Local Workspace. L'équivalence fonctionnelle complète entre les deux modes, l'application automatique à un worktree Git, l'équivalence canonique hétérogène complète et la lecture générale de ZIP arbitraires restent non démontrées.

Cette progression ne change pas le modèle d'exploitation : les deux modes de workspace restent de premier rang, Git reste externe et sous contrôle de l'utilisateur, et BPMNSM reste compatible avec un déploiement statique/serverless sans backend applicatif obligatoire.

### 47.10 Workspace Archive portable — LW-ZIP-09 / LW-ZIP-10 / LW-ZIP-11 démontrés

Les expériences LW-ZIP-09 à LW-ZIP-11 poursuivent la convergence fonctionnelle des deux modes de workspace sur la projection BPMN. Elles extraient la séquence déjà éprouvée du Local Workspace puis la réutilisent, sans dépendance à l'origine des `RepositoryDocument`.

**LW-ZIP-09** démontre la primitive commune `projectRepositoryBpmnDocuments()`. À partir de `RepositoryDocument` déjà matérialisés, elle filtre ceux de kind `bpmn`, conserve leur ordre d'entrée et, séquentiellement pour chacun, le rend actif dans le `RepositoryDocumentStore`, attend `diagramActions.loadDiagram(document.content)`, puis appelle `registerBpmnDocument()` sur les définitions courantes du modeler. Elle retourne `{ projectedBpmnDocuments, projectedBpmnComponents }`. Le cas zéro BPMN ne produit aucun effet ; le cas hétérogène vérifie l'ordre exact de deux BPMN, l'ignorance des documents non BPMN, l'agrégation des composants et le dernier BPMN actif. Cette primitive reproduit volontairement la sémantique existante de `loadDiagram()`, notamment son absence de transactionnalité supplémentaire. La preuve ciblée passe avec 2 fichiers de tests, 3 tests et 0 échec ; la régression workspace groupée passe avec 5 fichiers, 10 tests et 0 échec ; `git diff --check` reste silencieux.

**LW-ZIP-10** démontre que `Open Local Workspace…` réutilise `projectRepositoryBpmnDocuments()` à la place de sa boucle inline précédente, sans extension fonctionnelle. La preuve structurelle confirme la disparition de la boucle locale et l'appel de la primitive commune. La régression groupée passe avec 5 fichiers, 10 tests et 0 échec ; `git diff --check` reste silencieux. La preuve navigateur observe 6 ressources inventoriées, dont deux ressources inconnues non matérialisées, 4 `RepositoryDocument`, un Business Model activé avec 3 Business Objects et 1 Business Relation, ainsi que 2 `projectedBpmnDocuments` et 2 `projectedBpmnComponents`. L'Environment conserve les deux processus et la ressource ArchiMate. Les événements de sélection utilisateur postérieurs ne sont pas utilisés comme preuve de l'état actif immédiatement après la boucle ; l'ordre séquentiel et le dernier document actif restent couverts par LW-ZIP-09.

**LW-ZIP-11** démontre que `Open Workspace Archive…` utilise à son tour la même projection BPMN commune, après matérialisation et activation du Business Model et avant le rendu du Repository Browser. Le callback Archive devient asynchrone uniquement pour attendre cette primitive et son log expose les documents et composants projetés. La régression ciblée finale passe sous Node 22.22.2 avec 5 fichiers de tests, 10 tests et 0 échec ; `git diff --check` reste silencieux.

La preuve navigateur LW-ZIP-11 réutilise l'archive de preuve LW-ZIP-08 :

```text
BPMNSM_LW_ZIP_08_PROOF.zip
SHA-256 9502b28ecf0042c08f7ba8a68144924b81ffccc9fee033e3a4fda030e2356104
```

Le log `[Workspace Archive Opened]` observe exactement 4 ressources et 4 `RepositoryDocument` : `enterprise.business.json` (`business-model`, `imported-1`), `processes/order.bpmn` (`bpmn`, `imported-2`), `processes/nested/secondary.bpmn` (`bpmn`, `imported-3`) et `architecture/landscape.archimate` (`archimate`, `imported-4`), tous `dirty: false`. Le Business Model activé contient 3 Business Objects et 1 Business Relation. La projection commune retourne exactement 2 `projectedBpmnDocuments`, dans l'ordre `processes/order.bpmn` puis `processes/nested/secondary.bpmn`, et exactement 2 `projectedBpmnComponents` : `Order Process` puis `Local Workspace Process`.

LW-ZIP-09 à LW-ZIP-11 établissent donc la convergence suivante :

```text
Direct folder access
  -> inventaire / matérialisation
  -> RepositoryDocument
       -> activation commune du Business Model
       -> projection BPMN commune

Portable Workspace Archive
  -> ZIP -> ressources -> matérialisation
  -> RepositoryDocument
       -> activation commune du Business Model
       -> projection BPMN commune
```

Cette convergence ne constitue pas encore une équivalence fonctionnelle ou canonique complète des deux modes. Le mode Direct folder conserve ses `FileSystemFileHandle` et permet l'écriture physique directe ; le mode Portable Workspace Archive repose sur la production et le transport d'un ZIP. Le codec Archive reste limité au sous-ensemble BPMNSM démontré, notamment aux entrées stockées/non compressées produites par le codec courant. L'application automatique à un worktree Git, l'équivalence canonique hétérogène complète et les propriétés de round-trip encore ouvertes restent non démontrées. Git demeure externe et sous contrôle de l'utilisateur ; aucun backend applicatif n'est requis.

### 47.11 Itération de maturation — Workspace / Repository / Import sémantique

Cette section fixe le **prochain front de maturation** après LW-ZIP-11. Elle ne définit pas une release et ne constitue pas un gel fonctionnel. D'autres modifications et preuves pourront être requises avant toute décision de commit, push, tag ou publication. LW13 reste suspendu pendant cette itération.

Le modèle conceptuel cible est volontairement simple : **un Workspace ouvert donne accès à un Repository actif**. Le Repository est l'ensemble logique des documents et connaissances manipulés ensemble ; le Workspace est le mécanisme d'accès et de persistance de ce Repository. Dans la frontière de cette itération, `1 Workspace ouvert = 1 Repository actif`. Aucun multi-repository par Workspace n'est introduit sans cas d'usage et preuve distincts.

Les deux modes de Workspace restent de premier rang : **Direct Folder**, lorsque l'accès direct au système de fichiers est effectivement disponible, et **Portable Workspace Archive**, fondé sur l'ouverture et la sauvegarde d'une archive ZIP. L'interface doit détecter dynamiquement la disponibilité effective du mécanisme de sélection de dossier. Son absence ou sa désactivation ne constitue pas une erreur BPMNSM : le mode Archive reste une voie normale. Une page/modale `Open Workspace…` doit expliquer les deux modes avant toute sélection et illustrer le cycle Archive `ZIP -> BPMNSM -> édition -> Save Workspace Archive -> nouveau ZIP -> dépôt/Git`.

Le vocabulaire fonctionnel est également fixé : **Open Workspace** établit le Repository actif ; **Import into Repository** ajoute des documents et de la connaissance au Repository déjà actif. Avant le picker d'import, une page explicative doit annoncer la destination, les formats concernés, la conservation des références partielles et le mode de persistance. Un import ne doit pas rester un contenu temporaire sans ownership ni destination de sauvegarde définis.

Le `RepositoryDocument` demeure l'unité documentaire et de persistance. Un fichier BPMN contenant plusieurs `Process` et/ou `Collaboration`, notamment un export EA, doit pouvoir rester **un seul RepositoryDocument projetant plusieurs composants BPMN**. Aucun split implicite par processus ou collaboration n'est introduit dans cette itération ; une éventuelle transformation de split relèverait d'une fonction explicite et d'une preuve séparée.

La persistance des documents importés doit suivre le Workspace actif. Dans un Direct Folder, les nouveaux documents doivent disposer d'un chemin repository et d'une stratégie d'écriture dans le workspace. Dans un Archive Workspace, ils doivent être inclus dans la prochaine archive sauvegardée. Les règles précises de création/validation des chemins doivent être dérivées de l'architecture existante après inspection, et non inventées dans l'UI.

Le standalone fait partie de cette maturation. Les contenus d'aide et de contexte nécessaires à l'usage publié doivent être **embarqués dans l'artefact standalone** ou rendus accessibles par un mécanisme autonome équivalent. Le standalone ne doit pas exposer de liens vers des pages HTML absentes de l'artefact. Les nouvelles explications Workspace et Import doivent privilégier le même mécanisme intégré afin de préserver le déploiement statique/serverless.

L'ordre de travail est :

```text
inspection ciblée du worktree réel
  -> contrat réel RepositoryDocument / composants / références sémantiques
  -> expériences minimales d'import partiel et de résolution
  -> ownership, chemins et persistance des imports
  -> UX Open Workspace / Import into Repository / Save Workspace
  -> autonomie du standalone et contenus explicatifs embarqués
  -> scénario navigateur intégré
  -> capitalisation
  -> décision sur l'itération suivante
```

Les critères d'acceptation minimaux de cette itération sont : standalone sans liens contextuels morts ; détection dynamique de Direct Folder ; workflow Folder/Archive compréhensible ; distinction explicite Open/Import ; import rattaché au Repository actif avec persistance définie ; conservation d'un BPMN multi-process/collaboration comme document unique à composants multiples ; acceptation sans perte d'une référence sémantique non résolue ; préservation de cette référence après sauvegarde/réouverture ; résolution ou enrichissement ultérieur lorsque l'identité le permet ; absence d'écrasement silencieux en cas d'ambiguïté ou de contradiction.

Cette cible ne change pas les règles de publication : Git reste externe et sous contrôle utilisateur, aucun backend applicatif n'est requis, et aucune conclusion de maturité de release ne peut être tirée de la seule clôture de cette itération.


### 47.12 Capitalisation démontrée — maturation M1 à M3

La campagne de maturation M1 à M3 est **démontrée dans les frontières ci-dessous**. Cette capitalisation clôt l'itération définie en 47.11 ; elle ne constitue ni une release, ni un gel fonctionnel, ni une autorisation de commit, push, tag ou publication.

Le contrat conceptuel est désormais éprouvé : **un Workspace ouvert donne accès à un Repository actif**. Le Workspace porte le mécanisme d'accès et de persistance ; le Repository reste le contenu logique. L'éditeur expose en conséquence une seule hiérarchie d'actions de premier niveau, `Workspace`. Le vocabulaire utilisateur final démontré est organisé par intention : `Open Workspace Folder…`, `Open Workspace Archive…`, `Import BPMN…`, `Import ArchiMate…`, `Save Workspace Folder`, `Save Workspace Archive…`. Les anciennes intentions concurrentes `New Repository`, `Open Repository BPMN…` et `Assemble into Repository…` ne sont plus exposées dans ce menu. Le concept Repository reste utilisé dans le modèle et pour désigner le contenu logique ; il n'est plus présenté comme une seconde manière concurrente d'ouvrir, importer ou sauvegarder.

La capacité Direct Folder est centralisée et testable. La configuration conceptuelle `workspaceFolderAccess` admet `auto`, `enabled` et `disabled`. `auto` utilise Direct Folder lorsque l'API nécessaire est disponible ; `disabled` impose le workflow Archive même sur un navigateur capable ; `enabled` demande Direct Folder mais ne contourne jamais une absence d'API ou une restriction d'environnement. La matrice déterministe couvre API disponible/absente ainsi que le refus à l'exécution. Une indisponibilité ne transforme pas Archive en mode dégradé : Portable Workspace Archive reste un mode de premier rang. La preuve navigateur de cette campagne a été effectuée dans un environnement où le picker existe et est autorisé ; les états sans picker ou désactivés sont démontrés par injection/test de capability, pas par une machine Enterprise réellement bridée.

La persistance Archive est également consolidée : la sauvegarde sérialise l'état du Repository destiné à l'archive, y compris les documents importés, puis la réouverture rematérialise cet état. La campagne M3 démontre en particulier la persistance sémantique progressive `unresolved -> save archive -> reopen -> unresolved -> import de l'identité correspondante -> resolved/enriched`, sans duplication de l'identité concernée dans le scénario éprouvé.

Le contrat documentaire BPMN est démontré séparément : **un fichier BPMN physique reste un seul `RepositoryDocument` et peut projeter plusieurs composants portant le même `documentId`**. Aucun split physique implicite n'est introduit par la projection multi-composants.

La preuve groupée finale de M3 FIX2 exécute 13 fichiers de tests / 46 tests avec succès, incluant capability Workspace, accumulation sémantique, import progressif, persistance sémantique Archive, projection BPMN multi-composants et régressions Workspace/BM/BPMN sélectionnées. Les contrôles syntaxiques et `git diff --check` sont silencieux. Le contrôle navigateur confirme l'UX à menu Workspace unique.

Les frontières restent explicites. Cette campagne ne démontre pas encore une équivalence canonique complète entre Direct Folder et Archive pour tout repository hétérogène ; elle ne qualifie pas un environnement Enterprise réel où File System Access serait administrativement bloqué ; elle ne démontre pas encore toutes les règles de création de nouveaux chemins physiques dans Direct Folder ; elle ne ferme pas les questions multi-document de `BusinessObjectRepresentation`, de d'Identity Origins/identités externes ou d'ownership canonique complet entre BPMN enrichi et Business Model autonome. Le standalone et la publication restent soumis à leurs preuves et runbooks propres. Git demeure externe et sous contrôle de l'utilisateur ; aucun backend applicatif n'est requis.

LW13 reste suspendu. La prochaine itération doit être choisie à partir de ces frontières restantes, et non relancer automatiquement la séquence historique.

### 47.13 Capitalisation démontrée — M3.1 FIX1, contenus contextuels standalone

M3.1 FIX1 est **[IMPLÉMENTÉ + DÉMONTRÉ]** pour la frontière suivante :
les contenus contextuels proposés depuis la page d'accueil des distributions
standalone Viewer et Editor sont disponibles sans dépendre de fichiers HTML
`presentations/*.html` voisins.

Les quatre présentations concernées sont `Interoperability of Meaning`,
`BPMNSM`, `ArchiCG` et `Strategic Standards Radar`. Les sources HTML séparées
restent disponibles pour les distributions web ; leur contenu est également
embarqué dans le bundle applicatif pour l'usage standalone.

Le comportement standalone démontré est le suivant :

1. une carte de contexte ouvre la présentation complète dans une boîte de
   dialogue interne ;
2. le document embarqué reste autonome vis-à-vis des pages HTML voisines ;
3. les liens d'ancre internes `#...` sont traités dans le document embarqué
   et naviguent vers la section cible sans renvoyer vers la page BPMNSM ;
4. la fermeture de la boîte de dialogue restitue l'accueil.

La première expérience M3.1 avait validé l'ouverture des pages de premier
niveau mais avait falsifié la navigation interne : les menus associés
pouvaient renvoyer vers BPMNSM. FIX1 a corrigé cette frontière, puis la
preuve a été répétée.

Preuves automatisées finales :

- builds `standalone-viewer` et `standalone-editor` réussis ;
- logique d'interception/navigation interne présente dans les deux artefacts ;
- absence de référence locale vers `presentations/*.html` dans les deux
  standalone ;
- `git diff --check` silencieux.

Preuve navigateur finale : les quatre présentations ont été exercées avec
succès et leurs menus internes restent dans leur présentation.

Cette preuve ne doit pas être élargie abusivement : elle établit l'autonomie
des contenus contextuels de l'accueil vis-à-vis de fichiers HTML voisins,
pas l'absence de toute dépendance réseau interne aux présentations. Les
avertissements de build préexistants relatifs à PostCSS, aux SVG non inline
et à `eval` dans `archimate-js` ne sont pas requalifiés par M3.1.

M3.1 ne modifie pas le statut de publication et ne reprend pas LW13.

### 47.14 Capitalisation démontrée — M4, persistance Direct Folder des nouveaux imports

M4 est **[IMPLÉMENTÉ + DÉMONTRÉ]** pour la persistance des nouveaux
`RepositoryDocument` importés dans un Workspace Folder actif.

Le comportement retenu est volontairement transactionnel au niveau de
l'intention utilisateur : `Import BPMN…` ou `Import ArchiMate…` ajoute le
document au Repository actif et le marque dirty en mode Workspace persistable ;
aucun fichier vide n'est créé à l'import. `Save Workspace Folder` matérialise
ensuite les documents dirty qui ne disposent pas encore de handle physique.

Le chemin de matérialisation est `RepositoryDocument.fileName`, interprété
comme chemin relatif au Workspace. Le résolveur dédié parcourt/crée les
répertoires intermédiaires et le fichier final. Il rejette les chemins absolus,
les segments vides, `.` et `..`, les antislashs et NUL afin de ne pas sortir de
la racine logique du Workspace.

Après écriture, BPMNSM relit le fichier et exige l'égalité exacte avec
`RepositoryDocument.content` avant de marquer le document clean. La
matérialisation échouée reste explicitement un échec de Save.

Preuves automatisées : 9/9 tests ciblés du résolveur de handle ; campagne
Workspace groupée de 5 fichiers / 22 tests, tous verts. La preuve navigateur
réelle a confirmé avec File System Access API : BPMN absent du dossier avant
Import, présent dans le Repository mais toujours absent physiquement avant
Save, créé après `Save Workspace Folder`, puis retrouvé et utilisable après
réouverture du même Workspace Folder.

La preuve navigateur a aussi falsifié puis permis de corriger le dispatch des
imports après migration du menu principal vers `Workspace`. Le toolbar doit
reconnaître `workspace:import-environment` et
`workspace:import-archimate-environment` ; un test de non-régression couvre ces
deux cibles. Ce FIX est une correction de wiring UI, distincte du mécanisme de
persistance M4 mais nécessaire à sa preuve end-to-end.

Frontières : la preuve navigateur porte sur un fichier BPMN créé à la racine ;
les chemins imbriqués sont couverts automatiquement. M4 ne démontre ni
équivalence canonique hétérogène complète Folder/Archive, ni environnement
Enterprise réellement bloqué, ni résolution des frontières
`BusinessObjectRepresentation` multi-document, Identity Origins/identités externes ou ownership canonique complet.

LW13 reste suspendu. Cette capitalisation ne change pas le statut de
publication et n'autorise aucun commit, push, tag, release ou publication.


### 47.15 Capitalisation démontrée — M5, état canonique de session des identités

M5 est **[IMPLÉMENTÉ + DÉMONTRÉ]** pour l'activation et la persistance en
session des quatre collections du Business Model : `identityOrigins`,
`businessObjects`, `businessRelations` et
`businessObjectExternalIdentities`.

L'application dispose désormais d'un store actif pour les Identity Origins et
instancie le store d'identités externes déjà défini par le modèle. L'activation
d'un Business Model hydrate les quatre stores et remplace leur état précédent.
La synchronisation reconstruit ensuite le document physique depuis ces quatre
stores actifs ; elle ne dépend plus d'une recopie des collections d'identité
du snapshot initial.

La preuve ciblée M5 est verte sur 9 fichiers / 44 tests. La régression groupée
M1–M5 couvre 18 fichiers / 86 tests, tous verts, avec syntaxe valide et
`git diff --check` silencieux. Le contrôle navigateur valide le cycle intégré
Folder `Open -> activation -> mutation -> Save -> reopen`.

Cette tranche ne crée aucune UI spécifique d'édition des identités et ne
change pas le statut de publication. Elle ne démontre pas l'équivalence
canonique hétérogène complète Folder/Archive, un environnement Enterprise
réellement bloqué, l'ownership canonique complet des enrichissements, ni la
frontière multi-document de `BusinessObjectRepresentation`.

Les exemples antérieurs d'éléments « blancs » fondés sur une technologie de
graphe particulière ne constituent pas une exigence produit BPMNSM. Ils sont
retirés de la cible de maturation ; le principe générique demeure qu'une
information absente ou incomplète ne suffit pas à qualifier une référence
d'`unresolved`.

LW13 reste suspendu. Aucun commit, push, tag, release ou publication n'est
autorisé par cette capitalisation.

### 47.16 Capitalisation démontrée — M6, qualification documentaire des représentations

M6 est **[IMPLÉMENTÉ + DÉMONTRÉ]** pour la coexistence de
`BusinessObjectRepresentation` issues de plusieurs documents BPMN d'un même
Repository.

`representationId` reste une référence BPMN locale au modèle concerné et
n'acquiert aucune unicité globale. Le contexte Repository est porté dans
l'état canonique par `documentId` lorsque la représentation est projetée depuis
un `RepositoryDocument`. Ce contexte n'est pas ajouté à la sérialisation
SemArch du BPMN.

La projection commune des BPMN du Repository transporte désormais le
`RepositoryDocument` jusque dans la projection des représentations. Les chemins
runtime Workspace Folder et Workspace Archive fournissent les stores
Business Object / Business Object Representation à cette projection ; Open
Repository fournit également son document courant.

La séquence de preuve comprend RED/GREEN du store, RED/GREEN de l'orchestration,
vérification du wiring runtime, puis régression groupée de 18 fichiers /
83 tests tous verts et `git diff --check` silencieux.

Deux preuves navigateur ferment les deux modes Workspace. La fixture contient
`process-a.bpmn` et `process-b.bpmn`, chacun avec
`BO_PERSISTENCE_PROOF / DataStore_1ici771`. En Folder comme en Archive, le
store canonique expose deux entrées distinctes, qualifiées respectivement par
les deux `documentId` du Repository.

M6 ne démontre pas une équivalence canonique hétérogène complète de toutes les
ressources, ne change pas le statut de publication et ne relance pas LW13.

### 47.17 Capitalisation démontrée — TECH-INSPECT-01 Technical Inspector / Repository Query

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ]**.

Une façade read-only `technicalIntrospection` sépare désormais l'observation de
l'état canonique des API mutables. L'Inspector consomme cette façade et non
`window.semarchApp` ou les stores. La globale reste un escape hatch développeur
et permet aussi l'accès à `window.semarchApp.technicalIntrospection`.

L'Inspector est piloté par un catalogue extensible (`getSources()` /
`addSource()`). Les six sources démontrées sont Repository Documents, Business
Objects, Business Object Representations, Business Relations, Identity Origins
et Business Object External Identities. Ce nombre décrit le checkpoint courant :
le catalogue doit évoluer avec les nouvelles structures canoniques significatives
du design après décision explicite d'inspectabilité, sans auto-exposer les
structures JavaScript internes ou transitoires.

La surface V1 reste tabulaire avec filtre structuré par égalité. Le contenu brut
des Repository Documents reste disponible par API mais n'est pas une colonne de
table. Les résultats de lint restent hors du premier catalogue. Aucune mutation,
édition, exécution JavaScript, SQL/SPARQL, jointure générique, requête sauvegardée,
export, graphe ou requête ArchiMate/lint n'est introduit.

La preuve runtime M6 retrouve les deux représentations
`BO_PERSISTENCE_PROOF / DataStore_1ici771` avec `documentId` distincts et expose
également la relation réelle `BO-LW11-PATH --demo:aggregation--> BO-LW11-APP`.
Les six sources sont consultables, y compris les deux collections d'identité
vides. La toolbar place `Technical -> Inspector…` à droite, séparé des commandes
fonctionnelles. Les tests ciblés/régressions et les builds viewer, editor et pages
sont verts ; `git diff --check` est silencieux.

TECH-INSPECT-01 n'est pas M7. LW13 reste suspendu. Le statut de publication
demeure Development Preview / Progress Demonstrator ; aucun commit, push, tag,
release ou publication n'est autorisé par cette capitalisation.
---

## Cible complémentaire décidée — Catalogue des publications — 2026-09-22

### Problème utilisateur

L'historique des déploiements GitHub Pages ne constitue pas, à lui seul, un
catalogue compréhensible des versions BPMNSM publiées. Le fait que plusieurs
snapshots soient conservés sous des chemins distincts ne suffit pas si
l'utilisateur doit connaître un SHA ou explorer la branche de publication pour
les retrouver.

### Cible

Le dispositif de publication doit fournir des points d'accès explicites et
navigables permettant de distinguer au minimum :

```text
current/               état courant publié
previews/<id>/         previews / itérations persistantes et identifiables
releases/<version>/    releases identifiées, lorsqu'elles existent
```

La convention exacte des chemins reste à confronter à l'implémentation réelle
avant modification.

Un **catalogue humain de publication** doit permettre de retrouver les états
publiés pertinents avec des métadonnées suffisantes (identifiant/version,
date ou checkpoint lorsque disponible, nature de la publication et lien
d'accès).

Cette cible ne signifie pas que chaque snapshot doit devenir un environnement
GitHub Pages distinct. Elle sépare :

- le déploiement du site Pages ;
- les artefacts/états persistants servis par ce site ;
- le catalogue utilisateur permettant de les découvrir et de les partager.

Toute évolution doit préserver le caractère statique/serverless de la cible et
le contrôle utilisateur explicite de Git, des releases et de la publication.


---

### Articulation avec le workplan courant — 2026-09-22

La séquence opérationnelle et les gates ne sont pas définies par l'ordre historique des sections de ce document. Elles sont centralisées dans `BPMNSM_WORKPLAN.md`. Au checkpoint courant, Workspace Tree + Search E1 est le premier incrément planifié ; les autres cibles de ce document restent ouvertes selon les frontières qui leur sont propres. Cette référence ne change aucun statut de preuve historique.

## Addendum — W2UI interaction design discipline — 2026-09-22

The configuration/workspace UI target must exploit W2UI 2 at macro-component level. Interaction design starts from the user intent and evaluates native W2UI widget composition before custom DOM behavior.

`BPMNSM_W2UI_2_FUNCTIONAL_MAP.md` is the technical companion for this purpose. It does not change Workspace, Source, Repository, configuration or publication semantics; it constrains how their interactive projections should be designed and evidenced.

Candidate use of a W2UI component remains `BPMNSM-HYP` until checked against official W2UI documentation/examples and the relevant BPMNSM semantic target.

## 48. Workspace identity et snapshots portables — checkpoint 2026-09-25

### 48.1 Identité du Workspace

Le Workspace possède désormais une identité logique persistée dans `.bpmnsm/workspace.json`, commune au mode Archive et au mode Direct Folder lorsqu'elle est matérialisée. Cette identité n'est ni l'identité Git, ni le nom du dossier physique, ni le nom final d'un fichier téléchargé.

Le schéma courant est :

```json
{
  "format": "bpmnsm-workspace",
  "formatVersion": 2,
  "workspaceId": "<stable-id>",
  "createdAt": "<timestamp>",
  "savedAt": "<timestamp>",
  "name": "<logical-workspace-name>",
  "snapshotIteration": 2
}
```

`workspaceId` identifie le Workspace logique dans la frontière démontrée. `name` est son nom logique portable. `createdAt` reste stable dans les scénarios de sauvegarde/réouverture démontrés. `savedAt` décrit la sauvegarde représentée par le manifeste.

Le passage du schéma 1 au schéma 2 est une migration sémantique : l'ancien champ `workspaceVersion` ne représentait pas correctement une version globale du Workspace. Le lecteur accepte encore un manifeste `formatVersion: 1` valide et projette `workspaceVersion` vers `snapshotIteration`; les nouveaux manifestes sont écrits avec `formatVersion: 2`.

### 48.2 Snapshot et itération

Une archive ZIP portable sauvegardée est appelée **Workspace snapshot**. `snapshotIteration` est le numéro d'itération du snapshot dans la lignée ouverte au moment de la sauvegarde. Il ne constitue pas une version globale, un numéro de révision Git, ni un identifiant unique de snapshot.

Le nom d'archive demandé par BPMNSM suit :

```text
<workspace-name>-iNNN.zip
```

Le nombre `NNN` reflète `snapshotIteration`. Cette convention améliore la lisibilité mais ne transforme pas l'itération en ordre global.

Le branchement est valide. Exemple :

```text
i001 -> i002-A
  \
   -> i002-B
```

Si `i002-A` a déjà été téléchargé et qu'un second snapshot `i002-B` demande le même nom physique, le navigateur peut créer `workspace-i002 (1).zip`. Le suffixe `(1)` appartient exclusivement au mécanisme anti-écrasement du navigateur. Il n'est ni lu ni interprété comme métadonnée BPMNSM.

Il est donc incorrect de déduire « le plus récent » à partir du seul nom de fichier physique. Lorsque plusieurs copies existent, l'utilisateur ou un outil doit inspecter le manifeste ; `savedAt` peut distinguer les instants de sauvegarde observés, sans établir à lui seul une sémantique globale de branche ou de parenté qui n'est pas modélisée.

### 48.3 Preuve

Le contrat automatisé final de cette tranche exécute **8 fichiers / 31 tests GREEN**. La migration de schéma, le nommage et la sémantique navigateur sont couverts par les tests ciblés. Le build Viewer/Editor/Pages est GREEN dans le gate associé.

La preuve produit Chrome démontre :
- un manifeste v2 à `snapshotIteration: 1` ;
- une sauvegarde suivante demandant `workspace-i002.zip` avec manifeste `snapshotIteration: 2` ;
- la stabilité de `workspaceId` et `createdAt` dans la lignée démontrée ;
- la progression de `savedAt` ;
- la réouverture d'un ancien `i001` puis la création légitime d'un second `i002` ;
- la matérialisation physique de ce second téléchargement sous `workspace-i002 (1)` par le navigateur, alors que le manifeste interne reste `snapshotIteration: 2`.

Qualification : **[IMPLEMENTED + TARGETED TESTED + BUILD GREEN + DEMONSTRATED IN BROWSER]**.

Cette preuve n'introduit ni registre global des snapshots, ni graphe de parenté, ni identifiant canonique de snapshot distinct de l'identité Workspace. Ces capacités restent hors du claim courant.
