import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          let updatedItems;
          if (exists) {
            updatedItems = state.items.filter((item) => item.id !== product.id);
          } else {
            updatedItems = [...state.items, product];
          }
          return { items: updatedItems };
        });
      },
      
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      
      clearWishlist: () => {
        set({ items: [] });
      }
    }),
    {
      name: 'eshop-wishlist-storage',
    }
  )
);
