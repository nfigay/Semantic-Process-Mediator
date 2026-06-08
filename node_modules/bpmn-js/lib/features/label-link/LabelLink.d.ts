/**
 * Render a line between an external label and its target element,
 * when either is selected.
 *
 */
export default class LabelLink {
    static $inject: string[];
    /**
     * @param eventBus
     * @param canvas
     * @param graphicsFactory
     * @param outline
     */
    constructor(
      eventBus: EventBus,
      canvas: Canvas,
      graphicsFactory: GraphicsFactory,
      outline: Outline
    );
}

type EventBus = import("diagram-js/lib/core/EventBus").default;
type Canvas = import("diagram-js/lib/core/Canvas").default;
type GraphicsFactory = import("diagram-js/lib/core/GraphicsFactory").default;
type Outline = import("../outline/OutlineProvider").default;
export type Selection = any;
type Element = import("diagram-js/lib/model/Types").Element;
