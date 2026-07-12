import { create } from 'zustand';
import * as productApi from '../api/productApi';

const useProductsStore = create((set) => ({
  products: [],
  loading: false,
  error: null,
  fetched: false,

  fetchProducts: async (condition) => {
    set({ loading: true, error: null });
    try {
      const params = condition && condition !== 'All' ? { condition } : undefined;
      const res = await productApi.getProducts(params);
      const products = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.products)
          ? res.data.products
          : [];
      set({ products, loading: false, fetched: true });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load products.', loading: false });
    }
  },

  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products], fetched: true })),

  updateProduct: (updated) =>
    set((state) => ({
      products: state.products.map((p) =>
        (p._id ?? p.id) === (updated._id ?? updated.id) ? { ...p, ...updated } : p
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => (p._id ?? p.id) !== id),
    })),
}));

export default useProductsStore;
