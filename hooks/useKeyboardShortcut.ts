import { useEffect } from "react";

interface UseKeyboardShortcutProps {
  key: string;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  onKeyDown: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcut({
  key,
  modifiers = {},
  onKeyDown,
  preventDefault = true,
}: UseKeyboardShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const {
        ctrl = false,
        shift = false,
        alt = false,
        meta = false,
      } = modifiers;

      const isModifierMatch =
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta;

      if (event.key.toLowerCase() === key.toLowerCase() && isModifierMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        onKeyDown();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, modifiers, onKeyDown, preventDefault]);
}
