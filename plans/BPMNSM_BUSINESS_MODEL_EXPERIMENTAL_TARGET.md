# BPMNSM --- Business Model Experimental Target

**Statut : CIBLE LOGIQUE EXPÉRIMENTALE ET REGISTRE DE PREUVES --- 2026-09-18**

> Ce document sérialise la cible logique Business Model à éprouver par l'implémentation.
> Il ne remplace ni `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`, ni le Project Context,
> ni le Handover. Il sert de registre vivant pour les hypothèses, expériences, preuves et
> conséquences architecturales relatives au Business Object, à sa contextualisation, à ses
> propriétés, à ses représentations BPMN et aux relations métier.
>
> Le dépôt réel reste l'autorité pour le code exact. Une abstraction décrite ici n'est pas
> considérée implémentée tant qu'une inspection ou une démonstration explicite ne l'établit pas.

---

## 1. Statuts de preuve

Ce document utilise exclusivement les statuts suivants :

- **[IMPLÉMENTÉ + DÉMONTRÉ]**
- **[DÉMONTRÉ PAR INSPECTION]**
- **[NON IMPLÉMENTÉ]**

Une cible conceptuelle ou une hypothèse n'acquiert pas un statut d'implémentation par sa seule présence dans ce document.

---

## 2. Invariants directeurs

1. BPMN 2.0 XML reste le langage pivot.
2. Ce que BPMN sait exprimer correctement reste une construction BPMN native.
3. SemArch/CoC enrichit BPMN ; il ne le remplace pas.
4. `UNRESOLVED ≠ INVALID`.
5. La persistance source et la publication dérivée restent distinctes.
6. Le Viewer consomme l'artefact publié sans résoudre un `ProfileRuntime` pour republier.
7. `ProfileRuntime` détermine quelles propriétés existent ou sont résolubles.
8. `BusinessView` détermine quelles propriétés sont projetées pour une vue/stakeholder.
9. `BusinessView = null` signifie absence de filtrage Business View.
10. `Business Object identity ≠ semarch:stableGuid ≠ BPMN element id ≠ RepositoryComponent.id`.
11. Une abstraction supplémentaire n'est introduite qu'après un besoin produit observable.
12. La localisation physique d'une information — BPMN particulier, dérivation multi-BPMN ou artefact repository — doit être déterminée par l'expérience, et non par préférence architecturale.

---

## 3. Business Object canonique

La cible logique conserve un Business Object canonique minimal :

```text
BusinessObject
    id
    typeRefs[] 1..n
```

Le Business Object porte l'identité métier canonique et partageable.

Il ne porte pas intrinsèquement les propriétés contextualisées d'un CoC ou d'un stakeholder.

Le checkpoint 2026-09-18 démontre un `BusinessObject` avec `id` et `typeRefs[] 1..n`, indépendant des identités de représentation BPMN, ainsi qu'un `BusinessObjectStore`.

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Le BO canonique doit pouvoir être le même objet à travers plusieurs contextes :

```text
                         BO-Aircraft-001
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        contexte A       contexte B       contexte C
```

La contextualisation ne doit pas dupliquer l'identité métier.

---

## 4. Contextualisation : BO, CoC, stakeholder et Viewpoint logique

La cible distingue l'identité canonique du BO de sa caractérisation dans un contexte.

Conceptuellement :

```text
BusinessObject + contexte
        │
        ▼
vue contextualisée du BusinessObject
```

Le contexte peut notamment être déterminé par un CoC et/ou un stakeholder selon les mécanismes déjà présents dans BPMNSM.

Le terme **Viewpoint** est utilisé ici au niveau logique pour désigner cette contextualisation, mais il ne crée pas à ce stade une nouvelle classe `BusinessObjectViewpoint`.

La documentation BPMNSM existante distingue explicitement :

```text
BusinessView
    projection de propriétés pour stakeholder

ProjectionProfile
    stratégie structurelle de projection

Viewpoint/View cible
    concerns / purpose / stakeholder plus généraux
```

Il ne faut donc pas déclarer prématurément :

```text
BusinessView == BusinessObjectViewpoint
```

ni :

```text
ProjectionProfile == Viewpoint
```

E4c démontre qu'une contextualisation minimale des propriétés peut être dérivée à partir du BO canonique : le même `BusinessObject`, via ses `typeRefs[]`, produit des descripteurs de propriétés différents sous deux `ProfileRuntime`, sans représentation BPMN et sans objet `BusinessObjectViewpoint` explicite.

Cette preuve ne détermine pas encore si des valeurs contextualisées, Object Properties, besoins de navigation ou autres informations futures nécessiteront une abstraction runtime ou persistée dédiée.

Contextualisation minimale dérivée pour les descripteurs de propriétés : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Statut d'une abstraction explicite `BusinessObjectViewpoint` : **[NON IMPLÉMENTÉ]**

---

## 5. ProfileRuntime et BusinessView

Les responsabilités existantes restent séparées.

```text
ProfileRuntime
    quelles propriétés existent / sont résolubles

BusinessView
    lesquelles sont projetées pour une vue/stakeholder
```

La cible logique est donc :

```text
BusinessObject
      +
   contexte
      │
      ▼
vue contextualisée
      │
      ├── ProfileRuntime
      │      détermine les propriétés applicables/résolubles
      │
      └── BusinessView
             sélectionne propertyRefs[]
                    │
                    ▼
             projection consommable
```

`BusinessView` reste une primitive versionnée indépendante du `ProfileRuntime`.

La sélection actuelle d'une Business View pour un stakeholder ne justifie pas l'ajout par symétrie de `businessViewRef` dans `CoCConfiguration`.

---

## 6. Propriétés contextualisées

Les propriétés métier contextualisées ne doivent pas être ajoutées directement au `BusinessObject` canonique.

La cible logique est :

```text
BusinessObject BO-A
        │
        ├── contexte A
        │      │
        │      └── propriétés contextualisées
        │
        └── contexte B
               │
               └── propriétés contextualisées
```

Ainsi, le même BO peut exposer des ensembles de propriétés différents selon le contexte sans duplication de son identité.

E4c démontre ce principe au niveau de la résolution des descripteurs : `BusinessObject.typeRefs[]` peut être fourni comme `semanticTypeRefs` au moteur existant, et le même BO produit des propriétés différentes sous les `ProfileRuntime` expérimentaux A et B. Le BO conserve le même `id` et les mêmes `typeRefs[]`.

Cette preuve porte sur la dérivation des propriétés applicables/résolubles ; elle ne démontre ni l'édition/persistance de valeurs contextualisées, ni le raccord via une représentation BPMN.

Statut de cette dérivation BO → ProfileRuntime → descripteurs : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Le format de `BusinessView` reste fondé sur `propertyRefs[]`.

La propriété normalisée générique dispose déjà conceptuellement des hooks :

```text
id
kind
targetType
minOccurs
maxOccurs
```

Le runtime actuellement documenté produit des propriétés `kind = data`.

Les object properties génériques restent **[NON IMPLÉMENTÉ]** tant que le dépôt réel ne démontre pas un état plus récent.

---

## 7. Data Properties

Une Data Property relie la vue contextualisée du BO à une valeur.

```text
View(BO-A, contexte X)
        │
        └── mass ─────► 12500
```

La cible ne crée pas un nouveau mécanisme de valeurs.

Elle doit réutiliser la normalisation, la résolution, la persistance et la projection SemArch existantes lorsque celles-ci conviennent.

Question à éprouver :

> Lorsque le Properties Panel manipule une propriété d'une représentation BPMN reliée à un BO, cette propriété peut-elle être comprise et résolue comme propriété de la vue contextualisée du BO sans être recopiée dans le BO canonique ?

---

## 8. Object Properties

Une Object Property relie une vue contextualisée d'un BO à un autre objet métier.

```text
View(BO-Aircraft, contexte Avionics)
        │
        └── hasEngine ─────► BO-Engine
```

La cible privilégiée est que la référence métier aboutisse à l'identité canonique du BO cible, et non à la seule identité d'une représentation BPMN.

Cette cible doit être éprouvée sur une propriété réelle issue des modèles/profils du projet.

Statut du raccord générique Object Property → BusinessObject : **[NON IMPLÉMENTÉ]**

---

## 9. Graphe métier contextualisé

Les Object Properties peuvent déjà constituer un graphe métier contextualisé :

```text
BO-Aircraft
    │
    │ contexte X / hasEngine
    ▼
BO-Engine
    │
    │ contexte X / hasPart
    ▼
BO-Part
```

Avant d'introduire une abstraction `BusinessRelation`, il faut déterminer expérimentalement jusqu'où les Object Properties couvrent les besoins de relations entre BO.

Une Object Property et une future Business Relation ne sont donc pas déclarées équivalentes a priori.

---

## 10. Représentation BPMN du Business Object

La contextualisation et la représentation sont deux axes orthogonaux.

```text
                         BusinessObject
                              │
              ┌───────────────┴───────────────┐
              │                               │
       CONTEXTUALISATION                REPRESENTATION
              │                               │
              ▼                               ▼
        contexte / vue               BPMN construction
```

Le modèle actuellement inspecté possède :

```text
BusinessObjectRepresentation
    businessObjectId
    representationId
```

et un store séparé du `BusinessObjectStore`.

Statut de la séparation BO / représentation : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Le store de représentations autorise plusieurs représentations explicites d'un même BO.

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Le checkpoint 2026-09-18 démontre également la persistance des Business Objects et des liens BO ↔ représentation dans le repository BPMN courant, leur reprojection dans les stores à l'ouverture et la restauration du lien après réouverture.

Cette preuve concerne le vertical repository BPMN courant ; elle ne démontre pas encore le cas d'un BO sans représentation ni l'architecture d'un repository distribué.

---

## 11. Représentation BPMN et occurrence BPMN

Lorsque BPMN fournit nativement une distinction entre objet et occurrence, BPMNSM doit la préserver.

Exemples déjà documentés :

```text
DataStore    ← dataStoreRef ─ DataStoreReference
DataObject   ← dataObjectRef ─ DataObjectReference
```

La cible ne généralise pas ce pattern à toutes les constructions BPMN.

Un `Participant`, par exemple, ne doit pas recevoir artificiellement un niveau d'occurrence symétrique sans preuve BPMN spécifique.

Principe :

```text
Business Object
      ↓ represented by
BPMN Representation
      ↓ occurrence seulement lorsque BPMN le justifie
BPMN Occurrence
```

---

## 12. BO contextualisé sans représentation BPMN

La contextualisation doit être conceptuellement indépendante de l'existence d'une représentation BPMN.

Cible à éprouver :

```text
BusinessObject BO-A
        │
        └── contexte X
              │
              └── propriétés contextualisées

Representations: 0
```

Un BO sans représentation doit donc pouvoir, si le mécanisme de contextualisation le permet, être listé et inspecté dans le même espace Business que les BO représentés.

Il ne faut pas créer un catalogue séparé pour les BO autonomes.

Persistance/reprojection du BO canonique avec zéro lien de représentation : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Listage du BO avec zéro représentation dans le Business Objects Browser : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Résolution de descripteurs contextualisés sans représentation : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Inspection contextualisée du BO depuis le Browser : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Statut de bout en bout : **[IMPLÉMENTÉ + DÉMONTRÉ]**

---

## 13. Plusieurs représentations, une seule identité métier

Plusieurs représentations du même BO ne doivent pas créer plusieurs identités métier.

```text
                      BO-A
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
         BPMN E1    BPMN E2    BPMN E3
```

La question à éprouver est également celle des propriétés :

> Deux représentations du même BO dans le même contexte conduisent-elles à la même vue contextualisée du BO, ou le système actuel attache-t-il encore les valeurs à chaque représentation ?

Cette question doit être résolue par inspection et expérience avant toute migration de données ou modification de `semarch.json`.

---

## 14. Relations métier et relations BPMN

Une relation métier peut potentiellement être représentée par une relation BPMN.

```text
ESPACE MÉTIER

BO-A ───── relation R ─────► BO-B

ESPACE BPMN

Element-A ─ BPMN relation X ─► Element-B
```

Si BPMN exprime correctement la relation, la construction BPMN native doit être privilégiée.

SemArch peut l'enrichir lorsque nécessaire.

Il ne faut donc pas définir `BusinessRelation` comme simple substitut générique aux relations BPMN.

Statut de la faisabilité technique d'un modèle explicite `BusinessRelation` : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Statut de sa nécessité architecturale : **[NON IMPLÉMENTÉ]**

---

## 15. BusinessRelation : abstraction conditionnelle

Une `BusinessRelation` ne sera justifiée que si une expérience démontre un besoin métier observable qui ne peut être correctement couvert par :

1. une Object Property contextualisée ;
2. une relation BPMN native éventuellement enrichie ;
3. une information dérivable des modèles existants.

Une future relation métier pourrait éventuellement posséder :

```text
identity
source BusinessObject
target BusinessObject
type
contextualisation
properties
BPMN representation(s)
```

mais aucun de ces champs ne doit être introduit par symétrie tant qu'un cas produit ne l'exige pas.

Statut : **[NON IMPLÉMENTÉ]**

---

## 16. Frontière BPMN / dérivation / repository

Le modèle logique ne détermine pas encore le lieu physique de chaque information.

Chaque expérience doit classer l'information observée dans l'une des catégories suivantes :

```text
INFORMATION
    │
    ├── portée correctement par un BPMN particulier
    │
    ├── dérivable d'un ou plusieurs BPMN
    │
    └── complément repository nécessaire
```

La troisième catégorie ne doit être retenue qu'après démonstration que les deux premières sont insuffisantes.

En particulier :

- ne pas créer un manifest repository en anticipation ;
- ne pas déplacer les Business Objects dans `RepositoryModel` par anticipation ;
- ne pas créer une registry universelle ;
- ne pas refondre `semarch.json` sans besoin observable.

---

## 17. Vue logique consolidée

```text
                         BUSINESS OBJECT
                         identité canonique
                               BO-A
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        │                       │                       │
   CONTEXTUALISATION      REPRESENTATION          RELATIONS
        │                       │                       │
        ▼                       ▼                       ▼
 contexte / stakeholder     BPMN element             BO-B
        │                       │
        ├── ProfileRuntime      │
        │                       │
        └── BusinessView        │
              │                 │
         propertyRefs[]         │
              │                 │
         ┌────┴────┐            │
         │         │            │
       data      object         │
     property   property ───► BO-B
         │
       valeur
```

Une éventuelle relation métier explicite reste conditionnelle :

```text
BusinessObject A
       │
       │ BusinessRelation ?
       ▼
BusinessObject B
       │
       ├── contextualisation ?
       └── représentation BPMN ?
```

Les `?` désignent des hypothèses à éprouver, non des abstractions acquises.

---

## 18. Règle de lecture du Properties Panel

Le Properties Panel constitue une sonde importante pour les expériences.

La cible à vérifier est :

```text
BusinessObject
      ↕
BusinessObjectRepresentation
      ↕
BPMN construction
      ↕
SemArch property resolution
      ↕
ProfileRuntime / BusinessView
      ↕
Properties Panel
```

Il faut déterminer si les propriétés aujourd'hui éditées depuis une construction BPMN sont :

- intrinsèquement des données de la représentation ;
- des données du BO contextualisé accessibles via la représentation ;
- ou un mélange dépendant du type de propriété.

Aucune réponse ne doit être imposée avant inspection.

---

## 19. Business Objects Browser comme sonde produit

Le navigateur `Model → Business Objects…` doit servir progressivement de point d'observation commun.

La cible logique d'inspection est :

```text
BO-001
│
├── Identity
│     id
│     typeRefs[]
│
├── Contextualized views
│     ├── contexte A
│     │     ├── Data Properties
│     │     └── Object Properties
│     └── contexte B
│           ├── Data Properties
│           └── Object Properties
│
└── Representations
      ├── BPMN A / Element X
      └── BPMN B / Element Y
```

Ce schéma n'est pas une spécification UI immédiate.

Il décrit les informations qui doivent pouvoir être réunies sans créer de silos entre BO autonomes, constructions BPMN enrichies et relations métier.

---

## 20. Grille d'épreuves

Les identifiants E1..En sont locaux à ce registre expérimental. Ils ne constituent pas une nouvelle roadmap BPMNSM.

### E1 — BusinessObject canonique minimal

**Question**

Le BO canonique est-il une identité métier minimale et non contextualisée ?

**Preuve recherchée**

`BusinessObject { id, typeRefs[] }` sans propriétés contextualisées et sans dépendance à une représentation.

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

**Conséquence**

Conserver le BO canonique pauvre ; ne pas lui ajouter les propriétés CoC par commodité.

---

### E2 — BO distinct de sa représentation BPMN

**Question**

L'identité du BO est-elle explicitement distincte de celle de sa représentation ?

**Preuve recherchée**

Lien `businessObjectId ↔ representationId` sans fusion des identités.

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

**Conséquence**

Préserver :

```text
BusinessObject.id
    ≠ representationId
    ≠ semarch:stableGuid
    ≠ BPMN element id
    ≠ RepositoryComponent.id
```

---

### E3 — Zéro à plusieurs représentations

**Question**

Un BO peut-il exister indépendamment du nombre de représentations ?

**Preuve recherchée**

Store BO indépendant ; 0..n liens de représentation ; persistance et réouverture.

**Statut**

BO → 0..n représentations au niveau modèle : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Persistance/reprojection BO ↔ représentation dans le repository BPMN courant : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Sérialisation/reprojection d'un BO sans représentation par les primitives repository/XML : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Round-trip fichier/XML `save → reopen` avec zéro représentation et reconstruction dans de nouveaux stores : **[IMPLÉMENTÉ + DÉMONTRÉ]**

---

### E4 — Sujet actuel de ProfileRuntime

**Question**

Sur quel sujet exact les propriétés résolues par `ProfileRuntime` s'appliquent-elles aujourd'hui ?

**Preuve recherchée**

Tracer dans le code réel :

```text
ProfileRuntime
    → types
    → property descriptors
    → BPMN/SemArch subject
```

**Statut**

Sujet BPMN/SemArch actuellement utilisé par le Properties Panel : **[DÉMONTRÉ PAR INSPECTION]**

Raccord direct `BusinessObject.typeRefs[]` → `semanticTypeRefs` → `ProfileRuntime` → descripteurs, démontré par E4c : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Raccord du Properties Panel/BPMN aux BO canoniques attachés pour cette résolution : **[IMPLÉMENTÉ + DÉMONTRÉ]**

---

### E5 — Sujet actuel de BusinessView

**Question**

Sur quel sujet exact `BusinessView.propertyRefs[]` projette-t-il aujourd'hui les propriétés ?

**Preuve recherchée**

Tracer :

```text
ActiveBusinessView
    → projection typeRef
    → propertyRefs[]
    → descriptors
    → Properties Panel subject
```

**Statut**

Business View elle-même : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Frontière explicite BO canonique + `ProfileRuntime` + `BusinessView` optionnelle → descripteurs projetés : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Raccord de cette frontière au Properties Panel/BPMN pour les BO canoniques attachés : **[IMPLÉMENTÉ + DÉMONTRÉ]**

---

### E6 — Raccord BO / représentation / propriétés contextualisées

**Question**

Une représentation BPMN reliée à un BO peut-elle servir de point d'accès aux propriétés contextualisées du même BO sans créer un second univers métier ?

**Preuve recherchée**

Chaîne observable :

```text
BusinessObject
    ↔ BusinessObjectRepresentation
    ↔ BPMN construction
    ↔ ProfileRuntime / BusinessView
    ↔ propriétés
```

**Statut**

Chaîne BPMN → `semanticObject` → `BusinessObject[0..n]` attachés → contexte → propriétés contextualisées : **[IMPLÉMENTÉ + DÉMONTRÉ]**

E6a — résolution `representationId → BusinessObjectRepresentation[0..n]` : **[IMPLÉMENTÉ + DÉMONTRÉ]**

E6b — résolution `representationId → BusinessObject[0..n]`, sans suppression des liens orphelins lors de la résolution : **[IMPLÉMENTÉ + DÉMONTRÉ]**

E6c — raccord installé dans le Properties Panel avant la construction des descripteurs : à partir de `semanticObject.id`, les actions injectées résolvent `BusinessObject[0..n]`, puis chaque BO attaché est résolu avec le `ProfileRuntime`, la `BusinessView` optionnelle et les `DataProperty[]` du `semanticObject` : **[IMPLÉMENTÉ + DÉMONTRÉ]**

E6d — plusieurs Business Objects peuvent partager un même `representationId` au niveau Store/Actions et être résolus séparément depuis le même sujet BPMN, sans sélection implicite du premier BO ni fusion de leurs `typeRefs[]` : **[IMPLÉMENTÉ + DÉMONTRÉ]**. La sémantique métier d'une représentation partagée par plusieurs BO reste **[NON IMPLÉMENTÉ]**.

Une frontière réutilisable `BusinessObject + ProfileRuntime + BusinessView optionnelle + DataProperty[] optionnelles → descripteurs` est désormais **[IMPLÉMENTÉ + DÉMONTRÉ]**. Elle dérive les descripteurs depuis `BusinessObject.typeRefs[]` et peut raccorder des `DataProperty` existantes par `propertyRef`, sans recopier leur valeur dans le BO canonique et sans créer ni Viewpoint, ni nouvelle persistance, ni `ActiveBusinessObject`.

Le raccord Properties Panel → `semanticObject` → BO canoniques attachés → cette frontière est désormais **[IMPLÉMENTÉ + DÉMONTRÉ]**. Lorsque plusieurs BO partagent la représentation, ils sont conservés comme sujets distincts et résolus séparément ; aucun BO n'est sélectionné implicitement et leurs `typeRefs[]` ne sont pas fusionnés. La lecture puis l'édition d'une `DataProperty` existante depuis une entrée contextualisée BO, via le mécanisme BPMN/SemArch existant, sont **[IMPLÉMENTÉ + DÉMONTRÉ]**. Cette preuve ne détermine pas l'ownership de la valeur lorsque plusieurs BO partagent la même représentation.

La caractérisation complémentaire `CoCConfiguration` démontre que deux CoC d'identités distinctes peuvent sélectionner le même `profileRef` et produire des `ProfileRuntime` portant le même `profile.id` : **[IMPLÉMENTÉ + DÉMONTRÉ]**. `ProfileRuntime` ne peut donc pas être assimilé à l'identité du CoC. Cette preuve ne fournit toutefois aucun discriminant d'ownership pour `DataProperty` et n'implémente ni ownership `BusinessObject × CoC`, ni `BusinessObjectViewpoint`.

Régression globale après cette caractérisation : 71 fichiers / 321 tests / 321 passent / 0 échec.

La caractérisation E6 complémentaire compose ensuite deux `CoCConfiguration` distinctes partageant le même profil avec le même `BusinessObject`, le même `propertyRef` et deux `DataProperty` candidates. Les deux résolutions sélectionnent la même seconde `DataProperty` : **[IMPLÉMENTÉ + DÉMONTRÉ]**. Le resolver `resolveBusinessObjectContextualProperties(...)` ne reçoit pas d'identité CoC ; `ActiveProfileRuntime` conserve uniquement le `ProfileRuntime`. L'identité CoC disponible lors de l'activation n'est donc pas transportée jusqu'à cette frontière : **[DÉMONTRÉ PAR INSPECTION]**.

Cette preuve caractérise une limite observable ; elle n'implémente ni adressage de deux valeurs par CoC, ni ownership `BusinessObject × CoC`, ni nouvelle persistance, ni `BusinessObjectViewpoint`.

Régression globale après cette caractérisation d'ownership : 71 fichiers / 322 tests / 322 passent / 0 échec.

Le transport de l'identité CoC jusqu'à la frontière BO est désormais **[IMPLÉMENTÉ + DÉMONTRÉ]**. La source persistante reste `RepositoryContext.cocOwner` : le chemin Editor transporte une capacité de lecture du `RepositoryContext` via `createApp → createBpmnEngine → createModeler`, le Properties Provider relit le `cocOwner` courant sans recréation du provider et le transmet comme `cocId` à `resolveBusinessObjectContextualProperties(...)`. Le Browser transmet également le `cocOwner` courant comme `cocId` à cette frontière.

Cette étape lève uniquement la perte d'identité CoC observée par la caractérisation précédente. Elle ne modifie ni `ActiveProfileRuntime`, ni `semarch:DataProperty`, ni la clé de raccord `propertyRef`. Les descripteurs n'utilisent pas encore `cocId` pour distinguer deux valeurs de même `propertyRef` ; l'ownership `BusinessObject × CoC`, l'isolation multi-BO × CoC et E6 complet restent **[NON IMPLÉMENTÉ]**.

Régression globale après le transport `RepositoryContext.cocOwner → resolver BO` : 71 fichiers / 323 tests / 323 passent / 0 échec.

La caractérisation post-transport prolonge ensuite explicitement `cocId` jusqu'à `createSemArchPropertyDescriptors(...)` : la frontière descriptors accepte désormais l'identité CoC, et les deux résolutions du même `BusinessObject`, du même profil et du même `propertyRef` reçoivent deux `cocId` distincts issus de leurs `CoCConfiguration` respectives : **[IMPLÉMENTÉ + DÉMONTRÉ]**. Malgré cette identité désormais disponible à la frontière descriptors, les deux résolutions sélectionnent encore la même seconde `DataProperty` : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Cette caractérisation ne change pas l'adressage existant : `indexExistingProperties(...)` reste fondé uniquement sur `propertyRef`, et `cocId` n'est pas utilisé pour sélectionner une `DataProperty` : **[DÉMONTRÉ PAR INSPECTION]** pour la clé actuelle et **[NON IMPLÉMENTÉ]** pour l'adressage CoC. Aucun champ d'ownership n'est ajouté à `DataProperty` et aucun choix de persistance n'est introduit.

Régression globale après la caractérisation de la frontière descriptors : 71 fichiers / 323 tests / 323 passent / 0 échec.

La caractérisation de la frontière d'écriture complète cette preuve : lors de la résolution d'un Business Object attaché, le provider connaît le `BusinessObject` et relit `RepositoryContext.cocOwner` comme `cocId`, et ces informations atteignent la construction des descripteurs. En revanche, l'entrée contextualisée construite pour l'édition ne porte ni `businessObjectId` ni `cocId`, et la `semarch:DataProperty` créée par cette écriture contient uniquement `propertyRef`, `schemaRef` et `value` : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Cette caractérisation démontre donc que l'identité `BusinessObject × CoC` disponible en amont est perdue à la frontière d'écriture/persistance actuelle. Elle ne choisit ni la forme d'un discriminant, ni son lieu de persistance, et n'ajoute aucun champ d'ownership à `DataProperty`. L'ownership `BusinessObject × CoC`, l'adressage `BusinessObject × CoC × propertyRef`, deux valeurs CoC distinctes adressables de même `propertyRef`, l'isolation multi-BO × CoC et E6 complet restent **[NON IMPLÉMENTÉ]**.

Preuve ciblée de la frontière d'écriture : 1 fichier / 22 tests / 22 passent / 0 échec.

Régression globale après cette caractérisation : 71 fichiers / 324 tests / 324 passent / 0 échec.

La persistance du discriminant minimal est ensuite caractérisée sans créer de `BusinessObjectViewpoint` persistant : `semarch:DataProperty` accepte désormais les attributs optionnels String `businessObjectRef` et `cocRef`. Leur sérialisation BPMN puis réimport dans une nouvelle instance `BpmnModdle` préservent le couple d'ownership, tandis qu'une `DataProperty` historique non qualifiée conserve son round-trip sans ces attributs : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Régression globale après cette caractérisation de persistance : 71 fichiers / 326 tests / 326 passent / 0 échec.

L'adressage contextualisé utilise ensuite le triplet `BusinessObject × CoC × propertyRef` lorsque `businessObjectId` et `cocId` sont disponibles : le resolver transporte `BusinessObject.id`, les descripteurs sélectionnent uniquement la `DataProperty` portant le `businessObjectRef` et le `cocRef` correspondants, deux valeurs de même `propertyRef` sous `coc-a` et `coc-b` deviennent distinctement adressables, et une valeur appartenant à un autre BO est exclue. En contexte qualifié sans correspondance exacte, aucune `DataProperty` historique non qualifiée n'est utilisée comme fallback : **[IMPLÉMENTÉ + DÉMONTRÉ]**. Cette règle caractérise le chemin de lecture qualifié ; elle ne constitue pas une politique générale de migration.

Régression globale après cette caractérisation d'adressage : 71 fichiers / 326 tests / 326 passent / 0 échec.

La frontière d'écriture propage enfin `businessObjectId` et `cocId` dans l'entrée contextualisée. Lors de la création d'une valeur contextualisée, la `DataProperty` persiste `propertyRef + schemaRef + businessObjectRef + cocRef + value`. Lorsqu'une `DataProperty` qualifiée existe déjà, seule l'instance sélectionnée pour le couple BO/CoC est mise à jour ; les valeurs de l'autre CoC et de l'autre BO éprouvées restent intactes : **[IMPLÉMENTÉ + DÉMONTRÉ]**. La création générique hors contexte BO/CoC conserve le contrat historique `propertyRef + schemaRef + value` sans matérialiser de discriminants nuls : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Preuve ciblée de la frontière d'écriture qualifiée : 1 fichier / 23 tests / 23 passent / 0 échec. Régression ciblée persistance/adressage : 3 fichiers / 13 tests / 13 passent / 0 échec.

Régression globale après l'écriture ownership : 71 fichiers / 327 tests / 327 passent / 0 échec.

L'ownership et l'isolation démontrés ici concernent la branche `DataProperty` contextualisée. `ObjectProperty` contextualisée, la migration des anciennes valeurs non qualifiées et E6 complet restent **[NON IMPLÉMENTÉ]**.

La branche `ObjectProperty` contextualisée est ensuite éprouvée sans créer de `BusinessRelation` ni de `BusinessObjectViewpoint` persistant. Le modèle `semarch:ObjectProperty` persiste `propertyRef`, `schemaRef`, `businessObjectRef`, `cocRef` et `targetBusinessObjectRef`; un round-trip BPMN réel préserve ces cinq références : **[IMPLÉMENTÉ + DÉMONTRÉ]**. La cible reste l'identité canonique `BusinessObject.id`; l'axe de représentation demeure orthogonal.

Le chemin de lecture qualifié résout une relation par `BusinessObject × CoC × propertyRef` et n'applique aucun fallback vers une relation historique non qualifiée lorsque BO et CoC sont présents : **[IMPLÉMENTÉ + DÉMONTRÉ]**. Le `targetBusinessObjectRef` sélectionné est exposé dans l'entrée `ObjectProperty`, tandis que les candidats proposés sont calculés séparément depuis `targetType → TypeBinding[0..n] → semanticType(s) → BusinessObject(s)` : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

La frontière d'écriture `ObjectProperty` est également **[IMPLÉMENTÉ + DÉMONTRÉ]** dans le chemin contextualisé éprouvé. Une relation existante qualifiée met à jour son seul `targetBusinessObjectRef`; une relation absente est créée avec les cinq références `propertyRef + schemaRef + businessObjectRef + cocRef + targetBusinessObjectRef`. La création exige une cible, un BO et un CoC ; aucune sémantique générique ObjectProperty hors contexte BO/CoC n'est déduite de cette preuve.

Preuve provider après activation de l'entrée ObjectProperty : 1 fichier / 26 tests / 26 passent / 0 échec. Régression ciblée de la frontière objet : 4 fichiers / 40 tests / 40 passent / 0 échec. Régression globale : 71 fichiers / 337 tests / 337 passent / 0 échec.

`ObjectProperty` contextualisée dans ce périmètre est donc **[IMPLÉMENTÉ + DÉMONTRÉ]**. La migration des valeurs/relations historiques non qualifiées et E6 complet restent **[NON IMPLÉMENTÉ]**.

---

### E7 — Changement de contexte sans changement d'identité BO

**Question**

Un changement de CoC/stakeholder peut-il changer les propriétés projetées sans changer `BusinessObject.id` ?

**Preuve recherchée**

Même BO, même représentation éventuelle, deux contextes, projections différentes.

**Statut**

Dérivation de propriétés différentes pour le même `BusinessObject.id` sous deux `ProfileRuntime`, sans représentation BPMN : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Projection du même BO par une `BusinessView` optionnelle via la frontière de contextualisation canonique : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Critère complet CoC/stakeholder → ProfileRuntime/BusinessView → projection du même BO : **[NON IMPLÉMENTÉ]**

---

### E8 — Data Property contextualisée

**Question**

Une Data Property existante peut-elle être interprétée et inspectée comme propriété de la vue contextualisée du BO ?

**Preuve recherchée**

Cas réel issu du vertical existant ; même valeur accessible depuis le raccord BO/représentation/contexte.

**Statut**

Runtime Data Properties générique et persistance de `semarch:DataProperty.value` dans le modèle BPMN/SemArch : **[DÉMONTRÉ PAR INSPECTION]**

Raccord d'une `DataProperty` existante au BO contextualisé par `propertyRef` : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Le test `src/properties/business-object-contextual-properties.test.js` fournit explicitement un BO canonique, un `ProfileRuntime` et une `DataProperty` existante au resolver. Le descripteur résolu conserve la même instance `DataProperty` et expose sa valeur, tandis que le `BusinessObject` canonique reste inchangé.

Cette preuve de frontière est désormais composée avec le raccord E6 du Properties Panel : `BPMN sélectionné → semanticObject → BusinessObject[0..n] attachés → DataProperty[] → resolver` est **[IMPLÉMENTÉ + DÉMONTRÉ]**. Une `DataProperty` existante peut également être lue puis éditée depuis l'entrée contextualisée d'un BO par le mécanisme BPMN/SemArch existant : **[IMPLÉMENTÉ + DÉMONTRÉ]**. La preuve ne démontre toutefois pas que cette valeur appartient à un BO particulier ou à une abstraction Viewpoint persistante ; dans le cas multi-BO éprouvé, les deux entrées contextualisées conservent la même instance `DataProperty`.

Preuve ciblée : 3 tests passent dans `business-object-contextual-properties.test.js`.

Compatibilité resolver/descriptors/provider : 4 fichiers / 28 tests passent.

Régression globale après E8 : 71 fichiers / 318 tests / 318 passent / 0 échec.

---

### E9 — Object Property vers BO canonique

**Question**

Une propriété `kind = object` peut-elle référencer l'identité canonique d'un autre BO ?

**Preuve recherchée**

Cas réel :

```text
View(BO-A, contexte X)
    └── objectProperty → BO-B.id
```

sans réduction de la relation à une chaîne littérale.

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

`semarch:ObjectProperty.targetBusinessObjectRef` porte l'identité canonique du BO cible. Le modèle persistant et son round-trip BPMN à cinq références sont démontrés, puis le Properties Provider résout et expose la relation qualifiée `BusinessObject × CoC × propertyRef → targetBusinessObjectRef`. Les candidats de sélection sont dérivés séparément du `targetType` de schéma vers les BO canoniques compatibles ; `targetType` n'est jamais assimilé à un `BusinessObject.id`.

La preuve E9 ne transforme pas cette relation en `BusinessRelation`. La navigation de graphe métier est éprouvée séparément sous E10, sans changer ce contrat persistant.

---

### E10 — Graphe métier contextualisé

**Question**

Les Object Properties permettent-elles de naviguer un graphe métier entre BO dans un contexte ?

**Preuve recherchée**

Au moins deux BO et une Object Property résolue/navigable entre eux.

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

La relation qualifiée persistée `BusinessObject × CoC × propertyRef → targetBusinessObjectRef` est résolue vers le `BusinessObject` canonique cible par `resolveBusinessObjectNavigationTargets(...)`. La résolution reste distincte du calcul des candidats et de la persistance de la relation ; elle n'introduit ni `BusinessRelation`, ni `BusinessObjectViewpoint` persistant, ni couplage à `BusinessObjectRepresentation` : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Le chemin produit ajoute une action explicite de navigation à l'entrée `ObjectProperty` au moyen du `HeaderButton` public de `@bpmn-io/properties-panel`. L'action est transportée par la composition `src/main.js → createApp → createBpmnEngine → createModeler → SemArchPropertiesProvider` sous `businessObjectNavigationActions`, puis rappelle le pipeline partagé d'inspection `showBusinessObject(...)` pour le BO canonique cible : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Preuve ciblée finale : `src/properties/semarch-properties-provider.test.js`, 29 / 29 tests passent. Régression globale : 71 fichiers / 358 tests / 358 passent / 0 échec. `git diff --check` ne signale aucune erreur : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

SHA du snapshot E10 démontré :
- `src/properties/business-object-contextual-properties.js` : `b1a06a174a6b7de3a98b6c1eded72e5b0a3334c53af87a407691aaecfe9364fa`
- `src/properties/business-object-contextual-properties.test.js` : `f5322072988d465dc7f0e2791c212bb28aa1b5125238d67636ab718d15ef7da5`
- `src/main.js` : `11db2e73e47f01600b1be12a07553522cb1d2abdeac05b1317015b989bb01130`
- `src/app/create-app.js` : `73e8924cf56ac1137cf8cc85d8364ad80bfa8c667aa02227d7135aa9254c7d86`
- `src/bpmn/create-bpmn-engine.js` : `2438ecbdcf0a17a15d5545f044ac5be64c09f6c2ceab14711968eab8fd4a8f64`
- `src/bpmn/create-modeler.js` : `04ed6abfbe439402d399607f533e645292033a09ab9483ad63fe9dfe24de0cd0`
- `src/properties/semarch-properties-provider.js` : `b9b1c2a51cb611c42561e889e160e1515a41c26a54963df29b98253354888fd5`
- `src/properties/semarch-properties-provider.test.js` : `591bd5e02e72ffa05762dc11bbaa6dc5c704beedf8e1a2ad081976a91a9e8a02`

E10 est donc fermé pour le chemin produit éprouvé de navigation d'une `ObjectProperty` contextualisée vers l'inspection du BO canonique cible : **[IMPLÉMENTÉ + DÉMONTRÉ]**. Cette fermeture ne démontre pas la navigation Business publiée dans le Viewer E20, qui reste une frontière distincte.

---

### E11 — Plusieurs représentations, même contextualisation

**Question**

Deux représentations du même BO dans le même contexte conduisent-elles au même objet métier contextualisé sans duplication ?

**Preuve recherchée**

Deux `representationId`, un `businessObjectId`, propriétés cohérentes.

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

La preuve composée relie deux `representationId` distincts au même `BusinessObject` canonique, puis applique le même `cocId` à `resolveBusinessObjectContextualProperties(...)`. Les deux chemins aboutissent à la même identité de BO et à la même `DataProperty` qualifiée par `businessObjectRef + cocRef`, sans création d'un second BO ni duplication de la valeur contextualisée : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

La preuve exécutable est portée par `src/properties/business-object-contextual-properties.test.js`, test `resolves two representations of the same Business Object to the same contextual properties`. Le fichier démontré a le SHA-256 `0ed0150df704988acedcfad46442b5289dc487049c1fe5dfc4ebbdec8d4554be`.

Preuve ciblée finale : `src/properties/business-object-contextual-properties.test.js`, 26 / 26 tests passent. Régression globale : 71 fichiers / 359 tests / 359 passent / 0 échec. `git diff --check` ne signale aucune erreur : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

E11 est donc fermé pour le périmètre recherché : deux représentations du même BO, dans un même CoC, résolvent une contextualisation cohérente sans duplication de l'identité métier ni de la propriété contextualisée : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

---

### E12 — BO contextualisé sans représentation

**Question**

Le mécanisme de contextualisation peut-il fonctionner pour un BO ayant zéro représentation BPMN ?

**Preuve recherchée**

BO listable/inspectable, contexte applicable, propriétés résolues, aucune représentation.

**Statut**

Persistance/reprojection repository/XML d'un BO canonique sans représentation : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Listage et sélection d'un BO sans représentation dans le Business Objects Browser : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Résolution de descripteurs contextualisés à partir d'un BO sans représentation BPMN via la frontière dédiée `BusinessObject + contexte → descripteurs` : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Preuve ciblée de l'inspection contextualisée : sélection du BO canonique dans le Browser, rendu par `diagramPropertiesPanel.showBusinessObject(...)` et résolution contextuelle `BusinessObject + ProfileRuntime + BusinessView optionnelle → descripteurs` : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Composition produit installée dans `src/main.js` : `Business Objects Browser → BO choisi → ActiveProfileRuntime/ActiveBusinessView → resolveBusinessObjectContextualProperties(...) → diagramPropertiesPanel.showBusinessObject(...)` : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Critère E12 BO listable/inspectable avec zéro représentation dans une même voie produit : **[IMPLÉMENTÉ + DÉMONTRÉ]**

La composition de bout en bout est démontrée par inspection du code produit, complétée par les tests ciblés des frontières et la régression globale ; aucun test unique ne simule encore le clic utilisateur à travers tout `main.js`.

---

### E13 — Persistance d'un BO sans représentation

**Question**

Un BO sans représentation survit-il à sauvegarde, fermeture et réouverture ?

**Preuve recherchée**

```text
create BO-X
representations = 0
save
close
reopen
BO-X présent
representations = 0
```

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

Le test `src/bpmn/business-object-zero-representation-roundtrip.test.js` sérialise un BO canonique avec zéro représentation en BPMN XML, puis réimporte ce XML dans une nouvelle instance `BpmnModdle` et reprojette le repository dans de nouveaux `BusinessObjectStore` et `BusinessObjectRepresentationStore`.

Le BO `BO-E13-001` et ses `typeRefs[]` sont restaurés, tandis que les représentations restent vides avant et après le round-trip. Le test ne simule pas un cycle UI complet de fermeture/réouverture de l'application ; il démontre la disparition de l'état mémoire initial et la reconstruction depuis le XML sauvegardé.

Preuve ciblée : 1 fichier / 1 test passe.

Régression globale après E13 : 71 fichiers / 317 tests / 317 passent / 0 échec.

---

### E14 — Enrichissement d'une relation BPMN

**Question**

Une relation BPMN native peut-elle être le support d'une sémantique métier contextualisée lorsque sa sémantique BPMN convient ?

**Preuve recherchée**

Cas BPMN réel, relation native, propriétés SemArch applicables/résolues.

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

Une `bpmn:SequenceFlow` native portant le `SemanticType` expérimental
`e14:BusinessDependency` a été chargée avec le moddle SemArch, sérialisée puis
réouverte. Ses extrémités BPMN et son type sémantique sont conservés. Le
`ProfileRuntime` expérimental ancre ce type sur `bpmn:SequenceFlow` et résout
la propriété de schéma `criticality`. Le Properties Provider offre et applique
le type compatible directement à la relation BPMN native.

Preuve ciblée : 2 fichiers / 4 tests / 4 passent / 0 échec.

Cette preuve établit la faisabilité de l'alternative « relation BPMN native
enrichie » lorsque la sémantique BPMN convient. Elle ne déclare ni que toute
relation métier doit être portée par BPMN, ni qu'une `BusinessRelation`
autonome est nécessaire ou inutile.

---

### E15 — Object Properties versus relations BPMN

**Question**

Quels besoins relationnels sont couverts par Object Properties et lesquels sont naturellement portés par des relations BPMN ?

**Preuve recherchée**

Comparer des cas produit réels sans introduire de métamodèle supplémentaire.

**Statut**

**[NON IMPLÉMENTÉ]**

La comparaison architecturale contrôlée E15-01 à E15-03 est démontrée, mais
elle ne satisfait pas encore le critère autoritaire « cas produit réels ».

E15-01 distingue sur un même dispositif une `ObjectProperty` contextualisée
dont la cible canonique varie avec le CoC et une relation BPMN native dont la
topologie reste inchangée. E15-02 démontre qu'une relation BPMN native peut
être dérivée vers ses `BusinessObject` canoniques par les liens
`BusinessObjectRepresentation`. E15-03 réunit ces mécanismes dans le fixture
architectural contrôlé `Aircraft --hasEngine--> Engine` : le CoC peut
sélectionner une cible différente alors que le fait dérivé de la topologie
BPMN reste stable.

Régression ciblée finale E15 : 1 fichier / 3 tests / 3 passent / 0 échec.

Ces preuves caractérisent les alternatives existantes sans introduire de
nouveau métamodèle dans E15. Le fixture `Aircraft --hasEngine--> Engine`
n'est pas déclaré besoin métier normatif ni cas produit réel. E15 reste donc
ouvert jusqu'à une démonstration produit conforme à la preuve recherchée.

---

### E16 — Nécessité éventuelle de BusinessRelation

**Question**

Existe-t-il une relation métier observable qui ne peut être correctement couverte par une Object Property, une relation BPMN enrichie ou une dérivation ?

**Preuve recherchée**

Cas produit irréductible.

**Statut**

**[IMPLÉMENTÉ + DÉMONTRÉ]**

La faisabilité technique d'une `BusinessRelation` canonique autonome avait
d'abord été démontrée sur un fixture architectural contrôlé. La nécessité
produit est désormais démontrée par le cas métier `Path --aggregation-->
Application`.

E16-01 montre que `BO-Aircraft --e16:hasEngine--> BO-Engine` peut être porté
par le modèle/store `BusinessRelation` comme triplet canonique
`sourceBusinessObjectId + targetBusinessObjectId + relationType`, sans
`cocRef` ni représentation BPMN. Dans le même fixture, une `ObjectProperty`
non qualifiée historique n'est pas utilisée comme fallback par la résolution
contextualisée active.

E16-02 démontre le round-trip
`BusinessObject + BusinessRelation -> BPMN XML -> nouveau BpmnModdle ->
projection BusinessObject + BusinessRelation`. Les deux BO et la relation
canonique sont reconstruits alors que le XML de l'expérience ne matérialise
ni `BusinessObjectRepresentation`, ni `SequenceFlow` portant `hasEngine`, ni
`ObjectProperty` substitutive.

La preuve produit complémentaire porte sur un `Path` représentant les
applications impliquées dans une chaîne d'échange ou de traitement. Le
`Path` est constitué d'`Application` par une relation métier d'agrégation.
Cette composition est un fait du modèle métier : elle n'est ni une topologie
de processus BPMN, ni une contextualisation BO × CoC, et le besoin produit
ne requiert pas de détailler la chaîne sous forme d'une représentation BPMN
dont la relation pourrait être dérivée.

Le test produit
`src/model/business-relation-path-application-product.test.js` construit un
`Path`, trois `Application` et trois `BusinessRelation` canoniques
`demo:aggregation`. Le round-trip BPMN XML puis la projection reconstruisent
les quatre BO et les trois relations sans
`BusinessObjectRepresentation`, `ObjectProperty` ou topologie BPMN utilisée
comme substitut de l'agrégation.

La régression groupée du démonstrateur vertical passe 7 fichiers / 66 tests /
0 échec. Elle couvre conjointement l'enrichissement de relation BPMN
`Realized Flow -> Path`, la relation autonome `Path -> Application`, les
preuves E15/E16 antérieures et la non-régression des propriétés BO × CoC.
`git diff --check` est silencieux au contrôle suivant cette régression.

**Conséquence**

Le cas produit `Path --aggregation--> Application` satisfait la preuve
recherchée par E16 : il existe une relation métier observable dont le fait
canonique n'est correctement porté ni par une `ObjectProperty` contextuelle,
ni par une relation BPMN enrichie, ni par une dérivation de topologie BPMN.
`BusinessRelation` est donc retenue comme abstraction nécessaire pour cette
catégorie de relations BO -> BO autonomes.

Cette décision ne transforme pas toute relation métier en
`BusinessRelation`. Les relations correctement exprimées par BPMN restent
natives BPMN ; les propriétés relationnelles contextuelles restent des
`ObjectProperty` ; les relations déductibles sans ambiguïté restent
dérivables.

---

### E17 — Relation inter-BPMN

**Question**

Une relation entre BO représentés dans des BPMN différents peut-elle être dérivée ou doit-elle être persistée ailleurs ?

**Preuve recherchée**

Cas multi-document réel.

**Statut**

**[NON IMPLÉMENTÉ]**

E17-01 est parqué : une expérience technique isolée démontre que le
`RepositoryModel` existant peut conserver une référence générique entre deux
composants de documents distincts, y compris pendant la disparition puis le
retour d'un endpoint. Cette preuve ne constitue ni le cas multi-document réel
demandé par E17, ni une justification rétroactive de `BusinessRelation` ou
d'un artefact repository. Aucun approfondissement E17 n'est engagé avant le
decision gate E15-E16.

---

### E18 — Information impliquant un BO sans représentation

**Question**

Où vit une relation impliquant un BO qui n'a aucune représentation BPMN ?

**Preuve recherchée**

Cas produit réel ; tester d'abord dérivation et mécanismes existants.

**Statut**

**[NON IMPLÉMENTÉ]**

---

### E19 — Nécessité d'un artefact repository complémentaire

**Question**

Existe-t-il une information métier nécessaire qui ne peut être ni correctement portée par un BPMN particulier ni dérivée des BPMN disponibles ?

**Preuve recherchée**

Cas produit démontré et absence d'ancrage/dérivation correcte.

**Statut**

**[NON IMPLÉMENTÉ]**

**Conséquence**

Ne créer un artefact repository complémentaire qu'après cette preuve.

---

### E20 — Navigation Business dans le Viewer

**Question**

Le Viewer peut-il naviguer l'espace Business publié sans résoudre un `ProfileRuntime` ni republier ?

**Preuve recherchée**

Artefact publié contenant les informations nécessaires à la navigation BO / contexte publié / représentations / relations publiées.

**Statut**

**[NON IMPLÉMENTÉ]**

---

## 21. Ordre expérimental

L'ordre de travail recommandé est :

```text
E1–E3
Socle BO / représentation
    │
    ▼
E4–E5
Inspection du mécanisme actuel
ProfileRuntime / BusinessView
    │
    ▼
E6–E8
Raccord BO ↔ représentation ↔ propriétés contextualisées
    │
    ▼
E9–E10
Object Properties et graphe métier
    │
    ▼
E11
plusieurs représentations / même BO
    │
    ▼
E12–E13
BO contextualisé sans représentation
    │
    ▼
E14–E15
relations BPMN et couverture relationnelle existante
    │
    ▼
E16
BusinessRelation seulement si nécessaire
    │
    ▼
E17–E19
multi-BPMN et frontière repository
    │
    ▼
E20
navigation Business publiée dans le Viewer
```

Cet ordre peut évoluer si une expérience réelle réfute une hypothèse, mais une abstraction ne doit pas être avancée simplement pour obtenir une architecture plus symétrique.

---

## 22. Matrice de localisation de l'information

Cette matrice doit être remplie au fur et à mesure des preuves.

| Information | BPMN particulier | Dérivable d'un ou plusieurs BPMN | Artefact repository complémentaire | Preuve |
|---|---|---|---|---|
| Identité BO canonique | à éprouver | à éprouver | à éprouver seulement si nécessaire | E1–E3 |
| Lien BO ↔ représentation | à éprouver | à éprouver | à éprouver seulement si nécessaire | E2–E3 |
| Data Property contextualisée | à éprouver | à éprouver | à éprouver seulement si nécessaire | E4–E8 |
| Object Property contextualisée | à éprouver | à éprouver | à éprouver seulement si nécessaire | E9–E10 |
| BO sans représentation | à éprouver | à éprouver | à éprouver seulement si nécessaire | E12–E13 |
| Relation portée par BPMN | candidat naturel | éventuellement | non anticipé | E14–E15 |
| Relation inter-BPMN | à éprouver | à éprouver | à éprouver seulement si nécessaire | E17 |
| Relation avec BO non représenté | à éprouver | à éprouver | à éprouver seulement si nécessaire | E18 |
| Information irréductible | non | non | seulement après démonstration | E19 |

La colonne repository ne doit jamais être choisie par défaut.

---

## 23. Journal des preuves

Chaque expérience doit ajouter ou mettre à jour une entrée selon ce format :

```text
EXPERIENCE
E<n> — titre

QUESTION
Question falsifiable.

STATUT
[IMPLÉMENTÉ + DÉMONTRÉ]
ou
[DÉMONTRÉ PAR INSPECTION]
ou
[NON IMPLÉMENTÉ]

FICHIERS RÉELS INSPECTÉS
- chemin
- chemin

PREUVE PAR INSPECTION
Ce que le code réel démontre exactement.

PREUVE EXÉCUTABLE / TEST
Commande et résultat, lorsqu'applicable.

PREUVE PRODUIT / UI
Scénario observable et résultat, lorsqu'applicable.

LOCALISATION DE L'INFORMATION
- BPMN particulier
- dérivable
- artefact repository
- non encore déterminé

CONSÉQUENCE
Décision minimale autorisée par la preuve.

HYPOTHÈSES RÉFUTÉES
Ce que l'expérience interdit désormais de supposer.

PROCHAINE QUESTION
Question atomique suivante.
```

Une absence de preuve ne doit pas être reformulée comme décision.

---

## 24. Décisions actuellement acquises pour cette cible

### D1 — BO canonique distinct de sa représentation

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Le modèle BO et le modèle de représentation sont séparés.

### D2 — BO canonique minimal

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]**

Le BO inspecté porte `id` et `typeRefs[]`; il ne porte pas directement les propriétés contextualisées.

### D3 — Business View et ProfileRuntime restent distincts

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ]** pour leurs responsabilités actuellement documentées et démontrées.

Ils ne doivent pas être fusionnés pour construire le modèle Business.

### D4 — Pas de `BusinessObjectViewpoint` anticipé

Statut : **[NON IMPLÉMENTÉ]**

E4c démontre qu'au moins la contextualisation minimale des descripteurs de propriétés est dérivable avec les abstractions existantes : même `BusinessObject`, mêmes `typeRefs[]`, deux `ProfileRuntime`, propriétés différentes, sans `BusinessObjectViewpoint` explicite.

Le Viewpoint reste donc une lecture logique de la contextualisation tant qu'une expérience distincte ne démontre pas le besoin d'une abstraction persistante/runtime dédiée pour les valeurs, Object Properties, la navigation ou un autre besoin observable.

### D5 — Pas de `BusinessRelation` anticipée

Statut de la décision architecturale : **[NON IMPLÉMENTÉ]**

Object Properties et relations BPMN doivent être éprouvées avant toute nouvelle abstraction relationnelle.

E14 démontre désormais la faisabilité d'une relation BPMN native enrichie.
E15-01 à E15-03 comparent les mécanismes existants sur des fixtures
architecturaux contrôlés. E16-01 et E16-02 démontrent techniquement un
prototype `BusinessRelation` canonique et persistant. Ces résultats ne
remplacent pas le cas produit irréductible exigé par E16 et ne valent donc
pas décision d'adopter `BusinessRelation`.

### D6 — Pas d'artefact repository anticipé

Statut : **[NON IMPLÉMENTÉ]**

La nécessité d'un stockage complémentaire repository doit être démontrée par une information qui ne peut être ni correctement portée par BPMN ni dérivée.

---

## 25. Hypothèses explicitement interdites à ce stade

Ne pas supposer que :

1. toute construction BPMN enrichie est automatiquement un `BusinessObject` sans inspecter le raccord réel ;
2. les propriétés SemArch doivent être déplacées physiquement dans `BusinessObject` ;
3. une Business View est un Viewpoint ISO/IEC/IEEE 42010 complet ;
4. un CoC possède nécessairement un unique `businessViewRef` ;
5. toute Object Property nécessite une `BusinessRelation` ;
6. toute relation métier doit être externalisée hors BPMN ;
7. toute relation BPMN est une représentation d'une relation métier ;
8. toute construction BPMN possède un niveau objet/représentation/occurrence symétrique ;
9. un BO sans représentation exige nécessairement un artefact repository ;
10. une information inter-BPMN exige nécessairement un manifest ;
11. le `RepositoryModel` doit devenir propriétaire des Business Objects ;
12. `semarch:stableGuid` peut servir d'identité BO ;
13. le Viewer doit résoudre un `ProfileRuntime` pour naviguer les informations publiées.

---

## 26. Baseline et frontières du checkpoint 2026-09-18

Baseline globale démontrée après le transport E6 de `RepositoryContext.cocOwner` jusqu'au resolver BO :

```text
71 fichiers de test
323 tests
322 passent
0 échec
```

La régression globale inclut notamment les 10 tests du `BusinessObjectRepresentationStore`, les 10 tests des actions de représentation, les 5 tests de `business-object-contextual-properties.test.js`, les 3 tests de `semarch-business-object-provider.test.js`, le test de `diagram-properties-panel.test.js` et le test de `business-objects-browser-dialog.test.js`.

Acquis à ne pas réimplémenter :

```text
BusinessObject                              [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObject.typeRefs[] 1..n             [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectStore                         [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectRepresentation                [IMPLÉMENTÉ + DÉMONTRÉ]
attach / detach                             [IMPLÉMENTÉ + DÉMONTRÉ]
création interactive BusinessObject         [IMPLÉMENTÉ + DÉMONTRÉ]
Properties Panel attach/detach              [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObject → XML repository             [IMPLÉMENTÉ + DÉMONTRÉ]
XML repository → BusinessObjectStore        [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessObjectRepresentation → XML          [IMPLÉMENTÉ + DÉMONTRÉ]
XML → RepresentationStore                   [IMPLÉMENTÉ + DÉMONTRÉ]
BO↔representation après réouverture         [IMPLÉMENTÉ + DÉMONTRÉ]
Business Objects browser/menu               [IMPLÉMENTÉ + DÉMONTRÉ]
representationId → BusinessObjectRepresentation[0..n] [IMPLÉMENTÉ + DÉMONTRÉ]
representationId → BusinessObject[0..n]     [IMPLÉMENTÉ + DÉMONTRÉ]
BO + ProfileRuntime → descriptors             [IMPLÉMENTÉ + DÉMONTRÉ]
BO + BusinessView → projection contextualisée [IMPLÉMENTÉ + DÉMONTRÉ]
résolution contextuelle BO sans représentation[IMPLÉMENTÉ + DÉMONTRÉ]
deux CoC distincts → même profileRef          [IMPLÉMENTÉ + DÉMONTRÉ]
deux CoC distincts → même profile.id runtime  [IMPLÉMENTÉ + DÉMONTRÉ]
même BO/profil/propertyRef sous deux CoC → même seconde DataProperty sélectionnée [IMPLÉMENTÉ + DÉMONTRÉ]
ActiveProfileRuntime = runtime seulement       [DÉMONTRÉ PAR INSPECTION]
resolver BO reçoit cocId                       [IMPLÉMENTÉ + DÉMONTRÉ]
resolver BO → descriptors : cocId              [IMPLÉMENTÉ + DÉMONTRÉ]
descriptors acceptent cocId                    [IMPLÉMENTÉ + DÉMONTRÉ]
deux cocId distincts atteignent les descriptors [IMPLÉMENTÉ + DÉMONTRÉ]
même BO/profil/propertyRef sous ces deux cocId → même seconde DataProperty [IMPLÉMENTÉ + DÉMONTRÉ]
deux valeurs CoC adressables même propertyRef  [NON IMPLÉMENTÉ]
provider relit cocId depuis RepositoryContext  [IMPLÉMENTÉ + DÉMONTRÉ]
Browser transmet cocId au resolver BO          [IMPLÉMENTÉ + DÉMONTRÉ]
index DataProperty = propertyRef               [DÉMONTRÉ PAR INSPECTION]
descriptors utilisent cocId pour l'adressage   [NON IMPLÉMENTÉ]
régression globale historique 71 / 324         [IMPLÉMENTÉ + DÉMONTRÉ]
frontière écriture historique BO contextualisé → DataProperty sans businessObjectId/cocId [IMPLÉMENTÉ + DÉMONTRÉ]
DataProperty.businessObjectRef optionnel         [IMPLÉMENTÉ + DÉMONTRÉ]
DataProperty.cocRef optionnel                    [IMPLÉMENTÉ + DÉMONTRÉ]
round-trip ownership businessObjectRef + cocRef  [IMPLÉMENTÉ + DÉMONTRÉ]
round-trip DataProperty historique non qualifiée [IMPLÉMENTÉ + DÉMONTRÉ]
régression globale persistance 71 / 326          [IMPLÉMENTÉ + DÉMONTRÉ]
adressage BusinessObject × CoC × propertyRef     [IMPLÉMENTÉ + DÉMONTRÉ]
deux valeurs CoC adressables même propertyRef    [IMPLÉMENTÉ + DÉMONTRÉ]
absence fallback legacy en contexte qualifié     [IMPLÉMENTÉ + DÉMONTRÉ]
écriture businessObjectRef + cocRef              [IMPLÉMENTÉ + DÉMONTRÉ]
isolation écriture BO × CoC éprouvée             [IMPLÉMENTÉ + DÉMONTRÉ]
création générique sans discriminants nuls       [IMPLÉMENTÉ + DÉMONTRÉ]
régression globale ownership 71 / 327            [IMPLÉMENTÉ + DÉMONTRÉ]
semarch:ObjectProperty persistant à 5 références [IMPLÉMENTÉ + DÉMONTRÉ]
round-trip BPMN ObjectProperty à 5 références     [IMPLÉMENTÉ + DÉMONTRÉ]
targetType → canonical BO candidates              [IMPLÉMENTÉ + DÉMONTRÉ]
ObjectProperty BO × CoC × propertyRef read        [IMPLÉMENTÉ + DÉMONTRÉ]
ObjectProperty no-legacy-fallback read            [IMPLÉMENTÉ + DÉMONTRÉ]
targetBusinessObjectRef → UI getValue             [IMPLÉMENTÉ + DÉMONTRÉ]
ObjectProperty SelectEntry activé                 [IMPLÉMENTÉ + DÉMONTRÉ]
mise à jour relation ObjectProperty qualifiée     [IMPLÉMENTÉ + DÉMONTRÉ]
création ObjectProperty qualifiée à 5 références  [IMPLÉMENTÉ + DÉMONTRÉ]
régression frontière objet 4 fichiers / 40 tests  [IMPLÉMENTÉ + DÉMONTRÉ]
régression globale ObjectProperty 71 / 337         [IMPLÉMENTÉ + DÉMONTRÉ]
ObjectProperty persistée → BO canonique           [IMPLÉMENTÉ + DÉMONTRÉ]
action UI ObjectProperty → inspection BO cible    [IMPLÉMENTÉ + DÉMONTRÉ]
raccord navigation composition → provider         [IMPLÉMENTÉ + DÉMONTRÉ]
régression globale navigation E10 71 / 358         [IMPLÉMENTÉ + DÉMONTRÉ]
E10 complet                                        [IMPLÉMENTÉ + DÉMONTRÉ]
BO sans représentation → XML → Store        [IMPLÉMENTÉ + DÉMONTRÉ]
BO sans représentation listé/sélectionné Browser [IMPLÉMENTÉ + DÉMONTRÉ]
Browser → BO choisi → inspection contextualisée [IMPLÉMENTÉ + DÉMONTRÉ]
BO canonique → rendu contextualisé              [IMPLÉMENTÉ + DÉMONTRÉ]
BO + DataProperty[] → valeur contextualisée        [IMPLÉMENTÉ + DÉMONTRÉ]
BPMN → semanticObject → BO attachés[0..n]            [IMPLÉMENTÉ + DÉMONTRÉ]
BPMN → BO attachés → DataProperty[] → descriptors    [IMPLÉMENTÉ + DÉMONTRÉ]
multi-BO même représentation → résolutions distinctes [IMPLÉMENTÉ + DÉMONTRÉ]
édition DataProperty existante via entrée BO            [IMPLÉMENTÉ + DÉMONTRÉ]
collision de `DataProperty` de même `propertyRef` → dernière instance sélectionnée [IMPLÉMENTÉ + DÉMONTRÉ]
première instance de la collision non adressable par le resolver [IMPLÉMENTÉ + DÉMONTRÉ]
régression globale 71 fichiers / 320 tests            [IMPLÉMENTÉ + DÉMONTRÉ]
```

Frontières ouvertes au checkpoint :

```text
ActiveBusinessObject                        [NON IMPLÉMENTÉ]
caractérisation BPMN du contenu métier      [NON IMPLÉMENTÉ]
BusinessRelation — faisabilité technique     [IMPLÉMENTÉ + DÉMONTRÉ]
BusinessRelation — nécessité architecturale  [NON IMPLÉMENTÉ]
repository distribué / manifest             [NON IMPLÉMENTÉ]
navigation Business Object dans Viewer      [NON IMPLÉMENTÉ]
relations métier inter-modèles              [NON IMPLÉMENTÉ]
sémantique métier représentation partagée multi-BO [NON IMPLÉMENTÉ]
ownership/persistance DataProperty contextualisée [IMPLÉMENTÉ + DÉMONTRÉ]
ownership DataProperty BusinessObject × CoC       [IMPLÉMENTÉ + DÉMONTRÉ]
isolation écriture DataProperty multi-BO × CoC éprouvée [IMPLÉMENTÉ + DÉMONTRÉ]
ObjectProperty contextualisée                     [IMPLÉMENTÉ + DÉMONTRÉ]
migration DataProperty historiques non qualifiées [IMPLÉMENTÉ + DÉMONTRÉ]
migration ObjectProperty historiques non qualifiées [IMPLÉMENTÉ + DÉMONTRÉ]
E6 complet                                        [IMPLÉMENTÉ + DÉMONTRÉ]
```

Le repository BPMN monofichier courant est un support canonique démontré pour le vertical actuel. Il ne tranche pas la localisation finale des informations qui dépassent ce périmètre.

---

## 27. Prochaine expérience atomique

La frontière dérivée `BusinessObject + ProfileRuntime + BusinessView optionnelle → descripteurs` est désormais démontrée indépendamment de BPMN. Elle constitue la primitive commune pour poursuivre E6 et E12 sans créer de `BusinessObjectViewpoint` persistant ni d'`ActiveBusinessObject`.

E6 démontre désormais le raccord du sujet BPMN aux BO canoniques attachés sans réduire la cardinalité : `representationId` peut résoudre `BusinessObject[0..n]`, chaque BO est conservé comme sujet distinct et résolu séparément avec le contexte actif et les `DataProperty[]` du `semanticObject`. Il reste interdit de sélectionner arbitrairement le premier BO ou de fusionner silencieusement leurs `typeRefs[]`.

E12 démontre désormais que le BO canonique peut être sérialisé/reprojeté sans lien de représentation, listé et explicitement sélectionné dans le Business Objects Browser, puis inspecté via la frontière contextualisée avec le `ProfileRuntime` et la `BusinessView` actifs. La composition produit installée raccorde le BO choisi au resolver puis à `diagramPropertiesPanel.showBusinessObject(...)`. Cela ne justifie ni `BusinessObjectViewpoint` persistant, ni stockage repository complémentaire, ni représentation BPMN artificielle.

E12 est donc fermé pour le chemin produit d'inspection contextualisée. La composition de bout en bout est démontrée par inspection du code produit et par les tests ciblés de ses frontières ; aucun test unique ne simule encore le clic utilisateur à travers tout `main.js`.

E13 démontre désormais le round-trip de persistance d'un BO canonique avec zéro représentation : sérialisation en BPMN XML, réimport dans une nouvelle instance `BpmnModdle`, puis reconstruction dans de nouveaux stores avec le même `BusinessObject.id`, les mêmes `typeRefs[]` et toujours zéro représentation. Cette preuve ne simule pas un cycle UI complet de fermeture/réouverture de l'application.

E8 démontre désormais qu'une `DataProperty` existante peut être raccordée par `propertyRef` aux descripteurs du BO contextualisé : la même instance et sa valeur sont accessibles depuis le descripteur sans mutation du BO canonique. Cette preuve réutilise le mécanisme existant et n'introduit ni `BusinessObjectViewpoint` persistant ni nouveau stockage.

E6 démontre désormais la chaîne de lecture `BPMN sélectionné → semanticObject → BusinessObject[0..n] attachés → DataProperty[] → resolver` ainsi que la lecture puis l'édition d'une `DataProperty` existante depuis une entrée contextualisée BO : **[IMPLÉMENTÉ + DÉMONTRÉ]**. E6 reste néanmoins incomplet sur la sémantique d'ownership/persistance contextualisée : dans le cas multi-BO éprouvé, les deux entrées BO conservent la même instance `DataProperty`, et l'écriture met à jour cette instance BPMN/SemArch existante. La preuve ne permet donc pas d'attribuer la valeur à un BO particulier ou à une abstraction Viewpoint persistante. Lorsque `representationId` résout plusieurs BO, aucun BO ne doit être sélectionné arbitrairement et aucune fusion de leurs `typeRefs[]` ne doit être introduite.

La caractérisation de collision démontre en outre que le raccord actuel ne permet pas d’adresser deux valeurs distinctes portant le même `propertyRef` dans un même tableau `DataProperty[]` : le resolver sélectionne la dernière instance rencontrée et la première n’est plus adressable par le descripteur correspondant. Cette limite est **[IMPLÉMENTÉ + DÉMONTRÉ]** par test et régression globale 71 fichiers / 320 tests.

La caractérisation CoC suivante démontre que cette collision demeure lorsque le même BO et le même profil sont résolus sous deux `CoCConfiguration` distinctes : les deux contextes sélectionnent la même seconde `DataProperty`. L'inspection du chemin actif établit que `cocOwner` est transmis comme `cocId` à l'activation, mais que `ActiveProfileRuntime` ne conserve que le runtime et que `resolveBusinessObjectContextualProperties(...)` ne reçoit pas `cocId`. Régression globale correspondante : 71 fichiers / 322 tests / 322 passent / 0 échec. L'adressage de deux valeurs par CoC, l'ownership `BusinessObject × CoC`, l'isolation des valeurs multi-BO × CoC et E6 complet restent **[NON IMPLÉMENTÉ]**.

Cette preuve ne choisit pas encore la forme du discriminant ni son lieu de persistance. Elle ne justifie pas de transformer `ActiveProfileRuntime`, d'ajouter immédiatement `cocRef` à `DataProperty` ou de créer une classe `BusinessObjectViewpoint`.

L'étape de transport suivante conserve précisément cette contrainte : `RepositoryContext.cocOwner` reste la source persistante, une fonction de lecture est transportée dans la composition Editor, le Properties Provider relit le contexte courant à chaque résolution et `cocId` atteint désormais `resolveBusinessObjectContextualProperties(...)`. Le Browser fournit également ce `cocId`. Cette évolution est **[IMPLÉMENTÉ + DÉMONTRÉ]** avec 71 fichiers / 323 tests / 323 passes / 0 échec. Elle ne fournit encore aucun mécanisme d'adressage CoC dans les descripteurs et ne change donc pas les conclusions d'ownership/persistance.

La caractérisation suivante démontre la limite après ce transport : `cocId` est désormais accepté par `createSemArchPropertyDescriptors(...)` et deux identités CoC distinctes atteignent effectivement cette frontière, mais `indexExistingProperties(...)` continue d'indexer les `DataProperty` uniquement par `propertyRef`. Avec deux candidates de même `propertyRef`, les deux contextes sélectionnent donc toujours la même seconde instance. La régression reste 71 fichiers / 323 tests / 323 passes / 0 échec. Le transport n'est plus le verrou ; l'utilisation de `cocId` pour l'adressage, le discriminant porté par les valeurs, l'ownership `BusinessObject × CoC`, l'isolation multi-BO × CoC et E6 complet restent **[NON IMPLÉMENTÉ]**.

La caractérisation de la frontière d'écriture démontre maintenant le verrou suivant sans modifier le modèle : pour un BO attaché, `businessObject` et `cocId` sont disponibles pendant la résolution, mais l'entrée contextualisée et la `DataProperty` nouvellement créée ne portent aucun de ces deux discriminants. L'écriture persiste donc encore `propertyRef + schemaRef + value` sur le `semanticObject` BPMN partagé : **[IMPLÉMENTÉ + DÉMONTRÉ]**, avec 1 fichier / 22 tests ciblés et une régression globale de 71 fichiers / 324 tests / 324 passes / 0 échec.

La prochaine question atomique devient le discriminant minimal permettant d'attribuer et d'adresser une valeur contextualisée à `BusinessObject × CoC` sans confondre cet axe avec la représentation BPMN, sans repurposer `ActiveProfileRuntime`, `Meta.cocRef` ou `BusinessView`, et sans créer prématurément un `BusinessObjectViewpoint` persistant. La forme exacte du discriminant, la compatibilité des `DataProperty` historiques non qualifiées et son lieu de persistance restent à éprouver : **[NON IMPLÉMENTÉ]**.

La séquence de preuve suivante résout ce verrou sans créer de `BusinessObjectViewpoint` persistant. `DataProperty.businessObjectRef` et `DataProperty.cocRef` sont d'abord ajoutés comme discriminants optionnels et leur round-trip est démontré, tout comme la compatibilité pure d'une `DataProperty` historique non qualifiée. Régression correspondante : 71 fichiers / 326 tests / 326 passes / 0 échec.

Les descripteurs utilisent ensuite `BusinessObject.id + cocId + propertyRef` pour sélectionner une valeur qualifiée. Les cas éprouvés distinguent `BO-1/coc-a` de `BO-1/coc-b`, excluent `BO-2/coc-a` et n'appliquent aucun fallback vers une valeur historique non qualifiée lorsque le contexte BO/CoC est complet : **[IMPLÉMENTÉ + DÉMONTRÉ]**. La régression reste 71 fichiers / 326 tests / 326 passes / 0 échec.

Enfin, le Properties Provider transporte les deux dimensions d'ownership jusqu'à la frontière d'écriture. Une nouvelle valeur contextualisée persiste `businessObjectRef` et `cocRef`, tandis que la mise à jour cible uniquement la `DataProperty` qualifiée sélectionnée et laisse intactes les valeurs éprouvées de l'autre CoC et de l'autre BO. Le chemin générique conserve l'ancienne forme sans discriminants lorsque BO/CoC sont absents. Preuve provider : 23 / 23 tests ; régression persistance/adressage : 13 / 13 tests ; régression globale : 71 fichiers / 327 tests / 327 passes / 0 échec.

La branche `DataProperty` de l'ownership `BusinessObject × CoC` est donc **[IMPLÉMENTÉ + DÉMONTRÉ]** dans le périmètre éprouvé. `ObjectProperty` contextualisée, la migration des anciennes valeurs non qualifiées et E6 complet restent **[NON IMPLÉMENTÉ]**.

La séquence ObjectProperty ferme ensuite la frontière relationnelle contextualisée dans le même modèle. La classification XSD distingue une propriété objet lorsque son `@type` résout exactement un `complexType` top-level du même schéma ; le descripteur transporte `kind = object` et `targetType`. L'inversion `schemaType → TypeBinding[0..n]` puis le filtrage des BO canoniques par `typeRefs[]` fournissent tous les candidats compatibles, sans modifier `BusinessObjectStore` et sans confondre type de schéma et identité BO : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Le modèle persistant `semarch:ObjectProperty` et son round-trip BPMN préservent `propertyRef`, `schemaRef`, `businessObjectRef`, `cocRef` et `targetBusinessObjectRef`. La lecture qualifiée sélectionne exactement `BusinessObject × CoC × propertyRef`, sans fallback legacy lorsque le contexte est complet, et expose la cible canonique dans l'entrée ObjectProperty. L'écriture met à jour la relation qualifiée existante ou crée une nouvelle relation portant les cinq références : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

La preuve finale de cette frontière passe avec 26 / 26 tests provider, 40 / 40 tests de régression objet et 71 fichiers / 337 tests globaux, sans erreur `git diff --check`. `ObjectProperty` contextualisée et E9 sont donc **[IMPLÉMENTÉ + DÉMONTRÉ]** dans le périmètre éprouvé. E10 (navigation d'un graphe métier), la migration des valeurs/relations historiques non qualifiées et E6 complet restent **[NON IMPLÉMENTÉ]**.

La prochaine question atomique E6 est désormais la politique de compatibilité/migration des enregistrements historiques non qualifiés. Elle doit être éprouvée séparément ; la règle de lecture qualifiée actuellement démontrée reste explicitement « aucune correspondance qualifiée → aucun fallback legacy » et ne doit pas être modifiée implicitement.

La séquence DataProperty legacy éprouve ensuite cette politique sans modifier la règle de lecture qualifiée. Le prédicat pur `findMigratableLegacyDataProperty(...)` sélectionne uniquement une unique `semarch:DataProperty` totalement non qualifiée du même `propertyRef` lorsque `businessObjectId` et `cocId` sont tous deux disponibles, refuse l'ambiguïté, refuse une collision déjà qualifiée pour le même `BusinessObject × CoC × propertyRef`, exclut les candidates partiellement qualifiées et n'est pas bloqué par des valeurs qualifiées appartenant à un autre BO ou à un autre CoC : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Le Properties Provider utilise ensuite cette candidate uniquement au moment de l'écriture contextualisée. Lorsqu'aucune `DataProperty` qualifiée n'est déjà résolue, la candidate legacy est qualifiée in-place par `modeling.updateModdleProperties(...)` avec `businessObjectRef`, `cocRef` et la nouvelle `value`. Aucune seconde `semarch:DataProperty` n'est créée et l'occurrence moddle existante reste dans `extensionElements.values`. Le transport du candidat de migration préserve l'identité du descripteur existant et la régression ObjectProperty reste verte : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Preuve ciblée finale : 2 fichiers / 42 tests / 42 passent, dont 27 / 27 tests provider et 15 / 15 tests du resolver contextualisé. Régression globale : 71 fichiers / 346 tests / 346 passent / 0 échec. `git diff --check` ne signale aucune erreur : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

SHA du snapshot démontré :
- `src/properties/business-object-contextual-properties.js` : `6e7c9a0a5798f5f0a31417159749179c5c7be93afa8c7698027b2e92a7f405a8`
- `src/properties/business-object-contextual-properties.test.js` : `41e0815fe023546e4dac85d5e2cc068b90dc20b0774edb3be7015c6d3c4ba33c`
- `src/properties/semarch-properties-provider.js` : `19753f2028b33ffbdc9955080844784760c152fe33e0676241e14b3031cae2d5`
- `src/properties/semarch-properties-provider.test.js` : `1a176c1b5ab4748309c414459cfbe5236534a4456e757c1f5c0f9acb0ffc136f`

Archive de preuve gelée : `BPMNSM_E6_LEGACY_DATAPROPERTY_MUTATION_PROOF.zip`, SHA-256 `4395c45fa1ee251c080810df8eeae2db3379fa1038ee1c2de51bf1fa2ee1cefe`, 4 fichiers / 146107 octets.

La migration des `DataProperty` historiques non qualifiées est donc **[IMPLÉMENTÉ + DÉMONTRÉ]** dans ce périmètre. La migration des relations `ObjectProperty` historiques non qualifiées reste **[NON IMPLÉMENTÉ]** ; E6 complet reste par conséquent **[NON IMPLÉMENTÉ]**. La règle de lecture qualifiée demeure inchangée : aucune correspondance qualifiée n'entraîne aucun fallback legacy.

La prochaine question atomique E6 devient la politique de migration des `ObjectProperty` historiques non qualifiées, à éprouver séparément sans confondre la cible canonique `targetBusinessObjectRef` avec la représentation BPMN.

La séquence ObjectProperty legacy éprouve cette dernière frontière de compatibilité sans modifier la règle de lecture qualifiée. Le prédicat pur `findMigratableLegacyObjectProperty(...)` sélectionne uniquement une unique `semarch:ObjectProperty` totalement non qualifiée du même `propertyRef` lorsque `businessObjectId` et `cocId` sont tous deux disponibles, refuse l'ambiguïté, refuse une collision déjà qualifiée pour le même `BusinessObject × CoC × propertyRef`, exclut les relations partiellement qualifiées et n'est pas bloqué par des relations qualifiées appartenant à un autre BO ou à un autre CoC : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Le Properties Provider utilise cette candidate uniquement au moment de l'écriture contextualisée. Lorsqu'aucune `ObjectProperty` qualifiée n'est déjà résolue, la relation legacy est qualifiée in-place par `modeling.updateModdleProperties(...)` avec `businessObjectRef`, `cocRef` et le nouveau `targetBusinessObjectRef`. Aucune seconde `semarch:ObjectProperty` n'est créée et l'occurrence moddle existante reste dans `extensionElements.values`. La cible reste une identité canonique `BusinessObject.id` ; aucune représentation BPMN n'est utilisée comme cible métier : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Preuve ciblée finale : 2 fichiers / 51 tests / 51 passent, dont 28 / 28 tests provider et 23 / 23 tests du resolver contextualisé. Régression globale : 71 fichiers / 355 tests / 355 passent / 0 échec. Après suppression de l'unique ligne blanche terminale supplémentaire du test resolver, `git diff --check` ne signale aucune erreur et la preuve atteint son état Git circonscrit : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

SHA du snapshot ObjectProperty legacy démontré :
- `src/properties/business-object-contextual-properties.js` : `5e92bcbe00a020d494bc124ad7357eaabed93f22ac850fa9f33627523038f4c0`
- `src/properties/business-object-contextual-properties.test.js` : `9854a64e233e6f1905c7b2dfdfb98a241ca59f076b371f6bd30869cf4d4ab758`
- `src/properties/semarch-properties-provider.js` : `7074590efb9822009e3939d19e61a96551dc9c22abf0cc34179c1358c23fe7d9`
- `src/properties/semarch-properties-provider.test.js` : `77442922b66335bc386f3a95849837fda8758cb4499b08ca58c5a8265de4c141`

La migration des relations `ObjectProperty` historiques non qualifiées est donc **[IMPLÉMENTÉ + DÉMONTRÉ]** dans ce périmètre. Avec la migration `DataProperty` déjà démontrée, les frontières explicitement suivies sous E6 dans ce registre sont désormais fermées : E6 complet passe à **[IMPLÉMENTÉ + DÉMONTRÉ]**. Les limites historiques conservées plus haut restent des checkpoints de leur époque et ne sont pas réécrites rétroactivement. La règle de lecture qualifiée demeure inchangée : aucune correspondance qualifiée n'entraîne aucun fallback legacy.

La frontière E10 est ensuite éprouvée séparément de la fermeture E6. `resolveBusinessObjectNavigationTargets(...)` résout une `ObjectProperty` contextualisée persistée vers le BO canonique cible. Une action UI explicite `HeaderButton` est raccordée par `businessObjectNavigationActions` depuis la composition jusqu'au Properties Provider et rappelle le pipeline partagé `showBusinessObject(...)` pour inspecter ce BO cible : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Preuve E10 : 29 / 29 tests provider ciblés ; régression globale 71 fichiers / 358 tests / 358 passent / 0 échec ; `git diff --check` silencieux. E10 complet passe donc à **[IMPLÉMENTÉ + DÉMONTRÉ]**. La navigation Business publiée dans le Viewer reste suivie séparément sous E20 et demeure **[NON IMPLÉMENTÉ]**.

---

## 28. Business Model Explorer — décision produit et cible UI — 2026-09-20

### 28.1 Décision produit

Le `Business Objects Browser` actuel reste une sonde produit et un précédent fonctionnel. La cible suivante n'est pas d'étendre son HTML ad hoc, mais de faire émerger un **Business Model Explorer** centré d'abord sur les `BusinessObject`.

Deux portes d'entrée complémentaires doivent manipuler le même modèle canonique et les mêmes actions applicatives :

- depuis le diagramme BPMN, créer, attacher, consulter et naviguer vers les Business Objects et leurs informations associées dans le contexte du modèle ;
- depuis le Business Model Explorer, créer, interroger, éditer et naviguer parmi les Business Objects, y compris ceux qui n'ont aucune représentation BPMN, puis retrouver leurs représentations, relations et usages BPMN.

Aucun modèle métier parallèle ne doit être introduit pour ces deux accès.

### 28.2 Cible w2ui v2

Le Business Model Explorer doit utiliser les widgets **w2ui v2** comme infrastructure UI native :

- `w2layout` et des panes appropriés pour la composition master/detail ;
- `w2grid` pour les vues tabulaires ;
- `w2form` pour la création et l'édition ;
- toolbar, sélection, navigation et autres widgets w2ui lorsque leur usage est pertinent.

Les grilles doivent exploiter les fonctions avancées de w2ui v2 : recherche globale et structurée, filtres combinables, tris, sélection, colonnes configurables/redimensionnables et actions contextuelles. BPMNSM ne doit pas réimplémenter localement ce que w2ui fournit correctement.

La première perspective est **Business Objects**. Les perspectives futures `Business Relations`, `BPMN Usages` et `Information/Data` devront être des projections du même modèle, non des modèles indépendants.

### 28.3 Projection dynamique et introspection

Les tableaux ne doivent pas être entièrement codés en dur. Une couche de projection indépendante de w2ui doit combiner :

1. le schéma/profil sémantique : types, propriétés, labels, datatypes, cardinalités, Object Properties et métadonnées applicables ;
2. le Business Model : Business Objects, Business Relations, valeurs, représentations et faits canoniques ;
3. le BPMN courant : collaborations, processus, activités, MessageFlows, DataObjects, DataStores, occurrences, Data Associations et enrichissements sémantiques lorsqu'ils sont démontrés.

Cette projection doit pouvoir produire au minimum des descripteurs de colonnes et de recherches, des records, des facettes et des cibles de navigation. Les records doivent rester des données structurées et non du HTML préformaté afin de préserver recherche, tri, filtrage, export et réutilisation.

L'introspection détermine les **capacités disponibles**, pas toutes les colonnes visibles par défaut. La perspective choisit un noyau lisible et rend les autres dimensions accessibles par choix de colonnes, filtres, recherche avancée ou vues spécialisées.

### 28.4 Provenance, dérivation et éditabilité

La projection doit préserver la provenance de l'information. Les catégories minimales retenues sont :

- `identity` ;
- `schema` ;
- `business-model` ;
- `representation` ;
- `bpmn-native` ;
- `bpmn-derived`.

Cette provenance participe à l'UX et à l'éditabilité. Une `BusinessRelation` est modifiée via les actions BusinessRelation ; un lien de représentation via les actions de représentation ; une propriété de schéma selon son contrat ; un usage BPMN dérivé reste en lecture/navigation et se modifie à la source BPMN appropriée.

Les faits dérivables de BPMN ne doivent pas être dupliqués en `BusinessRelation` pour faciliter l'affichage d'une grille.

### 28.5 Première tranche UI-01

La première tranche d'implémentation doit rester bornée :

- grille w2ui v2 centrée sur les Business Objects ;
- identité et types ;
- représentations BPMN ;
- relations entrantes/sortantes ;
- premiers usages/occurrences BPMN déjà démontrables ;
- sélection d'un BO et détail dans un pane approprié ;
- descripteurs de colonnes/recherches issus d'une projection séparée du widget.

Elle ne doit pas introduire prématurément un moteur universel de relations BPMN, `use/serve`, une relation Application–Information non démontrée, un second modèle persistant ou une nouvelle abstraction repository.

Le besoin utilisateur visé est l'exploration transversale : rechercher, filtrer et trier les objets, puis répondre progressivement à des questions telles que « où cette information est-elle utilisée ? », « où est-elle stockée ? », « quelles activités la lisent ou la produisent ? », « dans quels processus/collaborations intervient-elle ? » ou « quelles applications constituent ce Path ? ».

**Statut : [DÉCISION DE CIBLE — À IMPLÉMENTER ET DÉMONTRER].**

---


## 29. Identité canonique et création Business Object — décision démontrée — 2026-09-20

Les checkpoints historiques décrivant `BusinessObject { id, typeRefs[] }` restent inchangés. Le contrat canonique démontré a depuis évolué de manière compatible vers :

```text
BusinessObject
    id
    name?
    typeRefs[] 1..n
```

`name` est un libellé métier humain optionnel, normalisé séparément de `id`. Il n'est pas une identité, son unicité n'est pas requise et un BO historique dépourvu de `name` reste valide. Le round-trip BPMN XML réel préserve un UUID canonique et le `name` optionnel, puis reconstruit exactement les BO dans de nouveaux stores après réouverture : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Le générateur central `src/identity/guid-generator.js` est le précédent BPMNSM établi pour les nouvelles identités UUID canoniques. Sa génération sécurisée, son fallback `crypto.getRandomValues`, les bits UUID v4/RFC 4122, l'échec en l'absence de source cryptographique sûre et la normalisation des GUID sont couverts par 6 tests : **[IMPLÉMENTÉ + DÉMONTRÉ]**. Cette preuve n'impose pas rétroactivement le format UUID aux identifiants historiques ou importés.

La création produit d'un nouveau Business Object ne demande plus son identifiant à l'utilisateur. Le dialogue recueille `name + typeRefs[]`; la frontière applicative génère `id` avec `createGuid()` immédiatement avant l'ajout au `BusinessObjectStore`. `createBusinessObject()` continue d'exiger un `id` explicite et ne génère pas d'identité implicitement. La régression identité/BO/XML passe 5 fichiers / 26 tests / 0 échec, le build standalone Editor réussit et `git diff --check` est silencieux. La preuve runtime produit a en outre créé deux BO portant le même nom avec deux UUID distincts : **[IMPLÉMENTÉ + DÉMONTRÉ]**.

Invariants acquis :

```text
BusinessObject.id      = identité canonique BPMNSM opaque
BusinessObject.name    = libellé humain optionnel, éditable, non unique
name                   ≠ identity
new BPMNSM BO id       = UUID généré par createGuid()
imported/historical id = conservé ; pas de migration UUID implicite
```

Frontières explicitement ouvertes : un modèle sérialisable d'`Origin`, la conservation lossless des identités externes et leur rattachement à un Origin, la qualification multi-document de `BusinessObjectRepresentation`, ainsi que la ressource Business Model autonome et son format physique restent **[NON IMPLÉMENTÉ]**. Les identités externes ne doivent pas être transformées en identités BPMNSM ; leur modèle exact doit être éprouvé séparément.

---

## 30. Règle de maintenance de ce registre

Après chaque expérience :

1. mettre à jour uniquement les entrées dont le statut ou la preuve a réellement changé ;
2. conserver les hypothèses réfutées ;
3. renseigner la localisation de l'information uniquement lorsqu'elle est démontrée ;
4. mettre à jour la prochaine question atomique ;
5. ne jamais réécrire rétroactivement une absence de preuve comme si elle avait été acquise ;
6. conserver les trois statuts de preuve autorisés ;
7. faire évoluer la cible si l'implémentation la réfute.

Ce document est donc volontairement falsifiable : l'objectif n'est pas de forcer l'implémentation à correspondre au schéma initial, mais d'utiliser l'implémentation réelle pour déterminer progressivement le modèle Business correct de BPMNSM.

## 31. Capitalisation Business Model et Local Workspace — 2026-09-21

### 31.1 E16 — nécessité de `BusinessRelation`

Le gate E16 est désormais **[IMPLÉMENTÉ + DÉMONTRÉ]** sur un cas produit réel et irréductible dans la frontière Business Model :

```text
Path --demo:aggregation--> Application
```

Le cas produit `Realized Flow.path` distingue la topologie BPMN native de la sémantique métier autonome : le `MessageFlow` reste natif BPMN, `Realized Flow.path` est une ObjectProperty locale vers un `Path`, et la composition du Path par plusieurs Applications est portée par des `BusinessRelation` canoniques. La preuve produit reconstruit 4 Business Objects et 3 Business Relations après round-trip, sans utiliser `BusinessObjectRepresentation`, `ObjectProperty` ou une relation BPMN comme substitut de ces relations autonomes. La régression verticale associée passe 7 fichiers / 66 tests / 0 échec.

Conséquence architecturale : `BusinessRelation` est nécessaire pour les faits métier BO→BO autonomes qui ne sont ni correctement portés par une relation BPMN native éventuellement enrichie, ni contextuels à une propriété, ni dérivables sans ambiguïté. Cela ne transforme pas toute relation en `BusinessRelation`.

E15 reste **[NON IMPLÉMENTÉ]** au sens strict du critère autoritaire « comparaison de cas produit réels » ; E15-01/02/03 restent des preuves architecturales contrôlées. E17-01 reste parqué.

### 31.2 Ressource Business Model autonome

Les expériences suivantes sont désormais acquises :

- `BUSINESS-MODEL-RESOURCE-01` : frontière logique autonome regroupant Business Objects, Business Relations, Identity Origins et Business Object External Identities — **[DÉMONTRÉ]** ;
- `BUSINESS-MODEL-DOCUMENT-01` : projection/reconstruction format-agnostique — **[IMPLÉMENTÉ + DÉMONTRÉ]** ;
- `BUSINESS-MODEL-JSON-CODEC-01` : codec JSON physique déterministe `formatVersion: "1"` — **[IMPLÉMENTÉ + DÉMONTRÉ]** ;
- `BUSINESS-MODEL-REPOSITORY-DOCUMENT-01` : coexistence d'une ressource Business Model JSON avec BPMN XML et ArchiMate XML dans le store générique — **[DÉMONTRÉ]**.

Le Business Model autonome n'est donc plus une cible hypothétique. Le format physique démontré est un fichier `*.business.json`. Il ne doit pas être confondu avec le modèle de session ni avec un format d'échange universel définitivement figé.

### 31.3 Business Model Explorer

La tranche UI-01 décrite en section 28 a franchi la cible initiale : le Business Model Explorer w2ui v2 est présent comme vue centrale, avec projection dynamique des Business Objects, types, représentations, relations et usages BPMN disponibles. Le chargement initial et le refresh après création d'un BO ont été démontrés en runtime.

**Statut UI-01 / UI-01A / UI-01B : [IMPLÉMENTÉ + DÉMONTRÉ] dans leurs frontières documentées.**

### 31.4 Local Workspace LW01–LW12

La trajectoire Local Workspace a été menée par expériences atomiques :

| Expérience | Résultat démontré |
| --- | --- |
| LW01 | sélection d'un répertoire arbitraire autorisé, écriture/lecture exacte d'un fichier preuve |
| LW02 | inventaire physique récursif des chemins relatifs |
| LW03 | classification minimale `.bpmn`, `.archimate`, `.business.json`, sinon `unknown` |
| LW04 | lecture et parsing réel d'un Business Model JSON |
| LW05 | création de `RepositoryDocument` depuis les ressources reconnues, chemin relatif préservé |
| LW06 | projection d'un premier BPMN physique dans le RepositoryModel |
| LW07 | projection séquentielle de plusieurs BPMN avec navigation entre projections |
| LW08 | ouverture d'une ressource ArchiMate réelle via la composition existante, sans nouveau registre ArchiMate |
| LW09 | sauvegarde physique d'un RepositoryDocument dirty avec relecture exacte |
| LW10 | Save Local Workspace multi-document au niveau repository |
| LW11 | Business Model physique → parsing → stores canoniques BO/BR → Business Model Explorer |
| LW12 | mutation BO canonique → sérialisation Business Model → RepositoryDocument dirty → Save physique → codec reopen → fresh reload → même Business Model |

**LW01 à LW12 : [IMPLÉMENTÉ + DÉMONTRÉ] dans leurs frontières respectives**, LW08 n'ayant requis aucune modification de production.

La preuve runtime finale LW12 part du fixture `2 BO + 1 BR`, crée `LW12 Persisted Application`, sauvegarde `enterprise.business.json`, vérifie physiquement et par codec `3 BO + 1 BR`, puis recharge une session fraîche qui retrouve les trois BO et la relation `Path --demo:aggregation--> Application`. Le SHA physique observé après Save est `ab037f1d50db009a66ea1cdcb245d5c80af7021b5fa71a99957816cd9348db75`.

LW12 préserve les collections `identityOrigins` et `businessObjectExternalIdentities` du document chargé pendant une mutation BO/BR. Cette limite historique est fermée par M5 : ces deux collections disposent désormais d'un état canonique actif de session ; M5 n'introduit toutefois pas d'interface d'édition dédiée.

### 31.5 Frontière encore ouverte avant LW13

LW12 ne démontre pas encore l'équivalence canonique complète d'un repository hétérogène. Restent notamment à éprouver :

- identité et persistance multi-document des `BusinessObjectRepresentation` ;
- ambiguïté potentielle du contrat actuel `{ businessObjectId, representationId }` lorsque deux documents BPMN réutilisent le même identifiant BPMN ;
- round-trip canonique conjoint BO/BR + représentations + enrichissements BPMN + plusieurs BPMN + ArchiMate ;
- interface d'édition dédiée des Identity Origins et identités externes ;
- création conventionnelle de nouvelles ressources et affectation de leur chemin physique.

**LW13 n'est pas lancé à ce checkpoint.** La prochaine expérience doit commencer par l'inspection ciblée du lien BO ↔ représentation BPMN et de sa persistance multi-document, après publication/capitalisation du checkpoint courant.

### 31.6 Contrat cible — import sémantique progressif et non destructif

Cette section complète la frontière ouverte avant LW13 et fixe le contrat à éprouver pendant l'itération de maturation Workspace / Repository / Import. Elle ne déclare pas ces propriétés implémentées : chacune doit être vérifiée par inspection puis par expérience falsifiable minimale.

Principe cible : **un import ajoute de la connaissance au Repository actif sans supprimer silencieusement une connaissance existante ni perdre une référence valide qu'il ne peut pas encore résoudre**. Un BPMN produit par BPMNSM peut transporter des références et enrichissements sémantiques plus complets qu'un export EA ; il doit rester importable même lorsque certaines ressources pointées ne sont pas encore présentes dans le Repository.

Trois états conceptuels sont distingués :

- `resolved` : la ressource est identifiable et sa définition nécessaire est disponible ;
- `unresolved` / **à compléter** : une référence ou identité exploitable est conservée, mais la définition cible est absente ou insuffisante ;
- `conflict` : des informations incompatibles ne peuvent pas être réconciliées sans décision explicite.

Une cible absente n'est donc pas, à elle seule, une erreur d'import. La référence doit rester représentable, navigable autant que possible, persistable et réouvrable sans perte. Un import ultérieur peut résoudre ou enrichir la ressource lorsque son identité permet d'établir la correspondance sans ambiguïté. Les liens déjà établis doivent survivre à cet enrichissement.

Une information absente, une valeur non renseignée ou un élément sans description complète n'est pas, à lui seul, synonyme d'une référence `unresolved`. L'état `unresolved` concerne une référence ou identité exploitable dont la définition cible nécessaire est absente ou insuffisante. Cette distinction reste générique et ne crée aucune exigence liée à une technologie de graphe particulière.

La règle de résolution automatique de cette itération est volontairement conservatrice : **fusion/enrichissement automatique uniquement lorsque l'identité établit la correspondance sans ambiguïté**. Une propriété absente peut être complétée et des informations compatibles peuvent enrichir la ressource. Aucune fusion automatique ne doit reposer uniquement sur le nom, le libellé ou une similarité lexicale. Une contradiction non réconciliable doit devenir explicite ; aucune politique silencieuse `last import wins` n'est admise comme contrat cible.

Le document physique reste distinct de la connaissance projetée. Un `RepositoryDocument` BPMN peut contenir plusieurs Process/Collaboration et contribuer simultanément des références sémantiques au Repository. L'import ne doit pas créer mécaniquement un document par composant ni confondre l'unité de persistance avec les Business Objects ou relations référencés.

Scénario de preuve cible minimal : un premier import BPMNSM apporte un processus référençant une ressource absente ; l'import réussit et conserve cette référence ; la sauvegarde puis la réouverture la préservent ; un second import apporte une définition dont l'identité correspond sans ambiguïté ; la ressource est enrichie/résolue sans perte du lien initial. Des expériences séparées doivent couvrir les cas de conflit pertinents afin de vérifier qu'aucune fusion ou écrasement silencieux n'a lieu.

Cette cible ne préjuge pas du propriétaire canonique final de chaque propriété entre BPMN enrichi, Business Model autonome et autres ressources. Cette ownership doit être inspectée et démontrée avant toute stratégie de fusion plus large. Elle ne relance pas LW13 : la qualification multi-document de `BusinessObjectRepresentation` reste suspendue jusqu'à décision explicite après cette itération ou jusqu'à ce qu'une expérience de cette itération exige de l'aborder.


### 31.7 Capitalisation M2–M3 — import progressif démontré dans sa frontière

Le contrat cible de 31.6 est désormais **partiellement démontré par code et tests**, et non plus seulement spécifié.

L'import BPMN progressif conserve les informations sémantiques valides lorsque leurs Business Objects de référence ne sont pas encore présents. Une relation dont les extrémités sont absentes reste conservée pour résolution ultérieure au lieu d'être supprimée. L'accumulation de Business Objects est fondée sur l'identité : une identité déjà connue peut être enrichie par des informations compatibles sans duplication ; une contradiction éprouvée devient un résultat `conflict` et ne déclenche pas de politique silencieuse `last import wins`. La simple similarité de nom/libellé n'est pas utilisée comme règle de fusion automatique.

M3 démontre le scénario persistant minimal : une connaissance `unresolved` est sérialisée dans un Workspace Archive, réouverte sans perte, puis un import ultérieur apportant l'identité correspondante permet son état `resolved/enriched`. Le scénario éprouvé préserve le lien initial et évite la duplication de l'identité correspondante. L'état unresolved est considéré comme un état normal du modèle d'import progressif et n'est plus signalé systématiquement comme bruit diagnostique console.

Le contrat physique est démontré en parallèle : un même `RepositoryDocument` BPMN peut produire plusieurs composants Repository associés au même `documentId`. L'unité de connaissance projetée ne provoque donc pas un split implicite de l'unité documentaire/persistée.

La preuve finale M3 FIX2 comprend notamment les tests d'accumulation sémantique, d'import BPMN progressif, de persistance sémantique Archive et de document BPMN multi-composants, dans une campagne groupée de 13 fichiers / 46 tests tous verts.

Cette démonstration **ne clôt pas tout 31.6**. la qualification complète des conflits au-delà des propriétés couvertes par l'expérience reste ouverte ; l'ownership canonique final des propriétés entre BPMN enrichi, Business Model autonome et autres ressources n'est pas tranché ; la portée multi-document de `BusinessObjectRepresentation` reste la frontière LW13 déjà identifiée. En particulier, aucune règle de fusion plus large ne doit être inférée de la réussite du scénario d'identité éprouvé.

LW13 reste suspendu jusqu'à décision explicite sur la prochaine itération de maturation.

### 31.8 Capitalisation M4 — Import enrichit, Save persiste en Direct Folder

M4 est **[IMPLÉMENTÉ + DÉMONTRÉ]** pour la frontière physique suivante :
l'import d'un nouveau document dans un Workspace Folder enrichit d'abord le
Repository actif ; sa matérialisation physique est différée jusqu'à
`Save Workspace Folder`.

Cette séparation renforce la distinction déjà retenue entre connaissance
logique et support physique. Un `RepositoryDocument` importé peut donc exister
dans le Repository et être dirty avant que son fichier n'existe dans le
dossier. Lors du Save, `RepositoryDocument.fileName` fournit le chemin relatif
de persistance. La résolution des segments et la création éventuelle des
répertoires intermédiaires sont indépendantes du kind BPMN/ArchiMate ; les
chemins susceptibles de sortir ou d'altérer la racine logique du Workspace
sont rejetés.

La règle de confirmation physique reste stricte : le document n'est marqué
clean qu'après écriture, relecture et comparaison exacte du contenu. Cette
règle préserve le principe selon lequel l'état canonique en mémoire ne doit
pas être déclaré persisté sur la seule réussite apparente d'une écriture.

La preuve automatisée couvre notamment le fichier racine, les chemins
imbriqués et les chemins invalides. La preuve navigateur couvre le cycle réel
BPMN : document absent du dossier avant import, présent dans le Repository
après import, toujours absent physiquement avant Save, présent après Save,
puis retrouvé/utilisable après réouverture du Workspace Folder.

Un défaut de dispatch UI découvert pendant cette preuve empêchait initialement
les commandes `Import BPMN…` et `Import ArchiMate…` du menu `Workspace`
d'atteindre leurs actions. Le FIX reconnaît les cibles `workspace:import-*`
et les protège par test de non-régression. Il ne modifie pas la sémantique
d'accumulation décrite en 31.6–31.7.

Cette capitalisation ne démontre pas encore l'équivalence canonique complète
d'un Repository hétérogène entre modes Folder et Archive, ni les frontières
multi-document de `BusinessObjectRepresentation` ou ownership canonique
complet. La preuve navigateur de création physique porte
sur un BPMN à la racine ; la création de chemins imbriqués est démontrée par
tests automatisés.

LW13 reste suspendu jusqu'à décision explicite.


### 31.9 Capitalisation M5 — Identity Origins et identités externes canoniques en session

M5 est **[IMPLÉMENTÉ + DÉMONTRÉ]** pour la frontière de session laissée ouverte
par LW12 : les quatre collections du Business Model sont désormais des états
actifs de session, et non deux stores canoniques BO/BR complétés par deux
collections d'identité recopiées depuis le document chargé.

Un `IdentityOriginStore` dédié porte les `IdentityOrigin`. Le
`BusinessObjectExternalIdentityStore` existant est instancié dans l'application.
L'activation d'un `*.business.json` hydrate `BusinessObjectStore`,
`BusinessRelationStore`, `IdentityOriginStore` et
`BusinessObjectExternalIdentityStore`, après nettoyage de leur état antérieur.

La synchronisation du Business Model sérialise ces quatre stores. La preuve
ciblée construit volontairement un snapshot chargé contenant des identités
stale et des stores actifs contenant un autre état ; le résultat sérialisé
reflète l'état actif et non le snapshot. Cela ferme le mécanisme de préservation
indirecte observé en LW12.

Preuves finales :

- M5 ciblé : 9 fichiers / 44 tests / 44 passent ;
- régression groupée M1–M5 : 18 fichiers / 86 tests / 86 passent ;
- syntaxe valide et `git diff --check` silencieux ;
- navigateur : ouverture d'un Workspace Folder avec Business Model, mutation
  métier supportée, Save, changement de Workspace, réouverture et récupération
  correcte du Business Model et de la mutation.

La portée reste limitée. M5 ne fournit pas d'éditeur UI spécifique des
Identity Origins ou identités externes ; il ne définit pas de nouvelle
heuristique de résolution ; il ne tranche pas l'ownership canonique complet
des enrichissements entre BPMN et Business Model ; il ne traite pas la
frontière multi-document de `BusinessObjectRepresentation`.

Les exemples antérieurs d'éléments « blancs » fondés sur une technologie de
graphe particulière sont retirés de la cible : ils n'expriment pas un besoin
produit BPMNSM. Le contrat conservé est générique : une donnée absente ou
incomplète ne suffit pas, sans référence cible non résolue, à produire l'état
`unresolved`.

LW13 reste suspendu jusqu'à décision explicite sur le prochain front.

### 31.10 Capitalisation M6 — qualification documentaire des Business Object Representations

M6 est **[IMPLÉMENTÉ + DÉMONTRÉ]** pour la frontière multi-document laissée
ouverte après M5.

`representationId` conserve sa sémantique de référence vers une représentation
dans un modèle BPMN. Aucune unicité globale Repository n'est introduite et
aucun UUID ne remplace cette référence. Lorsqu'une représentation est projetée
depuis un `RepositoryDocument`, son état canonique reçoit en plus le
`documentId` du document contenant.

Le `BusinessObjectRepresentationStore` distingue ainsi, à l'intérieur d'un
même Business Object, les représentations qualifiées par
`documentId + representationId`, tout en préservant le comportement historique
des représentations sans contexte documentaire. La recherche inverse par
`representationId` reste compatible avec une cardinalité 0..n et ne devient
pas une résolution unique globale.

La projection des documents BPMN du Repository appelle désormais la projection
des Business Object Representations avec le `RepositoryDocument` courant.
Folder et Archive fournissent les stores canoniques nécessaires à ce chemin ;
le chemin historique Open Repository fournit également son contexte
documentaire.

La preuve automatisée a d'abord falsifié l'ancienne collision sur deux
documents partageant le même `representationId`, puis falsifié l'absence de
wiring dans l'orchestrateur Repository. Après correction minimale, la
régression groupée M6 couvre 18 fichiers / 83 tests, tous verts, avec
`git diff --check` silencieux.

La preuve navigateur utilise deux BPMN distincts contenant chacun
`BO_PERSISTENCE_PROOF / DataStore_1ici771`. En Workspace Folder puis en
Workspace Archive, l'état canonique contient simultanément :

- `BO_PERSISTENCE_PROOF / imported-2 / DataStore_1ici771` ;
- `BO_PERSISTENCE_PROOF / imported-3 / DataStore_1ici771`.

Les valeurs `imported-2` et `imported-3` appartiennent à la fixture ; le
contrat démontré est la coexistence de deux `documentId` distincts pour le
même `representationId`.

Le `documentId` est un contexte Repository et n'est pas sérialisé comme une
nouvelle propriété de l'extension SemArch BPMN. M6 ne tranche pas l'ownership
canonique général des enrichissements et ne crée pas de nouvelle UI d'édition.

LW13 reste suspendu jusqu'à décision explicite sur le prochain front.

### 31.11 Capitalisation TECH-INSPECT-01 — introspection read-only du Repository

Statut : **[IMPLÉMENTÉ + DÉMONTRÉ + CAPITALISÉ]**.

TECH-INSPECT-01 matérialise le contrat `observer != modifier` par une façade
`technicalIntrospection` distincte des stores mutables. `window.semarchApp` reste
un escape hatch développeur et expose cette façade via l'objet `app`, mais
l'Inspector consomme directement l'API read-only et non la globale ou les stores.

Le catalogue extensible `getSources()` / `addSource()` est l'autorité descriptive
de l'Inspector. Il pilote les sources, champs et colonnes sans coder en dur les
types dans l'UI. Six sources canoniques sont démontrées : Repository Documents,
Business Objects, Business Object Representations, Business Relations, Identity
Origins et Business Object External Identities. Elles décrivent le checkpoint
présent et ne constituent pas une liste fermée. À chaque évolution du modèle,
toute nouvelle structure canonique significative doit faire l'objet d'une décision
explicite d'inspectabilité ; les structures internes/transitoires ne sont jamais
auto-découvertes.

Le filtre V1 reste une égalité structurée et les résultats restent tabulaires.
`RepositoryDocument.content` demeure inspectable par API mais est masqué dans la
table. Les résultats de lint restent exclus du premier catalogue parce qu'ils
sont analytiques/transitoires. JavaScript arbitraire, SQL/SPARQL, jointures
génériques, mutation, requêtes sauvegardées, export, graphes et requêtes
ArchiMate/lint restent hors périmètre.

La fixture M6 démontre en runtime deux représentations
`BO_PERSISTENCE_PROOF / DataStore_1ici771` portant deux `documentId` distincts,
ainsi qu'une Business Relation réelle `BO-LW11-PATH --demo:aggregation-->
BO-LW11-APP`. Les six sources sont sélectionnables ; les deux collections
d'identité vides sont rendues proprement. La toolbar isole `Technical ->
Inspector…` à droite des commandes fonctionnelles. Les tests TECH-INSPECT,
régressions Workspace et stores concernés sont verts, les builds viewer/editor/
pages passent et `git diff --check` est silencieux.

Cette capitalisation ne transforme pas TECH-INSPECT-01 en M7, ne relance pas
LW13 et ne change pas le statut Development Preview / Progress Demonstrator.
---

## Cible complémentaire décidée — Workspace, référentiels, provenance et navigation structurée — 2026-09-22

### Statut

Cette section décrit une **cible produit/expérimentale décidée**. Elle ne constitue
pas une preuve que cette sémantique est déjà implémentée par M1–M6.

### Référentiels autonomes et collections de modèles

Le Workspace cible doit pouvoir accueillir simultanément :

- plusieurs **référentiels autonomes et agrégés**, notamment des CoCs et des
  repositories métier de type BMS ;
- des **collections non agrégées** de processus, collaborations et modèles
  d'entreprise/ArchiMate, pouvant exister indépendamment avant leur éventuelle
  inclusion dans un référentiel.

Chaque référentiel autonome constitue sa propre portée fonctionnelle pour, au
minimum :

- les objets et relations métier ;
- les règles applicables au lint ;
- les extensions applicables ;
- les documents/modèles qui participent à ce référentiel.

En conséquence, les notions de conteneur visible dans le Workspace, collection
de modèles, référentiel autonome et portée canonique ne doivent pas être
considérées comme synonymes sans preuve expérimentale. L'implémentation
actuelle doit être inspectée avant de décider quelle abstraction canonique,
éventuellement nouvelle, est nécessaire.

### Inspection des sources et provenance

L'introspection de l'état canonique fournie par TECH-INSPECT-01 ne suffit pas à
répondre à la question « dans quel fichier/référentiel cette information est-elle
localisée et comment est-elle devenue cet état interne ? ».

La cible doit permettre d'établir, lorsque l'information disponible le permet,
une traçabilité du type :

```text
document/fichier source
  -> élément source
  -> transformation / normalisation / agrégation
  -> état ou objet canonique
```

Cette capacité est complémentaire du Technical Inspector. Elle doit respecter
le principe acquis `observer != modifier`. Avant toute extension canonique, il
faut déterminer expérimentalement quelles informations de provenance sont déjà
conservées et lesquelles sont actuellement perdues.

### Workspace Tree et recherche structurée

La navigation Workspace doit évoluer vers un arbre plus expressif et
compréhensible, tout en reflétant la **structure réelle de l'environnement**.

La recherche/le filtrage de cet arbre ne doit pas réduire le Workspace à une
liste plate de correspondances. Un résultat doit conserver suffisamment de
contexte hiérarchique pour permettre à l'utilisateur de comprendre où se trouve
l'élément : Workspace, référentiel ou collection, dossier/document/modèle selon
la structure réellement démontrée.

L'expérience peut prendre comme précédent UX des outils tels qu'Archi pour les
principes de navigation, de recherche et de filtrage, sans importer son modèle
ArchiMate dans BPMNSM.

À terme, l'arbre et les menus doivent également disposer d'un vocabulaire
visuel cohérent : icônes adaptées aux catégories BPMNSM, menus/toolbar plus
lisibles et identité BPMNSM avec une icône SVG en haut à gauche ouvrant
`About` au clic. Ces éléments visuels sont une cible ultérieure du même axe UX ;
ils ne doivent pas précéder la validation de la structure et de la recherche.

### Front expérimental retenu

Au 2026-09-22, le prochain front expérimental retenu est :

**Workspace Tree + Search**, en tenant compte de la structure de
l'environnement.

La première expérience doit être précédée d'une inspection ciblée du worktree
réel. Elle doit notamment tester de manière falsifiable que BPMNSM peut
rechercher/filtrer l'arbre en conservant le contexte structurel nécessaire à
la compréhension des résultats, sans mutation de l'état canonique.

Cette décision ne constitue ni une reprise automatique de LW13, ni la
désignation arbitraire d'un incrément « M7 ».


---

### Articulation avec le workplan courant — 2026-09-22

La séquence opérationnelle et les gates ne sont pas définies par l'ordre historique des sections de ce document. Elles sont centralisées dans `BPMNSM_WORKPLAN.md`. Au checkpoint courant, Workspace Tree + Search E1 est le premier incrément planifié ; les autres cibles de ce document restent ouvertes selon les frontières qui leur sont propres. Cette référence ne change aucun statut de preuve historique.

---

## Addendum — Source, Resource et portée de référentiel — 2026-09-22

### Qualification issue de Repository Scope

Les expériences Repository Scope démontrent la faisabilité et le fonctionnement de plusieurs **scopes techniques isolés** coexistants. Cette preuve ne suffit pas à qualifier chaque scope comme référentiel autonome du modèle métier.

La cible logique doit préserver explicitement les distinctions :

```text
Workspace / Environment
    != physical Source
    != Resource
    != technical isolated scope
    != autonomous referential
```

Un dossier, une archive ou un fichier importé décrit d'abord une provenance ou un moyen d'acquisition. La frontière physique d'une Source ne détermine pas à elle seule la frontière sémantique d'un référentiel. Les ressources découvertes dans une Source peuvent devoir être qualifiées avant de connaître leur appartenance à un CoC, à un repository métier/BMS, à une collection non agrégée ou à une autre structure future.

Cette qualification complète l'invariant existant selon lequel la localisation physique d'une information doit être déterminée par l'expérience et non par préférence architecturale. Elle ne décide pas encore qu'une abstraction canonique `Source` est nécessaire : l'identité, la persistance et les cardinalités de provenance doivent être éprouvées sur les contrats existants avant introduction.

### Distribution — hypothèse ouverte

Une éventuelle `Distribution` constitue un axe potentiellement orthogonal à la Source et au Repository. Elle peut être multisource ; elle ne doit donc pas être modélisée par anticipation comme enfant d'une Source.

Statut d'une abstraction canonique `Distribution` : **[NON IMPLÉMENTÉ]**.

Sa nécessité, son identité, ses cardinalités et sa persistance doivent être démontrées par un besoin observable avant introduction. Cette notion métier/produit ne doit pas être confondue avec la distribution logicielle statique/serverless documentée dans la cible de publication.

### Inspectabilité

Toute future structure canonique introduite pour Source, provenance, membership ou Distribution devra satisfaire la règle établie par TECH-INSPECT-01 : `canonical state -> read-only introspection facade/catalog -> Technical Inspector`.

L'arbre Workspace reste une projection de navigation et ne doit pas devenir la source de vérité de ces relations. Une catégorie affichée au niveau Environment ne doit pas non plus changer silencieusement de portée pour signifier uniquement « contenu du Repository actif » sans qualification explicite de cette projection.
