import {getDirectChildren, getNestedChildren} from '@augment-vir/browser';
import {addPrefix, ArrayElement, awaitedForEach} from '@augment-vir/common';
import {assert, fixture, waitUntil} from '@open-wc/testing';
import {defineElement, html, HTMLTemplateResult} from 'element-vir';
import {assertDefined, assertInstanceOf, assertThrows} from 'run-time-assertions';
import {group} from '../directives/nav-value';
import {nav, navAttribute} from '../directives/nav.directive';
import {waitUntilFocused} from '../test/focus.test-helper';
import {focusElement, isFocused} from '../util/focus';
import {NavController} from './nav-controller';
import {NavDirection} from './navigate';

const VirTestNav = defineElement<{template: HTMLTemplateResult}>()({
    tagName: 'vir-test-nav',
    stateInitStatic: {
        navController: undefined as undefined | NavController,
    },
    initCallback({state, updateState, host}) {
        if (!state.navController) {
            const navController = new NavController(host);
            updateState({navController});
        }
    },
    renderCallback({inputs}) {
        return inputs.template;
    },
});

async function setupNavControllerTest<
    const ElementNames extends ReadonlyArray<string> = typeof defaultElementNames,
>(template: HTMLTemplateResult, elementNames: ElementNames = defaultElementNames as any) {
    const rootElement = await fixture(html`
        <${VirTestNav.assign({template})}></${VirTestNav}>
    `);
    assertInstanceOf(rootElement, VirTestNav);
    await waitUntil(() => !!rootElement.instanceState.navController);
    const navController = rootElement.instanceState.navController!;
    const directChildren = getDirectChildren(rootElement).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
    );
    const allDescendants = getNestedChildren(rootElement).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
    );

    const namedChildren = elementNames.reduce(
        (accum, elementName: ArrayElement<ElementNames>) => {
            const element = rootElement.shadowRoot.querySelector(
                addPrefix({value: elementName, prefix: '.'}),
            );
            assertInstanceOf(element, HTMLElement);
            accum[elementName] = element;
            return accum;
        },
        {} as Record<ArrayElement<ElementNames>, HTMLElement>,
    );

    return {
        rootElement,
        navController,
        directChildren,
        allDescendants,
        namedChildren,
    };
}

const defaultElementNames = [
    'first-nested-child',
    'next-pibling',
    'parent-2d',
    'first-nav',
    'end-nested-child',
] as const;

const defaultTestTemplate = html`
    <div></div>
    <div class="first-nav" ${nav()}>second</div>
    <div class="parent-2d" ${nav()}>
        <div ${nav(0, 0)}>a</div>
        <div ${nav(1, 0)}>b</div>
        <div ${nav(2, 0)}>c</div>
        <div ${nav(0, 1)}>d</div>
        <div ${nav(1, 1)}>e</div>
    </div>
    <div ${nav()}>fourth</div>
    <div ${nav()}>
        <div class="first-nested-child" ${nav()}>nested first</div>
        <div ${nav()}>nested second</div>
        <div class="end-nested-child" ${nav()}>nested third</div>
    </div>
    <div class="next-pibling" ${nav()}>
        <div ${nav()}>nested first</div>
        <div ${nav()}>nested second</div>
        <div ${nav()}>nested third</div>
    </div>
`;

describe(NavController.name, () => {
    it('starts with no focused descendants', async () => {
        const {allDescendants} = await setupNavControllerTest(defaultTestTemplate);

        allDescendants.forEach((descendant, index) => {
            assert.isFalse(
                isFocused(descendant),
                `descendant at index '${index}' should not have been focused.`,
            );
        });
    });

    it('focuses the first nav child on navigation', async () => {
        const {navController, rootElement: element} =
            await setupNavControllerTest(defaultTestTemplate);

        const firstNavChild = element.shadowRoot.querySelector(navAttribute.js(''));

        assertInstanceOf(firstNavChild, HTMLElement);

        assert.deepStrictEqual(
            navController.navigate({
                allowWrapping: true,
                direction: NavDirection.Down,
            }),
            {
                defaulted: true,
                success: true,
                newElement: firstNavChild,
                wrapped: false,
            },
        );

        await waitUntilFocused(firstNavChild);
    });

    it('navigates through all top level nav children', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const navChildren = directChildren.filter((child) => child.matches(navAttribute.js('')));

        await awaitedForEach(navChildren, async (navChild, index) => {
            assert.deepStrictEqual(
                navController.navigate({
                    allowWrapping: true,
                    direction: NavDirection.Down,
                }),
                {
                    defaulted: !index,
                    success: true,
                    newElement: navChild,
                    wrapped: false,
                },
            );

            await waitUntilFocused(navChild);
        });

        assert.deepStrictEqual(
            navController.navigate({
                allowWrapping: true,
                direction: NavDirection.Down,
            }),
            {
                defaulted: false,
                success: true,
                newElement: navChildren[0]!,
                wrapped: true,
            },
        );
    });

    it('does not enter into nav elements with no nested nav', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withoutNestedNav = directChildren[1];
        assertDefined(withoutNestedNav);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });
        await waitUntilFocused(withoutNestedNav);
        navController.enterInto();
        /** No change. */
        await waitUntilFocused(withoutNestedNav);
    });

    it('enters into nested 2d nav', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested2dNav = directChildren[2];
        assertDefined(withNested2dNav);
        const nestedNav = withNested2dNav.children[0];
        assertDefined(nestedNav);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });
        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });
        await waitUntilFocused(withNested2dNav);
        navController.enterInto();
        /** No change. */
        await waitUntilFocused(nestedNav);
    });

    it('fails to exit if at a top level nav', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const topLevelNav = directChildren[2];
        assertDefined(topLevelNav);

        topLevelNav.focus();
        await waitUntilFocused(topLevelNav);

        assert.deepStrictEqual(navController.exitOutOf(), {
            success: false,
            reason: 'at top level nav already, nothing to exit to',
        });
    });

    it('does nothing if there is no nav tree', async () => {
        const {navController} = await setupNavControllerTest(
            html`
                <div></div>
            `,
            [],
        );

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Down}),
            {
                success: false,
                reason: 'no nav tree',
            },
        );
        assert.deepStrictEqual(navController.enterInto(), {
            success: false,
            reason: 'no nav tree',
        });
        assert.deepStrictEqual(navController.exitOutOf(), {
            success: false,
            reason: 'no nav tree',
        });
        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Down}),
            {
                success: false,
                reason: 'no nav tree',
            },
        );
        assert.isUndefined(navController.getCurrentlyFocused());
        assert.isUndefined(navController.buildNavTree());
    });

    it('enters into nested 1d nav', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested1dNav = directChildren[directChildren.length - 1];
        assertDefined(withNested1dNav);
        const nestedNav = withNested1dNav.children[0];
        assertDefined(nestedNav);
        withNested1dNav.focus();
        await waitUntilFocused(withNested1dNav);
        navController.enterInto();
        /** No change. */
        await waitUntilFocused(nestedNav);
    });

    it('navigates to a pibling', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(defaultTestTemplate);

        namedChildren['first-nested-child'].focus();
        await waitUntilFocused(namedChildren['first-nested-child']);

        assert.deepStrictEqual(
            navController.navigatePibling({direction: NavDirection.Down, allowWrapping: true}),
            {
                defaulted: false,
                newElement: namedChildren['next-pibling'],
                success: true,
                wrapped: false,
            },
        );
        await waitUntilFocused(namedChildren['next-pibling']);
    });

    it('fails pibling nav when there are none', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(
            html`
                <div ${nav()}>
                    <div class="child" ${nav()}></div>
                </div>
            `,
            ['child'],
        );

        namedChildren.child.focus();
        await waitUntilFocused(namedChildren.child);

        assert.deepStrictEqual(
            navController.navigatePibling({direction: NavDirection.Down, allowWrapping: true}),
            {
                success: false,
                reason: 'no node to navigate to',
            },
        );
    });

    it('defaults focus on pibling nav with no current focus', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(defaultTestTemplate);

        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Up}),
            {
                defaulted: true,
                newElement: namedChildren['first-nav'],
                success: true,
                wrapped: false,
            },
        );
    });

    it('fails pibling nav if there is no pibling', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(
            html`
                <div class="first-nav" ${nav()}></div>
                <div ${nav()}></div>
            `,
            ['first-nav'],
        );

        focusElement(namedChildren['first-nav']);
        await waitUntilFocused(namedChildren['first-nav']);

        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Up}),
            {
                success: false,
                reason: 'no parent to find a pibling from',
            },
        );
    });

    it('navigates a nested pibling', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(
            html`
                <div ${nav(group)}>
                    <div ${nav()}></div>
                    <div ${nav()}></div>
                    <div ${nav()}></div>
                    <div ${nav()}>
                        <div class="first-focus" ${nav()}></div>
                        <div ${nav()}></div>
                    </div>
                    <div class="pibling" ${nav()}></div>
                </div>
            `,
            [
                'first-focus',
                'pibling',
            ],
        );

        focusElement(namedChildren['first-focus']);
        await waitUntilFocused(namedChildren['first-focus']);

        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Down}),
            {
                success: true,
                defaulted: false,
                newElement: namedChildren['pibling'],
                wrapped: false,
            },
        );
        await waitUntilFocused(namedChildren['pibling']);
    });

    it('navigates to pibling within groups', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(
            html`
                <div ${nav(group)}>
                    <div class="first-focus" ${nav()}></div>
                    <div ${nav()}></div>
                </div>
                <div ${nav(group)}>
                    <div class="second-focus" ${nav()}></div>
                    <div ${nav()}></div>
                </div>
            `,
            [
                'first-focus',
                'second-focus',
            ],
        );

        focusElement(namedChildren['first-focus']);
        await waitUntilFocused(namedChildren['first-focus']);

        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Right}),
            {
                success: true,
                defaulted: false,
                newElement: namedChildren['second-focus'],
                wrapped: false,
            },
        );
        await waitUntilFocused(namedChildren['second-focus']);
    });

    it('fails pibling nav if blocked by wrap', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested1dNav = directChildren[directChildren.length - 1];
        assertDefined(withNested1dNav);
        const nested1dNav = withNested1dNav.children[0];
        assertInstanceOf(nested1dNav, HTMLElement);
        nested1dNav.focus();
        await waitUntilFocused(nested1dNav);

        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Down}),
            {
                success: false,
                reason: 'wrapping blocked',
            },
        );
    });

    it('fails nav if blocked by wrap', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(defaultTestTemplate);

        namedChildren['end-nested-child'].focus();
        await waitUntilFocused(namedChildren['end-nested-child']);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Right}),
            {
                success: false,
                reason: 'wrapping blocked',
            },
        );
    });

    it('succeeds pibling nav even if pibling has no children', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested2dNav = directChildren[2];
        assertDefined(withNested2dNav);
        const nested2dNav = withNested2dNav.children[0];
        assertInstanceOf(nested2dNav, HTMLElement);
        const nextNavPibling = directChildren[3];
        assertDefined(nextNavPibling);

        nested2dNav.focus();
        await waitUntilFocused(nested2dNav);

        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Down}),
            {
                success: true,
                defaulted: false,
                newElement: nextNavPibling,
                wrapped: false,
            },
        );
    });

    it('can navigate 2d nodes horizontally', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested2dNav = directChildren[2];
        assertDefined(withNested2dNav);
        const nested2dNav = withNested2dNav.children[0];
        assertInstanceOf(nested2dNav, HTMLElement);
        const nested2dNavSibling = withNested2dNav.children[1];
        assertInstanceOf(nested2dNavSibling, HTMLElement);

        nested2dNav.focus();
        await waitUntilFocused(nested2dNav);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Right}),
            {
                success: true,
                defaulted: false,
                newElement: nested2dNavSibling,
                wrapped: false,
            },
        );

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Left}),
            {
                success: true,
                defaulted: false,
                newElement: nested2dNav,
                wrapped: false,
            },
        );
    });

    it('can navigate 2d nodes vertically', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested2dNav = directChildren[2];
        assertDefined(withNested2dNav);
        const nested2dNav = withNested2dNav.children[0];
        assertInstanceOf(nested2dNav, HTMLElement);
        const nested2dNavVerticalSibling = withNested2dNav.children[3];
        assertInstanceOf(nested2dNavVerticalSibling, HTMLElement);

        nested2dNav.focus();
        await waitUntilFocused(nested2dNav);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Down}),
            {
                success: true,
                defaulted: false,
                newElement: nested2dNavVerticalSibling,
                wrapped: false,
            },
        );

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Up}),
            {
                success: true,
                defaulted: false,
                newElement: nested2dNav,
                wrapped: false,
            },
        );
    });

    it('handles shorter 2d rows', async () => {
        const {navController, namedChildren} = await setupNavControllerTest(defaultTestTemplate);

        const startingNested2dNav = namedChildren['parent-2d'].children[2];
        assertInstanceOf(startingNested2dNav, HTMLElement);
        const nested2dNavVerticalSibling = namedChildren['parent-2d'].children[4];
        assertInstanceOf(nested2dNavVerticalSibling, HTMLElement);
        const nested2dNavPreviousSibling = namedChildren['parent-2d'].children[1];
        assertInstanceOf(nested2dNavPreviousSibling, HTMLElement);

        startingNested2dNav.focus();
        await waitUntilFocused(startingNested2dNav);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Down}),
            {
                success: true,
                defaulted: false,
                newElement: nested2dNavVerticalSibling,
                wrapped: false,
            },
        );

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Up}),
            {
                success: true,
                defaulted: false,
                newElement: nested2dNavPreviousSibling,
                wrapped: false,
            },
        );
    });

    it('can navigate 1d nodes horizontally', async () => {
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested1dNav = directChildren[directChildren.length - 1];
        assertDefined(withNested1dNav);
        const nested1dNav = withNested1dNav.children[0];
        assertInstanceOf(nested1dNav, HTMLElement);
        const nested1dNavSibling = withNested1dNav.children[1];
        assertInstanceOf(nested1dNavSibling, HTMLElement);

        nested1dNav.focus();
        await waitUntilFocused(nested1dNav);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Right}),
            {
                success: true,
                defaulted: false,
                newElement: nested1dNavSibling,
                wrapped: false,
            },
        );

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: false, direction: NavDirection.Left}),
            {
                success: true,
                defaulted: false,
                newElement: nested1dNav,
                wrapped: false,
            },
        );
    });

    it('fails to navigate when there is only one node', async () => {
        const {navController, directChildren} = await setupNavControllerTest(
            html`
                <div ${nav()}></div>
            `,
            [],
        );

        const onlyChild = directChildren[0];
        assertInstanceOf(onlyChild, HTMLElement);

        onlyChild.focus();
        await waitUntilFocused(onlyChild);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: true, direction: NavDirection.Right}),
            {
                success: false,
                reason: 'failed to find node to focus',
            },
        );
    });

    it('fails on 2d nodes with the same coords', async () => {
        const {navController} = await setupNavControllerTest(
            html`
                <div ${nav(0, 0)}></div>
                <div ${nav(0, 0)}></div>
            `,
            [],
        );

        assertThrows(
            () => {
                navController.navigate({allowWrapping: true, direction: NavDirection.Right});
            },
            {matchMessage: 'Parent already has child at'},
        );
    });

    it('fails on group node with no children', async () => {
        const {navController} = await setupNavControllerTest(
            html`
                <div ${nav(group)}></div>
            `,
            [],
        );

        assertThrows(
            () => {
                navController.navigate({allowWrapping: true, direction: NavDirection.Right});
            },
            {matchMessage: 'group nav has no children'},
        );
    });

    it('defaults to first child in 2d nav root', async () => {
        const {navController, directChildren} = await setupNavControllerTest(
            html`
                <div ${nav(0, 0)}></div>
                <div ${nav(0, 1)}></div>
            `,
            [],
        );

        const firstChild = directChildren[0];
        assertInstanceOf(firstChild, HTMLElement);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: true, direction: NavDirection.Right}),
            {
                success: true,
                defaulted: true,
                newElement: firstChild,
                wrapped: false,
            },
        );
    });

    it('enters into nothing when nothing is focused', async () => {
        const {navController} = await setupNavControllerTest(defaultTestTemplate);

        assert.deepStrictEqual(navController.enterInto(), {
            success: false,
            reason: 'no focused node to enter into',
        });
    });
});
