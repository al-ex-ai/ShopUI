import "dotenv/config";
import express from "express";
import cors from "cors";
import { capabilitiesMiddleware } from "./middleware/capabilities.js";
import screenRoutes from "./routes/screens.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3004", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(capabilitiesMiddleware);

// Routes
app.use("/api/screens", screenRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    platform: "SDUI BFF",
    timestamp: new Date().toISOString(),
  });
});

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
