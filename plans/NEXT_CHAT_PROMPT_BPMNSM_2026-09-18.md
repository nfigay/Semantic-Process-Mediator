# Prompt de reprise BPMNSM --- nouveau chat --- checkpoint 2026-09-18

Je reprends le projet **BPMNSM / Semantic Process Mediator** à partir du checkpoint du **18 septembre 2026**.

Commence par lire dans cet ordre :

1. `public/plans/HANDOVER_BPMNSM_2026-09-18.md`
2. `public/plans/PROJECT_CONTEXT_BPMNSM_2026-09-18.md`
3. `public/plans/BPMNSM_CONFIGURATION_AND_PUBLISHING_TARGET.md`
4. `public/plans/README.md`

Consulte ensuite les documents de vision uniquement si le sujet l'exige :
- `public/plans/BPMNSM_PROCESS_INTEROPERABILITY_VISION.md`
- `public/plans/BPMNSM_IN_INTEROPERABILITY_OF_MEANING.md`
- `public/plans/INTEROPERABILITY_OF_MEANING_VISION.md`

Règles impératives de travail :

- le **repository réel est l'autorité pour le code exact** ;
- ne reconstruis jamais du code exact depuis les documents de continuité ;
- inspecte le fichier réel avant toute modification ;
- aucune commande Git destructive (`reset`, `clean`, `checkout`, etc.) ;
- étapes atomiques ;
- corrections/implémentations livrées en **ZIP avec fichiers complets et arborescence repository** ;
- je télécharge et installe moi-même les ZIP : ne donne pas de commandes d'installation/décompression ;
- toute archive d'inspection que tu me demandes de créer doit aller dans **`~/Downloads`**, jamais `/tmp` ;
- les commandes doivent afficher leur sortie **et la copier dans le presse-papiers**, typiquement avec `2>&1 | tee /dev/tty | pbcopy` ;
- tests avec `npm test -- --run ...` ;
- vocabulaire de statut exclusivement :
  - `[IMPLÉMENTÉ + DÉMONTRÉ]`
  - `[DÉMONTRÉ PAR INSPECTION]`
  - `[NON IMPLÉMENTÉ]`
- n'invente ni abstraction, ni feature, ni numéro de roadmap ;
- ne termine pas une étape évidente par une question de permission : donne directement la prochaine action atomique ;
- ne rouvre pas l'historique général si le checkpoint suffit.

Invariants essentiels :

- BPMN 2.0 XML reste le pivot ; ce que BPMN sait exprimer reste natif BPMN ;
- SemArch/CoC enrichit BPMN, ne le remplace pas ;
- `UNRESOLVED ≠ INVALID` ;
- persistance source et publication dérivée restent distinctes ;
- le Viewer consomme l'artefact publié sans résoudre un ProfileRuntime pour republier ;
- `ProfileRuntime` détermine quelles propriétés existent/résolvent ;
- `BusinessView` détermine quelles propriétés sont projetées ;
- **`BusinessView = null` signifie absence de filtrage Business View**, jamais « masquer les propriétés Avionics » ;
- identité Business Object ≠ `semarch:stableGuid` ≠ BPMN element id ≠ `RepositoryComponent.id`.

État acquis à ne pas réimplémenter :

- Business View normalisée/versionnée et Avionics v1.0 ;
- activation Business View depuis `CoC_Avionics` ;
- `BusinessObject { id, typeRefs[] }` ;
- BusinessObjectStore ;
- BusinessObjectRepresentation et store ;
- actions attach/detach ;
- création interactive BO ;
- Properties Panel attach/detach + refresh immédiat ;
- persistance/reprojection BusinessObject et BusinessObjectRepresentation dans le repository BPMN courant ;
- restauration du lien BO↔représentation après réouverture ;
- navigateur `Model → Business Objects…` ;
- baseline **67 fichiers de test / 305 tests / 0 échec** ;
- Viewer/Editor single-file ;
- présentation Reveal.js ;
- package offline BPMNSM ;
- pipeline standalone anti-stale ;
- `npm run build` et `npm run deploy` démontrés ;
- GitHub Pages démontré ;
- `Repository → Open BPMN…` démontré sur le Viewer public.

Frontières encore ouvertes :

```text
ActiveBusinessObject                        [NON IMPLÉMENTÉ]
Business Object sans représentation BPMN    [NON IMPLÉMENTÉ]
BusinessRelation                            [NON IMPLÉMENTÉ]
repository distribué / manifest             [NON IMPLÉMENTÉ]
navigation business dans Viewer             [NON IMPLÉMENTÉ]
relations métier inter-modèles              [NON IMPLÉMENTÉ]
```

Point de reprise :

Le vertical BO↔représentation BPMN est désormais démontré. Ne commence pas par concevoir un métamodèle universel ou un manifest.

Prends la **plus petite tranche produit observable** qui oblige à traiter une information métier au-delà du lien BO↔représentation déjà acquis — par exemple un Business Object sans représentation BPMN, une BusinessRelation ou une navigation business — et utilise cette expérience pour déterminer où doit vivre l'information :

```text
dans un BPMN particulier
vs
dérivée de plusieurs BPMN
vs
dans un artefact complémentaire de niveau repository
```

Avant de proposer une modification, inspecte les fichiers réels strictement nécessaires et conserve les frontières d'architecture déjà démontrées.
