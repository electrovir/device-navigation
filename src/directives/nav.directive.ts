import {assert} from '@augment-vir/assert';
import {copyThroughJson} from '@augment-vir/common';
import {CSSResult, DirectiveResult, css, unsafeCSS} from 'element-vir';
import {ReadonlyDeep, WritableDeep} from 'type-fest';
import {applyAttributes} from '../util/attributes.js';
import {modifyElement} from './modify-element.directive.js';
import {createNavValueString, group} from './nav-value.js';

/**
 * The attribute which the `nav` directive applies to elements.
 *
 * @category Internal
 */
export const navAttribute = {
    /** Name of the attribute. */
    name: 'data-nav',
    /**
     * Use this to generate a query selector string for the attribute, to be within with JavaScript
     * queries. The selector value uses the `*=` comparison. Meaning, the nav attribute value can
     * merely contain the given value.
     */
    js(attributeValue: string | number) {
        if (attributeValue === '') {
            return `[${navAttribute.name}]`;
        } else {
            return `[${navAttribute.name}*="${String(attributeValue).replace(/"/g, "'")}"]`;
        }
    },
    /**
     * Use this to generate a selector for the attribute in CSS. The selector value uses the `*=`
     * comparison. Meaning, the nav attribute value can merely contain the given value.
     */
    css(attributeValue: string | number) {
        return css`
            ${unsafeCSS(navAttribute.js(attributeValue))}
        `;
    },
};

const navActivatedClassName = 'nav-activated';

/**
 * Query selector strings or CSS selectors for styling various states of navigation. Mostly
 * necessary only for the click styles (see comment on `.click` for more details).
 *
 * @category Main
 */
export const navSelector = {
    /**
     * CSS selector strings to be used in JavaScript queries.
     *
     * @example
     *
     * ```ts
     * import {navSelector} from 'device-navigation';
     *
     * element.querySelector(navSelector.js.click('.nav-element'));
     * ```
     */
    js: {
        /**
         * Styles the element when navigation actives the element, whether by a mouse click or a
         * keyboard key.
         *
         * This is required because browsers do not allow keyboard presses to trigger the `:active`
         * pseudo-class on elements that aren't natively interactive. So a `div` with `tabindex`,
         * while working with all the other style selectors (like `:focus`), does not work for click
         * styles triggered via keyboard events like a native `button` element does.
         */
        click(parentSelector: string): string {
            return `${parentSelector}.${navActivatedClassName}`;
        },
        /**
         * Styles the element when navigation has it currently selected. This just uses the `:focus`
         * pseudo-class selector. You can simply use that pseudo-class selector manually if you
         * like, this is only here for completeness.
         */
        selected(parentSelector: string): string {
            return `${parentSelector}:focus`;
        },
    },
    /**
     * CSS selectors in `CSSResult` type for use within `css` tagged templates.
     *
     * @example ``ts import {navSelector} from 'device-navigation';
     *
     * Const styles = css`${navSelector.css.click('.nav-element')} { border-color: red; }`;
     */
    css: {
        /**
         * Styles the element when navigation actives the element, whether by a mouse click or a
         * keyboard key.
         *
         * This is required because browsers do not allow keyboard presses to trigger the `:active`
         * pseudo-class on elements that aren't natively interactive. So a `div` with `tabindex`,
         * while working with all the other style selectors (like `:focus`), does not work for click
         * styles triggered via keyboard events like a native `button` element does.
         */
        click(parentSelector: string): CSSResult {
            return css`
                ${unsafeCSS(navSelector.js.click(parentSelector))}
            `;
        },
        /**
         * Styles the element when navigation has it currently selected. This just uses the `:focus`
         * pseudo-class selector. You can simply use that pseudo-class selector manually if you
         * like, this is only here for completeness.
         */
        selected(parentSelector: string): CSSResult {
            return css`
                ${unsafeCSS(navSelector.js.selected(parentSelector))}
            `;
        },
    },
};

/**
 * Settings that control how some nav features work. These settings are _global_ because they are
 * used whenever the {@link nav} directive is called.
 *
 * @category Internal
 */
export type GlobalNavSettings = {
    /**
     * The keyboard keys that should trigger activate events (like a click). Matches are attempted
     * against both event.key and event.code. These are case insensitive. Setting this value will
     * override the default values of `'Space'`, `'Return'`, and `'Enter'`.
     */
    activateKeys: string[];
};

/**
 * The default values for {@link GlobalNavSettings}.
 *
 * @category Internal
 */
export const defaultGlobalNavSettings: ReadonlyDeep<GlobalNavSettings> = {
    activateKeys: [
        'Space',
        'Return',
        'Enter',
    ],
};

/**
 * Resets all nav settings back to their default values.
 *
 * @category Internal
 */
export function resetGlobalNavSettings() {
    currentGlobalNavSettings = copyThroughJson(defaultGlobalNavSettings) as WritableDeep<
        typeof defaultGlobalNavSettings
    >;
}

let currentGlobalNavSettings: GlobalNavSettings;

resetGlobalNavSettings();

/**
 * Selectively overwrite current nav settings. Changes are global unless you manage to import the
 * `device-navigation` package multiple times within your code (which is generally not a good idea
 * with _any_ package or module).
 *
 * @category Util
 */
export function setGlobalNavSettings(newNavSettings: Partial<GlobalNavSettings>) {
    Object.assign(currentGlobalNavSettings, newNavSettings);
}

/**
 * Retrieves the current nav settings. Modifying the output of this will not modify the internally
 * saved nav settings. Use `setNavSettings` for that.
 *
 * @category Util
 */
export function getCurrentGlobalNavSettings(): ReadonlyDeep<GlobalNavSettings> {
    return copyThroughJson(currentGlobalNavSettings);
}

function isActivateKey(event: Pick<KeyboardEvent, 'code' | 'key'>): boolean {
    return currentGlobalNavSettings.activateKeys.some((activateKey) => {
        const lowerCaseActivateKey = activateKey.toLowerCase();
        return (
            lowerCaseActivateKey === event.key.toLowerCase() ||
            lowerCaseActivateKey === event.code.toLowerCase()
        );
    });
}

/**
 * Mark an element for 1 dimensional navigation.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {nav} from 'device-navigation';
 *
 * html`
 *     <div ${nav()}></div>
 * `;
 * ```
 */
export function nav(): DirectiveResult;
/**
 * Mark an element for 2 dimensional navigation.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {nav} from 'device-navigation';
 *
 * html`
 *     <div ${nav(0, 1)}></div>
 * `;
 * ```
 */
export function nav(xCoord: number, yCoord: number): DirectiveResult;
/**
 * Mark an element as a nav group, which can't receive focus but can define a section of navigable
 * elements.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {group, nav} from 'device-navigation';
 *
 * const myTemplate = html`
 *     <div ${nav(group)}></div>
 * `;
 * ```
 */
export function nav(isGroup: typeof group): DirectiveResult;
/**
 * Mark an element for navigation.
 *
 * This automatically applies the `tabindex` attribute and all keyboard and mouse listeners needed
 * to enable `NavController` functionality.
 *
 * @category Main
 */
export function nav(
    xOrGroup?: undefined | number | typeof group,
    yCoord?: number | undefined,
): DirectiveResult {
    const navValue = createNavValueString(xOrGroup, yCoord);

    return modifyElement(`${xOrGroup}-${yCoord}`, (element) => {
        const tabIndexAttribute =
            element.hasAttribute('tabindex') || xOrGroup === group
                ? {}
                : {
                      tabindex: 0,
                  };

        const allAttributes = {
            [navAttribute.name]: navValue,
            ...tabIndexAttribute,
        };
        assert.instanceOf(element, HTMLElement);
        applyAttributes(element, allAttributes);

        if (xOrGroup === group) {
            /** Skip all listeners if this is a nav parent. */
            return;
        }

        if (!element.style.getPropertyValue('cursor')) {
            element.style.setProperty('cursor', 'pointer');
        }
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
            'mouseleave',
            (event) => {
                if (event.target === element) {
                    element.blur();
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
