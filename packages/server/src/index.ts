import "dotenv/config";
import { app } from "./app.js";

const PORT = parseInt(process.env.PORT || "3004", 10);

app.listen(PORT, "127.0.0.1", () => {
  console.log(`\n  SDUI BFF Server running at http://localhost:${PORT}`);
  console.log(`  ─────────────────────────────────────────────`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /api/screens/:screenId  — Fetch SDUI screen`);
  console.log(`    GET  /api/cart               — Get cart`);
  console.log(`    POST /api/cart/add           — Add to cart`);
  console.log(`    POST /api/cart/remove        — Remove from cart`);
  console.log(`    POST /api/ai/generate        — AI screen generator`);
  console.log(`    GET  /api/health             — Health check`);
  console.log(`  ─────────────────────────────────────────────\n`);
});
