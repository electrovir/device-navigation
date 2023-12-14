import {Directive, PartInfo, directive, extractElement, noChange} from 'element-vir';

export const modifyElement = directive(
    /** @internal */
    class extends Directive {
        public readonly element: Element;
        public lastKey: string | undefined;

        constructor(partInfo: PartInfo) {
            super(partInfo);

            this.element = extractElement(partInfo, 'modifyElement');
        }

        render(renderKey: string | undefined, callback: (element: Element) => void) {
            if (renderKey !== this.lastKey) {
                callback(this.element);
                this.lastKey = renderKey;
            }
            return noChange;
        }
    },
);
