# SDUI Platform

A complete **Server-Driven UI** platform built from scratch — custom DSL, compiler pipeline, BFF server, and React renderer. The demo domain is an e-commerce storefront.

**Live Demo:** [https://shopui.al-ex.ai](https://shopui.al-ex.ai)

## Architecture

```
 .sdui files          Compiler            Schema Registry
┌──────────┐    ┌─────────────────┐    ┌─────────────────┐
│ home     │───▶│ Lexer → Parser  │───▶│  JSON schemas    │
│ cart     │    │ → AST → CodeGen │    │  (versioned)     │
│ checkout │    └─────────────────┘    └────────┬─────────┘
└──────────┘                                    │
                                                ▼
┌───────────────────────────────────────────────────────────┐
│                   BFF Server (Express)                     │
│                                                           │
│  GET /api/screens/:id ──▶ Assembler                       │
│    • Loads compiled schema from registry                  │
│    • Fetches data from mock microservices                 │
│    • Resolves {{data.bindings}} with live values          │
│    • Evaluates conditionals & loops                       │
│    • Returns ready-to-render JSON                         │
│                                                           │
│  Mock Services: products, cart, orders, users             │
│  Cache: in-memory with TTL                                │
│  Versioning: v1 / v2 schema negotiation                   │
└──────────────────────┬────────────────────────────────────┘
                       │ JSON
                       ▼
┌───────────────────────────────────────────────────────────┐
│                 React Client (Vite + MUI)                  │
│                                                           │
│  SDUIRenderer ──▶ ComponentRegistry ──▶ React Components  │
│    • Recursive tree walker                                │
│    • Maps type strings to MUI components                  │
│    • ActionHandler: navigate, api_call, set_state         │
│    • Error boundary with graceful fallback                │
│    • Skeleton loading states                              │
│    • Client-side schema cache                             │
│    • Responsive design (mobile-first)                     │
│    • Dark/light theme toggle                              │
│    • Interactive feature tour                             │
└───────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Monorepo   | pnpm workspaces                     |
| Compiler   | TypeScript (custom lexer + parser)  |
| BFF Server | Node + Express + TypeScript         |
| Client     | React 19 + Vite + MUI + TypeScript  |
| Testing    | Vitest (50 compiler tests)          |

## Project Structure

```
sdui-platform/
├── screens/                    # DSL source files
│   ├── home.sdui
│   ├── product-detail.sdui
│   ├── cart.sdui
│   └── checkout.sdui
├── packages/
│   ├── schema/                 # Shared SDUI type definitions
│   │   └── src/types.ts        # SDUINode, SDUIAction, SDUIScreen, SDUILayout
│   ├── compiler/               # DSL → JSON compiler pipeline
│   │   └── src/
│   │       ├── lexer.ts        # Tokenizer (keywords, literals, operators)
│   │       ├── parser.ts       # Recursive descent → AST
│   │       ├── ast.ts          # AST node type definitions
│   │       ├── codegen.ts      # AST → JSON schema
│   │       ├── index.ts        # compile() entry point
│   │       └── __tests__/      # 50 unit tests (lexer, parser, codegen)
│   ├── server/                 # BFF server
│   │   └── src/
│   │       ├── app.ts          # Express setup + routes
│   │       ├── assembler.ts    # Schema + data → personalized response
│   │       ├── cache.ts        # In-memory TTL cache
│   │       └── services/       # Mock microservices (products, cart, etc.)
│   └── client/                 # React SDUI renderer
│       └── src/
│           ├── App.tsx         # Routing, theme, NavBar, feature tour
│           ├── renderer/
│           │   ├── SDUIRenderer.tsx      # Recursive component renderer
│           │   ├── ComponentRegistry.ts  # Type → React component map
│           │   └── ActionHandler.ts      # Action interpreter
│           ├── components/              # MUI component implementations
│           │   ├── SDUI{Text,Button,Card,Image,Input,...}.tsx
│           │   ├── SDUISkeleton.tsx      # Loading placeholders
│           │   ├── SDUIErrorBoundary.tsx # Render error recovery
│           │   └── FeatureTour.tsx       # Interactive guided tour
│           └── hooks/
│               ├── useScreen.ts         # Fetch + cache screen schema
│               └── useSDUIState.ts      # Local form state bindings
```

## DSL Syntax

The custom `.sdui` DSL compiles to JSON schemas consumed by the renderer:

```
screen "Home" {
  layout: column, spacing: 20, padding: 24

  // Hero banner
  container {
    padding: 24, background: "primary.main"
    text { content: "Welcome to ShopUI", variant: "h3" }
  }

  // Product grid with data binding
  grid { columns: 3, gap: 16 }
    each products as product {
      card {
        image { src: product.image, alt: product.name }
        text { content: product.name, variant: "body1" }
        button {
          label: "Add to Cart",
          action: api_call("/api/cart/add", "POST", { productId: product.id })
        }
      }
    }

  // Conditional rendering
  if cart.count > 0 {
    button { label: "View Cart", action: navigate("/cart") }
  }
}
```

**Supported constructs**: components with props, nested children, `each` loops with data binding, `if` conditionals with comparison operators, `navigate`/`api_call`/`set_state` actions, layout properties, `{{data.ref}}` template bindings.

## Compiler Pipeline

```
Source (.sdui)
    │
    ▼
┌─────────┐   Tokens    ┌────────┐    AST     ┌─────────┐   JSON Schema
│  Lexer  │────────────▶│ Parser │───────────▶│ CodeGen │──────────────▶
└─────────┘             └────────┘            └─────────┘
```

1. **Lexer** — Tokenizes source into keywords (`screen`, `if`, `each`, `as`), literals (strings, numbers, booleans), operators (`>`, `==`, `!=`), identifiers, and symbols
2. **Parser** — Recursive descent parser producing an AST with `ScreenNode`, `ComponentNode`, `ConditionalNode`, `LoopNode`
3. **CodeGen** — Transforms AST into the JSON schema format, resolving data references to `{{binding}}` syntax

## Quick Start

```bash
# Install dependencies
pnpm install

# Build shared packages & compile DSL
pnpm build
pnpm compile:screens

# Start both server and client
pnpm dev

# Or start individually:
pnpm dev:server    # http://localhost:3004
pnpm dev:client    # http://localhost:5174
```

## Running Tests

```bash
# Compiler unit tests (50 tests)
pnpm --filter @sdui/compiler test
```

## Key Features

### Schema Versioning
Toggle between v1 and v2 schemas via the version chip in the NavBar. The server negotiates the schema version and adapts its response format.

### Action System
Components declare actions in the DSL that the client interprets at runtime:
- **`navigate("/path")`** — Client-side routing via React Router
- **`api_call("/endpoint", "POST", { body })`** — API calls with automatic screen refresh
- **`set_state("key", value)`** — Local state mutations for form bindings

### Error Boundary
The `SDUIErrorBoundary` wraps all rendered components. If a bad schema causes a render crash, users see a friendly error with a retry button instead of a white screen.

### Responsive Design
All components are mobile-first responsive:
- Grid columns collapse: 3 → 2 → 1 on smaller screens
- NavBar adapts: full text → icon-only on mobile
- Touch-friendly spacing and sizing

### Dark/Light Theme
Toggle via the theme icon in the NavBar. Persisted in localStorage.

### Interactive Feature Tour
First-time visitors get a spotlight tour highlighting key UI features. Reopen anytime via the `?` icon.

### AI Playground (Gemini)
Describe a screen in plain English → AI generates DSL → compiler validates → renderer previews live. Demonstrates AI as a developer velocity multiplier. The compiler acts as a safety net — AI hallucinations are caught at compile time, not runtime.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/screens/:id` | Fetch assembled screen schema |
| `GET /api/products` | Product catalog |
| `GET /api/cart` | Current cart state |
| `POST /api/cart/add` | Add item to cart |
| `POST /api/cart/remove` | Remove item from cart |
| `POST /api/checkout` | Place order |
| `POST /api/ai/generate` | AI screen generation (Gemini) |

## Design Decisions

- **Custom DSL over JSON authoring** — More readable, catches errors at compile time, enables tooling
- **BFF assembles final schema** — Client stays thin; server handles data fetching, personalization, and conditional logic
- **No external tour library** — Built spotlight tour with pure CSS box-shadow cutout technique
- **Class component for error boundary** — React requires class components for `getDerivedStateFromError`
- **MUI for components** — Familiar, accessible, themeable — focus stays on the SDUI architecture, not styling
- **AI generates DSL, not JSON** — Compiler validates AI output the same way it validates human-authored code
- **Gemini via REST** — Simple HTTP call, no SDK dependency; easily swappable for Claude, OpenAI, etc.
