import {describe, itCases} from '@augment-vir/test';
import {greaterThan, lessThan} from './comparisons.js';

describe(greaterThan.name, () => {
    itCases(greaterThan, [
        {
            it: 'is true when the first argument is greater',
            inputs: [
                32,
                2,
            ],
            expect: true,
        },
        {
            it: 'is false when the first argument is less',
            inputs: [
                2,
                32,
            ],
            expect: false,
        },
    ]);
});

describe(lessThan.name, () => {
    itCases(lessThan, [
        {
            it: 'is false when the first argument is greater',
            inputs: [
                32,
                2,
            ],
            expect: false,
        },
        {
            it: 'is true when the first argument is less',
            inputs: [
                2,
                32,
            ],
            expect: true,
        },
    ]);
});
