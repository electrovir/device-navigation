import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {css, defineElement, html} from 'element-vir';
import {NavController} from '../nav-controller/nav-controller.js';
import {extractNavEntry, navAttribute, type NavListener} from './nav-entry.js';
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
