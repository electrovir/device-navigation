import {assert} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {html} from 'element-vir';
import {waitUntilFocused} from '../util/focus.js';

describe(waitUntilFocused.name, () => {
    it('can detect focused elements', async () => {
        const rootElement = await testWeb.render(html`
            <div>
                <div></div>
                <div></div>
                <div></div>
                <div class="focus-me" tabindex="0"></div>
                <div></div>
                <div></div>
            </div>
        `);

        const elementToFocus = rootElement.querySelector('.focus-me');
        assert.instanceOf(elementToFocus, HTMLElement);
        elementToFocus.focus();

        await waitUntilFocused(elementToFocus);
    });
});
