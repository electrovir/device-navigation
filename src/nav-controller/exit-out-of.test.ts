import {assert} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {html} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {buildNavTree} from '../nav-tree/nav-tree.js';
import {waitUntilFocused} from '../util/focus.js';
import {exitOutOf} from './exit-out-of.js';

describe(exitOutOf.name, () => {
    it('fails if there is no currently focused node', async () => {
        const rootElement = await testWeb.render(html`
            <div ${nav()}>
                <div ${nav(0, 1)}></div>
            </div>
        `);
        assert.instanceOf(rootElement, HTMLDivElement);

        const childElement = rootElement.querySelector('div');
        assert.instanceOf(childElement, HTMLDivElement);

        const navTree = buildNavTree(rootElement);

        assert.deepEquals(exitOutOf(navTree), {
            success: false,
            reason: 'no focused node to exit out of',
        });
    });

    it('focuses a parent element', async () => {
        const rootElement = await testWeb.render(html`
            <main>
                <div ${nav()}>
                    <div class="nested-child" ${nav()}></div>
                </div>
            </main>
        `);
        assert.instanceOf(rootElement, HTMLElement);

        const childElement = rootElement.querySelector('.nested-child');
        assert.instanceOf(childElement, HTMLDivElement);

        childElement.focus();
        await waitUntilFocused(childElement);

        const navTree = buildNavTree(rootElement);

        assert.isTrue(exitOutOf(navTree).success);
    });
});
