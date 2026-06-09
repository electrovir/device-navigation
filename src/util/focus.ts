import {waitUntil} from '@augment-vir/assert';
import {isElementFocused} from '@augment-vir/web';

/**
 * Focuses an element.
 *
 * @category Util
 */
export function focusElement(element: HTMLElement) {
    element.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'center',
    });
    element.focus();
}

/**
 * Waits until an element is focused.
 *
 * @category Util
 */
export async function waitUntilFocused(
    element: Element,
    message?: string | undefined,
): Promise<void> {
    await waitUntil.isTrue(
        () => {
            return isElementFocused(element);
        },
        {},
        message,
    );
}

/**
 * Waits until an element is blurred (unfocused).
 *
 * @category Util
 */
export async function waitUntilBlurred(
    element: Element,
    message?: string | undefined,
): Promise<void> {
    await waitUntil.isTrue(
        () => {
            return !isElementFocused(element);
        },
        {},
        message,
    );
}
