export interface Order {
  id: string;
  sessionId: string;
  items: Array<{ name: string; price: string; quantity: number }>;
  total: string;
  status: "pending" | "confirmed" | "shipped";
  createdAt: string;
}

const orders: Order[] = [];
let nextId = 1;

export function createOrder(
  sessionId: string,
  items: Array<{ name: string; price: string; quantity: number }>,
  total: string
): Order {
  const order: Order = {
    id: `ORD-${String(nextId++).padStart(4, "0")}`,
    sessionId,
    items,
    total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function getOrdersBySession(sessionId: string): Order[] {
  return orders.filter((o) => o.sessionId === sessionId);
}
