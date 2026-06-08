declare namespace _default {
    let __depends__: ({
        selection: (string | typeof import("diagram-js/lib/features/selection/Selection").default)[];
        selectionVisuals: (string | typeof import("diagram-js/lib/features/selection/SelectionVisuals").default)[];
        selectionBehavior: (string | typeof import("diagram-js/lib/features/selection/SelectionBehavior").default)[];
    } | {
        outline: (string | typeof import("diagram-js/lib/features/outline/Outline").default)[];
        multiSelectionOutline: (string | typeof import("diagram-js/lib/features/outline/MultiSelectionOutline").default)[];
    })[];
    let __init__: string[];
    let labelLink: (string | typeof LabelLink)[];
}
export default _default;
import LabelLink from './LabelLink';
