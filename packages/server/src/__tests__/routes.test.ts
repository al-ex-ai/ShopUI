import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("Health check", () => {
  it("GET /api/health returns status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.platform).toBe("SDUI BFF");
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("Screen routes", () => {
  it("GET /api/screens/home returns assembled screen", async () => {
    const res = await request(app)
      .get("/api/screens/home")
      .set("X-Session-Id", "user-1")
      .set("X-Schema-Version", "v1");

    expect(res.status).toBe(200);
    expect(res.body.screen).toBeDefined();
    expect(res.body.screen.id).toBe("home");
    expect(res.body.screen.children).toBeInstanceOf(Array);
    expect(res.body.screen.children.length).toBeGreaterThan(0);
    expect(res.body.serverTimestamp).toBeDefined();
  });

  it("GET /api/screens/nonexistent returns 404", async () => {
    const res = await request(app).get("/api/screens/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SCREEN_NOT_FOUND");
  });

  it("GET /api/screens/home with v2 returns v2 screen", async () => {
    const res = await request(app)
      .get("/api/screens/home")
      .set("X-Schema-Version", "v2");

    expect(res.status).toBe(200);
    expect(res.body.screen).toBeDefined();
  });

  it("rejects screenId with path traversal characters", async () => {
    const res = await request(app).get("/api/screens/..%2F..%2Fetc");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("resolves data bindings in screen children", async () => {
    const res = await request(app)
      .get("/api/screens/home")
      .set("X-Session-Id", "user-1");

    expect(res.status).toBe(200);
    // Home screen should have resolved product data (no {{}} bindings remaining)
    const json = JSON.stringify(res.body.screen.children);
    expect(json).not.toContain("{{products");
  });

  it("filters components by client capabilities", async () => {
    // Only send text capability — other component types should be filtered
    const res = await request(app)
      .get("/api/screens/home")
      .set("X-SDUI-Capabilities", "text@1");

    expect(res.status).toBe(200);
    const types = res.body.screen.children.map((n: { type: string }) => n.type);
    // All returned nodes should be "text" since that's the only capability
    types.forEach((t: string) => expect(t).toBe("text"));
  });
});

describe("Cart routes", () => {
  beforeEach(async () => {
    // Clear cart by removing items (no direct clear endpoint)
    const cart = await request(app)
      .get("/api/cart")
      .set("X-Session-Id", "test-session");
    for (const item of cart.body.items ?? []) {
      await request(app)
        .post("/api/cart/remove")
        .set("X-Session-Id", "test-session")
        .send({ productId: item.id });
    }
  });

  it("GET /api/cart returns empty cart", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("X-Session-Id", "test-session");

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it("POST /api/cart/add adds item to cart", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("X-Session-Id", "test-session")
      .send({ productId: "1" });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.items[0].id).toBe("1");
  });

  it("POST /api/cart/add without productId returns 400", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("X-Session-Id", "test-session")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/cart/add with empty productId returns 400", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("X-Session-Id", "test-session")
      .send({ productId: "" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/cart/remove removes item from cart", async () => {
    // Add first
    await request(app)
      .post("/api/cart/add")
      .set("X-Session-Id", "test-session")
      .send({ productId: "1" });

    // Remove
    const res = await request(app)
      .post("/api/cart/remove")
      .set("X-Session-Id", "test-session")
      .send({ productId: "1" });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it("POST /api/cart/remove without body returns 400", async () => {
    const res = await request(app)
      .post("/api/cart/remove")
      .set("X-Session-Id", "test-session")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("Order routes", () => {
  it("POST /api/orders/create with empty cart returns 400", async () => {
    const res = await request(app)
      .post("/api/orders/create")
      .set("X-Session-Id", "order-test-empty")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMPTY_CART");
  });

  it("POST /api/orders/create with items creates order", async () => {
    // Add item to cart first
    await request(app)
      .post("/api/cart/add")
      .set("X-Session-Id", "order-test")
      .send({ productId: "1" });

    const res = await request(app)
      .post("/api/orders/create")
      .set("X-Session-Id", "order-test")
      .send({ shipping: { name: "Test User", email: "test@example.com" } });

    expect(res.status).toBe(200);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.id).toMatch(/^ORD-\d{4}$/);
    expect(res.body.order.status).toBe("confirmed");

    // Cart should be cleared after order
    const cart = await request(app)
      .get("/api/cart")
      .set("X-Session-Id", "order-test");
    expect(cart.body.count).toBe(0);
  });
});
