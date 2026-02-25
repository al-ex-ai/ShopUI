// ============================================================
// AST Node Types — The structured representation of parsed DSL
// ============================================================

export interface SourceLocation {
  line: number;
  column: number;
}

/** Root node: a screen definition */
export interface ScreenASTNode {
  kind: "screen";
  name: string;
  properties: PropertyASTNode[];
  children: ChildASTNode[];
  location: SourceLocation;
}

/** A key-value property assignment (e.g., `content: "Hello"`) */
export interface PropertyASTNode {
  kind: "property";
  name: string;
  value: ValueASTNode;
  location: SourceLocation;
}

/** A component usage (e.g., `text { content: "Hello" }`) */
export interface ComponentASTNode {
  kind: "component";
  type: string;
  properties: PropertyASTNode[];
  children: ChildASTNode[];
  location: SourceLocation;
}

/** A conditional block (e.g., `if cart.count > 0 { ... }`) */
export interface ConditionalASTNode {
  kind: "conditional";
  field: string;
  operator: string;
  value: ValueASTNode | null;
  children: ChildASTNode[];
  location: SourceLocation;
}

/** A loop/each block (e.g., `each products as product { ... }`) */
export interface LoopASTNode {
  kind: "loop";
  source: string;
  itemAlias: string;
  children: ChildASTNode[];
  location: SourceLocation;
}

/** Possible children inside a component or screen */
export type ChildASTNode = ComponentASTNode | ConditionalASTNode | LoopASTNode;

/** Value types in properties */
export type ValueASTNode =
  | { kind: "string"; value: string }
  | { kind: "number"; value: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "reference"; path: string }
  | { kind: "action"; actionType: string; args: ValueASTNode[] }
  | { kind: "object"; entries: PropertyASTNode[] };
