import {ensureType} from '@augment-vir/common';
import {Coords} from '../util/coords';
import {NavNodeNoElement} from './nav-tree.mock';

/** These results are so big that they're saved here in a separate file instead. */
export const walkNavTreeTestResults = {
    parentChain: ensureType<[NavNodeNoElement[], NavNodeNoElement, Coords][]>([
        [
            [],
            {
                children: [
                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                ],
                type: '1d',
                isGroup: false,
                coords: {x: 0, y: 0},
            },
            {x: 0, y: 0},
        ],
        [
            [
                {
                    children: [
                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    type: '1d',
                    isGroup: false,
                    coords: {x: 0, y: 0},
                },
            ],
            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
            {x: 0, y: 0},
        ],
        [
            [
                {
                    children: [
                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    type: '1d',
                    isGroup: false,
                    coords: {x: 0, y: 0},
                },
            ],
            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
            {x: 1, y: 0},
        ],
    ]),
    big: ensureType<[NavNodeNoElement[], NavNodeNoElement, Coords][]>([
        [
            [],
            {
                children: [
                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                ],
                type: '1d',
                isGroup: false,
                coords: {x: 0, y: 0},
            },
            {x: 0, y: 0},
        ],
        [
            [
                {
                    children: [
                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    type: '1d',
                    isGroup: false,
                    coords: {x: 0, y: 0},
                },
            ],
            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
            {x: 0, y: 0},
        ],
        [
            [
                {
                    children: [
                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    type: '1d',
                    isGroup: false,
                    coords: {x: 0, y: 0},
                },
            ],
            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
            {x: 1, y: 0},
        ],
        [
            [],
            {
                children: [
                    [
                        {
                            children: [
                                {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                            ],
                            type: '1d',
                            isGroup: false,
                            coords: {x: 0, y: 0},
                        },
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    [
                        {
                            children: [
                                [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                [
                                    {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                ],
                            ],
                            type: '2d',
                            isGroup: false,
                            coords: {x: 0, y: 1},
                        },
                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                    ],
                ],
                type: '2d',
                isGroup: false,
                coords: {x: 1, y: 0},
            },
            {x: 1, y: 0},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
            ],
            {
                children: [
                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                ],
                type: '1d',
                isGroup: false,
                coords: {x: 0, y: 0},
            },
            {x: 0, y: 0},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
                {
                    children: [
                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    type: '1d',
                    isGroup: false,
                    coords: {x: 0, y: 0},
                },
            ],
            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
            {x: 0, y: 0},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
                {
                    children: [
                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    type: '1d',
                    isGroup: false,
                    coords: {x: 0, y: 0},
                },
            ],
            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
            {x: 1, y: 0},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
            ],
            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
            {x: 1, y: 0},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
            ],
            {
                children: [
                    [
                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                    ],
                    [
                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                    ],
                ],
                type: '2d',
                isGroup: false,
                coords: {x: 0, y: 1},
            },
            {x: 0, y: 1},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
                {
                    children: [
                        [
                            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 0, y: 1},
                },
            ],
            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
            {x: 0, y: 0},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
                {
                    children: [
                        [
                            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 0, y: 1},
                },
            ],
            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
            {x: 1, y: 0},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
                {
                    children: [
                        [
                            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 0, y: 1},
                },
            ],
            {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
            {x: 0, y: 1},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
                {
                    children: [
                        [
                            {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 0, y: 1},
                },
            ],
            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
            {x: 1, y: 1},
        ],
        [
            [
                {
                    children: [
                        [
                            {
                                children: [
                                    {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                    {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                ],
                                type: '1d',
                                isGroup: false,
                                coords: {x: 0, y: 0},
                            },
                            {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                        ],
                        [
                            {
                                children: [
                                    [
                                        {type: 'child', coords: {x: 0, y: 0}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 0}, isGroup: false},
                                    ],
                                    [
                                        {type: 'child', coords: {x: 0, y: 1}, isGroup: false},
                                        {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                                    ],
                                ],
                                type: '2d',
                                isGroup: false,
                                coords: {x: 0, y: 1},
                            },
                            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
                        ],
                    ],
                    type: '2d',
                    isGroup: false,
                    coords: {x: 1, y: 0},
                },
            ],
            {type: 'child', coords: {x: 1, y: 1}, isGroup: false},
            {x: 1, y: 1},
        ],
        [
            [],
            {type: 'child', coords: {x: 2, y: 0}, isGroup: false},
            {x: 2, y: 0},
        ],
    ]),
};
