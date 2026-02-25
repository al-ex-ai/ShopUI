import { componentRegistry } from "./ComponentRegistry";
import { SDUIFallback } from "../components/SDUIFallback";

// Component imports — register all known components
import { SDUIText } from "../components/SDUIText";
import { SDUIButton } from "../components/SDUIButton";
import { SDUICard } from "../components/SDUICard";
import { SDUIImage } from "../components/SDUIImage";
import { SDUIInput } from "../components/SDUIInput";
import { SDUIContainer } from "../components/SDUIContainer";
import { SDUIGrid } from "../components/SDUIGrid";
import { SDUIList } from "../components/SDUIList";
import { SDUIDivider } from "../components/SDUIDivider";
import { SDUISpacer } from "../components/SDUISpacer";
import { SDUIBadge } from "../components/SDUIBadge";

// Register all components
componentRegistry.register("text", SDUIText as never);
componentRegistry.register("button", SDUIButton as never);
componentRegistry.register("card", SDUICard as never);
componentRegistry.register("image", SDUIImage as never);
componentRegistry.register("input", SDUIInput as never);
componentRegistry.register("container", SDUIContainer as never);
componentRegistry.register("grid", SDUIGrid as never);
componentRegistry.register("list", SDUIList as never);
componentRegistry.register("divider", SDUIDivider as never);
componentRegistry.register("spacer", SDUISpacer as never);
componentRegistry.register("badge", SDUIBadge as never);

interface SDUINode {
  type: string;
  version?: number;
  props: Record<string, unknown>;
  children?: SDUINode[];
  layout?: Record<string, unknown>;
  condition?: Record<string, unknown>;
  loop?: { source: string; itemAlias: string };
  fallback?: SDUINode;
  dataSource?: string;
}

interface RendererProps {
  node: SDUINode;
  onAction: (action: { type: string; [key: string]: unknown }) => void | Promise<void>;
  onInputChange?: (binding: string, value: string) => void;
  inputValues?: Record<string, unknown>;
}

/**
 * SDUIRenderer — The core recursive renderer.
 *
 * This is the engine that turns a JSON schema into a live React UI.
 * It walks the component tree, looks up each type in the registry,
 * and renders the corresponding React component with its props.
 */
export function SDUIRenderer({ node, onAction, onInputChange, inputValues }: RendererProps) {
  const Component = componentRegistry.get(node.type);

  if (!Component) {
    // Unknown component — render fallback
    if (node.fallback) {
      return (
        <SDUIRenderer
          node={node.fallback}
          onAction={onAction}
          onInputChange={onInputChange}
          inputValues={inputValues}
        />
      );
    }
    return <SDUIFallback type={node.type} version={node.version} />;
  }

  // Render children recursively
  const children = node.children?.map((child, index) => (
    <SDUIRenderer
      key={`${child.type}-${index}`}
      node={child}
      onAction={onAction}
      onInputChange={onInputChange}
      inputValues={inputValues}
    />
  ));

  // Resolve input value from state
  const resolvedProps = { ...node.props };
  if (node.type === "input" && node.props.binding && inputValues) {
    const binding = node.props.binding as string;
    const parts = binding.split(".");
    let value: unknown = inputValues;
    for (const part of parts) {
      if (value === null || value === undefined) break;
      value = (value as Record<string, unknown>)[part];
    }
    resolvedProps.value = (value as string) ?? "";
    resolvedProps.onChange = onInputChange;
  }

  return (
    <Component
      {...resolvedProps}
      layout={node.layout}
      onAction={onAction}
      onInputChange={onInputChange}
      inputValues={inputValues}
    >
      {children}
    </Component>
  );
}
