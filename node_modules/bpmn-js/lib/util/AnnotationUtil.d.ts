/**
 * Get text annotations connected to the given element.
 *
 * @param element
 *
 * @return
 */
export function getElementAnnotations(element: Element): {
    annotation: Element;
    association: Element;
}[];

/**
 * Recursively collect text annotations connected to the given elements and their descendants.
 * De-duplicates by annotation, collecting all associations per annotation.
 *
 * @param elements
 *
 * @return
 */
export function collectElementsAnnotations(elements: Element[]): {
    annotation: Element;
    associations: Element[];
}[];

type Element = import("../model/Types").Element;
