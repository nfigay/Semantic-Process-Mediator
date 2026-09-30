# BPMNSM — EA-PRE-01 — Mapping OMG CMOF/XMI → BPMN XML → Sparx EA MDG

## 1. Statut et autorité

Analyse statique reproductible du corpus EA-PRE-01. Elle ne qualifie pas encore le comportement de l'exporteur BPMN de Sparx EA : cette qualification exige un XMI EA et un export BPMN issus du même modèle.

Sources verrouillées par SHA256 :
- OMG `BPMN20.cmof`: `72f5bf...0139`
- OMG `Semantic.xsd`: `c43188...d9a7`
- OMG `BPMN20-FromXMI.xslt`: `4dee34...fb4b`
- Sparx EA 16.1.1628 `BPMN-2.0-Technology.xml`: `ce9520...d6d1`

La matrice machine-readable associée est :
`src/tests/sparx-ea/EA-PRE-01/analysis/omg-cmof-xml-sparx-mdg-mapping.json`.

## 2. Ordre de comparaison

1. **OMG-CMOF** — métamodèle sémantique BPMN.
2. **OMG-XML** — `Semantic.xsd`, contrat de sérialisation XML.
3. **OMG-XSLT** — transformation XMI→XML fournie dans le corpus OMG, analysée séparément car elle présente des écarts avec le XSD.
4. **SPARX-MDG** — projection des concepts BPMN sur les métaclasses natives EA.
5. **EXP** — XMI EA + BPMN exporté du même modèle, encore à fournir.

## 3. Famille Artifact

Le CMOF définit `Artifact` comme classe abstraite dérivant de `BaseElement`. `Group`, `Association` et `TextAnnotation` dérivent directement de `Artifact`. Le XSD conserve cette structure via `tArtifact`.

Sparx ne projette pas ces trois concepts sur une même métaclasse EA :
- `Group` → `SysBoundary`;
- `Association` → `Dependency`;
- `TextAnnotation` → `Note`.

Il s'agit d'une projection d'implémentation, pas en soi d'une non-conformité. La conformité d'interchange dépend de la reconstruction correcte des propriétés BPMN à l'export.

## 4. Group, Category, CategoryValue et appartenance

### OMG-CMOF

- `Group : Artifact`.
- `Group.categoryValueRef : CategoryValue [0..1]`.
- `Category : RootElement`.
- `Category.categoryValue : CategoryValue [0..*]`, composite.
- `CategoryValue : BaseElement`.
- `CategoryValue.categorizedFlowElements : FlowElement [0..*]`, **derived**.
- `FlowElement.categoryValueRef : CategoryValue [0..*]`.

Conséquence : le métamodèle ne définit pas l'appartenance à un Group par une `Association`. La catégorisation des FlowElements est portée normativement par `FlowElement.categoryValueRef`; `categorizedFlowElements` est le côté dérivé de cette relation. `Group.categoryValueRef` rattache le Group à une CategoryValue.

### OMG-XML / Semantic.xsd

- `tGroup/@categoryValueRef` : QName optionnel.
- `tCategory/categoryValue` : éléments répétables.
- `tCategoryValue/@value` : attribut optionnel.
- `tFlowElement/categoryValueRef` : **éléments** QName répétables.
- aucun `categorizedFlowElements` dans `tCategoryValue`.

### SPARX-MDG

- `Group` → `SysBoundary`, tags `documentation`, `categoryValueRef`.
- `Category` → `Class`, tags `documentation`, `categoryValue`.
- `CategoryValue` → `Class` (metatype `Value`), tags `documentation`, `category`, `categorizedFlowElements`.

Le profil Sparx expose donc explicitement les concepts de catégorisation. Il n'est pas justifié, à ce stade, de supposer qu'un Group est représenté sémantiquement par des Associations.

### Point expérimental

Le futur cas EA doit déterminer :
- où EA stocke réellement les références Group/CategoryValue/FlowElement;
- ce qui apparaît dans son XMI;
- ce que l'export BPMN restitue;
- si d'éventuelles Associations visibles sont sémantiques, graphiques ou indépendantes du Group.

## 5. Association

### OMG

`Association : Artifact` avec :
- `associationDirection : AssociationDirection`;
- `sourceRef : BaseElement`;
- `targetRef : BaseElement`.

Le XSD sérialise les endpoints en attributs QName **requis** et `associationDirection` en attribut avec défaut `None`.

### Sparx

`BPMN2.0::Association` s'applique à `Dependency`, avec `direction=Unspecified`; ses tags sont `auditing`, `documentation`, `monitoring`. Le MDG n'expose pas `sourceRef`, `targetRef` ni `associationDirection` comme tags.

**Observation, pas anomalie :** les endpoints et la direction doivent donc être projetés via les propriétés natives du connecteur EA et/ou une logique d'export. Le XMI EA permettra de localiser ce mapping.

## 6. TextAnnotation

### OMG

`TextAnnotation : Artifact` avec `text` et `textFormat`, ce dernier valant par défaut `text/plain`. En XML, `text` est un élément et `textFormat` un attribut.

### Sparx

`BPMN2.0::TextAnnotation` s'applique à `Note`. Les tags déclarés sont `rightFacing` et `documentation`; ni `text` ni `textFormat` ne sont des tags.

**Observation :** le texte BPMN doit donc être projeté depuis le contenu natif de la Note EA ou une autre propriété interne. Ce point doit être vérifié par XMI + export BPMN.

## 7. Écarts internes au corpus OMG à conserver comme observations

Le XSLT `BPMN20-FromXMI.xslt` ne reproduit pas partout la forme définie par `Semantic.xsd` :

1. `FlowElementTemplate` lit `@categoryValueRef` et émet un **attribut** `categoryValueRef`, alors que `tFlowElement` définit des **éléments** `categoryValueRef` répétables.
2. `CategoryValueTemplate` lit `@categorizedFlowElements` et tente d'émettre un attribut `categorizedFlowElements`, absent de `tCategoryValue` dans `Semantic.xsd`.
3. Pour `Group`, `Association` et `TextAnnotation`, les templates observés correspondent en revanche aux formes XSD principales : attribut Group `categoryValueRef`; endpoints/direction d'Association; élément `text` et attribut `textFormat`.

Ces points sont classés **OMG-INTER-ARTIFACT-OBSERVATION**. Ils ne doivent pas être utilisés seuls pour déclarer une erreur de la spécification ou de Sparx. Le XSD reste le contrat de validation XML à tester sur les exports.

## 8. Gate expérimental suivant

Construire dans EA 16.1.1628 un modèle minimal contenant au moins :
- Category + CategoryValue;
- plusieurs FlowElements catégorisés;
- un Group référant la CategoryValue;
- une TextAnnotation reliée par Association;
- Associations None/One/Both si l'UI EA les permet.

Exporter **le même modèle** en :
1. XMI EA complet;
2. BPMN 2.0 XML natif EA.

Les assertions devront alors distinguer :
`OMG attendu` / `MDG capacité déclarée` / `XMI EA observé` / `BPMN EA observé`.
