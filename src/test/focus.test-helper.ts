import {waitUntil} from '@open-wc/testing';

export async function waitUntilFocused(
    element: Element,
    message?: string | undefined,
): Promise<void> {
    await waitUntil(() => {
        return element.matches(':focus');
    }, message);
}

export async function waitUntilBlurred(
    element: Element,
    message?: string | undefined,
): Promise<void> {
    await waitUntil(() => {
        return !element.matches(':focus');
    }, message);
}
