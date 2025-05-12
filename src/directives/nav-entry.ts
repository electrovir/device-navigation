import {assert, assertWrap} from '@augment-vir/assert';
import {makeWritable, type PartialWithUndefined} from '@augment-vir/common';
import {isElementFocused} from '@augment-vir/web';
import {css, unsafeCSS} from 'element-vir';
import {type NavController} from '../nav-controller/nav-controller.js';
import {type NavTreeNode} from '../nav-tree/nav-tree.js';
import {type WalkResult} from '../nav-tree/walk-nav-tree.js';

export enum NavEntryOperation {
    Activate = 'activate',
    Focus = 'focus',
}

export type CurrentNavEntry = {
    entry: Readonly<NavEntry>;
    operation: NavEntryOperation;
    position: Readonly<WalkResult>;
};

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
        baseSelector: string,
        /**
         * Omit this or set to `undefined` or `''` to generate a selector for all elements with the
         * nav attribute.
         */
        value?: NavValue | undefined | '',
    ) {
        return css`
            ${unsafeCSS(baseSelector)}${unsafeCSS(navAttribute.js(value))}
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
export type NavParams = PartialWithUndefined<{
    /**
     * Mark an element as a nav group, which can't receive focus but can define a section of
     * navigable elements.
     */
    group: boolean;

    /** Mark this element's x coordinate, either in 1D or 2D. */
    x: number;
    /**
     * Mark this element's 2 dimensional y coordinate.
     *
     * @default 0
     */
    y: number;

    /** Disable this element's navigation. */
    disabled: boolean;
}>;

export function extractNavEntry(element: Element): NavEntry | undefined {
    if (hasNavEntry(element)) {
        const navEntry = element[navEntryPropertyKey];
        return assertWrap.instanceOf(navEntry, NavEntry, 'Invalid nav entry');
    } else {
        return undefined;
    }
}

function createEventListener(navEntry: NavEntry) {
    return (event: Event) => {
        if (navEntry.navParams.group) {
            return;
        }

        if (event.type === 'mousemove') {
            if (event.target === navEntry.element) {
                navEntry.focus(true);
            }
        } else if (event.type === 'mouseleave') {
            if (event.target === navEntry.element) {
                navEntry.focus(false);
            }
        } else if (event.type === 'mousedown') {
            if (event.target === navEntry.element) {
                navEntry.activate(true);
            }
        } else if (event.type === 'mouseup') {
            if (event.target === navEntry.element) {
                navEntry.activate(false);
            }
        } else if (event.type === 'focus') {
            if (event.target === navEntry.element) {
                navEntry.focus(true);
            }
        } else if (event.type === 'blur') {
            // eslint-disable-next-line unicorn/no-lonely-if
            if (event.target === navEntry.element) {
                navEntry.focus(false);
            }
        }
    };
}

/**
 * A class that is attached to all navigable elements. It is attached to the
 * {@link navEntryPropertyKey} property.
 *
 * @category Internal
 */
export class NavEntry {
    public navTreeNode: NavTreeNode | undefined;
    public readonly navValue: NavValue | undefined;

    /** Use a singular event listener for all events so it can be removed. */
    protected readonly eventListener = createEventListener(this);
    protected declare _navController: NavController | undefined;

    constructor(
        public readonly element: HTMLElement,
        navController: NavController,
        public navParams: Readonly<NavParams>,
    ) {
        this.attachListeners();
        this.navController = navController;
    }

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
            'this.navController has not been set in NavEntry constructor yet.',
        );

        return this._navController;
    }

    public clearNavValue() {
        makeWritable(this).navValue = undefined;
        this.element.setAttribute(navAttribute.name, '');
    }

    public focus(
        /**
         * - `true` to focus
         * - `false` to unfocus (or "blur")
         */
        enabled: boolean,
    ) {
        if (this.navParams.group) {
            return;
        }
        this.navController.triggerNavEntry(this, enabled, NavEntryOperation.Focus);
        if (enabled) {
            if (!isElementFocused(this.element)) {
                this.element.focus();
            }
            this.setNavValue(NavValue.Focused);
        } else {
            if (isElementFocused(this.element)) {
                this.element.blur();
            }
            this.removeNavValue(NavValue.Focused);
        }
    }

    /**
     * - `true` to activate
     * - `false` to deactivate
     */
    public activate(enabled: boolean) {
        if (this.navParams.group) {
            return;
        }
        this.focus(enabled);
        this.navController.triggerNavEntry(this, enabled, NavEntryOperation.Activate);
        if (enabled) {
            this.setNavValue(NavValue.Active);
        } else {
            this.removeNavValue(NavValue.Active);
        }
    }

    protected setNavValue(navValue: NavValue) {
        makeWritable(this).navValue = navValue;
        this.element.setAttribute(navAttribute.name, navValue);
    }

    protected removeNavValue(navValue: NavValue) {
        if (this.navValue === navValue) {
            makeWritable(this).navValue = undefined;
            this.element.setAttribute(navAttribute.name, '');
        }
    }

    /** Attach default mouse and focus listeners. */
    protected attachListeners() {
        this.element.addEventListener('mousemove', this.eventListener, true);
        this.element.addEventListener('mouseleave', this.eventListener, true);
        this.element.addEventListener('mousedown', this.eventListener, true);
        this.element.addEventListener('mouseup', this.eventListener, true);
        this.element.addEventListener('focus', this.eventListener, true);
        this.element.addEventListener('blur', this.eventListener, true);
    }
}
