# BPMNSM Semantic Alignment Demonstrator — V0

## 1. Pourquoi ce démonstrateur ?

BPMNSM cherche à faciliter le partage et l’interopérabilité des processus entre plusieurs communautés de travail (CoC — Community of Practice), sans imposer à toutes les communautés une manière unique de modéliser.

L’objectif peut se résumer ainsi :

> **Harmoniser ce qui doit réellement être partagé, sans uniformiser les pratiques qui doivent rester propres à un contexte.**

Deux CoCs peuvent parler de notions proches avec des mots, des propriétés ou des représentations différentes. À l’inverse, deux termes identiques peuvent parfois recouvrir des significations différentes.

Le travail d’alignement consiste donc à comprendre le sens réel des besoins avant de décider ce qui doit être commun.

Cette V0 prépare ce travail à partir de deux premières sources :

- le profil existant **Avionic / Software**, déjà utilisé dans un environnement opérationnel ;
- les besoins exprimés par un **second CoC**, notamment autour de SIPOC, RASCI, documents, responsabilités, jalons, traçabilité et contextualisation projet.

Cette version est un **démonstrateur de méthode**. Elle contient volontairement des hypothèses à discuter et non un modèle commun déjà décidé.


## 2. Ce que nous voulons éviter

Le but n’est pas de prendre le profil d’un CoC et de l’imposer aux autres.

Par exemple :

- Avionic / Software peut utiliser `PAF_Process`, `PAF_Role`, RAVI ou `processOwner` ;
- un autre CoC peut parler de Process, Role, RASCI, Activity Owner ou Validator.

La question n’est pas immédiatement :

> « Quel vocabulaire devons-nous imposer à tout le monde ? »

La bonne question est :

> « Ces notions représentent-elles tout ou partie d’une même réalité métier ? »

Si oui, une sémantique commune peut éventuellement émerger.

Si non, les différences doivent être conservées.

Une harmonisation réussie peut donc conduire aussi bien à identifier un concept commun qu’à décider explicitement que deux concepts doivent rester différents.


## 3. Le principe : partir des besoins, faire émerger le commun

La démarche suivie est progressive :

```text
BESOINS ET MODÈLES EXISTANTS
            |
            v
   clarification du sens
            |
            v
    comparaison des concepts
            |
            v
     alignement sémantique
            |
     +------+-------+---------+
     |              |         |
     v              v         v
 BPMN natif     commun      contextuel
                possible
                   |
                   v
             Core / Master
              si justifié
                   |
          +--------+--------+
          |                 |
          v                 v
      profil CoC       profil CoC
          |                 |
          +--------+--------+
                   |
                   v
          Viewpoints / Views
```

Le **Core n’est donc pas défini à l’avance**.

Il doit émerger lorsque plusieurs besoins réels démontrent qu’une sémantique commune est utile et suffisamment claire.


## 4. BPMN reste le langage commun de processus

BPMNSM utilise BPMN comme langage pivot pour les processus.

Une règle importante est donc :

> **Si BPMN exprime déjà correctement une information, BPMNSM doit privilégier BPMN plutôt que recréer un concept propriétaire.**

L’alignement doit par conséquent distinguer plusieurs situations.

### BPMN

Le besoin est déjà correctement exprimé par BPMN.

### CORE

Une sémantique réellement commune aux contextes étudiés a été établie et justifie un concept partagé BPMNSM.

### CoC

Le besoin appartient à une communauté particulière.

### CoC + Subdomain

Le besoin est encore plus contextuel et concerne, par exemple, un sous-domaine tel que Avionic / Software.

### Viewpoint / View

Le besoin concerne surtout une manière de sélectionner, organiser ou présenter des informations existantes.

SIPOC ou RASCI peuvent, au moins en partie, relever de cette catégorie. Cela doit être vérifié sur les cas réels.

### Method / Rule

Le besoin concerne une règle de travail, une pratique ou une méthode plutôt qu’une propriété du modèle.

### Platform capability

Le besoin concerne le fonctionnement de l’outil : accès, modification, génération documentaire, droits, lecture par une IA, etc.

Cette séparation évite de transformer chaque besoin utilisateur en nouvelle classe ou nouvelle propriété du modèle.


## 5. Concepts communs et contextualisation

Un concept commun n’implique pas que toutes ses propriétés deviennent communes.

On peut par exemple découvrir qu’une identité de Process est partagée, tout en conservant des informations spécifiques à chaque contexte.

```text
                 PROCESS
            identité commune ?
                  /   \
                 /     \
                v       v
        Avionic / SW    CoC B
        purpose         SIPOC usage
        reference       propriétés B
        processOwner    ...
```

Le travail consiste donc à identifier séparément :

- ce qui constitue réellement le concept commun ;
- ses attributs éventuellement communs ;
- les propriétés propres à un CoC ;
- les propriétés propres à un sous-domaine ;
- les informations nécessaires uniquement pour certaines vues.


## 6. La notion de Master Object

Pour certains concepts, il peut être utile d’identifier une **identité stable commune**, appelée ici *Master Object*.

Le Master représente l’objet indépendamment de ses différentes contextualisations.

Exemple conceptuel :

```text
                    MASTER PROCESS
                    identité stable
                         |
              +----------+----------+
              |                     |
              v                     v
      Avionic / Software          CoC B
       contextualisation     contextualisation
```

Cela ne signifie pas que les utilisateurs doivent modifier leurs modèles existants.

Un profil peut introduire une couche d’alignement intermédiaire vers le Core ou le Master de manière transparente.

Par exemple :

```text
modèle existant
PAF_Process
     |
     v
profil Avionic / Software
     |
     v
alignement intermédiaire
     |
     v
Process Master
```

Le stéréotypage utilisé dans le modèle peut donc rester inchangé.

Le mécanisme technique exact de cet alignement n’est pas décidé dans cette V0. Il devra être confirmé par les profils et modèles réels.


## 7. Les Views et Viewpoints

Toutes les différences entre CoCs ne nécessitent pas nécessairement des concepts différents.

Deux communautés peuvent vouloir regarder la même réalité sous des angles différents.

Par exemple, un processus peut être représenté dans une vue BPMN classique et être également exploité dans une vue SIPOC.

```text
                même contenu sémantique
                         |
              +----------+----------+
              |                     |
              v                     v
          BPMN View             SIPOC View
```

De même, RAVI et RASCI peuvent éventuellement être deux représentations ou contextualisations de relations de responsabilité plus communes.

Il s’agit actuellement d’**hypothèses de travail**, à valider avec les experts et les processus réels.

Une View répond à un besoin de représentation.

Un Viewpoint définit notamment pourquoi cette vue existe, pour quels utilisateurs ou rôles et pour répondre à quelles préoccupations.

Cette distinction permet de partager le sens sans imposer une représentation unique.


## 8. Comment décider si deux concepts sont alignés ?

Le tableau utilise les relations suivantes.

### IDENTICAL

Les deux sources décrivent le même concept avec une sémantique équivalente.

### SPECIALIZATION

Un concept est une forme plus spécialisée d’un concept commun.

### RELATED

Les concepts sont liés mais ne sont pas identiques.

### VIEW

La différence provient principalement d’une manière particulière de représenter ou consulter l’information.

### UNRELATED

Les concepts sont différents malgré une ressemblance éventuelle.

### UNRESOLVED

Les informations disponibles ne permettent pas encore de décider.

`UNRESOLVED` n’est pas un échec.

C’est au contraire une information importante : elle identifie précisément la question qui doit être posée aux experts métier.


## 9. Pourquoi conserver les demandes sources séparément ?

Le classeur contient des onglets distincts pour les deux sources.

- `01 - Avionic SW Input`
- `02 - CoC B Input`

Ils servent de **référence**.

Une hypothèse d’alignement ne doit jamais remplacer ou réécrire silencieusement le besoin initial.

Chaque élément source reçoit donc un identifiant stable, par exemple :

```text
AV-SW-ST-013
COCB-AR-010
```

Le tableau d’alignement peut ensuite référencer ces identifiants.

Cela permet de conserver la chaîne :

```text
DEMANDE SOURCE
      |
      v
HYPOTHÈSE D’ALIGNEMENT
      |
      v
DISCUSSION
      |
      +--> VALIDATED
      |
      +--> REJECTED
      |
      +--> UNRESOLVED
```

Même si l’hypothèse évolue, la demande initiale reste disponible.


## 10. Le tableau principal : Semantic Alignment

L’onglet :

`10 - Semantic Alignment`

est le tableau de travail principal.

Il contient déjà une première série d’hypothèses V0 afin que les participants puissent réagir à des propositions concrètes plutôt que commencer devant un tableau vide.

Parmi les sujets préparés figurent notamment :

- Process et structure des activités ;
- responsabilités, rôles, RAVI et RASCI ;
- Deliverables, Inputs et Outputs ;
- documents et références documentaires ;
- dictionnaire et connaissance ;
- milestones ;
- purpose et rationale ;
- state et status ;
- KID ;
- traçabilité et relations entre processus ;
- contexte, domaine, projet et tailoring ;
- personnes, rôles et compétences ;
- liens vers des ressources externes ;
- publication, génération documentaire et consommation par IA ;
- gouvernance et autonomie des CoCs.

Ces lignes sont des **hypothèses V0**.

Les valeurs `PROPOSED` ou `UNRESOLVED` indiquent explicitement qu’elles doivent être discutées et confrontées aux cas réels.


## 11. Ne pas confondre ressemblance et sémantique commune

Un des objectifs de l’atelier est de résoudre les ambiguïtés.

Quelques exemples illustrent le problème.

### Owner, Accountable et Validator

`processOwner`, `Activity Owner`, `Responsible`, `Accountable` ou `Validator` ne doivent pas être considérés automatiquement comme synonymes.

Ils peuvent éventuellement être rattachés à une notion plus générale de responsabilité, mais leurs significations exactes doivent être établies.

### Deliverable, Input, Output et KID

Ces notions sont liées, mais elles ne sont pas nécessairement des synonymes.

Input et Output peuvent par exemple représenter des rôles joués par un objet d’information dans un processus plutôt que deux types d’objets différents.

Cette hypothèse doit être vérifiée sur les processus réels.

### State et Status

Le profil Avionic / Software utilise notamment `state` pour des valeurs telles que `updated`, `validated`, `approved` ou `released`.

Le second CoC demande notamment un statut de document `mandatory` ou `supportive`.

Ces informations peuvent sembler proches mais pourraient représenter des dimensions différentes : état de cycle de vie, classification, caractère obligatoire, etc.

L’alignement sert précisément à éviter ce type d’unification accidentelle.


## 12. Le rôle des processus réels dans le démonstrateur

Le tableau n’est pas la démonstration finale.

La démonstration doit être réalisée sur les **processus réellement fournis par les CoCs**.

Pour chaque alignement important, nous chercherons à établir la chaîne suivante :

```text
besoin exprimé
      |
      v
élément dans un processus réel
      |
      v
hypothèse d’alignement
      |
      v
implémentation BPMNSM
      |
      v
Core éventuel + contextualisation
      |
      v
View adaptée au CoC
      |
      v
résultat visible par l’utilisateur
```

Les colonnes :

- `Demo Candidate`
- `Source Process A`
- `Source Process B`
- `Expected Concrete Demonstration`

préparent cette étape.

Les processus sources ne sont volontairement pas inventés dans cette V0. Ils seront renseignés lorsque les vrais modèles seront disponibles.


## 13. Les cinq types de résultats que le démonstrateur doit pouvoir montrer

### Cas 1 — BPMN suffit

Le besoin est déjà exprimable nativement en BPMN.

**Impact :** aucune nouvelle sémantique propriétaire n’est nécessaire.

### Cas 2 — Une convergence Core est démontrée

Deux pratiques différentes correspondent réellement à une même sémantique.

**Impact :** BPMNSM peut partager une identité ou un concept commun tout en conservant les contextualisations.

### Cas 3 — Le besoin reste contextuel

Une information est utile uniquement à un CoC ou à un sous-domaine.

**Impact :** elle reste dans son profil et n’est pas imposée aux autres communautés.

### Cas 4 — La différence relève d’une View / d’un Viewpoint

Les utilisateurs ont besoin de voir ou organiser la même information différemment.

**Impact :** BPMNSM peut produire plusieurs vues sans créer plusieurs modèles métier indépendants.

### Cas 5 — L’alignement reste UNRESOLVED

Les experts ne disposent pas encore d’assez d’informations pour décider.

**Impact :** aucune harmonisation n’est forcée. La question est tracée et peut être résolue lors d’une itération ultérieure.


## 14. Exemple pédagogique : responsabilités

Une hypothèse intéressante à tester concerne les responsabilités.

```text
Avionic / Software                   CoC B

PAF_Role                             Role
RAVI                                 RASCI
processOwner                         Activity Owner
                                     Validator

        \                            /
         \                          /
          v                        v

             Responsibility
               Assignment
              Core candidat ?

             /             \
            v               v

        RAVI View        RASCI View
```

La démonstration recherchera si une relation de responsabilité réellement commune existe.

Si elle existe, RAVI et RASCI peuvent conserver leurs qualifications propres.

L’objectif n’est donc pas de remplacer RAVI par RASCI, ni RASCI par RAVI.


## 15. Exemple pédagogique : une spécificité CoC

Supposons qu’un CoC ait besoin d’un `Acceptance Criteria` sur une activité et qu’aucune sémantique commune correspondante ne soit établie.

Le résultat peut simplement être :

```text
Activity
   |
   +-- propriétés communes
   |
   +-- profil CoC B
          |
          +-- Acceptance Criteria
```

L’autre CoC n’a pas à recevoir cette propriété.

C’est un exemple direct de l’objectif :

> **partager ce qui doit être partagé et préserver ce qui doit rester contextuel.**


## 16. Exemple pédagogique : SIPOC comme vue

Une partie des besoins SIPOC peut éventuellement être reconstruite à partir d’informations déjà présentes dans BPMN et dans le Repository.

Hypothèse :

```text
BPMN / Repository
      |
      +-- Participants
      +-- Activities
      +-- Processes
      +-- Information Objects
      +-- Relations
      |
      v
  SIPOC View
```

Le travail sur les processus réels permettra de déterminer ce qui peut effectivement être projeté ainsi et ce qui nécessite une sémantique supplémentaire.

Cette distinction est importante : une nouvelle représentation ne doit pas automatiquement conduire à créer un nouveau métamodèle.


## 17. Comment utiliser le classeur pendant l’atelier

L’atelier doit commencer par les besoins et les exemples métier.

Pour chaque ligne importante :

1. retrouver les demandes sources référencées ;
2. demander aux représentants des CoCs de préciser leur signification ;
3. vérifier si BPMN exprime déjà le besoin ;
4. comparer les concepts, et non seulement leurs noms ;
5. discuter l’hypothèse d’alignement ;
6. déterminer la portée la plus appropriée ;
7. identifier ce qui serait commun et ce qui resterait contextuel ;
8. identifier une éventuelle View / un éventuel Viewpoint ;
9. documenter les ambiguïtés ;
10. enregistrer la décision ou laisser le point `UNRESOLVED`.

Il n’est pas nécessaire de tout résoudre pendant une seule séance.


## 18. Les décisions

L’onglet :

`20 - Decisions`

est volontairement séparé du tableau d’hypothèses.

Une décision doit pouvoir préciser :

- l’alignement concerné ;
- la décision prise ;
- la portée validée ;
- le concept commun éventuellement validé ;
- ce qui doit rester contextuel ;
- la justification ;
- les personnes ayant participé à la validation ;
- l’impact attendu sur le démonstrateur.

Cela permet de distinguer clairement :

```text
ce que nous avons reçu
        |
ce que nous avons proposé
        |
ce qui a été discuté
        |
ce qui a été validé
```


## 19. Pourquoi il n’y a pas encore de nombreux tableaux spécialisés

Cette V0 privilégie volontairement un tableau d’alignement principal.

Des tableaux spécialisés pourront ensuite être dérivés, par exemple :

- catalogue détaillé des attributs communs et contextuels ;
- catalogue des Viewpoints et Views ;
- registre détaillé des questions ouvertes ;
- mapping des Master Objects ;
- matrices de responsabilités.

Ils ne sont pas demandés aux utilisateurs dès la première séance.

La logique est :

```text
aligner d’abord le sens
        |
        v
valider les concepts
        |
        v
détailler ensuite la structure
```

Cela évite de construire prématurément une structure détaillée sur des concepts dont l’alignement n’est pas encore établi.


## 20. Évolution du démonstrateur

Cette V0 est appelée à évoluer avec les matériaux réels.

Les prochaines étapes sont notamment :

1. recevoir les profils et processus de référence ;
2. préserver ces matériaux comme références versionnées ;
3. relier les hypothèses du tableau aux éléments des processus réels ;
4. sélectionner quelques cas démonstrateurs représentatifs ;
5. implémenter le minimum nécessaire dans BPMNSM ;
6. montrer concrètement l’effet de l’harmonisation et de la contextualisation ;
7. recueillir les retours des CoCs ;
8. faire évoluer les alignements ;
9. ne promouvoir vers le Core que les convergences réellement démontrées.

Le démonstrateur doit donc rester traçable :

```text
SOURCE
  |
  v
HYPOTHÈSE V0
  |
  v
PROCESSUS RÉEL
  |
  v
DÉCISION
  |
  v
IMPLÉMENTATION
  |
  v
DÉMONSTRATION
  |
  v
RETOUR D’EXPÉRIENCE
  |
  v
CONVERGENCE ÉVENTUELLE
```


## 21. Message essentiel

BPMNSM ne cherche pas à faire adopter à tous les CoCs le même vocabulaire, le même profil ou la même vue.

Il cherche à rendre explicites les relations entre leurs pratiques afin de pouvoir :

- échanger les processus ;
- préserver leur sens ;
- partager les concepts réellement communs ;
- maintenir les contextualisations nécessaires ;
- proposer des vues adaptées aux différents besoins ;
- et permettre au commun d’émerger progressivement à partir de l’expérience.

> **Harmoniser sans uniformiser : partager ce qui doit réellement l’être, préserver ce qui doit rester contextuel, et faire émerger le commun à partir de cas réels.**
