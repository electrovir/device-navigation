import {check} from '@augment-vir/assert';
import {typedObjectFromEntries} from '@augment-vir/common';

/**
 * A collection of attribute keys to values. This is just used to ensure we're not applying invalid
 * attribute values.
 *
 * @category Internal
 */
export type AttributesMap = {[attributeName: string]: string | boolean | number | undefined};

/**
 * Apply all given attribute key/value pairs to the given element.
 *
 * @category Internal
 */
export function applyAttributes(element: Element, attributes: AttributesMap) {
    Object.entries(attributes).forEach(
        ([
            attributeName,
            attributeValue,
        ]) => {
            if (check.isBoolean(attributeValue) && attributeValue) {
                element.setAttribute(attributeName, '');
            } else if (check.isBoolean(attributeValue) || attributeValue == undefined) {
                element.removeAttribute(attributeName);
            } else {
                element.setAttribute(attributeName, String(attributeValue));
            }
        },
    );
}

/**
 * Extract all current attributes applied to the given element.
 *
 * @category Internal
 */
export function readAttributes(element: Element): Record<string, string> {
    const attributeNames = element.getAttributeNames();

    const attributeEntries = attributeNames.map(
        (
            attributeName,
        ): [
            string,
            string,
        ] => {
            const attributeValue = element.getAttribute(attributeName);

            return [
                attributeName,
                attributeValue || '',
            ];
        },
    );

    return typedObjectFromEntries(attributeEntries);
}
