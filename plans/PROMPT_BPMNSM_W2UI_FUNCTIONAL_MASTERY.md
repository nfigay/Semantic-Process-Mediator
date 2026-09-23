# BPMNSM — Prompt de reprise — W2UI functional mastery

Tu reprends BPMNSM depuis le repository réel, qui reste l'autorité. Ne reconstruis jamais le repository depuis ce prompt, la mémoire du chat ou des snippets.

Commence par lire les documents d'autorité du worktree, notamment le Handover, Workplan, les cibles métier/configuration, le protocole expérimental, puis :

- `public/plans/BPMNSM_W2UI_2_FUNCTIONAL_MAP.md`
- `public/plans/BPMNSM_W2UI_2_TRACEABILITY_MATRIX.md`

## Discipline W2UI obligatoire

W2UI est une dépendance UI structurante de BPMNSM.

Pour toute conception, modification ou investigation concernant W2UI :

1. partir de l'intention d'interaction BPMNSM ;
2. consulter la documentation officielle W2UI 2 du macro-composant concerné ;
3. consulter les exemples officiels pertinents et comprendre le pattern de composition ;
4. utiliser ensuite le source exact installé pour lever les ambiguïtés ;
5. faire une expérience minimale uniquement si une question reste ouverte ;
6. distinguer explicitement `DOC / EX / SRC / EXP / BPMNSM-HYP` ;
7. privilégier les mécanismes natifs W2UI aux handlers/mutations DOM bas niveau ;
8. ne jamais transformer une hypothèse en contrat W2UI ;
9. prouver successivement contrat local, intégration BPMNSM et comportement Vite/Chrome.

Avant d'implémenter une nouvelle interaction, rechercher d'abord si W2UI fournit déjà un macro-composant ou un pattern de composition qui l'exprime nativement.

Pour toute tranche UI significative, produire le design record défini dans `BPMNSM_W2UI_2_FUNCTIONAL_MAP.md` et référencer les exigences `UI-W2-*` applicables de `BPMNSM_W2UI_2_TRACEABILITY_MATRIX.md` avant l'implémentation.

## État Resource duplication

Ne pas rouvrir le chantier du context menu sans nouvelle preuve : l'affichage W2UI `Duplicate resource to…` après reload propre a été démontré dans le produit.

Le RED courant est distinct : après choix de la Source cible, la duplication effective/projection cible n'est pas encore démontrée. Localiser la première rupture dans la chaîne d'exécution avant tout nouveau patch.

## Protocole de modification

Analyse → proposition → transfert du worktree réel → inspection → ZIP correctif → déploiement par l'utilisateur → preuves.

Ne pas fournir de commandes `sed`, `perl` ou équivalentes qui modifient directement le source pendant la collaboration. Ne pas demander d'édition manuelle du code.
