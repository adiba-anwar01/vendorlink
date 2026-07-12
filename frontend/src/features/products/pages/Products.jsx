import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { PRODUCT_CATEGORIES } from '@/constants/product';
import useProductsStore from '../hooks/useProductsStore';
import useAuthStore from '@/features/auth/hooks/useAuthStore';
import { deleteProduct as apiDeleteProduct } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { Modal, CustomSelect } from '@/components/ui';
import LoginPrompt from '@/features/auth/components/LoginPrompt';
import { cardClass, inputField, btnPrimary, btnSecondary, btnDanger } from '@/utils/theme';
import { getVendorId } from '@/utils/userUtils';

export default function Products() {
  const { products, loading, error, fetchProducts, deleteProduct, fetched } = useProductsStore();
  const vendor = useAuthStore((s) => s.vendor);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [priceMax, setPriceMax] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const currentVendorId = getVendorId(vendor);

  useEffect(() => {
    if (!fetched) {
      fetchProducts();
    }
  }, [fetchProducts, fetched]);

  const vendorProducts = useMemo(() => (
    products.filter((p) => {
      if (p.sellerRole !== 'vendor') return false;
      const sellerId = String(
        p.seller?._id ?? p.seller?.id ?? p.seller ?? ''
      );
      return sellerId === currentVendorId;
    })
  ), [products, currentVendorId]);

  const filtered = useMemo(() => {
    return vendorProducts.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'All' || p.category === filterCategory;
      const matchCondition = filterCondition === 'All' || p.condition?.toLowerCase() === filterCondition.toLowerCase();
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      const matchPrice = !priceMax || p.price <= Number(priceMax);
      return matchSearch && matchCategory && matchCondition && matchStatus && matchPrice;
    });
  }, [vendorProducts, search, filterCategory, filterCondition, filterStatus, priceMax]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = async () => {
    const id = deleteTarget._id ?? deleteTarget.id;
    setDeleting(true);
    try {
      await apiDeleteProduct(id);
      deleteProduct(id);
      toast.success('Product deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Login to View Products"
        message="You need to be logged in to view and manage your products."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button onClick={fetchProducts} className={`${btnPrimary} mt-4`}>Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{vendorProducts.length} listings total</p>
        </div>
        <Link to="/products/add" className={`${btnPrimary} shadow-md`}>
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className={`${cardClass} p-3 sm:p-4`}>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className={`${inputField} w-full`}
            />
          </div>
          
          <div className="w-full md:w-1/2 flex flex-wrap items-center justify-start gap-2">
            <CustomSelect
              value={filterCategory}
              onChange={(val) => { setFilterCategory(val); setCurrentPage(1); }}
              options={[
                { value: "All", label: "Category" },
                ...PRODUCT_CATEGORIES.map(c => ({ value: c, label: c }))
              ]}
              className="w-[120px] shrink-0"
            />
            <CustomSelect
              value={filterCondition}
              onChange={(val) => { setFilterCondition(val); setCurrentPage(1); }}
              options={[
                { value: "All", label: "Condition" },
                { value: "new", label: "New" },
                { value: "used", label: "Used" }
              ]}
              className="w-[120px] shrink-0"
            />
            <CustomSelect
              value={filterStatus}
              onChange={(val) => { setFilterStatus(val); setCurrentPage(1); }}
              options={[
                { value: "All", label: "Status" },
                { value: "open", label: "Open" },
                { value: "sold", label: "Sold" }
              ]}
              className="w-[100px] shrink-0"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
              className={`${inputField} flex-1 min-w-[80px] px-2`}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={`${cardClass} p-16 flex flex-col items-center gap-4 text-center`}>
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
          </div>
          <Link to="/products/add" className={btnPrimary}>
            <Plus className="w-4 h-4" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product._id ?? product.id}
                product={product}
                onDelete={() => setDeleteTarget(product)}
              />
            ))}
          </div>

          {filtered.length > 0 && (
            <div className="flex justify-between items-center mt-8">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gradient-primary hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                          ? "bg-brand-600 text-white"
                          : "text-gray-600 hover:bg-brand-50"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gradient-primary hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">&quot;{deleteTarget?.title}&quot;</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setDeleteTarget(null)} className={`${btnSecondary} flex-1`} disabled={deleting}>Cancel</button>
          <button onClick={handleDelete} className={`${btnDanger} flex-1`} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
