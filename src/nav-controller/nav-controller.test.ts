import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {defineElement, html} from 'element-vir';
import {extractNavEntry, navAttribute, NavValue} from '../directives/nav-entry.js';
import {nav} from '../directives/nav.directive.js';
import {waitUntilFocused} from '../util/focus.js';
import {NavController} from './nav-controller.js';
import {createMockNavController} from './nav-controller.mock.js';
import {NavAction, NavDirection} from './navigate.js';

const NavControllerTestElement = defineElement<{
    showSettings: boolean;
}>()({
    tagName: 'nav-controller-test-element',
    state({host}) {
        return {
            navController: new NavController(host, {
                alwaysRequireFocused: true,
            }),
        };
    },
    render({inputs, state}) {
        if (inputs.showSettings) {
            return html`
                <button class="back" ${nav(state.navController)}>Back</button>
            `;
        } else {
            return html`
                <button class="resume" ${nav(state.navController)}>Resume</button>
                <button class="settings" ${nav(state.navController)}>Settings</button>
            `;
        }
    },
});

describe(NavController.name, () => {
    it('moves vertically to a matching explicit x slot', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="two"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    2
                </button>
                <button
                    class="tab"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Tab
                </button>
                <button
                    class="q"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    q
                </button>
            `;
        });
        const twoButton = assertWrap.instanceOf(fixture.querySelector('.two'), HTMLButtonElement);
        const qButton = assertWrap.instanceOf(fixture.querySelector('.q'), HTMLButtonElement);

        twoButton.focus();
        await waitUntilFocused(twoButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(qButton);
        assert.strictEquals(qButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('moves vertically to the next lower x slot when the target row has a hole', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="tab"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Tab
                </button>
                <button
                    class="q"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    q
                </button>
                <button
                    class="z"
                    ${nav(navController, {
                        x: 1,
                        y: 2,
                    })}
                >
                    z
                </button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);
        const tabButton = assertWrap.instanceOf(fixture.querySelector('.tab'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(tabButton);
        assert.strictEquals(tabButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('skips target rows with holes when requested', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="tab"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Tab
                </button>
                <button
                    class="q"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    q
                </button>
                <button
                    class="z"
                    ${nav(navController, {
                        x: 1,
                        y: 2,
                    })}
                >
                    z
                </button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);
        const zButton = assertWrap.instanceOf(fixture.querySelector('.z'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
            shouldSkipHoles: true,
        });

        await waitUntilFocused(zButton);
        assert.strictEquals(zButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('skips target pibling rows with holes when requested', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <section
                    ${nav(navController, {
                        group: true,
                        x: 1,
                        y: 0,
                    })}
                >
                    <button class="one" ${nav(navController)}>1</button>
                </section>
                <section
                    ${nav(navController, {
                        group: true,
                        x: 0,
                        y: 1,
                    })}
                >
                    <button class="tab" ${nav(navController)}>Tab</button>
                </section>
                <section
                    ${nav(navController, {
                        group: true,
                        x: 2,
                        y: 1,
                    })}
                >
                    <button class="q" ${nav(navController)}>q</button>
                </section>
                <section
                    ${nav(navController, {
                        group: true,
                        x: 1,
                        y: 2,
                    })}
                >
                    <button class="z" ${nav(navController)}>z</button>
                </section>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);
        const zButton = assertWrap.instanceOf(fixture.querySelector('.z'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        navController.navigatePibling({
            allowWrapping: true,
            direction: NavDirection.Down,
            shouldSkipHoles: true,
        });

        await waitUntilFocused(zButton);
        assert.strictEquals(zButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('navigates out of a wide entry from its center slot', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="two"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    2
                </button>
                <button
                    class="three"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    3
                </button>
                <button
                    class="space"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                        width: 3,
                    })}
                >
                    space
                </button>
            `;
        });
        const spaceButton = assertWrap.instanceOf(
            fixture.querySelector('.space'),
            HTMLButtonElement,
        );
        const twoButton = assertWrap.instanceOf(fixture.querySelector('.two'), HTMLButtonElement);

        spaceButton.focus();
        await waitUntilFocused(spaceButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Up,
        });

        await waitUntilFocused(twoButton);
        assert.strictEquals(twoButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('navigates into a wide entry from any slot it spans', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="two"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    2
                </button>
                <button
                    class="three"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    3
                </button>
                <button
                    class="space"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                        width: 3,
                    })}
                >
                    space
                </button>
            `;
        });
        const threeButton = assertWrap.instanceOf(
            fixture.querySelector('.three'),
            HTMLButtonElement,
        );
        const spaceButton = assertWrap.instanceOf(
            fixture.querySelector('.space'),
            HTMLButtonElement,
        );

        threeButton.focus();
        await waitUntilFocused(threeButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(spaceButton);
        assert.strictEquals(spaceButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('steps over a wide entry as a single unit when navigating horizontally', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="space"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                        width: 3,
                    })}
                >
                    space
                </button>
                <button
                    class="edge"
                    ${nav(navController, {
                        x: 3,
                        y: 0,
                    })}
                >
                    edge
                </button>
            `;
        });
        const spaceButton = assertWrap.instanceOf(
            fixture.querySelector('.space'),
            HTMLButtonElement,
        );
        const edgeButton = assertWrap.instanceOf(fixture.querySelector('.edge'), HTMLButtonElement);

        spaceButton.focus();
        await waitUntilFocused(spaceButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(edgeButton);
        assert.strictEquals(edgeButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('deactivates the currently active entry', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button class="one" ${nav(navController)}>1</button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        assert.isTrue(navController.activate().success);
        assert.strictEquals(oneButton.getAttribute(navAttribute.name), NavValue.Active);

        assert.isTrue(navController.deactivate().success);

        assert.strictEquals(oneButton.getAttribute(navAttribute.name), NavValue.Focused);
        assert.isUndefined(navController.currentNavEntry);
    });

    it('fails to deactivate when no entry is active', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button class="one" ${nav(navController)}>1</button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        assert.deepEquals(navController.deactivate(), {
            success: false,
            direction: undefined,
            navAction: NavAction.Activate,
            reason: 'No active NavEntry to deactivate.',
        });
    });

    it('fails to activate a focused group', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <section
                    class="group"
                    ${nav(navController, {
                        group: true,
                    })}
                >
                    <button ${nav(navController)}>Child</button>
                </section>
            `;
        });
        const group = assertWrap.instanceOf(fixture.querySelector('.group'), HTMLElement);
        const groupNavEntry = assertWrap.isDefined(extractNavEntry(group));

        navController.triggerNavEntry(groupNavEntry, true, NavAction.Focus);

        assert.deepEquals(navController.activate(), {
            success: false,
            direction: undefined,
            navAction: NavAction.Activate,
            reason: 'Cannot activate a group',
        });
    });

    it('fails to deactivate an active group', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <section
                    class="group"
                    ${nav(navController, {
                        group: true,
                    })}
                >
                    <button ${nav(navController)}>Child</button>
                </section>
            `;
        });
        const group = assertWrap.instanceOf(fixture.querySelector('.group'), HTMLElement);
        const groupNavEntry = assertWrap.isDefined(extractNavEntry(group));

        navController.triggerNavEntry(groupNavEntry, true, NavAction.Activate);

        assert.deepEquals(navController.deactivate(), {
            success: false,
            direction: undefined,
            navAction: NavAction.Activate,
            reason: 'Cannot deactivate a group',
        });
    });

    it('focuses the default entry when the current entry is removed from the DOM', async () => {
        const host = assertWrap.instanceOf(
            await testWeb.render(html`
                <${NavControllerTestElement.assign({
                    showSettings: false,
                })}></${NavControllerTestElement}>
            `),
            NavControllerTestElement,
        );

        const settingsButton = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.settings'),
            HTMLButtonElement,
        );
        settingsButton.focus();
        await waitUntilFocused(settingsButton);

        host.assignInputs({
            showSettings: true,
        });
        await host.updateComplete;

        const backButton = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.back'),
            HTMLButtonElement,
        );
        await waitUntilFocused(backButton);

        assert.strictEquals(backButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('preserves focus when the current entry is reused across renders', async () => {
        const host = assertWrap.instanceOf(
            await testWeb.render(html`
                <${NavControllerTestElement.assign({
                    showSettings: true,
                })}></${NavControllerTestElement}>
            `),
            NavControllerTestElement,
        );

        const backButton = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.back'),
            HTMLButtonElement,
        );
        await waitUntilFocused(backButton);

        host.assignInputs({
            showSettings: false,
        });
        await host.updateComplete;

        const resumeButton = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.resume'),
            HTMLButtonElement,
        );
        await waitUntilFocused(resumeButton);

        assert.strictEquals(resumeButton.getAttribute(navAttribute.name), NavValue.Focused);
    });
});
