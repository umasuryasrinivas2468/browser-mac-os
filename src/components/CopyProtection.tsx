import React, { useEffect } from 'react';

const CopyProtection: React.FC = () => {
  useEffect(() => {
    // Add copy protection class to body
    document.body.classList.add('copy-protected');
    
    // Disable right-click context menu
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for copying, printing, etc.
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // Disable Ctrl+A (Select All)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+C (Copy)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+V (Paste)
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+X (Cut)
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection
    const disableSelection = () => {
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
    };

    // Clear clipboard periodically
    const clearClipboard = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch (error) {
        // Silently handle clipboard access errors
      }
    };

    // Disable drag and drop
    const disableDragDrop = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableKeyboardShortcuts);
    document.addEventListener('selectstart', disableSelection);
    document.addEventListener('dragstart', disableDragDrop);
    document.addEventListener('drop', disableDragDrop);

    // Clear clipboard every 5 seconds
    const clipboardInterval = setInterval(clearClipboard, 5000);

    // Disable developer tools detection
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    const detectDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          // Optionally redirect or show warning
          console.clear();
        }
      } else {
        devtools.open = false;
      }
    };

    const devToolsInterval = setInterval(detectDevTools, 500);

    // Cleanup function
    return () => {
      document.body.classList.remove('copy-protected');
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('selectstart', disableSelection);
      document.removeEventListener('dragstart', disableDragDrop);
      document.removeEventListener('drop', disableDragDrop);
      clearInterval(clipboardInterval);
      clearInterval(devToolsInterval);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default CopyProtection;