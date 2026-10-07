//#region src/tests/schemas/coc-experimental-b-test.xsd?raw
var coc_experimental_b_test_default = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<xs:schema\n  xmlns:xs=\"http://www.w3.org/2001/XMLSchema\"\n  targetNamespace=\"urn:semarch:test:coc-experimental-b\"\n  elementFormDefault=\"qualified\">\n\n  <xs:complexType name=\"DeliverableType\">\n    <xs:sequence>\n      <xs:element name=\"businessId\" type=\"xs:string\" minOccurs=\"0\" />\n      <xs:element name=\"propertyB\" type=\"xs:string\" minOccurs=\"0\" />\n    </xs:sequence>\n  </xs:complexType>\n</xs:schema>\n";
//#endregion
export { coc_experimental_b_test_default as default };
