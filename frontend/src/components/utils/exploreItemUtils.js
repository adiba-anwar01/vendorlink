function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractCoordinates(product) {
  const lat =
    toNumber(product.lat) ??
    toNumber(product.latitude) ??
    toNumber(product.location?.lat) ??
    toNumber(product.location?.latitude);

  const lng =
    toNumber(product.lng) ??
    toNumber(product.longitude) ??
    toNumber(product.location?.lng) ??
    toNumber(product.location?.longitude);

  if (lat !== null && lng !== null) {
    return { lat, lng };
  }

  const coordinatePair =
    product.coordinates ??
    product.location?.coordinates ??
    product.seller?.coordinates ??
    product.seller?.location?.coordinates;

  if (Array.isArray(coordinatePair) && coordinatePair.length >= 2) {
    const [longitude, latitude] = coordinatePair;
    const parsedLat = toNumber(latitude);
    const parsedLng = toNumber(longitude);

    if (parsedLat !== null && parsedLng !== null) {
      return { lat: parsedLat, lng: parsedLng };
    }
  }

  return { lat: null, lng: null };
}

function getSellerName(product) {
  if (typeof product.seller === 'string' && product.seller.trim()) return product.seller;
  if (product.sellerName) return product.sellerName;
  if (product.userName) return product.userName;
  if (product.ownerName) return product.ownerName;
  if (product.seller?.name) return product.seller.name;
  if (product.user?.name) return product.user.name;
  if (product.owner?.name) return product.owner.name;
  return 'Unknown seller';
}

function normalizeImages(product) {
  if (Array.isArray(product.images)) return product.images.filter(Boolean);
  if (product.image) return [product.image];
  return [];
}

export function normalizeExploreItem(product) {
  const { lat, lng } = extractCoordinates(product);
  const images = normalizeImages(product);
  const normalizedCondition = product.condition
    ? product.condition.charAt(0).toUpperCase() + product.condition.slice(1)
    : 'Used';

  return {
    ...product,
    id: product._id ?? product.id,
    title: product.title ?? 'Untitled item',
    description: product.description ?? '',
    price: Number(product.price ?? 0),
    category: product.category ?? 'Other',
    condition: normalizedCondition,
    seller: getSellerName(product),
    sellerRole: product.sellerRole,
    createdAt: product.createdAt ?? null,
    image: images[0] ?? '',
    images,
    lat,
    lng,
  };
}

export function getUserListedProducts(products) {
  return products
    .filter((product) => product?.sellerRole === 'user' && product?.status !== 'sold')
    .map(normalizeExploreItem)
    .filter((product) => Boolean(product.id));
}
