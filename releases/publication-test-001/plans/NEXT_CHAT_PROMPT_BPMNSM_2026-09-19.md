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

Checkpoint attendu au changement de discussion : branche `main`, HEAD `8bb4954828e6f54ad449c1e1ab46344da90b99ed`, baseline consolidée de 91 fichiers staged, techniquement démontrée par reconstruction fraîche, mais **aucun commit de baseline créé**, **aucun push de cette baseline**, **aucune exécution GitHub Actions de cette baseline**.

Décision opérationnelle : capitalisation → commit consolidé → push GitHub → première preuve GitHub Actions → minimum Pages utile au test en ligne → reprise E14. La CI doit donc être mise en service avant les nouveaux incréments fonctionnels.

Décision d'architecture publication/repository : séparer `BPMNSM deployment × resource repository × repository revision`. Le repository de ressources est un repository Git de fichiers (BPMN et autres ressources seulement si justifiées), pas une base distante commune. Préserver deux modes futurs : workspace local + Git externe, et API de forge distante. GitHub est le premier provider ; ne pas coupler le modèle métier de façon à interdire GitLab.

Cible Pages future : releases immuables conservées, `latest`, previews et éventuelles distributions custom, lançables simultanément. Cette cible est `[NON IMPLÉMENTÉ]` et ne doit pas être confondue avec les preuves Pages historiques.

ArchiCG et StandardisationRadarChart sont des opportunités futures de réutilisation. Ne lance pas maintenant de monorepo, package partagé ou chantier transverse ; BPMNSM reste prioritaire.

E14 est la prochaine expérience Business Model ouverte, mais ne la commence pas avant la frontière CI ci-dessus sauf décision explicite de ma part.

Règles de travail impératives : aucune commande Git destructive ; étapes atomiques ; pas de commit/push sans demande explicite ; ZIP complets pour les modifications ; archives d'inspection dans `~/Downloads` ; commandes zsh compatibles et copiées avec `2>&1 | tee /dev/tty | pbcopy` ; ne termine pas une étape évidente par une question de permission ; donne directement l'action atomique suivante.

Première action : inspecter sans modifier le style des commits récents, l'état exact de l'index et les préconditions de la baseline. Ne crée aucun commit tant que je ne l'ai pas explicitement demandé.
