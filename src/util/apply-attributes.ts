import {isRunTimeType} from 'run-time-assertions';
export type AttributesMap = {[attributeName: string]: string | boolean | number};

export function applyAttributes(element: Element, attributes: AttributesMap) {
    Object.entries(attributes).forEach(
        ([
            attributeName,
            attributeValue,
        ]) => {
            if (isRunTimeType(attributeValue, 'boolean')) {
                if (attributeValue) {
                    element.setAttribute(attributeName, '');
                } else {
                    element.removeAttribute(attributeName);
                }
            } else {
                element.setAttribute(attributeName, String(attributeValue));
            }
        },
    );
}
