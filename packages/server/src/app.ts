import express, { type Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { capabilitiesMiddleware } from "./middleware/capabilities.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import screenRoutes from "./routes/screens.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import aiRoutes from "./routes/ai.js";

export const app: Express = express();

// Request logging (first — captures timing for all requests)
app.use(requestLogger);

// CORS — explicit allowed origins
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:4000",
      "http://127.0.0.1:4000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Body parsing with size limit
app.use(express.json({ limit: "100kb" }));

// Global rate limit: 100 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } },
  })
);

// SDUI capability negotiation
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

// Global error handler (must be last)
app.use(errorHandler);
