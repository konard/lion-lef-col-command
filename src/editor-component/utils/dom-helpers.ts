export function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function sanitizeHTML(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

const ALLOWED_TAGS = new Set([
  "b",
  "i",
  "u",
  "s",
  "em",
  "strong",
  "a",
  "br",
  "span",
  "sub",
  "sup",
  "code",
  "pre",
  "mark",
  "del",
  "ins",
]);

export function sanitizeRichHTML(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (tag, name) => {
    return ALLOWED_TAGS.has(name.toLowerCase()) ? tag : "";
  });
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
}

export function getTextContent(element: HTMLElement): string {
  return element.textContent ?? "";
}

export function setCaretPosition(element: HTMLElement, offset: number): void {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  const textNode = element.firstChild;
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    const maxOffset = Math.min(offset, textNode.textContent?.length ?? 0);
    range.setStart(textNode, maxOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function fuzzyMatch(query: string, text: string): { score: number; matched: number[] } {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const matched: number[] = [];
  let score = 0;
  let queryIdx = 0;

  for (let i = 0; i < textLower.length && queryIdx < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIdx]) {
      matched.push(i);
      score += i === 0 || textLower[i - 1] === " " || textLower[i - 1] === "-" ? 2 : 1;
      queryIdx++;
    }
  }

  if (queryIdx < queryLower.length) {
    return { score: 0, matched: [] };
  }

  return { score, matched };
}
