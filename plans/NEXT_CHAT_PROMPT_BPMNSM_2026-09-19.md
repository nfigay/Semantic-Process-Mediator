# Prompt de reprise BPMNSM --- nouvelle discussion --- 2026-09-19

Je poursuis le projet BPMNSM / Semantic Process Mediator.

Commence par lire, dans cet ordre, les fichiers réels du repository :

1. `public/plans/HANDOVER_BPMNSM_2026-09-19.md`
2. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
3. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
4. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`
5. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_GUIDE.md`
6. `public/plans/README.md`

Le repository réel est l'autorité pour le code exact. Ne reconstruis jamais un fichier de code depuis le handover ou ce prompt. Inspecte les fichiers exacts avant toute modification.

Checkpoint actuel : branche `main`, HEAD `be5f6b355a3da39dc1b51591a5ccdd7000ec9633` (`feat(model): add autonomous business relations`). Ce commit contient le prototype `BusinessRelation` modèle/store et est antérieur à la récupération de la numérotation autoritaire E14–E16. La preuve runtime/persistance `BusinessRelation` ultérieure est `[IMPLÉMENTÉ + DÉMONTRÉ]` dans son périmètre technique et non commitée. Ne pas assimiler ces travaux à E14/E15 autoritaires. L'index doit rester inspecté explicitement avant toute opération Git.

Décision opérationnelle actuelle : le prototype `BusinessRelation` est commit au HEAD ; sa preuve runtime/persistance reste non commitée et a reproduit le précédent BPMNSM manuel dans le standalone généré : création UI des BO, création applicative de la relation, Export XML physique, Open Repository réel et restauration runtime/canonique identique. La régression finale a passé 23/23 tests ciblés et `build:editor` a réussi. Cette preuve technique, historiquement appelée E15 avant récupération du registre, ne ferme pas E15 autoritaire et ne démontre pas la nécessité E16.

Décision d'architecture publication/repository : séparer `BPMNSM deployment × resource repository × repository revision`. Le repository de ressources est un repository Git de fichiers (BPMN et autres ressources seulement si justifiées), pas une base distante commune. Préserver deux modes futurs : workspace local + Git externe, et API de forge distante. GitHub est le premier provider ; ne pas coupler le modèle métier de façon à interdire GitLab.

Cible Pages future : releases immuables conservées, `latest`, previews et éventuelles distributions custom, lançables simultanément. Cette cible est `[NON IMPLÉMENTÉ]` et ne doit pas être confondue avec les preuves Pages historiques.

ArchiCG et StandardisationRadarChart sont des opportunités futures de réutilisation. Ne lance pas maintenant de monorepo, package partagé ou chantier transverse ; BPMNSM reste prioritaire.

Le prototype `BusinessRelation` modèle/store est commit au HEAD courant. Sa preuve runtime/persistance est démontrée dans son périmètre technique et non commitée. Le decision gate autoritaire ci-dessous prévaut : E14 est fermé ; E15 et E16 restent ouverts selon leurs critères produit. Ne pas rouvrir la frontière runtime déjà démontrée sans nouvelle propriété à éprouver.

Règles de travail impératives : aucune commande Git destructive ; étapes atomiques ; pas de commit/push sans demande explicite ; ZIP complets pour les modifications ; archives d'inspection dans `~/Downloads` ; commandes zsh compatibles et copiées avec `2>&1 | tee /dev/tty | pbcopy` ; ne termine pas une étape évidente par une question de permission ; donne directement l'action atomique suivante.

Première action : reprendre le decision gate E14–E16 ci-dessous et ne pas inventer une nouvelle expérience technique pour forcer la fermeture d'E15 ou E16. Le prochain manque autoritaire est une preuve produit réelle pour E15 puis, seulement si les alternatives existantes sont insuffisantes, un cas produit irréductible pour E16. Ne crée aucun commit et n'introduis aucune nouvelle méthode de validation tant que le précédent applicable n'a pas été récupéré et que son insuffisance éventuelle n'a pas été démontrée.

CONTINUITÉ MÉTHODOLOGIQUE IMPÉRATIVE

Un nouveau chat ne constitue jamais une autorisation implicite de
réinterpréter le protocole BPMNSM.

DO NOT invent a new validation, testing, runtime, publication, browser,
or repository protocol merely because the previous chat ended or because
another technique appears convenient.

First recover and apply the established BPMNSM precedent.

For every open experiment:

1. recover the exact need / objective and claim;
2. identify what is already demonstrated and what remains unproved;
3. inspect the real repository before assuming current implementation;
4. find the established BPMNSM method used for an analogous property;
5. reuse that method when applicable;
6. use the smallest falsifiable experiment;
7. run grouped regressions;
8. state the exact evidence boundary.

Do not treat source inspection, unit tests, serialization round-trip,
build success, generated-bundle inspection and generated-application
runtime execution as equivalent evidence.

If the established method is insufficient, demonstrate that insufficiency
explicitly. Then explain the proposed replacement method, why it is
necessary and what additional scope or infrastructure it introduces.
The user decides whether the protocol changes.

Do not introduce a new library, browser harness, E2E infrastructure,
diagnostic production hook, architectural abstraction or adjacent feature
merely to make an experiment easier.

A newly discovered problem does not automatically enlarge the current
experiment.

Continue the existing work plan; do not silently create a new one.

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
