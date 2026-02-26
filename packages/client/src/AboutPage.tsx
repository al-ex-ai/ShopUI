import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SchemaIcon from "@mui/icons-material/Schema";
import CodeIcon from "@mui/icons-material/Code";
import BuildIcon from "@mui/icons-material/Build";
import DnsIcon from "@mui/icons-material/Dns";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import WidgetsIcon from "@mui/icons-material/Widgets";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import SpeedIcon from "@mui/icons-material/Speed";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaletteIcon from "@mui/icons-material/Palette";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HomeIcon from "@mui/icons-material/Home";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  content: React.ReactNode;
}

const CODE_BLOCK_SX = {
  bgcolor: "#1e1e1e",
  color: "#d4d4d4",
  p: { xs: 1.5, md: 2 },
  borderRadius: 1.5,
  fontSize: { xs: "0.7rem", md: "0.8rem" },
  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
  overflow: "auto",
  lineHeight: 1.6,
  my: 1.5,
  whiteSpace: "pre" as const,
  maxWidth: "100%",
};

const SECTION_SX = { mb: 2.5 };

const steps: Step[] = [
  {
    id: "architecture",
    title: "Project Architecture",
    icon: <AccountTreeIcon />,
    subtitle: "Monorepo setup with pnpm workspaces",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          The platform is structured as a <strong>pnpm monorepo</strong> with four independent packages,
          each with its own responsibility. This mirrors how Intuit's Dynamic Experiences Platform would
          be organized — separate concerns for schema definition, compilation, server-side assembly,
          and client-side rendering.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`sdui-platform/
├── pnpm-workspace.yaml          # Workspace configuration
├── packages/
│   ├── schema/                   # Shared types & validation
│   ├── compiler/                 # DSL → JSON compiler pipeline
│   ├── server/                   # BFF server (Express)
│   └── client/                   # React SDUI renderer (Vite)
└── screens/                      # DSL source files (.sdui)`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Why a Monorepo?</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          • <strong>Shared types</strong> — The schema package is consumed by both server and compiler,
          ensuring type safety across boundaries.<br />
          • <strong>Atomic changes</strong> — A schema change + compiler update + server adaptation can
          ship in one commit.<br />
          • <strong>Independent deployment</strong> — Each package has its own build, test, and deploy
          cycle.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Tech Stack</Typography>
        <Typography variant="body2">
          • <strong>TypeScript 5</strong> — Strict mode across all packages<br />
          • <strong>pnpm</strong> — Fast, disk-efficient package manager with built-in workspace support<br />
          • <strong>Vite</strong> — Client dev server and build tool<br />
          • <strong>Express</strong> — BFF server framework<br />
          • <strong>MUI 6</strong> — Component library for the React renderer
        </Typography>
      </>
    ),
  },
  {
    id: "schema",
    title: "Schema Design",
    icon: <SchemaIcon />,
    subtitle: "Core SDUI type system & component registry",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          The schema package defines the <strong>contract</strong> between server and client. Every UI
          element is described as a JSON node with a type, props, optional children, layout directives,
          and actions. This is the heart of Server-Driven UI — a platform-agnostic description of what
          to render.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Core Types</Typography>
        <Box component="pre" sx={CODE_BLOCK_SX}>{`SDUINode {
  type: string          // "text", "button", "card", etc.
  props: Record         // Component-specific properties
  children?: SDUINode[] // Nested components (recursive)
  layout?: SDUILayout   // direction, spacing, padding
  version?: number      // Schema versioning
  fallback?: SDUINode   // Graceful degradation
  condition?: SDUICondition  // Conditional rendering
  loop?: SDUILoop       // Data-driven repetition
}

SDUIAction {
  type: "navigate" | "api_call" | "set_state" | "analytics"
  ...params
}

SDUIScreen {
  id, name, schemaVersion
  layout: SDUILayout
  children: SDUINode[]
  data?: Record         // Server-injected data bindings
  meta?: { title, description, cache }
}`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Component Registry</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          The registry tracks every known component type with its version and required/optional props.
          This enables <strong>capability negotiation</strong> — the client tells the server which
          components it supports, and the server adapts the response accordingly. Older clients get
          fallback components; newer clients get richer experiences.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Schema Validation</Typography>
        <Typography variant="body2">
          A validator checks every screen against the registry before it's served — catching unknown
          component types, missing required props, and version mismatches at build time rather than
          runtime.
        </Typography>
      </>
    ),
  },
  {
    id: "dsl",
    title: "DSL Design",
    icon: <CodeIcon />,
    subtitle: "Custom domain-specific language for screen definitions",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          Instead of writing raw JSON schemas by hand, we designed a <strong>custom DSL</strong> that's
          concise, readable, and expressive. Product managers and designers can understand (and
          potentially edit) screen definitions without knowing JSON or React.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>DSL Syntax Example</Typography>
        <Box component="pre" sx={CODE_BLOCK_SX}>{`screen "Home" {
  layout: column, spacing: 20, padding: 24

  // Hero banner
  container {
    padding: 24, background: "#1976d2", borderRadius: 12
    text { content: "Welcome to ShopUI", variant: "h3", color: "white" }
  }

  // Data-driven product grid
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
}`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Key Language Features</Typography>
        <Typography variant="body2">
          • <strong>Screen blocks</strong> — Top-level container with layout directives<br />
          • <strong>Component nesting</strong> — Brace-based hierarchy that maps to JSON children<br />
          • <strong>Data binding</strong> — <code>{"{{product.name}}"}</code> references resolved at assembly time<br />
          • <strong>Loops</strong> — <code>each items as item</code> for data-driven repetition<br />
          • <strong>Conditionals</strong> — <code>if condition</code> for server-side visibility control<br />
          • <strong>Actions</strong> — <code>navigate()</code>, <code>api_call()</code> as first-class constructs<br />
          • <strong>Comments</strong> — <code>{"// single-line comments"}</code> for documentation
        </Typography>
      </>
    ),
  },
  {
    id: "compiler",
    title: "Compiler Pipeline",
    icon: <BuildIcon />,
    subtitle: "Lexer → Parser → AST → Code Generation",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          A real 4-stage compiler transforms <code>.sdui</code> files into validated JSON schemas.
          This isn't a simple template engine — it's a proper compiler with tokenization, recursive
          descent parsing, abstract syntax tree construction, and code generation.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`.sdui source
    │
    ▼
┌─────────┐   Breaks source text into tokens
│  Lexer   │   (keywords, strings, numbers, symbols, operators)
└────┬────┘
     ▼
┌─────────┐   Recursive descent parser builds
│  Parser  │   a tree structure from tokens
└────┬────┘
     ▼
┌─────────┐   Abstract Syntax Tree with typed nodes:
│   AST    │   ScreenNode, ComponentNode, LoopNode,
│          │   ConditionalNode, PropertyNode
└────┬────┘
     ▼
┌─────────┐   Transforms AST into SDUIScreen JSON,
│ CodeGen  │   resolving references and known identifiers
└────┬────┘
     ▼
  .json output`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Stage 1: Lexer (Tokenizer)</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          Reads raw source text character by character. Produces tokens like <code>KEYWORD("screen")</code>,
          <code>STRING("Home")</code>, <code>NUMBER(24)</code>, <code>LBRACE</code>, <code>IDENTIFIER("text")</code>.
          Handles string escaping, multi-digit numbers, boolean literals, and single-line comments.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Stage 2: Parser</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          A <strong>recursive descent parser</strong> that consumes tokens and builds an AST.
          Key challenge: handling dot-separated identifiers in loop sources (e.g., <code>cart.items</code>)
          and distinguishing between property assignments and nested component declarations.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Stage 3: Code Generation</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          Walks the AST and emits JSON. Resolves <strong>known identifiers</strong> (like <code>column</code>,
          <code>primary</code>, <code>true</code>) as plain values instead of data references. Converts
          action calls into structured action objects. Maps layout properties from flat DSL syntax to
          nested JSON structure.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Test Coverage</Typography>
        <Typography variant="body2">
          <strong>80 tests</strong> across the platform — <strong>50 compiler tests</strong> (24 lexer, 14 parser,
          12 codegen) and <strong>30 server tests</strong> (15 route integration tests via supertest, 15 assembler
          unit tests covering data binding, condition evaluation, loop expansion, and capability filtering). Run
          via <code>vitest</code> in under 2 seconds.
        </Typography>
      </>
    ),
  },
  {
    id: "bff",
    title: "BFF Server",
    icon: <DnsIcon />,
    subtitle: "Backend for Frontend — data assembly & personalization",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          The BFF (Backend for Frontend) is the <strong>orchestration layer</strong> between
          microservices and the client. It loads compiled screen templates, fetches data from mock
          services, resolves data bindings, evaluates conditions, expands loops, and returns a
          fully-hydrated UI schema.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`Client Request
    │
    ▼
┌─────────────────────────────────────────┐
│           BFF Server (Express)           │
│                                          │
│  1. Load screen template (compiled JSON) │
│  2. Parse client capabilities header     │
│  3. Fetch data from mock services:       │
│     ├── Product Service → catalog data   │
│     ├── User Service → profile/prefs     │
│     ├── Cart Service → session cart      │
│     └── Order Service → order history    │
│  4. Assembler resolves:                  │
│     ├── {{bindings}} → real values       │
│     ├── Conditions → show/hide nodes     │
│     ├── Loops → expand repeated items    │
│     └── Capabilities → filter components │
│  5. Return hydrated SDUIScreen JSON      │
└─────────────────────────────────────────┘`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Production Middleware Stack</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          • <strong>Zod validation</strong> — Every route validates params, body, and query with structured error responses<br />
          • <strong>Rate limiting</strong> — 100 req/min global, 5 req/min for AI endpoint (protects Gemini API costs)<br />
          • <strong>CORS</strong> — Explicit allowed origins, methods, and credentials<br />
          • <strong>Request logging</strong> — Method, path, status code, and duration for every request<br />
          • <strong>Global error handler</strong> — Consistent <code>{"{ error: { code, message } }"}</code> format with <code>AppError</code> class<br />
          • <strong>Body size limit</strong> — 100KB max to prevent payload abuse
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Mock Microservices</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          • <strong>Products</strong> — 6 items with names, prices, images<br />
          • <strong>Users</strong> — 3 profiles (new, returning, premium) for personalization<br />
          • <strong>Cart</strong> — In-memory per-session cart (add, remove, clear, get)<br />
          • <strong>Orders</strong> — Order creation with auto-incrementing IDs
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>BFF Orchestration Example</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          The <code>POST /api/orders/create</code> endpoint demonstrates real BFF value — a single
          client call triggers: get cart → validate → create order → clear cart → return confirmation.
          In production, this would also coordinate payment, inventory, and notification services.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Capability Negotiation</Typography>
        <Typography variant="body2">
          The client sends an <code>X-SDUI-Capabilities</code> header listing supported component types.
          The server filters out unsupported components and substitutes fallbacks, enabling
          <strong> progressive enhancement</strong> across client versions.
        </Typography>
      </>
    ),
  },
  {
    id: "renderer",
    title: "React Renderer",
    icon: <ViewQuiltIcon />,
    subtitle: "Recursive JSON → React component tree",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          The renderer is a <strong>generic, recursive engine</strong> that turns any SDUI JSON schema
          into a live React component tree. It has zero knowledge of specific screens — the same
          renderer handles home, cart, checkout, and any future screen without code changes.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`function SDUIRenderer({ node }) {
  // 1. Look up component by type string
  const Component = registry.get(node.type);

  // 2. Resolve input bindings (form state)
  const resolvedProps = resolveBindings(node.props);

  // 3. Recursively render children
  const children = node.children?.map(child =>
    <SDUIRenderer node={child} ... />
  );

  // 4. Apply layout wrapper if specified
  if (node.layout) {
    return (
      <LayoutWrapper layout={node.layout}>
        <Component {...resolvedProps}>{children}</Component>
      </LayoutWrapper>
    );
  }

  return <Component {...resolvedProps}>{children}</Component>;
}`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>How It Works</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          1. <strong>Type lookup</strong> — Maps <code>"text"</code> → <code>SDUIText</code>,
          <code>"button"</code> → <code>SDUIButton</code> via ComponentRegistry<br />
          2. <strong>Prop resolution</strong> — Resolves form bindings so inputs reflect current state<br />
          3. <strong>Recursive descent</strong> — Each node renders its children, which render theirs<br />
          4. <strong>Layout application</strong> — Wraps components in flexbox/grid based on layout directives<br />
          5. <strong>Fallback</strong> — Unknown types render a dev-friendly warning instead of crashing
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Error Boundary</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          Since the server controls the schema, a bad payload shouldn't crash the client. An
          <code> SDUIErrorBoundary</code> wraps the renderer — if any component throws during render,
          users see a friendly warning with a <strong>Retry</strong> button instead of a white screen.
          The boundary logs the error with component stack traces for debugging.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Responsive Design</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          All components are <strong>mobile-first responsive</strong> using MUI breakpoints. Grid columns
          collapse (3 → 2 → 1), the NavBar adapts to icon-only mode on small screens, padding scales
          down, and the About page switches from a sidebar to a horizontal chip strip. No separate
          mobile schema needed — the same JSON works across all viewports.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Cross-Platform Rendering</Typography>
        <Typography variant="body2">
          This architecture is <strong>renderer-agnostic</strong>. The same JSON schema that drives this
          React renderer could drive a React Native renderer (mapping to native Views), a SwiftUI renderer,
          or a Jetpack Compose renderer. Only the component registry and renderer change — the server,
          compiler, and schema stay identical.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          To demonstrate this, click the <strong>phone icon</strong> in the NavBar to open the{" "}
          <strong>Mobile Preview</strong> drawer. It renders the exact same SDUI schema inside an iPhone or
          Android device frame with platform-specific MUI themes — iOS uses SF Pro fonts, flat cards, and
          pill buttons; Android uses Roboto, Material You colors, and elevated cards. One schema, two
          completely different visual experiences — the core value proposition of server-driven UI.
        </Typography>
      </>
    ),
  },
  {
    id: "components",
    title: "Component Library",
    icon: <WidgetsIcon />,
    subtitle: "15 MUI-based SDUI component implementations",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          Each SDUI component type has a concrete React implementation backed by Material UI. These are
          the <strong>"native" components</strong> that the renderer maps to. In a mobile app, these
          would be native UIKit/SwiftUI or Android View implementations instead.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, my: 2 }}>
          {[
            { name: "SDUIText", desc: "Typography — h1-h6, body, caption with color/align" },
            { name: "SDUIButton", desc: "Buttons — primary, outlined, text with action dispatch" },
            { name: "SDUICard", desc: "Card container — elevation control, outlined variant" },
            { name: "SDUIImage", desc: "Images — with error fallback showing placeholder icon" },
            { name: "SDUIInput", desc: "Form fields — text, email, password with state binding" },
            { name: "SDUIContainer", desc: "Flexbox layout — direction, spacing, alignment" },
            { name: "SDUIGrid", desc: "CSS Grid — configurable columns and gap" },
            { name: "SDUIList", desc: "List wrapper — optional dividers between items" },
            { name: "SDUIBadge", desc: "Chip/badge — colored labels and status indicators" },
            { name: "SDUIDivider", desc: "Horizontal rule — visual section separator" },
            { name: "SDUISpacer", desc: "Vertical spacing — configurable pixel size" },
            { name: "SDUIFallback", desc: "Unknown type handler — dev warning, no crash" },
            { name: "ErrorBoundary", desc: "Render error recovery — retry button, error log" },
            { name: "MobilePreview", desc: "iOS/Android device frame — platform-themed rendering" },
            { name: "FeatureTour", desc: "Spotlight onboarding — 8-step guided walkthrough" },
          ].map(({ name, desc }) => (
            <Paper key={name} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: "monospace", color: "primary.main" }}>
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary">{desc}</Typography>
            </Paper>
          ))}
        </Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Design Decisions</Typography>
        <Typography variant="body2">
          • <strong>Flat buttons</strong> — <code>disableElevation</code> and <code>textTransform: "none"</code> for modern look<br />
          • <strong>Image fallback</strong> — <code>onError</code> handler shows a gray box with icon instead of broken image<br />
          • <strong>Badge sizing</strong> — <code>alignSelf: "flex-start"</code> prevents chips from stretching full width<br />
          • <strong>Outlined cards</strong> — <code>elevation: 0</code> with border for cleaner appearance
        </Typography>
      </>
    ),
  },
  {
    id: "actions",
    title: "Action System",
    icon: <TouchAppIcon />,
    subtitle: "Navigate, API calls, state, and analytics",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          Actions are <strong>platform-agnostic intent descriptions</strong> embedded in the schema.
          The server says <em>what</em> should happen; the client decides <em>how</em>. This decoupling
          means the same action works across web, iOS, and Android — each platform maps it to its
          native implementation.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Action Types</Typography>
        <Box component="pre" sx={CODE_BLOCK_SX}>{`// 1. Navigation — client-side routing
{ type: "navigate", target: "/cart" }

// 2. API Call — server communication with form state merge
{
  type: "api_call",
  endpoint: "/api/cart/add",
  method: "POST",
  body: { productId: "prod-1" }
}

// 3. State Update — local UI state changes
{ type: "set_state", key: "selectedTab", value: "details" }

// 4. Analytics — event tracking
{ type: "analytics", event: "product_viewed", properties: {...} }`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Form State Merging</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          When an <code>api_call</code> action fires, the ActionHandler automatically merges the
          current form state (from <code>useSDUIState</code>) into the request body. This means the
          checkout form inputs are automatically included when "Place Order" is clicked — no manual
          wiring needed.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Toast Notifications</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          The ActionHandler is wired to a <strong>toast notification system</strong> (MUI Snackbar + Alert).
          Success actions ("Added to cart", "Order placed") show green toasts; API failures show red error
          toasts. This replaces silent <code>console.error</code> calls with user-visible feedback — the same
          pattern used by production e-commerce apps.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Response-Driven Navigation</Typography>
        <Typography variant="body2">
          After an API call, the ActionHandler inspects the response. If the server returns an order
          ID, it automatically navigates to the confirmation page. This is a simple form of
          <strong> server-driven navigation</strong> — the server controls the flow, not the client.
        </Typography>
      </>
    ),
  },
  {
    id: "caching",
    title: "Caching & Performance",
    icon: <SpeedIcon />,
    subtitle: "Stale-while-revalidate, skeletons, and fallbacks",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          Performance is critical for SDUI because every screen requires a network fetch. We implement
          a <strong>multi-layer caching strategy</strong> that balances freshness with responsiveness.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`User navigates to /cart
    │
    ▼
┌─────────────────────────────────────┐
│  Client Cache (schemaCache)          │
│                                      │
│  Cache HIT + Fresh?                  │
│  └─ Show cached screen instantly     │
│                                      │
│  Cache HIT + Stale?                  │
│  └─ Show cached, fetch in background │
│  └─ Swap to fresh when ready         │
│                                      │
│  Cache MISS?                         │
│  └─ Show skeleton loading state      │
│  └─ Fetch from server                │
└─────────────────────────────────────┘
    │
    ▼  (Always fetches fresh for cart/checkout)
┌─────────────────────────────────────┐
│  BFF Server                          │
│  └─ Assembles screen with live data  │
└─────────────────────────────────────┘`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Skeleton Loading</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          While the schema loads, a <code>SDUIScreenSkeleton</code> renders placeholder shapes that
          approximate the final layout. This avoids layout shift and gives users immediate visual
          feedback.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Offline Fallback</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          If a fetch fails (network error), the client falls back to the last cached schema. The user
          sees stale data rather than an error screen — essential for mobile apps with flaky connections.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Cart Data Freshness</Typography>
        <Typography variant="body2">
          For dynamic screens like cart and checkout, the client always fetches fresh data from the
          server, using cached schemas only as instant placeholders. This prevents showing stale cart
          counts or outdated totals after add/remove operations.
        </Typography>
      </>
    ),
  },
  {
    id: "theming",
    title: "Theme System",
    icon: <PaletteIcon />,
    subtitle: "Dark mode, semantic tokens, and theme-aware rendering",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          SDUI schemas shouldn't hardcode colors — they need to work across themes. We built a
          <strong> semantic color token system</strong> that lets the server send theme-agnostic
          color references, which the client resolves at render time using the active MUI theme.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`// DSL uses semantic tokens instead of hex colors:
container {
  background: "primary.main"        // not "#1976d2"
  text { color: "text.secondary" }  // not "#757575"
  text { color: "primary.contrastText" }  // adapts to bg
}

// Client resolves at render time:
useResolveColor("primary.main")
  → Light: "#1976d2"
  → Dark:  "#90caf9"`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Two Built-in Themes</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          • <strong>Light</strong> — Blue primary (#1976d2), white backgrounds, light gray surfaces<br />
          • <strong>Dark</strong> — Light blue primary (#90caf9), dark backgrounds (#121212), dark paper (#1e1e1e)<br />
          • Toggle persisted via <code>localStorage</code> — survives page refreshes
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>How It Works</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          1. Server sends colors as dot-paths: <code>"primary.main"</code>, <code>"text.secondary"</code><br />
          2. <code>useResolveColor</code> hook walks the MUI theme palette object<br />
          3. Returns the actual CSS color for the current theme mode<br />
          4. Falls through to raw values for direct CSS (<code>#fff</code>, <code>rgb()</code>)
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Why This Matters</Typography>
        <Typography variant="body2">
          The server doesn't need to know which theme the client is using. One schema works for
          light mode, dark mode, or any future theme — <strong>zero server changes required</strong>.
          This is the same pattern used by design token systems like Figma Tokens and Style Dictionary.
        </Typography>
      </>
    ),
  },
  {
    id: "versioning",
    title: "Schema Versioning",
    icon: <HistoryIcon />,
    subtitle: "V1/V2 schemas with live version switching",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          Real SDUI platforms must evolve screens without breaking older clients. We demonstrate this
          with <strong>two schema versions</strong> of every screen that can be switched live — the
          same renderer handles both without any code changes.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`Version Toggle (NavBar)
    │
    ▼
Client sends: X-Schema-Version: v2
    │
    ▼
┌─────────────────────────────────────┐
│  BFF Server                          │
│                                      │
│  v1/home.json → Basic product grid   │
│  v2/home.json → + Promo banner,      │
│                   ratings, "New" tags │
│                                      │
│  Same assembler, same data binding,  │
│  different screen templates          │
└─────────────────────────────────────┘
    │
    ▼
Same React renderer handles both versions`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>What Changes Between Versions</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          • <strong>V1 (Stable)</strong> — Clean, minimal screens with core functionality<br />
          • <strong>V2 (Enhanced)</strong> — Richer layouts with promo banners, product ratings,
          quantity controls in cart, and progress indicators in checkout
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>How Version Routing Works</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          1. Client sends <code>X-Schema-Version</code> header with every screen request<br />
          2. Server loads the matching compiled template (<code>v1/</code> or <code>v2/</code> directory)<br />
          3. Same assembler resolves data bindings and conditions for both versions<br />
          4. Client renderer is version-agnostic — it just renders whatever JSON it receives
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Interview Insight</Typography>
        <Typography variant="body2">
          This demonstrates <strong>backward compatibility</strong> and <strong>progressive rollout</strong>.
          In production, you'd use feature flags or A/B testing to gradually shift users from V1 → V2,
          with instant rollback capability. The client never needs an app update — only the server
          config changes.
        </Typography>
      </>
    ),
  },
  {
    id: "e2e-flow",
    title: "E-Commerce Flow",
    icon: <ShoppingCartIcon />,
    subtitle: "Full end-to-end: browse → cart → checkout → order",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          The complete e-commerce flow demonstrates every piece of the SDUI platform working together —
          server-driven screens, data binding, actions, form state, BFF orchestration, and real-time
          UI updates.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`1. BROWSE PRODUCTS (Home Screen)
   Server: loads home.json template + Product Service data
   Client: renders product grid via SDUI loop expansion
   Action: "Add to Cart" → api_call → POST /api/cart/add

2. VIEW CART (Cart Screen)
   Server: loads cart.json + Cart Service data
   Client: conditional rendering (empty vs. filled cart)
   Action: "Remove" → api_call → POST /api/cart/remove
   Action: "Checkout" → navigate → /checkout

3. CHECKOUT (Checkout Screen)
   Server: loads checkout.json + Cart Service (order summary)
   Client: form inputs bound to useSDUIState
   Action: "Place Order" → api_call with merged form state
           → POST /api/orders/create

4. BFF ORCHESTRATION (Order Creation)
   Server: Cart Service → get items
           Order Service → create order
           Cart Service → clear cart
   Response: { order: { id: "ORD-1001" } }

5. CONFIRMATION (Client-Side)
   ActionHandler detects order.id in response
   Auto-navigates to /order-confirmation?orderId=ORD-1001
   Cart badge updates to 0 (via CartContext refresh)`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>What Makes This Special</Typography>
        <Typography variant="body2">
          • <strong>Zero hardcoded UI</strong> — Every screen is server-driven, even the checkout form<br />
          • <strong>Form state lives client-side</strong> — Server defines the fields, client manages values<br />
          • <strong>BFF orchestrates</strong> — One client call triggers multiple backend service calls<br />
          • <strong>Real-time updates</strong> — Cart badge, totals, and item lists reflect changes instantly<br />
          • <strong>Server controls flow</strong> — Navigation after order placement is response-driven
        </Typography>
      </>
    ),
  },
  {
    id: "ai-playground",
    title: "AI Playground",
    icon: <AutoAwesomeIcon />,
    subtitle: "Natural language → DSL → live preview via Gemini AI",
    content: (
      <>
        <Typography variant="body1" sx={SECTION_SX}>
          The AI Playground demonstrates how <strong>generative AI</strong> can accelerate SDUI authoring.
          Instead of learning the DSL syntax, teams describe a screen in plain English — the AI generates
          valid DSL code, which flows through the same compiler pipeline and renders live.
        </Typography>

        <Box component="pre" sx={CODE_BLOCK_SX}>{`User: "A settings page with profile photo,
       name field, email field, and Save button"
    │
    ▼
┌─────────────────────────────────────────┐
│  BFF Server (POST /api/ai/generate)     │
│                                          │
│  1. System prompt with DSL grammar spec  │
│     (component types, props, actions,    │
│      layout rules, binding syntax)       │
│  2. Send to Gemini API                   │
│  3. Receive generated DSL code           │
│  4. Strip markdown fences (safety)       │
│  5. Run through Compiler pipeline:       │
│     Lexer → Parser → AST → CodeGen      │
│  6. Return { dsl, screen, errors }       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  React Client (Playground Page)          │
│                                          │
│  Left panel:  Generated DSL source code  │
│  Right panel: Live rendered preview via  │
│               the same SDUIRenderer      │
└─────────────────────────────────────────┘`}</Box>

        <Typography variant="subtitle2" color="primary" gutterBottom>Compiler as Safety Net</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          AI output is <strong>never trusted blindly</strong>. Every generated DSL goes through the full
          compiler pipeline — lexer, parser, and code generator. If the AI hallucinates invalid syntax
          or uses non-existent components, the compiler catches it and returns structured errors. This
          is the same validation that human-authored DSL goes through.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>System Prompt Engineering</Typography>
        <Typography variant="body2" sx={SECTION_SX}>
          The AI receives a detailed system prompt containing the complete DSL grammar specification:
          all component types with their props, action syntax, data binding rules, layout properties,
          and semantic color tokens. This structured prompt ensures the AI generates DSL that aligns
          with the platform's capabilities.
        </Typography>

        <Typography variant="subtitle2" color="primary" gutterBottom>Interview Insight</Typography>
        <Typography variant="body2">
          This feature demonstrates how AI can be a <strong>developer velocity multiplier</strong> for
          SDUI platforms. Teams describe intent → AI generates a first draft → compiler validates →
          humans refine. The DSL's strict grammar means compile-time validation catches AI mistakes
          before they reach production. In production, this could power a visual editor, Slack bot,
          or CI/CD integration where product managers describe experiments and get validated screens.
        </Typography>
      </>
    ),
  },
];

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const current = steps[activeStep];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, maxWidth: 1200, mx: "auto", height: { md: "calc(100vh - 80px)" } }}>
      {/* Mobile: horizontal step strip */}
      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 1,
            py: 1,
            gap: 0.5,
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {steps.map((step, index) => (
            <Chip
              key={step.id}
              icon={step.icon as React.ReactElement}
              label={step.title}
              size="small"
              variant={activeStep === index ? "filled" : "outlined"}
              color={activeStep === index ? "primary" : "default"}
              onClick={() => setActiveStep(index)}
              sx={{ flexShrink: 0, fontWeight: activeStep === index ? 600 : 400 }}
            />
          ))}
        </Box>
      ) : (
        /* Desktop: Side Menu */
        <Box
          sx={{
            width: 280,
            minWidth: 280,
            borderRight: "1px solid",
            borderColor: "divider",
            overflow: "auto",
            py: 1,
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}>
              Platform Walkthrough
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {steps.length} steps · SDUI from scratch
            </Typography>
          </Box>
          <Divider />
          <List dense disablePadding>
            {steps.map((step, index) => (
              <ListItemButton
                key={step.id}
                selected={activeStep === index}
                onClick={() => setActiveStep(index)}
                sx={{
                  py: 1.2,
                  borderLeft: activeStep === index ? "3px solid" : "3px solid transparent",
                  borderColor: activeStep === index ? "primary.main" : "transparent",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: activeStep === index ? "primary.main" : "text.secondary" }}>
                  {step.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label={index + 1} size="small" sx={{ height: 20, minWidth: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                      <Typography variant="body2" sx={{ fontWeight: activeStep === index ? 600 : 400 }}>
                        {step.title}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              size="small"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{ textTransform: "none" }}
            >
              Back to Shop Demo
            </Button>
          </Box>
        </Box>
      )}

      {/* Content Area */}
      <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
            <Chip
              label={`Step ${activeStep + 1} of ${steps.length}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {current.subtitle}
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
            {current.title}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {current.content}

        {/* Navigation */}
        <Divider sx={{ mt: 4, mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            disabled={activeStep === 0}
            onClick={() => setActiveStep(activeStep - 1)}
            sx={{ textTransform: "none" }}
          >
            {activeStep > 0 ? (isMobile ? "Prev" : steps[activeStep - 1].title) : ""}
          </Button>
          {isMobile && (
            <Button
              size="small"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{ textTransform: "none" }}
            >
              Shop
            </Button>
          )}
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            disabled={activeStep === steps.length - 1}
            onClick={() => setActiveStep(activeStep + 1)}
            sx={{ textTransform: "none" }}
          >
            {activeStep < steps.length - 1 ? (isMobile ? "Next" : steps[activeStep + 1].title) : ""}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
