import {assert, fixture} from '@open-wc/testing';
import {html} from 'element-vir';
import {assertInstanceOf} from 'run-time-assertions';
import {nav} from '../directives/nav.directive';
import {buildNavTree} from '../nav-tree/nav-tree';
import {waitUntilFocused} from '../test/focus.test-helper';
import {exitOutOf} from './exit-out-of';

describe(exitOutOf.name, () => {
    it('fails if there is no currently focused node', async () => {
        const rootElement = await fixture(html`
            <div ${nav()}>
                <div ${nav(0, 1)}></div>
            </div>
        `);
        assertInstanceOf(rootElement, HTMLDivElement);

        const childElement = rootElement.querySelector('div');
        assertInstanceOf(childElement, HTMLDivElement);

        const navTree = buildNavTree(rootElement);

        assert.deepStrictEqual(exitOutOf(navTree), {
            success: false,
            reason: 'no focused node to exit out of',
        });
    });

    it('focuses a parent element', async () => {
        const rootElement = await fixture(html`
            <main>
                <div ${nav()}>
                    <div class="nested-child" ${nav()}></div>
                </div>
            </main>
        `);
        assertInstanceOf(rootElement, HTMLElement);

        const childElement = rootElement.querySelector('.nested-child');
        assertInstanceOf(childElement, HTMLDivElement);

        childElement.focus();
        await waitUntilFocused(childElement);

        const navTree = buildNavTree(rootElement);

        assert.isTrue(exitOutOf(navTree).success);
    });
});
