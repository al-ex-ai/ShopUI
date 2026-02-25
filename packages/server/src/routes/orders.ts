import { Router, type IRouter } from "express";
import { getCart, clearCart } from "../services/cart.js";
import { createOrder } from "../services/orders.js";

const router: IRouter = Router();

/**
 * POST /api/orders/create
 *
 * BFF orchestration: this single endpoint coordinates multiple services:
 * 1. Cart Service → get current cart items
 * 2. Order Service → create the order
 * 3. Cart Service → clear the cart
 * 4. (In production: Payment Service, Email Service, Inventory Service, etc.)
 */
router.post("/create", (req, res) => {
  const sessionId = (req.headers["x-session-id"] as string) ?? "user-1";
  const { shipping } = req.body as { shipping?: Record<string, string> };

  const cart = getCart(sessionId);

  if (cart.count === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  console.log(`[BFF Orchestration] Creating order for session: ${sessionId}`);
  console.log(`  → Cart Service: ${cart.count} items, total: ${cart.total}`);
  console.log(`  → Shipping: ${shipping?.name ?? "N/A"}, ${shipping?.email ?? "N/A"}`);

  // Step 1: Create order (Order Service)
  const order = createOrder(
    sessionId,
    cart.items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    cart.total
  );
  console.log(`  → Order Service: created ${order.id}`);

  // Step 2: Clear cart (Cart Service)
  clearCart(sessionId);
  console.log(`  → Cart Service: cart cleared`);

  // Step 3: (Would also call Payment Service, Email Service, etc.)
  console.log(`  → Order ${order.id} confirmed!\n`);

  res.json({ order });
});

export default router;
