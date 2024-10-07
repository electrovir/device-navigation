import {toEnsuredNumber} from '@augment-vir/common';

/**
 * Defines a nav _group_, which is used as a nav parent but cannot actually be navigated to.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {group} from 'device-navigation';
 *
 * const myTemplate = html`
 *     <div ${nav(group)}></div>
 * `;
 * ```
 */
export const group = 'group';

/**
 * Creates the attribute string value used in the `nav()` directive when assigning attributes to
 * elements. Formats the data into one of the following:
 *
 * - `x,y`: for 2 dimensional nav
 * - `x,y,group`: for 2 dimensional nav groups
 * - `group`: for 1 dimensional nav groups
 * - `` (empty string): for 1 dimensional nav
 *
 * @category Internal
 */
export function createNavValueString(
    xOrGroup?: number | undefined | typeof group,
    yCoord?: number | undefined,
    isGroup?: typeof group | undefined,
): string {
    return (
        [
            xOrGroup,
            yCoord,
            isGroup,
        ]
            .filter((entry) => entry !== undefined)
            .join(',') || ''
    );
}

/**
 * Data parsed from the nav attributes.
 *
 * @category Internal
 */
export type ParsedNavValue =
    | {type: '2d'; xCord: number; yCord: number; isGroup: boolean}
    | {type: '1d'; isGroup: boolean};

/**
 * Parsed nav data from attribute values assigned from the `nav` directive. Expected inputs come
 * from `createNavValueString`.
 *
 * @category Internal
 */
export function parseNavValueString(value: string): ParsedNavValue | undefined {
    const [
        xOrGroup,
        y,
        isGroup,
    ] = value.split(',');

    if (y) {
        return {
            type: '2d',
            xCord: toEnsuredNumber(xOrGroup),
            yCord: toEnsuredNumber(y),
            isGroup: isGroup === group,
        };
    } else {
        return {
            type: '1d',
            isGroup: xOrGroup === group,
        };
    }
}
