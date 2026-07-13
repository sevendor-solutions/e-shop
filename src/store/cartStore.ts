import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, Coupon } from '../types';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  shippingCost: number;
  taxRate: number; // e.g. 0.08 for 8%
  
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  
  // Computed values
  getTotals: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      shippingCost: 10, // Standard shipping is $10
      taxRate: 0.08, // 8% default sales tax

      addItem: (product, quantity = 1, size, color) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === size &&
              item.selectedColor === color
          );

          let updatedItems;
          if (existingItemIndex > -1) {
            updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
          } else {
            updatedItems = [...state.items, { product, quantity, selectedSize: size, selectedColor: color }];
          }

          return { items: updatedItems };
        });
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor === color
              )
          ),
        }));
      },

      updateQuantity: (productId, quantity, size, color) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        }));
      },

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      getTotals: () => {
        const { items, appliedCoupon, shippingCost, taxRate } = get();
        
        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        
        // Calculate discount
        let discount = 0;
        if (appliedCoupon && subtotal >= appliedCoupon.minPurchase) {
          if (appliedCoupon.type === 'percentage') {
            discount = (subtotal * appliedCoupon.value) / 100;
            if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
              discount = appliedCoupon.maxDiscount;
            }
          } else if (appliedCoupon.type === 'fixed') {
            discount = appliedCoupon.value;
          }
        }

        // Apply free shipping on orders over $150 or if cart is empty
        const finalSubtotal = Math.max(0, subtotal - discount);
        const shipping = subtotal > 150 || subtotal === 0 ? 0 : shippingCost;
        
        // Calculate tax
        const tax = finalSubtotal * taxRate;
        
        // Final Total
        const total = finalSubtotal + tax + shipping;

        return {
          subtotal,
          discount,
          tax,
          shipping,
          total,
        };
      },
    }),
    {
      name: 'eshop-cart-storage',
    }
  )
);
