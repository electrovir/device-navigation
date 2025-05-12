import {assert} from '@augment-vir/assert';
import {makeWritable} from '@augment-vir/common';
import {describe, itCases, testWeb} from '@augment-vir/test';
import {toTagOrDefinition} from '@augment-vir/web';
import {html, type HTMLTemplateResult} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {NavController} from './nav-controller.js';
import {type NavTreeNode} from './nav-tree.js';

type TestingNavTreeNode = {
    element: ReturnType<typeof toTagOrDefinition>;
    children: TestingNavTreeNode[][];
    navEntry: boolean;
};

function convertTreeForTesting(navTreeNode: NavTreeNode): TestingNavTreeNode {
    return {
        navEntry: !!navTreeNode.navEntry,
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
                        navEntry: true,
                        children: [
                            [
                                {
                                    element: 'div',
                                    navEntry: true,
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    navEntry: true,
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    navEntry: true,
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    navEntry: true,
                                    children: [],
                                },
                                {
                                    element: 'section',
                                    navEntry: true,
                                    children: [
                                        [
                                            {
                                                element: 'div',
                                                navEntry: true,
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                navEntry: true,
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                navEntry: true,
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                navEntry: true,
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
                        navEntry: true,
                        children: [
                            [
                                {
                                    element: 'section',
                                    navEntry: true,
                                    children: [
                                        [
                                            {
                                                element: 'div',
                                                navEntry: true,
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                navEntry: true,
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                navEntry: true,
                                                children: [],
                                            },
                                            {
                                                element: 'div',
                                                navEntry: true,
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
        // {
        //     it: 'allows out of order 1D navigation',
        //     input: (controller) => html`
        //         <section>
        //             <main ${nav(controller, {group: true})}>
        //                 <section ${nav(controller, {group: true})}>
        //                     <span ${nav(controller, {x: 3})}></span>
        //                     <div ${nav(controller)}></div>
        //                     <div ${nav(controller)}></div>
        //                 </section>
        //             </main>
        //         </section>
        //     `,
        //     expect: {
        //         element: 'section',
        //         navEntry: false,
        //         children: [
        //             [
        //                 {
        //                     element: 'main',
        //                     navEntry: true,
        //                     children: [
        //                         [
        //                             {
        //                                 element: 'section',
        //                                 navEntry: true,
        //                                 children: [
        //                                     [
        //                                         {
        //                                             element: 'div',
        //                                             navEntry: true,
        //                                             children: [],
        //                                         },
        //                                         {
        //                                             element: 'div',
        //                                             navEntry: true,
        //                                             children: [],
        //                                         },
        //                                         {
        //                                             element: 'span',
        //                                             navEntry: true,
        //                                             children: [],
        //                                         },
        //                                     ],
        //                                 ],
        //                             },
        //                         ],
        //                     ],
        //                 },
        //             ],
        //         ],
        //     },
        // },
    ]);
});
