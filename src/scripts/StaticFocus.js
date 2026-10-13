// Only focusable while it has focus. If the tabindex is left on, some screen
// readers announce the whole element as a control.
function focusStaticElement(element, focusOptions) {
  element.tabIndex = -1;
  element.addEventListener('blur', () => element.removeAttribute('tabindex'), {
    once: true,
  });
  element.focus(focusOptions);
}

export { focusStaticElement };
