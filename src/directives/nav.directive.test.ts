import {assert} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {css, html} from 'element-vir';
import {navAttribute} from './nav-entry.js';

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
