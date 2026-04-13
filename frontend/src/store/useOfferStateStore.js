import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOfferStateStore = create(
  persist(
    (set) => ({
      soldProducts: {},

      markProductSold: ({ productId, conversationId, offerId, soldAt }) =>
        set((state) => ({
          soldProducts: {
            ...state.soldProducts,
            [productId]: {
              productId,
              conversationId,
              offerId,
              soldAt: soldAt ?? new Date().toISOString(),
              message: 'This product has been sold.',
            },
          },
        })),
    }),
    {
      name: 'vendorlink-offer-state',
      partialize: (state) => ({
        soldProducts: state.soldProducts,
      }),
    }
  )
);

export default useOfferStateStore;
