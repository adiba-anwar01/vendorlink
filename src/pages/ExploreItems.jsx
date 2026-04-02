import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { ArrowUpDown, MapPin, Loader2, Navigation, Search } from 'lucide-react';
import { getProducts } from '../api/productApi';
import UserItemCard from '../components/ui/UserItemCard';
import MapErrorBoundary from '../components/ui/MapErrorBoundary';
import useGeolocation from '../hooks/useGeolocation';
import { getDistanceKm } from '../components/utils/geoUtils';
import InputWithIcon from '../components/ui/InputWithIcon';
import { getUserListedProducts } from '../components/utils/exploreItemUtils';

const ItemMap = lazy(() => import('../components/ui/ItemMap'));

export default function ExploreItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [search, setSearch] = useState('');
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { loading: geoLoading, error: geoError, coords } = useGeolocation();

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      setLoading(true);
      setError('');

      try {
        const res = await getProducts();
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
            ? res.data.products
            : [];

        if (isMounted) {
          setItems(getUserListedProducts(products));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load explore items.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const filterCategories = useMemo(
    () => ['All', ...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  );

  const listingsWithDist = useMemo(() => {
    if (!coords) return items.map((item) => ({ ...item, distKm: null }));

    return items.map((item) => ({
      ...item,
      distKm:
        item.lat !== null && item.lng !== null
          ? getDistanceKm(coords.lat, coords.lng, item.lat, item.lng)
          : null,
    }));
  }, [coords, items]);

  const filtered = useMemo(() => {
    let list = listingsWithDist;

    if (activeCategory !== 'All') list = list.filter((item) => item.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.seller.toLowerCase().includes(q)
      );
    }

    if (distanceFilter && coords) {
      list = list.filter((item) => item.distKm !== null && item.distKm <= distanceFilter);
    }

    return [...list].sort((a, b) =>
      sortOrder === 'nearest' && coords
        ? (a.distKm ?? Infinity) - (b.distKm ?? Infinity)
        : sortOrder === 'newest'
          ? new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
          : new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)
    );
  }, [listingsWithDist, activeCategory, search, distanceFilter, sortOrder, coords]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, distanceFilter, sortOrder]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const mapItems = filtered.filter((item) => item.lat !== null && item.lng !== null).slice(0, 50);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading explore items...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="card p-8 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button onClick={() => setReloadKey((value) => value + 1)} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Items</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Browse all user-listed items - filter by category, distance, or search
        </p>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-gray-100"
        style={{ height: 300 }}
      >
        <div
          className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5
          bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm
          rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 pointer-events-none"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          {geoLoading
            ? 'Locating you...'
            : geoError
              ? 'Location unavailable - showing all markers'
              : `${mapItems.length} item${mapItems.length !== 1 ? 's' : ''} on map`}
        </div>

        <MapErrorBoundary>
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            }
          >
            <ItemMap items={mapItems} userCoords={coords} distanceKm={distanceFilter} />
          </Suspense>
        </MapErrorBoundary>
      </div>

      <div className="card p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">
                {coords ? (
                  <>
                    Nearby within: <span className="text-blue-600 font-bold">{distanceFilter} km</span>
                  </>
                ) : (
                  'Distance Filter'
                )}
              </span>
            </div>
            <button
              onClick={() =>
                setSortOrder((currentSort) => {
                  if (currentSort === 'newest') return 'oldest';
                  if (currentSort === 'oldest') return coords ? 'nearest' : 'newest';
                  return 'newest';
                })
              }
              className="flex items-center gap-2 text-sm font-medium text-gray-600
                hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300
                px-3 py-2 rounded-xl transition-all shrink-0 shadow-sm hover:shadow-md"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'nearest' ? 'Nearest' : sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(Number(e.target.value))}
              disabled={!coords}
              className="distance-slider"
              style={{
                background: coords
                  ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (distanceFilter / 50) * 100
                  }%, #e4e4e7 ${(distanceFilter / 50) * 100}%, #e4e4e7 100%)`
                  : '#e4e4e7',
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
              <span>0 km</span>
              <span>10 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
            {geoLoading && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Getting your location...
              </p>
            )}
            {!geoLoading && geoError && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-0.5">
                Enable location to use distance filter
              </p>
            )}
          </div>
        </div>
      </div>

      <InputWithIcon
        icon={Search}
        placeholder="Search by title, category, or seller..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`filter-btn shadow-sm hover:shadow-md transition-all ${activeCategory === cat ? 'active shadow-none' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Showing <span className="font-semibold text-gray-600">{filtered.length}</span>{' '}
        item{filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' && ` in ${activeCategory}`}
        {distanceFilter && coords && ` within ${distanceFilter} km`}
      </p>

      {filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-3 text-center">
          <p className="text-4xl">?</p>
          <p className="text-base font-semibold text-gray-900">No items found</p>
          <p className="text-sm text-gray-400">Try a different filter or increase the distance range.</p>
          <button
            onClick={() => {
              setSearch('');
              setActiveCategory('All');
              setDistanceFilter(10);
            }}
            className="btn-secondary mt-2 shadow-sm hover:shadow-md transition-shadow"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
            {paginatedItems.map((item) => (
              <div key={item.id} className="relative">
                <UserItemCard item={item} />
                {item.distKm !== null && (
                  <div className="absolute top-12 right-2.5 z-10">
                    <span
                      className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm
                      border border-gray-200 text-blue-600 px-2 py-0.5 rounded-full shadow-sm"
                    >
                      {item.distKm < 1
                        ? `${Math.round(item.distKm * 1000)} m`
                        : `${item.distKm.toFixed(1)} km`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-end mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 font-medium text-sm text-gray-900">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
    </div>
  );
}
