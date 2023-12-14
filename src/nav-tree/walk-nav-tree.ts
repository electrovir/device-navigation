import {typedHasProperty} from '@augment-vir/common';
import {Coords} from '../util/coords';
import {NavNode, NavNodeParent, NavRootNode} from './nav-tree';

/** Callback type for `walkNavTree`. */
export type WalkNavTreeCallback = (
    currentParentChain: NavNodeParent[],
    currentNode: NavNode,
    childCoords: Coords,
) => boolean;

/**
 * Walk each node in the tree with a depth-first traversal. Walking stops if the callback returns
 * true.
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
    currentParentChain: NavNodeParent[],
    currentNode: NavRootNode | NavNode | undefined,
    callback: WalkNavTreeCallback,
): boolean {
    if (!currentNode || currentNode.type === 'child') {
        return false;
    } else if (currentNode.type === '1d') {
        return walk1d(currentNode.children, currentNode, 0, currentParentChain, callback);
    } else {
        return currentNode.children.some((row, yIndex) =>
            walk1d(row, currentNode, yIndex, currentParentChain, callback),
        );
    }
}

function walk1d(
    childArray: NavNode[],
    parent: NavRootNode | NavNodeParent,
    yIndex: number,
    currentParentChain: NavNodeParent[],
    callback: WalkNavTreeCallback,
): boolean {
    return childArray.some((child, xIndex): boolean => {
        const nextParentChain: NavNodeParent[] = typedHasProperty(parent, 'isRoot')
            ? currentParentChain
            : currentParentChain.concat(parent);

        const childCoords: Coords = {x: xIndex, y: yIndex};

        if (callback(nextParentChain, child, childCoords)) {
            return true;
        } else {
            return walkRecursively(nextParentChain, child, callback);
        }
    });
}
