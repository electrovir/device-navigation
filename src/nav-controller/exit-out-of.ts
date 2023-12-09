import {typedHasProperty} from '@augment-vir/common';
import {buildNavTree} from '../nav-tree/nav-tree';
import {getCurrentlyFocused} from './currently-focused';
import {NavigationResult} from './navigate';

/**
 * Shift focus from the currently focused node to its parent. If there is no parent, or rather if
 * the parent is the tree root, this fails.
 */
export function exitOutOf(rootElement: HTMLElement): NavigationResult {
    const navTree = buildNavTree(rootElement);
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
            reason: 'no focused node to enter into',
        };
    }

    if (typedHasProperty(currentlyFocused.parent, 'isRoot')) {
        return {
            success: false,
            reason: 'at root already, nothing to exit to',
        };
    }

    const newNode = currentlyFocused.parent;

    newNode.element.focus();

    return {
        success: true,
        defaulted: false,
        wrapped: false,
        newElement: newNode.element,
    };
}

(({}) as any as NavigationResult).success;
