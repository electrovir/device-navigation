import {typedObjectFromEntries} from '@augment-vir/common';
import {isRunTimeType} from 'run-time-assertions';

export type AttributesMap = {[attributeName: string]: string | boolean | number | undefined};

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
