// ============================================================
// Parser — Converts token stream into an AST
// Uses recursive descent parsing (most common for DSLs)
// ============================================================

import { TokenType, type Token } from "./lexer.js";
import type {
  ScreenASTNode,
  ComponentASTNode,
  PropertyASTNode,
  ConditionalASTNode,
  LoopASTNode,
  ChildASTNode,
  ValueASTNode,
} from "./ast.js";

export class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  parse(): ScreenASTNode {
    return this.parseScreen();
  }

  // screen "Name" { ... }
  private parseScreen(): ScreenASTNode {
    const token = this.expect(TokenType.Screen, "Expected 'screen' keyword");
    const nameToken = this.expect(TokenType.String, "Expected screen name string");
    this.expect(TokenType.LeftBrace, "Expected '{' after screen name");

    const properties: PropertyASTNode[] = [];
    const children: ChildASTNode[] = [];

    while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
      if (this.isProperty()) {
        properties.push(this.parseProperty());
      } else {
        children.push(this.parseChild());
      }
    }

    this.expect(TokenType.RightBrace, "Expected '}' to close screen");

    return {
      kind: "screen",
      name: nameToken.value,
      properties,
      children,
      location: { line: token.line, column: token.column },
    };
  }

  // text { ... }, card { ... }, etc.
  private parseComponent(): ComponentASTNode {
    const typeToken = this.expect(TokenType.Identifier, "Expected component type");
    this.expect(TokenType.LeftBrace, `Expected '{' after component type "${typeToken.value}"`);

    const properties: PropertyASTNode[] = [];
    const children: ChildASTNode[] = [];

    while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
      if (this.isProperty()) {
        properties.push(this.parseProperty());
      } else {
        children.push(this.parseChild());
      }
    }

    this.expect(TokenType.RightBrace, `Expected '}' to close "${typeToken.value}"`);

    return {
      kind: "component",
      type: typeToken.value,
      properties,
      children,
      location: { line: typeToken.line, column: typeToken.column },
    };
  }

  // if field > value { ... }
  private parseConditional(): ConditionalASTNode {
    const token = this.expect(TokenType.If, "Expected 'if'");

    // Parse the field reference (e.g., "cart.count")
    let field = this.expect(TokenType.Identifier, "Expected field name after 'if'").value;
    while (this.match(TokenType.Dot)) {
      field += "." + this.expect(TokenType.Identifier, "Expected property after '.'").value;
    }

    // Parse operator
    const operator = this.parseOperator();

    // Parse comparison value (may not exist for "exists" type checks)
    let value: ValueASTNode | null = null;
    if (!this.check(TokenType.LeftBrace)) {
      value = this.parseValue();
    }

    this.expect(TokenType.LeftBrace, "Expected '{' after condition");

    const children: ChildASTNode[] = [];
    while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
      children.push(this.parseChild());
    }

    this.expect(TokenType.RightBrace, "Expected '}' to close 'if' block");

    return {
      kind: "conditional",
      field,
      operator,
      value,
      children,
      location: { line: token.line, column: token.column },
    };
  }

  // each items as item { ... }  (also: each cart.items as item { ... })
  private parseLoop(): LoopASTNode {
    const token = this.expect(TokenType.Each, "Expected 'each'");
    let source = this.expect(TokenType.Identifier, "Expected data source after 'each'").value;
    while (this.match(TokenType.Dot)) {
      source += "." + this.expect(TokenType.Identifier, "Expected property after '.'").value;
    }
    this.expect(TokenType.As, "Expected 'as' keyword");
    const aliasToken = this.expect(TokenType.Identifier, "Expected item alias after 'as'");
    this.expect(TokenType.LeftBrace, "Expected '{' after loop header");

    const children: ChildASTNode[] = [];
    while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
      children.push(this.parseChild());
    }

    this.expect(TokenType.RightBrace, "Expected '}' to close 'each' block");

    return {
      kind: "loop",
      source,
      itemAlias: aliasToken.value,
      children,
      location: { line: token.line, column: token.column },
    };
  }

  // name: value
  private parseProperty(): PropertyASTNode {
    const nameToken = this.expect(TokenType.Identifier, "Expected property name");
    this.expect(TokenType.Colon, `Expected ':' after property name "${nameToken.value}"`);
    const value = this.parseValue();
    this.match(TokenType.Comma); // optional trailing comma

    return {
      kind: "property",
      name: nameToken.value,
      value,
      location: { line: nameToken.line, column: nameToken.column },
    };
  }

  private parseValue(): ValueASTNode {
    const token = this.current();

    if (token.type === TokenType.String) {
      this.advance();
      return { kind: "string", value: token.value };
    }

    if (token.type === TokenType.Number) {
      this.advance();
      return { kind: "number", value: parseFloat(token.value) };
    }

    if (token.type === TokenType.Boolean) {
      this.advance();
      return { kind: "boolean", value: token.value === "true" };
    }

    // Action: navigate("/path") or api_call("/endpoint", { key: value })
    if (
      token.type === TokenType.Identifier &&
      this.peekType(1) === TokenType.LeftParen
    ) {
      return this.parseAction();
    }

    // Object: { key: value, ... }
    if (token.type === TokenType.LeftBrace) {
      return this.parseObjectValue();
    }

    // Reference: field.path.value
    if (token.type === TokenType.Identifier) {
      let path = token.value;
      this.advance();
      while (this.match(TokenType.Dot)) {
        path +=
          "." + this.expect(TokenType.Identifier, "Expected property after '.'").value;
      }
      return { kind: "reference", path };
    }

    throw this.error(`Unexpected token "${token.value}" (${token.type}), expected a value`);
  }

  // navigate("/path") or api_call("/endpoint", { body })
  private parseAction(): ValueASTNode {
    const actionType = this.expect(TokenType.Identifier, "Expected action name").value;
    this.expect(TokenType.LeftParen, "Expected '(' after action name");

    const args: ValueASTNode[] = [];
    if (!this.check(TokenType.RightParen)) {
      args.push(this.parseValue());
      while (this.match(TokenType.Comma)) {
        args.push(this.parseValue());
      }
    }

    this.expect(TokenType.RightParen, "Expected ')' to close action");

    return { kind: "action", actionType, args };
  }

  // { key: value, key2: value2 }
  private parseObjectValue(): ValueASTNode {
    this.expect(TokenType.LeftBrace, "Expected '{'");
    const entries: PropertyASTNode[] = [];

    while (!this.check(TokenType.RightBrace) && !this.check(TokenType.EOF)) {
      entries.push(this.parseProperty());
    }

    this.expect(TokenType.RightBrace, "Expected '}'");
    return { kind: "object", entries };
  }

  private parseChild(): ChildASTNode {
    const token = this.current();

    if (token.type === TokenType.If) {
      return this.parseConditional();
    }

    if (token.type === TokenType.Each) {
      return this.parseLoop();
    }

    if (token.type === TokenType.Identifier) {
      return this.parseComponent();
    }

    throw this.error(
      `Expected component, 'if', or 'each' but got "${token.value}" (${token.type})`
    );
  }

  private parseOperator(): string {
    const token = this.current();
    const operators: Record<string, string> = {
      [TokenType.Gt]: "gt",
      [TokenType.Gte]: "gte",
      [TokenType.Lt]: "lt",
      [TokenType.Lte]: "lte",
      [TokenType.Eq]: "eq",
      [TokenType.Neq]: "neq",
    };

    const op = operators[token.type];
    if (op) {
      this.advance();
      return op;
    }

    throw this.error(`Expected comparison operator, got "${token.value}"`);
  }

  // ============================================================
  // Helpers — Look ahead, consume tokens, detect patterns
  // ============================================================

  /** Check if current position looks like a property (identifier followed by colon) */
  private isProperty(): boolean {
    return (
      this.current().type === TokenType.Identifier &&
      this.peekType(1) === TokenType.Colon
    );
  }

  private current(): Token {
    return this.tokens[this.pos];
  }

  private peekType(offset: number): TokenType {
    const idx = this.pos + offset;
    return idx < this.tokens.length ? this.tokens[idx].type : TokenType.EOF;
  }

  private advance(): Token {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  private check(type: TokenType): boolean {
    return this.current().type === type;
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw this.error(`${message} (got "${this.current().value}" [${this.current().type}])`);
  }

  private error(message: string): Error {
    const token = this.current();
    return new Error(`Parse error at line ${token.line}, col ${token.column}: ${message}`);
  }
}
