// ============================================================
// Lexer — Converts raw DSL text into a stream of tokens
// ============================================================

export enum TokenType {
  // Literals
  String = "String",
  Number = "Number",
  Boolean = "Boolean",

  // Identifiers & keywords
  Identifier = "Identifier",
  Screen = "Screen",
  If = "If",
  Each = "Each",
  As = "As",
  End = "End",

  // Symbols
  LeftBrace = "LeftBrace",
  RightBrace = "RightBrace",
  LeftParen = "LeftParen",
  RightParen = "RightParen",
  Colon = "Colon",
  Comma = "Comma",
  Dot = "Dot",

  // Operators (for conditions)
  Gt = "Gt",
  Gte = "Gte",
  Lt = "Lt",
  Lte = "Lte",
  Eq = "Eq",
  Neq = "Neq",

  // Special
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS: Record<string, TokenType> = {
  screen: TokenType.Screen,
  if: TokenType.If,
  each: TokenType.Each,
  as: TokenType.As,
  end: TokenType.End,
  true: TokenType.Boolean,
  false: TokenType.Boolean,
};

export class Lexer {
  private pos = 0;
  private line = 1;
  private column = 1;
  private tokens: Token[] = [];

  constructor(private source: string) {}

  tokenize(): Token[] {
    while (this.pos < this.source.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.source.length) break;

      const ch = this.source[this.pos];

      if (ch === '"' || ch === "'") {
        this.readString(ch);
      } else if (this.isDigit(ch) || (ch === "-" && this.isDigit(this.peek(1)))) {
        this.readNumber();
      } else if (this.isAlpha(ch) || ch === "_") {
        this.readIdentifier();
      } else if (ch === "{") {
        this.addToken(TokenType.LeftBrace, "{");
        this.advance();
      } else if (ch === "}") {
        this.addToken(TokenType.RightBrace, "}");
        this.advance();
      } else if (ch === "(") {
        this.addToken(TokenType.LeftParen, "(");
        this.advance();
      } else if (ch === ")") {
        this.addToken(TokenType.RightParen, ")");
        this.advance();
      } else if (ch === ":") {
        this.addToken(TokenType.Colon, ":");
        this.advance();
      } else if (ch === ",") {
        this.addToken(TokenType.Comma, ",");
        this.advance();
      } else if (ch === ".") {
        this.addToken(TokenType.Dot, ".");
        this.advance();
      } else if (ch === ">" && this.peek(1) === "=") {
        this.addToken(TokenType.Gte, ">=");
        this.advance();
        this.advance();
      } else if (ch === ">") {
        this.addToken(TokenType.Gt, ">");
        this.advance();
      } else if (ch === "<" && this.peek(1) === "=") {
        this.addToken(TokenType.Lte, "<=");
        this.advance();
        this.advance();
      } else if (ch === "<") {
        this.addToken(TokenType.Lt, "<");
        this.advance();
      } else if (ch === "=" && this.peek(1) === "=") {
        this.addToken(TokenType.Eq, "==");
        this.advance();
        this.advance();
      } else if (ch === "!" && this.peek(1) === "=") {
        this.addToken(TokenType.Neq, "!=");
        this.advance();
        this.advance();
      } else {
        throw new Error(
          `Unexpected character '${ch}' at line ${this.line}, column ${this.column}`
        );
      }
    }

    this.addToken(TokenType.EOF, "");
    return this.tokens;
  }

  private skipWhitespaceAndComments(): void {
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];

      if (ch === " " || ch === "\t" || ch === "\r") {
        this.advance();
      } else if (ch === "\n") {
        this.line++;
        this.column = 1;
        this.pos++;
      } else if (ch === "/" && this.peek(1) === "/") {
        // Line comment
        while (this.pos < this.source.length && this.source[this.pos] !== "\n") {
          this.pos++;
        }
      } else {
        break;
      }
    }
  }

  private readString(quote: string): void {
    this.advance(); // skip opening quote
    let value = "";
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === "\\") {
        this.advance();
        const escaped = this.source[this.pos];
        if (escaped === "n") value += "\n";
        else if (escaped === "t") value += "\t";
        else value += escaped;
      } else {
        value += this.source[this.pos];
      }
      this.advance();
    }
    if (this.pos >= this.source.length) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }
    this.advance(); // skip closing quote
    this.addToken(TokenType.String, value);
  }

  private readNumber(): void {
    let value = "";
    if (this.source[this.pos] === "-") {
      value += "-";
      this.advance();
    }
    while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
      value += this.source[this.pos];
      this.advance();
    }
    if (this.pos < this.source.length && this.source[this.pos] === ".") {
      value += ".";
      this.advance();
      while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
        value += this.source[this.pos];
        this.advance();
      }
    }
    this.addToken(TokenType.Number, value);
  }

  private readIdentifier(): void {
    let value = "";
    while (
      this.pos < this.source.length &&
      (this.isAlpha(this.source[this.pos]) ||
        this.isDigit(this.source[this.pos]) ||
        this.source[this.pos] === "_" ||
        this.source[this.pos] === "-")
    ) {
      value += this.source[this.pos];
      this.advance();
    }
    const tokenType = KEYWORDS[value] ?? TokenType.Identifier;
    this.addToken(tokenType, value);
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - value.length,
    });
  }

  private advance(): void {
    this.pos++;
    this.column++;
  }

  private peek(offset: number): string {
    return this.source[this.pos + offset] ?? "";
  }

  private isDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9";
  }

  private isAlpha(ch: string): boolean {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
  }
}
