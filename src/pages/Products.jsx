import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { categories, conditions } from '../data/mockData';
import useProductsStore from '../store/useProductsStore';
import ProductCard from '../components/ui/ProductCard';
import Modal from '../components/ui/Modal';

export default function Products() {
  const { products, deleteProduct } = useProductsStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [priceMax, setPriceMax] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'All' || p.category === filterCategory;
      const matchCondition = filterCondition === 'All' || p.condition === filterCondition;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      const matchPrice = !priceMax || p.price <= Number(priceMax);
      return matchSearch && matchCategory && matchCondition && matchStatus && matchPrice;
    });
  }, [products, search, filterCategory, filterCondition, filterStatus, priceMax]);

  // Reset to page 1 when filters change
  useEffect(() => setCurrentPage(1), [search, filterCategory, filterCondition, filterStatus, priceMax]);

  // Derived pagination data
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = () => {
    deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} listings total</p>
        </div>
        <Link to="/products/add" className="btn-primary shadow-md">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field w-auto text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="input-field w-auto text-sm"
            >
              <option value="All">Any Condition</option>
              {conditions.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-auto text-sm"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
            </select>
            <input
              type="number"
              placeholder="Max ₹"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="input-field w-24 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
          </div>
          <Link to="/products/add" className="btn-primary">
            <Plus className="w-4 h-4" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={() => setDeleteTarget(product)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-end mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 font-medium text-sm text-gray-900">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">"{deleteTarget?.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-5">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
