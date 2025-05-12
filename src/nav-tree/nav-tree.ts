import {assert, check} from '@augment-vir/assert';
import {getDirectChildren} from '@augment-vir/web';
import {navAttribute} from '../directives/nav-entry.js';
import {type Coords} from '../util/coords.js';

/**
 * Shared properties for each NavNode.
 *
 * @category Internal
 */
export type SharedNavProperties = {
    element: HTMLElement;
    coords: Coords;
    isRoot?: false;
};

/**
 * Nav node for 1 dimensional navigation.
 *
 * @category Internal
 */
export type NavNode1d = SharedNavProperties & {
    children: NavNode[];
    type: '1d';
    isGroup: boolean;
};
/**
 * Nav node for 2 dimensional navigation.
 *
 * @category Internal
 */
export type NavNode2d = SharedNavProperties & {
    children: NavNode[][];
    type: '2d';
    isGroup: boolean;
};
/**
 * Leaf nav node with no children.
 *
 * @category Internal
 */
export type NavNodeChild = SharedNavProperties & {
    isGroup: false;
    type: 'child';
};

/**
 * Any non-root nav node that has children.
 *
 * @category Internal
 */
export type NavNodeParent = NavNode1d | NavNode2d;
/**
 * Any non-root nav node.
 *
 * @category Internal
 */
export type NavNode = NavNodeParent | NavNodeChild;
/**
 * Nav nodes at the root of the tree. Their only difference is that they have no associated element.
 *
 * @category Internal
 */
export type NavRootNode =
    | {children: NavNode[]; type: '1d'; isRoot: true; isGroup: false}
    | {children: NavNode[][]; type: '2d'; isRoot: true; isGroup: false};

/**
 * Intermediate node used for building the nav tree.
 *
 * @category Internal
 */
export type BuildingTreeNavNode = {
    element: HTMLElement;
    children: BuildingTreeNavNode[];
    navValue: Readonly<NavParams>;
};

/**
 * Generates intermediate `BuildingTreeNavNode` nodes that finds all children of the given
 * `rootElement` which are marked for navigation. The output of this is later used to build the full
 * nav tree.
 *
 * @category Internal
 */
export function getNavChildren(
    /** The HTML element from which to search for nav children. */
    rootElement: HTMLElement,
): BuildingTreeNavNode[] {
    const childNodes: BuildingTreeNavNode[] = [];

    getDirectChildren(rootElement).forEach((childElement) => {
        /** Idk how to create children that are not HTMLElements. */
        /* node:coverage ignore next 3 */
        if (!(childElement instanceof HTMLElement)) {
            return;
        }

        const descendants = getNavChildren(childElement);

        const navValue = childElement.hasAttribute(navAttribute.name);

        if (!navValue) {
            childNodes.push(...descendants);
            return;
        }

        childNodes.push({
            children: descendants,
            element: childElement,
            navValue,
        });
    });

    return childNodes;
}

/**
 * Builds a full nav tree from the given HTML element, or nothing if there are no nav elements
 * within the given element.
 *
 * @category Internal
 */
export function buildNavTree(rootElement: HTMLElement): NavRootNode | undefined {
    const nodes = getNavChildren(rootElement);

    return convertTree(nodes);
}

/**
 * Converts an array of {@link BuildingTreeNavNode} to a tree.
 *
 * @category Internal
 */
export function convertTree(nodes: BuildingTreeNavNode[]): NavRootNode | undefined {
    if (!check.isLengthAtLeast(nodes, 1)) {
        return undefined;
    }

    const navRoot: NavRootNode = {
        /** All children must have the same type, so we'll just use the first child to set the type. */
        type: nodes[0].navValue.type,
        children: [],
        isRoot: true,
        isGroup: false,
    };

    nodes.forEach((node) => {
        const grandchildrenTree = node.children.length ? convertTree(node.children) : undefined;

        if (node.navValue.isGroup && !grandchildrenTree) {
            const error = new Error('group nav has no children');
            console.error(error, node);
            throw error;
        }

        const coords = calculateChildCoords(node, navRoot.children);

        const childTreeNode: NavNode = grandchildrenTree
            ? ({
                  element: node.element,
                  children: grandchildrenTree.children,
                  type: grandchildrenTree.type,
                  isGroup: node.navValue.isGroup,
                  coords,
              } as NavNodeParent)
            : {
                  element: node.element,
                  type: 'child',
                  coords,
                  isGroup: false,
              };

        if (node.navValue.type === '2d' && navRoot.type === '2d') {
            if (!navRoot.children[coords.y]) {
                navRoot.children[coords.y] = [];
            }
            const yArray = navRoot.children[coords.y];
            assert.isDefined(yArray);

            if (yArray[coords.x]) {
                throw new Error(`Parent already has child at ${coords.x},${coords.y}`);
            }

            yArray[coords.x] = childTreeNode;
        } else if (node.navValue.type === '1d' && navRoot.type === '1d') {
            // edge case
            /* node:coverage ignore next 3 */
            if (navRoot.children[coords.x]) {
                throw new Error(`Parent already has child at ${coords.x},${coords.y}`);
            }
            navRoot.children[coords.x] = childTreeNode;
        } else if (navRoot.type !== node.navValue.type) {
            const error = new Error('inconsistent nav dimensionality');
            console.error(error, node);
            throw error;
        }
    });

    return navRoot;
}

/**
 * Calculate a node's coords. The 1d coords are determined by looking at how many children have
 * already been handled. The 2d coords are simply taken from the 2d `nav(x,y)` directive's inputs.
 *
 * @category Internal
 */
export function calculateChildCoords(
    child: Pick<BuildingTreeNavNode, 'navValue'>,
    currentChildren: unknown[] | unknown[][],
): Coords {
    if (child.navValue.type === '2d') {
        return {
            x: child.navValue.xCord,
            y: child.navValue.yCord,
        };
    } else if (child.navValue.type === '1d') {
        return {
            x: currentChildren.length,
            y: 0,
        };
    } else {
        throw new Error(
            `Unexpected node nav type: '${(child as BuildingTreeNavNode).navValue.type}'`,
        );
    }
}
