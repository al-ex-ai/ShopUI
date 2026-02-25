import { getProductById, formatPrice } from "./products.js";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  count: number;
  total: string;
}

// In-memory carts per session
const carts = new Map<string, Map<string, number>>();

function getOrCreateCart(sessionId: string): Map<string, number> {
  let cart = carts.get(sessionId);
  if (!cart) {
    cart = new Map();
    carts.set(sessionId, cart);
  }
  return cart;
}

export function addToCart(sessionId: string, productId: string): Cart {
  const cart = getOrCreateCart(sessionId);
  const qty = cart.get(productId) ?? 0;
  cart.set(productId, qty + 1);
  return getCart(sessionId);
}

export function removeFromCart(sessionId: string, productId: string): Cart {
  const cart = getOrCreateCart(sessionId);
  cart.delete(productId);
  return getCart(sessionId);
}

export function clearCart(sessionId: string): void {
  carts.delete(sessionId);
}

export function getCart(sessionId: string): Cart {
  const cart = getOrCreateCart(sessionId);
  const items: CartItem[] = [];
  let totalCents = 0;

  for (const [productId, quantity] of cart.entries()) {
    const product = getProductById(productId);
    if (product) {
      items.push({
        id: product.id,
        name: product.name,
        price: formatPrice(product.price),
        image: product.image,
        quantity,
      });
      totalCents += product.price * quantity * 100;
    }
  }

  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: formatPrice(totalCents / 100),
  };
}
