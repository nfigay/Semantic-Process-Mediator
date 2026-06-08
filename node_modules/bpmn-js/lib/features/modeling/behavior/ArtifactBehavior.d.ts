/**
 * A behavior that ensures that visually enclosed artifacts are affected
 * by container element behavior:
 *
 *  * removed when the container is removed
 *  * moved when the container is moved
 *
 */
export default class ArtifactBehavior extends CommandInterceptor {
    /**
     * @param injector
     * @param eventBus
     * @param canvas
     * @param modeling
     */
    constructor(injector: Injector, eventBus: EventBus, canvas: Canvas, modeling: Modeling);
}

type EventBus = import("diagram-js/lib/core/EventBus").default;
type Canvas = import("diagram-js/lib/core/Canvas").default;
type Modeling = import("../Modeling").default;
type Injector = import("didi").Injector;
type Element = import("../../../model/Types").Element;
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
