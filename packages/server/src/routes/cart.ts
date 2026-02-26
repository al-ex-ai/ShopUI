import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { addToCart, removeFromCart, getCart } from "../services/cart.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router: IRouter = Router();

const cartBodySchema = z.object({
  productId: z.string().min(1, "productId is required"),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
    res.json(getCart(sessionId));
  })
);

router.post(
  "/add",
  validate({ body: cartBodySchema }),
  asyncHandler(async (req, res) => {
    const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
    const { productId } = req.body as z.Infer<typeof cartBodySchema>;

    const cart = addToCart(sessionId, productId);
    console.log(`[Cart] Added product ${productId} (session: ${sessionId}, count: ${cart.count})`);
    res.json(cart);
  })
);

router.post(
  "/remove",
  validate({ body: cartBodySchema }),
  asyncHandler(async (req, res) => {
    const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
    const { productId } = req.body as z.Infer<typeof cartBodySchema>;

    const cart = removeFromCart(sessionId, productId);
    console.log(`[Cart] Removed product ${productId} (session: ${sessionId})`);
    res.json(cart);
  })
);

export default router;
