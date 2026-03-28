import { create } from 'zustand';
import { products as initialProducts } from '../data/mockData';

// Shared store so edits on EditProduct page
// are visible on Products, ProductDetails, etc.
const useProductsStore = create((set) => ({
  products: [...initialProducts],

  updateProduct: (updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
}));

export default useProductsStore;
