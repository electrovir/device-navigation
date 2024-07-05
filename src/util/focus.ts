/**
 * Focuses an element.
 *
 * @category Utils
 */
export function focusElement(element: HTMLElement) {
    element.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'center'});
    element.focus();
}
/**
 * Checks if an element is focused.
 *
 * @category Utils
 */
export function isFocused(element: Element): boolean {
    return element.matches(':focus');
}
