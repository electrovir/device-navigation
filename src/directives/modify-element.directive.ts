import {Directive, type PartInfo, directive, extractElement, noChange} from 'element-vir';

/**
 * Makes arbitrary modifications to the element that its attached to.
 *
 * @category Internal
 */
export const modifyElement = directive(
    class extends Directive {
        public readonly element: Element;
        public lastKey: string | undefined;

        constructor(partInfo: PartInfo) {
            super(partInfo);

            this.element = extractElement(partInfo, 'modifyElement');
        }

        public render(renderKey: string | undefined, callback: (element: Element) => void) {
            if (renderKey !== this.lastKey) {
                callback(this.element);
                this.lastKey = renderKey;
            }
            return noChange;
        }
    },
);
