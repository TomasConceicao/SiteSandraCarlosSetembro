/**
 * Image Protection Service
 *
 * Intercepts right-clicks, drag-and-drop, touch long-press and copy events on images.
 * Whenever someone attempts to save, download or drag an image, the source is dynamically
 * replaced with a completely white image (pure white SVG / base64 image).
 * As a result, the saved file appears completely blank/white, while preserving normal
 * display for visitors browsing the site.
 */

// Pure white 1920x1080 SVG data URL
const PURE_WHITE_DATA_URL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">' +
      '<rect width="100%" height="100%" fill="#ffffff"/>' +
    '</svg>'
  );

export function initImageProtection(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Track original sources to restore immediately after user interaction finishes
  const originalSources = new WeakMap<HTMLImageElement, string>();
  const originalSrcsets = new WeakMap<HTMLImageElement, string>();

  /**
   * Temporarily swaps image to pure white
   */
  const swapToWhite = (img: HTMLImageElement) => {
    // Skip logos/icons if desired, but user specified "qualquer foto do site"
    if (!originalSources.has(img)) {
      originalSources.set(img, img.src);
      if (img.srcset) {
        originalSrcsets.set(img, img.srcset);
      }
    }

    img.src = PURE_WHITE_DATA_URL;
    if (img.srcset) {
      img.srcset = '';
    }

    // Restore immediately after menu/drag action completes (250ms)
    setTimeout(() => {
      restoreOriginal(img);
    }, 300);
  };

  /**
   * Restores image back to its legitimate URL
   */
  const restoreOriginal = (img: HTMLImageElement) => {
    if (originalSources.has(img)) {
      const orig = originalSources.get(img);
      if (orig && img.src === PURE_WHITE_DATA_URL) {
        img.src = orig;
      }
      originalSources.delete(img);
    }
    if (originalSrcsets.has(img)) {
      const origSrcset = originalSrcsets.get(img);
      if (origSrcset) {
        img.srcset = origSrcset;
      }
      originalSrcsets.delete(img);
    }
  };

  /**
   * 1. Mouse down with Right Click (button === 2)
   * Fires BEFORE contextmenu opens, so browser captures the white data URL
   */
  document.addEventListener(
    'mousedown',
    (e: MouseEvent) => {
      if (e.button === 2) {
        // Right click
        const target = e.target as HTMLElement | null;
        const img = target?.closest('img');
        if (img instanceof HTMLImageElement) {
          swapToWhite(img);
        }
      }
    },
    { capture: true, passive: true }
  );

  /**
   * 2. Context Menu (Right Click Menu)
   */
  document.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const img = target?.closest('img');
      if (img instanceof HTMLImageElement) {
        swapToWhite(img);
      }
    },
    { capture: true }
  );

  /**
   * 3. Drag Start (When someone drags the photo to desktop or folder)
   * The file dragged out will be the pure white SVG image
   */
  document.addEventListener(
    'dragstart',
    (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      const img = target?.closest('img');
      if (img instanceof HTMLImageElement) {
        swapToWhite(img);
      }
    },
    { capture: true }
  );

  /**
   * 4. Touch start long press (Mobile right-click equivalent)
   */
  let touchTimer: ReturnType<typeof setTimeout> | null = null;
  document.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      const img = target?.closest('img');
      if (img instanceof HTMLImageElement) {
        touchTimer = setTimeout(() => {
          swapToWhite(img);
        }, 350); // Typical long-press threshold on mobile
      }
    },
    { capture: true, passive: true }
  );

  const cancelTouchTimer = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  };

  document.addEventListener('touchend', cancelTouchTimer, { capture: true, passive: true });
  document.addEventListener('touchcancel', cancelTouchTimer, { capture: true, passive: true });
  document.addEventListener('touchmove', cancelTouchTimer, { capture: true, passive: true });

  /**
   * 5. Intercept clipboard copy if someone selects and copies an image
   */
  document.addEventListener(
    'copy',
    (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const container = selection.getRangeAt(0).commonAncestorContainer;
      const element = container.nodeType === Node.ELEMENT_NODE ? (container as HTMLElement) : container.parentElement;
      const img = element?.querySelector('img') || element?.closest('img');
      if (img instanceof HTMLImageElement) {
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', '');
          e.clipboardData.setData('text/html', `<img src="${PURE_WHITE_DATA_URL}" alt="blank" />`);
          e.preventDefault();
        }
      }
    },
    { capture: true }
  );
}
