// ============================================================
// Compiler Entry Point — The full pipeline: DSL → JSON Schema
// ============================================================

import type { SDUIScreen } from "@sdui/schema";
import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { CodeGenerator } from "./codegen.js";

export { Lexer, TokenType } from "./lexer.js";
export type { Token } from "./lexer.js";
export { Parser } from "./parser.js";
export { CodeGenerator } from "./codegen.js";
export type * from "./ast.js";

export interface CompileResult {
  screen: SDUIScreen;
  errors: string[];
  warnings: string[];
}

/**
 * Compile DSL source code into an SDUI screen schema.
 *
 * Pipeline: Source → Lexer → Tokens → Parser → AST → CodeGen → JSON Schema
 */
export function compile(source: string): CompileResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Stage 1: Lexing
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();

  // Stage 2: Parsing
  const parser = new Parser(tokens);
  const ast = parser.parse();

  // Stage 3: Code Generation
  const codegen = new CodeGenerator();
  const screen = codegen.generate(ast);

  return { screen, errors, warnings };
}
