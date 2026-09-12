import {describe, itCases} from '@augment-vir/test';
import {toTagOrDefinition} from '@augment-vir/web';
import {html, type HTMLTemplateResult} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {type NavController} from '../nav-controller/nav-controller.js';
import {createMockNavController} from '../nav-controller/nav-controller.mock.js';
import {type NavTreeNode} from './nav-tree.js';

type TestingNavTreeNode = {
    element: ReturnType<typeof toTagOrDefinition>;
    children: (TestingNavTreeNode | undefined)[][];
};

function convertTreeForTesting(navTreeNode: NavTreeNode): TestingNavTreeNode {
    return {
        element: toTagOrDefinition(navTreeNode.element),
        children: navTreeNode.children.map((row) => {
            const sparseRow: ReadonlyArray<NavTreeNode | undefined> = row;

            return Array.from(sparseRow, (node) => {
                return node ? convertTreeForTesting(node) : undefined;
            });
        }),
    };
}

async function testTree(templateCallback: (navController: NavController) => HTMLTemplateResult) {
    const {navController} = await createMockNavController(templateCallback);

    return navController.buildNavTree().children.map((row) => {
        const sparseRow: ReadonlyArray<NavTreeNode | undefined> = row;

        return Array.from(sparseRow, (node) => {
            return node ? convertTreeForTesting(node) : undefined;
        });
    });
}

describe('buildNavTree', () => {
    itCases(testTree, [
        {
            it: 'allows nested groups',
            input(controller) {
                return html`
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
                `;
            },
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
            input(controller) {
                return html`
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
                `;
            },
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
            input(controller) {
                return html`
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
                `;
            },
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
                                undefined,
                                undefined,
                                undefined,
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
        {
            it: 'fills every x slot a wide entry spans',
            input(controller) {
                return html`
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <button
                            ${nav(controller, {
                                x: 0,
                                y: 0,
                                width: 3,
                            })}
                        ></button>
                        <button
                            ${nav(controller, {
                                x: 3,
                                y: 0,
                            })}
                        ></button>
                    </main>
                `;
            },
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                        ],
                    },
                ],
            ],
        },
        {
            it: 'fills every y slot a tall entry spans',
            input(controller) {
                return html`
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <button
                            ${nav(controller, {
                                height: 3,
                                x: 0,
                                y: 0,
                            })}
                        ></button>
                        <button
                            ${nav(controller, {
                                x: 1,
                                y: 2,
                            })}
                        ></button>
                    </main>
                `;
            },
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                            [
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                            [
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                        ],
                    },
                ],
            ],
        },
        {
            it: 'caps an infinitely tall entry at the final finite row',
            input(controller) {
                return html`
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <button
                            ${nav(controller, {
                                height: Infinity,
                                x: 1,
                                y: 0,
                            })}
                        ></button>
                        <button
                            ${nav(controller, {
                                x: 0,
                                y: 2,
                            })}
                        ></button>
                    </main>
                `;
            },
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                undefined,
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                            [
                                undefined,
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                            [
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                        ],
                    },
                ],
            ],
        },
        {
            it: 'caps an infinitely wide entry at the final finite column',
            input(controller) {
                return html`
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <button
                            ${nav(controller, {
                                width: Infinity,
                                x: 0,
                                y: 0,
                            })}
                        ></button>
                        <button
                            ${nav(controller, {
                                x: 2,
                                y: 1,
                            })}
                        ></button>
                    </main>
                `;
            },
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                            [
                                undefined,
                                undefined,
                                {
                                    element: 'button',
                                    children: [],
                                },
                            ],
                        ],
                    },
                ],
            ],
        },
        {
            it: 'does not duplicate a wide entry nested under a plain wrapper',
            input(controller) {
                return html`
                    <main
                        ${nav(controller, {
                            group: true,
                        })}
                    >
                        <div class="row">
                            <button
                                ${nav(controller, {
                                    x: 0,
                                    y: 0,
                                    width: 3,
                                })}
                            ></button>
                            <button
                                ${nav(controller, {
                                    x: 3,
                                    y: 0,
                                })}
                            ></button>
                        </div>
                    </main>
                `;
            },
            expect: [
                [
                    {
                        element: 'main',
                        children: [
                            [
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
                                    children: [],
                                },
                                {
                                    element: 'button',
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
