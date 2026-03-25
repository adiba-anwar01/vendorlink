import { useState, useMemo, lazy, Suspense } from 'react';
import { Search, ArrowUpDown, MapPin, Loader2, Navigation } from 'lucide-react';
import { userListings } from '../data/mockData';
import UserItemCard from '../components/ui/UserItemCard';
import MapErrorBoundary from '../components/ui/MapErrorBoundary';
import useGeolocation from '../hooks/useGeolocation';
import { getDistanceKm } from '../components/utils/geoUtils';

// Lazy-load Leaflet so it doesn't block the initial render
const ItemMap = lazy(() => import('../components/ui/ItemMap'));

const FILTER_CATS = ['All', 'Mobile', 'Electronics', 'Furniture'];

export default function ExploreItems() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [search, setSearch] = useState('');
  const [distanceFilter, setDistanceFilter] = useState(10); // default 10 km

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Geolocation — non-blocking; page always works without it
  const { loading: geoLoading, error: geoError, coords } = useGeolocation();

  // Attach distance from user to every item (null when no coords)
  const listingsWithDist = useMemo(() => {
    if (!coords) return userListings.map((i) => ({ ...i, distKm: null }));
    return userListings.map((i) => ({
      ...i,
      distKm: getDistanceKm(coords.lat, coords.lng, i.lat, i.lng),
    }));
  }, [coords]);

  const filtered = useMemo(() => {
    let list = listingsWithDist;

    if (activeCategory !== 'All') list = list.filter((i) => i.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) => i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.seller.toLowerCase().includes(q)
      );
    }

    // Distance filter only applies when coords are available
    if (distanceFilter && coords) {
      list = list.filter((i) => i.distKm !== null && i.distKm <= distanceFilter);
    }

    return [...list].sort((a, b) =>
      sortOrder === 'nearest' && coords
        ? (a.distKm ?? Infinity) - (b.distKm ?? Infinity)
        : sortOrder === 'newest'
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [listingsWithDist, activeCategory, search, distanceFilter, sortOrder, coords]);

  // Reset pagination if filters change
  useMemo(() => setCurrentPage(1), [activeCategory, search, distanceFilter, sortOrder]);

  // Derived pagination data
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const mapItems = filtered.filter((i) => i.lat && i.lng).slice(0, 50);

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Items</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Browse all user-listed items — filter by category, distance, or search
        </p>
      </div>

      {/* ── Map Section ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-gray-100"
        style={{ height: 300 }}
      >
        {/* Overlay label */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5
          bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm
          rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          {geoLoading
            ? 'Locating you…'
            : geoError
              ? 'Location unavailable — showing all markers'
              : `📍 ${mapItems.length} item${mapItems.length !== 1 ? 's' : ''} on map`
          }
        </div>

        <MapErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-blue-50">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          }>
            <ItemMap
              items={mapItems}
              userCoords={coords}
              distanceKm={distanceFilter}
            />
          </Suspense>
        </MapErrorBoundary>
      </div>

      {/* ── Distance Slider ──────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">
                {coords
                  ? <>
                    Nearby within:{' '}
                    <span className="text-blue-600 font-bold">{distanceFilter} km</span>
                  </>
                  : 'Distance Filter'
                }
              </span>
            </div>
            {/* Sort toggle */}
            <button
              onClick={() => setSortOrder((s) => {
                if (s === 'newest') return 'oldest';
                if (s === 'oldest') return coords ? 'nearest' : 'newest';
                return 'newest';
              })}
              className="flex items-center gap-2 text-sm font-medium text-gray-600
                hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300
                px-3 py-2 rounded-xl transition-all shrink-0 shadow-sm hover:shadow-md"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'nearest' ? '📍 Nearest' : sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>

          {/* Slider — always visible, disabled when no location */}
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
                  ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(distanceFilter / 50) * 100
                  }%, #e4e4e7 ${(distanceFilter / 50) * 100
                  }%, #e4e4e7 100%)`
                  : '#e4e4e7',
              }}
            />
            {/* Tick labels */}
            <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
              <span>0 km</span>
              <span>10 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
            {/* Status message below slider */}
            {geoLoading && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Getting your location…
              </p>
            )}
            {!geoLoading && geoError && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-0.5">
                ⚠️ Enable location to use distance filter
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Search bar ────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title, category, or seller…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* ── Category filters (below search) ────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {FILTER_CATS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`filter-btn shadow-sm hover:shadow-md transition-all ${activeCategory === cat ? 'active shadow-none' : ''}`}
          >
            {cat === 'Mobile' && '📱 '}{cat === 'Electronics' && '💻 '}
            {cat === 'Furniture' && '🪑 '}{cat === 'All' && '✨ '}
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400">
        Showing <span className="font-semibold text-gray-600">{filtered.length}</span>{' '}
        item{filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' && ` in ${activeCategory}`}
        {distanceFilter && coords && ` within ${distanceFilter} km`}
      </p>

      {/* ── Items Grid ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-3 text-center">
          <p className="text-4xl">🔍</p>
          <p className="text-base font-semibold text-gray-900">No items found</p>
          <p className="text-sm text-gray-400">Try a different filter or increase the distance range.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All'); setDistanceFilter(null); }}
            className="btn-secondary mt-2 shadow-sm hover:shadow-md transition-shadow"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedItems.map((item) => (
              <div key={item.id} className="relative">
                <UserItemCard item={item} />
                {item.distKm !== null && (
                  <div className="absolute top-12 right-2.5 z-10">
                    <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm
                      border border-gray-200 text-blue-600 px-2 py-0.5 rounded-full shadow-sm">
                      📍 {item.distKm < 1
                        ? `${Math.round(item.distKm * 1000)} m`
                        : `${item.distKm.toFixed(1)} km`}
                    </span>
                  </div>
                )}
              </div>
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
    </div>
  );
}
