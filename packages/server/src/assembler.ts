import type { SDUIScreen, SDUINode, SDUIResponse } from "@sdui/schema";
import type { ClientCapabilities } from "./middleware/capabilities.js";
import { getAllProducts, getProductById, getRelatedProducts, formatPrice } from "./services/products.js";
import { getUserById } from "./services/user.js";
import { getCart } from "./services/cart.js";
import { Cache } from "./cache.js";

const cache = new Cache(30_000); // 30s TTL

/**
 * Screen Assembler — The heart of the BFF
 *
 * Takes a compiled screen template (JSON) and:
 * 1. Fetches data from mock microservices
 * 2. Resolves data bindings ({{user.name}} → "John")
 * 3. Evaluates conditions (if cart.count > 0)
 * 4. Expands loops (each products as product)
 * 5. Filters components based on client capabilities
 * 6. Returns the fully assembled, data-rich SDUI response
 */
export function assembleScreen(
  template: SDUIScreen,
  sessionId: string,
  params: Record<string, string>,
  capabilities?: ClientCapabilities
): SDUIResponse {
  // Step 1: Gather data from services (this is the BFF aggregation)
  const data = gatherData(template.id, sessionId, params);

  // Step 2: Process the component tree
  const processedChildren = processNodes(template.children, data, capabilities);

  const screen: SDUIScreen = {
    ...template,
    children: processedChildren,
    data,
  };

  return {
    screen,
    serverTimestamp: new Date().toISOString(),
    clientCapabilities: capabilities
      ? Array.from(capabilities.components.keys())
      : undefined,
  };
}

/** Fetch and aggregate data from all relevant services */
function gatherData(
  screenId: string,
  sessionId: string,
  params: Record<string, string>
): Record<string, unknown> {
  // Cart data is always fresh — never cached since it changes on every action
  const cart = getCart(sessionId);
  const user = getUserById(sessionId) ?? getUserById("user-1");

  let data: Record<string, unknown> = { cart, user };

  switch (screenId) {
    case "home":
      data.products = getAllProducts().map((p) => ({
        ...p,
        price: formatPrice(p.price),
      }));
      break;

    case "product-detail": {
      const productId = params.productId ?? "1";
      const product = getProductById(productId);
      if (product) {
        data.product = { ...product, price: formatPrice(product.price) };
        data.relatedProducts = getRelatedProducts(productId).map((p) => ({
          ...p,
          price: formatPrice(p.price),
        }));
      }
      break;
    }

    case "cart":
      break; // cart data already included

    case "checkout":
      break; // cart data already included
  }

  return data;
}

/** Process nodes: resolve bindings, evaluate conditions, expand loops */
function processNodes(
  nodes: SDUINode[],
  data: Record<string, unknown>,
  capabilities?: ClientCapabilities
): SDUINode[] {
  const result: SDUINode[] = [];

  for (const node of nodes) {
    // Check client capabilities
    if (capabilities?.components.size && !capabilities.components.has(node.type)) {
      if (node.fallback) {
        result.push(node.fallback);
      }
      continue;
    }

    // Handle conditional rendering
    if (node.condition) {
      if (!evaluateCondition(node.condition, data)) {
        continue;
      }
    }

    // Handle loops
    if (node.loop) {
      const items = resolveDataPath(node.loop.source, data);
      if (Array.isArray(items)) {
        for (const item of items) {
          const loopData = { ...data, [node.loop.itemAlias]: item };
          const expandedChildren = processNodes(
            node.children ?? [],
            loopData,
            capabilities
          );
          result.push(...expandedChildren);
        }
      }
      continue;
    }

    // Resolve data bindings in props
    const resolvedProps = resolveBindings(node.props, data);

    const processedNode: SDUINode = {
      ...node,
      props: resolvedProps,
    };

    // Remove evaluated condition & loop metadata from output
    delete processedNode.condition;
    delete processedNode.loop;

    // Recursively process children
    if (node.children?.length) {
      processedNode.children = processNodes(node.children, data, capabilities);
    }

    result.push(processedNode);
  }

  return result;
}

/** Evaluate a condition against the data context */
function evaluateCondition(
  condition: { field: string; operator: string; value?: unknown },
  data: Record<string, unknown>
): boolean {
  const fieldValue = resolveDataPath(condition.field, data);
  const compareValue = condition.value;

  switch (condition.operator) {
    case "eq":
      return fieldValue === compareValue;
    case "neq":
      return fieldValue !== compareValue;
    case "gt":
      return (fieldValue as number) > (compareValue as number);
    case "gte":
      return (fieldValue as number) >= (compareValue as number);
    case "lt":
      return (fieldValue as number) < (compareValue as number);
    case "lte":
      return (fieldValue as number) <= (compareValue as number);
    case "exists":
      return fieldValue !== undefined && fieldValue !== null;
    case "not_exists":
      return fieldValue === undefined || fieldValue === null;
    default:
      return false;
  }
}

/** Resolve a dot-separated data path (e.g., "cart.count" → data.cart.count) */
function resolveDataPath(path: string, data: Record<string, unknown>): unknown {
  const parts = path.split(".");
  let current: unknown = data;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/** Resolve {{binding}} expressions in props */
function resolveBindings(
  props: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    resolved[key] = resolveValue(value, data);
  }

  return resolved;
}

function resolveValue(value: unknown, data: Record<string, unknown>): unknown {
  if (typeof value === "string") {
    // Full binding: "{{cart.total}}" → resolved value
    const fullMatch = value.match(/^\{\{(.+?)\}\}$/);
    if (fullMatch) {
      return resolveDataPath(fullMatch[1], data) ?? value;
    }

    // Inline bindings: "Items: {{cart.count}}" → "Items: 3"
    return value.replace(/\{\{(.+?)\}\}/g, (_, path) => {
      const resolved = resolveDataPath(path.trim(), data);
      return resolved !== undefined ? String(resolved) : `{{${path}}}`;
    });
  }

  if (Array.isArray(value)) {
    return value.map((v) => resolveValue(v, data));
  }

  if (value !== null && typeof value === "object") {
    return resolveBindings(value as Record<string, unknown>, data);
  }

  return value;
}
