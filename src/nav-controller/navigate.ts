import {assert, assertWrap} from '@augment-vir/assert';
import {type Coords, wrapNumber} from '@augment-vir/common';
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
     * Skip vertical target rows when the current x slot is empty.
     *
     * When this is false, vertical navigation stays on the adjacent target row by selecting the
     * nearest lower x slot, then the nearest higher x slot if no lower slot exists.
     *
     * @default false
     */
    shouldSkipHoles?: boolean | undefined;
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
}: Readonly<{
    navTree: NavTree;
    currentlyFocused: CurrentNavEntry | undefined;
    /** The direction to navigate within the tree. */
    direction: NavDirection;
    /** Set to true to allow navigation to wrap. */
    allowWrapping: boolean;
    /** Set to true to skip vertical rows when the target x slot is empty. */
    shouldSkipHoles: boolean;
    /** Set to true to block perpendicular navigation in one-dimensional nav trees. */
    blockPerpendicularNavigation: boolean;
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

    const {nextNode, requiresWrapping, coords} = calculateNextNode({
        treePosition: currentlyFocused.position,
        direction,
        shouldSkipHoles,
        blockPerpendicularNavigation,
    });

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

function calculateNextNode({
    treePosition,
    direction,
    shouldSkipHoles,
    blockPerpendicularNavigation,
}: Readonly<{
    treePosition: WalkResult;
    direction: NavDirection;
    shouldSkipHoles: boolean;
    blockPerpendicularNavigation: boolean;
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
            parentNode?.children[treePosition.nodeCoords.y]?.length ?? 0,
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
}: Readonly<{
    treePosition: WalkResult;
    direction: NavDirection;
    step: number;
    shouldSkipHoles: boolean;
    blockPerpendicularNavigation: boolean;
}>): CalculateNextNodeOutput {
    const parentNode = treePosition.ancestorChain[treePosition.ancestorChain.length - 1]?.node;
    assert.isDefined(parentNode, 'missing parent');
    const currentRow = assertWrap.isDefined(parentNode.children[treePosition.nodeCoords.y]);

    const isVerticalDirection = direction === NavDirection.Down || direction === NavDirection.Up;
    const isVertical =
        isVerticalDirection && (blockPerpendicularNavigation || parentNode.children.length > 1);

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

    const verticalSourceX = getVerticalSourceX(treePosition);

    const closestVerticalNode = isVertical
        ? findNodeInRow({
              row: nextRow,
              shouldSkipHoles,
              x: verticalSourceX,
          })
        : undefined;

    const nextX = isVertical
        ? (closestVerticalNode?.x ?? verticalSourceX)
        : wrapNumber(treePosition.nodeCoords.x + increment, {
              min: 0,
              max: currentRow.length - 1,
              takeOverflow: true,
          });

    const nextNode: NavTreeNode | undefined = isVertical
        ? closestVerticalNode?.node
        : parentNode.children[nextY]?.[nextX];

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

function findNodeInRow({
    row,
    shouldSkipHoles,
    x,
}: Readonly<{
    row: ReadonlyArray<NavTreeNode | undefined>;
    shouldSkipHoles: boolean;
    x: number;
}>): {node: NavTreeNode; x: number} | undefined {
    const exactNode = row[x];
    if (exactNode && (shouldSkipHoles || !exactNode.navEntry.navParams.disabled)) {
        return {
            node: exactNode,
            x,
        };
    } else if (shouldSkipHoles) {
        return undefined;
    }

    let lower: {node: NavTreeNode; x: number} | undefined;
    let higher: {node: NavTreeNode; x: number} | undefined;

    row.forEach((node, index) => {
        if (!node || node.navEntry.navParams.disabled) {
            return;
        }

        if (index < x && (!lower || index > lower.x)) {
            lower = {
                node,
                x: index,
            };
        } else if (index > x && (!higher || index < higher.x)) {
            higher = {
                node,
                x: index,
            };
        }
    });

    return lower || higher;
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
