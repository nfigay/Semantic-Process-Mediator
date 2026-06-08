import { filter, find, isArray, forEach, findIndex } from 'min-dash';

/**
 * Get a inputOutput from the business object
 *
 * @param {ModdleElement} element
 *
 * @return {ModdleElement} the inputOutput object
 */
function getInputOutput(element) {
  return (getElements(element, 'zeebe:IoMapping') || [])[0];
}

/**
 * Return output mappings existing in the business object
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>}
 */
function getOutputMappings(element) {
  return (getInputOutput(element) || {}).outputParameters;
}

/**
 * Return input mappings existing in the business object
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>}
 */
function getInputMappings(element) {
  return (getInputOutput(element) || {}).inputParameters;
}

/**
 * Get the multi-instance inputElement name from an element
 *
 * @param {MoodleElement} element
 * @returns {string|undefined} inputElement name, if existing
 */
function getMultiInstanceInputElement(element) {
  const loopCharacteristics = element.loopCharacteristics;

  const extensionElement = loopCharacteristics && getElements(loopCharacteristics, 'zeebe:LoopCharacteristics')[0];

  return extensionElement && extensionElement.inputElement;
}

/**
 * Get the multi-instance outputCollection name from an element
 *
 * @param {MoodleElement} element
 *
 * @returns {string|undefined} outputCollection name, if existing
 */
function getMultiInstanceOutputCollection(element) {

  const loopCharacteristics = element.loopCharacteristics;

  const extensionElement = loopCharacteristics && getElements(loopCharacteristics, 'zeebe:LoopCharacteristics')[0];

  return extensionElement && extensionElement.outputCollection;
}

/**
 * Get the adHoc outputCollection name from an element
 *
 * @param {MoodleElement} element
 *
 * @returns {string|undefined} outputCollection name, if existing
 */
function getAdHocOutputCollection(element) {
  const adHoc = getElements(element, 'zeebe:AdHoc')[0];

  return adHoc && adHoc.outputCollection;
}

/**
 * Get a calledDecision from the business object
 *
 * @param {MoodleElement} element
 * @returns {MoodleElement} the calledDecision object
 */
function getCalledDecision(element) {
  return (getElements(element, 'zeebe:CalledDecision') || [])[0];
}


/**
 * Get a script from the business object
 *
 * @param {MoodleElement} element
 * @returns {MoodleElement} the script object
 */
function getScript(element) {
  return (getElements(element, 'zeebe:Script') || [])[0];
}

// helpers //////////

function getElements(element, type, property) {
  var elements = getExtensionElements(element, type);

  return elements ;
}

function getExtensionElements(element, type) {
  var elements = [];
  var extensionElements = element.get('extensionElements');

  if (typeof extensionElements !== 'undefined') {
    var extensionValues = extensionElements.get('values');

    if (typeof extensionValues !== 'undefined') {
      elements = filter(extensionValues, function(value) {
        return is$1(value, type);
      });
    }
  }

  return elements;
}

function is$1(element, type) {
  return (
    element &&
    typeof element.$instanceOf === 'function' &&
    element.$instanceOf(type)
  );
}

/**
 * Get all parent elements for a given element.
 *
 * @param {ModdleElement|string} element
 * @param {boolean} [includeSelf=false]
 *
 * @returns {Array<ModdleElement>}
 */
function getParents(element, includeSelf = false) {
  var parents = includeSelf ? [ element ] : [];
  var current = element;

  while (current.$parent) {
    parents.push(current.$parent);
    current = current.$parent;
  }

  return parents;
}

/**
 * Iterate over each element in a collection, calling the iterator function `fn`
 * with (element, index, recursionDepth).
 *
 * Recurse into all elements that are returned by `fn`.
 *
 * @param  {Object|Array<Object>} elements
 * @param  {Function} fn iterator function called with (element, index, recursionDepth)
 * @param  {number} [depth] maximum recursion depth
 */
function eachElement(elements, fn, depth) {
  depth = depth || 0;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(s, i) {
    var filter = fn(s, i, depth);

    if (isArray(filter) && filter.length) {
      eachElement(filter, fn, depth + 1);
    }
  });
}

/**
 * Adds an element to a collection and returns true if the
 * element was added.
 *
 * @param {Array<Object>} elements
 * @param {Object} e
 * @param {boolean} unique
 */
function add(elements, e, unique) {
  var canAdd = !unique || elements.indexOf(e) === -1;

  if (canAdd) {
    elements.push(e);
  }

  return canAdd;
}

/**
 * Collects self + flow elements up to a given depth from a list of elements.
 *
 * @param  {ModdleElement|Array<ModdleElement>} elements the elements to select the flowElements from
 * @param  {boolean} unique whether to return a unique result set (no duplicates)
 * @param  {number} maxDepth the depth to search through or -1 for infinite
 *
 * @return {Array<ModdleElement>} found elements
 */
function selfAndFlowElements(elements, unique, maxDepth) {
  var result = [],
      processedFlowElements = [];

  eachElement(elements, function(element, i, depth) {
    add(result, element, unique);

    var flowElements = element.flowElements;

    // max traversal depth not reached yet
    {

      // flowElements exist && flowElements not yet processed
      if (flowElements && add(processedFlowElements, flowElements, unique)) {
        return flowElements;
      }
    }
  });

  return result;
}

/**
 * Return self + ALL flowElements for a number of elements
 *
 * @param  {Array<ModdleElement>} elements to query
 * @param  {boolean} allowDuplicates to allow duplicates in the result set
 *
 * @return {Array<ModdleElement>} the collected elements
 */
function selfAndAllFlowElements(elements, allowDuplicates) {
  return selfAndFlowElements(elements, !allowDuplicates);
}

/**
 * Return full moddle element for given element id
 *
 * @param {string} elementId
 * @param {ModdleElement} rootElement
 *
 * @returns {ModdleElement}
 */
function getElement(elementId, rootElement) {
  var allElements = selfAndAllFlowElements(rootElement);

  return find(allElements, function(element) {
    return element.id === elementId;
  });
}

function addVariableToList(variablesList, newVariable) {
  var foundIdx = findIndex(variablesList, function(variable) {
    return (
      variable.name === newVariable.name && variable.scope === newVariable.scope
    );
  });

  if (foundIdx >= 0) {
    variablesList[foundIdx].origin = combineArrays$1(
      variablesList[foundIdx].origin,
      newVariable.origin
    );
  } else {
    variablesList.push(newVariable);
  }
}

/**
 * Creates new process variable definition object
 * Identifies correct (highest) scope, in which variable is available
 *
 * @param {ModdleElement} flowElement
 * @param {String} name
 * @param {ModdleElement} defaultScope
 * @param {boolean} [targetSelf=false]
 *
 * @returns {ProcessVariable}
 */
function createProcessVariable(flowElement, name, defaultScope, targetSelf = false) {
  var scope = getScope$1(flowElement, defaultScope, name, targetSelf);

  return {
    name: name,
    origin: [ flowElement ],
    scope: scope
  };
}


// helpers ////////////////////

/**
 * Determines the scope of a given variable, by examining the element
 * and its parents. If no scope can be determined, return a specified
 * global scope.
 *
 * @param {ModdleElement} element
 * @param {ModdleElement} globalScope
 * @param {string} variableName
 * @param {boolean} [includeSelf=false]
 *
 * @return {ModdleElement} scope for the variable
 */
function getScope$1(element, globalScope, variableName, includeSelf = false) {

  // (1) if an element defines an output mapping
  // then the variable is local
  if (includeSelf && hasOutputMappings(element)) {
    return element;
  }

  // (2) otherwise, search parents upwards, to determine the closest
  // scope that declares the variable (via a matching input mapping)
  var parents = getParents(element, includeSelf);

  var scopedParent = find(parents, function(parent) {
    return (
      hasInputMapping(parent, variableName)
    );
  });

  return scopedParent ? scopedParent : globalScope;
}

/**
 * Does element define output mappings?
 *
 * @param {ModdleElement} element
 *
 * @return {boolean}
 */
function hasOutputMappings(element) {
  var outputMappings = getOutputMappings(element);

  return outputMappings && outputMappings.length > 0;
}

/**
 * Does element define an input mapping for the given name?
 *
 * @param {ModdleElement} element
 * @param {string} name
 *
 * @return {boolean}
 */
function hasInputMapping(element, name) {
  return find(getInputMappings(element), function(input) {

    // inputs define mappings by name, an input
    // <foo.baz> defines a local variable <foo> with the value <baz>
    // we match if that variable part is either equal or a prefix of name

    const localName = input.target;

    if (!localName) {
      return false;
    }

    const localPart = localName.split('.')[0];

    // exact match
    if (localName === name) {
      return true;
    }

    // name is hierarchical <foo.bar>, localPart is prefix <foo>
    if (name.startsWith(localPart + '.')) {
      return true;
    }

    return false;
  });
}

/**
 * Combine elements from two arrays, ensuring there are no duplicates.
 *
 * @param {Array} a
 * @param {Array} b
 *
 * @return {Array}
 */
function combineArrays$1(a, b) {
  const newItems = b.filter(value => !a.includes(value));

  return a.concat(newItems);
}

/**
 * Retrieves process variables defined in output mappings, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:extensionElements>
 *     <zeebe:ioMapping>
 *       <zeebe:input source="= source" target="variable1" />
 *     </zeebe:ioMapping>
 *   </bpmn:extensionElements>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "variable1" to the list.
 *
 */
function extractInputMappings(options) {
  var elements = options.elements,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var inMappings = getInputMappings(element);

    // extract all variables with correct scope
    forEach(inMappings, function(mapping) {

      // skip invalid mappings
      if (!mapping.target) {
        return;
      }

      var newVariable = createProcessVariable(
        element,
        mapping.target,
        element,
        true
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
}

/**
 * Retrieves process variables defined in result variables, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:multiInstanceLoopCharacteristics>
 *     <bpmn:extensionElements>
 *       <zeebe:loopCharacteristics inputElement="inputElement" outputCollection="outputCollection" />
 *     </bpmn:extensionElements>
 *   </bpmn:multiInstanceLoopCharacteristics>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "inputElement" to the list.
 *
 */
function extractInputElement(options) {
  var elements = options.elements,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var multiInstanceInputElement = getMultiInstanceInputElement(element);

    if (multiInstanceInputElement) {
      var newVariable = createProcessVariable(
        element,
        multiInstanceInputElement,
        element
      );

      addVariableToList(processVariables, newVariable);
    }
  });

  return processVariables;
}

/**
 * Retrieves process variables defined in output mappings, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:extensionElements>
 *     <zeebe:ioMapping>
 *       <zeebe:output source="= source" target="variable1" />
 *     </zeebe:ioMapping>
 *   </bpmn:extensionElements>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "variable1" to the list.
 *
 */
function extractOutputMappings(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var outMappings = getOutputMappings(element);

    // extract all variables with correct scope
    forEach(outMappings, function(mapping) {

      // skip invalid mappings
      if (!mapping.target) {
        return;
      }

      var newVariable = createProcessVariable(
        element,
        mapping.target,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
}

/**
 * Retrieves process variables defined in multi-instance output collection, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:multiInstanceLoopCharacteristics>
 *     <bpmn:extensionElements>
 *       <zeebe:loopCharacteristics inputElement="inputElement" outputCollection="outputCollection" />
 *     </bpmn:extensionElements>
 *   </bpmn:multiInstanceLoopCharacteristics>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "outputCollection" to the list.
 *
 * Retrieves variables defined in adHoc output collection, e.g.
 *
 * <bpmn:adHocSubProcess id="AdHocSubProcess">
 *   <bpmn:extensionElements>
 *     <zeebe:adHoc outputCollection="executionResults" outputElement="executionResult" />
 *   </bpmn:extensionElements>
 *   ...
 * </bpmn:adHocSubProcess>
 *
 * => Adds one variable "executionResults" to the list.
 */
function extractOutputCollections(options) {
  let elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  // <outputCollection> defines a local variable that always propagates
  // to the parent scope upon completion
  forEach(elements, function(element) {

    var multiInstanceOutputCollection = getMultiInstanceOutputCollection(element);

    if (multiInstanceOutputCollection) {

      // <outputCollection> declared variable is not available
      // in local scope, but only in the MI parent.
      const newVariable = createProcessVariable(
        element,
        multiInstanceOutputCollection,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    }

    const adHocOutputCollection = getAdHocOutputCollection(element);

    if (adHocOutputCollection) {

      // <outputCollection> declared variable is available in ad-hoc local
      // scope as a local variable
      const newLocalVariable = createProcessVariable(
        element,
        adHocOutputCollection,
        element
      );

      addVariableToList(processVariables, newLocalVariable);

      // <outputCollection> declared variable also "force propagates" to the
      // parent scope
      const newParentVariable = createProcessVariable(
        element,
        adHocOutputCollection,
        containerElement
      );

      addVariableToList(processVariables, newParentVariable);
    }
  });

  return processVariables;
}

/**
 * Extracts process variables from extension elements that have a result
 * variable, e.g. given the following element:
 *
 * <bpmn:businessRuleTask id="Task_1">
 *   <bpmn:extensionElements>
 *     <zeebe:calledDecision resultVariable="foo" />
 *   </bpmn:extensionElements>
 * </bpmn:businessRuleTask>
 *
 * a process variable with name 'foo' is extracted.
 *
 * If output variables exist, the scope is set to the element.
 *
 * If an output variable with the same name exists, e.g. given the following
 * element:
 *
 * <bpmn:businessRuleTask id="Task_1">
 *   <bpmn:extensionElements>
 *     <zeebe:calledDecision resultVariable="foo" />
 *     <zeebe:ioMapping>
 *       <zeebe:output target="foo" />
 *     </zeebe:ioMapping>
 *   </bpmn:extensionElements>
 * </bpmn:businessRuleTask>
 *
 * no process variable is created.
 *
 * @param {Object} options
 * @param {Array<ModdleElement>} options.elements
 * @param {ModdleElement} options.containerElement
 * @param {Array<ProcessVariable>} options.processVariables
 *
 * @return {Array<ProcessVariable>}
 */
function extractResultVariables(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var extensionElement = getCalledDecision(element) || getScript(element);

    if (!extensionElement) {
      return;
    }

    var resultVariable = extensionElement.resultVariable;

    if (resultVariable) {
      var newVariable = createProcessVariable(
        element,
        resultVariable,
        containerElement,
        true
      );

      addVariableToList(processVariables, newVariable);
    }
  });

  return processVariables;
}

var extractors = [
  extractInputMappings,
  extractInputElement,
  extractOutputMappings,
  extractOutputCollections,
  extractResultVariables
];

/**
 * @typedef {Object} ProcessVariable
 * @property {string} name
 * @property {Array<ModdleElement>} origin
 * @property {ModdleElement} scope
 */

// api /////////////////////////

/**
 * Extractors add ProcessVariables to the `options.processVariables` parameter.
 * @callback extractor
 * @param {Object} options
 * @param {Array<ModdleElement>} options.elements
 * @param {ModdleElement} options.containerElement
 * @param {Array<ProcessVariable>} options.processVariables
 */

/**
 * Retrieves all process variables for a given container element.
 * @param {ModdleElement} containerElement
 * @param {Array<extractor>} [additionalExtractors]
 *
 * @returns {Promise<Array<ProcessVariable>>}
 */
function getProcessVariables(containerElement, additionalExtractors = []) {
  var processVariables = [];

  // (1) extract all flow elements inside the container
  var elements = selfAndAllFlowElements([ containerElement ], false);

  const allPromises = [];

  // (2) extract all variables from the extractors
  forEach([ ...extractors, ...additionalExtractors ], function(extractor) {
    allPromises.push(extractor({
      elements: elements,
      containerElement: containerElement,
      processVariables: processVariables
    }));
  });

  return Promise.all(allPromises)
    .then(() => processVariables);
}

/**
 * Retrieves all variables which are available in the given scope
 *
 * * Exclude variables which are only available in other scopes
 * * Exclude variables which are produced by the given element
 * * Include variables which are available in parent scopes
 *
 * @param {string} scope
 * @param {ModdleElement} rootElement element from where to extract all variables
 * @param {Array<extractor>} [additionalExtractors]
 *
 * @returns {Promise<Array<ProcessVariable>>}
 */
async function getVariablesForScope(scope, rootElement, additionalExtractors = []) {

  var allVariables = await getProcessVariables(rootElement, additionalExtractors);

  var scopeElement = getElement(scope, rootElement);

  // (1) get variables for given scope
  var scopeVariables = filter(allVariables, function(variable) {
    return variable.scope.id === scopeElement.id;
  });

  // (2) get variables for parent scopes
  var parents = getParents(scopeElement);

  var parentsScopeVariables = filter(allVariables, function(variable) {
    return find(parents, function(parent) {
      return parent.id === variable.scope.id;
    });
  });

  return combineArrays(scopeVariables, parentsScopeVariables);
}


function getVariablesForElement(element, additionalExtractors = []) {
  return getVariablesForScope(getScope(element), getRootElement(element), additionalExtractors);
}

function getScope(element) {
  const bo = getBusinessObject(element);

  if (is(element, 'bpmn:Participant')) {
    return bo.processRef.id;
  }

  return bo.id;
}

function getRootElement(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:Participant')) {
    return businessObject.processRef;
  }

  if (is(businessObject, 'bpmn:Process')) {
    return businessObject;
  }

  let parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}


// helpers ////////////////////

function combineArrays(a, b) {
  return a.concat(b);
}


function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}


function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}

export { getProcessVariables, getScope$1 as getScope, getVariablesForElement, getVariablesForScope };
