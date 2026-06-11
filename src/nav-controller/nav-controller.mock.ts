import {assert} from '@augment-vir/assert';
import {makeWritable} from '@augment-vir/common';
import {html, type HTMLTemplateResult} from 'element-vir';
import {NavController, type NavControllerOptions} from './nav-controller.js';

/**
 * Creates a mock {@link NavController} instance and attaches the callback's output template to it.
 *
 * @category Util
 */
export async function createMockNavController(
    templateCallback: (navController: NavController) => HTMLTemplateResult,
    options: Readonly<NavControllerOptions> = {},
) {
    const {testWeb} = await import('@augment-vir/test');
    const navController = new NavController(undefined as any, options);
    const fixture = await testWeb.render(html`
        <div>${templateCallback(navController)}</div>
    `);
    assert.instanceOf(fixture, HTMLElement);
    makeWritable(navController).rootElement = fixture;

    return {
        fixture,
        navController,
    };
}
