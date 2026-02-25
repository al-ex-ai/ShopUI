import { describe, it, expect } from "vitest";
import { compile } from "../index.js";

describe("CodeGen (via compile)", () => {
  describe("screen output", () => {
    it("produces a valid SDUIScreen", () => {
      const { screen } = compile('screen "Home" { layout: column, spacing: 16, padding: 24 }');
      expect(screen.id).toBe("home");
      expect(screen.name).toBe("Home");
      expect(screen.schemaVersion).toBe(1);
      expect(screen.layout.direction).toBe("column");
      expect(screen.layout.spacing).toBe(16);
      expect(screen.layout.padding).toBe(24);
    });

    it("kebab-cases multi-word screen names", () => {
      const { screen } = compile('screen "Product Detail" {}');
      expect(screen.id).toBe("product-detail");
    });
  });

  describe("component output", () => {
    it("generates text component with props", () => {
      const { screen } = compile(`screen "Test" {
        text { content: "Hello", variant: "h1" }
      }`);
      expect(screen.children.length).toBe(1);
      expect(screen.children[0].type).toBe("text");
      expect(screen.children[0].props.content).toBe("Hello");
      expect(screen.children[0].props.variant).toBe("h1");
    });

    it("generates nested components", () => {
      const { screen } = compile(`screen "Test" {
        card {
          text { content: "Title" }
        }
      }`);
      const card = screen.children[0];
      expect(card.type).toBe("card");
      expect(card.children?.length).toBe(1);
      expect(card.children?.[0].type).toBe("text");
    });

    it("resolves known identifiers as strings", () => {
      const { screen } = compile(`screen "Test" {
        text { variant: h1, align: center }
      }`);
      expect(screen.children[0].props.variant).toBe("h1");
      expect(screen.children[0].props.align).toBe("center");
    });

    it("generates data references with binding syntax", () => {
      const { screen } = compile(`screen "Test" {
        text { content: product.name }
      }`);
      // Data references should be wrapped in {{ }}
      const content = screen.children[0].props.content;
      expect(content).toBe("{{product.name}}");
    });
  });

  describe("conditional output", () => {
    it("generates condition metadata on nodes", () => {
      const { screen } = compile(`screen "Test" {
        if cart.count > 0 {
          text { content: "Items in cart" }
        }
      }`);
      // Conditionals wrap their children
      const child = screen.children[0];
      expect(child.condition).toBeDefined();
      expect(child.condition?.field).toBe("cart.count");
      expect(child.condition?.operator).toBe("gt");
      expect(child.condition?.value).toBe(0);
    });
  });

  describe("loop output", () => {
    it("generates loop metadata on nodes", () => {
      const { screen } = compile(`screen "Test" {
        each products as product {
          card { text { content: product.name } }
        }
      }`);
      const child = screen.children[0];
      expect(child.loop).toBeDefined();
      expect(child.loop?.source).toBe("products");
      expect(child.loop?.itemAlias).toBe("product");
    });
  });

  describe("action output", () => {
    it("generates navigate action", () => {
      const { screen } = compile(`screen "Test" {
        button { label: "Go", action: navigate("/cart") }
      }`);
      const action = screen.children[0].props.action;
      expect(action).toEqual({
        type: "navigate",
        target: "/cart",
      });
    });

    it("generates api_call action with body", () => {
      const { screen } = compile(`screen "Test" {
        button { label: "Add", action: api_call("/api/cart/add", "POST", { productId: product.id }) }
      }`);
      const action = screen.children[0].props.action as Record<string, unknown>;
      expect(action.type).toBe("api_call");
      expect(action.endpoint).toBe("/api/cart/add");
      expect(action.method).toBe("POST");
    });
  });

  describe("layout output", () => {
    it("generates layout properties on containers", () => {
      const { screen } = compile(`screen "Test" {
        container { direction: row, spacing: 8, padding: 16 }
      }`);
      const container = screen.children[0];
      expect(container.layout?.direction).toBe("row");
      expect(container.layout?.spacing).toBe(8);
      expect(container.layout?.padding).toBe(16);
    });
  });

  describe("full e-commerce screen", () => {
    it("compiles a realistic home screen", () => {
      const { screen, errors } = compile(`screen "Home" {
        layout: column, spacing: 20, padding: 24

        container {
          padding: 24, background: "primary.main", borderRadius: 12
          text { content: "Welcome to ShopUI", variant: "h4", color: "primary.contrastText" }
          text { content: "Discover our products", variant: "body1", color: "primary.contrastText" }
        }

        grid { columns: 3, gap: 16 }
          each products as product {
            card {
              image { src: product.image, alt: product.name, height: 200 }
              text { content: product.name, variant: "subtitle1" }
              text { content: product.price, variant: "body1", color: "text.secondary" }
              button { label: "Add to Cart", action: api_call("/api/cart/add", "POST", { productId: product.id }) }
            }
          }

        if cart.count > 0 {
          button { label: "View Cart", action: navigate("/cart"), style: primary, fullWidth: true }
        }
      }`);

      expect(errors.length).toBe(0);
      expect(screen.id).toBe("home");
      expect(screen.name).toBe("Home");
      expect(screen.layout.direction).toBe("column");
      expect(screen.layout.spacing).toBe(20);
      expect(screen.layout.padding).toBe(24);

      // Should have: container, grid+loop, conditional
      expect(screen.children.length).toBeGreaterThanOrEqual(3);
    });
  });
});
