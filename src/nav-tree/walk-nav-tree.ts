import {check} from '@augment-vir/assert';
import {type Coords} from '../util/coords.js';
import {type NavNode, type NavNodeParent, type NavRootNode} from './nav-tree.js';

/**
 * Callback type for `walkNavTree`.
 *
 * @category Internal
 */
export type WalkNavTreeCallback = (
    ancestorChain: NavNodeParent[],
    currentNode: NavNode,
    childCoords: Coords,
) => boolean;

/**
 * Walk each node in the tree with a depth-first traversal. Walking stops if the callback returns
 * true.
 *
 * @category Internal
 */
export function walkNavTree(
    /** The tree to walk. */
    tree: NavRootNode | NavNode | undefined,
    /** The callback to call on each node. If this ever returns true, the walking stops. */
    callback: WalkNavTreeCallback,
): boolean {
    return walkRecursively([], tree, callback);
}

function walkRecursively(
    ancestorChain: NavNodeParent[],
    currentNode: NavRootNode | NavNode | undefined,
    callback: WalkNavTreeCallback,
): boolean {
    if (!currentNode || currentNode.type === 'child') {
        return false;
    } else if (currentNode.type === '1d') {
        return walk1d(currentNode.children, currentNode, 0, ancestorChain, callback);
    } else {
        return currentNode.children.some((row, yIndex) =>
            walk1d(row, currentNode, yIndex, ancestorChain, callback),
        );
    }
}

function walk1d(
    childArray: NavNode[],
    parent: NavRootNode | NavNodeParent,
    yIndex: number,
    ancestorChain: NavNodeParent[],
    callback: WalkNavTreeCallback,
): boolean {
    return childArray.some((child, xIndex): boolean => {
        const nextParentChain: NavNodeParent[] =
            check.hasKey(parent, 'isRoot') && parent.isRoot
                ? ancestorChain
                : [
                      parent,
                      ...ancestorChain,
                  ];

        const childCoords: Coords = {x: xIndex, y: yIndex};

        if (callback(nextParentChain, child, childCoords)) {
            return true;
        } else {
            return walkRecursively(nextParentChain, child, callback);
        }
    });
}
