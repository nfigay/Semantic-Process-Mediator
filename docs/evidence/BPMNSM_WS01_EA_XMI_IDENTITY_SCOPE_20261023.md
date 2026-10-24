# BPMNSM — WS-01 — Identités EA/XMI et périmètres d’export

Date : 2026-10-23  
Statut : **capitalisation d'observations et exigences de validation**, non décision architecturale stabilisée.  
Portée : import Sparx Enterprise Architect XMI vers BPMN, Workspace BPMNSM.

## Context

Dans EA, l’export XMI peut être réalisé à l’échelle d’un projet ou d’un package quelconque. Un projet EA peut comporter plusieurs packages, certains sans contenu BPMN. Un XMI exporté ne représente donc pas nécessairement un modèle BPMN unique. Cette contrainte de périmètre a été explicitée pendant la validation WS-01.

## Identités à ne pas confondre

| Objet | Identité / provenance | Fonction |
|---|---|---|
| Projet ou package EA | Identifiant EA du conteneur exporté | Périmètre et traçabilité de l'export ; **pas nécessairement** identité d'un modèle BPMN |
| Processus BPMN | `bpmn:process/@id` | Identité d'un processus converti |
| Collaboration BPMN | `bpmn:collaboration/@id` | Identité d'une collaboration convertie |
| Définitions BPMN | `bpmn:definitions/@id` | Identité de la racine du document BPMN produit |
| Document Repository | Identifiant propre au Repository (`imported-*` dans les essais) | Enregistrement, activation et persistance du document |

**Exigence à qualifier** : l'identité d'un modèle BPMN ne doit pas être assimilée sans preuve au GUID du package ou projet servant de racine à l'export XMI.

## Evidence et résultats observés

- Dans les essais Chrome communiqués le 2026-10-23 : importation successive de plusieurs processus XMI différents dans un même Workspace, puis refus explicite de réimportation d'un processus déjà présent ; le dialogue cite une identité BPMN et le document existant `imported-2`.
- Dans un essai précédent : import XMI dans un Workspace, modification, sauvegarde ZIP et réouverture physique réussis pour le scénario exercé.
- Le code de `ea-definitions-identity.js` livré par le patch WS-01 choisit actuellement **la première** `bpmn:collaboration/@id`, ou, à défaut, **le premier** `bpmn:process/@id`, pour dériver `definitions/@id`. Les identités métier sont conservées. Ce comportement est une implémentation observée, **pas la preuve** d'une sémantique correcte pour un XMI multipackage/multimodèle.

## Limites / NOT PROVEN

- Provenance exacte des identifiants dans le XSLT EA réel, en particulier pour un export de package englobant plusieurs modèles.
- Identification et sélection des modèles BPMN dans un XMI contenant plusieurs packages BPMN et des éléments EA non BPMN.
- Cohabitation de plusieurs collaborations distinctes dans le même Workspace, et round-trip ZIP multiprocessus/multicollaboration.
- Stabilité de la transformation lorsque l'on exporte un même processus à différents niveaux de package, ainsi que le traitement des chevauchements entre exports.
- Unicité sûre de `definitions/@id` si un document BPMN converti contient plusieurs racines métier. La stratégie « première collaboration sinon premier processus » doit être qualifiée, non généralisée.

## Critères de validation à conserver dans des tests permanents

1. Deux exports XMI contenant des processus BPMN distincts doivent permettre l'import des deux modèles, sans collision artificielle due au package d'export.
2. Deux collaborations BPMN distinctes doivent pouvoir coexister si leurs identités métier sont distinctes.
3. Le réimport d'un modèle déjà présent doit être refusé explicitement, sans altérer le Workspace.
4. Un export XMI multipackage mixte doit exclure les éléments non BPMN et identifier les modèles BPMN réellement produits par le XSLT.
5. Pour un même modèle inclus dans des exports de périmètres différents, la politique de détection des doublons doit être explicitement définie et testée.
6. La sauvegarde et la réouverture physiques du ZIP doivent préserver les documents et leurs identités sans confusion entre canvas, `definitions` et document Repository.

## NEXT GATE

Inspecter le XSLT réel, ses sélections XPath et la structure d'au moins un export EA multipackage représentatif ; qualifier la provenance de chaque `id`. Puis ajouter les tests de non-régression appropriés **avant toute généralisation ou modification du comportement**.

## Hors périmètre de cette capitalisation

Aucune modification de sources, XSLT, tests ou artefacts publiés ; aucune migration d'identifiants ; aucun commit, push ou déploiement. Les contrats et décisions normatives existants restent prioritaires.
