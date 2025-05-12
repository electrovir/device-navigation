import {assert} from '@augment-vir/assert';
import {makeWritable} from '@augment-vir/common';
import {describe, itCases, testWeb} from '@augment-vir/test';
import {toTagOrDefinition} from '@augment-vir/web';
import {html, type HTMLTemplateResult} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {NavController} from '../nav-controller/nav-controller.js';
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
    const navController = new NavController(undefined as any);
    const fixture = await testWeb.render(templateCallback(navController));
    assert.instanceOf(fixture, HTMLElement);
    makeWritable(navController).rootElement = fixture;

    return navController.buildNavTree().map((row) => row.map(convertTreeForTesting));
}

describe('buildNavTree', () => {
    itCases(testTree, [
        {
            it: 'omits children without nav',
            input: (controller) => html`
                <section>
                    <div class="should be omitted">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <section class="omitted because empty group" ${nav(controller, {group: true})}>
                        <div></div>
                    </section>
                    <main ${nav(controller, {group: true})}>
                        <div>
                            <div ${nav(controller)}></div>
                        </div>
                        <div ${nav(controller)}></div>
                        <div ${nav(controller, {disabled: true})}></div>
                        <div ${nav(controller)}></div>
                        <div ${nav(controller)}></div>

                        <section ${nav(controller)}>
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
            it: 'allows nested groups',
            input: (controller) => html`
                <section>
                    <main ${nav(controller, {group: true})}>
                        <section ${nav(controller, {group: true})}>
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
                    <main ${nav(controller, {group: true})}>
                        <section ${nav(controller, {group: true})}>
                            <section ${nav(controller, {x: 1})}></section>
                            <span ${nav(controller, {x: 2})}></span>
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
                    <main ${nav(controller, {group: true})}>
                        <span ${nav(controller, {x: 3, y: 1})}></span>
                        <div ${nav(controller)}></div>
                        <div ${nav(controller)}></div>
                        <div ${nav(controller, {x: 1, y: 3})}></div>
                        <section ${nav(controller, {y: 3})}></section>
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
