import {waitUntil} from '@open-wc/testing';

/**
 * Waits until an element is focused.
 *
 * @category Internals
 */
export async function waitUntilFocused(
    element: Element,
    message?: string | undefined,
): Promise<void> {
    await waitUntil(() => {
        return element.matches(':focus');
    }, message);
}

/**
 * Waits until an element is blurred (unfocused).
 *
 * @category Internals
 */
export async function waitUntilBlurred(
    element: Element,
    message?: string | undefined,
): Promise<void> {
    await waitUntil(() => {
        return !element.matches(':focus');
    }, message);
}
