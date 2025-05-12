import {type NavRootNode} from '../nav-tree/nav-tree.js';
import {focusElement} from '../util/focus.js';
import {getCurrentlyFocused} from './currently-focused.js';
import {NavAction, type NavigationResult} from './navigate.js';

/**
 * Enter into the currently focused node's children. Focuses the first child. Fails if there are no
 * children to focus.
 *
 * @category Internal
 */
export function enterInto(navTree: NavRootNode | undefined): NavigationResult<NavAction.Enter> {
    if (!navTree) {
        return {
            success: false,
            reason: 'no nav tree',
            direction: undefined,
            navAction: NavAction.Enter,
        };
    }

    const currentlyFocused = getCurrentlyFocused(navTree);

    if (!currentlyFocused) {
        return {
            success: false,
            reason: 'no focused node to enter into',
            direction: undefined,
            navAction: NavAction.Enter,
        };
    }

    if (currentlyFocused.node.type === 'child' || !currentlyFocused.node.children.length) {
        return {
            success: false,
            reason: 'no children to enter into',
            direction: undefined,
            navAction: NavAction.Enter,
        };
    }

    const newNode =
        currentlyFocused.node.type === '1d'
            ? currentlyFocused.node.children[0]
            : currentlyFocused.node.children[0]?.[0];

    if (!newNode) {
        return {
            success: false,
            reason: 'failed to find first child to enter into',
            direction: undefined,
            navAction: NavAction.Enter,
        };
    }

    focusElement(newNode.element);

    return {
        success: true,
        defaulted: false,
        wrapped: false,
        newElement: newNode.element,
        direction: undefined,
        navAction: NavAction.Enter,
    };
}
