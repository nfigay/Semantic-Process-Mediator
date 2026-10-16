# Protocole éditorial V1 — CANDIDAT, non adopté

## Principe

Adaptation limitée du raisonnement Claim–Context–Evidence–Limit : une communication ne certifie pas une release, un test, un déploiement ou une contribution scientifique au-delà des faits observés.

## Cycle en quatre gates regroupés

1. **DESIGN** : cible, intérêt lecteur, question expérimentalement examinée, version de la configuration humain–IA, assertions atomiques, choix des preuves et limites.
2. **VERIFY** : comparer chaque assertion aux sources qui font autorité, distinguer vérification statique, build, intégration, runtime, publication distante et validation humaine; contrôler légendes, captures, provenance, droits/confidentialité et dates.
3. **ACCEPT** : auteur humain approuve explicitement l'empreinte du texte exact et des médias exacts ; aucun agrément implicite.
4. **PUBLISH** : autorisation **séparée** de publier; consigner canal, URL, horodatage, empreintes, modifications éditoriales effectuées par la plateforme. Commit et push Git nécessitent aussi leurs autorisations séparées.

Une campagne groupée suffit si elle couvre tous les claims sans anomalie; en cas de doute, mettre le claim en HOLD, pas multiplier des gates.

## Registre minimal

`CLAIMS.tsv`: article_id, claim_id, assertion, context, source_path, source_sha256, evidence_type, limit, status, redaction_check. Statuts : DRAFT / VERIFIED_BOUNDED / HOLD / RETRACTED.

`PUBLICATIONS.tsv`: article_id, state, accepted_text_sha256, accepted_visuals_sha256, platform, published_url, published_utc, public_snapshot_sha256, note. Séparer publication éditoriale et `publication/versions.json` du produit.

## Illustrations

Chaque illustration possède `visual_id`, `type=SCHEMA|SCREENSHOT|EVIDENCE_EXCERPT`, source de vérité, méthode de production, version, date, droits, légende, limites. Un schéma de reconstruction doit être présenté comme tel. Une capture runtime exige application/version/URL, contexte et masquage éventuel. Une capture de configuration ne prouve pas un déploiement.

## Respect et confidentialité

Éviter secrets, clés, identifiants personnels dans traces et captures. Éviter republier les journaux bruts ou ZIPs internes. Toute allégation sur GitHub Pages requiert preuve de la version distante correspondante; une réponse HTTP 200 n'est pas preuve d'interaction fonctionnelle.

## Continuité

CURRENT EXPERIMENT / PROVEN / NOT PROVEN / LEARNINGS / NEXT GATE dans chaque passage de conversation; les publications Git sont l'autorité historique durable.
