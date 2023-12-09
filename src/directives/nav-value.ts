import {isLengthAtLeast, toEnsuredNumber} from '@augment-vir/common';

/**
 * Creates the attribute string value used in the `nav()` directive when assigning attributes to
 * elements. Formats the data into either `${x},${y}` (for 2 dimensional nav) or just an empty
 * string (for 1 dimensional nav).
 */
export function createNavValueString(
    xCord?: number | undefined,
    yCoord?: number | undefined,
): string {
    return (
        [
            xCord,
            yCoord,
        ]
            .filter((entry) => entry !== undefined)
            .join(',') || ''
    );
}

/** Data parsed from the nav attributes. */
export type ParsedNavValue = {type: '2d'; xCord: number; yCord: number} | {type: '1d'};

/**
 * Parsed nav data from attribute values assigned from the `nav` directive. Expected inputs come
 * from `createNavValueString`.
 */
export function parseNavValueString(value: string): ParsedNavValue | undefined {
    const splitValue = value.split(',');

    if (isLengthAtLeast(splitValue, 2)) {
        return {
            type: '2d',
            xCord: toEnsuredNumber(splitValue[0]),
            yCord: toEnsuredNumber(splitValue[1]),
        };
    } else {
        return {
            type: '1d',
        };
    }
}
