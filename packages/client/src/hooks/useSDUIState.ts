import { useState, useCallback } from "react";

/**
 * Manages local state for SDUI form bindings.
 *
 * When the schema has input components with "binding" props,
 * this hook manages the state and provides setters.
 */
export function useSDUIState(initialState: Record<string, unknown> = {}) {
  const [state, setState] = useState<Record<string, unknown>>(initialState);

  const getValue = useCallback(
    (path: string): unknown => {
      const parts = path.split(".");
      let current: unknown = state;
      for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = (current as Record<string, unknown>)[part];
      }
      return current;
    },
    [state]
  );

  const setValue = useCallback((path: string, value: unknown) => {
    setState((prev) => {
      const parts = path.split(".");
      const newState = { ...prev };
      let current: Record<string, unknown> = newState;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        current[part] = { ...(current[part] as Record<string, unknown>) };
        current = current[part] as Record<string, unknown>;
      }

      current[parts[parts.length - 1]] = value;
      return newState;
    });
  }, []);

  return { state, getValue, setValue };
}
