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
    children: TestingNavTreeNode[];
    navEntry: boolean;
    isGroup: boolean;
};

function convertTreeForTesting(navTreeNode: NavTreeNode): TestingNavTreeNode {
    return {
        isGroup: navTreeNode.isGroup,
        navEntry: !!navTreeNode.navEntry,
        element: toTagOrDefinition(navTreeNode.element),
        children: navTreeNode.children.map(convertTreeForTesting),
    };
}

async function testTree(templateCallback: (navController: NavController) => HTMLTemplateResult) {
    const navController = new NavController(undefined as any);
    const fixture = await testWeb.render(templateCallback(navController));
    assert.instanceOf(fixture, HTMLElement);
    makeWritable(navController).rootElement = fixture;

    const tree = navController.buildNavTree();

    return {
        tree: tree ? convertTreeForTesting(tree) : undefined,
        navEntries: navController.navEntries.size,
    };
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
            expect: {
                navEntries: 8,
                tree: {
                    element: 'section',
                    navEntry: false,
                    isGroup: false,
                    children: [
                        {
                            element: 'main',
                            navEntry: false,
                            isGroup: true,
                            children: [
                                {
                                    element: 'div',
                                    navEntry: true,
                                    isGroup: false,
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    navEntry: true,
                                    isGroup: false,
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    navEntry: true,
                                    isGroup: false,
                                    children: [],
                                },
                                {
                                    element: 'div',
                                    navEntry: true,
                                    isGroup: false,
                                    children: [],
                                },
                                {
                                    element: 'section',
                                    navEntry: false,
                                    isGroup: true,
                                    children: [
                                        {
                                            element: 'div',
                                            navEntry: true,
                                            isGroup: false,
                                            children: [],
                                        },
                                        {
                                            element: 'div',
                                            navEntry: true,
                                            isGroup: false,
                                            children: [],
                                        },
                                        {
                                            element: 'div',
                                            navEntry: true,
                                            isGroup: false,
                                            children: [],
                                        },
                                        {
                                            element: 'div',
                                            navEntry: true,
                                            isGroup: false,
                                            children: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        },
    ]);
});
