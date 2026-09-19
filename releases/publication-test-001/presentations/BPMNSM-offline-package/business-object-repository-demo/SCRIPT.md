# Script oral — 5 à 10 minutes

## 0:00–0:35 — Promesse
« BPMN reste le pivot. La démonstration ne crée pas un nouveau format de processus : elle montre comment donner une identité métier persistante à un objet et relier cette identité à sa représentation BPMN. »

## 0:35–1:15 — BPMN natif / enrichissement SemArch
Montrer le processus et son DataStore/DataObject. « Tout ce que BPMN sait exprimer reste natif BPMN. SemArch porte uniquement l'enrichissement qui n'est pas naturellement dans BPMN. »

## 1:15–2:00 — Identité du Business Object
Créer `BO_DEMO`. « Cet identifiant est une identité métier. Il n'est ni l'id XML du DataStore/DataObject ni un stableGuid SemArch. »

## 2:00–3:00 — Attach
Dans le Properties Panel, attacher `BO_DEMO` à la représentation. Montrer que l'objet attaché apparaît immédiatement. « Le lien est explicite : Business Object → représentation BPMN. »

## 3:00–4:00 — Navigateur Business Objects
Ouvrir `Model → Business Objects…`. Montrer les types, la représentation, l'occurrence et le processus lorsqu'ils sont dérivables du BPMN. « On inverse le point de vue : on part de l'objet métier pour retrouver où il est représenté. »

## 4:00–5:00 — Round-trip
Sauvegarder le repository BPMN, le fermer/réouvrir, puis ouvrir immédiatement `Business Objects…` et le Properties Panel. « Le BO et son lien sont reconstruits sans rattachement manuel. »

## 5:00–5:35 — Preuve
« La verticale est couverte par la régression globale : 67 fichiers de tests, 305 tests, 0 échec. »

## 5:35–6:40 — Question d'architecture révélée
« Pour fermer cette verticale, le repository est aujourd'hui porté par un BPMN. Mais un repository réel peut agréger plusieurs BPMN organisés hiérarchiquement. Cela fait émerger le besoin d'un manifest d'intégration et d'un ownership explicite des informations transverses. »

## 6:40–7:30 — Objets sans représentation
« Un Business Object doit pouvoir exister avec zéro représentation BPMN. Plus tard, les relations entre objets métier devront également exister indépendamment des diagrammes. » Ne pas présenter BusinessRelation comme implémenté.

## 7:30–8:20 — Viewer / publication
« La destination est de partir d'un processus publié, sélectionner un objet représenté, puis naviguer vers l'information métier et ses autres représentations. Le Viewer doit consommer l'artefact publié ; il ne devient pas un moteur de transformation. »

## 8:20–9:00 — Conclusion
« La preuve est volontairement petite : identité métier, représentation BPMN, persistance et navigation. Elle rend maintenant observable la prochaine frontière : repository distribué et information métier complémentaire, sans abandonner BPMN comme pivot. »

## Limites à annoncer explicitement

- Le stockage du lien BO↔représentation dans le BPMN repository ferme la démonstration ; son ownership final dans un repository multi-fichiers reste à décider.
- `BusinessRelation` n'est pas implémenté.
- Le manifest de repository distribué n'est pas implémenté.
- `ActiveBusinessObject` n'est pas implémenté.
- Le Viewer et la publication ne sont pas encore étendus pour cette navigation métier.
