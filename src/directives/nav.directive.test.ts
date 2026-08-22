import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {waitForAnimationFrame} from '@augment-vir/web';
import {css, defineElement, html} from 'element-vir';
import {NavController} from '../nav-controller/nav-controller.js';
import {waitUntilFocused} from '../util/focus.js';
import {extractNavEntry, navAttribute, NavValue, type NavListener} from './nav-entry.js';
import {nav} from './nav.directive.js';

const NavListenerTestElement = defineElement<{
    activateListener: NavListener;
}>()({
    tagName: 'nav-listener-test-element',
    state({host}) {
        return {
            navController: new NavController(host),
        };
    },
    render({inputs, state}) {
        return html`
            <button
                class="target"
                ${nav(state.navController, {
                    listeners: {
                        activate: inputs.activateListener,
                    },
                })}
            >
                Target
            </button>
        `;
    },
});

const NavAutoFocusTestElement = defineElement<{
    showButton: boolean;
    targetX: number;
}>()({
    tagName: 'nav-auto-focus-test-element',
    state({host}) {
        return {
            navController: new NavController(host),
        };
    },
    render({inputs, state}) {
        if (!inputs.showButton) {
            return html``;
        }

        return html`
            <button
                class="target"
                ${nav(state.navController, {
                    autoFocus: true,
                    x: inputs.targetX,
                })}
            >
                Target
            </button>
            <button
                class="other"
                ${nav(state.navController, {
                    x: 1,
                })}
            >
                Other
            </button>
        `;
    },
});

describe(nav.name, () => {
    it('updates listener callbacks without marking the nav tree dirty', async () => {
        const firstActivateListener: NavListener = () => undefined;
        const secondActivateListener: NavListener = () => undefined;

        const host = assertWrap.instanceOf(
            await testWeb.render(html`
                <${NavListenerTestElement.assign({
                    activateListener: firstActivateListener,
                })}></${NavListenerTestElement}>
            `),
            NavListenerTestElement,
        );
        const button = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.target'),
            HTMLButtonElement,
        );
        const navEntry = assertWrap.isDefined(extractNavEntry(button));

        assert.strictEquals(navEntry.navParams.listeners?.activate, firstActivateListener);

        navEntry.navController.needsUpdate = false;

        host.assignInputs({
            activateListener: secondActivateListener,
        });
        await host.updateComplete;

        assert.strictEquals(navEntry.navParams.listeners.activate, secondActivateListener);
        assert.isFalse(navEntry.navController.needsUpdate);
    });

    it('focuses dynamically rendered auto-focus entries', async () => {
        const host = assertWrap.instanceOf(
            await testWeb.render(html`
                <${NavAutoFocusTestElement.assign({
                    showButton: false,
                    targetX: 0,
                })}></${NavAutoFocusTestElement}>
            `),
            NavAutoFocusTestElement,
        );

        host.assignInputs({
            showButton: true,
            targetX: 0,
        });
        await host.updateComplete;

        const button = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.target'),
            HTMLButtonElement,
        );
        await waitUntilFocused(button);

        assert.strictEquals(button.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('does not refocus auto-focus entries after nav updates', async () => {
        const host = assertWrap.instanceOf(
            await testWeb.render(html`
                <${NavAutoFocusTestElement.assign({
                    showButton: false,
                    targetX: 0,
                })}></${NavAutoFocusTestElement}>
            `),
            NavAutoFocusTestElement,
        );
        host.assignInputs({
            showButton: true,
            targetX: 0,
        });
        await host.updateComplete;

        const targetButton = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.target'),
            HTMLButtonElement,
        );
        const otherButton = assertWrap.instanceOf(
            host.shadowRoot.querySelector('.other'),
            HTMLButtonElement,
        );
        const otherNavEntry = assertWrap.isDefined(extractNavEntry(otherButton));

        await waitUntilFocused(targetButton);
        otherNavEntry.focus(true);
        await waitUntilFocused(otherButton);

        host.assignInputs({
            showButton: true,
            targetX: 2,
        });
        await host.updateComplete;
        await waitForAnimationFrame();

        assert.strictEquals(otherButton.getAttribute(navAttribute.name), NavValue.Focused);
    });
});

describe('navAttribute', () => {
    it('query selects elements with the directive', async () => {
        const baseElement = await testWeb.render(html`
            <div>
                <div data-nav></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        `);

        const matchedElements = baseElement.querySelectorAll(navAttribute.js());

        assert.isLengthExactly(matchedElements, 1);
    });

    it('applies CSS', async () => {
        const styles = css`
            ${navAttribute.css()} {
                border: 5px solid red;
            }
        `;

        const baseElement = await testWeb.render(html`
            <div>
                <style>
                    ${styles}>
                </style>
                <div id="get-me" data-nav></div>
            </div>
        `);

        const matchedElement = baseElement.querySelector('#get-me');
        assert.isDefined(matchedElement);
        const computedStyles = window.getComputedStyle(matchedElement);

        assert.strictEquals(computedStyles.border, '5px solid rgb(255, 0, 0)');
    });
});
