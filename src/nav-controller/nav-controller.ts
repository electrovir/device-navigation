import {buildNavTree, NavRootNode} from '../nav-tree/nav-tree.js';
import {CurrentlyFocusedResult, getCurrentlyFocused} from './currently-focused.js';
import {enterInto} from './enter-into.js';
import {exitOutOf} from './exit-out-of.js';
import {navigate, navigatePibling, NavigationInputs, NavigationResult} from './navigate.js';

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
 *         navController.navigate({
 *             direction: NavDirection.Down,
 *             allowWrapper: false,
 *         });
 *     } else if (event.code === 'ArrowUp') {
 *         navController.navigate({
 *             direction: NavDirection.Up,
 *             allowWrapper: false,
 *         });
 *     }
 *     // etc. all other navigation directions
 * });
 * ```
 */
export class NavController {
    constructor(
        /**
         * The parent of all navigable elements. If this element also has `nav()` applied to it, it
         * will be ignored.
         */
        public readonly rootElement: HTMLElement,
    ) {}

    /** Gets the currently focused node (is any) from within the `rootElement`'s nav tree. */
    public getCurrentlyFocused(): CurrentlyFocusedResult | undefined {
        return getCurrentlyFocused(this.buildNavTree());
    }
    /** Builds a nav tree from the `rootElement`. */
    public buildNavTree(): NavRootNode | undefined {
        return buildNavTree(this.rootElement);
    }

    /** Navigate around the nav tree. */
    public navigate({direction, allowWrapping}: NavigationInputs): NavigationResult {
        return navigate(this.buildNavTree(), direction, allowWrapping);
    }
    /**
     * Enter into the currently focused node's children. Focuses the first child. Fails if there are
     * no children to focus.
     */
    public enterInto(): NavigationResult {
        return enterInto(this.buildNavTree());
    }
    /**
     * Shift focus from the currently focused node to its parent. If there is no parent, or rather
     * if the parent is the tree root, this fails.
     */
    public exitOutOf(): NavigationResult {
        return exitOutOf(this.buildNavTree());
    }
    /** Navigate to siblings of the parent of the currently focused element, if they exist. */
    public navigatePibling({allowWrapping, direction}: NavigationInputs): NavigationResult {
        const navTree = this.buildNavTree();

        const currentlyFocused = getCurrentlyFocused(navTree);

        if (!currentlyFocused || !navTree) {
            return navigate(navTree, direction, allowWrapping);
        }

        return navigatePibling(navTree, currentlyFocused, direction, allowWrapping);
    }
}
