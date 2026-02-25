import { describe, it, expect } from "vitest";
import { Lexer, TokenType } from "../lexer.js";

function tokenTypes(source: string): TokenType[] {
  return new Lexer(source).tokenize().map((t) => t.type);
}

function tokenValues(source: string): string[] {
  return new Lexer(source)
    .tokenize()
    .filter((t) => t.type !== TokenType.EOF)
    .map((t) => t.value);
}

describe("Lexer", () => {
  describe("keywords", () => {
    it("recognizes screen keyword", () => {
      const tokens = new Lexer('screen "Home" {}').tokenize();
      expect(tokens[0].type).toBe(TokenType.Screen);
    });

    it("recognizes if keyword", () => {
      const tokens = new Lexer("if cart.count > 0 {}").tokenize();
      expect(tokens[0].type).toBe(TokenType.If);
    });

    it("recognizes each/as keywords", () => {
      const tokens = new Lexer("each products as product {}").tokenize();
      expect(tokens[0].type).toBe(TokenType.Each);
      expect(tokens[2].type).toBe(TokenType.As);
    });
  });

  describe("literals", () => {
    it("tokenizes string literals", () => {
      const tokens = new Lexer('"hello world"').tokenize();
      expect(tokens[0].type).toBe(TokenType.String);
      expect(tokens[0].value).toBe("hello world");
    });

    it("tokenizes integer numbers", () => {
      const tokens = new Lexer("42").tokenize();
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].value).toBe("42");
    });

    it("tokenizes decimal numbers", () => {
      const tokens = new Lexer("3.14").tokenize();
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].value).toBe("3.14");
    });

    it("tokenizes boolean true", () => {
      const tokens = new Lexer("true").tokenize();
      expect(tokens[0].type).toBe(TokenType.Boolean);
      expect(tokens[0].value).toBe("true");
    });

    it("tokenizes boolean false", () => {
      const tokens = new Lexer("false").tokenize();
      expect(tokens[0].type).toBe(TokenType.Boolean);
      expect(tokens[0].value).toBe("false");
    });
  });

  describe("symbols", () => {
    it("tokenizes braces", () => {
      const types = tokenTypes("{}");
      expect(types[0]).toBe(TokenType.LeftBrace);
      expect(types[1]).toBe(TokenType.RightBrace);
    });

    it("tokenizes parentheses", () => {
      const types = tokenTypes("()");
      expect(types[0]).toBe(TokenType.LeftParen);
      expect(types[1]).toBe(TokenType.RightParen);
    });

    it("tokenizes colon and comma", () => {
      const types = tokenTypes(":,");
      expect(types[0]).toBe(TokenType.Colon);
      expect(types[1]).toBe(TokenType.Comma);
    });

    it("tokenizes dot", () => {
      const types = tokenTypes("a.b");
      expect(types).toContain(TokenType.Dot);
    });
  });

  describe("comparison operators", () => {
    it("tokenizes >", () => {
      const tokens = new Lexer(">").tokenize();
      expect(tokens[0].type).toBe(TokenType.Gt);
    });

    it("tokenizes >=", () => {
      const tokens = new Lexer(">=").tokenize();
      expect(tokens[0].type).toBe(TokenType.Gte);
    });

    it("tokenizes <", () => {
      const tokens = new Lexer("<").tokenize();
      expect(tokens[0].type).toBe(TokenType.Lt);
    });

    it("tokenizes <=", () => {
      const tokens = new Lexer("<=").tokenize();
      expect(tokens[0].type).toBe(TokenType.Lte);
    });

    it("tokenizes ==", () => {
      const tokens = new Lexer("==").tokenize();
      expect(tokens[0].type).toBe(TokenType.Eq);
    });

    it("tokenizes !=", () => {
      const tokens = new Lexer("!=").tokenize();
      expect(tokens[0].type).toBe(TokenType.Neq);
    });
  });

  describe("identifiers", () => {
    it("tokenizes simple identifiers", () => {
      const tokens = new Lexer("text").tokenize();
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[0].value).toBe("text");
    });

    it("distinguishes identifiers from keywords", () => {
      const tokens = new Lexer("screen text button").tokenize();
      expect(tokens[0].type).toBe(TokenType.Screen);
      expect(tokens[1].type).toBe(TokenType.Identifier);
      expect(tokens[2].type).toBe(TokenType.Identifier);
    });
  });

  describe("comments", () => {
    it("skips single-line comments", () => {
      const tokens = new Lexer('// this is a comment\n"hello"').tokenize();
      expect(tokens[0].type).toBe(TokenType.String);
      expect(tokens[0].value).toBe("hello");
    });
  });

  describe("whitespace", () => {
    it("skips whitespace between tokens", () => {
      const values = tokenValues("  screen   ");
      expect(values).toEqual(["screen"]);
    });
  });

  describe("line tracking", () => {
    it("tracks line numbers correctly", () => {
      const tokens = new Lexer('screen\n"Home"\n{}').tokenize();
      expect(tokens[0].line).toBe(1);
      expect(tokens[1].line).toBe(2);
      expect(tokens[2].line).toBe(3);
    });
  });

  describe("full DSL snippet", () => {
    it("tokenizes a complete screen definition", () => {
      const source = `screen "Home" {
  layout: column, spacing: 16

  text { content: "Welcome", variant: "h1" }

  if cart.count > 0 {
    button { label: "View Cart", action: navigate("/cart") }
  }
}`;
      const tokens = new Lexer(source).tokenize();
      const nonEof = tokens.filter((t) => t.type !== TokenType.EOF);
      expect(nonEof.length).toBeGreaterThan(20);
      expect(tokens[0].type).toBe(TokenType.Screen);
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
    });
  });
});
