import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

export const MODAL_ROOT_ATTR = 'data-modal-root';

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([aria-hidden="true"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(el: HTMLElement): boolean {
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const st = window.getComputedStyle(el);
  if (st.display === 'none' || st.visibility === 'hidden') return false;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 && rect.height <= 0) return false;
  return true;
}

function isSkipped(el: HTMLElement): boolean {
  return el.closest('[data-skip-enter-focus]') != null;
}

/** Các phần tử có thể focus trong một modal (không lấy focusable của modal lồng nhau). */
export function getModalFocusableElements(modalRoot: HTMLElement): HTMLElement[] {
  const nodes = Array.from(modalRoot.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return nodes.filter((el) => {
    if (!isVisible(el)) return false;
    if (isSkipped(el)) return false;
    if (el.tabIndex < 0) return false;
    const seg = el.closest(`[${MODAL_ROOT_ATTR}]`);
    if (seg !== modalRoot) return false;
    return true;
  });
}

/** Chỉ từ input text-like / select: Enter → phần tử kế (textarea giữ xuống dòng). */
export function shouldMoveFocusToNextOnEnter(active: Element | null): boolean {
  if (!active || !(active instanceof HTMLElement)) return false;
  if (isSkipped(active)) return false;
  if (active.closest('[data-combobox-open="true"]')) return false;
  if (active instanceof HTMLTextAreaElement) return false;
  if (active instanceof HTMLInputElement) {
    const t = active.type;
    if (
      ['hidden', 'checkbox', 'radio', 'file', 'button', 'submit', 'reset', 'image'].includes(t)
    ) {
      return false;
    }
    return !active.disabled;
  }
  if (active instanceof HTMLSelectElement) return !active.disabled;
  return false;
}

function hasRequiredConstraint(el: HTMLElement): boolean {
  if (
    !(el instanceof HTMLInputElement) &&
    !(el instanceof HTMLSelectElement) &&
    !(el instanceof HTMLTextAreaElement)
  ) {
    return false;
  }
  return el.required || el.getAttribute('aria-required') === 'true';
}

/** Ô bắt buộc (required / aria-required) mà chưa hợp lệ → không cho Enter sang ô sau. */
export function fieldFailsRequiredConstraint(el: HTMLElement): boolean {
  if (
    !(el instanceof HTMLInputElement) &&
    !(el instanceof HTMLSelectElement) &&
    !(el instanceof HTMLTextAreaElement)
  ) {
    return false;
  }
  if (el.disabled) return false;
  if (
    (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
    el.readOnly
  ) {
    return false;
  }
  if (!hasRequiredConstraint(el)) return false;
  if (el.required) {
    return !el.checkValidity();
  }
  if (el instanceof HTMLInputElement) {
    const t = el.type;
    if (['checkbox', 'radio', 'hidden', 'button', 'submit', 'file', 'image'].includes(t)) {
      return false;
    }
    return el.value.trim() === '';
  }
  if (el instanceof HTMLSelectElement) {
    return el.value.trim() === '';
  }
  if (el instanceof HTMLTextAreaElement) {
    return el.value.trim() === '';
  }
  return false;
}

function reportRequiredConstraintViolation(el: HTMLElement): void {
  if (
    !(el instanceof HTMLInputElement) &&
    !(el instanceof HTMLSelectElement) &&
    !(el instanceof HTMLTextAreaElement)
  ) {
    return;
  }
  if (el.required) {
    el.reportValidity();
    return;
  }
  if (el.getAttribute('aria-required') === 'true') {
    el.setCustomValidity('Vui lòng điền trường bắt buộc.');
    el.reportValidity();
    el.setCustomValidity('');
  }
}

export function handleModalEnterNavigation(
  event: ReactKeyboardEvent,
  modalRoot: HTMLElement | null
): void {
  if (event.key !== 'Enter') return;
  if (event.nativeEvent.isComposing) return;
  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
  if (!modalRoot) return;
  const active = document.activeElement as HTMLElement | null;
  if (!active || !modalRoot.contains(active)) return;
  const segment = active.closest(`[${MODAL_ROOT_ATTR}]`);
  if (segment !== modalRoot) return;
  if (!shouldMoveFocusToNextOnEnter(active)) return;

  if (fieldFailsRequiredConstraint(active)) {
    event.preventDefault();
    reportRequiredConstraintViolation(active);
    return;
  }

  event.preventDefault();
  const list = getModalFocusableElements(modalRoot);
  const i = list.indexOf(active);
  const nextIdx = i >= 0 ? i + 1 : 0;
  const next = nextIdx < list.length ? list[nextIdx] : list[0] ?? null;
  if (next) {
    next.focus();
    if (
      next instanceof HTMLInputElement &&
      ['text', 'search', 'url', 'tel', 'email', 'password', 'number', 'date', ''].includes(
        next.type
      )
    ) {
      try {
        next.select();
      } catch {
        /* ignore */
      }
    }
  }
}
