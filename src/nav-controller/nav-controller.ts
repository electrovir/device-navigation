import {buildNavTree, NavRootNode} from '../nav-tree/nav-tree';
import {CurrentlyFocusedResult, getCurrentlyFocused} from './currently-focused';
import {enterInto} from './enter-into';
import {exitOutOf} from './exit-out-of';
import {NavDirection, navigate, NavigationResult} from './navigate';

/** Inputs for controlling navigation. */
export type NavigationInputs = {
    /**
     * The direction to navigate within the tree. Note that 1 dimensional navigation treads up and
     * left as the same, down and right as the same.
     */
    direction: NavDirection;
    /** Set to true to allow navigation to wrap. */
    allowWrapping: boolean;
};

/**
 * Allows navigation around the nav tree contained within the given `rootElement`. If there is no
 * nav tree, all operations simply do nothing.
 */
export class NavController {
    constructor(public readonly rootElement: HTMLElement) {}

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
        return navigate(this.rootElement, direction, allowWrapping);
    }
    /**
     * Enter into the currently focused node's children. Focuses the first child. Fails if there are
     * no children to focus.
     */
    public enterInto(): NavigationResult {
        return enterInto(this.rootElement);
    }
    /**
     * Shift focus from the currently focused node to its parent. If there is no parent, or rather
     * if the parent is the tree root, this fails.
     */
    public exitOutOf(): NavigationResult {
        return exitOutOf(this.rootElement);
    }
    /** Navigate to siblings of the parent of the currently focused element, if they exist. */
    public navigatePibling(navigationInputs: NavigationInputs): NavigationResult {
        const exitResult = this.exitOutOf();
        if (exitResult.success) {
            return this.navigate(navigationInputs);
        } else {
            return exitResult;
        }
    }
}
