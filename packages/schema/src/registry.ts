import type { ComponentDefinition, ComponentPropDef } from "./types.js";

/**
 * Schema Registry — Versioned catalog of all SDUI components.
 *
 * In production this would be backed by a database or config service.
 * Here we use an in-memory registry populated at startup.
 */
export class SchemaRegistry {
  private components = new Map<string, ComponentDefinition[]>();

  register(definition: ComponentDefinition): void {
    const key = definition.type;
    const versions = this.components.get(key) ?? [];

    const existing = versions.find((v) => v.version === definition.version);
    if (existing) {
      throw new Error(
        `Component "${key}@v${definition.version}" is already registered`
      );
    }

    versions.push(definition);
    versions.sort((a, b) => b.version - a.version);
    this.components.set(key, versions);
  }

  get(type: string, version?: number): ComponentDefinition | undefined {
    const versions = this.components.get(type);
    if (!versions?.length) return undefined;

    if (version !== undefined) {
      return versions.find((v) => v.version === version);
    }

    return versions[0];
  }

  getLatestVersion(type: string): number | undefined {
    const versions = this.components.get(type);
    return versions?.[0]?.version;
  }

  isSupported(type: string, version: number): boolean {
    const def = this.get(type, version);
    return def !== undefined;
  }

  getAllTypes(): string[] {
    return Array.from(this.components.keys());
  }

  getAllDefinitions(): ComponentDefinition[] {
    return Array.from(this.components.values()).flat();
  }
}

// ============================================================
// Default Registry — Pre-populated with built-in components
// ============================================================

function prop(
  name: string,
  type: ComponentPropDef["type"],
  required = false,
  defaultValue?: unknown
): ComponentPropDef {
  return { name, type, required, default: defaultValue };
}

export function createDefaultRegistry(): SchemaRegistry {
  const registry = new SchemaRegistry();

  registry.register({
    type: "container",
    version: 1,
    description: "Generic layout container (like a div/View)",
    props: [prop("background", "string"), prop("borderRadius", "number")],
    allowChildren: true,
  });

  registry.register({
    type: "text",
    version: 1,
    description: "Text display component",
    props: [
      prop("content", "string", true),
      prop("variant", "string", false, "body1"),
      prop("color", "string"),
      prop("align", "string"),
    ],
    allowChildren: false,
  });

  registry.register({
    type: "button",
    version: 1,
    description: "Clickable button with an action",
    props: [
      prop("label", "string", true),
      prop("action", "action", true),
      prop("style", "string", false, "primary"),
      prop("disabled", "boolean", false, false),
      prop("fullWidth", "boolean", false, false),
    ],
    allowChildren: false,
  });

  registry.register({
    type: "image",
    version: 1,
    description: "Image display component",
    props: [
      prop("src", "string", true),
      prop("alt", "string", true),
      prop("width", "number"),
      prop("height", "number"),
      prop("objectFit", "string", false, "cover"),
    ],
    allowChildren: false,
  });

  registry.register({
    type: "card",
    version: 1,
    description: "Card container with optional elevation",
    props: [
      prop("elevation", "number", false, 1),
      prop("action", "action"),
    ],
    allowChildren: true,
  });

  registry.register({
    type: "input",
    version: 1,
    description: "Text input field",
    props: [
      prop("label", "string", true),
      prop("placeholder", "string"),
      prop("binding", "string", true),
      prop("inputType", "string", false, "text"),
      prop("required", "boolean", false, false),
    ],
    allowChildren: false,
  });

  registry.register({
    type: "grid",
    version: 1,
    description: "Grid layout container",
    props: [
      prop("columns", "number", false, 3),
      prop("gap", "number", false, 16),
    ],
    allowChildren: true,
  });

  registry.register({
    type: "list",
    version: 1,
    description: "List layout for repeating items",
    props: [
      prop("divider", "boolean", false, true),
    ],
    allowChildren: true,
  });

  registry.register({
    type: "divider",
    version: 1,
    description: "Visual separator line",
    props: [],
    allowChildren: false,
  });

  registry.register({
    type: "spacer",
    version: 1,
    description: "Empty space",
    props: [prop("size", "number", false, 16)],
    allowChildren: false,
  });

  registry.register({
    type: "badge",
    version: 1,
    description: "Badge/chip display",
    props: [
      prop("content", "string", true),
      prop("color", "string", false, "primary"),
    ],
    allowChildren: false,
  });

  return registry;
}
