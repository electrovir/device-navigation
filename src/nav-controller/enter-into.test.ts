import {assert} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {html} from 'element-vir';
import {nav} from '../directives/nav.directive.js';
import {type NavNode, type NavRootNode} from '../nav-tree/nav-tree.js';
import {waitUntilFocused} from '../util/focus.js';
import {enterInto} from './enter-into.js';
import {NavAction} from './navigate.js';

/** Note that most of enterInto's functionality is tested in the NavController tests. */
describe(enterInto.name, () => {
    it('fails if it cannot find a new child to focus', async () => {
        const rootElement = await testWeb.render(html`
            <div ${nav()}>
                <div ${nav(0, 1)}></div>
            </div>
        `);
        assert.instanceOf(rootElement, HTMLDivElement);

        const childElement = rootElement.querySelector('div');
        assert.instanceOf(childElement, HTMLDivElement);

        rootElement.focus();
        await waitUntilFocused(rootElement);

        const nestedChildArray: NavNode[] = [];
        /**
         * Intentionally do not insert this element into the 0-index position. This is in order to
         * test the edge case in question.
         */
        nestedChildArray[1] = {
            type: 'child',
            element: childElement,
            coords: {
                x: 1,
                y: 0,
            },
            isGroup: false,
        };

        const mockNavTree: NavRootNode = {
            children: [
                {
                    children: [nestedChildArray],
                    element: rootElement,
                    type: '2d',
                    coords: {
                        x: 0,
                        y: 0,
                    },
                    isGroup: false,
                },
            ],
            isRoot: true,
            type: '1d',
            isGroup: false,
        };

        assert.deepEquals(enterInto(mockNavTree), {
            success: false,
            reason: 'failed to find first child to enter into',
            direction: undefined,
            navAction: NavAction.Enter,
        });
    });
});
