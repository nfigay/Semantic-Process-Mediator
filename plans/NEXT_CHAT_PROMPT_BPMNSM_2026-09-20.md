# BPMNSM — Prompt de reprise — 2026-09-20

Tu reprends le projet BPMNSM / Semantic Process Mediator à un checkpoint
documenté. Ne reconstruis jamais le repository depuis ce prompt : le
repository réel reste l'autorité.

Commence par lire, dans cet ordre :

1. `public/plans/HANDOVER_BPMNSM_2026-09-20.md`
2. `public/plans/BPMNSM_BUSINESS_MODEL_EXPERIMENTAL_TARGET.md`
3. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
4. `public/plans/BPMNSM_EVIDENCE_DRIVEN_EXPERIMENTAL_DEVELOPMENT_PROTOCOL.md`

Checkpoint Git attendu :

```text
branch                              main
HEAD                                be5f6b355a3da39dc1b51591a5ccdd7000ec9633
HEAD subject                        feat(model): add autonomous business relations
index                               vide au checkpoint
worktree                            non propre, avec de nombreux travaux sans rapport à préserver
git diff --check                    silencieux au checkpoint
```

Ne fais aucun `git add -A`, reset, clean ou opération destructive. Aucun
commit/push/tag/release sans autorisation explicite.

## Frontière Business Model autoritaire

Le registre réel définit :

- E14 — enrichissement d'une relation BPMN :
  **[IMPLÉMENTÉ + DÉMONTRÉ]** ;
- E15 — Object Properties versus relations BPMN :
  **[NON IMPLÉMENTÉ]** au sens du critère « comparer des cas produit réels ».
  E15-01/02/03 sont démontrés uniquement comme comparaison architecturale
  contrôlée ;
- E16 — nécessité éventuelle de `BusinessRelation` :
  **[NON IMPLÉMENTÉ]** quant à la nécessité. E16-01/02 démontrent la
  faisabilité technique BO -> BO + BR et sa persistance, pas le « cas produit
  irréductible » ;
- E17-01 est parqué. Ne poursuis pas E17 avant résolution du gate E15–E16.

Le fixture `Aircraft --hasEngine--> Engine` est un cas de test architectural,
pas une exigence métier normative. Le futur cas de démonstration métier n'est
pas encore défini.

## Désambiguïsation impérative

Le HEAD `be5f6b35` contient le prototype autonome `BusinessRelation` et son
store. Une preuve technique ultérieure a démontré le runtime réel et la
persistance par Export XML physique puis Open Repository réel. Avant
récupération du registre, ces travaux ont été appelés E14/E15 dans la
conversation. Ne réutilise pas cette ancienne numérotation : les preuves
restent valides, les identifiants autoritaires sont ceux du registre.

## Prochaine action

Ne lance pas E17 et ne crée pas E16-03 pour forcer la nécessité de
`BusinessRelation`.

Le prochain manque autoritaire est E15 : un **cas produit réel** permettant
de comparer `ObjectProperty`, relation BPMN native éventuellement enrichie et
dérivation. Si ce cas métier n'est pas encore défini, maintiens E15 et E16
ouverts ; ne fabrique pas un substitut.

L'objectif de trajectoire reste d'évaluer BO -> BO + BR d'abord par
faisabilité architecturale, déjà démontrée, puis par un futur cas de
démonstration métier encore indéfini. La solution finale doit être argumentée
par les preuves, pas choisie par inertie du code existant.

## Méthode impérative

Applique la séquence :

```text
inspection ciblée
→ précédent BPMNSM établi
→ reproduction du précédent
→ expérience falsifiable minimale
→ evidence
→ régression groupée
→ décision
→ capitalisation
```

Ne confonds jamais inspection source, test unitaire, round-trip de
sérialisation, build, inspection de bundle et runtime réel.

N'introduis une nouvelle méthode ou infrastructure qu'après avoir démontré
l'insuffisance du précédent et exposé le changement avant adoption.

Pour toute modification : ZIP d'entrée constitué depuis les fichiers exacts
du worktree → ZIP de sortie avec fichiers complets et arborescence repository
→ installation manuelle → vérification groupée. Ne demande jamais une
modification manuelle de code.

Commandes zsh compatibles. Pour les sorties d'inspection, utiliser
`2>&1 | tee /dev/tty | pbcopy`. `rg` n'est pas disponible. Pour Vitest 5,
utiliser Node 22.22.2 via nvm lorsque nécessaire.

Ne termine pas une étape évidente par une question de permission : donne
directement l'action atomique suivante.
