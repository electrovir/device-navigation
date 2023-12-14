import {wrapNumber} from '@augment-vir/common';
import {assertDefined} from 'run-time-assertions';
import {NavNode, NavNodeParent, NavRootNode} from '../nav-tree/nav-tree';
import {greaterThan, lessThan} from '../util/comparisons';
import {Coords} from '../util/coords';
import {focusElement} from '../util/focus';
import {CurrentlyFocusedResult, getCurrentlyFocused} from './currently-focused';

/** All the possible nav directions. */
export enum NavDirection {
    Up = 'up',
    Down = 'down',
    Left = 'left',
    Right = 'right',
}

/** Data which describes the result of an attempted navigation action. */
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

/** Navigate around the nav tree. */
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
        const newNode = navTree.type === '1d' ? navTree.children[0] : navTree.children[0]?.[0];
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
        currentlyFocused,
    );

    const isWrappingValid = allowWrapping ? true : !requiresWrapping;

    if (nextNode?.element === currentlyFocused.node.element) {
        return {
            success: false,
            reason: 'no other nodes to navigate to',
        };
    } else if (nextNode && isWrappingValid) {
        focusElement(nextNode.element);
        return {
            success: true,
            defaulted: false,
            newElement: nextNode.element,
            wrapped: requiresWrapping,
        };
        /**
         * The below else if is an edge that technically cannot be triggered, given current logic.
         * However, it is an edge case nonetheless and thus is handled here.
         */
        /* c8 ignore next 5 */
    } else if (!nextNode) {
        return {
            success: false,
            reason: 'failed to find node to focus',
        };
    } else if (!isWrappingValid) {
        return {
            success: false,
            reason: 'not allowed to wrap',
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
    currentlyFocused: CurrentlyFocusedResult,
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
                      value: currentlyFocused.coords.y + increment,
                      min: 0,
                      max: parentNode.children.length - 1,
                  });
        const nextRow = parentNode.type === '2d' ? parentNode.children[nextY] : undefined;

        const nextCoords: Coords = {
            x:
                parentNode.type === '1d'
                    ? wrapNumber({
                          value: currentlyFocused.coords.x + increment,
                          min: 0,
                          max: parentNode.children.length - 1,
                      })
                    : /**
                       * Handles the case where the next row has fewer elements than the currently focused element's x
                       * index.
                       */
                      nextRow && currentlyFocused.coords.x >= nextRow.length
                      ? nextRow.length - 1
                      : currentlyFocused.coords.x,
            y: nextY,
        };

        const nextNode: NavNode | undefined =
            parentNode.type === '1d'
                ? parentNode.children[nextCoords.x]
                : parentNode.children[nextCoords.y]?.[nextCoords.x];

        const requiresWrapping =
            parentNode.type === '1d'
                ? wrapComparison(nextCoords.x, currentlyFocused.coords.x)
                : wrapComparison(nextCoords.y, currentlyFocused.coords.y);
        return {nextNode, requiresWrapping};
    } else {
        /** Horizontal */
        const wrapComparison = direction === NavDirection.Right ? lessThan : greaterThan;
        const increment = direction === NavDirection.Right ? 1 : -1;

        const currentRow =
            parentNode.type === '1d'
                ? parentNode.children
                : parentNode.children[currentlyFocused.coords.y];

        assertDefined(
            currentRow,
            `No current row found at y index: '${currentlyFocused.coords.y}'`,
        );

        const nextCoords: Coords = {
            x: wrapNumber({
                value: currentlyFocused.coords.x + increment,
                min: 0,
                max: currentRow.length - 1,
            }),
            y: currentlyFocused.coords.y,
        };

        const requiresWrapping = wrapComparison(nextCoords.x, currentlyFocused.coords.x);

        const nextNode: NavNode | undefined =
            parentNode.type === '1d'
                ? parentNode.children[nextCoords.x]
                : parentNode.children[nextCoords.y]?.[nextCoords.x];

        return {nextNode, requiresWrapping};
    }
}
