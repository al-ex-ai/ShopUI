import type { SDUINode, SDUIScreen } from "./types.js";
import type { SchemaRegistry } from "./registry.js";

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Validates an SDUI screen against the schema registry.
 * Ensures all component types are known and required props are present.
 */
export function validateScreen(
  screen: SDUIScreen,
  registry: SchemaRegistry
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!screen.id) {
    errors.push({ path: "screen", message: "Screen must have an id", severity: "error" });
  }

  if (!screen.children?.length) {
    errors.push({
      path: "screen.children",
      message: "Screen has no children",
      severity: "warning",
    });
  }

  for (let i = 0; i < (screen.children?.length ?? 0); i++) {
    validateNode(screen.children![i], `screen.children[${i}]`, registry, errors);
  }

  return errors;
}

function validateNode(
  node: SDUINode,
  path: string,
  registry: SchemaRegistry,
  errors: ValidationError[]
): void {
  const definition = registry.get(node.type, node.version);

  if (!definition) {
    errors.push({
      path,
      message: `Unknown component type "${node.type}"${node.version ? `@v${node.version}` : ""}`,
      severity: node.fallback ? "warning" : "error",
    });
    return;
  }

  for (const propDef of definition.props) {
    if (propDef.required && !(propDef.name in node.props)) {
      errors.push({
        path: `${path}.props.${propDef.name}`,
        message: `Required prop "${propDef.name}" is missing on "${node.type}"`,
        severity: "error",
      });
    }
  }

  if (node.children?.length && !definition.allowChildren) {
    errors.push({
      path: `${path}.children`,
      message: `Component "${node.type}" does not allow children`,
      severity: "error",
    });
  }

  for (let i = 0; i < (node.children?.length ?? 0); i++) {
    validateNode(node.children![i], `${path}.children[${i}]`, registry, errors);
  }

  if (node.fallback) {
    validateNode(node.fallback, `${path}.fallback`, registry, errors);
  }
}
