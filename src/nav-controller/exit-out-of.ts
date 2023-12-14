import {typedHasProperty} from '@augment-vir/common';
import {NavRootNode} from '../nav-tree/nav-tree';
import {focusElement} from '../util/focus';
import {getCurrentlyFocused} from './currently-focused';
import {NavigationResult} from './navigate';

/**
 * Shift focus from the currently focused node to its parent. If there is no parent, or rather if
 * the parent is the tree root, this fails.
 */
export function exitOutOf(navTree: NavRootNode | undefined): NavigationResult {
    if (!navTree) {
        return {
            success: false,
            reason: 'no nav tree',
        };
    }

    const currentlyFocused = getCurrentlyFocused(navTree);

    if (!currentlyFocused) {
        return {
            success: false,
            reason: 'no focused node to exit out of',
        };
    }

    if (typedHasProperty(currentlyFocused.parent, 'isRoot')) {
        return {
            success: false,
            reason: 'at top level nav already, nothing to exit to',
        };
    }

    const newNode = currentlyFocused.parent;

    focusElement(newNode.element);

    return {
        success: true,
        defaulted: false,
        wrapped: false,
        newElement: newNode.element,
    };
}

(({}) as any as NavigationResult).success;
