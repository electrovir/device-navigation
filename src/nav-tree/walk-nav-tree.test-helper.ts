import {ensureType} from '@augment-vir/common';
import {Coords} from '../util/coords';
import {NavNodeNoElement} from './nav-tree.mock';

/** These results are so big that they're saved here in a separate file instead. */
export const walkNavTreeTestResults = {
    parentChain: ensureType<[NavNodeNoElement[], NavNodeNoElement, Coords][]>([
        [
            [],
            {
                type: '1d',
                children: [
                    {
                        type: 'child',
                    },
                    {
                        type: 'child',
                    },
                ],
            },
            {
                x: 0,
                y: 0,
            },
        ],
        [
            [
                {
                    type: '1d',
                    children: [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                },
            ],
            {
                type: 'child',
            },
            {
                x: 0,
                y: 0,
            },
        ],
        [
            [
                {
                    type: '1d',
                    children: [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                },
            ],
            {
                type: 'child',
            },
            {
                x: 1,
                y: 0,
            },
        ],
    ]),
    big: ensureType<[NavNodeNoElement[], NavNodeNoElement, Coords][]>([
        [
            [],
            {
                children: [
                    {
                        type: 'child',
                    },
                    {
                        type: 'child',
                    },
                ],
                type: '1d',
            },
            {
                x: 0,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                    type: '1d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 0,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                    type: '1d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 1,
                y: 0,
            },
        ],
        [
            [],
            {
                children: [
                    [
                        {
                            children: [
                                {
                                    type: 'child',
                                },
                                {
                                    type: 'child',
                                },
                            ],
                            type: '1d',
                        },
                        {
                            children: [
                                [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                            ],
                            type: '2d',
                        },
                    ],
                    [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                ],
                type: '2d',
            },
            {
                x: 1,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                children: [
                    {
                        type: 'child',
                    },
                    {
                        type: 'child',
                    },
                ],
                type: '1d',
            },
            {
                x: 0,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
                {
                    children: [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                    type: '1d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 0,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
                {
                    children: [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                    type: '1d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 1,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                children: [
                    [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                    [
                        {
                            type: 'child',
                        },
                        {
                            type: 'child',
                        },
                    ],
                ],
                type: '2d',
            },
            {
                x: 1,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
                {
                    children: [
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 0,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
                {
                    children: [
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 1,
                y: 0,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
                {
                    children: [
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 0,
                y: 1,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
                {
                    children: [
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 1,
                y: 1,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 0,
                y: 1,
            },
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {
                                        type: 'child',
                                    },
                                    {
                                        type: 'child',
                                    },
                                ],
                                type: '1d',
                            },
                            {
                                children: [
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                    [
                                        {
                                            type: 'child',
                                        },
                                        {
                                            type: 'child',
                                        },
                                    ],
                                ],
                                type: '2d',
                            },
                        ],
                        [
                            {
                                type: 'child',
                            },
                            {
                                type: 'child',
                            },
                        ],
                    ],
                    type: '2d',
                },
            ],
            {
                type: 'child',
            },
            {
                x: 1,
                y: 1,
            },
        ],
        [
            [],
            {
                type: 'child',
            },
            {
                x: 2,
                y: 0,
            },
        ],
    ]),
};
