import { Router, type IRouter } from "express";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { SDUIScreen } from "@sdui/schema";
import { assembleScreen } from "../assembler.js";

const router: IRouter = Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseScreensDir = join(__dirname, "..", "..", "..", "..", "dist", "screens");

/** Load a compiled screen template from disk, with version support */
function loadScreenTemplate(screenId: string, version: string): SDUIScreen | undefined {
  // Try versioned path first (e.g., dist/screens/v2/home.json)
  const versionedPath = join(baseScreensDir, version, `${screenId}.json`);
  if (existsSync(versionedPath)) {
    const content = readFileSync(versionedPath, "utf-8");
    return JSON.parse(content) as SDUIScreen;
  }

  // Fall back to unversioned (e.g., dist/screens/home.json)
  const fallbackPath = join(baseScreensDir, `${screenId}.json`);
  if (existsSync(fallbackPath)) {
    const content = readFileSync(fallbackPath, "utf-8");
    return JSON.parse(content) as SDUIScreen;
  }

  return undefined;
}

/**
 * GET /api/screens/:screenId
 *
 * The main SDUI endpoint. Returns a fully assembled, data-rich screen schema.
 *
 * Query params:
 * - productId: for product-detail screen
 * - userId: to simulate different user personas
 *
 * Headers:
 * - X-SDUI-Capabilities: component negotiation
 * - X-Session-Id: session tracking
 */
router.get("/:screenId", (req, res) => {
  const { screenId } = req.params;
  const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
  const version = (req.headers["x-schema-version"] as string) ?? "v1";
  const params = req.query as Record<string, string>;

  console.log(`[SDUI] Assembling screen: ${screenId} (version: ${version}, session: ${sessionId})`);

  const template = loadScreenTemplate(screenId, version);
  if (!template) {
    res.status(404).json({
      error: `Screen "${screenId}" not found`,
      availableScreens: ["home", "product-detail", "cart", "checkout"],
    });
    return;
  }

  const response = assembleScreen(
    template,
    sessionId,
    params,
    req.capabilities
  );

  res.json(response);
});

export default router;
