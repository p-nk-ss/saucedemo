export interface Product {
  name: string;
  price: number;
}

/** The catalog as the shop shows it by default (name A to Z). */
export const PRODUCTS: readonly Product[] = [
  { name: 'Sauce Labs Backpack', price: 29.99 },
  { name: 'Sauce Labs Bike Light', price: 9.99 },
  { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  { name: 'Sauce Labs Onesie', price: 7.99 },
  { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
];

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export const BACKPACK = 'Sauce Labs Backpack';
export const BIKE_LIGHT = 'Sauce Labs Bike Light';
export const ONESIE = 'Sauce Labs Onesie';
export const FLEECE_JACKET = 'Sauce Labs Fleece Jacket';

export function priceOf(productName: string): number {
  const product = PRODUCTS.find((p) => p.name === productName);
  if (!product) throw new Error(`Unknown product: ${productName}`);
  return product.price;
}

export const toCents = (amount: number): number => Math.round(amount * 100);

export const formatPrice = (amount: number): string => '$' + amount.toFixed(2);
