import {itCases} from '@augment-vir/browser-testing';
import {HTMLTemplateResult, html} from 'element-vir';
import {nav} from '../directives/nav.directive';
import {Coords} from '../util/coords';
import {NavNodeNoElement, createNavTreeFromTemplate, omitElementProp} from './nav-tree.mock';
import {walkNavTree} from './walk-nav-tree';

describe(walkNavTree.name, () => {
    async function testWalkingTree(template: HTMLTemplateResult) {
        const {tree} = await createNavTreeFromTemplate(template);

        const walkCallbackInputs: [NavNodeNoElement[], NavNodeNoElement, Coords][] = [];
        walkNavTree(tree, (parentChain, currentNode, childCoords) => {
            walkCallbackInputs.push([
                parentChain.map(omitElementProp),
                omitElementProp(currentNode),
                childCoords,
            ]);
            return false;
        });

        return walkCallbackInputs;
    }

    itCases(testWalkingTree, [
        {
            it: 'walks every node',
            input: html`
                <div>
                    <div>
                        <div ${nav()}>
                            <div>
                                <div ${nav()}></div>
                                <div></div>
                                <div ${nav()}></div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                    <div>
                        <div ${nav()}>
                            <div ${nav(0, 0)}>
                                <div ${nav()}></div>
                                <div ${nav()}></div>
                            </div>
                            <div ${nav(0, 1)}>
                                <div ${nav(0, 0)}></div>
                                <div ${nav(0, 1)}></div>
                                <div ${nav(1, 0)}></div>
                                <div ${nav(1, 1)}></div>
                            </div>
                            <div ${nav(1, 0)}></div>
                            <div ${nav(1, 1)}></div>
                        </div>
                    </div>
                    <div ${nav()}>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            `,
            expect: [
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
            ],
        },
        {
            it: 'populates parent chain',
            input: html`
                <div>
                    <div>
                        <div ${nav()}>
                            <div>
                                <div ${nav()}></div>
                                <div></div>
                                <div ${nav()}></div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </div>
            `,
            expect: [
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
            ],
        },
    ]);
});
