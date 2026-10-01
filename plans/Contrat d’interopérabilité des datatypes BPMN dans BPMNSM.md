# Contrat d’interopérabilité des datatypes BPMN dans BPMNSM

## 1. Objectif

BPMNSM doit pouvoir importer et réexporter un modèle BPMN contenant des références de datatypes qu’il ne sait pas nécessairement interpréter ou exécuter.

Le support fonctionnel d’un datatype par BPMNSM ne doit donc pas conditionner sa capacité à représenter fidèlement ce datatype dans le modèle BPMN.

Principe directeur :

> **Represent what BPMN can express; interpret only what BPMNSM understands.**

---

## 2. Exigence normative de représentation

Dans BPMN 2.0.2, `ItemDefinition.structureRef` est défini comme un `xsd:QName`.

Par conséquent, la représentation interne d’une référence de datatype ne doit pas être limitée à une liste fermée de datatypes BPMNSM.

La représentation canonique doit permettre au minimum de conserver :

```text
namespace URI
local name
```

Par exemple :

```java
public record DataTypeRef(
    String namespaceUri,
    String localName
) {}
```

Les préfixes XML ne font pas partie de l’identité sémantique du datatype.

Ainsi :

```xml
xmlns:xsd="http://www.w3.org/2001/XMLSchema"
structureRef="xsd:string"
```

et :

```xml
xmlns:schema="http://www.w3.org/2001/XMLSchema"
structureRef="schema:string"
```

représentent le même datatype :

```text
{http://www.w3.org/2001/XMLSchema}string
```

---

# 3. Invariant principal d’interopérabilité

Pour tout `QName` valide pouvant être utilisé comme `structureRef` :

```text
IMPORT(qname)
```

doit réussir indépendamment du fait que BPMNSM connaisse ou non la sémantique du datatype.

Et :

```text
EXPORT(IMPORT(qname))
```

doit produire un QName sémantiquement équivalent :

```text
namespaceURI_original == namespaceURI_export
localName_original    == localName_export
```

L’identité du préfixe XML n’est pas requise.

Autrement dit :

```text
abc:Customer
```

peut devenir :

```text
ns1:Customer
```

à condition que :

```text
abc -> https://example.org/types
ns1 -> https://example.org/types
```

---

# 4. Séparation obligatoire entre représentation et interprétation

BPMNSM doit distinguer deux concepts.

## DataTypeRef

Représentation du datatype déclaré dans le document BPMN.

```java
public record DataTypeRef(
    String namespaceUri,
    String localName
) {}
```

Cette représentation est ouverte.

Elle doit accepter aussi bien :

```text
xsd:string
xsd:boolean
xsd:duration
foo:Customer
erp:PurchaseOrder
future:SomethingUnknownToday
```

## RuntimeDataType

Représentation d’un datatype que BPMNSM sait effectivement interpréter.

Par exemple :

```java
public enum RuntimeDataType {
    STRING,
    BOOLEAN,
    INTEGER,
    DECIMAL,
    DATE_TIME
}
```

Cette liste peut être fermée.

Elle correspond aux capacités fonctionnelles de BPMNSM et non aux capacités de représentation de BPMN.

---

# 5. Résolution des datatypes

La conversion entre les deux couches doit être effectuée par un resolver ou registry séparé.

Exemple :

```java
public interface DataTypeResolver {

    Optional<RuntimeDataType> resolve(DataTypeRef ref);

}
```

Exemple de comportement :

```text
xsd:string
    → STRING

xsd:boolean
    → BOOLEAN

xsd:int
    → INTEGER

xsd:duration
    → Optional.empty()

foo:Customer
    → Optional.empty()
```

`Optional.empty()` signifie :

> BPMNSM ne connaît pas la sémantique de ce datatype.

Il ne signifie jamais :

> Le BPMN est invalide.

---

# 6. Règle d'import

L'importeur BPMN doit suivre l'algorithme suivant.

```text
structureRef lexical
        │
        ▼
Résolution QName avec les namespaces XML
        │
        ▼
DataTypeRef(namespaceURI, localName)
        │
        ├── stockage dans le modèle
        │
        ▼
tentative facultative de résolution
        │
        ▼
RuntimeDataType éventuel
```

Exemple :

```xml
<definitions
    xmlns:customer="https://example.org/customer">

    <itemDefinition
        id="CustomerItem"
        structureRef="customer:Customer"/>

</definitions>
```

doit produire :

```java
new DataTypeRef(
    "https://example.org/customer",
    "Customer"
);
```

Même si aucun resolver BPMNSM ne connaît `Customer`.

---

# 7. Règle fondamentale de non-destruction

Un datatype inconnu ne doit jamais être automatiquement :

- remplacé par `string` ;
- remplacé par `Object` ;
- remplacé par `UNKNOWN` sans conservation de sa référence originale ;
- supprimé ;
- ignoré silencieusement ;
- considéré comme une erreur d'import uniquement parce qu'il n'est pas supporté par BPMNSM.

En particulier, ce design est interdit comme représentation canonique :

```java
enum DataType {
    STRING,
    BOOLEAN,
    INTEGER,
    UNKNOWN
}
```

si :

```text
foo:Customer
bar:Invoice
xsd:duration
```

deviennent tous :

```text
UNKNOWN
```

car cette transformation détruit l'information nécessaire au round-trip.

---

# 8. Cas d'un datatype non supporté

Si BPMNSM doit exposer explicitement l'état de résolution, il peut utiliser par exemple :

```java
sealed interface DataTypeResolution {
}

record SupportedDataType(
    DataTypeRef source,
    RuntimeDataType runtimeType
) implements DataTypeResolution {
}

record UnsupportedDataType(
    DataTypeRef source
) implements DataTypeResolution {
}
```

Ainsi :

```text
UnsupportedDataType
```

conserve toujours :

```text
namespaceURI
localName
```

du datatype original.

---

# 9. Source de vérité

Le `DataTypeRef` BPMN doit être la source de vérité.

Éviter :

```java
class ItemDefinition {

    RuntimeDataType datatype;

}
```

Préférer :

```java
class ItemDefinition {

    DataTypeRef structureRef;

}
```

avec :

```java
Optional<RuntimeDataType> runtimeDataType() {
    return resolver.resolve(structureRef);
}
```

Autrement dit :

```text
DataTypeRef
    = état du modèle BPMN

RuntimeDataType
    = vue/interprétation BPMNSM
```

et non l'inverse.

---

# 10. Export

L'exporteur doit partir du `DataTypeRef`, et non du `RuntimeDataType`.

Algorithme :

```text
DataTypeRef(namespaceURI, localName)
        │
        ▼
recherche d'un prefix associé au namespace
        │
        ├── prefix existant
        │
        └── sinon création d'un prefix
        │
        ▼
prefix:localName
```

Exemple interne :

```text
namespaceURI = https://example.org/customer
localName    = Customer
```

peut être exporté comme :

```xml
xmlns:customer="https://example.org/customer"

structureRef="customer:Customer"
```

ou :

```xml
xmlns:ns1="https://example.org/customer"

structureRef="ns1:Customer"
```

Les deux sont équivalents.

---

# 11. Invariant de round-trip

Pour tout datatype :

```text
T
```

l'invariant attendu est :

```text
T
↓
BPMN import
↓
DataTypeRef
↓
BPMN export
↓
T'
```

avec :

```text
expandedQName(T) == expandedQName(T')
```

où :

```text
expandedQName =
    {namespaceURI}localName
```

Exemple :

```text
foo:Customer
```

avec :

```text
foo = https://example.org/foo
```

peut devenir :

```text
ns3:Customer
```

mais :

```text
{https://example.org/foo}Customer
```

doit rester strictement identique.

---

# 12. Support XSD

Les datatypes XSD supportés fonctionnellement par BPMNSM peuvent être enregistrés dans le resolver.

Par exemple :

```java
registry.register(
    new DataTypeRef(XSD_NS, "string"),
    RuntimeDataType.STRING
);

registry.register(
    new DataTypeRef(XSD_NS, "boolean"),
    RuntimeDataType.BOOLEAN
);
```

Cette registry ne doit pas constituer une whitelist d'import.

En particulier :

```text
xsd:duration
xsd:positiveInteger
xsd:unsignedLong
xsd:gYearMonth
```

doivent pouvoir être importés même si aucun mapping BPMNSM n'existe.

---

# 13. Types applicatifs/custom

Le même mécanisme doit fonctionner pour des datatypes non-XSD.

Par exemple :

```xml
xmlns:erp="https://company.example/erp/types"

<itemDefinition
    id="PurchaseOrderDefinition"
    structureRef="erp:PurchaseOrder"/>
```

doit être accepté comme :

```java
DataTypeRef(
    "https://company.example/erp/types",
    "PurchaseOrder"
)
```

sans nécessité pour BPMNSM :

- de disposer du XSD correspondant ;
- de télécharger le XSD ;
- de comprendre sa structure ;
- de connaître `PurchaseOrder`.

La résolution du schéma externe peut éventuellement être une fonctionnalité supplémentaire, mais ne doit pas être une condition nécessaire au round-trip BPMN.

---

# 14. Niveaux de support

BPMNSM devrait distinguer explicitement trois notions.

```text
REPRESENTABLE
```

Le datatype peut être conservé par le modèle BPMNSM.

Pour un QName BPMN valide, ce niveau doit être systématiquement supporté.

```text
RESOLVABLE
```

BPMNSM connaît le datatype et peut déterminer sa sémantique.

```text
EXECUTABLE
```

Les fonctionnalités runtime de BPMNSM savent traiter les valeurs de ce datatype.

Ainsi :

```text
foo:Customer

Representable : YES
Resolvable    : NO
Executable    : NO
```

alors que :

```text
xsd:string

Representable : YES
Resolvable    : YES
Executable    : YES
```

Cette séparation empêche qu'une limitation du moteur devienne une limitation d'interopérabilité.

---

# 15. Gestion des erreurs

## Erreur d'import

Une erreur est acceptable lorsque le QName lui-même ne peut pas être résolu correctement, par exemple :

```xml
structureRef="foo:Customer"
```

sans déclaration exploitable du namespace `foo`.

Ce problème relève de la validité/résolution XML.

## Pas une erreur d'import

Ceci ne doit pas provoquer une erreur :

```xml
xmlns:foo="https://example.org/foo"

structureRef="foo:Customer"
```

simplement parce que BPMNSM ne connaît pas `Customer`.

Le résultat doit être un datatype représentable mais non résolu.

---

# 16. Diagnostics

BPMNSM peut produire un diagnostic non bloquant :

```text
Datatype not supported by BPMNSM runtime:
{https://example.org/foo}Customer
```

Le diagnostic doit clairement distinguer :

```text
unsupported
```

de :

```text
invalid
```

Par exemple :

```java
enum DataTypeSupportStatus {
    SUPPORTED,
    UNSUPPORTED,
    INVALID_REFERENCE
}
```

---

# 17. Tests contractuels minimaux

## Test 1 — datatype XSD supporté

Entrée :

```text
xsd:string
```

Attendu :

```text
import OK
DataTypeRef preserved
runtime datatype = STRING
export equivalent
```

## Test 2 — datatype XSD valide mais non supporté

Entrée :

```text
xsd:duration
```

Attendu :

```text
import OK
DataTypeRef preserved
runtime datatype absent
export equivalent
```

## Test 3 — autre datatype XSD

Entrée :

```text
xsd:positiveInteger
```

Attendu :

```text
import OK
no information loss
```

## Test 4 — datatype custom

Entrée :

```text
foo:Customer
```

avec :

```text
foo = https://example.org/foo
```

Attendu :

```text
import OK

DataTypeRef(
    "https://example.org/foo",
    "Customer"
)

runtime datatype absent

export OK
```

## Test 5 — changement de prefix

Entrée :

```xml
xmlns:foo="https://example.org/foo"
structureRef="foo:Customer"
```

Sortie autorisée :

```xml
xmlns:ns1="https://example.org/foo"
structureRef="ns1:Customer"
```

Assertion :

```text
expandedQName(input) == expandedQName(output)
```

## Test 6 — collision de local names

Entrée :

```text
a:Customer
b:Customer
```

avec :

```text
a = https://example.org/a
b = https://example.org/b
```

Les deux références doivent rester distinctes.

Ne jamais utiliser uniquement :

```text
localName
```

comme identité du datatype.

## Test 7 — round-trip datatype inconnu

```text
unknown:FutureDatatype
    ↓
import
    ↓
export
    ↓
import
```

Assertion finale :

```text
namespaceURI preserved
localName preserved
```

## Test 8 — aucune dépendance au registry

Ajouter :

```text
foo:UnknownDatatype
```

sans aucune entrée correspondante dans `DataTypeResolver`.

L'import doit néanmoins réussir.

---

# 18. Tests de propriété

Au-delà des tests unitaires, une propriété générale peut être testée :

```java
forAll(validQNameReferences())
    .check(ref -> {

        ItemDefinition imported =
            importer.importItemDefinition(ref);

        ItemDefinition roundTripped =
            importer.importItemDefinition(
                exporter.export(imported)
            );

        return imported.structureRef()
            .equals(roundTripped.structureRef());
    });
```

La propriété recherchée est :

```text
decode(encode(DataTypeRef)) == DataTypeRef
```

pour tout datatype représentable.

---

# 19. Critères d'acceptation

L'implémentation est considérée interopérable vis-à-vis des datatypes si les conditions suivantes sont satisfaites :

1. Aucun datatype correctement référencé par QName n'est rejeté uniquement parce qu'il n'est pas connu par BPMNSM.

2. La représentation interne conserve au minimum `namespaceURI + localName`.

3. Les datatypes supportés par BPMNSM sont résolus séparément.

4. Un datatype inconnu reste réexportable.

5. L'export ne substitue jamais silencieusement un datatype inconnu par un datatype connu.

6. L'import/export préserve l'expanded QName.

7. Le registry BPMNSM n'agit jamais comme une whitelist d'import.

8. La suppression ou modification d'un mapping runtime ne modifie pas la capacité à importer le datatype correspondant.

9. Les types applicatifs custom sont supportés au niveau représentation au même titre que les types XSD.

10. Une distinction explicite existe entre datatype invalide et datatype valide mais non supporté.

---

# 20. Décision d'architecture

La décision peut être résumée ainsi :

```text
                    BPMN
                      │
                      ▼
                QName lexical
                      │
           XML namespace resolution
                      │
                      ▼
              ┌────────────────┐
              │  DataTypeRef   │
              │ namespace URI  │
              │ local name     │
              └───────┬────────┘
                      │
                      │ optional resolution
                      ▼
              ┌────────────────┐
              │ DataType       │
              │    Resolver    │
              └───────┬────────┘
                      │
             ┌────────┴─────────┐
             ▼                  ▼
        supported          unsupported
             │                  │
             ▼                  ▼
      RuntimeDataType       DataTypeRef
                             preserved
```

La frontière d'interopérabilité est donc `DataTypeRef`.

Le `RuntimeDataType` est une capacité supplémentaire de BPMNSM et ne doit jamais déterminer ce que BPMNSM est capable d'importer ou de réexporter.

---

# 21. Principe final

L'invariant architectural à protéger dans le code est :

> **Unknown to BPMNSM must never mean unknown to the BPMN model.**

Ou, sous forme de règle d'implémentation :

```text
Unsupported datatype != Invalid datatype
```

et :

```text
Can represent != Can interpret
```

Cette distinction garantit que BPMNSM peut enrichir progressivement son support fonctionnel des datatypes sans compromettre son interopérabilité avec des fichiers BPMN produits par d'autres outils.