// ============================================================
// SDUI Core Types — The foundation of the entire platform
// ============================================================

/** Supported layout directions (maps to flexbox concepts across all platforms) */
export type LayoutDirection = "row" | "column";

/** Cross-platform alignment values */
export type Alignment = "start" | "center" | "end" | "stretch" | "space-between";

/** Visual variants for text components */
export type TextVariant = "h1" | "h2" | "h3" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption";

/** Button visual styles */
export type ButtonStyle = "primary" | "secondary" | "outlined" | "text";

/** Input field types */
export type InputType = "text" | "email" | "password" | "number" | "tel";

// ============================================================
// Actions — Platform-agnostic interaction model
// ============================================================

export interface NavigateAction {
  type: "navigate";
  target: string;
  params?: Record<string, string>;
}

export interface ApiCallAction {
  type: "api_call";
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
}

export interface SetStateAction {
  type: "set_state";
  key: string;
  value: unknown;
}

export interface AnalyticsAction {
  type: "analytics";
  event: string;
  properties?: Record<string, unknown>;
}

export type SDUIAction = NavigateAction | ApiCallAction | SetStateAction | AnalyticsAction;

// ============================================================
// Layout — Flexbox-like primitives that work on every platform
// ============================================================

export interface SDUILayout {
  direction?: LayoutDirection;
  spacing?: number;
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  alignment?: Alignment;
  justifyContent?: Alignment;
  flex?: number;
  wrap?: boolean;
}

// ============================================================
// Conditional — Server can include conditions in the schema
// ============================================================

export interface SDUICondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "exists" | "not_exists";
  value?: unknown;
}

// ============================================================
// Node — The universal building block
// ============================================================

export interface SDUINode {
  /** Component type identifier (e.g., "text", "button", "card") */
  type: string;

  /** Component version for backward compatibility */
  version?: number;

  /** Component-specific properties */
  props: Record<string, unknown>;

  /** Child nodes for container components */
  children?: SDUINode[];

  /** Layout configuration */
  layout?: SDUILayout;

  /** Conditional rendering — only render if condition is met */
  condition?: SDUICondition;

  /** Fallback node to render if this component type is unknown to the client */
  fallback?: SDUINode;

  /** Data binding — path to dynamic data (e.g., "products", "user.name") */
  dataSource?: string;

  /** Loop — render children for each item in the data source */
  loop?: {
    source: string;
    itemAlias: string;
  };
}

// ============================================================
// Screen — Top-level wrapper for a full page/view
// ============================================================

export interface SDUIScreen {
  /** Unique screen identifier */
  id: string;

  /** Human-readable screen name */
  name: string;

  /** Schema version for this screen */
  schemaVersion: number;

  /** Root layout configuration */
  layout: SDUILayout;

  /** Component tree */
  children: SDUINode[];

  /** Screen-level metadata */
  meta?: {
    title?: string;
    description?: string;
    cacheTTL?: number;
    analytics?: { screenName: string; properties?: Record<string, unknown> };
  };

  /** Data context — server-provided data available to all components */
  data?: Record<string, unknown>;
}

// ============================================================
// Server Response — What the BFF actually returns
// ============================================================

export interface SDUIResponse {
  screen: SDUIScreen;
  serverTimestamp: string;
  clientCapabilities?: string[];
}

// ============================================================
// Component Definition — For the schema registry
// ============================================================

export interface ComponentPropDef {
  name: string;
  type: "string" | "number" | "boolean" | "action" | "object" | "array";
  required?: boolean;
  default?: unknown;
  description?: string;
}

export interface ComponentDefinition {
  type: string;
  version: number;
  description: string;
  props: ComponentPropDef[];
  allowChildren: boolean;
  /** Previous version this is backward-compatible with */
  compatibleWith?: number[];
}
