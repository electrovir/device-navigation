import {copyThroughJson} from '@augment-vir/common';
import {DirectiveResult, css, unsafeCSS} from 'element-vir';
import {assertInstanceOf} from 'run-time-assertions';
import {ReadonlyDeep} from 'type-fest';
import {applyAttributes} from '../util/apply-attributes';
import {modifyElement} from './modify-element.directive';
import {createNavValueString} from './nav-value';

const dataNavAttributeName = 'data-device-nav';

/** The attribute which the `nav` directive applies to elements. */
export const navAttribute = {
    /** Name of the attribute. */
    name: dataNavAttributeName,
    /**
     * Use this to generate a selector for the attribute in CSS. The attribute value uses the `*=`
     * comparison. Meaning, the nav attribute value can merely contain the given value.
     */
    selector(attributeValue: string | number) {
        return css`[${unsafeCSS(dataNavAttributeName)}*="${unsafeCSS(
            String(attributeValue).replace(/"/g, "'"),
        )}"]`;
    },
};

const navActivatedClassName = 'nav-activated';

/**
 * Creates CSS selectors for styling various states of navigation. Mostly necessary only for the
 * click styles (see comment on `.click` for more details).
 */
export function createNavSelector(parentSelector: string) {
    return {
        /**
         * Styles the element when navigation actives the element, whether by a mouse click or a
         * keyboard key.
         *
         * This is required because browsers do not allow keyboard presses to trigger the `:active`
         * pseudo-class on elements that aren't natively interactive. So a `div` with `tabindex`,
         * while working with all the other style selectors (like `:focus`), does not work for click
         * styles triggered via keyboard events like a native `button` element does.
         */
        click: css`
            ${unsafeCSS(parentSelector)}.${unsafeCSS(navActivatedClassName)}
        `,
        /**
         * Styles the element when navigation has it currently selected. This just uses the `:focus`
         * pseudo-class selector. You can simply use that pseudo-class selector manually if you
         * like, this is only here for completeness.
         */
        current: css`
            ${unsafeCSS(parentSelector)}:focus
        `,
    };
}

/** Settings that control how some nav features work. */
export type NavSettings = {
    /**
     * The keyboard keys that should trigger activate events (like a click). Matches are attempted
     * against both event.key and event.code. These are case insensitive.
     */
    activateKeys: string[];
};

const navSettings: NavSettings = {
    activateKeys: [
        'Space',
        'Return',
        'Enter',
    ],
};

/**
 * Selectively overwrite current nav settings. Changes are global unless you manage to import this
 * module multiple times in your code.
 */
export function setNavSettings(newNavSettings: Partial<NavSettings>) {
    Object.assign(navSettings, newNavSettings);
}

/**
 * Retrieves the current nav settings. Modifying the output of this will not modify the internally
 * saved nav settings. Use `setNavSettings` for that.
 */
export function getCurrentNavSettings(): ReadonlyDeep<NavSettings> {
    return copyThroughJson(navSettings);
}

function isActivateKey(event: KeyboardEvent): boolean {
    return navSettings.activateKeys.some((activateKey) => {
        const lowerCaseActivateKey = activateKey.toLowerCase();
        return (
            lowerCaseActivateKey === event.key.toLowerCase() ||
            lowerCaseActivateKey === event.code.toLowerCase()
        );
    });
}

/** Mark an element for 1 dimensional navigation. */
export function nav(): DirectiveResult;
/** Mark an element for 2 dimensional navigation. */
export function nav(xCoord: number, yCoord: number): DirectiveResult;
/** Mark an element for 1 or 2 dimensional navigation. */
export function nav(xCoord?: undefined | number, yCoord?: number | undefined): DirectiveResult {
    const navValue = createNavValueString(xCoord, yCoord);

    const tabIndexAttribute = {
        tabindex: 0,
    };

    const allAttributes = {
        [dataNavAttributeName]: navValue,
        ...tabIndexAttribute,
    };

    return modifyElement(`${xCoord}-${yCoord}`, (element) => {
        assertInstanceOf(element, HTMLElement);
        applyAttributes(element, allAttributes);
        element.style.setProperty('cursor', 'pointer');
        element.addEventListener(
            'mousemove',
            (event) => {
                if (event.target === element) {
                    element.focus();
                }
            },
            true,
        );
        element.addEventListener(
            'mousedown',
            (event) => {
                if (event.target === element) {
                    element.classList.add(navActivatedClassName);
                }
            },
            true,
        );
        element.addEventListener(
            'mouseup',
            (event) => {
                if (event.target === element) {
                    element.classList.remove(navActivatedClassName);
                }
            },
            true,
        );
        element.addEventListener(
            'blur',
            () => {
                element.classList.remove(navActivatedClassName);
            },
            true,
        );
        element.addEventListener(
            'keydown',
            (event) => {
                if (event.target === element && isActivateKey(event)) {
                    element.classList.add(navActivatedClassName);
                }
            },
            true,
        );
        element.addEventListener(
            'keyup',
            (event) => {
                if (event.target === element && isActivateKey(event)) {
                    element.classList.remove(navActivatedClassName);
                }
            },
            true,
        );
    });
}
