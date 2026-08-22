import {assert, assertWrap} from '@augment-vir/assert';
import {type Coords, wrapNumber} from '@augment-vir/common';
import {type CurrentNavEntry, type NavEntry} from '../directives/nav-entry.js';
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
    /** The direction to navigate within the tree. */
    direction: NavDirection;
    /** Set to true to allow navigation to wrap. */
    allowWrapping: boolean;
    /**
     * Prevent a one-dimensional nav tree from using its available axis for perpendicular
     * navigation.
     *
     * @default false
     */
    blockPerpendicularNavigation?: boolean | undefined;
    /**
     * Skip target rows or columns when the current position is empty.
     *
     * When this is false, navigation selects the nearest enabled item in the target row or column.
     *
     * @default false
     */
    shouldSkipHoles?: boolean | undefined;
};

/** @category Internal */
export type NavigationPositionHistory = {
    lastXByRow: Map<number, NavigationHistoryPosition>;
    lastYByColumn: Map<number, NavigationHistoryPosition>;
};

/** @category Internal */
export type NavigationHistoryPosition = {
    entry: Readonly<NavEntry>;
    /** The coordinate, along the navigation axis, that this position was navigated away from. */
    origin: number;
    /** The perpendicular coordinate to return to when navigating back to the origin. */
    cursor: number;
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
export function navigate({
    navTree,
    currentlyFocused,
    direction,
    allowWrapping,
    shouldSkipHoles,
    blockPerpendicularNavigation,
    navigationPositionHistory,
}: Readonly<{
    navTree: NavTree;
    currentlyFocused: CurrentNavEntry | undefined;
    /** The direction to navigate within the tree. */
    direction: NavDirection;
    /** Set to true to allow navigation to wrap. */
    allowWrapping: boolean;
    /** Set to true to skip target rows or columns when the current position is empty. */
    shouldSkipHoles: boolean;
    /** Set to true to block perpendicular navigation in one-dimensional nav trees. */
    blockPerpendicularNavigation: boolean;
    navigationPositionHistory: Readonly<NavigationPositionHistory>;
}>): NavigationResult<NavAction.Navigate> {
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

    const {nextNode, requiresWrapping, coords, cursorCoords, isVertical} = calculateNextNode({
        treePosition: currentlyFocused.position,
        direction,
        shouldSkipHoles,
        blockPerpendicularNavigation,
        navigationPositionHistory,
    });

    const isWrappingValid = allowWrapping ? true : !requiresWrapping;

    if (nextNode && isWrappingValid) {
        focusElement(nextNode.element);
        recordHoleNavigation({
            navigationPositionHistory,
            coords,
            cursorCoords,
            isVertical,
            sourcePosition: currentlyFocused.position,
            targetNode: nextNode,
        });
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
    cursorCoords: Coords;
    isVertical: boolean;
};

function calculateNextNode({
    treePosition,
    direction,
    shouldSkipHoles,
    blockPerpendicularNavigation,
    navigationPositionHistory,
}: Readonly<{
    treePosition: WalkResult;
    direction: NavDirection;
    shouldSkipHoles: boolean;
    blockPerpendicularNavigation: boolean;
    navigationPositionHistory?: Readonly<NavigationPositionHistory> | undefined;
}>): CalculateNextNodeOutput {
    const parentNode = treePosition.ancestorChain[treePosition.ancestorChain.length - 1]?.node;
    /**
     * The entry being navigated away from. A multi-slot (wide) entry occupies several x slots, so
     * stepping into one of its own slots must be skipped to actually move off of it.
     */
    const sourceEntry = treePosition.node.root ? undefined : treePosition.node.navEntry;
    /**
     * Cap iteration at a full cycle through the relevant dimension so a row or column that only
     * contains the source entry (e.g. a single wide key) can't loop forever while skipping itself.
     */
    const maxSteps =
        Math.max(
            parentNode?.children.length ?? 0,
            getMaximumRowLength(parentNode?.children ?? []),
        ) + 1;

    let isValidTarget = false;
    let output: undefined | CalculateNextNodeOutput;
    let step = 1;
    while (!isValidTarget || !output) {
        output = innerCalculateNextNode({
            treePosition,
            direction,
            step,
            shouldSkipHoles,
            blockPerpendicularNavigation,
            navigationPositionHistory,
        });
        isValidTarget =
            !!output.nextNode &&
            !output.nextNode.navEntry.navParams.disabled &&
            output.nextNode.navEntry !== sourceEntry;
        step++;
        if (step > maxSteps) {
            return {
                nextNode: undefined,
                requiresWrapping: output.requiresWrapping,
                coords: output.coords,
                cursorCoords: output.cursorCoords,
                isVertical: output.isVertical,
            };
        }
    }
    return output;
}

function innerCalculateNextNode({
    treePosition,
    direction,
    step,
    shouldSkipHoles,
    blockPerpendicularNavigation,
    navigationPositionHistory,
}: Readonly<{
    treePosition: WalkResult;
    direction: NavDirection;
    step: number;
    shouldSkipHoles: boolean;
    blockPerpendicularNavigation: boolean;
    navigationPositionHistory?: Readonly<NavigationPositionHistory> | undefined;
}>): CalculateNextNodeOutput {
    const parentNode = treePosition.ancestorChain[treePosition.ancestorChain.length - 1]?.node;
    assert.isDefined(parentNode, 'missing parent');

    const isVerticalDirection = direction === NavDirection.Down || direction === NavDirection.Up;
    const isVertical =
        isVerticalDirection && (blockPerpendicularNavigation || parentNode.children.length > 1);

    const increment: number =
        direction === NavDirection.Down || direction === NavDirection.Right ? step : -1 * step;
    const wrapComparison = increment < 0 ? greaterThan : lessThan;

    const verticalTargetY = wrapNumber(treePosition.nodeCoords.y + increment, {
        min: 0,
        max: parentNode.children.length - 1,
        takeOverflow: true,
    });
    const horizontalTargetX = wrapNumber(treePosition.nodeCoords.x + increment, {
        min: 0,
        max: getMaximumRowLength(parentNode.children) - 1,
        takeOverflow: true,
    });
    const sourceEntry = treePosition.node.root ? undefined : treePosition.node.navEntry;
    const verticalSourceX =
        getRememberedCursor({
            history: navigationPositionHistory?.lastXByRow,
            key: treePosition.nodeCoords.y,
            origin: verticalTargetY,
            sourceEntry,
        }) ?? getVerticalSourceX(treePosition);
    const horizontalSourceY =
        getRememberedCursor({
            history: navigationPositionHistory?.lastYByColumn,
            key: treePosition.nodeCoords.x,
            origin: horizontalTargetX,
            sourceEntry,
        }) ?? treePosition.nodeCoords.y;

    const targetY = isVertical ? verticalTargetY : horizontalSourceY;
    const targetX = isVertical ? verticalSourceX : horizontalTargetX;
    const target = isVertical
        ? findNearestNode({
              nodes: assertWrap.isDefined(parentNode.children[targetY]),
              shouldSkipHoles,
              index: targetX,
          })
        : findNearestNode({
              nodes: parentNode.children.map((row) => row[targetX]),
              shouldSkipHoles,
              index: targetY,
          });

    const nextX = isVertical ? (target?.index ?? targetX) : targetX;
    const nextY = isVertical ? targetY : (target?.index ?? targetY);

    const requiresWrapping = isVertical
        ? wrapComparison(targetY, treePosition.nodeCoords.y)
        : wrapComparison(targetX, treePosition.nodeCoords.x);

    return {
        nextNode: target?.node,
        requiresWrapping,
        coords: {
            x: nextX,
            y: nextY,
        },
        cursorCoords: {
            x: isVertical ? verticalSourceX : targetX,
            y: isVertical ? targetY : horizontalSourceY,
        },
        isVertical,
    };
}

function getMaximumRowLength(rows: ReadonlyArray<ReadonlyArray<unknown>>): number {
    return rows.reduce((maximumLength, row) => {
        return Math.max(maximumLength, row.length);
    }, 0);
}

/**
 * The perpendicular coordinate that a previous hole navigation left behind, so that navigating back
 * to where it came from returns to the same slot instead of the hole's nearest neighbor.
 */
function getRememberedCursor({
    history,
    key,
    origin,
    sourceEntry,
}: Readonly<{
    history: ReadonlyMap<number, NavigationHistoryPosition> | undefined;
    key: number;
    origin: number;
    sourceEntry: Readonly<NavEntry> | undefined;
}>): number | undefined {
    const position = history?.get(key);

    if (position && position.entry === sourceEntry && position.origin === origin) {
        return position.cursor;
    }

    return undefined;
}

function recordHoleNavigation({
    navigationPositionHistory,
    coords,
    cursorCoords,
    isVertical,
    sourcePosition,
    targetNode,
}: Readonly<{
    navigationPositionHistory: Readonly<NavigationPositionHistory>;
    coords: Coords;
    cursorCoords: Coords;
    isVertical: boolean;
    sourcePosition: WalkResult;
    targetNode: NavTreeNode;
}>) {
    if (isVertical && coords.x !== cursorCoords.x) {
        navigationPositionHistory.lastXByRow.set(coords.y, {
            entry: targetNode.navEntry,
            origin: sourcePosition.nodeCoords.y,
            cursor: cursorCoords.x,
        });
    } else if (!isVertical && coords.y !== cursorCoords.y) {
        navigationPositionHistory.lastYByColumn.set(coords.x, {
            entry: targetNode.navEntry,
            origin: sourcePosition.nodeCoords.x,
            cursor: cursorCoords.y,
        });
    }
}

/**
 * The x slot a vertical navigation should originate from. For a multi-slot (wide) entry this is its
 * center slot, so moving up or down lands on whatever sits above or below its middle rather than
 * its leading edge.
 */
function getVerticalSourceX(treePosition: WalkResult): number {
    const node = treePosition.node;
    if (node.root || node.navEntry.navParams.x == undefined) {
        return treePosition.nodeCoords.x;
    }

    return node.navEntry.navParams.x + Math.floor(((node.navEntry.navParams.width || 1) - 1) / 2);
}

/**
 * Finds the node at the given index within a single row or column. When that slot is a hole and
 * holes are not skipped, the nearest enabled node is used instead, preferring the lower index.
 */
function findNearestNode({
    nodes,
    shouldSkipHoles,
    index,
}: Readonly<{
    nodes: ReadonlyArray<NavTreeNode | undefined>;
    shouldSkipHoles: boolean;
    index: number;
}>): {node: NavTreeNode; index: number} | undefined {
    const exactNode = nodes[index];
    if (exactNode && (shouldSkipHoles || !exactNode.navEntry.navParams.disabled)) {
        return {
            node: exactNode,
            index,
        };
    } else if (shouldSkipHoles) {
        return undefined;
    }

    const enabledNodes = nodes.flatMap((node, nodeIndex) => {
        return node && !node.navEntry.navParams.disabled
            ? [
                  {
                      node,
                      index: nodeIndex,
                  },
              ]
            : [];
    });

    return (
        enabledNodes.findLast((entry) => entry.index < index) ??
        enabledNodes.find((entry) => entry.index > index)
    );
}

/**
 * Navigate only to piblings (siblings of parent).
 *
 * @category Internal
 */
export function navigatePibling({
    currentlyFocused,
    direction,
    allowWrapping,
    shouldSkipHoles,
    blockPerpendicularNavigation,
}: Readonly<{
    currentlyFocused: Readonly<CurrentNavEntry>;
    direction: NavDirection;
    allowWrapping: boolean;
    shouldSkipHoles: boolean;
    blockPerpendicularNavigation: boolean;
}>): NavigationResult<NavAction.Pibling> {
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

    const {nextNode, requiresWrapping, coords} = calculateNextNode({
        treePosition: parent,
        direction,
        shouldSkipHoles,
        blockPerpendicularNavigation,
    });

    const nodeToFocus = nextNode?.navEntry.navParams.group
        ? findDefaultChild(nextNode.children)
        : {
              node: nextNode,
              coords,
          };

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
