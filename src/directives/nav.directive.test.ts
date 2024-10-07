import {assert, waitUntil} from '@augment-vir/assert';
import {getObjectTypedKeys, typedMap, wrapInTry} from '@augment-vir/common';
import {describe, it, itCases, testWeb} from '@augment-vir/test';
import {getCenterOfElement, getDirectChildren} from '@augment-vir/web';
import {sendKeys, sendMouse} from '@web/test-runner-commands';
import {HTMLTemplateResult, css, html} from 'element-vir';
import {waitUntilBlurred, waitUntilFocused} from '../util/focus.js';
import {group} from './nav-value.js';
import {
    getCurrentGlobalNavSettings,
    nav,
    navAttribute,
    navSelector,
    resetGlobalNavSettings,
    setGlobalNavSettings,
} from './nav.directive.js';

describe('navAttribute', () => {
    it('query selects elements with the directive', async () => {
        const baseElement = await testWeb.render(html`
            <div>
                <div data-nav="0,2"></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        `);

        const matchedElements = baseElement.querySelectorAll(navAttribute.js(2));

        assert.isLengthExactly(matchedElements, 1);
    });

    it('applies CSS', async () => {
        const styles = css`
            ${navAttribute.css(2)} {
                border: 5px solid red;
            }
        `;

        const baseElement = await testWeb.render(html`
            <div>
                <style>
                    ${styles}>
                </style>
                <div id="get-me" data-nav="0,2"></div>
            </div>
        `);

        const matchedElement = baseElement.querySelector('#get-me');
        assert.isDefined(matchedElement);
        const computedStyles = window.getComputedStyle(matchedElement);

        assert.strictEquals(computedStyles.border, '5px solid rgb(255, 0, 0)');
    });
});

describe('NavSettings', () => {
    it('can be written to', () => {
        const defaultSettings = getCurrentGlobalNavSettings();

        setGlobalNavSettings({activateKeys: ['nothing']});
        const newSettings = getCurrentGlobalNavSettings();

        assert.deepEquals(getCurrentGlobalNavSettings(), {activateKeys: ['nothing']});
        assert.notDeepEquals(defaultSettings, newSettings);

        resetGlobalNavSettings();
        assert.deepEquals(getCurrentGlobalNavSettings(), defaultSettings);
    });
});

describe(nav.name, () => {
    async function testNavAttributes(template: HTMLTemplateResult) {
        const baseElement = await testWeb.render(template);

        return baseElement.outerHTML;
    }
    itCases(testNavAttributes, [
        {
            it: 'applies nav attributes without any inputs',
            input: html`
                <div ${nav()}></div>
            `,
            expect: '<div data-nav="" tabindex="0" style="cursor: pointer;"></div>',
        },
        {
            it: 'applies 2d nav attributes',
            input: html`
                <div ${nav(0, 2)}></div>
            `,
            expect: '<div data-nav="0,2" tabindex="0" style="cursor: pointer;"></div>',
        },
        {
            it: 'does not overwrite an existing tabindex',
            input: html`
                <div ${nav()} tabindex="3"></div>
            `,
            expect: '<div tabindex="3" data-nav="" style="cursor: pointer;"></div>',
        },
        {
            it: 'does not overwrite an existing cursor style',
            input: html`
                <div ${nav()} tabindex="3" style="cursor: auto;"></div>
            `,
            expect: '<div tabindex="3" style="cursor: auto;" data-nav=""></div>',
        },
    ]);

    function matchSelectors(
        element: HTMLElement,
        selectorValues: Readonly<Record<keyof typeof navSelector.js, boolean>>,
    ) {
        getObjectTypedKeys(selectorValues).forEach((selectorKey) => {
            const selectorValue = selectorValues[selectorKey];
            assert.strictEquals(element.matches(navSelector.js[selectorKey]('')), selectorValue);
            assert.strictEquals(
                element.matches(String(navSelector.css[selectorKey](''))),
                selectorValue,
            );
        });
    }

    async function setupListenerTest() {
        const childStyle = css`
            width: 100px;
            height: 100px;
        `;
        const rootElement = await testWeb.render(html`
            <div ${nav(group)}>
                <div style=${childStyle} ${nav()}></div>
                <div style=${childStyle} ${nav()}></div>
            </div>
        `);
        assert.instanceOf(rootElement, HTMLElement);

        const navChildren = getDirectChildren(rootElement).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
        );
        assert.isLengthAtLeast(navChildren, 2);

        return {navChildren};
    }

    it('activates a nav element with an activate key', async () => {
        const {navChildren} = await setupListenerTest();
        const child = navChildren[0];

        matchSelectors(child, {click: false, selected: false});

        child.focus();
        await waitUntilFocused(child);

        matchSelectors(child, {click: false, selected: true});

        await sendKeys({down: 'Enter'});

        matchSelectors(child, {click: true, selected: true});

        await sendKeys({up: 'Enter'});

        matchSelectors(child, {click: false, selected: true});
    });

    it('loses activated class when element is blurred', async () => {
        const {navChildren} = await setupListenerTest();
        const child = navChildren[0];

        matchSelectors(child, {click: false, selected: false});

        child.focus();
        await waitUntilFocused(child);

        matchSelectors(child, {click: false, selected: true});

        child.blur();
        await waitUntilBlurred(child);

        matchSelectors(child, {click: false, selected: false});
    });

    it('activates a nav element with mouse clicks', async () => {
        const {navChildren} = await setupListenerTest();
        const child = navChildren[0];

        matchSelectors(child, {click: false, selected: false});

        const childCenter = getCenterOfElement(child);
        const childMousePosition: [number, number] = [
            childCenter.x,
            childCenter.y,
        ];
        await sendMouse({
            position: childMousePosition,
            type: 'move',
        });
        await waitUntilFocused(child);

        matchSelectors(child, {click: false, selected: true});

        await sendMouse({
            type: 'down',
        });

        await waitUntil.isTrue(() =>
            wrapInTry(
                () => {
                    matchSelectors(child, {click: true, selected: true});
                    return true;
                },
                {
                    fallbackValue: false,
                },
            ),
        );

        await sendMouse({
            type: 'up',
        });

        matchSelectors(child, {click: false, selected: true});

        await sendMouse({
            position: typedMap(childMousePosition, (entry) => entry + 500),
            type: 'move',
        });
        await waitUntilBlurred(child);

        matchSelectors(child, {click: false, selected: false});
    });
});
