# BPMNSM --- Protocole de développement expérimental piloté par la preuve

**Statut : PROTOCOLE NORMATIF DE DÉVELOPPEMENT ET DE V&V**

## 1. Objet

Ce document formalise la méthode de développement expérimental déjà employée dans BPMNSM et complète la « Méthode de rapid development » de `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`.

Le nom de travail utilisé ici est **Développement Expérimental Piloté par la Preuve (DEPP)**, en anglais **Evidence-Driven Experimental Development (EDED)**. Ce nom désigne la méthode BPMNSM ; il ne prétend pas définir une discipline ou un standard externe établi.

Le principe directeur est :

> Ne pas développer une architecture supposée. Formuler une propriété précise, confronter cette propriété au système réel par l'expérience minimale nécessaire, puis capitaliser uniquement ce que la preuve autorise à affirmer.

Une expérience n'est donc pas un ticket d'implémentation. Elle peut conduire à du code de production, à un test seulement, à une clarification documentaire, à la réfutation d'une hypothèse ou à la démonstration qu'aucune modification de production n'est nécessaire.

## 2. Autorités et articulation documentaire

Le repository réel reste l'autorité pour le code exact. Aucun code exact ne doit être reconstruit depuis un handover, un document de continuité ou une conversation.

Les documents ont des responsabilités distinctes :

- `BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md` porte notamment la cible de configuration/publication et la méthode de rapid development existante ;
- `BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md` reste le registre vivant des hypothèses, expériences, preuves et conséquences architecturales du vertical Business Model ;
- les documents de vision portent les propositions plus larges relatives aux requirements, à la Verification & Validation, à l'evidence, au monitoring et à l'interopérabilité ;
- le présent document définit les règles communes de conduite, de preuve, de V&V et de continuité applicables aux nouvelles expériences BPMNSM.

Il ne crée pas un second registre expérimental et ne réécrit pas les checkpoints historiques.

## 3. Boucle DEPP

La boucle normative est :

```text
BESOIN / OBJECTIF
      ↓
REQUIREMENT lorsque pertinent
      ↓
QUESTION FALSIFIABLE
      ↓
CLAIM + CONTEXT
      ↓
INSPECTION DU SYSTÈME RÉEL
      ↓
MÉCANISME DÉJÀ PRÉSENT ?
   ┌──┴──┐
  oui   non
   │      │
preuve   implémentation minimale
manquante│
   └──┬──┘
      ↓
EXPÉRIENCE / PREUVE CIBLÉE
      ↓
RÉGRESSION
      ↓
CONFIGURATION / GIT / SHA
      ↓
EVIDENCE + LIMIT
      ↓
CAPITALISATION
      ↓
EXPÉRIENCE SUIVANTE
```

Cette boucle spécialise sans remplacer la chaîne `BESOIN → QUESTION → ... → PREUVE → RÉGRESSION → CAPITALISATION` déjà documentée dans la méthode de rapid development.

## 4. Requirement, User Story, Claim, Experiment et Evidence

Un **Requirement** exprime ce que le système doit permettre ou garantir. Il doit rester aussi indépendant que possible d'une solution technique particulière.

Une **User Story** peut exprimer acteur, intention et valeur lorsqu'elle apporte une information utile. Elle n'est pas obligatoire pour une propriété architecturale interne.

Un **Claim** est l'affirmation précise que l'expérience cherche à rendre soutenable.

Une **Experiment** confronte ce Claim au système réel dans un contexte défini.

Une **Evidence** est une observation reproductible qui soutient ou réfute le Claim.

Le test n'est donc ni le Requirement ni le Claim. Il constitue un instrument de l'expérience et son résultat peut devenir une Evidence.

La chaîne minimale de traçabilité est :

```text
Need / Objective
      ↓
Requirement
      ↓
User Story, si pertinente
      ↓
Claim / propriété
      ↓
Experiment E<n>
      ↓
Evidence
      ↓
Verification / Validation Result
```

Un Requirement peut nécessiter plusieurs expériences et une expérience peut contribuer à plusieurs Requirements.

## 5. Claim--Context--Evidence--Limit

Toute nouvelle expérience doit permettre d'établir explicitement les quatre éléments suivants.

### Claim

Qu'affirmons-nous exactement sur le système ?

### Context

Dans quelles conditions cette affirmation est-elle évaluée ?

### Evidence

Quelles observations reproductibles soutiennent ou réfutent cette affirmation ?

### Limit

Qu'est-ce que ces observations ne permettent pas d'affirmer ?

Une Evidence ne doit jamais être généralisée au-delà du Context et des Limits établis. Un corpus global de tests vert ne transforme pas une preuve locale en vérité universelle sur BPMNSM.

## 6. Gabarit d'une nouvelle expérience

Les nouvelles expériences doivent tendre vers le gabarit suivant sans réécrire artificiellement les expériences historiques :

```markdown
### E<n> — <titre>

**Requirement(s)**

- `<identifiant si une source normative l'établit>` — <exigence>
- ou : <exigence décrite sans inventer d'identifiant>

**User Story**

<si pertinente>, sinon : non applicable à cette expérience architecturale.

**Question**

<Question précise et falsifiable>

**Claim**

<Affirmation exacte recherchée>

**Context**

- <condition 1>
- <condition 2>

**Preuve recherchée**

<Observation minimale permettant de confirmer ou réfuter le Claim>

**Evidence**

### Verification Evidence

- <inspection>
- <preuve ciblée>
- <régression>
- <configuration Git / SHA / artefact lorsque pertinent>

### Validation Evidence

<preuve stakeholder/opérationnelle si applicable>, ou : non requise pour la fermeture de cette expérience de vérification.

**Limit**

Cette expérience ne démontre pas :

- <limite 1> ;
- <limite 2>.

**Statut**

**[NON IMPLÉMENTÉ]**
```

Aucun identifiant `REQ-*`, `CLAIM-*` ou `EV-*` ne doit être inventé par symétrie. Un identifiant autonome n'est introduit que lorsqu'une source normative ou un besoin de référencement indépendant le justifie.

## 7. Inspection avant solution

Avant toute modification :

1. inspecter les fichiers réels concernés ;
2. identifier les contrats et invariants déjà démontrés ;
3. déterminer si le mécanisme recherché existe déjà ;
4. rechercher d'abord la preuve minimale manquante ;
5. n'implémenter que ce qui est nécessaire si le mécanisme est absent.

Trois résultats sont valides :

```text
mécanisme absent
    → implémentation minimale + preuve

mécanisme présent, preuve insuffisante
    → preuve minimale sans changement de production inutile

mécanisme et preuve déjà présents
    → inspection + qualification + capitalisation
```

La quantité de code produite n'est jamais une mesure de succès. L'expérience E11 du registre Business Model constitue un exemple de fermeture par composition et preuve d'un mécanisme déjà présent, sans nécessité d'introduire un nouveau mécanisme de production pour la propriété recherchée.

## 8. Principe d'architecture minimale

Le modèle conceptuel peut être plus riche que le modèle logiciel courant. Une abstraction logicielle n'est introduite que lorsqu'une expérience ou un besoin observable démontre sa nécessité.

Il est interdit de protéger une abstraction contre une observation qui la réfute. Une expérience peut confirmer, modifier ou réfuter l'hypothèse initiale.

Cette règle prolonge les principes déjà établis dans BPMNSM : ne pas introduire un manifest, une relation générique, un Viewpoint persistant ou toute autre abstraction par préférence architecturale ou simple symétrie.

## 9. Verification et Validation

La **Verification** répond principalement à :

> Le système possède-t-il effectivement la propriété définie ?

Les Verification Evidence peuvent provenir d'inspections, tests unitaires, tests d'intégration, round-trips, tests UI, régressions, CI, vérifications d'artefacts ou tests post-déploiement.

La **Validation** répond principalement à :

> La propriété ou la solution répond-elle effectivement au besoin des stakeholders dans son contexte d'usage ?

Les Validation Evidence peuvent provenir de revues stakeholder, scénarios d'acceptation, démonstrations, prototypes, retours utilisateurs ou observations opérationnelles.

Une expérience architecturale peut être fermée par Verification lorsque sa validation métier relève d'un Requirement ou d'un niveau supérieur. Cette absence doit être explicite ; elle ne doit pas être confondue avec une validation obtenue.

## 10. Niveaux d'Evidence

Les Evidence peuvent apparaître à plusieurs étapes du cycle de vie :

```text
DESIGN EVIDENCE
    inspection / analyse / contrat

BUILD EVIDENCE
    tests / régression / CI / build

DEPLOYMENT EVIDENCE
    identité artefact / version publiée / smoke test

RUNTIME EVIDENCE
    observation opérationnelle / monitoring pertinent
```

Toutes les expériences n'exigent pas les quatre niveaux. Le niveau requis dépend du Claim.

Lorsqu'un Claim porte explicitement sur la conservation après sauvegarde et réouverture dans l'application générée, une présence en mémoire, un round-trip de test, un `saveXML()` ou un build réussi ne suffisent pas isolément. La preuve doit franchir la frontière réellement revendiquée, par exemple sauvegarde/export physique puis réouverture/import par le flux applicatif réel, suivis de l'observation de l'état restauré. Cette exigence ne s'applique que lorsque le Claim inclut cette conservation runtime.

### 10.1 Précédent normatif pour les démonstrations interactives navigateur

Pour toute expérimentation ou démonstration interactive habituelle de l'application BPMNSM dans un navigateur, le précédent de référence est le serveur de développement Vite du repository, lancé par `npm run dev`.

`npm run build` fournit une **Build Evidence** de constructibilité ; il ne remplace pas la validation interactive lorsque le Claim exige une observation dans l'application réelle.

Le service direct d'un artefact `dist`, l'ouverture via `file://` ou l'emploi d'un serveur HTTP statique distinct sont réservés aux expériences qui testent explicitement le mode de publication statique/serverless ou une propriété propre à l'artefact construit. Ils ne remplacent pas le précédent Vite pour une démonstration navigateur courante.

Cette règle est une application du principe de continuité méthodologique : un autre moyen de servir l'application ne doit pas être substitué au précédent BPMNSM simplement parce qu'il est disponible ou pratique.

## 11. Preuve ciblée et non-régression

La preuve ciblée et la régression ont des fonctions différentes :

- la preuve ciblée établit le nouveau Claim dans son Context ;
- la régression vérifie que le nouvel état ne contredit pas les propriétés antérieurement couvertes par le corpus exécuté.

Lorsque les deux sont applicables, elles doivent être exécutées séparément et rapportées sans les confondre.

## 12. Configuration et traçabilité de preuve

Une preuve doit pouvoir être reliée à la configuration exacte qui l'a produite lorsque cela est pertinent : fichiers, tests, résultats, commit Git, état index/worktree, SHA-256, artefact, build ou déploiement.

Les SHA-256 restent utiles pour les archives échangées hors Git. Lorsqu'une CI vérifie un commit, le commit Git devient naturellement l'identité principale de la configuration vérifiée ; les artefacts publiés doivent ensuite pouvoir être reliés à cette identité.

Les commandes de preuve doivent respecter la discipline de travail du projet : étapes atomiques, absence de commande Git destructive, tests via `npm test -- --run ...`, contrôle des diffs et artefacts d'inspection sous `~/Downloads` côté utilisateur.

## 13. Statuts du registre expérimental

Les registres expérimentaux qui utilisent la convention actuelle conservent exclusivement :

- **[IMPLÉMENTÉ + DÉMONTRÉ]** ;
- **[DÉMONTRÉ PAR INSPECTION]** ;
- **[NON IMPLÉMENTÉ]**.

Le statut est une conséquence des Evidence disponibles dans le périmètre du Claim, jamais une appréciation de l'auteur.

Les vocabulaires historiques `[CIBLE]`, `[HYPOTHÈSE]`, `[DÉCIDÉ]`, `[IMPLÉMENTÉ]`, `[DÉMONTRÉ]`, `[RÉFUTÉ]` présents dans d'autres documents décrivent des états de connaissance et ne doivent pas être rétroactivement remplacés. Lorsqu'un registre impose ses trois statuts de preuve, ceux-ci restent l'autorité locale.

## 14. Capitalisation et histoire

Après une expérience :

- mettre à jour uniquement les assertions dont le statut ou la preuve a réellement changé ;
- conserver les hypothèses réfutées et checkpoints historiques ;
- documenter les Limits ;
- identifier la prochaine question atomique ;
- ne jamais réécrire une absence historique de preuve comme si la preuve avait toujours existé.

La documentation doit conserver non seulement l'état du système mais l'évolution de la connaissance acquise sur ce système.

## 15. Matrices et vues dérivées

Les matrices de traçabilité et de couverture V&V sont des **vues dérivées**, pas de nouvelles sources de vérité.

Une vue peut notamment présenter :

```text
Requirement → Experiment → Claim → Evidence → Limit → Status
```

ou :

```text
Experiment → Verification → Validation → Configuration → Regression → Status
```

Tant qu'une génération automatique n'existe pas, éviter de recopier manuellement de grandes quantités d'informations normatives dans une matrice susceptible de diverger du registre.

## 16. Definition of Done expérimentale

Une expérience peut être fermée lorsque les éléments applicables suivants sont établis :

1. **WHY** — le besoin ou Requirement auquel elle contribue est connu ;
2. **QUESTION** — l'incertitude est falsifiable ;
3. **CLAIM** — l'affirmation recherchée est explicite ;
4. **CONTEXT** — les conditions de la preuve sont explicites ;
5. **INSPECTION** — le système réel a été inspecté avant modification ;
6. **MINIMAL CHANGE** — aucun changement de production non nécessaire n'a été introduit ;
7. **EVIDENCE** — la preuve recherchée a été obtenue ou la réfutation observée ;
8. **LIMIT** — les conclusions hors preuve sont explicites ;
9. **REGRESSION** — la non-régression pertinente a été exécutée ;
10. **CONFIGURATION** — la configuration démontrée est identifiable lorsque nécessaire ;
11. **CAPITALISATION** — le registre est mis à jour sans réécriture trompeuse de l'histoire ;
12. **STATUS** — le statut est strictement justifié par les Evidence.

## 17. Protocole de reprise et de contribution

Pour reprendre ou réaliser une expérience BPMNSM :

1. lire le handover courant ;
2. lire le registre expérimental concerné ;
3. identifier l'expérience ouverte ciblée ;
4. identifier Requirement, Question, Claim, Context, Evidence recherchée et Limits connus ;
5. inspecter les fichiers réels concernés ;
6. déterminer si le mécanisme recherché existe déjà ;
7. rechercher la preuve minimale manquante avant de concevoir une solution ;
8. sinon, concevoir l'implémentation minimale nécessaire ;
9. exécuter la preuve ciblée ;
10. exécuter la non-régression pertinente ;
11. contrôler les diffs et identifier la configuration démontrée ;
12. documenter Evidence et Limit ;
13. déduire le statut des preuves ;
14. capitaliser le résultat ;
15. seulement alors sélectionner l'expérience suivante.

Une conversation ou un handover transmet les invariants et les preuves connues ; il ne remplace jamais la réinspection des sources exactes avant modification.

## 18. Évolution vers CI, publication et monitoring

Le protocole ne dépend pas de la présence d'une CI. L'automatisation future doit conserver la même sémantique de preuve :

```text
Requirement
    ↓
Claim
    ↓
Experiment
    ↓
CI Evidence
    ↓
Git commit
    ↓
Build artifact
    ↓
GitHub Pages deployment
    ↓
Deployment Evidence
```

Pour une application web cliente pure, un backend BPMNSM n'est pas requis pour fermer cette chaîne. Le dépôt et la CI peuvent porter la preuve de construction, GitHub Pages l'artefact publié et un contrôle externe la preuve de disponibilité ou un smoke test.

La cible recommandée est qu'un artefact publié expose à terme une identité de build permettant de le relier au commit vérifié. Cette capacité reste une cible tant qu'elle n'est pas démontrée dans le dépôt.

Le monitoring produit peut rester non intrusif : disponibilité du site, chargement des assets, identité de version et scénarios critiques peuvent être contrôlés sans collecter les modèles, Business Objects ou actions des utilisateurs.

Toute télémétrie utilisateur introduirait des responsabilités supplémentaires de collecte, sécurité, confidentialité et gouvernance ; elle ne constitue pas un prérequis du DEPP.

## 19. Principe de clôture

**[IMPLÉMENTÉ + DÉMONTRÉ]** signifie toujours : implémenté et démontré pour un Claim, un Context, des Evidence et des Limits définis. Ce statut n'est jamais une affirmation absolue sur l'ensemble du produit.

## Continuité méthodologique entre conversations

Un changement de conversation, de modèle d'assistance ou de contexte
technique ne constitue jamais une autorisation implicite de modifier la
méthode expérimentale BPMNSM.

La continuité porte à la fois sur l'état du produit et sur la méthode
utilisée pour produire les preuves.

Avant de choisir un moyen de vérification pour une nouvelle propriété :

1. identifier précisément le besoin ou l'objectif ;
2. formuler la propriété vérifiable ;
3. rechercher comment une propriété analogue a déjà été démontrée dans
   BPMNSM ;
4. réutiliser ce précédent lorsqu'il est applicable ;
5. seulement si ce précédent est insuffisant, démontrer explicitement
   cette insuffisance avant de proposer une nouvelle méthode.

L'existence d'un outil ou d'une technique disponible ne constitue pas une
justification. Un navigateur headless, une nouvelle bibliothèque, un
nouveau harness, une nouvelle infrastructure E2E ou tout autre mécanisme
ne doit pas être introduit uniquement parce qu'il semble pratique.

Une nouvelle méthode de preuve doit être distinguée de la propriété à
démontrer. Par exemple :

```text
propriété :
la relation fonctionne dans l'application générée

≠

moyen potentiel :
navigateur headless
```

Le moyen de preuve reste remplaçable tant qu'il démontre correctement la
propriété recherchée.

La séquence privilégiée reste :

```text
inspection ciblée
→ expérience minimale et falsifiable
→ evidence
→ régression groupée
→ décision
→ capitalisation
```

Les frontières de preuve doivent rester explicites. En particulier :

```text
inspection source
≠ test unitaire
≠ round-trip de sérialisation
≠ build
≠ inspection du bundle généré
≠ exécution runtime de l'application générée
```

Une preuve ne doit jamais être promue implicitement vers une propriété
plus forte.

Une lacune découverte pendant une expérience ne donne pas mandat pour
élargir automatiquement le périmètre. Toute nouvelle abstraction,
infrastructure ou méthode doit répondre à une insuffisance démontrée.

Le repository réel reste l'autorité pour le code et les documents
courants. Lorsqu'une inspection peut fournir l'état réel, celui-ci ne doit
pas être reconstruit depuis la mémoire d'une conversation ou d'un
assistant.

Lorsqu'un changement de méthode devient réellement nécessaire, son
insuffisance déclenchante, son objectif et son coût doivent être exposés.
La décision de modifier le protocole appartient à l'utilisateur.

## Observabilité technique des nouveaux états canoniques

À partir de TECH-INSPECT-01, toute évolution qui introduit une structure canonique
significative doit inclure dans sa Definition of Done une décision explicite sur
son observabilité technique. Si cette structure est pertinente pour comprendre ou
interroger le Repository actif, elle doit être projetée dans le catalogue
read-only de `technicalIntrospection` et couverte par une preuve de non-mutation.

Cette règle n'autorise aucune découverte automatique des objets JavaScript
internes : l'exposition reste intentionnelle, descriptive et séparée des API de
mutation. Une structure transitoire, un cache ou un état purement UI peut rester
hors catalogue lorsque cette exclusion est cohérente avec son rôle.

---

## Addendum — orchestration Terminal macOS + Console Chrome — 2026-09-22

### Principe de preuve croisée

Pour les expériences interactives BPMNSM, le Terminal macOS et la Console Chrome peuvent être utilisés conjointement comme deux instruments complémentaires d’une même expérience :

```text
Terminal macOS
  -> worktree réel / tests / build / serveur Vite / fichiers / SHA / Git
                    <->
             même expérience
                    <->
Console Chrome
  -> application Vite réelle / runtime / UI / projection / orchestration
```

Cette méthode est à privilégier lorsqu’une propriété traverse la frontière navigateur / filesystem. Elle permet notamment de confronter un état runtime ou une action UI à son effet physique réel sans confondre les deux niveaux de preuve.

Les tests Vitest restent la preuve automatisée des invariants appropriés. La Console Chrome complète cette preuve lorsqu’un comportement doit être observé ou orchestré dans l’application Vite réelle. Le Terminal complète la preuve par l’observation du worktree, des fichiers physiques, des hashes, des tests et de Git.

### Automatisation des validations UI

Une démonstration UI ne doit pas devenir une recette manuelle lorsque le navigateur peut objectivement effectuer les manipulations et les contrôles.

Préférer, selon le besoin :

- Vitest pour les invariants et régressions automatisables ;
- un script ciblé dans la Console Chrome pour l’orchestration de l’application réelle ;
- une intervention humaine courte pour les pickers système, la perception visuelle et les décisions d’utilisabilité qui nécessitent réellement un humain.

Ne pas introduire une infrastructure E2E lourde lorsque cette combinaison fournit déjà une preuve suffisante et falsifiable.

### Presse-papiers comme canal de retour de preuve

Lorsque la sortie textuelle constitue une preuve utile à analyser dans la conversation, privilégier quasi systématiquement son envoi direct vers le presse-papiers plutôt qu’une sélection ou transcription manuelle.

Côté Terminal macOS, les commandes finales de preuve ou d’inspection destinées au retour dans la conversation se terminent par :

```text
2>&1 | tee /dev/tty | pbcopy
```

La sortie reste ainsi visible dans le terminal tout en étant immédiatement disponible pour collage.

Côté Console Chrome, construire lorsque pertinent un rapport textuel déterministe, l’afficher dans la console et utiliser `copy(report)` pour le placer directement dans le presse-papiers.

Le presse-papiers est un canal de transport de la preuve, pas la preuve elle-même. Avant toute conclusion, vérifier que le contenu collé correspond bien au résultat attendu. Un script, une commande, un fragment incomplet ou un prompt `heredoc>` collé par erreur ne doit jamais être interprété comme une sortie expérimentale.

### Sobriété des mécanismes de collaboration

Ne pas utiliser Python, un ZIP ou un fichier intermédiaire comme mécanisme ordinaire de partage d’information lorsque les outils directs suffisent.

Pour les inspections, tests et preuves textuelles, privilégier :

```text
outils Unix ciblés / Terminal macOS -> presse-papiers -> conversation
Console Chrome -> report -> presse-papiers -> conversation
```

Python n’est utilisé que lorsqu’il apporte une capacité réellement nécessaire, par exemple un traitement ou une transformation qui serait sensiblement plus fragile ou complexe avec les outils directs. Éviter notamment les heredocs Python pour de simples inspections ou modifications textuelles réalisables avec les outils Unix.

Les ZIP et fichiers à joindre à la conversation sont réservés aux véritables artefacts de transfert : snapshot de worktree, ensemble cohérent de fichiers à installer, document produit ou donnée dont la structure doit être préservée. Ils ne doivent pas remplacer systématiquement le copier-coller direct d’une preuve ou d’une information.

### Granularité adaptative

RED/GREEN reste un outil de preuve scientifique et non une obligation de micro-décomposition. Après établissement de suffisamment de mécanismes pour former un comportement cohérent, privilégier :

```text
intégration
  -> régression groupée / build
  -> validation Vite et preuve croisée Terminal / Chrome
  -> retour utilisateur lorsque nécessaire
  -> corrections éventuelles
  -> capitalisation explicite
```

La capitalisation ne doit être ni automatique après chaque petit GREEN, ni repoussée au point de perdre les résultats expérimentaux significatifs.

## Addendum — evidence protocol for W2UI interactions — 2026-09-22

For W2UI-related work, the evidence chain is extended with mandatory provenance:

- `DOC`: official W2UI 2 documentation;
- `EX`: official W2UI example/demo;
- `SRC`: exact installed W2UI source;
- `EXP`: reproducible experiment;
- `BPMNSM-HYP`: project hypothesis.

A significant W2UI change must begin with `DOC` and, where available, `EX`. `SRC` is used to resolve ambiguity, not as the primary way to reconstruct the public interaction model. `EXP` is used only when documentation/examples/source still leave an operational question.

Required sequence:

```text
interaction intent
→ W2UI macro-component/pattern
→ DOC / EX
→ unresolved detail? SRC
→ unresolved runtime question? EXP
→ targeted unit proof
→ BPMNSM integration proof
→ Vite/Chrome product proof
```

If unit/integration evidence is GREEN while the product is RED, stop production patching and identify the first divergence between the tested and product compositions.

Manual DOM event workarounds are not accepted as fixes when a native W2UI widget mechanism exists unless the insufficiency of that native mechanism is demonstrated.
