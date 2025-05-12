import {getNestedChildrenTree} from '@augment-vir/web';
import {ListenTarget} from 'typed-event-target';
import {
    type CurrentNavEntry,
    type NavEntry,
    type NavEntryOperation,
} from '../directives/nav-entry.js';
import {mapTree, type NavTree} from '../nav-tree/nav-tree.js';
import {findNavTreeNodeByNavEntry} from '../nav-tree/walk-nav-tree.js';
import {enterInto} from './enter-into.js';
import {exitOutOf} from './exit-out-of.js';
import {
    NavEnterEvent,
    NavExitEvent,
    NavigateEvent,
    NavPiblingEvent,
    type AllNavControllerEvents,
} from './nav-controller-events.js';
import {
    NavAction,
    navigate,
    navigatePibling,
    type NavigationInputs,
    type NavigationResult,
} from './navigate.js';

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
    constructor(public readonly rootElement: HTMLElement) {
        super();
    }

    /** If `true`, the nav tree will rebuild on next operation. */
    public needsUpdate = false;
    public navEntries = new Set<Readonly<NavEntry>>();
    public currentNavEntry: Readonly<CurrentNavEntry> | undefined;

    protected cachedNavTree: Readonly<NavTree> | undefined;

    protected getNavTree(): Readonly<NavTree> {
        if (this.needsUpdate || !this.cachedNavTree) {
            this.needsUpdate = false;
            return this.buildNavTree();
        } else {
            return this.cachedNavTree;
        }
    }

    public triggerNavEntry(
        navEntry: Readonly<NavEntry>,
        enabled: boolean,
        operation: NavEntryOperation,
    ) {
        if (enabled) {
            this.navEntries.forEach((nestedNavEntry) => {
                if (nestedNavEntry !== navEntry) {
                    nestedNavEntry.clearNavValue();
                }
            });
            this.currentNavEntry = {
                entry: navEntry,
                operation: operation,
                position: findNavTreeNodeByNavEntry(this.getNavTree(), navEntry),
            };
        } else if (
            this.currentNavEntry?.entry === navEntry &&
            this.currentNavEntry.operation === operation
        ) {
            this.currentNavEntry = undefined;
        }
    }

    /** Navigate around the nav tree. */
    public navigate({
        direction,
        allowWrapping,
    }: Readonly<NavigationInputs>): NavigationResult<NavAction.Navigate> {
        const result = navigate(this.getNavTree(), this.currentNavEntry, direction, allowWrapping);
        this.dispatch(new NavigateEvent({detail: result}));
        return result;
    }
    /**
     * Enter into the currently focused node's children. Focuses the first child. Fails if there are
     * no children to focus.
     */
    public enterInto(): NavigationResult<NavAction.Enter> {
        const result = enterInto(this.getNavTree(), this.currentNavEntry);
        this.dispatch(new NavEnterEvent({detail: result}));
        return result;
    }
    /**
     * Shift focus from the currently focused node to its parent. If there is no parent, or rather
     * if the parent is the tree root, this fails.
     */
    public exitOutOf(): NavigationResult<NavAction.Exit> {
        /** Make sure the tree is fresh. */
        this.getNavTree();
        const result = exitOutOf(this.currentNavEntry);
        this.dispatch(new NavExitEvent({detail: result}));
        return result;
    }
    /** Navigate to siblings of the parent of the currently focused element, if they exist. */
    public navigatePibling({
        allowWrapping,
        direction,
    }: Readonly<NavigationInputs>): NavigationResult<NavAction.Pibling> {
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

    public buildNavTree() {
        const elementTree = getNestedChildrenTree(this.rootElement);

        const tree = mapTree(elementTree);

        this.cachedNavTree = tree;

        return tree;
    }
}
