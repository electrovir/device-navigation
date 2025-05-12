import {check} from '@augment-vir/assert';
import {isElementFocused} from '@augment-vir/web';

// This is for debugging and cannot really be adequately tested.
/* node:coverage disable */

/**
 * Log a whole nav tree for debugging purposes
 *
 * @category Util
 */
export function logNavTree(node: Readonly<NavRootNode | NavNode>, indent = 0): void {
    if (!indent) {
        console.info('vvv NAV TREE vvv');
    }
    function log(...args: unknown[]) {
        console.info('    '.repeat(indent) + String(args[0]), ...args.slice(1));
    }

    if (node.type === 'child') {
        log('type    : ', node.type);
        log('focused : ', isElementFocused(node.element));
        log('coords  : ', node.coords);
        log('element : ', node.element);
    } else if (node.isRoot) {
        log('type    : ', node.type);
        log('isRoot  : ', node.isRoot);
        log('isGroup : ', node.isGroup);
    } else {
        log('type    : ', node.type);
        log('focused : ', isElementFocused(node.element));
        log('isGroup : ', node.isGroup);
        log('coords  : ', node.coords);
        log('element : ', node.element);
    }

    if ('children' in node) {
        log('children');
        node.children.forEach((child, yCoord) => {
            if (check.isArray(child)) {
                // 2d children
                child.forEach((innerChild, xCoord) => {
                    log(
                        [
                            xCoord,
                            yCoord,
                        ].join(', '),
                    );
                    logNavTree(innerChild, indent + 1);
                });
            } else {
                // 1d children
                log(yCoord);
                logNavTree(child, indent + 1);
            }
        });
    }
}
