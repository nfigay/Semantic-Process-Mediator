# BPMNSM --- Développer par l'expérience et la preuve

## 1. Pourquoi cette approche

BPMNSM évolue sur des frontières où une décision locale peut engager durablement le modèle métier, la persistance, BPMN, les profils, la publication ou le repository. La méthode employée vise donc moins à produire rapidement beaucoup de code qu'à **prendre rapidement de petites décisions vérifiables**.

Le nom de travail retenu est **Développement Expérimental Piloté par la Preuve (DEPP)**, ou **Evidence-Driven Experimental Development (EDED)**. Il s'agit d'un nom pratique pour la méthode BPMNSM, pas du nom revendiqué d'une méthode académique ou d'un standard externe.

La règle simple est :

> Une fonctionnalité ou une propriété n'est pas considérée acquise parce qu'elle a été codée. On définit ce qui doit être observable, on inspecte ce qui existe déjà, on effectue le changement minimal nécessaire, puis on produit une preuve reproductible et on vérifie la non-régression.

## 2. Une expérience plutôt qu'un lot de code

Une expérience part d'une incertitude réelle : plusieurs représentations doivent-elles créer plusieurs identités métier ? Une propriété appartient-elle au BO canonique ou à son contexte ? Une relation métier doit-elle réutiliser BPMN ou nécessiter une abstraction supplémentaire ?

L'expérience est réussie lorsqu'elle réduit cette incertitude de manière démontrable. Elle peut donc aboutir à du code, à un test seulement, à une décision documentaire ou à la réfutation de l'idée initiale.

Cette conception évite qu'une architecture supposée devienne progressivement une contrainte simplement parce qu'elle a été implémentée avant d'être éprouvée.

## 3. Exemple : E11

E11 pose la question de plusieurs représentations d'un même Business Object dans un même contexte. L'inspection a montré que les mécanismes fondamentaux nécessaires existaient déjà. La contribution expérimentale déterminante a donc été une preuve composée démontrant que deux représentations distinctes conduisent au même BO canonique et à une contextualisation cohérente.

Le résultat est important méthodologiquement : **aucun volume de code de production supplémentaire n'était requis pour que l'expérience apporte de la valeur**. La meilleure implémentation de l'expérience était essentiellement la preuve manquante.

C'est un exemple de vitesse de développement obtenue non en supprimant la vérification, mais en évitant une modification inutile.

## 4. De l'exigence à la preuve

La chaîne recherchée est :

```text
Need / objectif stakeholder
          ↓
Requirement
          ↓
User Story lorsque pertinente
          ↓
Claim / propriété vérifiable
          ↓
Experiment
          ↓
Evidence
          ↓
Decision / feedback
```

Le Requirement exprime ce qui est attendu. La User Story, lorsqu'elle est utile, donne le point de vue d'un acteur et la valeur recherchée. Le Claim transforme une partie de cette attente en affirmation vérifiable. L'expérience confronte cette affirmation au système réel. L'Evidence documente ce qui a effectivement été observé.

Cette séparation évite de confondre « un test passe » avec « le besoin est satisfait ».

## 5. Claim--Context--Evidence--Limit

Une preuve BPMNSM est toujours scopée :

```text
CLAIM
ce que nous affirmons

CONTEXT
les conditions dans lesquelles nous l'avons observé

EVIDENCE
les observations qui soutiennent l'affirmation

LIMIT
ce que ces observations ne démontrent pas
```

Cette structure permet d'être précis sans transformer chaque résultat en promesse générale. Elle facilite aussi les handovers : un nouveau contributeur sait non seulement ce qui est considéré démontré, mais également où s'arrête la démonstration.

## 6. Relation avec Requirements-driven development

Le développement piloté par les exigences définit d'abord ce que le système doit satisfaire. Le DEPP ne le remplace pas. Il fournit une boucle courte pour transformer une exigence ou une incertitude architecturale en propriété observable et en preuve.

```text
Requirement
    ↓
propriété vérifiable
    ↓
expérience minimale
    ↓
preuve
    ↓
retour vers le Requirement
```

Le projet peut ainsi conserver une traçabilité d'ingénierie système sans devoir introduire immédiatement un outil lourd de gestion d'exigences. Markdown, identifiants stables lorsque nécessaires et Git peuvent constituer un premier niveau suffisant.

## 7. Relation avec les User Stories

Une User Story est particulièrement utile pour une capacité visible par un acteur, par exemple naviguer depuis une Object Property vers le Business Object cible.

Elle est moins naturelle pour un invariant tel que « l'identité canonique d'un BO est distincte de ses représentations ». Le DEPP permet donc d'utiliser les User Stories lorsqu'elles apportent du sens sans forcer toute décision architecturale dans ce format.

## 8. Relation avec TDD et BDD

Le TDD organise typiquement une boucle `red → green → refactor`. Le BDD rend des comportements attendus explicites sous une forme centrée sur des scénarios.

Le DEPP se situe à un autre niveau de questionnement :

```text
question
  ↓
hypothèse / Claim
  ↓
inspection
  ↓
expérience
  ↓
modification éventuelle
  ↓
preuve
  ↓
régression
  ↓
capitalisation
```

TDD et BDD peuvent être des instruments à l'intérieur de cette boucle. Mais le DEPP autorise aussi le résultat « le mécanisme existe déjà ; seule la preuve manquait », situation dans laquelle créer artificiellement un échec préalable ou modifier la production serait contre-productif.

## 9. Relation avec Agile et rapid development

Agile apporte des incréments courts, du feedback fréquent et l'adaptation. La méthode de rapid development déjà documentée dans BPMNSM suit cette logique tout en ajoutant une exigence forte de preuve architecturale.

Le DEPP formalise cette boucle :

```text
petit Claim
    ↓
petite expérience
    ↓
feedback rapide
   /          confirmé     réfuté
   \          /
    apprentissage
         ↓
expérience suivante
```

La vitesse recherchée est une **vitesse soutenable de décision** : peu de code spéculatif, erreurs détectées tôt, régression automatisée et apprentissage capitalisé.

Toutes les modifications n'ont pas besoin d'un cycle expérimental complet. Une correction locale bien comprise peut conserver une boucle courte test/changement/régression. Le cycle complet est particulièrement utile lorsqu'une nouvelle abstraction, une frontière de persistance ou une propriété architecturale est en jeu.

## 10. Relation avec Systems Engineering et V&V

L'ingénierie système distingue classiquement deux questions complémentaires.

**Verification** : le système réalisé satisfait-il les propriétés définies ?

**Validation** : ces propriétés et cette solution répondent-elles réellement au besoin des stakeholders dans le contexte d'usage ?

Le DEPP introduit de petites boucles de Verification et de Validation au cours du développement plutôt que de reporter toute confrontation à la fin :

```text
Need
 ↓
Requirement
 ↓
Claim
 ↓
Experiment
 ↓
Verification Evidence
 ↓
Deployed / demonstrated capability
 ↓
Validation Evidence / stakeholder feedback
 ↓
Need / Requirement refined
```

Une expérience purement architecturale peut être correctement vérifiée sans constituer à elle seule une validation métier. Cette distinction évite de surinterpréter les tests automatisés.

## 11. Relation avec DevOps

DevOps permet d'automatiser et de prolonger la chaîne de preuve :

```text
source + tests
      ↓
Git commit
      ↓
CI verification
      ↓
build
      ↓
artifact
      ↓
deployment
      ↓
operational observation
```

Le DEPP donne un sens à cette automatisation : la CI n'est pas seulement « verte », elle produit des Evidence pour des Claims identifiés et une configuration déterminée.

À terme, le commit vérifié, l'artefact construit et la version déployée devraient pouvoir être reliés entre eux.

## 12. Cas d'une application web cliente pure et GitHub Pages

L'architecture de BPMNSM permet une chaîne particulièrement légère :

```text
Git repository
      ↓
CI : tests + build
      ↓
artefact web
      ↓
GitHub Pages
      ↓
BPMNSM dans le navigateur
```

Un backend applicatif n'est pas nécessaire pour établir cette continuité. Une identité de build exposée par l'artefact permettrait à terme de relier la version exécutée au commit vérifié.

Un contrôle externe peut ensuite vérifier la disponibilité, le chargement de l'application, l'identité de la version et quelques scénarios critiques. Cela constitue du monitoring du produit publié sans imposer de surveillance des utilisateurs.

## 13. Monitoring sans télémétrie utilisateur

Pour BPMNSM, il est utile de distinguer :

```text
surveiller le produit
    site accessible
    assets chargeables
    version attendue
    smoke tests critiques

surveiller les utilisateurs
    modèles ouverts
    BO manipulés
    actions réalisées
    données métier
```

La première catégorie est compatible avec une application client-only et peut rester externe. La seconde nécessiterait collecte, backend, stockage, sécurité et gouvernance de données. Elle n'est pas un prérequis de la méthode et ne doit pas être introduite implicitement.

## 14. Les quatre couches de preuve

Une vision progressive de la maturité est :

```text
DESIGN EVIDENCE
inspection, analyse, contrat

BUILD EVIDENCE
tests, régression, CI

DEPLOYMENT EVIDENCE
artefact, identité de version, smoke test

RUNTIME EVIDENCE
observation opérationnelle pertinente
```

La validation humaine complète cette chaîne par les revues, démonstrations, scénarios d'acceptation et retours d'usage.

## 15. Une continuité de preuve plutôt qu'une accumulation de documents

La cible n'est pas de maintenir manuellement plusieurs catalogues contenant les mêmes faits. Les Requirements et registres expérimentaux doivent rester les sources normatives appropriées ; les matrices de traçabilité, tableaux V&V et rapports de couverture sont des vues dérivées.

La trajectoire visée est :

```text
Need
 ↓
Requirement
 ↓
Claim
 ↓
Experiment
 ↓
Evidence
 ↓
Git commit
 ↓
CI
 ↓
Artifact
 ↓
Deployment
 ↓
Operational / stakeholder feedback
```

Cette continuité peut être considérée comme une chaîne ou un fil de preuve. Elle est une cible méthodologique et d'outillage ; elle ne doit pas être présentée comme une capacité BPMNSM déjà implémentée lorsqu'elle ne l'est pas.

## 16. Ce que cette méthode cherche à éviter

Elle vise notamment à éviter les solutions conçues avant inspection, les abstractions spéculatives, la mesure du progrès par le volume de code, les tests sans Claim explicite, la généralisation au-delà de la preuve, la réécriture des checkpoints historiques et les matrices documentaires qui deviennent des sources de vérité concurrentes.

Elle cherche au contraire à rendre explicites les décisions, les observations qui les soutiennent, leurs limites et les conditions dans lesquelles elles pourront être remises en cause.

## 17. Résumé

Le DEPP articule plusieurs pratiques complémentaires sans chercher à les remplacer :

```text
Requirements     → pourquoi / quoi
User Stories     → acteur / intention / valeur lorsque pertinent
DEPP             → quelle propriété devons-nous confronter au réel ?
TDD / BDD        → comment rendre certains comportements exécutables ?
Agile            → comment obtenir du feedback par petits incréments ?
Systems V&V      → que vérifions-nous et que validons-nous ?
DevOps           → comment automatiser preuve, build et déploiement ?
Monitoring       → les propriétés pertinentes restent-elles observables ?
```

Pour BPMNSM, la finalité est simple : **accélérer l'apprentissage et le développement sans dissocier architecture, preuve, configuration et transmission de la connaissance.**
