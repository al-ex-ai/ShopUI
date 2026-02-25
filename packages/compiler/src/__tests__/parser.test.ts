import { describe, it, expect } from "vitest";
import { Lexer } from "../lexer.js";
import { Parser } from "../parser.js";

function parse(source: string) {
  const tokens = new Lexer(source).tokenize();
  return new Parser(tokens).parse();
}

describe("Parser", () => {
  describe("screen definition", () => {
    it("parses a minimal screen", () => {
      const ast = parse('screen "Home" {}');
      expect(ast.kind).toBe("screen");
      expect(ast.name).toBe("Home");
      expect(ast.children).toEqual([]);
    });

    it("parses screen with layout properties", () => {
      const ast = parse('screen "Home" { layout: column, spacing: 16, padding: 24 }');
      expect(ast.kind).toBe("screen");
      const layoutProp = ast.properties.find((p) => p.name === "layout");
      expect(layoutProp).toBeDefined();
    });
  });

  describe("components", () => {
    it("parses a simple text component", () => {
      const ast = parse('screen "Test" { text { content: "Hello" } }');
      expect(ast.children.length).toBe(1);
      expect(ast.children[0].kind).toBe("component");
      if (ast.children[0].kind === "component") {
        expect(ast.children[0].type).toBe("text");
        const contentProp = ast.children[0].properties.find((p) => p.name === "content");
        expect(contentProp?.value).toEqual({ kind: "string", value: "Hello" });
      }
    });

    it("parses nested components", () => {
      const ast = parse(`screen "Test" {
        card {
          text { content: "Title" }
          button { label: "Click" }
        }
      }`);
      expect(ast.children.length).toBe(1);
      const card = ast.children[0];
      if (card.kind === "component") {
        expect(card.type).toBe("card");
        expect(card.children.length).toBe(2);
      }
    });

    it("parses numeric property values", () => {
      const ast = parse('screen "Test" { grid { columns: 3, gap: 16 } }');
      const grid = ast.children[0];
      if (grid.kind === "component") {
        const colProp = grid.properties.find((p) => p.name === "columns");
        expect(colProp?.value).toEqual({ kind: "number", value: 3 });
      }
    });

    it("parses boolean property values", () => {
      const ast = parse('screen "Test" { input { required: true } }');
      const input = ast.children[0];
      if (input.kind === "component") {
        const reqProp = input.properties.find((p) => p.name === "required");
        expect(reqProp?.value).toEqual({ kind: "boolean", value: true });
      }
    });

    it("parses data reference values", () => {
      const ast = parse('screen "Test" { text { content: product.name } }');
      const text = ast.children[0];
      if (text.kind === "component") {
        const contentProp = text.properties.find((p) => p.name === "content");
        expect(contentProp?.value.kind).toBe("reference");
      }
    });
  });

  describe("conditionals", () => {
    it("parses if with > operator", () => {
      const ast = parse(`screen "Test" {
        if cart.count > 0 {
          text { content: "Has items" }
        }
      }`);
      expect(ast.children.length).toBe(1);
      const cond = ast.children[0];
      expect(cond.kind).toBe("conditional");
      if (cond.kind === "conditional") {
        expect(cond.field).toBe("cart.count");
        expect(cond.operator).toBe("gt");
        expect(cond.children.length).toBe(1);
      }
    });

    it("parses if with == operator", () => {
      const ast = parse(`screen "Test" {
        if cart.count == 0 {
          text { content: "Empty" }
        }
      }`);
      const cond = ast.children[0];
      if (cond.kind === "conditional") {
        expect(cond.operator).toBe("eq");
      }
    });
  });

  describe("loops", () => {
    it("parses each loop", () => {
      const ast = parse(`screen "Test" {
        each products as product {
          card { text { content: product.name } }
        }
      }`);
      expect(ast.children.length).toBe(1);
      const loop = ast.children[0];
      expect(loop.kind).toBe("loop");
      if (loop.kind === "loop") {
        expect(loop.source).toBe("products");
        expect(loop.itemAlias).toBe("product");
        expect(loop.children.length).toBe(1);
      }
    });

    it("parses loop with dotted source", () => {
      const ast = parse(`screen "Test" {
        each cart.items as item {
          text { content: item.name }
        }
      }`);
      const loop = ast.children[0];
      if (loop.kind === "loop") {
        expect(loop.source).toBe("cart.items");
      }
    });
  });

  describe("actions", () => {
    it("parses navigate action", () => {
      const ast = parse(`screen "Test" {
        button { label: "Go", action: navigate("/cart") }
      }`);
      const btn = ast.children[0];
      if (btn.kind === "component") {
        const actionProp = btn.properties.find((p) => p.name === "action");
        expect(actionProp?.value.kind).toBe("action");
        if (actionProp?.value.kind === "action") {
          expect(actionProp.value.actionType).toBe("navigate");
        }
      }
    });

    it("parses api_call action with method and body", () => {
      const ast = parse(`screen "Test" {
        button { label: "Add", action: api_call("/api/cart/add", "POST", { productId: product.id }) }
      }`);
      const btn = ast.children[0];
      if (btn.kind === "component") {
        const actionProp = btn.properties.find((p) => p.name === "action");
        if (actionProp?.value.kind === "action") {
          expect(actionProp.value.actionType).toBe("api_call");
          expect(actionProp.value.args.length).toBe(3);
        }
      }
    });
  });

  describe("complex screens", () => {
    it("parses a screen with mixed children", () => {
      const ast = parse(`screen "Home" {
        layout: column, spacing: 16, padding: 24

        text { content: "Welcome", variant: "h1" }

        each products as product {
          card {
            text { content: product.name }
            button { label: "Add to Cart", action: api_call("/api/cart/add", "POST", { productId: product.id }) }
          }
        }

        if cart.count > 0 {
          button { label: "View Cart", action: navigate("/cart") }
        }
      }`);

      expect(ast.name).toBe("Home");
      expect(ast.children.length).toBe(3); // text, loop, conditional
      expect(ast.children[0].kind).toBe("component");
      expect(ast.children[1].kind).toBe("loop");
      expect(ast.children[2].kind).toBe("conditional");
    });
  });
});
