import {assert, check} from '@augment-vir/assert';
import {wrapNumber} from '@augment-vir/common';
import {type NavNode, type NavNodeParent, type NavRootNode} from '../nav-tree/nav-tree.js';
import {greaterThan, lessThan} from '../util/comparisons.js';
import {type Coords} from '../util/coords.js';
import {focusElement} from '../util/focus.js';
import {type CurrentlyFocusedResult, getCurrentlyFocused} from './currently-focused.js';

/**
 * Inputs for controlling navigation.
 *
 * @category Internal
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
 * @category Internal
 */
export enum NavDirection {
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
}

/**
 * All possible nav actions.
 *
 * @category Internal
 */
export enum NavAction {
    Enter = 'enter',
    Exit = 'exit',

    Navigate = 'navigate',
    Pibling = 'pibling',
}

/**
 * Maps NavAction to the relevant {@link NavDirection} type for the `direction` property in
 * {@link NavigationResult}.
 *
 * @category Internal
 */
export type NavActionToDirectionType = {
    [NavAction.Enter]: undefined;
    [NavAction.Exit]: undefined;

    [NavAction.Navigate]: NavDirection;
    [NavAction.Pibling]: NavDirection;
};

/**
 * Data which describes the result of an attempted navigation action.
 *
 * @category Internal
 */
export type NavigationResult<Action extends NavAction = NavAction> = (
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
      }
) & {
    navAction: Action;
    direction: NavActionToDirectionType[Action];
};

/**
 * Finds the default node to select within the given node.
 *
 * @category Internal
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
 * @category Internal
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
): NavigationResult<NavAction.Navigate> {
    if (!navTree) {
        return {success: false, reason: 'no nav tree', direction, navAction: NavAction.Navigate};
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
                direction,
                navAction: NavAction.Navigate,
            };
            /**
             * The below else if is an edge that technically cannot be triggered, given current
             * logic. However, it is an edge case nonetheless and thus is handled here.
             */
            /* node:coverage ignore next 9 */
        } else {
            /** Nothing we can do, we found no nav nodes to focus. */
            return {
                success: false,
                reason: 'no default element to focus',
                direction,
                navAction: NavAction.Navigate,
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
            direction,
            navAction: NavAction.Navigate,
        };
    } else if (!nextNode) {
        return {
            success: false,
            reason: 'failed to find node to focus',
            direction,
            navAction: NavAction.Navigate,
        };
        /* node:coverage ignore next 7 */
    } else if (isWrappingValid) {
        return {
            success: false,
            reason: 'no conditions matched',
            direction,
            navAction: NavAction.Navigate,
        };
    } else {
        return {
            success: false,
            reason: 'wrapping blocked',
            direction,
            navAction: NavAction.Navigate,
        };
        /**
         * The below else is an edge cause that cannot be triggered, given the above logic. However,
         * it must exist for type guarding purposes.
         */
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
                : wrapNumber(currentNode.coords.y + increment, {
                      min: 0,
                      max: parentNode.children.length - 1,
                  });
        const nextRow = parentNode.type === '2d' ? parentNode.children[nextY] : undefined;

        const nextCoords: Coords = {
            x:
                parentNode.type === '1d'
                    ? wrapNumber(currentNode.coords.x + increment, {
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

        assert.isDefined(currentRow, `No current row found at y index: '${currentNode.coords.y}'`);

        const nextCoords: Coords = {
            x: wrapNumber(currentNode.coords.x + increment, {min: 0, max: currentRow.length - 1}),
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
 * @category Internal
 */
export function navigatePibling(
    navTree: NavRootNode,
    currentlyFocused: CurrentlyFocusedResult,
    direction: NavDirection,
    allowWrapping: boolean,
): NavigationResult<NavAction.Pibling> {
    const grandparent = check.isLengthAtLeast(currentlyFocused.ancestors, 2)
        ? currentlyFocused.ancestors[1]
        : navTree;
    const parent = currentlyFocused.ancestors[0];

    if (!parent) {
        return {
            success: false,
            reason: 'no parent to find a pibling from',
            direction,
            navAction: NavAction.Pibling,
        };
    }

    const {nextNode, requiresWrapping} = calculateNextNode(grandparent, direction, parent);

    const nodeToFocus = nextNode?.isGroup ? findDefaultChild(nextNode) : nextNode;

    const isWrappingValid = allowWrapping ? true : !requiresWrapping;

    if (!nodeToFocus) {
        return {
            success: false,
            reason: 'no node to navigate to',
            direction,
            navAction: NavAction.Pibling,
        };
    } else if (isWrappingValid) {
        focusElement(nodeToFocus.element);
        return {
            success: true,
            defaulted: false,
            newElement: nodeToFocus.element,
            wrapped: requiresWrapping,
            direction,
            navAction: NavAction.Pibling,
        };
    } else {
        return {
            success: false,
            reason: 'wrapping blocked',
            direction,
            navAction: NavAction.Pibling,
        };
    }
}
