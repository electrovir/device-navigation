import {type NavRootNode} from '../nav-tree/nav-tree.js';
import {focusElement} from '../util/focus.js';
import {getCurrentlyFocused} from './currently-focused.js';
import {NavAction, type NavigationResult} from './navigate.js';

/**
 * Shift focus from the currently focused node to its parent. If there is no parent, or rather if
 * the parent is the tree root, this returns a failure result.
 *
 * @category Internal
 */
export function exitOutOf(navTree: NavRootNode | undefined): NavigationResult<NavAction.Exit> {
    if (!navTree) {
        return {
            success: false,
            reason: 'no nav tree',
            direction: undefined,
            navAction: NavAction.Exit,
        };
    }

    const currentlyFocused = getCurrentlyFocused(navTree);

    if (!currentlyFocused) {
        return {
            success: false,
            reason: 'no focused node to exit out of',
            direction: undefined,
            navAction: NavAction.Exit,
        };
    }

    const newNode = currentlyFocused.nonGroupParent;

    if (newNode.isRoot) {
        return {
            success: false,
            reason: 'at top level nav already, nothing to exit to',
            direction: undefined,
            navAction: NavAction.Exit,
        };
    }

    focusElement(newNode.element);

    return {
        success: true,
        defaulted: false,
        wrapped: false,
        newElement: newNode.element,
        direction: undefined,
        navAction: NavAction.Exit,
    };
}
