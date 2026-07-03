import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  Navigation,
  Search,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { getNearbyProducts, getProducts } from "@/features/products/api/productApi";
import { UserItemCard, InputWithIcon } from "@/components/ui";
import {
  getUserListedProducts,
  normalizeExploreItem,
} from "../utils/exploreItemUtils";
import useAuthStore from "@/features/auth/hooks/useAuthStore";
import { PRODUCT_ORDERED_EVENT } from "@/utils/orderEvents";
import { ALL_CATEGORIES } from "@/constants/product";

const ITEMS_PER_PAGE = 12;
const METERS_PER_KM = 1000;

function getProductList(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.products)) return responseData.products;
  return [];
}

export default function ExploreItems() {
  const vendor = useAuthStore((state) => state.vendor);
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filterBtnClass = (isActive) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isActive
      ? "bg-gradient-primary text-white border border-brand-500 shadow-[0_2px_8px_rgba(168,85,247,0.28)] scale-105"
      : "bg-gray-100 text-gray-600 border border-transparent hover:bg-brand-50 hover:text-gradient-primary hover:border-brand-200"
    }`;

  const urlCategory = searchParams.get("category") || "All";
  const activeCategory = urlCategory;

  const setActiveCategory = (cat) => {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
    setCurrentPage(1);
  };

  const [sortOrder, setSortOrder] = useState("newest");
  const [search, setSearch] = useState("");
  const [distanceFilter, setDistanceFilter] = useState(null);
  const [tempDistanceValue, setTempDistanceValue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const refCoords = useMemo(() => {
    if (vendor?.location?.coordinates) {
      const [lng, lat] = vendor.location.coordinates;
      const parsed = { lng: Number(lng), lat: Number(lat) };
      if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng))
        return parsed;
    }
    if (vendor?.latitude != null && vendor?.longitude != null) {
      const parsed = {
        lat: Number(vendor.latitude),
        lng: Number(vendor.longitude),
      };
      if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng))
        return parsed;
    }
    if (vendor?.lat != null && vendor?.lng != null) {
      const parsed = { lat: Number(vendor.lat), lng: Number(vendor.lng) };
      if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng))
        return parsed;
    }
    return null;
  }, [vendor]);

  const fetchNearby = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        let normalized = [];
        const shouldUseDistanceFilter =
          Boolean(refCoords) && distanceFilter !== null && distanceFilter > 0;

        if (shouldUseDistanceFilter) {
          const nearbyParams = {
            lat: refCoords.lat,
            lng: refCoords.lng,
            radius: distanceFilter * METERS_PER_KM,
          };
          const res = await getNearbyProducts(nearbyParams);
          const raw = getProductList(res.data);
          normalized = raw
            .filter((p) => p?.status !== "sold")
            .map(normalizeExploreItem)
            .filter((p) => Boolean(p.id));
        } else {
          const res = await getProducts({});
          const raw = getProductList(res.data);
          normalized = getUserListedProducts(raw);
        }

        if (!signal.aborted) {
          setItems(normalized);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.response?.data?.message || "Failed to load items.");
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [refCoords, distanceFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchNearby(controller.signal);
    return () => controller.abort();
  }, [refCoords, distanceFilter]);

  useEffect(() => {
    function handleProductOrdered(event) {
      const orderedProductId = String(event.detail?.productId ?? "");
      if (!orderedProductId) return;
      setItems((current) =>
        current.filter(
          (item) => String(item.id ?? item._id) !== orderedProductId,
        ),
      );
    }
    window.addEventListener(PRODUCT_ORDERED_EVENT, handleProductOrdered);
    return () =>
      window.removeEventListener(PRODUCT_ORDERED_EVENT, handleProductOrdered);
  }, []);

  const filtered = useMemo(() => {
    let list =
      activeCategory === "All"
        ? items
        : items.filter(
          (item) =>
            (item.category ?? "").toLowerCase() ===
            activeCategory.toLowerCase(),
        );

    if (search.trim()) {
      const lower = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          (item.title ?? "").toLowerCase().includes(lower) ||
          (item.description ?? "").toLowerCase().includes(lower),
      );
    }

    return [...list].sort((a, b) =>
      sortOrder === "nearest"
        ? (a.distKm ?? Infinity) - (b.distKm ?? Infinity)
        : sortOrder === "newest"
          ? new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
          : new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0),
    );
  }, [items, activeCategory, sortOrder, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const showingCount = filtered.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Items</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Browse user-listed items nearby — filter by distance or search
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-200/50 p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-gray-700">
                {distanceFilter !== null && distanceFilter > 0 ? (
                  <>
                    Filter:{" "}
                    <span className="text-brand-600 font-bold">
                      Within {distanceFilter} km
                    </span>
                  </>
                ) : (
                  "Distance Filter"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (refCoords && tempDistanceValue > 0) {
                    setDistanceFilter(tempDistanceValue);
                    setCurrentPage(1);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[0.625rem] bg-gradient-primary text-white text-xs font-medium whitespace-nowrap hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!refCoords || tempDistanceValue === 0}
              >
                Apply
              </button>

              <button
                onClick={() => {
                  setDistanceFilter(null);
                  setTempDistanceValue(0);
                  setSearch("");
                  setActiveCategory("All");
                  setCurrentPage(1);
                }}
                title="Reset Filters"
                className="text-gray-400 hover:text-brand-600 transition-colors shrink-0 p-1"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-gray-600">
                Distance Range:
              </label>
              <span className="text-xs font-semibold text-brand-600">
                {!refCoords
                  ? "Set location to use"
                  : distanceFilter !== null && distanceFilter > 0
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
              onChange={(e) =>
                !refCoords ? null : setTempDistanceValue(Number(e.target.value))
              }
              className={`distance-slider ${!refCoords ? "opacity-40 cursor-not-allowed" : ""}`}
              disabled={!refCoords}
              style={{
                background:
                  refCoords && tempDistanceValue > 0
                    ? `linear-gradient(to right, #A855F7 0%, #6366F1 ${(tempDistanceValue / 50) * 100
                    }%, #e4e4e7 ${(tempDistanceValue / 50) * 100}%, #e4e4e7 100%)`
                    : "#e4e4e7",
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-0.5 mb-2">
              <span>0 km</span>
              <span>10 km</span>
              <span>20 km</span>
              <span>30 km</span>
              <span>40 km</span>
              <span>50 km</span>
            </div>
            {!refCoords && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Location not set — distance filter unavailable. Add your
                location in Profile.
              </p>
            )}
          </div>
        </div>
      </div>

      <InputWithIcon
        icon={Search}
        placeholder="Search by item name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={filterBtnClass(activeCategory.toLowerCase() === cat.toLowerCase())}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setSortOrder((cur) => {
              if (cur === "newest") return "oldest";
              if (cur === "oldest") return "nearest";
              return "newest";
            });
            setCurrentPage(1);
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-600
            hover:text-brand-600 bg-white border border-gray-200 hover:border-brand-300
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

      <p className="text-xs text-gray-500">
        {loading ? (
          <span className="animate-pulse">Refreshing...</span>
        ) : showingCount > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-gray-700">{showingCount}</span>{" "}
            item{showingCount !== 1 ? "s" : ""}
            {activeCategory !== "All" && ` in ${activeCategory}`}
            {distanceFilter !== null && distanceFilter > 0
              ? ` within ${distanceFilter} km`
              : ""}
          </>
        ) : (
          "No items found"
        )}
      </p>

      {loading && items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-16 flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-gray-400 animate-pulse">
            Loading nearby items...
          </p>
        </div>
      ) : error && items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-8 text-center">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button
            onClick={() => fetchNearby(new AbortController().signal)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[0.625rem] bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-colors mt-4"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-16 flex flex-col items-center gap-3 text-center">
          <p className="text-4xl">🔍</p>
          <p className="text-base font-semibold text-gray-900">
            No items found
          </p>
          <p className="text-sm text-gray-500">
            {distanceFilter !== null && distanceFilter > 0
              ? "No items found within selected distance. Try adjusting the filter."
              : "Try a different search term or category."}
          </p>
          <button
            onClick={() => {
              setDistanceFilter(null);
              setTempDistanceValue(0);
              setSearch("");
              setActiveCategory("All");
              setCurrentPage(1);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[0.625rem] bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-slate-50 hover:border-brand-300 transition-colors mt-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
            {paginatedItems.map((item) => (
              <UserItemCard key={item.id} item={item} />
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
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    ),
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
