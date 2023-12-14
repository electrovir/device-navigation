import {getDirectChildren, getNestedChildren} from '@augment-vir/browser';
import {awaitedForEach} from '@augment-vir/common';
import {assert, fixture, waitUntil} from '@open-wc/testing';
import {HTMLTemplateResult, defineElement, html} from 'element-vir';
import {assertDefined, assertInstanceOf} from 'run-time-assertions';
import {nav, navAttribute} from '../directives/nav.directive';
import {waitUntilFocused} from '../test/focus.test-helper';
import {isFocused} from '../util/focus';
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

async function setupNavControllerTest(template: HTMLTemplateResult) {
    const element = await fixture(html`
        <${VirTestNav.assign({template})}></${VirTestNav}>
    `);
    assertInstanceOf(element, VirTestNav);
    await waitUntil(() => !!element.instanceState.navController);
    const navController = element.instanceState.navController!;
    const directChildren = getDirectChildren(element).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
    );
    const allDescendants = getNestedChildren(element).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
    );

    return {
        element,
        navController,
        directChildren,
        allDescendants,
    };
}

const defaultTestTemplate = html`
    <div></div>
    <div ${nav()}>second</div>
    <div ${nav()}>
        <div ${nav(0, 0)}>a</div>
        <div ${nav(0, 1)}>b</div>
        <div ${nav(0, 2)}>c</div>
        <div ${nav(1, 0)}>d</div>
        <div ${nav(1, 1)}>e</div>
    </div>
    <div ${nav()}>fourth</div>
    <div ${nav()}>
        <div ${nav()}>nested first</div>
        <div ${nav()}>nested second</div>
        <div ${nav()}>nested third</div>
    </div>
    <div ${nav()}>
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
        const {navController, element} = await setupNavControllerTest(defaultTestTemplate);

        const firstNavChild = element.shadowRoot.querySelector(navAttribute.selector(''));

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

        const navChildren = directChildren.filter((child) =>
            child.matches(navAttribute.selector('')),
        );

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
        const {navController} = await setupNavControllerTest(html`
            <div></div>
        `);

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
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested1dNav = directChildren[directChildren.length - 2];
        assertDefined(withNested1dNav);
        const nested1dNav = withNested1dNav.children[0];
        assertInstanceOf(nested1dNav, HTMLElement);
        nested1dNav.focus();
        await waitUntilFocused(nested1dNav);

        const withNested1dNavAgain = directChildren[directChildren.length - 1];
        assertDefined(withNested1dNavAgain);
        const nested1dNavAgain = withNested1dNavAgain.children[0];
        assertInstanceOf(nested1dNavAgain, HTMLElement);

        assert.deepStrictEqual(
            navController.navigatePibling({direction: NavDirection.Down, allowWrapping: true}),
            {
                defaulted: false,
                newElement: nested1dNavAgain,
                success: true,
                wrapped: false,
            },
        );
        await waitUntilFocused(nested1dNavAgain);
    });

    it('fails pibling nav if there is no pibling', async () => {
        const {navController} = await setupNavControllerTest(defaultTestTemplate);

        assert.deepStrictEqual(
            navController.navigatePibling({allowWrapping: false, direction: NavDirection.Up}),
            {
                success: false,
                reason: 'no focused node to exit out of',
            },
        );
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
                reason: 'not allowed to wrap',
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
        const {navController, directChildren} = await setupNavControllerTest(defaultTestTemplate);

        const withNested2dNav = directChildren[2];
        assertDefined(withNested2dNav);
        const startingNested2dNav = withNested2dNav.children[2];
        assertInstanceOf(startingNested2dNav, HTMLElement);
        const nested2dNavVerticalSibling = withNested2dNav.children[4];
        assertInstanceOf(nested2dNavVerticalSibling, HTMLElement);
        const nested2dNavPreviousSibling = withNested2dNav.children[1];
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
        const {navController, directChildren} = await setupNavControllerTest(html`
            <div ${nav()}></div>
        `);

        const onlyChild = directChildren[0];
        assertInstanceOf(onlyChild, HTMLElement);

        onlyChild.focus();
        await waitUntilFocused(onlyChild);

        assert.deepStrictEqual(
            navController.navigate({allowWrapping: true, direction: NavDirection.Right}),
            {
                success: false,
                reason: 'no other nodes to navigate to',
            },
        );
    });

    it('defaults to first child in 2d nav root', async () => {
        const {navController, directChildren} = await setupNavControllerTest(html`
            <div ${nav(0, 0)}></div>
            <div ${nav(0, 1)}></div>
        `);

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
