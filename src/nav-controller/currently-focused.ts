import {NavNode, NavNodeParent, NavRootNode} from '../nav-tree/nav-tree';
import {walkNavTree} from '../nav-tree/walk-nav-tree';
import {Coords} from '../util/coords';

/** Data associated with the currently focused node or element. Used for navigation purposes. */
export type CurrentlyFocusedResult = {
    /** The immediate parent `NavNode` of the currently focused `NavNode`. */
    parent: NavNodeParent | NavRootNode;
    /** The currently focused `NavNode`. */
    node: NavNode;
    /**
     * The coordinates of the currently focused `NavNode` within its parent's children. Note that
     * for 1 dimensional navigation, the y index will always be 0.
     */
    coords: Coords;
};

/**
 * Find the currently focused element / node from within the given nav tree. This does not accept an
 * HTMLElement input because it is used with other navigation actions that already build the nav
 * tree from the root HTMLElement.
 */
export function getCurrentlyFocused(
    navTree: NavRootNode | undefined,
): CurrentlyFocusedResult | undefined {
    if (!navTree) {
        return undefined;
    }

    let parents: NavNodeParent[] | undefined;
    let node: NavNode | undefined;
    let coords: Coords | undefined;
    walkNavTree(navTree, (parentChain, currentNode, currentCoords) => {
        if (currentNode.element.matches(':focus')) {
            parents = parentChain;
            node = currentNode;
            coords = currentCoords;
            return true;
        }

        return false;
    });

    const parent = parents ? parents?.slice(-1)[0] || navTree : undefined;

    if (!node || !parent || !coords) {
        return undefined;
    }

    return {
        node,
        parent,
        coords,
    };
}
