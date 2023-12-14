import {itCases} from '@augment-vir/browser-testing';
import {fixture as renderFixture} from '@open-wc/testing';
import {HTMLTemplateResult, html} from 'element-vir';
import {AttributesMap, applyAttributes, readAttributes} from './attributes';

describe(applyAttributes.name, () => {
    async function testApplyAttributes(template: HTMLTemplateResult, attributes: AttributesMap) {
        const baseElement = await renderFixture(template);

        applyAttributes(baseElement, attributes);

        return baseElement.outerHTML;
    }
    itCases(testApplyAttributes, [
        {
            it: 'applies a basic attribute',
            inputs: [
                html`
                    <div></div>
                `,
                {
                    'my-attribute': 'hello',
                },
            ],
            expect: '<div my-attribute="hello"></div>',
        },
        {
            it: 'applies a boolean attribute',
            inputs: [
                html`
                    <div></div>
                `,
                {
                    'bool-attribute': true,
                },
            ],
            expect: '<div bool-attribute=""></div>',
        },
        {
            it: 'removes a false attribute',
            inputs: [
                html`
                    <div class="hello there"></div>
                `,
                {
                    class: false,
                },
            ],
            expect: '<div></div>',
        },
        {
            it: 'does not clash with other existing attributes',
            inputs: [
                html`
                    <div class="hello there" id="yo"></div>
                `,
                {
                    'another-attribute': 'value',
                },
            ],
            expect: '<div class="hello there" id="yo" another-attribute="value"></div>',
        },
        {
            it: 'overwrites identical attributes',
            inputs: [
                html`
                    <div id="yo"></div>
                `,
                {
                    id: 'new id',
                },
            ],
            expect: '<div id="new id"></div>',
        },
    ]);
});

describe(readAttributes.name, () => {
    async function testReadAttributes(template: HTMLTemplateResult) {
        const baseElement = await renderFixture(template);

        return readAttributes(baseElement);
    }
    itCases(testReadAttributes, [
        {
            it: 'reads no attributes',
            input: html`
                <div></div>
            `,
            expect: {},
        },
        {
            it: 'reads different attributes',
            input: html`
                <div class="hello" id="goodbye"></div>
            `,
            expect: {
                class: 'hello',
                id: 'goodbye',
            },
        },
        {
            it: 'reads identical attributes',
            input: html`
                <div class="hello" class="another class"></div>
            `,
            expect: {
                class: 'hello',
            },
        },
        {
            it: 'reads boolean attributes',
            input: html`
                <div checked data-nav></div>
            `,
            expect: {
                checked: '',
                'data-nav': '',
            },
        },
    ]);
});
