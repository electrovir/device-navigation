import {check} from '@augment-vir/assert';
import {createArray, getOrSet, type Overwrite} from '@augment-vir/common';
import {type ElementTree} from '@augment-vir/web';
import {extractNavEntry, type NavEntry} from '../directives/nav-entry.js';

/**
 * Internal root of the nav tree.
 *
 * @category Internal
 */
export type NavTree = {
    root: true;
    children: NavTreeNode[][];
};

/**
 * Internal node of the nav tree.
 *
 * @category Internal
 */
export type NavTreeNode = {
    root: false;
    element: HTMLElement;
    navEntry: NavEntry;
    children: NavTreeNode[][];
};

/**
 * Maps an `ElementTree` to a {@link NavTree}.
 *
 * @category Internal
 */
export function mapTree(elementTree: ElementTree): NavTree {
    const children =
        (mapTreeRecursively(elementTree)?.children satisfies
            | IntermediateNavTreeNode[][]
            | undefined as NavTreeNode[][] | undefined) || [];

    return {
        root: true,
        children,
    };
}

type IntermediateNavTreeNode = Overwrite<
    NavTreeNode,
    {
        navEntry: NavEntry | undefined;
        children: IntermediateNavTreeNode[][];
    }
>;

function mapTreeRecursively(elementTree: ElementTree): IntermediateNavTreeNode | undefined {
    const element = elementTree.element;
    if (!(element instanceof HTMLElement)) {
        return undefined;
    }

    const navEntry = extractNavEntry(element);
    const children = expandChildren(elementTree);

    const isValidGroup: boolean = navEntry?.navParams.group ? !!children.length : false;

    if (isValidGroup || !!children.length || !!navEntry) {
        return {
            root: false,
            element,
            navEntry,
            children,
        };
    } else {
        return undefined;
    }
}

function expandChildren(elementTreeNode: ElementTree): IntermediateNavTreeNode[][] {
    const rawChildren: {
        withX: {x: number; node: IntermediateNavTreeNode}[];
        noX: IntermediateNavTreeNode[];
        y: number;
    }[] = [];

    function pushNode(node: IntermediateNavTreeNode) {
        if (node.navEntry?.navParams.group && !node.children.length) {
            return;
        } else if (!node.navEntry) {
            /**
             * A wide entry occupies multiple slots in its already-expanded children, so dedupe
             * repeated references to avoid pushing (and re-expanding) the same entry many times.
             */
            const pushed = new Set<IntermediateNavTreeNode>();
            node.children.forEach((row) => {
                return row.forEach((child) => {
                    if (!pushed.has(child)) {
                        pushed.add(child);
                        pushNode(child);
                    }
                });
            });
            return;
        }

        const x = node.navEntry.navParams.x;
        const y = node.navEntry.navParams.y || 0;
        const row = getOrSet(rawChildren, y, () => {
            return {
                noX: [],
                withX: [],
                y,
            };
        });

        if (x == undefined) {
            row.noX.push(node);
        } else {
            row.withX.push({
                x,
                node,
            });
        }
    }

    elementTreeNode.children.forEach((child) => {
        const newNode = mapTreeRecursively(child);
        if (newNode) {
            pushNode(newNode);
        }
    });

    // eslint-disable-next-line sonarjs/no-misleading-array-reverse
    return rawChildren
        .sort((rowA, rowB) => {
            return rowA.y - rowB.y;
        })
        .map((row) => {
            row.withX.sort((a, b) => {
                return a.x - b.x;
            });

            row.withX.forEach(({x, node}) => {
                const width = node.navEntry?.navParams.width || 1;

                /** Fill every x slot the entry spans so vertical nav into it works at any column. */
                createArray(width, (offset) => x + offset).forEach((slot) => {
                    if (row.noX[slot]) {
                        row.noX.splice(slot, 0, node);
                    } else {
                        row.noX[slot] = node;
                    }
                });
            });

            return row.noX;
        })
        .filter((row) => row.some(check.isTruthy));
}
