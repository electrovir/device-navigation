import {fixture} from '@open-wc/testing';
import {html} from 'element-vir';
import {assertInstanceOf} from 'run-time-assertions';
import {waitUntilFocused} from './focus.test-helper';

describe(waitUntilFocused.name, () => {
    it('can detect focused elements', async () => {
        const rootElement = await fixture(html`
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
        assertInstanceOf(elementToFocus, HTMLElement);
        elementToFocus.focus();

        await waitUntilFocused(elementToFocus);
    });
});
