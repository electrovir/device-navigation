import {typedObjectFromEntries} from '@augment-vir/common';
import {isRunTimeType} from 'run-time-assertions';

/**
 * A collection of attribute keys to values. This is just used to ensure we're not applying invalid
 * attribute values.
 *
 * @category Internals
 */
export type AttributesMap = {[attributeName: string]: string | boolean | number | undefined};

/**
 * Apply all given attribute key/value pairs to the given element.
 *
 * @category Internals
 */
export function applyAttributes(element: Element, attributes: AttributesMap) {
    Object.entries(attributes).forEach(
        ([
            attributeName,
            attributeValue,
        ]) => {
            if (isRunTimeType(attributeValue, 'boolean') && attributeValue) {
                element.setAttribute(attributeName, '');
            } else if (
                (isRunTimeType(attributeValue, 'boolean') && !attributeValue) ||
                attributeValue == undefined
            ) {
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
 * @category Internals
 */
export function readAttributes(element: Element): Record<string, string> {
    const attributeNames = element.getAttributeNames();

    const attributeEntries = attributeNames.map((attributeName): [string, string] => {
        const attributeValue = element.getAttribute(attributeName);

        return [
            attributeName,
            attributeValue || '',
        ];
    });

    return typedObjectFromEntries(attributeEntries);
}
