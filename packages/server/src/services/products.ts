export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: string;
  isNew: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 79.99,
    image: "icon:Headphones",
    category: "Electronics",
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life.",
    rating: "4.8 / 5",
    isNew: false,
  },
  {
    id: "2",
    name: "Leather Backpack",
    price: 129.99,
    image: "icon:Backpack",
    category: "Accessories",
    description: "Handcrafted genuine leather backpack with laptop compartment.",
    rating: "4.5 / 5",
    isNew: true,
  },
  {
    id: "3",
    name: "Smart Watch",
    price: 249.99,
    image: "icon:Watch",
    category: "Electronics",
    description: "Feature-packed smartwatch with health tracking and GPS.",
    rating: "4.7 / 5",
    isNew: true,
  },
  {
    id: "4",
    name: "Running Shoes",
    price: 119.99,
    image: "icon:DirectionsRun",
    category: "Sports",
    description: "Lightweight running shoes with responsive cushioning.",
    rating: "4.3 / 5",
    isNew: false,
  },
  {
    id: "5",
    name: "Coffee Maker",
    price: 89.99,
    image: "icon:CoffeeMaker",
    category: "Home",
    description: "Programmable drip coffee maker with thermal carafe.",
    rating: "4.6 / 5",
    isNew: false,
  },
  {
    id: "6",
    name: "Desk Lamp",
    price: 49.99,
    image: "icon:LightMode",
    category: "Home",
    description: "LED desk lamp with adjustable brightness and color temperature.",
    rating: "4.2 / 5",
    isNew: true,
  },
];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(productId: string, limit = 3): Product[] {
  const product = getProductById(productId);
  if (!product) return [];

  return PRODUCTS
    .filter((p) => p.id !== productId && p.category === product.category)
    .concat(PRODUCTS.filter((p) => p.id !== productId && p.category !== product.category))
    .slice(0, limit);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
