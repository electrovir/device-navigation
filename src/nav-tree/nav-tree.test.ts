import {itCases} from '@augment-vir/browser-testing';
import {typedHasProperty} from '@augment-vir/common';
import {fixture as renderFixture} from '@open-wc/testing';
import {HTMLTemplateResult, html} from 'element-vir';
import {assertInstanceOf, assertThrows} from 'run-time-assertions';
import {ParsedNavValue} from '../directives/nav-value';
import {nav} from '../directives/nav.directive';
import {BuildingTreeNavNode, buildNavTree, getNavChildren} from './nav-tree';
import {NavRootNodeNoElementChildren, omitElementProp} from './nav-tree.mock';

type BuildingTreeNavNodeNoElement = {
    children: BuildingTreeNavNodeNoElement[];
    navValue: ParsedNavValue;
};

function pickChildrenOnly(navNode: BuildingTreeNavNode): BuildingTreeNavNodeNoElement {
    return {
        children: navNode.children.map(pickChildrenOnly),
        navValue: navNode.navValue,
        ...(typedHasProperty(navNode, 'isRoot') ? {isRoot: navNode.isRoot} : {}),
    };
}

async function testGetNavChildren(template: HTMLTemplateResult) {
    const rootElement = await renderFixture(template);
    assertInstanceOf(rootElement, HTMLElement);
    const children = getNavChildren(rootElement);

    return children.map(pickChildrenOnly);
}

describe(omitElementProp.name, () => {
    it('errors if the node is an invalid type', () => {
        assertThrows(() => {
            omitElementProp({
                children: [],
                element: {} as any,
                /** Intentionally incorrect type for testing purposes. */
                // @ts-expect-error
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
                    navValue: {type: '1d'},
                },
                {
                    children: [],
                    navValue: {type: '1d'},
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
                    navValue: {type: '1d'},
                },
                {
                    children: [
                        {
                            children: [],
                            navValue: {type: '1d'},
                        },
                    ],
                    navValue: {type: '1d'},
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
                    navValue: {type: '1d'},
                },
                {
                    children: [],
                    navValue: {type: '1d'},
                },
                {
                    children: [],
                    navValue: {type: '1d'},
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
                            navValue: {type: '1d'},
                        },
                        {
                            children: [],
                            navValue: {type: '1d'},
                        },
                    ],
                    navValue: {type: '1d'},
                },
                {
                    children: [],
                    navValue: {type: '1d'},
                },
                {
                    children: [],
                    navValue: {type: '1d'},
                },
            ],
        },
    ]);
});

async function testBuildTree(
    template: HTMLTemplateResult,
): Promise<NavRootNodeNoElementChildren | undefined> {
    const rootElement = await renderFixture(template);

    assertInstanceOf(rootElement, HTMLElement);
    const tree = buildNavTree(rootElement);

    if (!tree) {
        return undefined;
    }

    /** The top level node is always a root node. */
    const trimmed = omitElementProp(tree) as NavRootNodeNoElementChildren;

    return trimmed;
}

describe(buildNavTree.name, () => {
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
                        type: 'child',
                    },
                ],
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
            throws: 'child nav does not match parent nav type',
        },
        {
            it: 'errors if siblings have identical coords',
            input: html`
                <div ${nav()}>
                    <div ${nav(0, 2)}></div>
                    <div ${nav(0, 2)}></div>
                </div>
            `,
            throws: 'Parent already has child at 0,2',
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
                children: [
                    {
                        children: [
                            {type: 'child'},
                            {type: 'child'},
                        ],
                        type: '1d',
                    },
                    {type: 'child'},
                    {type: 'child'},
                ],
                type: '1d',
                isRoot: true,
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
                            {type: 'child'},
                            {type: 'child'},
                        ],
                        type: '1d',
                    },
                    {
                        type: '2d',
                        children: [
                            [
                                {
                                    type: '1d',
                                    children: [
                                        {type: 'child'},
                                        {type: 'child'},
                                    ],
                                },
                                {
                                    type: '2d',
                                    children: [
                                        [
                                            {type: 'child'},
                                            {type: 'child'},
                                        ],
                                        [
                                            {type: 'child'},
                                            {type: 'child'},
                                        ],
                                    ],
                                },
                            ],
                            [
                                {type: 'child'},
                                {type: 'child'},
                            ],
                        ],
                    },
                    {type: 'child'},
                ],
                type: '1d',
                isRoot: true,
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
                type: '1d',
                children: [
                    {
                        type: '2d',
                        children: [
                            [
                                {type: 'child'},
                                {type: 'child'},
                                {type: 'child'},
                            ],
                            [
                                {type: 'child'},
                                {type: 'child'},
                                {type: 'child'},
                            ],
                        ],
                    },
                    {type: 'child'},
                    {type: 'child'},
                    {type: 'child'},
                ],
                isRoot: true,
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
