import type { ComponentType, ReactNode } from "react";

/**
 * Component Registry — Maps SDUI type strings to React components.
 *
 * This is the client-side counterpart of the schema registry.
 * Each platform (web, iOS, Android) has its own registry mapping
 * the same type strings to native components.
 */

export interface SDUIComponentProps {
  [key: string]: unknown;
  children?: ReactNode;
  onAction: (action: { type: string; [key: string]: unknown }) => void | Promise<void>;
  onInputChange?: (binding: string, value: string) => void;
  inputValues?: Record<string, unknown>;
  layout?: Record<string, unknown>;
}

type SDUIComponent = ComponentType<SDUIComponentProps>;

class ComponentRegistry {
  private components = new Map<string, SDUIComponent>();

  register(type: string, component: SDUIComponent): void {
    this.components.set(type, component);
  }

  get(type: string): SDUIComponent | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }

  getAll(): string[] {
    return Array.from(this.components.keys());
  }
}

export const componentRegistry = new ComponentRegistry();
