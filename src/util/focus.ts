export function focusElement(element: HTMLElement) {
    element.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'center'});
    element.focus();
}

export function isFocused(element: Element): boolean {
    return element.matches(':focus');
}
