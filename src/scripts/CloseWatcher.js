import { useEffect } from 'react';

// On Android, Back is how you close something that opened. A dialog doesn't add
// a history entry, so Back would leave the page instead. A CloseWatcher tells
// the browser there's something open for Back to close. Browsers that don't
// have it behave the way they always did.
//
// onOpenChange has to be the same function on every render, like a state
// setter. A new function would make a new watcher, and the browser only allows
// one per user activation.
function useCloseWatcher(open, onOpenChange) {
  useEffect(() => {
    if (!open || !('CloseWatcher' in window)) {
      return undefined;
    }

    const watcher = new window.CloseWatcher();
    watcher.addEventListener('close', () => onOpenChange(false));
    return () => watcher.destroy();
  }, [onOpenChange, open]);
}

export { useCloseWatcher };
