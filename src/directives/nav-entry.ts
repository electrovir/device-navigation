import {assert, assertWrap} from '@augment-vir/assert';
import {
    type EmptyFunction,
    makeWritable,
    type MaybePromise,
    type PartialWithUndefined,
} from '@augment-vir/common';
import {isElementFocused} from '@augment-vir/web';
import {css, unsafeCSS} from 'element-vir';
import {type NavController} from '../nav-controller/nav-controller.js';
import {NavAction} from '../nav-controller/navigate.js';
import {type NavTreeNode} from '../nav-tree/nav-tree.js';
import {type WalkResult} from '../nav-tree/walk-nav-tree.js';

/**
 * The currently focused or activated nav entry.
 *
 * @category Internal
 */
export type CurrentNavEntry = {
    entry: Readonly<NavEntry>;
    navAction: NavAction.Activate | NavAction.Focus;
    position: Readonly<WalkResult>;
    removeDisconnectListener: EmptyFunction;
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
    css({
        baseSelector = '',
        navValue,
    }: PartialWithUndefined<{
        baseSelector: string;
        /**
         * Omit this or set to `undefined` or `''` to generate a selector for all elements with the
         * nav attribute.
         */
        navValue: NavValue;
    }> = {}) {
        return css`
            ${unsafeCSS(baseSelector)}${unsafeCSS(navAttribute.js(navValue))}
        `;
    },
};

/**
 * The property with which {@link NavEntry} instances are attached to elements.
 *
 * @category Internal
 */
export const navEntryPropertyKey = 'navEntry';
/**
 * Used in type guards to indicate that this object has an attached {@link NavEntry} instance.
 *
 * @category Internal
 */
export type WithNavEntry<T> = T & {[navEntryPropertyKey]: NavEntry};

/**
 * Checks if the given element has a {@link NavEntry} instance attached to it via
 * {@link navEntryPropertyKey}
 *
 * @category Internal
 */
export function hasNavEntry(element: Element): element is WithNavEntry<typeof element> {
    return navEntryPropertyKey in element;
}

/**
 * Params for {@link NavListener}.
 *
 * @category Internal
 */
export type NavListenerParams = {
    enabled: boolean;
    navEntry: NavEntry;
    element: HTMLElement;
    previousNavValue: NavValue | undefined;
};

/**
 * Listener callback for listeners in {@link NavParams}.
 *
 * @category Internal
 */
export type NavListener = (params: NavListenerParams) => MaybePromise<void>;

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
    /**
     * The number of horizontal x slots this entry occupies, starting at `x`. Set this for wide
     * entries so that:
     *
     * - Vertical navigation _into_ the entry lands on it across its full width
     * - Vertical navigation _out_ of the entry originates from its center slot
     * - Horizontal navigation steps over the entry as a single unit.
     *
     * @default 1
     */
    width: number;

    /** Disable this element's navigation. */
    disabled: boolean;

    listeners: PartialWithUndefined<{
        /** Will be fired when this element is activated. */
        activate: NavListener;
        /** Will be fired when this element is focused. */
        focus: NavListener;
    }>;
}>;

/**
 * Extracts a {@link NavEntry} instance attached to the given element, if it exists, by checking the
 * {@link navEntryPropertyKey} property.
 *
 * @category Internal
 */
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
        if (
            navEntry.navParams.group ||
            navEntry.navParams.disabled ||
            navEntry.navController.locked
        ) {
            return;
        } else if (
            (event.type === 'mousedown' && !navEntry.navController.options.activateOnMouseUp) ||
            (event.type === 'mouseup' && navEntry.navController.options.activateOnMouseUp)
        ) {
            if (event.target === navEntry.element) {
                navEntry.activate(true);
            }
        } else if (event.type === 'mouseup' || event.type === 'focus') {
            if (event.target === navEntry.element) {
                navEntry.focus(true);
            }
        } else if (event.type === 'mousemove') {
            if (event.target === navEntry.element && navEntry.navValue !== NavValue.Active) {
                navEntry.focus(true);
            }
        } else if (event.type === 'blur' || event.type === 'mouseleave') {
            // eslint-disable-next-line unicorn/no-lonely-if
            if (event.target === navEntry.element) {
                navEntry.activate(false);
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

    /** Set the {@link NavController} and add this instance to it. */
    public set navController(navController: NavController) {
        if (this._navController !== navController) {
            this._navController?.removeNavEntry(this);
            this._navController = navController;
            navController.addNavEntry(this);
        }
    }
    /** Set the current {@link NavController}. */
    public get navController() {
        assert.isDefined(
            this._navController,
            'this.navController has not been set in NavEntry constructor yet.',
        );

        return this._navController;
    }

    /** Clear all nav values from the element, just leave the plain attribute (without a value). */
    public clearNavValue() {
        if (this.navParams.group || this.navController.locked) {
            return;
        }
        makeWritable(this).navValue = undefined;
        this.element.setAttribute(navAttribute.name, '');
        if (isElementFocused(this.element)) {
            this.element.blur();
        }
    }

    /** Focus or blur the element. */
    public focus(
        /**
         * - `true` to focus
         * - `false` to unfocus (or "blur")
         */
        enabled: boolean,
        skipListener?: boolean | undefined,
    ) {
        const previousNavValue = this.navValue;
        const alreadySet = enabled === (previousNavValue === NavValue.Focused);

        if (
            this.navParams.group ||
            this.navController.locked ||
            alreadySet ||
            (!enabled && this.navController.options.alwaysRequireFocused)
        ) {
            return;
        }

        if (enabled) {
            this.setNavValue(NavValue.Focused);
            if (!isElementFocused(this.element)) {
                this.element.focus();
            }
        } else {
            this.removeNavValue(NavValue.Focused);
            if (isElementFocused(this.element)) {
                this.element.blur();
            }
        }

        if (!skipListener) {
            void this.navParams.listeners?.focus?.({
                element: this.element,
                navEntry: this,
                enabled,
                previousNavValue,
            });
        }
        return this.navController.triggerNavEntry(this, enabled, NavAction.Focus);
    }

    /** Activate or deactivate the element. */
    public activate(
        /**
         * - `true` to activate
         * - `false` to deactivate
         */
        enabled: boolean,
    ) {
        const previousNavValue = this.navValue;
        const alreadySet = enabled === (previousNavValue === NavValue.Active);

        if (this.navParams.group || this.navController.locked || alreadySet) {
            return;
        }
        this.focus(enabled, true);
        if (enabled) {
            this.setNavValue(NavValue.Active);
        } else {
            this.setNavValue(NavValue.Focused);
        }
        void this.navParams.listeners?.activate?.({
            element: this.element,
            navEntry: this,
            enabled,
            previousNavValue,
        });
        return this.navController.triggerNavEntry(this, enabled, NavAction.Activate);
    }

    /** Set the given {@link NavValue} on the element. */
    protected setNavValue(navValue: NavValue) {
        makeWritable(this).navValue = navValue;
        this.element.setAttribute(navAttribute.name, navValue);
    }

    /** Remove the given {@link NavValue}, if it exists, from the element. */
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
