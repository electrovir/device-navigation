import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {defineElement, html} from 'element-vir';
import {extractNavEntry, navAttribute, NavValue} from '../directives/nav-entry.js';
import {nav} from '../directives/nav.directive.js';
import {waitUntilFocused} from '../util/focus.js';
import {NavController} from './nav-controller.js';
import {createMockNavController} from './nav-controller.mock.js';
import {NavAction, NavDirection} from './navigate.js';

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
    it('blocks perpendicular navigation only when requested', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button class="one" ${nav(navController)}>1</button>
                <button class="two" ${nav(navController)}>2</button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);
        const twoButton = assertWrap.instanceOf(fixture.querySelector('.two'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        assert.isTrue(
            navController.navigate({
                allowWrapping: false,
                direction: NavDirection.Down,
            }).success,
        );
        await waitUntilFocused(twoButton);

        twoButton.focus();
        await waitUntilFocused(twoButton);

        assert.deepEquals(
            navController.navigate({
                allowWrapping: false,
                blockPerpendicularNavigation: true,
                direction: NavDirection.Down,
            }),
            {
                success: false,
                direction: NavDirection.Down,
                navAction: NavAction.Navigate,
                reason: 'failed to find node to focus',
            },
        );
        await waitUntilFocused(twoButton);
    });

    it('moves vertically to a matching explicit x slot', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="two"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    2
                </button>
                <button
                    class="tab"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Tab
                </button>
                <button
                    class="q"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    q
                </button>
            `;
        });
        const twoButton = assertWrap.instanceOf(fixture.querySelector('.two'), HTMLButtonElement);
        const qButton = assertWrap.instanceOf(fixture.querySelector('.q'), HTMLButtonElement);

        twoButton.focus();
        await waitUntilFocused(twoButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(qButton);
        assert.strictEquals(qButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('moves vertically to the next lower x slot when the target row has a hole', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="tab"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Tab
                </button>
                <button
                    class="q"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    q
                </button>
                <button
                    class="z"
                    ${nav(navController, {
                        x: 1,
                        y: 2,
                    })}
                >
                    z
                </button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);
        const tabButton = assertWrap.instanceOf(fixture.querySelector('.tab'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(tabButton);
        assert.strictEquals(tabButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('moves horizontally through holes and returns to the remembered row', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="top-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Top Rule
                </button>
                <button
                    class="play"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    Play
                </button>
                <button
                    class="middle-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Middle Rule
                </button>
                <button
                    class="bottom-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 2,
                    })}
                >
                    Bottom Rule
                </button>
            `;
        });
        const bottomRuleButton = assertWrap.instanceOf(
            fixture.querySelector('.bottom-rule'),
            HTMLButtonElement,
        );
        const playButton = assertWrap.instanceOf(fixture.querySelector('.play'), HTMLButtonElement);

        bottomRuleButton.focus();
        await waitUntilFocused(bottomRuleButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(playButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Left,
        });

        await waitUntilFocused(bottomRuleButton);
    });

    it('returns to the remembered row after entering a tall entry below its top', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="top-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Top Rule
                </button>
                <button
                    class="upper-cell"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    Upper Cell
                </button>
                <button
                    class="middle-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Middle Rule
                </button>
                <button
                    class="play"
                    ${nav(navController, {
                        height: Infinity,
                        x: 1,
                        y: 1,
                    })}
                >
                    Play
                </button>
                <button
                    class="bottom-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 2,
                    })}
                >
                    Bottom Rule
                </button>
            `;
        });
        const bottomRuleButton = assertWrap.instanceOf(
            fixture.querySelector('.bottom-rule'),
            HTMLButtonElement,
        );
        const playButton = assertWrap.instanceOf(fixture.querySelector('.play'), HTMLButtonElement);

        bottomRuleButton.focus();
        await waitUntilFocused(bottomRuleButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(playButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Left,
        });

        await waitUntilFocused(bottomRuleButton);
    });

    it('navigates backward from an infinitely tall entry and wraps forward', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="upper-cell"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    Upper Cell
                </button>
                <button
                    class="play"
                    ${nav(navController, {
                        height: Infinity,
                        x: 1,
                        y: 1,
                    })}
                >
                    Play
                </button>
                <button
                    class="bottom-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Bottom Rule
                </button>
                <button
                    class="lower-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 2,
                    })}
                >
                    Lower Rule
                </button>
            `;
        });
        const upperCell = assertWrap.instanceOf(
            fixture.querySelector('.upper-cell'),
            HTMLButtonElement,
        );
        const playButton = assertWrap.instanceOf(fixture.querySelector('.play'), HTMLButtonElement);
        const bottomRuleButton = assertWrap.instanceOf(
            fixture.querySelector('.bottom-rule'),
            HTMLButtonElement,
        );

        bottomRuleButton.focus();
        await waitUntilFocused(bottomRuleButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(playButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Up,
        });

        await waitUntilFocused(upperCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(playButton);

        assert.isFalse(
            navController.navigate({
                allowWrapping: false,
                direction: NavDirection.Down,
            }).success,
        );
        await waitUntilFocused(playButton);

        assert.isTrue(
            navController.navigate({
                allowWrapping: true,
                direction: NavDirection.Down,
            }).success,
        );
        await waitUntilFocused(upperCell);
    });

    it('navigates backward from an infinitely wide entry and wraps forward', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="left-cell"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Left Cell
                </button>
                <button
                    class="wide-cell"
                    ${nav(navController, {
                        width: Infinity,
                        x: 1,
                        y: 0,
                    })}
                >
                    Wide Cell
                </button>
            `;
        });
        const leftCell = assertWrap.instanceOf(
            fixture.querySelector('.left-cell'),
            HTMLButtonElement,
        );
        const wideCell = assertWrap.instanceOf(
            fixture.querySelector('.wide-cell'),
            HTMLButtonElement,
        );

        leftCell.focus();
        await waitUntilFocused(leftCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(wideCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Left,
        });

        await waitUntilFocused(leftCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(wideCell);

        assert.isFalse(
            navController.navigate({
                allowWrapping: false,
                direction: NavDirection.Right,
            }).success,
        );
        await waitUntilFocused(wideCell);

        assert.isTrue(
            navController.navigate({
                allowWrapping: true,
                direction: NavDirection.Right,
            }).success,
        );
        await waitUntilFocused(leftCell);
    });

    it('moves vertically in the current column after visiting another column', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="top-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Top Rule
                </button>
                <button
                    class="play"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    Play
                </button>
                <button
                    class="middle-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Middle Rule
                </button>
            `;
        });
        const middleRuleButton = assertWrap.instanceOf(
            fixture.querySelector('.middle-rule'),
            HTMLButtonElement,
        );
        const playButton = assertWrap.instanceOf(fixture.querySelector('.play'), HTMLButtonElement);
        const topRuleButton = assertWrap.instanceOf(
            fixture.querySelector('.top-rule'),
            HTMLButtonElement,
        );

        playButton.focus();
        await waitUntilFocused(playButton);
        middleRuleButton.focus();
        await waitUntilFocused(middleRuleButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Up,
        });

        await waitUntilFocused(topRuleButton);
    });

    it('moves horizontally in the current row after visiting another row', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="top-left"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Top Left
                </button>
                <button
                    class="top-right"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    Top Right
                </button>
                <button
                    class="bottom-left"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Bottom Left
                </button>
                <button
                    class="bottom-right"
                    ${nav(navController, {
                        x: 1,
                        y: 1,
                    })}
                >
                    Bottom Right
                </button>
            `;
        });
        const bottomLeftButton = assertWrap.instanceOf(
            fixture.querySelector('.bottom-left'),
            HTMLButtonElement,
        );
        const bottomRightButton = assertWrap.instanceOf(
            fixture.querySelector('.bottom-right'),
            HTMLButtonElement,
        );
        const topRightButton = assertWrap.instanceOf(
            fixture.querySelector('.top-right'),
            HTMLButtonElement,
        );

        topRightButton.focus();
        await waitUntilFocused(topRightButton);
        bottomLeftButton.focus();
        await waitUntilFocused(bottomLeftButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(bottomRightButton);
    });

    it('moves down to the aligned cell after visiting another column in a grid', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="top-first"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Top First
                </button>
                <button
                    class="top-second"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    Top Second
                </button>
                <button
                    class="disabled-cell"
                    ${nav(navController, {
                        disabled: true,
                        x: 0,
                        y: 1,
                    })}
                >
                    Disabled Cell
                </button>
                <button
                    class="source-cell"
                    ${nav(navController, {
                        x: 1,
                        y: 1,
                    })}
                >
                    Source Cell
                </button>
                <button
                    class="target-first"
                    ${nav(navController, {
                        x: 0,
                        y: 2,
                    })}
                >
                    Target First
                </button>
                <button
                    class="target-second"
                    ${nav(navController, {
                        x: 1,
                        y: 2,
                    })}
                >
                    Target Second
                </button>
            `;
        });
        const sourceCell = assertWrap.instanceOf(
            fixture.querySelector('.source-cell'),
            HTMLButtonElement,
        );
        const targetFirst = assertWrap.instanceOf(
            fixture.querySelector('.target-first'),
            HTMLButtonElement,
        );
        const targetSecond = assertWrap.instanceOf(
            fixture.querySelector('.target-second'),
            HTMLButtonElement,
        );

        targetFirst.focus();
        await waitUntilFocused(targetFirst);
        sourceCell.focus();
        await waitUntilFocused(sourceCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(targetSecond);
    });

    it('uses a vertical hole fallback only when returning to its origin row', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="top-cell"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Top Cell
                </button>
                <button
                    class="disabled-cell"
                    ${nav(navController, {
                        disabled: true,
                        x: 0,
                        y: 1,
                    })}
                >
                    Disabled Cell
                </button>
                <button
                    class="middle-cell"
                    ${nav(navController, {
                        x: 1,
                        y: 1,
                    })}
                >
                    Middle Cell
                </button>
                <button
                    class="bottom-first"
                    ${nav(navController, {
                        x: 0,
                        y: 2,
                    })}
                >
                    Bottom First
                </button>
                <button
                    class="bottom-second"
                    ${nav(navController, {
                        x: 1,
                        y: 2,
                    })}
                >
                    Bottom Second
                </button>
            `;
        });
        const topCell = assertWrap.instanceOf(
            fixture.querySelector('.top-cell'),
            HTMLButtonElement,
        );
        const middleCell = assertWrap.instanceOf(
            fixture.querySelector('.middle-cell'),
            HTMLButtonElement,
        );
        const bottomSecond = assertWrap.instanceOf(
            fixture.querySelector('.bottom-second'),
            HTMLButtonElement,
        );

        topCell.focus();
        await waitUntilFocused(topCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(middleCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Up,
        });

        await waitUntilFocused(topCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(middleCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(bottomSecond);
    });

    it('uses a horizontal hole fallback only when returning to its origin column', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="left-cell"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Left Cell
                </button>
                <button
                    class="disabled-cell"
                    ${nav(navController, {
                        disabled: true,
                        x: 1,
                        y: 0,
                    })}
                >
                    Disabled Cell
                </button>
                <button
                    class="middle-cell"
                    ${nav(navController, {
                        x: 1,
                        y: 1,
                    })}
                >
                    Middle Cell
                </button>
                <button
                    class="right-first"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    Right First
                </button>
                <button
                    class="right-second"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    Right Second
                </button>
            `;
        });
        const leftCell = assertWrap.instanceOf(
            fixture.querySelector('.left-cell'),
            HTMLButtonElement,
        );
        const middleCell = assertWrap.instanceOf(
            fixture.querySelector('.middle-cell'),
            HTMLButtonElement,
        );
        const rightSecond = assertWrap.instanceOf(
            fixture.querySelector('.right-second'),
            HTMLButtonElement,
        );

        leftCell.focus();
        await waitUntilFocused(leftCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(middleCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Left,
        });

        await waitUntilFocused(leftCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(middleCell);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(rightSecond);
    });

    it('skips target columns with holes when requested', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="top-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Top Rule
                </button>
                <button
                    class="play"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    Play
                </button>
                <button
                    class="bottom-rule"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Bottom Rule
                </button>
                <button
                    class="next-rule"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    Next Rule
                </button>
            `;
        });
        const bottomRuleButton = assertWrap.instanceOf(
            fixture.querySelector('.bottom-rule'),
            HTMLButtonElement,
        );
        const nextRuleButton = assertWrap.instanceOf(
            fixture.querySelector('.next-rule'),
            HTMLButtonElement,
        );

        bottomRuleButton.focus();
        await waitUntilFocused(bottomRuleButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
            shouldSkipHoles: true,
        });

        await waitUntilFocused(nextRuleButton);
    });

    it('returns to the remembered column after navigating vertically through a hole', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="left"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    Left
                </button>
                <button
                    class="origin"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    Origin
                </button>
                <button
                    class="fallback"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Fallback
                </button>
            `;
        });
        const fallbackButton = assertWrap.instanceOf(
            fixture.querySelector('.fallback'),
            HTMLButtonElement,
        );
        const originButton = assertWrap.instanceOf(
            fixture.querySelector('.origin'),
            HTMLButtonElement,
        );

        originButton.focus();
        await waitUntilFocused(originButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(fallbackButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Up,
        });

        await waitUntilFocused(originButton);
    });

    it('skips target rows with holes when requested', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="tab"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                    })}
                >
                    Tab
                </button>
                <button
                    class="q"
                    ${nav(navController, {
                        x: 2,
                        y: 1,
                    })}
                >
                    q
                </button>
                <button
                    class="z"
                    ${nav(navController, {
                        x: 1,
                        y: 2,
                    })}
                >
                    z
                </button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);
        const zButton = assertWrap.instanceOf(fixture.querySelector('.z'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
            shouldSkipHoles: true,
        });

        await waitUntilFocused(zButton);
        assert.strictEquals(zButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('skips target pibling rows with holes when requested', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <section
                    ${nav(navController, {
                        group: true,
                        x: 1,
                        y: 0,
                    })}
                >
                    <button class="one" ${nav(navController)}>1</button>
                </section>
                <section
                    ${nav(navController, {
                        group: true,
                        x: 0,
                        y: 1,
                    })}
                >
                    <button class="tab" ${nav(navController)}>Tab</button>
                </section>
                <section
                    ${nav(navController, {
                        group: true,
                        x: 2,
                        y: 1,
                    })}
                >
                    <button class="q" ${nav(navController)}>q</button>
                </section>
                <section
                    ${nav(navController, {
                        group: true,
                        x: 1,
                        y: 2,
                    })}
                >
                    <button class="z" ${nav(navController)}>z</button>
                </section>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);
        const zButton = assertWrap.instanceOf(fixture.querySelector('.z'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        navController.navigatePibling({
            allowWrapping: true,
            direction: NavDirection.Down,
            shouldSkipHoles: true,
        });

        await waitUntilFocused(zButton);
        assert.strictEquals(zButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('navigates out of a wide entry from its center slot', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="two"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    2
                </button>
                <button
                    class="three"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    3
                </button>
                <button
                    class="space"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                        width: 3,
                    })}
                >
                    space
                </button>
            `;
        });
        const spaceButton = assertWrap.instanceOf(
            fixture.querySelector('.space'),
            HTMLButtonElement,
        );
        const twoButton = assertWrap.instanceOf(fixture.querySelector('.two'), HTMLButtonElement);

        spaceButton.focus();
        await waitUntilFocused(spaceButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Up,
        });

        await waitUntilFocused(twoButton);
        assert.strictEquals(twoButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('navigates into a wide entry from any slot it spans', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="one"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                    })}
                >
                    1
                </button>
                <button
                    class="two"
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                    })}
                >
                    2
                </button>
                <button
                    class="three"
                    ${nav(navController, {
                        x: 2,
                        y: 0,
                    })}
                >
                    3
                </button>
                <button
                    class="space"
                    ${nav(navController, {
                        x: 0,
                        y: 1,
                        width: 3,
                    })}
                >
                    space
                </button>
            `;
        });
        const threeButton = assertWrap.instanceOf(
            fixture.querySelector('.three'),
            HTMLButtonElement,
        );
        const spaceButton = assertWrap.instanceOf(
            fixture.querySelector('.space'),
            HTMLButtonElement,
        );

        threeButton.focus();
        await waitUntilFocused(threeButton);

        navController.navigate({
            allowWrapping: true,
            direction: NavDirection.Down,
        });

        await waitUntilFocused(spaceButton);
        assert.strictEquals(spaceButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('steps over a wide entry as a single unit when navigating horizontally', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button
                    class="space"
                    ${nav(navController, {
                        x: 0,
                        y: 0,
                        width: 3,
                    })}
                >
                    space
                </button>
                <button
                    class="edge"
                    ${nav(navController, {
                        x: 3,
                        y: 0,
                    })}
                >
                    edge
                </button>
            `;
        });
        const spaceButton = assertWrap.instanceOf(
            fixture.querySelector('.space'),
            HTMLButtonElement,
        );
        const edgeButton = assertWrap.instanceOf(fixture.querySelector('.edge'), HTMLButtonElement);

        spaceButton.focus();
        await waitUntilFocused(spaceButton);

        navController.navigate({
            allowWrapping: false,
            direction: NavDirection.Right,
        });

        await waitUntilFocused(edgeButton);
        assert.strictEquals(edgeButton.getAttribute(navAttribute.name), NavValue.Focused);
    });

    it('deactivates the currently active entry', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button class="one" ${nav(navController)}>1</button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        assert.isTrue(navController.activate().success);
        assert.strictEquals(oneButton.getAttribute(navAttribute.name), NavValue.Active);

        assert.isTrue(navController.deactivate().success);

        assert.strictEquals(oneButton.getAttribute(navAttribute.name), NavValue.Focused);
        assert.isUndefined(navController.currentNavEntry);
    });

    it('fails to deactivate when no entry is active', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <button class="one" ${nav(navController)}>1</button>
            `;
        });
        const oneButton = assertWrap.instanceOf(fixture.querySelector('.one'), HTMLButtonElement);

        oneButton.focus();
        await waitUntilFocused(oneButton);

        assert.deepEquals(navController.deactivate(), {
            success: false,
            direction: undefined,
            navAction: NavAction.Activate,
            reason: 'No active NavEntry to deactivate.',
        });
    });

    it('fails to activate a focused group', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <section
                    class="group"
                    ${nav(navController, {
                        group: true,
                    })}
                >
                    <button ${nav(navController)}>Child</button>
                </section>
            `;
        });
        const group = assertWrap.instanceOf(fixture.querySelector('.group'), HTMLElement);
        const groupNavEntry = assertWrap.isDefined(extractNavEntry(group));

        navController.triggerNavEntry(groupNavEntry, true, NavAction.Focus);

        assert.deepEquals(navController.activate(), {
            success: false,
            direction: undefined,
            navAction: NavAction.Activate,
            reason: 'Cannot activate a group',
        });
    });

    it('fails to deactivate an active group', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <section
                    class="group"
                    ${nav(navController, {
                        group: true,
                    })}
                >
                    <button ${nav(navController)}>Child</button>
                </section>
            `;
        });
        const group = assertWrap.instanceOf(fixture.querySelector('.group'), HTMLElement);
        const groupNavEntry = assertWrap.isDefined(extractNavEntry(group));

        navController.triggerNavEntry(groupNavEntry, true, NavAction.Activate);

        assert.deepEquals(navController.deactivate(), {
            success: false,
            direction: undefined,
            navAction: NavAction.Activate,
            reason: 'Cannot deactivate a group',
        });
    });

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

    it('does not throw when exiting after the active entry is removed from the DOM', async () => {
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
        const navController = assertWrap.isDefined(extractNavEntry(settingsButton)).navController;

        settingsButton.focus();
        await waitUntilFocused(settingsButton);
        assert.isTrue(navController.activate().success);

        host.assignInputs({
            showSettings: true,
        });
        await host.updateComplete;

        const result = navController.exitOutOf();

        assert.deepEquals(
            {
                success: result.success,
                navAction: result.navAction,
            },
            {
                success: false,
                navAction: NavAction.Exit,
            },
        );
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
