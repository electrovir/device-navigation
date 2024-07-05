import {assert, fixture} from '@open-wc/testing';
import {html} from 'element-vir';
import {assertInstanceOf} from 'run-time-assertions';
import {nav} from '../directives/nav.directive';
import {NavNode, NavRootNode} from '../nav-tree/nav-tree';
import {waitUntilFocused} from '../test/focus.test-helper';
import {enterInto} from './enter-into';

/** Note that most of enterInto's functionality is tested in the NavController tests. */
describe(enterInto.name, () => {
    it('fails if it cannot find a new child to focus', async () => {
        const rootElement = await fixture(html`
            <div ${nav()}>
                <div ${nav(0, 1)}></div>
            </div>
        `);
        assertInstanceOf(rootElement, HTMLDivElement);

        const childElement = rootElement.querySelector('div');
        assertInstanceOf(childElement, HTMLDivElement);

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

        assert.deepStrictEqual(enterInto(mockNavTree), {
            success: false,
            reason: 'failed to find first child to enter into',
        });
    });
});
