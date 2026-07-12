import { useState } from 'react';
import { toast } from 'react-toastify';
import { getProduct } from '@/features/products/api/productApi';
import { placeOrder } from '../api/orderApi';
import { dispatchProductOrdered } from '@/utils/orderEvents';

export function useOrderFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState(null);

  const openOrderFlow = async (productId, priceForUI = null) => {
    setIsOpen(true);
    setLoading(true);
    setProduct(null);
    setNegotiatedPrice(priceForUI);

    try {
      const prodRes = await getProduct(productId);
      setProduct(prodRes.data);
    } catch {
      toast.error('Failed to load order details');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const closeOrderFlow = () => {
    setIsOpen(false);
  };

  const handleConfirmOrder = async (formData) => {
    try {
      const finalNotes = formData.notes
        ? `Buyer Name: ${formData.buyerName}\n${formData.notes}`
        : `Buyer Name: ${formData.buyerName}`;

      await placeOrder(product._id || product.id, {
        phoneNumber: formData.phoneNumber,
        deliveryAddress: formData.deliveryAddress,
        notes: finalNotes,
      });

      dispatchProductOrdered(product._id || product.id);
      toast.success('Order placed! Check My Orders.');
      closeOrderFlow();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
      throw err;
    }
  };

  const itemForModal = product ? {
    ...product,
    price: negotiatedPrice !== null ? negotiatedPrice : product.price,
    images: product.images?.length ? product.images : product.image ? [product.image] : [],
    title: product.title,
    id: product._id || product.id
  } : null;

  return {
    isOpen,
    loading,
    item: itemForModal,
    openOrderFlow,
    closeOrderFlow,
    handleConfirmOrder
  };
}
