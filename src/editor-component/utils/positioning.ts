export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PopoverPosition {
  top: number;
  left: number;
  placement: 'above' | 'below';
}

export function getCaretCoordinates(element: HTMLElement): AnchorRect | null {
  const root = element.getRootNode();
  const selection =
    root instanceof ShadowRoot
      ? (root as ShadowRoot & { getSelection?: () => Selection | null }).getSelection?.() ??
        window.getSelection()
      : window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  if (rect.width === 0 && rect.height === 0) {
    const span = document.createElement('span');
    span.textContent = '\u200b';
    range.insertNode(span);
    const spanRect = span.getBoundingClientRect();
    span.parentNode?.removeChild(span);
    selection.removeAllRanges();
    selection.addRange(range);
    return {
      x: spanRect.left,
      y: spanRect.top,
      width: 0,
      height: spanRect.height,
    };
  }

  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export function calculatePopoverPosition(
  anchor: AnchorRect,
  popoverHeight: number,
  popoverWidth: number,
  viewportPadding: number = 8,
): PopoverPosition {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  let placement: 'above' | 'below' = 'below';
  let top = anchor.y + anchor.height + 4;
  let left = anchor.x;

  const spaceBelow = viewportHeight - (anchor.y + anchor.height);
  if (spaceBelow < popoverHeight && anchor.y > popoverHeight) {
    placement = 'above';
    top = anchor.y - popoverHeight - 4;
  }

  if (left + popoverWidth > viewportWidth - viewportPadding) {
    left = viewportWidth - popoverWidth - viewportPadding;
  }
  if (left < viewportPadding) {
    left = viewportPadding;
  }

  return { top, left, placement };
}
