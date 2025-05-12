import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {html} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {waitUntilFocused} from '../util/focus.js';
import {exitOutOf} from './exit-out-of.js';
import {createMockNavController} from './mock-nav-controller.js';
import {NavDirection} from './navigate.js';

describe(exitOutOf.name, () => {
    it('fails when not possible to exit', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <div>
                    <div class="parent" ${nav(navController)}>
                        <div class="child" ${nav(navController, {x: 0, y: 1})}></div>
                    </div>
                </div>
            `;
        });

        const parent = assertWrap.instanceOf(fixture.querySelector('.parent'), HTMLDivElement);

        assert.isTrue(
            navController.navigate({allowWrapping: false, direction: NavDirection.Right}).success,
        );
        await waitUntilFocused(parent);
        assert.isFalse(navController.exitOutOf().success);
        await waitUntilFocused(parent);
    });
    it('exits out of an element', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <div>
                    <div class="parent" ${nav(navController)}>
                        <div class="child" ${nav(navController, {x: 0, y: 1})}></div>
                    </div>
                </div>
            `;
        });

        const parent = assertWrap.instanceOf(fixture.querySelector('.parent'), HTMLDivElement);

        assert.isTrue(
            navController.navigate({allowWrapping: false, direction: NavDirection.Right}).success,
        );
        await waitUntilFocused(parent);
        assert.isTrue(navController.enterInto().success);
        await waitUntilFocused(
            assertWrap.instanceOf(fixture.querySelector('.child'), HTMLDivElement),
        );
        assert.isTrue(navController.exitOutOf().success);
        await waitUntilFocused(parent);
    });
});
