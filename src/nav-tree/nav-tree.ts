import {getDirectChildren} from '@augment-vir/browser';
import {ParsedNavValue, parseNavValueString} from '../directives/nav-value';
import {navAttribute} from '../directives/nav.directive';

/** Nav node for 1 dimensional navigation. */
export type NavNode1d = {element: HTMLElement; children: NavNode[]; type: '1d'};
/** Nav node for 2 dimensional navigation. */
export type NavNode2d = {element: HTMLElement; children: NavNode[][]; type: '2d'};
/** Leaf nav node with no children. */
export type NavNodeChild = {element: HTMLElement; type: 'child'};

/** Any non-root nav node that has children. */
export type NavNodeParent = NavNode1d | NavNode2d;
/** Any non-root nav node. */
export type NavNode = NavNodeParent | NavNodeChild;
/** Nav nodes at the root of the tree. Their only difference is that they have no associated element. */
export type NavRootNode =
    | {children: NavNode[]; type: '1d'; isRoot: true}
    | {children: NavNode[][]; type: '2d'; isRoot: true};

/** Intermediate node used for building the nav tree. */
export type BuildingTreeNavNode = {
    element: HTMLElement;
    children: BuildingTreeNavNode[];
    navValue: ParsedNavValue;
};

/**
 * Generates intermediate `BuildingTreeNavNode` nodes that finds all children of the given
 * `rootElement` which are marked for navigation. The output of this is later used to build the full
 * nav tree.
 */
export function getNavChildren(
    /** The HTML element from which to search for nav children. */
    rootElement: HTMLElement,
): BuildingTreeNavNode[] {
    const childNodes: BuildingTreeNavNode[] = [];

    getDirectChildren(rootElement).forEach((childElement) => {
        if (!(childElement instanceof HTMLElement)) {
            return;
        }

        const ancestors = getNavChildren(childElement);
        const navValue = childElement.hasAttribute(navAttribute.name)
            ? parseNavValueString(childElement.getAttribute(navAttribute.name) || '')
            : undefined;

        if (!navValue) {
            childNodes.push(...ancestors);
            return;
        }

        childNodes.push({
            children: ancestors,
            element: childElement,
            navValue,
        });
    });

    return childNodes;
}

/**
 * Builds a full nav tree from the given HTML element, or nothing if there are no nav elements
 * within the given element.
 */
export function buildNavTree(rootElement: HTMLElement): NavRootNode | undefined {
    const children = getNavChildren(rootElement);

    return buildTreeInternals(children);
}

function buildTreeInternals(nodes: BuildingTreeNavNode[]): NavRootNode | undefined {
    if (!nodes.length) {
        return undefined;
    }
    const rootType = nodes[0]?.navValue.type;

    if (!rootType) {
        throw new Error('Found no nav type from first nav element.');
    }

    const navRoot: NavRootNode = {
        type: rootType,
        children: [],
        isRoot: true,
    };

    nodes.forEach((childNode) => {
        const childTree = childNode.children.length
            ? buildTreeInternals(childNode.children)
            : undefined;

        const newChildNode: NavNode = childTree
            ? ({
                  element: childNode.element,
                  children: childTree.children,
                  type: childTree.type,
              } as NavNode)
            : {element: childNode.element, type: 'child'};

        if (childNode.navValue.type === '2d' && navRoot.type === '2d') {
            if (!navRoot.children[childNode.navValue.xCord]) {
                navRoot.children[childNode.navValue.xCord] = [];
            }
            const xArray = navRoot.children[childNode.navValue.xCord]!;

            if (xArray[childNode.navValue.yCord]) {
                throw new Error(
                    `Parent already has child at ${childNode.navValue.xCord},${childNode.navValue.yCord}`,
                );
            }

            xArray[childNode.navValue.yCord] = newChildNode;
        } else if (childNode.navValue.type === '1d' && navRoot.type === '1d') {
            navRoot.children.push(newChildNode);
        } else if (rootType !== childNode.navValue.type) {
            const error = new Error('child nav does not match parent nav type');
            console.error(error, childNode);
            throw error;
        } else {
            throw new Error(
                `Unhandled nav types: '${childNode.navValue.type}' and '${navRoot.type}'`,
            );
        }
    });

    return navRoot;
}
