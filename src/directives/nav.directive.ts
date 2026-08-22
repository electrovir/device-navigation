import {assert} from '@augment-vir/assert';
import {omitObjectKeys, stringify, type AnyObject} from '@augment-vir/common';
import {type DirectiveResult} from 'element-vir';
import {type NavController} from '../nav-controller/nav-controller.js';
import {applyAttributes} from '../util/attributes.js';
import {modifyElement} from './modify-element.directive.js';
import {
    extractNavEntry,
    hasNavEntry,
    navAttribute,
    NavEntry,
    navEntryPropertyKey,
    NavValue,
    type NavParams,
} from './nav-entry.js';

/**
 * Used to determine an element's initial {@link navAttribute} value.
 *
 * @category Internal
 */
export function determineNavValue(params: Readonly<NavParams>): NavValue | '' {
    if ('group' in params) {
        return NavValue.Group;
    } else if (params.disabled) {
        return NavValue.Disabled;
    } else {
        return '';
    }
}

/**
 * Mark an element for navigation.
 *
 * This automatically applies the `tabindex` attribute and all keyboard and mouse listeners needed
 * to enable `NavController` functionality.
 *
 * @category Main
 */
export function nav(
    navController: NavController,
    params: Readonly<NavParams> = {},
): DirectiveResult {
    return modifyElement(
        stringify(
            omitObjectKeys(params, [
                'autoFocus',
                'listeners',
            ]),
        ),
        (element) => {
            navController.needsUpdate = true;
            const isNavigable: boolean =
                /** Groups are not directly navigable. */
                !params.group &&
                /** Disabled entries are not navigable. */
                !params.disabled;

            assert.instanceOf(element, HTMLElement);

            const existingNavEntry = extractNavEntry(element);
            const navEntry = existingNavEntry || new NavEntry(element, navController, params);

            const allAttributes = {
                [navAttribute.name]: isNavigable
                    ? navEntry.navValue || determineNavValue(params)
                    : determineNavValue(params),
                tabindex: isNavigable ? 0 : -1,
            };
            applyAttributes(element, allAttributes);

            if (hasNavEntry(element)) {
                navEntry.navParams = params;
                navEntry.navController = navController;
            } else {
                (element as AnyObject)[navEntryPropertyKey] = navEntry;
            }

            if (!existingNavEntry && params.autoFocus && isNavigable) {
                window.requestAnimationFrame(() => {
                    extractNavEntry(element)?.focus(true);
                });
            }

            if (isNavigable) {
                element.style.setProperty('cursor', 'pointer');
            } else {
                element.style.removeProperty('cursor');
            }

            navController.queueDefaultFocus(true);
        },
        (element) => {
            const navEntry = extractNavEntry(element);

            if (navEntry) {
                navEntry.navParams = {
                    ...navEntry.navParams,
                    listeners: params.listeners,
                };
            }
        },
    );
}
