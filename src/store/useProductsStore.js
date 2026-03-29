import { create } from 'zustand';
import * as productApi from '../api/productApi';

const useProductsStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  // Fetch products from the backend, optionally filtered by condition
  fetchProducts: async (condition) => {
    set({ loading: true, error: null });
    try {
      const params = condition && condition !== 'All' ? { condition } : undefined;
      const res = await productApi.getProducts(params);
      set({ products: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load products.', loading: false });
    }
  },

  // Add a newly created product into local state without a full refetch
  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products] })),

  // Optimistically update a product in local state
  updateProduct: (updated) =>
    set((state) => ({
      products: state.products.map((p) =>
        (p._id ?? p.id) === (updated._id ?? updated.id) ? { ...p, ...updated } : p
      ),
    })),

  // Remove a product from local state
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => (p._id ?? p.id) !== id),
    })),
}));

export default useProductsStore;
