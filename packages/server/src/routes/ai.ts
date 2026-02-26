import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import rateLimit from "express-rate-limit";
import { compile } from "@sdui/compiler";
import { validate } from "../middleware/validate.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

const router: IRouter = Router();

// Stricter rate limit for AI endpoint: 5 requests per minute per IP
const aiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { code: "AI_RATE_LIMITED", message: "AI generation is rate-limited. Try again in a minute." } },
});

const generateSchema = z.object({
  prompt: z.string().min(1, "A prompt is required").max(2000, "Prompt must be under 2000 characters"),
});

// ---------------------------------------------------------------------------
// DSL grammar reference — fed to the AI as a system prompt
// ---------------------------------------------------------------------------

const DSL_SYSTEM_PROMPT = `You are an expert SDUI (Server-Driven UI) DSL author. You generate screen definitions in a custom DSL that compiles to JSON schemas rendered by a React client.

## DSL Grammar

A screen definition follows this structure:

\`\`\`
screen "Screen Name" {
  layout: column, spacing: <number>, padding: <number>

  // Components (can be nested)
  <componentType> {
    <prop>: <value>, <prop>: <value>
    // children go here
  }

  // Loops for data-driven lists
  each <dataSource> as <alias> {
    // repeated components using alias.field
  }

  // Conditionals
  if <field> <operator> <value> {
    // conditionally shown components
  }
}
\`\`\`

## Available Component Types

- **text** — Typography. Props: content (string), variant ("h1"-"h6", "subtitle1", "subtitle2", "body1", "body2", "caption"), color (string), align ("left", "center", "right")
- **button** — Clickable button. Props: label (string), action (see below), style ("primary", "outlined", "text"), fullWidth (boolean)
- **card** — Card container. Props: elevation (number, 0-4). Children: any components
- **container** — Flex layout wrapper. Props: direction ("row", "column"), spacing (number), padding (number), alignment ("center", "flex-start", "flex-end"), flex (number), background (string), borderRadius (number)
- **image** — Image display. Props: src (string), alt (string), height (number), width (number), objectFit ("cover", "contain")
- **input** — Form input field. Props: name (string), label (string), type ("text", "email", "password", "number"), placeholder (string), required (boolean), fullWidth (boolean)
- **grid** — CSS grid layout. Props: columns (number), gap (number). Children: any components
- **list** — List container. Props: dividers (boolean). Children: any components
- **badge** — Chip/label. Props: content (string), color ("primary", "secondary", "default", "success", "error", "warning", "info")
- **divider** — Horizontal separator. No props needed
- **spacer** — Vertical space. Props: size (number)

## Actions (used in button props)

- **navigate("/path")** — Client-side navigation
- **api_call("/api/endpoint", "POST", { key: value })** — API call with optional body

## Data Binding

- Use \`{{field.path}}\` in strings for data references that the server resolves
- Use \`field.path\` (no quotes, no braces) in loop bodies to reference the loop variable
- In loops: \`each products as product { text { content: product.name } }\`

## Property Values

- Strings: \`"hello"\` (use quotes)
- Numbers: \`16\` (no quotes)
- Booleans: \`true\` or \`false\`
- Known identifiers: \`column\`, \`row\`, \`center\`, \`h1\`-\`h6\`, \`body1\`, \`body2\`, \`subtitle1\`, \`subtitle2\`, \`caption\`, \`primary\`, \`outlined\`, \`text\`, \`left\`, \`right\`
- Semantic colors: \`"primary.main"\`, \`"text.secondary"\`, \`"primary.contrastText"\`, \`"success.main"\`, \`"error.main"\`

## Rules

1. Always start with \`screen "Name" { ... }\`
2. Always include layout properties (layout, spacing, padding)
3. Use semantic color tokens, not hex colors
4. Use meaningful content — make it look realistic
5. Output ONLY the DSL code, no explanations or markdown fences
6. Keep screens practical and well-structured
7. Use containers for layout grouping (row/column)
8. Use cards for visual grouping with elevation

## Example

screen "Dashboard" {
  layout: column, spacing: 20, padding: 24

  text { content: "Welcome back!", variant: "h4" }
  text { content: "Here's your daily summary", variant: "body1", color: "text.secondary" }

  grid {
    columns: 3, gap: 16

    card {
      elevation: 1
      container {
        padding: 16, alignment: "center"
        text { content: "Orders", variant: "caption", color: "text.secondary" }
        text { content: "142", variant: "h4", color: "primary.main" }
      }
    }

    card {
      elevation: 1
      container {
        padding: 16, alignment: "center"
        text { content: "Revenue", variant: "caption", color: "text.secondary" }
        text { content: "$12,450", variant: "h4", color: "success.main" }
      }
    }

    card {
      elevation: 1
      container {
        padding: 16, alignment: "center"
        text { content: "Users", variant: "caption", color: "text.secondary" }
        text { content: "3,891", variant: "h4", color: "primary.main" }
      }
    }
  }
}`;

// ---------------------------------------------------------------------------
// POST /api/ai/generate — Generate DSL from natural language via Gemini
// ---------------------------------------------------------------------------

router.post(
  "/generate",
  aiRateLimit,
  validate({ body: generateSchema }),
  asyncHandler(async (req, res) => {
    const { prompt } = req.body as z.Infer<typeof generateSchema>;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      throw new AppError(503, "AI_NOT_CONFIGURED", "Gemini API key is not configured.");
    }

    // Call Gemini API with a 15-second timeout
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: DSL_SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Generate a SDUI screen for: ${prompt.trim()}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("[AI] Gemini API error:", geminiRes.status, errBody);
      throw new AppError(502, "AI_UPSTREAM_ERROR", `Gemini API returned ${geminiRes.status}`);
    }

    const geminiData = (await geminiRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawDsl =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!rawDsl) {
      throw new AppError(502, "AI_EMPTY_RESPONSE", "Gemini returned an empty response.");
    }

    // Strip markdown code fences if the model wrapped them
    const cleanDsl = rawDsl
      .replace(/^```(?:sdui|dsl)?\s*\n?/i, "")
      .replace(/\n?```\s*$/, "")
      .trim();

    // Compile the generated DSL through our compiler pipeline
    const { screen, errors } = compile(cleanDsl);

    if (errors.length > 0) {
      res.json({
        dsl: cleanDsl,
        screen: null,
        compileErrors: errors,
        message: "AI generated DSL but it had compilation errors.",
      });
      return;
    }

    res.json({
      dsl: cleanDsl,
      screen,
      compileErrors: [],
      message: "Screen generated and compiled successfully.",
    });
  })
);

export default router;
