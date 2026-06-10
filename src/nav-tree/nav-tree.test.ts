import {describe, itCases} from '@augment-vir/test';
import {toTagOrDefinition} from '@augment-vir/web';
import {html, type HTMLTemplateResult} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {type NavController} from '../nav-controller/nav-controller.js';
import {createMockNavController} from '../nav-controller/nav-controller.mock.js';
import {type NavTreeNode} from './nav-tree.js';

type TestingNavTreeNode = {
    element: ReturnType<typeof toTagOrDefinition>;
    children: TestingNavTreeNode[][];
};

function convertTreeForTesting(navTreeNode: NavTreeNode): TestingNavTreeNode {
    return {
        element: toTagOrDefinition(navTreeNode.element),
        children: navTreeNode.children.map((row) => row.map(convertTreeForTesting)),
    };
}

async function testTree(templateCallback: (navController: NavController) => HTMLTemplateResult) {
    const {navController} = await createMockNavController(templateCallback);

    return navController.buildNavTree().children.map((row) => row.map(convertTreeForTesting));
}

describe('buildNavTree', () => {
    itCases(testTree, [
        {
            it: 'allows nested groups',
            input: (controller) => html`
                <section>
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <section
                            ${nav(controller, {
                                group: true,
                            })}
                        >
                            <div>
                                <div ${nav(controller)}></div>
                            </div>
                            <div ${nav(controller)}></div>
                            <div ${nav(controller)}></div>
                            <div ${nav(controller)}></div>
                        </section>
                    </main>
                </section>
            `,
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                {
                                    element: 'section',
                                    children: [
                                        [
                                            {
                                                element: 'div',
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                children: [],
                                            },
                                        ],
                                    ],
                                },
                            ],
                        ],
                    },
                ],
            ],
        },
        {
            it: 'allows out of order 1D navigation',
            input: (controller) => html`
                <section>
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <section
                            ${nav(controller, {
                                group: true,
                            })}
                        >
                            <section
                                ${nav(controller, {
                                    x: 1,
                                })}
                            ></section>
                            <span
                                ${nav(controller, {
                                    x: 2,
                                })}
                            ></span>
                            <div ${nav(controller)}></div>
                            <div ${nav(controller)}></div>
                        </section>
                    </main>
                </section>
            `,
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                {
                                    element: 'section',
                                    children: [
                                        [
                                            {
                                                element: 'div',
                                                children: [],
                                            },
                                            {
                                                element: 'section',
                                                children: [],
                                            },
                                            {
                                                element: 'span',
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                children: [],
                                            },
                                        ],
                                    ],
                                },
                            ],
                        ],
                    },
                ],
            ],
        },
        {
            it: 'allows 2D navigation',
            input: (controller) => html`
                <section>
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <span
                            ${nav(controller, {
                                x: 3,
                                y: 1,
                            })}
                        ></span>
                        <div ${nav(controller)}></div>
                        <div ${nav(controller)}></div>
                        <div
                            ${nav(controller, {
                                x: 1,
                                y: 3,
                            })}
                        ></div>
                        <section
                            ${nav(controller, {
                                y: 3,
                            })}
                        ></section>
                    </main>
                </section>
            `,
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                {
                                    element: 'div',
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    children: [],
                                },
                            ],
                            [
                                {
                                    element: 'span',
                                    children: [],
                                },
                            ],
                            [
                                {
                                    element: 'section',
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    children: [],
                                },
                            ],
                        ],
                    },
                ],
            ],
        },
    ]);
});
