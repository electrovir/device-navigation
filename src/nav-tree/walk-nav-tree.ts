import {type NavEntry} from '../directives/nav-entry.js';
import {type Coords} from '../util/coords.js';
import {type NavTree, type NavTreeNode} from './nav-tree.js';

/**
 * Callback type for `walkNavTree`.
 *
 * @category Internal
 */
export type WalkNavTreeCallback = (params: WalkResult) => boolean;

export type WalkResult = {
    ancestorChain: ReadonlyArray<WalkResult>;
    node: Readonly<NavTreeNode | NavTree>;
    nodeCoords: Readonly<Coords>;
};

/**
 * Walk each node in the tree with a depth-first traversal. Walking stops if the callback returns
 * true.
 *
 * @category Internal
 * @returns The nav tree node that the callback returned `true` on, if any. Otherwise, `undefined`.
 */
export function walkNavTree(
    /** The tree to walk. */
    tree: NavTree,
    /** The callback to call on each node. If this returns `true`, the walking stops. */
    callback: WalkNavTreeCallback,
): WalkResult | undefined {
    return walkRecursively(
        [
            {
                ancestorChain: [],
                node: tree,
                nodeCoords: {
                    x: 0,
                    y: 0,
                },
            },
        ],
        tree.children,
        callback,
    );
}

function walkRecursively(
    ancestorChain: WalkResult['ancestorChain'],
    children: NavTreeNode[][],
    callback: WalkNavTreeCallback,
): WalkResult | undefined {
    // eslint-disable-next-line unicorn/no-for-loop
    for (let y = 0; y < children.length; y++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const row = children[y]!;

        // eslint-disable-next-line unicorn/no-for-loop
        for (let x = 0; x < row.length; x++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const node = row[x]!;
            const walkResult: WalkResult = {
                ancestorChain,
                nodeCoords: {x, y},
                node,
            };
            if (callback(walkResult)) {
                return walkResult;
            }
            const result = walkRecursively(
                ancestorChain.concat(walkResult),
                node.children,
                callback,
            );
            if (result) {
                return result;
            }
        }
    }

    return undefined;
}

export function findNavTreeNodeByNavEntry(
    navTree: Readonly<NavTree>,
    navEntry: Readonly<NavEntry>,
) {
    const walkResult = walkNavTree(navTree, ({node}) => {
        return !node.root && node.navEntry === navEntry;
    });

    if (!walkResult) {
        throw new Error(`Failed to find NavEntry in NavTree.`);
    }

    return walkResult;
}
