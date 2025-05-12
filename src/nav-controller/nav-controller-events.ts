import {defineTypedCustomEvent} from 'typed-event-target';
import {type NavAction, type NavigationResult} from './navigate.js';

/**
 * This event is emitted from `NavController` when a nav exit is triggered.
 *
 * @category Events
 */
export class NavExitEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Exit>>()(
    'nav-exit-event',
) {}
/**
 * This event is emitted from `NavController` when a nav enter is triggered.
 *
 * @category Events
 */
export class NavEnterEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Enter>>()(
    'nav-exit-event',
) {}
/**
 * This event is emitted from `NavController` when a normal navigation is triggered.
 *
 * @category Events
 */
export class NavigateEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Navigate>>()(
    'navigate-event',
) {}
/**
 * This event is emitted from `NavController` when a pibling navigation is triggered.
 *
 * @category Events
 */
export class NavPiblingEvent extends defineTypedCustomEvent<NavigationResult<NavAction.Pibling>>()(
    'navigate-pibling-event',
) {}

/**
 * All possible `NavController` events.
 *
 * @category Internal
 */
export type AllNavControllerEvents = NavExitEvent | NavEnterEvent | NavigateEvent | NavPiblingEvent;
