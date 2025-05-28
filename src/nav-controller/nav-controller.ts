import {assert} from '@augment-vir/assert';
import {type PartialWithUndefined} from '@augment-vir/common';
import {getNestedChildrenTree} from '@augment-vir/web';
import {ListenTarget} from 'typed-event-target';
import {type CurrentNavEntry, type NavEntry} from '../directives/nav-entry.js';
import {mapTree, type NavTree} from '../nav-tree/nav-tree.js';
import {findNavTreeNodeByNavEntry} from '../nav-tree/walk-nav-tree.js';
import {enterInto} from './enter-into.js';
import {exitOutOf} from './exit-out-of.js';
import {
    NavActivateEvent,
    NavEnterEvent,
    NavExitEvent,
    NavFocusEvent,
    NavigateEvent,
    NavPiblingEvent,
    type AllNavControllerEvents,
} from './nav-controller-events.js';
import {
    findDefaultChild,
    NavAction,
    navigate,
    navigatePibling,
    type NavigationInputs,
    type NavigationResult,
} from './navigate.js';

/**
 * Options for {@link NavController}.
 *
 * @category Internal
 */
export type NavControllerOptions = PartialWithUndefined<{
    /**
     * Always require an element within the nav tree to be focused.
     *
     * @default false
     */
    alwaysRequireFocused: boolean;
    /**
     * By default, element activation is triggered on mousedown. Set this to `true` to instead
     * activate it on `mouseup`.
     *
     * @default false
     */
    activateOnMouseUp: boolean;
}>;

/**
 * Allows navigation around the nav tree contained within the given `rootElement`. If there is no
 * nav tree, all operations simply do nothing. For a full example, see
 * {@link https://github.com/electrovir/device-navigation/blob/dev/src/test/elements/vir-test-app.element.ts | vir-test-app.element.ts}.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {NavController, NavDirection} from 'device-navigation';
 *
 * const navController = new NavController(host);
 *
 * window.addEventListener('keydown', (event) => {
 *     if (event.code === 'ArrowDown') {
 *         navController.navigate({direction: NavDirection.Down, allowWrapper: false});
 *     } else if (event.code === 'ArrowUp') {
 *         navController.navigate({direction: NavDirection.Up, allowWrapper: false});
 *     }
 *     // etc. all other navigation directions
 * });
 * ```
 */
export class NavController extends ListenTarget<AllNavControllerEvents> {
    constructor(
        public readonly rootElement: HTMLElement,
        public readonly options: NavControllerOptions = {},
    ) {
        super();
    }

    /** If `true`, the nav tree will rebuild on next operation. */
    public needsUpdate = false;
    /** If true, all nav is prevented. */
    public locked = false;
    protected navEntries = new Set<Readonly<NavEntry>>();
    public currentNavEntry: Readonly<CurrentNavEntry> | undefined;

    protected cachedNavTree: Readonly<NavTree> | undefined;

    /** Gets or builds the current nav tree. */
    protected getNavTree(): Readonly<NavTree> {
        if (this.needsUpdate || !this.cachedNavTree) {
            this.needsUpdate = false;
            return this.buildNavTree();
        } else {
            return this.cachedNavTree;
        }
    }

    /** Focus the default element for the whole tree. */
    public focusDefaultElement() {
        findDefaultChild(this.getNavTree().children)?.node.element.focus();
    }

    /** Add a new {@link NavEntry} to this controller. */
    public addNavEntry(navEntry: NavEntry) {
        this.navEntries.add(navEntry);
        if (this.options.alwaysRequireFocused && !this.currentNavEntry) {
            requestAnimationFrame(() => {
                this.focusDefaultElement();
            });
        }
    }

    /** Remove a {@link NavEntry} from this controller. */
    public removeNavEntry(navEntry: NavEntry) {
        this.navEntries.delete(navEntry);
        if (this.options.alwaysRequireFocused && !this.currentNavEntry) {
            requestAnimationFrame(() => {
                this.focusDefaultElement();
            });
        }
    }

    /** Sets the current nav entry with the given action. */
    public triggerNavEntry(
        navEntry: Readonly<NavEntry> | undefined,
        enabled: boolean,
        navAction: NavAction.Activate,
    ): NavigationResult<NavAction.Activate>;
    /** Sets the current nav entry with the given action. */
    public triggerNavEntry(
        navEntry: Readonly<NavEntry> | undefined,
        enabled: boolean,
        navAction: NavAction.Focus,
    ): NavigationResult<NavAction.Focus>;
    /** Sets the current nav entry with the given action. */
    public triggerNavEntry(
        navEntry: Readonly<NavEntry> | undefined,
        enabled: boolean,
        navAction: NavAction.Activate | NavAction.Focus,
    ): NavigationResult<NavAction.Activate | NavAction.Focus> {
        if (this.locked) {
            return {
                success: false,
                direction: undefined,
                navAction,
                reason: 'NavController is locked.',
            };
        } else if (!navEntry) {
            return {
                success: false,
                direction: undefined,
                navAction: navAction,
                reason: 'No nav entry to operate on.',
            };
        }

        const position = findNavTreeNodeByNavEntry(this.getNavTree(), navEntry);

        if (enabled) {
            this.navEntries.forEach((nestedNavEntry) => {
                if (nestedNavEntry !== navEntry) {
                    nestedNavEntry.clearNavValue();
                }
            });
            this.currentNavEntry = {
                entry: navEntry,
                navAction: navAction,
                position,
            };
        } else if (
            this.currentNavEntry?.entry === navEntry &&
            this.currentNavEntry.navAction === navAction &&
            !this.options.alwaysRequireFocused
        ) {
            this.currentNavEntry = undefined;
        }

        const result: NavigationResult<NavAction.Activate | NavAction.Focus> = {
            success: true,
            defaulted: false,
            direction: undefined,
            newElement: navEntry.element,
            wrapped: false,
            navAction,
            coords: position.nodeCoords,
        };
        if (enabled) {
            if (navAction === NavAction.Activate) {
                this.dispatch(
                    new NavActivateEvent({detail: result as NavigationResult<NavAction.Activate>}),
                );
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            } else if (navAction === NavAction.Focus) {
                this.dispatch(
                    new NavFocusEvent({detail: result as NavigationResult<NavAction.Focus>}),
                );
            }
        }

        return result;
    }

    /** Navigate around the nav tree. */
    public navigate({
        direction,
        allowWrapping,
    }: Readonly<NavigationInputs>): NavigationResult<NavAction.Navigate> {
        if (this.locked) {
            return {
                success: false,
                direction,
                navAction: NavAction.Navigate,
                reason: 'NavController is locked.',
            };
        }
        const result = navigate(this.getNavTree(), this.currentNavEntry, direction, allowWrapping);
        this.dispatch(new NavigateEvent({detail: result}));
        return result;
    }
    /**
     * Enter into the currently focused node's children. Focuses the first child. Fails if there are
     * no children to focus.
     */
    public enterInto(params: {
        fallbackToActivate: true;
    }): NavigationResult<NavAction.Enter | NavAction.Activate>;
    public enterInto(
        params?:
            | {
                  fallbackToActivate?: false | undefined;
              }
            | undefined,
    ): NavigationResult<NavAction.Enter>;
    public enterInto({
        fallbackToActivate,
    }: PartialWithUndefined<{
        fallbackToActivate: boolean;
    }> = {}): NavigationResult<NavAction.Enter | NavAction.Activate> {
        if (this.locked) {
            return {
                success: false,
                direction: undefined,
                navAction: NavAction.Enter,
                reason: 'NavController is locked.',
            };
        }
        const result = enterInto(this.getNavTree(), this.currentNavEntry);
        if (!result.success && fallbackToActivate) {
            return this.activate();
        } else {
            this.dispatch(new NavEnterEvent({detail: result}));
            return result;
        }
    }

    /** Activate the currently focused nav entry. */
    public activate(): NavigationResult<NavAction.Activate> {
        if (this.locked) {
            return {
                success: false,
                direction: undefined,
                navAction: NavAction.Activate,
                reason: 'NavController is locked.',
            };
        }
        if (!this.currentNavEntry?.entry) {
            return {
                success: false,
                direction: undefined,
                navAction: NavAction.Activate,
                reason: 'No focused NavEntry to activate.',
            };
        }

        const result = this.currentNavEntry.entry.activate(true);

        assert.isDefined(result, 'Cannot activate a group.');

        return result;
    }

    /**
     * Shift focus from the currently focused node to its parent. If there is no parent, or rather
     * if the parent is the tree root, this fails.
     */
    public exitOutOf(): NavigationResult<NavAction.Exit> {
        if (this.locked) {
            return {
                success: false,
                direction: undefined,
                navAction: NavAction.Exit,
                reason: 'NavController is locked.',
            };
        }
        if (this.currentNavEntry?.navAction === NavAction.Activate) {
            this.currentNavEntry.entry.focus(true);
        }

        const result = exitOutOf(this.getNavTree(), this.currentNavEntry);
        this.dispatch(new NavExitEvent({detail: result}));
        return result;
    }
    /** Navigate to siblings of the parent of the currently focused element, if they exist. */
    public navigatePibling({
        allowWrapping,
        direction,
    }: Readonly<NavigationInputs>): NavigationResult<NavAction.Pibling> {
        if (this.locked) {
            return {
                success: false,
                direction,
                navAction: NavAction.Pibling,
                reason: 'NavController is locked.',
            };
        }
        const navTree = this.getNavTree();

        const rawResult = this.currentNavEntry
            ? navigatePibling(this.currentNavEntry, direction, allowWrapping)
            : navigate(navTree, undefined, direction, allowWrapping);

        const result: NavigationResult<NavAction.Pibling> = {
            ...rawResult,
            navAction: NavAction.Pibling,
        };

        this.dispatch(new NavPiblingEvent({detail: result}));

        return result;
    }

    /** Builds the latest tree, sets it internally, and returns it. */
    public buildNavTree() {
        const elementTree = getNestedChildrenTree(this.rootElement);

        const tree = mapTree(elementTree);

        this.cachedNavTree = tree;

        return tree;
    }
}
