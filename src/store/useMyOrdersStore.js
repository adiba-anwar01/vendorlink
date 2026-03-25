import { create } from 'zustand';

const useMyOrdersStore = create((set) => ({
  myOrders: [],

  placeOrder: (item) => {
    const order = {
      id:          `mo_${Date.now()}`,
      itemId:      item.id,
      title:       item.title,
      image:       item.image,
      price:       item.price,
      category:    item.category,
      condition:   item.condition,
      seller:      item.seller,
      placedAt:    new Date().toISOString(),
      status:      'Pending',
    };
    set((state) => ({ myOrders: [order, ...state.myOrders] }));
    return order;
  },
}));

export default useMyOrdersStore;
