import {assert} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {type NavNodeParent} from '../nav-tree/nav-tree.js';
import {
    findDefaultChild,
    type NavAction,
    type NavDirection,
    type NavigationResult,
} from './navigate.js';

/**
 * This is all that {@link findDefaultChild} actually cares about for its inputs, but the types make
 * it hard to restrict them.
 */
type NodeForFindingDefault =
    | {children: (NodeForFindingDefault | {type: 'child'})[]; type: '1d'; isGroup: boolean}
    | {children: (NodeForFindingDefault | {type: 'child'})[][]; type: '2d'; isGroup: boolean};

describe(findDefaultChild.name, () => {
    function testFindDefaultChild(input: NodeForFindingDefault) {
        return findDefaultChild(input as NavNodeParent) as NodeForFindingDefault | undefined;
    }

    itCases(testFindDefaultChild, [
        {
            it: 'returns nothing if no children were found',
            input: {children: [], isGroup: false, type: '1d'},
            expect: undefined,
        },
        {
            it: 'recurses into a group',
            input: {
                children: [
                    {
                        children: [
                            {children: [], type: '2d', isGroup: false},
                        ],
                        type: '1d',
                        isGroup: true,
                    },
                ],
                isGroup: false,
                type: '1d',
            },
            expect: {children: [], type: '2d', isGroup: false},
        },
    ]);
});

describe('NavigationResult', () => {
    it('properly scopes direction', () => {
        assert.tsType<NavigationResult['direction']>().equals<NavDirection | undefined>();
        assert.tsType<NavigationResult<NavAction.Enter>['direction']>().equals<undefined>();
        assert.tsType<NavigationResult<NavAction.Exit>['direction']>().equals<undefined>();
        assert.tsType<NavigationResult<NavAction.Navigate>['direction']>().equals<NavDirection>();
        assert.tsType<NavigationResult<NavAction.Pibling>['direction']>().equals<NavDirection>();
    });
    it('properly assigns action', () => {
        assert.tsType<NavigationResult<NavAction.Enter>['navAction']>().equals<NavAction.Enter>();
        assert.tsType<NavigationResult<NavAction.Exit>['navAction']>().equals<NavAction.Exit>();
        assert
            .tsType<NavigationResult<NavAction.Navigate>['navAction']>()
            .equals<NavAction.Navigate>();
        assert
            .tsType<NavigationResult<NavAction.Pibling>['navAction']>()
            .equals<NavAction.Pibling>();
    });
});
