import {assert, assertWrap} from '@augment-vir/assert';
import {type Coords, log, wrapNumber} from '@augment-vir/common';
import {type CurrentNavEntry} from '../directives/nav-entry.js';
import {type NavTree, type NavTreeNode} from '../nav-tree/nav-tree.js';
import {type WalkResult} from '../nav-tree/walk-nav-tree.js';
import {greaterThan, lessThan} from '../util/comparisons.js';
import {focusElement} from '../util/focus.js';

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

    Activate = 'activate',
    Focus = 'focus',

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

    [NavAction.Activate]: undefined;
    [NavAction.Focus]: undefined;

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
          coords: Coords;
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
export function findDefaultChild(children: ReadonlyArray<ReadonlyArray<NavTreeNode>>):
    | {
          node: NavTreeNode;
          coords: Coords;
      }
    | undefined {
    const coords = {
        x: -1,
        y: -1,
    };

    let node: NavTreeNode | undefined;

    while (coords.y < children.length - 1 && !node) {
        coords.y++;
        const row = children[coords.y];
        while (row && coords.x < row.length - 1 && !node) {
            coords.x++;
            const cell = row[coords.x];
            if (cell) {
                if (cell.navEntry.navParams.group) {
                    const results = findDefaultChild(cell.children);
                    if (results) {
                        node = results.node;
                    }
                } else if (!cell.navEntry.navParams.disabled) {
                    node = cell;
                }
            }
        }
    }

    if (node) {
        return {
            node,
            coords,
        };
    } else {
        return undefined;
    }
}

/**
 * Navigate around the nav tree.
 *
 * @category Internal
 */
export function navigate(
    navTree: NavTree,
    currentlyFocused: CurrentNavEntry | undefined,
    /**
     * The direction to navigate within the tree. Note that 1 dimensional navigation treads up and
     * left as the same, down and right as the same.
     */
    direction: NavDirection,
    /** Set to true to allow navigation to wrap. */
    allowWrapping: boolean,
): NavigationResult<NavAction.Navigate> {
    /** If there is no currently focused nav node, try to focus the first node in the tree. */
    if (!currentlyFocused) {
        const defaulted = findDefaultChild(navTree.children);
        if (defaulted) {
            focusElement(defaulted.node.element);
            return {
                success: true,
                wrapped: false,
                defaulted: true,
                newElement: defaulted.node.element,
                coords: defaulted.coords,
                direction,
                navAction: NavAction.Navigate,
            };
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

    const {nextNode, requiresWrapping, coords} = calculateNextNode(
        currentlyFocused.position,
        direction,
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
            coords,
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

type CalculateNextNodeOutput = {
    nextNode: NavTreeNode | undefined;
    requiresWrapping: boolean;
    coords: Coords;
};

function calculateNextNode(
    treePosition: WalkResult,
    direction: NavDirection,
): CalculateNextNodeOutput {
    let isEnabled = false;
    let output: undefined | CalculateNextNodeOutput;
    let step = 1;
    const startTime = Date.now();
    while (!isEnabled || !output) {
        output = innerCalculateNextNode(treePosition, direction, step);
        isEnabled = !output.nextNode?.navEntry.navParams.disabled;
        step++;
        if (Date.now() - startTime > 1000) {
            log.warning('Failed to find next non-disabled node.');
            return output;
        }
    }
    return output;
}

function innerCalculateNextNode(
    treePosition: WalkResult,
    direction: NavDirection,
    /** Number of steps to take. Usually this should be just one. */
    step: number,
): CalculateNextNodeOutput {
    const parentNode = treePosition.ancestorChain[treePosition.ancestorChain.length - 1]?.node;
    assert.isDefined(parentNode, 'missing parent');
    const currentRow = assertWrap.isDefined(parentNode.children[treePosition.nodeCoords.y]);

    const isVertical =
        parentNode.children.length > 1 &&
        (direction === NavDirection.Down || direction === NavDirection.Up);

    const increment: number =
        direction === NavDirection.Down || direction === NavDirection.Right ? step : -1 * step;
    const wrapComparison = increment < 0 ? greaterThan : lessThan;

    const nextY = isVertical
        ? wrapNumber(treePosition.nodeCoords.y + increment, {
              min: 0,
              max: parentNode.children.length - 1,
              takeOverflow: true,
          })
        : treePosition.nodeCoords.y;

    const nextRow = assertWrap.isDefined(parentNode.children[nextY]);

    const nextX = isVertical
        ? treePosition.nodeCoords.x >= nextRow.length
            ? /**
               * Handles the case where the next row has fewer elements than the currently focused element's x
               * index.
               */
              nextRow.length - 1
            : treePosition.nodeCoords.x
        : wrapNumber(treePosition.nodeCoords.x + increment, {
              min: 0,
              max: currentRow.length - 1,
              takeOverflow: true,
          });

    const nextNode: NavTreeNode | undefined = parentNode.children[nextY]?.[nextX];

    const requiresWrapping = isVertical
        ? wrapComparison(nextY, treePosition.nodeCoords.y)
        : wrapComparison(nextX, treePosition.nodeCoords.x);

    return {
        nextNode,
        requiresWrapping,
        coords: {
            x: nextX,
            y: nextY,
        },
    };
}

/**
 * Navigate only to piblings (siblings of parent).
 *
 * @category Internal
 */
export function navigatePibling(
    currentlyFocused: Readonly<CurrentNavEntry>,
    direction: NavDirection,
    allowWrapping: boolean,
): NavigationResult<NavAction.Pibling> {
    const parent =
        currentlyFocused.position.ancestorChain[currentlyFocused.position.ancestorChain.length - 1];

    if (!parent) {
        return {
            success: false,
            reason: 'no parent to find a pibling from',
            direction,
            navAction: NavAction.Pibling,
        };
    }

    const {nextNode, requiresWrapping, coords} = calculateNextNode(parent, direction);

    const nodeToFocus = nextNode?.navEntry.navParams.group
        ? findDefaultChild(nextNode.children)
        : {node: nextNode, coords};

    const isWrappingValid = allowWrapping ? true : !requiresWrapping;

    if (!nodeToFocus || !nodeToFocus.node) {
        return {
            success: false,
            reason: 'no node to navigate to',
            direction,
            navAction: NavAction.Pibling,
        };
    } else if (isWrappingValid) {
        focusElement(nodeToFocus.node.element);
        return {
            success: true,
            defaulted: false,
            newElement: nodeToFocus.node.element,
            wrapped: requiresWrapping,
            coords: nodeToFocus.coords,
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
