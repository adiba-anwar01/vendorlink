import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, MapPin, Phone, FileText, Package, User } from 'lucide-react';
import { formatPrice } from '../utils/priceUtils';

/**
 * OrderModal - collects buyer details before calling the backend.
 * This modal-first flow fixes the "Cannot destructure deliveryAddress"
 * error by ensuring POST /api/orders/:id always includes a request body.
 *
 * Props:
 *   item      - product object { title, price, image }
 *   onConfirm - async fn({ buyerName, deliveryAddress, phoneNumber, notes }) - parent calls API
 *   onClose   - fn() - closes the modal without placing order
 */
export default function OrderModal({ item, onConfirm, onClose }) {
  const [buyerName, setBuyerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setBuyerName('');
    setPhoneNumber('');
    setDeliveryAddress('');
    setNotes('');
    setErrors({});
  }, [item?._id, item?.id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !placing) onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, placing]);

  const image = item?.images?.[0] ?? item?.image ?? null;

  function validate() {
    const nextErrors = {};

    if (!buyerName.trim()) nextErrors.buyerName = 'Buyer name is required.';
    if (!phoneNumber.trim()) nextErrors.phoneNumber = 'Phone number is required.';
    if (!deliveryAddress.trim()) nextErrors.deliveryAddress = 'Delivery address is required.';

    return nextErrors;
  }

  async function handleConfirm() {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setPlacing(true);
    setErrors({});

    try {
      // This payload becomes req.body so the order endpoint no longer receives an empty POST.
      await onConfirm({
        buyerName: buyerName.trim(),
        phoneNumber: phoneNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
      });
    } finally {
      setPlacing(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200">
              {image ? (
                <img src={image} alt={item?.title} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-6 w-6 text-gray-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{item?.title}</p>
              <p className="mt-0.5 text-lg font-bold text-gray-900">{formatPrice(item?.price ?? 0)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <User className="h-3.5 w-3.5 text-blue-500" />
              Buyer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(event) => {
                setBuyerName(event.target.value);
                setErrors((prev) => ({ ...prev, buyerName: '' }));
              }}
              placeholder="Enter your full name"
              className={`input-field w-full ${errors.buyerName ? 'border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.buyerName && <p className="mt-0.5 text-xs text-red-500">{errors.buyerName}</p>}
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <Phone className="h-3.5 w-3.5 text-blue-500" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                setErrors((prev) => ({ ...prev, phoneNumber: '' }));
              }}
              placeholder="Enter your phone number"
              className={`input-field w-full ${errors.phoneNumber ? 'border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.phoneNumber && <p className="mt-0.5 text-xs text-red-500">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={deliveryAddress}
              onChange={(event) => {
                setDeliveryAddress(event.target.value);
                setErrors((prev) => ({ ...prev, deliveryAddress: '' }));
              }}
              placeholder="Enter your full delivery address or location"
              className={`input-field w-full resize-none ${errors.deliveryAddress ? 'border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.deliveryAddress && <p className="mt-0.5 text-xs text-red-500">{errors.deliveryAddress}</p>}
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              Notes <span className="font-normal normal-case text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Any special delivery instructions"
              className="input-field w-full resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1" disabled={placing}>
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={placing}
              className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span>{placing ? 'Placing...' : 'Confirm Order'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
