import {assert, check} from '@augment-vir/assert';
import {describe, it, itCases, testWeb} from '@augment-vir/test';
import {HTMLTemplateResult, html} from 'element-vir';
import {ParsedNavValue} from '../directives/nav-value.js';
import {nav} from '../directives/nav.directive.js';
import {
    BuildingTreeNavNode,
    buildNavTree,
    calculateChildCoords,
    convertTree,
    getNavChildren,
} from './nav-tree.js';
import {NavRootNodeNoElementChildren, omitElementProp} from './nav-tree.mock.js';

type BuildingTreeNavNodeNoElement = {
    children: BuildingTreeNavNodeNoElement[];
    navValue: ParsedNavValue;
};

function pickChildrenOnly(navNode: BuildingTreeNavNode): BuildingTreeNavNodeNoElement {
    return {
        children: navNode.children.map(pickChildrenOnly),
        navValue: navNode.navValue,
        ...(check.hasKey(navNode, 'isRoot') ? {isRoot: navNode.isRoot} : {}),
    };
}

async function testGetNavChildren(template: HTMLTemplateResult) {
    const rootElement = await testWeb.render(template);
    assert.instanceOf(rootElement, HTMLElement);
    const children = getNavChildren(rootElement);

    return children.map(pickChildrenOnly);
}

describe(omitElementProp.name, () => {
    it('errors if the node is an invalid type', () => {
        assert.throws(() => {
            omitElementProp({
                children: [],
                element: {} as any,
                // @ts-expect-error: Intentionally incorrect type for testing purposes.
                type: 'invalid type',
            });
        });
    });
});

describe(getNavChildren.name, () => {
    itCases(testGetNavChildren, [
        {
            it: 'returns nothing for an empty node',
            input: html`
                <div></div>
            `,
            expect: [],
        },
        {
            it: 'ignores non-nav children',
            input: html`
                <div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `,
            expect: [],
        },
        {
            it: 'gets direct nav children',
            input: html`
                <div>
                    <div ${nav()}></div>
                    <div ${nav()}></div>
                    <div></div>
                </div>
            `,
            expect: [
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
            ],
        },
        {
            it: 'gets all nav ancestors',
            input: html`
                <div>
                    <div ${nav()}></div>
                    <div ${nav()}>
                        <div ${nav()}></div>
                    </div>
                    <div></div>
                </div>
            `,
            expect: [
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
                {
                    children: [
                        {
                            children: [],
                            navValue: {type: '1d', isGroup: false},
                        },
                    ],
                    navValue: {type: '1d', isGroup: false},
                },
            ],
        },
        {
            it: 'gets deeply nested top level nav nodes',
            input: html`
                <div>
                    <div ${nav()}></div>
                    <div>
                        <div ${nav()}></div>
                    </div>
                    <div>
                        <div>
                            <div ${nav()}></div>
                        </div>
                    </div>
                </div>
            `,
            expect: [
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
            ],
        },
        {
            it: 'constructs a full tree of ancestors',
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
                        <div ${nav()}></div>
                    </div>
                    <div ${nav()}>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            `,
            expect: [
                {
                    children: [
                        {
                            children: [],
                            navValue: {type: '1d', isGroup: false},
                        },
                        {
                            children: [],
                            navValue: {type: '1d', isGroup: false},
                        },
                    ],
                    navValue: {type: '1d', isGroup: false},
                },
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
                {
                    children: [],
                    navValue: {type: '1d', isGroup: false},
                },
            ],
        },
    ]);
});

describe(buildNavTree.name, () => {
    async function testBuildTree(
        template: HTMLTemplateResult,
    ): Promise<NavRootNodeNoElementChildren | undefined> {
        const rootElement = await testWeb.render(template);

        assert.instanceOf(rootElement, HTMLElement);
        const tree = buildNavTree(rootElement);

        if (!tree) {
            return undefined;
        }

        /** The top level node is always a root node. */
        const trimmed = omitElementProp(tree) as NavRootNodeNoElementChildren;

        return trimmed;
    }

    itCases(testBuildTree, [
        {
            it: 'builds a tree that starts on the root element',
            input: html`
                <div ${nav()}>
                    <div ${nav()}></div>
                </div>
            `,
            expect: {
                children: [
                    {
                        coords: {
                            x: 0,
                            y: 0,
                        },
                        isGroup: false,
                        type: 'child',
                    },
                ],
                isGroup: false,
                isRoot: true,
                type: '1d',
            },
        },
        {
            it: 'errors if sibling types do not match',
            input: html`
                <div ${nav()}>
                    <div ${nav()}></div>
                    <div ${nav(0, 2)}></div>
                </div>
            `,
            throws: {
                matchMessage: 'inconsistent nav dimensionality',
            },
        },
        {
            it: 'errors if siblings have identical coords',
            input: html`
                <div ${nav()}>
                    <div ${nav(0, 2)}></div>
                    <div ${nav(0, 2)}></div>
                </div>
            `,
            throws: {
                matchMessage: 'Parent already has child at 0,2',
            },
        },
        {
            it: 'builds a 1d 2 deep tree',
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
                        <div ${nav()}></div>
                    </div>
                    <div ${nav()}>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            `,
            expect: {
                type: '1d',
                children: [
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
                    {type: 'child', coords: {x: 2, y: 0}, isGroup: false},
                ],
                isRoot: true,
                isGroup: false,
            },
        },
        {
            it: 'builds a 2d 2 deep tree',
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
            expect: {
                children: [
                    {
                        children: [
                            {
                                coords: {
                                    x: 0,
                                    y: 0,
                                },
                                isGroup: false,
                                type: 'child',
                            },
                            {
                                coords: {
                                    x: 1,
                                    y: 0,
                                },
                                isGroup: false,
                                type: 'child',
                            },
                        ],
                        coords: {
                            x: 0,
                            y: 0,
                        },
                        isGroup: false,
                        type: '1d',
                    },
                    {
                        children: [
                            [
                                {
                                    children: [
                                        {
                                            coords: {
                                                x: 0,
                                                y: 0,
                                            },
                                            isGroup: false,
                                            type: 'child',
                                        },
                                        {
                                            coords: {
                                                x: 1,
                                                y: 0,
                                            },
                                            isGroup: false,
                                            type: 'child',
                                        },
                                    ],
                                    coords: {
                                        x: 0,
                                        y: 0,
                                    },
                                    isGroup: false,
                                    type: '1d',
                                },
                                {
                                    coords: {
                                        x: 1,
                                        y: 0,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                            ],
                            [
                                {
                                    children: [
                                        [
                                            {
                                                coords: {
                                                    x: 0,
                                                    y: 0,
                                                },
                                                isGroup: false,
                                                type: 'child',
                                            },
                                            {
                                                coords: {
                                                    x: 1,
                                                    y: 0,
                                                },
                                                isGroup: false,
                                                type: 'child',
                                            },
                                        ],
                                        [
                                            {
                                                coords: {
                                                    x: 0,
                                                    y: 1,
                                                },
                                                isGroup: false,
                                                type: 'child',
                                            },
                                            {
                                                coords: {
                                                    x: 1,
                                                    y: 1,
                                                },
                                                isGroup: false,
                                                type: 'child',
                                            },
                                        ],
                                    ],
                                    coords: {
                                        x: 0,
                                        y: 1,
                                    },
                                    isGroup: false,
                                    type: '2d',
                                },
                                {
                                    coords: {
                                        x: 1,
                                        y: 1,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                            ],
                        ],
                        coords: {
                            x: 1,
                            y: 0,
                        },
                        isGroup: false,
                        type: '2d',
                    },
                    {
                        coords: {
                            x: 2,
                            y: 0,
                        },
                        isGroup: false,
                        type: 'child',
                    },
                ],
                isGroup: false,
                isRoot: true,
                type: '1d',
            },
        },
        {
            it: 'builds a 1d and 2d tree',
            input: html`
                <div>
                    <div class="grid" ${nav()}>
                        <div ${nav(0, 0)}></div>
                        <div ${nav(0, 1)}></div>
                        <div ${nav(0, 2)}></div>
                        <div ${nav(1, 0)}></div>
                        <div ${nav(1, 1)}></div>
                        <div ${nav(1, 2)}></div>
                    </div>
                    <div ${nav()}></div>
                    <div ${nav()}></div>
                    <div ${nav()}></div>
                </div>
            `,
            expect: {
                children: [
                    {
                        children: [
                            [
                                {
                                    coords: {
                                        x: 0,
                                        y: 0,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                                {
                                    coords: {
                                        x: 1,
                                        y: 0,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                            ],
                            [
                                {
                                    coords: {
                                        x: 0,
                                        y: 1,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                                {
                                    coords: {
                                        x: 1,
                                        y: 1,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                            ],
                            [
                                {
                                    coords: {
                                        x: 0,
                                        y: 2,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                                {
                                    coords: {
                                        x: 1,
                                        y: 2,
                                    },
                                    isGroup: false,
                                    type: 'child',
                                },
                            ],
                        ],
                        coords: {
                            x: 0,
                            y: 0,
                        },
                        isGroup: false,
                        type: '2d',
                    },
                    {
                        coords: {
                            x: 1,
                            y: 0,
                        },
                        isGroup: false,
                        type: 'child',
                    },
                    {
                        coords: {
                            x: 2,
                            y: 0,
                        },
                        isGroup: false,
                        type: 'child',
                    },
                    {
                        coords: {
                            x: 3,
                            y: 0,
                        },
                        isGroup: false,
                        type: 'child',
                    },
                ],
                isGroup: false,
                isRoot: true,
                type: '1d',
            },
        },
        {
            it: 'returns undefined if there is no nav',
            input: html`
                <div>
                    <div class="grid">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `,
            expect: undefined,
        },
    ]);
});

describe(calculateChildCoords.name, () => {
    itCases(calculateChildCoords, [
        {
            it: 'uses navValue for 2d coords',
            inputs: [
                {
                    navValue: {
                        xCord: 1,
                        yCord: 42,
                        type: '2d',
                        isGroup: false,
                    },
                },
                [],
            ],
            expect: {
                x: 1,
                y: 42,
            },
        },
        {
            it: 'uses current children for 1d coords',
            inputs: [
                {
                    navValue: {
                        type: '1d',
                        isGroup: false,
                    },
                },
                [
                    {},
                    {},
                    {},
                ],
            ],
            expect: {
                x: 3,
                y: 0,
            },
        },
        {
            it: 'rejects an invalid nav type',
            inputs: [
                {
                    navValue: {
                        // @ts-expect-error: should be 1d or 2d
                        type: 'invalid',
                        isGroup: false,
                    },
                },
                [],
            ],
            throws: {
                matchMessage: 'Unexpected node nav type',
            },
        },
    ]);
});

describe(convertTree.name, () => {
    itCases(convertTree, []);
});
