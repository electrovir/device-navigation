import {assert, assertWrap} from '@augment-vir/assert';
import {type PartialWithUndefined} from '@augment-vir/common';
import {css, unsafeCSS} from 'element-vir';
import {type EmptyObject} from 'type-fest';
import {type NavController} from '../nav-controller/nav-controller.js';
import {type NavTreeNode} from '../nav-controller/nav-tree.js';

/**
 * Values for the nav attribute that `nav` applies to elements.
 *
 * @category Internal
 */
export enum NavValue {
    Disabled = 'disabled',
    Group = 'group',
    Focused = 'focused',
    Active = 'active',
}

/**
 * The attribute which the `nav` directive applies to elements with a value of {@link NavValue}.
 *
 * @category Internal
 */
export const navAttribute = {
    /** Name of the attribute. */
    name: 'data-nav',
    /**
     * Use this to generate a query selector string for the attribute, to be within with JavaScript
     * queries.
     */
    js(
        /**
         * Omit this or set to `undefined` or `''` to generate a selector for all elements with the
         * nav attribute.
         */
        value?: NavValue | undefined | '',
    ) {
        if (value) {
            return `[${navAttribute.name}*="${value}"]`;
        } else {
            return `[${navAttribute.name}]`;
        }
    },
    /** Use this to generate a selector for the attribute in CSS. */
    css(
        /**
         * Omit this or set to `undefined` or `''` to generate a selector for all elements with the
         * nav attribute.
         */
        value?: NavValue | undefined | '',
    ) {
        return css`
            ${unsafeCSS(navAttribute.js(value))}
        `;
    },
};

export const navEntryPropertyKey = 'navEntry';
export type WithNavEntry<T> = T & {[navEntryPropertyKey]: NavEntry};

export function hasNavEntry(element: Element): element is WithNavEntry<typeof element> {
    return navEntryPropertyKey in element;
}

/**
 * Params for a nav element. This has the following navigation options:
 *
 * - Provide `x` and `y` this element's 2D navigation coordinates.
 * - Provide just `x` to set this element's 1D navigational coordinates.
 * - Set `group: true` to define this element as a group.
 * - Set neither to define this element as a 1D nav entry.
 *
 * @category Internal
 */
export type NavParams =
    | {
          /**
           * Mark an element as a nav group, which can't receive focus but can define a section of
           * navigable elements.
           */
          group: true;
      }
    | ((
          | {
                /** Mark this element's x coordinate. */
                x: number;

                /** Mark this element's 2 dimensional y coordinate. */
                y?: number | undefined;
            }
          | EmptyObject
      ) &
          PartialWithUndefined<{
              /** Disables this element from navigation. */
              disabled: boolean;
          }>);

export function extractNavEntry(element: Element): NavEntry | undefined {
    if (hasNavEntry(element)) {
        const navEntry = element[navEntryPropertyKey];
        return assertWrap.instanceOf(navEntry, NavEntry, 'Invalid nav entry');
    } else {
        return undefined;
    }
}

/**
 * A class that is attached to all navigable elements. It is attached to the
 * {@link navEntryPropertyKey} property.
 *
 * @category Internal
 */
export class NavEntry {
    public navTreeNode: NavTreeNode | undefined;
    public navValue: NavValue | undefined;

    protected declare _navController: NavController | undefined;
    public set navController(navController: NavController) {
        if (this._navController !== navController) {
            this._navController?.navEntries.delete(this);
            this._navController = navController;
            navController.navEntries.add(this);
        }
    }
    public get navController() {
        assert.isDefined(
            this._navController,
            'NavController has not been set in NavEntry constructor yet',
        );

        return this._navController;
    }

    constructor(
        private readonly element: HTMLElement,
        navController: NavController,
        public navParams: Readonly<NavParams>,
    ) {
        this.attachListeners();
        this.navController = navController;
    }

    public setNavValue(navValue: NavValue) {
        this.navValue = navValue;
        this.element.setAttribute(navAttribute.name, navValue);
    }

    public removeNavValue(navValue: NavValue) {
        if (this.navValue === navValue) {
            this.navValue = undefined;
            this.element.setAttribute(navAttribute.name, '');
        }
    }

    public focus(
        /**
         * - `true` to focus
         * - `false` to unfocus (or "blur")
         */
        enabled: boolean,
    ) {
        if (enabled) {
            this.element.focus();
            this.setNavValue(NavValue.Focused);
        } else {
            this.element.blur();
            this.removeNavValue(NavValue.Focused);
        }
    }

    /**
     * - `true` to activate
     * - `false` to deactivate
     */
    public activate(enabled: boolean) {
        this.focus(enabled);
        if (enabled) {
            this.setNavValue(NavValue.Active);
        } else {
            this.removeNavValue(NavValue.Active);
        }
    }

    /** Attach default mouse and focus listeners. */
    protected attachListeners() {
        this.element.addEventListener(
            'mousemove',
            (event) => {
                if (event.target === this.element) {
                    this.focus(true);
                }
            },
            true,
        );
        this.element.addEventListener(
            'mouseleave',
            (event) => {
                if (event.target === this.element) {
                    this.focus(false);
                }
            },
            true,
        );
        this.element.addEventListener(
            'mousedown',
            (event) => {
                if (event.target === this.element) {
                    this.activate(true);
                }
            },
            true,
        );
        this.element.addEventListener(
            'mouseup',
            (event) => {
                if (event.target === this.element) {
                    this.activate(false);
                }
            },
            true,
        );
        this.element.addEventListener(
            'focus',
            () => {
                this.focus(true);
            },
            true,
        );
        this.element.addEventListener(
            'blur',
            () => {
                this.focus(false);
            },
            true,
        );
    }
}
