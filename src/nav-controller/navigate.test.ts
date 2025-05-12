import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {type NavAction, type NavDirection, type NavigationResult} from './navigate.js';

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
