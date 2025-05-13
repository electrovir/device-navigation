import {type CurrentNavEntry} from '../directives/nav-entry.js';
import {type NavTree} from '../nav-tree/nav-tree.js';
import {findNavTreeNodeByNavEntry} from '../nav-tree/walk-nav-tree.js';
import {focusElement} from '../util/focus.js';
import {NavAction, type NavigationResult} from './navigate.js';

/**
 * Shift focus from the currently focused node to its parent. If there is no parent, or rather if
 * the parent is the tree root, this returns a failure result.
 *
 * @category Internal
 */
export function exitOutOf(
    navTree: Readonly<NavTree>,
    currentlyFocused: Readonly<CurrentNavEntry> | undefined,
): NavigationResult<NavAction.Exit> {
    if (!currentlyFocused) {
        return {
            success: false,
            reason: 'no focused node to exit out of',
            direction: undefined,
            navAction: NavAction.Exit,
        };
    }

    const closestGroupAncestor = currentlyFocused.position.ancestorChain
        .toReversed()
        .find((ancestor) => !ancestor.node.root && !ancestor.node.navEntry.navParams.group)?.node;

    if (!closestGroupAncestor || closestGroupAncestor.root) {
        return {
            success: false,
            reason: 'failed to find ancestor, nothing to exit to',
            direction: undefined,
            navAction: NavAction.Exit,
        };
    }

    const {nodeCoords} = findNavTreeNodeByNavEntry(navTree, closestGroupAncestor.navEntry);

    focusElement(closestGroupAncestor.element);

    return {
        success: true,
        defaulted: false,
        wrapped: false,
        newElement: closestGroupAncestor.element,
        direction: undefined,
        navAction: NavAction.Exit,
        coords: nodeCoords,
    };
}
