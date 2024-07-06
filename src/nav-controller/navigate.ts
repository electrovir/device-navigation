import {isLengthAtLeast, wrapNumber} from '@augment-vir/common';
import {assertDefined} from 'run-time-assertions';
import {NavNode, NavNodeParent, NavRootNode} from '../nav-tree/nav-tree';
import {greaterThan, lessThan} from '../util/comparisons';
import {Coords} from '../util/coords';
import {focusElement} from '../util/focus';
import {CurrentlyFocusedResult, getCurrentlyFocused} from './currently-focused';

/**
 * Inputs for controlling navigation.
 *
 * @category Types
 */
export type NavigationInputs = {
    /**
     * The direction to navigate within the tree. Note that 1 dimensional navigation treads up and
     * left as the same, down and right as the same.
     */
    direction: NavDirection;
    /** Set to true to allow navigation to wrap. */
    allowWrapping: boolean;
};

/**
 * All the possible nav directions.
 *
 * @category Types
 */
export enum NavDirection {
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
}

/**
 * Data which describes the result of an attempted navigation action.
 *
 * @category Types
 */
export type NavigationResult =
    | {
          /** Indicates that the intended navigation succeeded or failed. */
          success: true;
          /** When true, indicates that the performed navigation resulted in a wrap. */
          wrapped: boolean;
          /**
           * When true, indicates that there was no valid starting point to start the navigation
           * from, so a default behavior was taken. Most navigation actions do not support this
           * behavior.
           */
          defaulted: boolean;
          /** The element that the performed navigation focused. */
          newElement: HTMLElement;
      }
    | {
          /** Indicates that the intended navigation succeeded or failed. */
          success: false;
          /** The reason why the intended navigation did not succeed. */
          reason: string;
      };

/**
 * Finds the default node to select within the given node.
 *
 * @category Internals
 */
export function findDefaultChild(node: Readonly<NavNodeParent | NavRootNode>) {
    const firstNode = node.type === '1d' ? node.children[0] : node.children[0]?.[0];

    if (!firstNode) {
        return undefined;
    } else if (firstNode.type === 'child') {
        return firstNode;
    } else if (firstNode.isGroup) {
        return findDefaultChild(firstNode);
    } else {
        return firstNode;
    }
}

/**
 * Navigate around the nav tree.
 *
 * @category Internals
 */
export function navigate(
    navTree: NavRootNode | undefined,
    /**
     * The direction to navigate within the tree. Note that 1 dimensional navigation treads up and
     * left as the same, down and right as the same.
     */
    direction: NavDirection,
    /** Set to true to allow navigation to wrap. */
    allowWrapping: boolean,
): NavigationResult {
    if (!navTree) {
        return {
            success: false,
            reason: 'no nav tree',
        };
    }

    const currentlyFocused = getCurrentlyFocused(navTree);

    /** If there is no currently focused nav node, try to focus the first node in the tree. */
    if (!currentlyFocused) {
        const newNode = findDefaultChild(navTree);
        if (newNode) {
            focusElement(newNode.element);
            return {
                success: true,
                wrapped: false,
                defaulted: true,
                newElement: newNode.element,
            };
            /**
             * The below else if is an edge that technically cannot be triggered, given current
             * logic. However, it is an edge case nonetheless and thus is handled here.
             */
            /* c8 ignore next 7 */
        } else {
            /** Nothing we can do, we found no nav nodes to focus. */
            return {
                success: false,
                reason: 'no default element to focus',
            };
        }
    }

    const {nextNode, requiresWrapping} = calculateNextNode(
        currentlyFocused.parent,
        direction,
        currentlyFocused.node,
    );

    const isWrappingValid = allowWrapping ? true : !requiresWrapping;

    if (nextNode && isWrappingValid) {
        focusElement(nextNode.element);
        return {
            success: true,
            defaulted: false,
            newElement: nextNode.element,
            wrapped: requiresWrapping,
        };
    } else if (!nextNode) {
        return {
            success: false,
            reason: 'failed to find node to focus',
        };
    } else if (!isWrappingValid) {
        return {
            success: false,
            reason: 'wrapping blocked',
        };
        /**
         * The below else is an edge cause that cannot be triggered, given the above logic. However,
         * it must exist for type guarding purposes.
         */
        /* c8 ignore next 6 */
    } else {
        return {
            success: false,
            reason: 'no conditions matched',
        };
    }
}

function calculateNextNode(
    parentNode: NavRootNode | NavNodeParent,
    direction: NavDirection,
    currentNode: NavNode,
) {
    const isVertical = direction === NavDirection.Down || direction === NavDirection.Up;

    if (isVertical) {
        /** Vertical */
        const wrapComparison = direction === NavDirection.Down ? lessThan : greaterThan;
        const increment = direction === NavDirection.Down ? 1 : -1;

        const nextY =
            parentNode.type === '1d'
                ? 0
                : wrapNumber({
                      value: currentNode.coords.y + increment,
                      min: 0,
                      max: parentNode.children.length - 1,
                  });
        const nextRow = parentNode.type === '2d' ? parentNode.children[nextY] : undefined;

        const nextCoords: Coords = {
            x:
                parentNode.type === '1d'
                    ? wrapNumber({
                          value: currentNode.coords.x + increment,
                          min: 0,
                          max: parentNode.children.length - 1,
                      })
                    : /**
                       * Handles the case where the next row has fewer elements than the currently focused element's x
                       * index.
                       */
                      nextRow && currentNode.coords.x >= nextRow.length
                      ? nextRow.length - 1
                      : currentNode.coords.x,
            y: nextY,
        };

        const nextNode: NavNode | undefined =
            parentNode.type === '1d'
                ? parentNode.children[nextCoords.x]
                : parentNode.children[nextCoords.y]?.[nextCoords.x];

        const requiresWrapping =
            parentNode.type === '1d'
                ? wrapComparison(nextCoords.x, currentNode.coords.x)
                : wrapComparison(nextCoords.y, currentNode.coords.y);

        return {
            nextNode: nextNode?.element === currentNode.element ? undefined : nextNode,
            requiresWrapping,
        };
    } else {
        /** Horizontal */
        const wrapComparison = direction === NavDirection.Right ? lessThan : greaterThan;
        const increment = direction === NavDirection.Right ? 1 : -1;

        const currentRow =
            parentNode.type === '1d'
                ? parentNode.children
                : parentNode.children[currentNode.coords.y];

        assertDefined(currentRow, `No current row found at y index: '${currentNode.coords.y}'`);

        const nextCoords: Coords = {
            x: wrapNumber({
                value: currentNode.coords.x + increment,
                min: 0,
                max: currentRow.length - 1,
            }),
            y: currentNode.coords.y,
        };

        const requiresWrapping = wrapComparison(nextCoords.x, currentNode.coords.x);

        const nextNode: NavNode | undefined =
            parentNode.type === '1d'
                ? parentNode.children[nextCoords.x]
                : parentNode.children[nextCoords.y]?.[nextCoords.x];

        return {
            nextNode: nextNode?.element === currentNode.element ? undefined : nextNode,
            requiresWrapping,
        };
    }
}

/**
 * Navigate only to piblings (siblings of parent).
 *
 * @category Internals
 */
export function navigatePibling(
    navTree: NavRootNode,
    currentlyFocused: CurrentlyFocusedResult,
    direction: NavDirection,
    allowWrapping: boolean,
): NavigationResult {
    const grandparent = isLengthAtLeast(currentlyFocused.ancestors, 2)
        ? currentlyFocused.ancestors[1]
        : navTree;
    const parent = currentlyFocused.ancestors[0];

    if (!parent) {
        return {
            success: false,
            reason: 'no parent to find a pibling from',
        };
    }

    const {nextNode, requiresWrapping} = calculateNextNode(grandparent, direction, parent);

    const nodeToFocus = nextNode?.isGroup ? findDefaultChild(nextNode) : nextNode;

    const isWrappingValid = allowWrapping ? true : !requiresWrapping;
    if (!nodeToFocus) {
        return {
            success: false,
            reason: 'no node to navigate to',
        };
    } else if (!isWrappingValid) {
        return {
            success: false,
            reason: 'wrapping blocked',
        };
    } else {
        focusElement(nodeToFocus.element);
        return {
            success: true,
            defaulted: false,
            newElement: nodeToFocus.element,
            wrapped: requiresWrapping,
        };
    }
}
