import {isElementFocused} from '@augment-vir/web';
import {type NavNode, type NavNodeParent, type NavRootNode} from '../nav-tree/nav-tree.js';
import {walkNavTree} from '../nav-tree/walk-nav-tree.js';
import {type Coords} from '../util/coords.js';

/**
 * Find the first parent that is not a group.
 *
 * @category Internal
 */
export function getNonGroupParent(parents: NavNodeParent[]) {
    return parents.toReversed().find((parent) => !parent.isGroup);
}

/**
 * Data associated with the currently focused node or element. Used for navigation purposes.
 *
 * @category Internal
 */
export type CurrentlyFocusedResult = {
    /** The immediate parent `NavNode` of the currently focused `NavNode`. */
    parent: NavNodeParent | NavRootNode;
    /** All ancestors of the currently focused `NavNode`. */
    ancestors: NavNodeParent[];
    /** The closest ancestor that is not a group `NavNode. */
    nonGroupParent: NavNodeParent | NavRootNode;
    /** The currently focused `NavNode`. */
    node: NavNode;
};

/**
 * Find the currently focused element / node from within the given nav tree. This does not accept an
 * HTMLElement input because it is used with other navigation actions that already build the nav
 * tree from the root HTMLElement.
 *
 * @category Internal
 */
export function getCurrentlyFocused(
    navTree: NavRootNode | undefined,
): CurrentlyFocusedResult | undefined {
    if (!navTree) {
        return undefined;
    }

    let ancestors: NavNodeParent[] | undefined;
    let node: NavNode | undefined;
    let coords: Coords | undefined;
    walkNavTree(navTree, (ancestorChain, currentNode, currentCoords) => {
        if (isElementFocused(currentNode.element)) {
            ancestors = ancestorChain;
            node = currentNode;
            coords = currentCoords;
            return true;
        }

        return false;
    });

    const parent = ancestors ? ancestors[0] || navTree : undefined;
    const nonGroupParent = ancestors ? getNonGroupParent(ancestors) || navTree : undefined;

    if (!node || !parent || !coords || !nonGroupParent || !ancestors) {
        return undefined;
    }

    return {
        node,
        parent,
        nonGroupParent,
        ancestors,
    };
}
