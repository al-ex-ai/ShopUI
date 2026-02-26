import { describe, it, expect } from "vitest";
import { assembleScreen } from "../assembler.js";
import type { SDUIScreen, SDUINode } from "@sdui/schema";

function makeScreen(children: SDUINode[], id = "test"): SDUIScreen {
  return {
    id,
    name: "Test Screen",
    schemaVersion: 1,
    layout: { direction: "column", spacing: 16, padding: 24 },
    children,
  };
}

describe("assembleScreen", () => {
  it("returns assembled response with timestamp", () => {
    const template = makeScreen([
      { type: "text", props: { content: "Hello" }, children: [] },
    ]);

    const result = assembleScreen(template, "user-1", {});

    expect(result.screen).toBeDefined();
    expect(result.serverTimestamp).toBeDefined();
    expect(result.screen.children).toHaveLength(1);
  });

  it("resolves data bindings in props", () => {
    const template = makeScreen([
      { type: "text", props: { content: "{{user.name}}" }, children: [] },
    ]);

    const result = assembleScreen(template, "user-1", {});
    expect(result.screen.children[0].props.content).toBe("Alex Johnson");
  });

  it("resolves inline bindings", () => {
    const template = makeScreen([
      { type: "text", props: { content: "Items: {{cart.count}}" }, children: [] },
    ]);

    const result = assembleScreen(template, "user-1", {});
    expect(result.screen.children[0].props.content).toBe("Items: 0");
  });

  it("evaluates conditions — true", () => {
    const template = makeScreen([
      {
        type: "text",
        props: { content: "Has user" },
        children: [],
        condition: { field: "user.name", operator: "exists" },
      },
    ]);

    const result = assembleScreen(template, "user-1", {});
    expect(result.screen.children).toHaveLength(1);
  });

  it("evaluates conditions — false removes node", () => {
    const template = makeScreen([
      {
        type: "text",
        props: { content: "Hidden" },
        children: [],
        condition: { field: "cart.count", operator: "gt", value: 100 },
      },
    ]);

    const result = assembleScreen(template, "user-1", {});
    expect(result.screen.children).toHaveLength(0);
  });

  it("evaluates eq condition", () => {
    const template = makeScreen([
      {
        type: "text",
        props: { content: "Match" },
        children: [],
        condition: { field: "cart.count", operator: "eq", value: 0 },
      },
    ]);

    const result = assembleScreen(template, "user-1", {});
    expect(result.screen.children).toHaveLength(1);
  });

  it("evaluates neq condition", () => {
    const template = makeScreen([
      {
        type: "text",
        props: { content: "Not match" },
        children: [],
        condition: { field: "user.name", operator: "neq", value: "Nobody" },
      },
    ]);

    const result = assembleScreen(template, "user-1", {});
    expect(result.screen.children).toHaveLength(1);
  });

  it("evaluates not_exists condition", () => {
    const template = makeScreen([
      {
        type: "text",
        props: { content: "Missing" },
        children: [],
        condition: { field: "cart.nonexistent", operator: "not_exists" },
      },
    ]);

    const result = assembleScreen(template, "user-1", {});
    expect(result.screen.children).toHaveLength(1);
  });

  it("expands loops", () => {
    const template = makeScreen(
      [
        {
          type: "loop",
          props: {},
          children: [
            { type: "text", props: { content: "{{item.name}}" }, children: [] },
          ],
          loop: { source: "products", itemAlias: "item" },
        },
      ],
      "home"
    );

    const result = assembleScreen(template, "user-1", {});
    // Should have expanded text nodes for each product (6 products)
    expect(result.screen.children.length).toBe(6);
    expect(result.screen.children[0].type).toBe("text");
  });

  it("filters components by client capabilities", () => {
    const template = makeScreen([
      { type: "text", props: { content: "Visible" }, children: [] },
      { type: "button", props: { label: "Click" }, children: [] },
      { type: "image", props: { src: "test.png" }, children: [] },
    ]);

    const capabilities = {
      components: new Map([["text", 1]]),
      schemaVersion: 1,
    };

    const result = assembleScreen(template, "user-1", {}, capabilities);
    // Only text should pass through
    expect(result.screen.children).toHaveLength(1);
    expect(result.screen.children[0].type).toBe("text");
  });

  it("uses fallback when component not in capabilities", () => {
    const template = makeScreen([
      {
        type: "fancy-widget",
        props: { content: "Fancy" },
        children: [],
        fallback: { type: "text", props: { content: "Fallback" }, children: [] },
      },
    ]);

    const capabilities = {
      components: new Map([["text", 1]]),
      schemaVersion: 1,
    };

    const result = assembleScreen(template, "user-1", {}, capabilities);
    expect(result.screen.children).toHaveLength(1);
    expect(result.screen.children[0].type).toBe("text");
    expect(result.screen.children[0].props.content).toBe("Fallback");
  });

  it("includes client capabilities in response", () => {
    const template = makeScreen([]);
    const capabilities = {
      components: new Map([["text", 1], ["button", 1]]),
      schemaVersion: 1,
    };

    const result = assembleScreen(template, "user-1", {}, capabilities);
    expect(result.clientCapabilities).toContain("text");
    expect(result.clientCapabilities).toContain("button");
  });

  it("gathers product data for home screen", () => {
    const template = makeScreen(
      [{ type: "text", props: { content: "{{products.0.name}}" }, children: [] }],
      "home"
    );

    const result = assembleScreen(template, "user-1", {});
    // Should resolve first product name
    expect(result.screen.children[0].props.content).not.toContain("{{");
  });

  it("gathers product-detail data with productId param", () => {
    const template = makeScreen(
      [{ type: "text", props: { content: "{{product.name}}" }, children: [] }],
      "product-detail"
    );

    const result = assembleScreen(template, "user-1", { productId: "1" });
    expect(result.screen.children[0].props.content).toBe("Wireless Headphones");
  });

  it("processes nested children recursively", () => {
    const template = makeScreen([
      {
        type: "container",
        props: { direction: "column" },
        children: [
          { type: "text", props: { content: "{{user.name}}" }, children: [] },
        ],
      },
    ]);

    const result = assembleScreen(template, "user-1", {});
    const container = result.screen.children[0];
    expect(container.children?.[0].props.content).toBe("Alex Johnson");
  });
});
