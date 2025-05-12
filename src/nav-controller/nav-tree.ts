import {getOrSet} from '@augment-vir/common';
import {type ElementTree} from '@augment-vir/web';
import {type NavEntry, extractNavEntry, navAttribute, NavValue} from '../directives/nav-entry.js';

export type NavTreeNode = {
    element: HTMLElement;
    navEntry: NavEntry | undefined;
    children: NavTreeNode[][];
    parent: NavTreeNode | undefined;
};

export function mapTree(
    elementTree: ElementTree,
    parent: NavTreeNode | undefined,
): NavTreeNode | undefined {
    const element = elementTree.element;
    if (!(element instanceof HTMLElement)) {
        return undefined;
    }

    const navAttributeValue = element.getAttribute(navAttribute.name);

    if (navAttributeValue === NavValue.Disabled) {
        return undefined;
    }

    const navEntry = extractNavEntry(element);

    const hasNestedNav = false as boolean;

    const currentNode: NavTreeNode = {
        element,
        navEntry,
        children: [],
        parent,
    };

    currentNode.children = expandChildren(elementTree, currentNode);

    const isValidGroup: boolean = navEntry?.navParams.group ? !!currentNode.children.length : false;
    const hasNav: boolean =
        hasNestedNav || isValidGroup || !!currentNode.children.length || !!navEntry;

    if (hasNav) {
        return currentNode;
    } else {
        return undefined;
    }
}

function expandChildren(elementTreeNode: ElementTree, parentNode: NavTreeNode): NavTreeNode[][] {
    const children: NavTreeNode[][] = [];

    function pushNode(node: NavTreeNode) {
        if (node.navEntry?.navParams.group && !node.children.length) {
            return;
        } else if (!node.navEntry) {
            node.children.forEach((row) => row.forEach((child) => pushNode(child)));
            return;
        }

        const x = node.navEntry.navParams.x;
        const y = node.navEntry.navParams.y || 0;
        const row = getOrSet(children, y, () => []);
        if (x == undefined) {
            row.push(node);
        } else {
            row[x] = node;
        }
    }

    elementTreeNode.children.forEach((child) => {
        const newNode = mapTree(child, parentNode);
        if (newNode) {
            pushNode(newNode);
        }
    });

    return children;
}
