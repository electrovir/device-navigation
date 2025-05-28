import {defineTypedCustomEvent} from 'typed-event-target';
import {type NavAction, type NavigationResult} from './navigate.js';

/**
 * This event is emitted from `NavController` when a nav exit is triggered.
 *
 * @category Events
 */
export class NavExitEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Exit>>()(
    'nav-exit',
) {}
/**
 * This event is emitted from `NavController` when a nav activate is triggered.
 *
 * @category Events
 */
export class NavActivateEvent extends defineTypedCustomEvent<
    NavigationResult<NavAction.Activate>
>()('nav-activate') {}
/**
 * This event is emitted from `NavController` when a nav focus is triggered.
 *
 * @category Events
 */
export class NavFocusEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Focus>>()(
    'nav-focus',
) {}
/**
 * This event is emitted from `NavController` when a nav enter is triggered.
 *
 * @category Events
 */
export class NavEnterEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Enter>>()(
    'nav-enter',
) {}
/**
 * This event is emitted from `NavController` when a normal navigation is triggered.
 *
 * @category Events
 */
export class NavigateEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Navigate>>()(
    'nav-navigate',
) {}
/**
 * This event is emitted from `NavController` when a pibling navigation is triggered.
 *
 * @category Events
 */
export class NavPiblingEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Pibling>>()(
    'nav-navigate-pibling',
) {}

/**
 * All possible `NavController` events.
 *
 * @category Internal
 */
export type AllNavControllerEvents = NavExitEvent | NavEnterEvent | NavigateEvent | NavPiblingEvent;
