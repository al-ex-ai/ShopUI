// ============================================================
// Code Generator — Transforms AST into SDUI JSON schema
// This is the final stage of the compiler pipeline
// ============================================================

import type { SDUINode, SDUIScreen, SDUIAction, SDUICondition } from "@sdui/schema";
import type {
  ScreenASTNode,
  ComponentASTNode,
  ConditionalASTNode,
  LoopASTNode,
  PropertyASTNode,
  ChildASTNode,
  ValueASTNode,
} from "./ast.js";

export class CodeGenerator {
  generate(screen: ScreenASTNode): SDUIScreen {
    const props = this.extractProperties(screen.properties);

    return {
      id: this.toKebabCase(screen.name),
      name: screen.name,
      schemaVersion: 1,
      layout: {
        direction: (props["layout"] as "row" | "column") ?? "column",
        spacing: (props["spacing"] as number) ?? 0,
        padding: (props["padding"] as number) ?? 0,
        alignment: props["alignment"] as "start" | "center" | "end" | undefined,
      },
      children: screen.children.map((child) => this.generateChild(child)),
      meta: {
        title: screen.name,
      },
    };
  }

  private generateChild(node: ChildASTNode): SDUINode {
    switch (node.kind) {
      case "component":
        return this.generateComponent(node);
      case "conditional":
        return this.generateConditional(node);
      case "loop":
        return this.generateLoop(node);
    }
  }

  private generateComponent(node: ComponentASTNode): SDUINode {
    const props = this.extractProperties(node.properties);
    const children = node.children.map((child) => this.generateChild(child));

    const sduiNode: SDUINode = {
      type: node.type,
      props,
    };

    if (children.length > 0) {
      sduiNode.children = children;
    }

    // Extract layout props from the component props
    const layoutKeys = ["direction", "spacing", "padding", "alignment", "flex", "wrap"];
    const layoutProps: Record<string, unknown> = {};
    let hasLayout = false;
    for (const key of layoutKeys) {
      if (key in props) {
        layoutProps[key] = props[key];
        delete props[key];
        hasLayout = true;
      }
    }
    if (hasLayout) {
      sduiNode.layout = layoutProps as SDUINode["layout"];
    }

    return sduiNode;
  }

  private generateConditional(node: ConditionalASTNode): SDUINode {
    const condition: SDUICondition = {
      field: node.field,
      operator: node.operator as SDUICondition["operator"],
      value: node.value ? this.resolveValue(node.value) : undefined,
    };

    return {
      type: "container",
      props: {},
      condition,
      children: node.children.map((child) => this.generateChild(child)),
    };
  }

  private generateLoop(node: LoopASTNode): SDUINode {
    return {
      type: "container",
      props: {},
      loop: {
        source: node.source,
        itemAlias: node.itemAlias,
      },
      children: node.children.map((child) => this.generateChild(child)),
    };
  }

  private extractProperties(properties: PropertyASTNode[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const prop of properties) {
      result[prop.name] = this.resolveValue(prop.value);
    }
    return result;
  }

  /** Known enum-like identifiers that should resolve to plain strings, not data references */
  private static KNOWN_IDENTIFIERS = new Set([
    "row", "column", "start", "center", "end", "stretch", "space-between",
    "primary", "secondary", "outlined", "text",
    "h1", "h2", "h3", "subtitle1", "subtitle2", "body1", "body2", "caption",
    "text", "email", "password", "number", "tel",
    "cover", "contain", "fill",
  ]);

  private resolveValue(value: ValueASTNode): unknown {
    switch (value.kind) {
      case "string":
        return value.value;
      case "number":
        return value.value;
      case "boolean":
        return value.value;
      case "reference":
        // If it's a known enum value (no dots), return as plain string
        if (!value.path.includes(".") && CodeGenerator.KNOWN_IDENTIFIERS.has(value.path)) {
          return value.path;
        }
        return `{{${value.path}}}`;
      case "action":
        return this.resolveAction(value);
      case "object": {
        const obj: Record<string, unknown> = {};
        for (const entry of value.entries) {
          obj[entry.name] = this.resolveValue(entry.value);
        }
        return obj;
      }
    }
  }

  private resolveAction(value: ValueASTNode & { kind: "action" }): SDUIAction {
    const { actionType, args } = value;

    switch (actionType) {
      case "navigate":
        return {
          type: "navigate",
          target: args[0] ? (this.resolveValue(args[0]) as string) : "/",
          params: args[1] ? (this.resolveValue(args[1]) as Record<string, string>) : undefined,
        };

      case "api_call":
        return {
          type: "api_call",
          endpoint: args[0] ? (this.resolveValue(args[0]) as string) : "/",
          method: (args[1] ? (this.resolveValue(args[1]) as string) : "POST") as SDUIAction & {
            type: "api_call";
          } extends { method: infer M } ? M : never,
          body: args[2] ? (this.resolveValue(args[2]) as Record<string, unknown>) : undefined,
        } as SDUIAction;

      case "set_state":
        return {
          type: "set_state",
          key: args[0] ? (this.resolveValue(args[0]) as string) : "",
          value: args[1] ? this.resolveValue(args[1]) : null,
        };

      case "analytics":
        return {
          type: "analytics",
          event: args[0] ? (this.resolveValue(args[0]) as string) : "",
          properties: args[1]
            ? (this.resolveValue(args[1]) as Record<string, unknown>)
            : undefined,
        };

      default:
        return {
          type: "navigate",
          target: args[0] ? (this.resolveValue(args[0]) as string) : "/",
        };
    }
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/\s+/g, "-")
      .toLowerCase();
  }
}
