import {ListenTarget} from 'typed-event-target';
import {buildNavTree, NavRootNode} from '../nav-tree/nav-tree.js';
import {CurrentlyFocusedResult, getCurrentlyFocused} from './currently-focused.js';
import {enterInto} from './enter-into.js';
import {exitOutOf} from './exit-out-of.js';
import {
    AllNavControllerEvents,
    NavEnterEvent,
    NavExitEvent,
    NavigateEvent,
    NavPiblingEvent,
} from './nav-controller-events.js';
import {
    NavAction,
    navigate,
    navigatePibling,
    NavigationInputs,
    NavigationResult,
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
    constructor(
        /**
         * The parent of all navigable elements. If this element also has `nav()` applied to it, it
         * will be ignored.
         */
        public readonly rootElement: HTMLElement,
    ) {
        super();
    }

    /** Gets the currently focused node (is any) from within the `rootElement`'s nav tree. */
    public getCurrentlyFocused(): CurrentlyFocusedResult | undefined {
        return getCurrentlyFocused(this.buildNavTree());
    }
    /** Builds a nav tree from the `rootElement`. */
    public buildNavTree(): NavRootNode | undefined {
        return buildNavTree(this.rootElement);
    }

    /** Navigate around the nav tree. */
    public navigate({
        direction,
        allowWrapping,
    }: NavigationInputs): NavigationResult<NavAction.Navigate> {
        const result = navigate(this.buildNavTree(), direction, allowWrapping);
        this.dispatch(new NavigateEvent({detail: result}));
        return result;
    }
    /**
     * Enter into the currently focused node's children. Focuses the first child. Fails if there are
     * no children to focus.
     */
    public enterInto(): NavigationResult<NavAction.Enter> {
        const result = enterInto(this.buildNavTree());
        this.dispatch(new NavEnterEvent({detail: result}));
        return result;
    }
    /**
     * Shift focus from the currently focused node to its parent. If there is no parent, or rather
     * if the parent is the tree root, this fails.
     */
    public exitOutOf(): NavigationResult<NavAction.Exit> {
        const result = exitOutOf(this.buildNavTree());
        this.dispatch(new NavExitEvent({detail: result}));
        return result;
    }
    /** Navigate to siblings of the parent of the currently focused element, if they exist. */
    public navigatePibling({
        allowWrapping,
        direction,
    }: NavigationInputs): NavigationResult<NavAction.Pibling> {
        const navTree = this.buildNavTree();

        const currentlyFocused = getCurrentlyFocused(navTree);

        const rawResult =
            !currentlyFocused || !navTree
                ? navigate(navTree, direction, allowWrapping)
                : navigatePibling(navTree, currentlyFocused, direction, allowWrapping);

        const result: NavigationResult<NavAction.Pibling> = {
            ...rawResult,
            navAction: NavAction.Pibling,
        };

        this.dispatch(new NavPiblingEvent({detail: result}));

        return result;
    }
}
