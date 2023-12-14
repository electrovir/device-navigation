import {getCenterOfElement, getDirectChildren} from '@augment-vir/browser';
import {itCases} from '@augment-vir/browser-testing';
import {assertLengthAtLeast, getObjectTypedKeys, typedMap, wrapInTry} from '@augment-vir/common';
import {assert, fixture, fixture as renderFixture, waitUntil} from '@open-wc/testing';
import {sendKeys, sendMouse} from '@web/test-runner-commands';
import {HTMLTemplateResult, css, html} from 'element-vir';
import {assertDefined, assertInstanceOf} from 'run-time-assertions';
import {waitUntilBlurred, waitUntilFocused} from '../test/focus.test-helper';
import {
    getCurrentNavSettings,
    nav,
    navAttribute,
    navSelector,
    resetNavSettings,
    setNavSettings,
} from './nav.directive';

describe('navAttribute', () => {
    it('query selects elements with the directive', async () => {
        const baseElement = await renderFixture(html`
            <div>
                <div data-nav="0,2"></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        `);

        const matchedElements = baseElement.querySelectorAll(navAttribute.selector(2));

        assert.lengthOf(matchedElements, 1);
    });

    it('applies CSS', async () => {
        const styles = css`
            ${navAttribute.css(2)} {
                border: 5px solid red;
            }
        `;

        const baseElement = await renderFixture(html`
            <div>
                <style>
                    ${styles}>
                </style>
                <div id="get-me" data-nav="0,2"></div>
            </div>
        `);

        const matchedElement = baseElement.querySelector('#get-me');
        assertDefined(matchedElement);
        const computedStyles = window.getComputedStyle(matchedElement);

        assert.strictEqual(computedStyles.border, '5px solid rgb(255, 0, 0)');
    });
});

describe('NavSettings', () => {
    it('can be written to', () => {
        const defaultSettings = getCurrentNavSettings();

        setNavSettings({activateKeys: ['nothing']});
        const newSettings = getCurrentNavSettings();

        assert.deepStrictEqual(getCurrentNavSettings(), {activateKeys: ['nothing']});
        assert.notDeepEqual(defaultSettings, newSettings);

        resetNavSettings();
        assert.deepStrictEqual(getCurrentNavSettings(), defaultSettings);
    });
});

describe(nav.name, () => {
    async function testNavAttributes(template: HTMLTemplateResult) {
        const baseElement = await fixture(template);

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

    async function matchSelectors(
        element: HTMLElement,
        selectorValues: Readonly<Record<keyof typeof navSelector.selector, boolean>>,
    ) {
        getObjectTypedKeys(selectorValues).forEach((selectorKey) => {
            const selectorValue = selectorValues[selectorKey];
            assert.strictEqual(
                element.matches(navSelector.selector[selectorKey]('')),
                selectorValue,
            );
            assert.strictEqual(
                element.matches(String(navSelector.css[selectorKey](''))),
                selectorValue,
            );
        });
    }

    async function setListenerTest() {
        const childStyle = css`
            width: 100px;
            height: 100px;
        `;
        const rootElement = await fixture(html`
            <div>
                <div style=${childStyle} ${nav()}></div>
                <div style=${childStyle} ${nav()}></div>
            </div>
        `);
        assertInstanceOf(rootElement, HTMLElement);

        const navChildren = getDirectChildren(rootElement).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
        );
        assertLengthAtLeast(navChildren, 2);

        return {navChildren};
    }

    it('activates a nav element with an activate key', async () => {
        const {navChildren} = await setListenerTest();
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
        const {navChildren} = await setListenerTest();
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
        const {navChildren} = await setListenerTest();
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

        await waitUntil(() =>
            wrapInTry({
                callback() {
                    matchSelectors(child, {click: true, selected: true});
                    return true;
                },
                fallbackValue: false,
            }),
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
