import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  Loader2,
  Navigation,
  Search,
  RotateCcw,
} from "lucide-react";
import { getProducts } from "../api/productApi";
import UserItemCard from "../components/ui/UserItemCard";
import { getDistanceKm } from "../components/utils/geoUtils";
import InputWithIcon from "../components/ui/InputWithIcon";
import { getUserListedProducts } from "../components/utils/exploreItemUtils";
import useAuthStore from "../store/useAuthStore";

export default function ExploreItems() {
  const vendor = useAuthStore((state) => state.vendor);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const urlCategory = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortOrder, setSortOrder] = useState("newest");
  const [search, setSearch] = useState("");
  const [distanceFilter, setDistanceFilter] = useState(null);
  const [tempDistanceValue, setTempDistanceValue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Use vendor's stored location as reference point
  const referenceLocation = vendor?.location?.coordinates
    ? {
        lng: vendor.location.coordinates[0],
        lat: vendor.location.coordinates[1],
      }
    : null;

  // Fallback to latitude/longitude or lat/lng fields if GeoJSON not available
  const refCoords =
    referenceLocation ||
    (vendor?.latitude != null && vendor?.longitude != null
      ? { lat: vendor.latitude, lng: vendor.longitude }
      : vendor?.lat && vendor?.lng
        ? { lat: vendor.lat, lng: vendor.lng }
        : null);

  // Initial load: fetch all items to get all categories
  useEffect(() => {
    let isMounted = true;

    async function loadAllItems() {
      setLoading(true);
      setError("");

      try {
        const res = await getProducts();
        const products = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
            ? res.data.products
            : [];

        if (isMounted) {
          const userProducts = getUserListedProducts(products);
          setAllItems(userProducts);
          setItems(userProducts);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Failed to load explore items.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllItems();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  // Filter items locally based on category (not from API)
  useEffect(() => {
    if (activeCategory === "All") {
      setItems(allItems);
    } else {
      setItems(allItems.filter((item) => item.category === activeCategory));
    }
    setCurrentPage(1);
  }, [activeCategory, allItems]);

  // Sync activeCategory with URL search params
  useEffect(() => {
    if (activeCategory !== "All") {
      setSearchParams({ category: activeCategory });
    } else {
      setSearchParams({});
    }
  }, [activeCategory, setSearchParams]);

  // Handle URL category parameter changes
  useEffect(() => {
    const newCategory = searchParams.get("category") || "All";
    if (newCategory !== activeCategory) {
      setActiveCategory(newCategory);
    }
  }, [searchParams]);

  const filterCategories = useMemo(
    () => [
      "All",
      ...new Set(allItems.map((item) => item.category).filter(Boolean)),
    ],
    [allItems],
  );

  const listingsWithDist = useMemo(() => {
    if (!refCoords) return items.map((item) => ({ ...item, distKm: null }));

    return items.map((item) => {
      // Extract coordinates from GeoJSON format
      const itemCoords = item.location?.coordinates
        ? {
            lng: item.location.coordinates[0],
            lat: item.location.coordinates[1],
          }
        : { lat: item.lat, lng: item.lng };

      const distKm =
        itemCoords.lat !== null && itemCoords.lng !== null
          ? getDistanceKm(
              refCoords.lat,
              refCoords.lng,
              itemCoords.lat,
              itemCoords.lng,
            )
          : null;

      return { ...item, distKm };
    });
  }, [refCoords, items]);

  const filtered = useMemo(() => {
    let list = listingsWithDist;

    if (activeCategory !== "All")
      list = list.filter((item) => item.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.seller.toLowerCase().includes(q),
      );
    }

    if (distanceFilter !== null && distanceFilter > 0 && refCoords) {
      list = list.filter(
        (item) => item.distKm !== null && item.distKm <= distanceFilter,
      );
    }

    return [...list].sort((a, b) =>
      sortOrder === "nearest" && refCoords
        ? (a.distKm ?? Infinity) - (b.distKm ?? Infinity)
        : sortOrder === "newest"
          ? new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
          : new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0),
    );
  }, [
    listingsWithDist,
    activeCategory,
    search,
    distanceFilter,
    sortOrder,
    refCoords,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, distanceFilter, sortOrder]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">
          Loading explore items...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={() => setReloadKey((value) => value + 1)}
          className="btn-primary mt-4"
        >
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

      <div className="card p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">
                {distanceFilter !== null && distanceFilter > 0 ? (
                  <>
                    Filter:{" "}
                    <span className="text-blue-600 font-bold">
                      {distanceFilter} km
                    </span>
                  </>
                ) : (
                  "Distance Filter (Optional)"
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDistanceFilter(null);
                  setTempDistanceValue(0);
                  setSearch("");
                  setActiveCategory("All");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-600
                  hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300
                  px-3 py-2 rounded-lg transition-all shrink-0 shadow-sm hover:shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={() =>
                  setSortOrder((currentSort) => {
                    if (currentSort === "newest") return "oldest";
                    if (currentSort === "oldest")
                      return refCoords ? "nearest" : "newest";
                    return "newest";
                  })
                }
                className="flex items-center gap-2 text-sm font-medium text-gray-600
                  hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300
                  px-3 py-2 rounded-lg transition-all shrink-0 shadow-sm hover:shadow-md"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === "nearest"
                  ? "Nearest"
                  : sortOrder === "newest"
                    ? "Newest"
                    : "Oldest"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-gray-600">
                Distance Range:
              </label>
              <span className="text-xs font-semibold text-blue-600">
                {distanceFilter !== null && distanceFilter > 0
                  ? `${distanceFilter} km (Active)`
                  : "No filter applied"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={tempDistanceValue}
              onChange={(e) => setTempDistanceValue(Number(e.target.value))}
              className="distance-slider"
              style={{
                background:
                  tempDistanceValue > 0
                    ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        (tempDistanceValue / 50) * 100
                      }%, #e4e4e7 ${(tempDistanceValue / 50) * 100}%, #e4e4e7 100%)`
                    : "#e4e4e7",
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-0.5 mb-2">
              <span>0 km</span>
              <span>10 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (tempDistanceValue > 0) {
                    setDistanceFilter(tempDistanceValue);
                    setCurrentPage(1);
                  }
                }}
                className="flex-1 btn-primary rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50"
                disabled={tempDistanceValue === 0}
              >
                Apply Filter ({tempDistanceValue} km)
              </button>
              {distanceFilter !== null && distanceFilter > 0 && (
                <button
                  onClick={() => {
                    setDistanceFilter(null);
                    setTempDistanceValue(0);
                    setCurrentPage(1);
                  }}
                  className="btn-secondary rounded-lg px-3 py-2 text-xs font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            {!refCoords && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-2">
                Note: Distance calculation based on your registration location
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
            className={`filter-btn shadow-sm hover:shadow-md transition-all ${activeCategory === cat ? "active shadow-none" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-700">{filtered.length}</span>{" "}
        item{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" && ` in ${activeCategory}`}
        {distanceFilter !== null &&
          distanceFilter > 0 &&
          refCoords &&
          ` within ${distanceFilter} km`}
      </p>

      {filtered.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-3 text-center">
          <p className="text-4xl">?</p>
          <p className="text-base font-semibold text-gray-900">
            No items found
          </p>
          <p className="text-sm text-gray-500">
            {distanceFilter !== null && distanceFilter > 0
              ? "No items found within selected distance. Try adjusting the filter."
              : "Try a different filter or search term."}
          </p>
          <button
            onClick={() => {
              setDistanceFilter(null);
              setSearch("");
              setActiveCategory("All");
              setCurrentPage(1);
            }}
            className="btn-secondary mt-3 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {paginatedItems.map((item) => (
              <UserItemCard key={item.id} item={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-end mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 font-medium text-sm text-gray-900">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
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
