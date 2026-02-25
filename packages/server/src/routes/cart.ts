import { Router, type IRouter } from "express";
import { addToCart, removeFromCart, getCart } from "../services/cart.js";

const router: IRouter = Router();

router.get("/", (req, res) => {
  const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
  res.json(getCart(sessionId));
});

router.post("/add", (req, res) => {
  const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
  const { productId } = req.body as { productId: string };

  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }

  const cart = addToCart(sessionId, productId);
  console.log(`[Cart] Added product ${productId} (session: ${sessionId}, count: ${cart.count})`);
  res.json(cart);
});

router.post("/remove", (req, res) => {
  const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
  const { productId } = req.body as { productId: string };

  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }

  const cart = removeFromCart(sessionId, productId);
  console.log(`[Cart] Removed product ${productId} (session: ${sessionId})`);
  res.json(cart);
});

export default router;
