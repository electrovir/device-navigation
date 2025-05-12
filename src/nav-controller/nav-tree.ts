import {type ElementTree} from '@augment-vir/web';
import {type NavEntry, extractNavEntry, navAttribute, NavValue} from '../directives/nav-entry.js';

export type NavTreeNode = {
    element: HTMLElement;
    navEntry: NavEntry | undefined;
    isGroup: boolean;
    children: NavTreeNode[];
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
    const isGroup = navAttributeValue === NavValue.Group;

    const currentNode: NavTreeNode = {
        element,
        navEntry,
        isGroup,
        children: [],
        parent,
    };

    currentNode.children = expandChildren(elementTree, currentNode);

    const isValidGroup: boolean = isGroup ? !!currentNode.children.length : false;
    const hasNav: boolean =
        hasNestedNav || isValidGroup || !!currentNode.children.length || !!navEntry;

    if (hasNav) {
        return currentNode;
    } else {
        return undefined;
    }
}

function expandChildren(elementTreeNode: ElementTree, parentNode: NavTreeNode): NavTreeNode[] {
    const children: NavTreeNode[] = [];

    elementTreeNode.children.forEach((child) => {
        const newNode = mapTree(child, parentNode);
        if (newNode) {
            if (newNode.navEntry || newNode.isGroup) {
                children.push(newNode);
            }
            if (!newNode.isGroup) {
                children.push(...newNode.children);
                newNode.children = [];
            }
        }
    });

    return children;
}
