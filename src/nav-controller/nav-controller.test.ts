import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {defineElement, html} from 'element-vir';
import {navAttribute, NavValue} from '../directives/nav-entry.js';
import {nav} from '../directives/nav.directive.js';
import {waitUntilFocused} from '../util/focus.js';
import {NavController} from './nav-controller.js';

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
