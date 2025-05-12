import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {html} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {waitUntilFocused} from '../util/focus.js';
import {enterInto} from './enter-into.js';
import {createMockNavController} from './mock-nav-controller.js';
import {NavDirection} from './navigate.js';

/** Note that most of enterInto's functionality is tested in the NavController tests. */
describe(enterInto.name, () => {
    it('fails when not possible to enter', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <div>
                    <div class="parent" ${nav(navController)}>
                        <div class="child" ${nav(navController, {x: 0, y: 1})}></div>
                    </div>
                </div>
            `;
        });

        assert.isTrue(
            navController.navigate({allowWrapping: false, direction: NavDirection.Right}).success,
        );
        await waitUntilFocused(
            assertWrap.instanceOf(fixture.querySelector('.parent'), HTMLDivElement),
        );

        const child = assertWrap.instanceOf(fixture.querySelector('.child'), HTMLDivElement);

        assert.isTrue(navController.enterInto().success);
        await waitUntilFocused(child);
        assert.isFalse(navController.enterInto().success);
        await waitUntilFocused(child);
    });
    it('enters into an element', async () => {
        const {fixture, navController} = await createMockNavController((navController) => {
            return html`
                <div>
                    <div class="parent" ${nav(navController)}>
                        <div class="child" ${nav(navController, {x: 0, y: 1})}></div>
                    </div>
                </div>
            `;
        });

        assert.isTrue(
            navController.navigate({allowWrapping: false, direction: NavDirection.Right}).success,
        );
        await waitUntilFocused(
            assertWrap.instanceOf(fixture.querySelector('.parent'), HTMLDivElement),
        );

        assert.isTrue(navController.enterInto().success);
        await waitUntilFocused(
            assertWrap.instanceOf(fixture.querySelector('.child'), HTMLDivElement),
        );
    });
});
