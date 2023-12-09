import {buildNavTree} from '../nav-tree/nav-tree';
import {getCurrentlyFocused} from './currently-focused';
import {NavigationResult} from './navigate';

/**
 * Enter into the currently focused node's children. Focuses the first child. Fails if there are no
 * children to focus.
 */
export function enterInto(rootElement: HTMLElement): NavigationResult {
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

    if (currentlyFocused.node.type === 'child' || !currentlyFocused.node.children.length) {
        return {
            success: false,
            reason: 'no children to enter into',
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
        };
    }

    newNode.element.focus();

    return {
        success: true,
        defaulted: false,
        wrapped: false,
        newElement: newNode.element,
    };
}
