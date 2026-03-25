import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom blue marker for items
const blueIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
});

// Current-location red marker
const redIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
  shadowSize: [41, 41],
});

// Helper: re-center map when center prop changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export default function ItemMap({ items, userCoords, distanceKm }) {
  // Default center: Bangalore if no location
  const center = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [12.9716, 77.5946];

  const zoomLevel = distanceKm <= 5 ? 13 : distanceKm <= 10 ? 12 : distanceKm <= 25 ? 11 : 10;

  return (
    <MapContainer
      center={center}
      zoom={zoomLevel}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} />

      {/* User location marker + radius circle */}
      {userCoords && (
        <>
          <Marker position={[userCoords.lat, userCoords.lng]} icon={redIcon}>
            <Popup>📍 <strong>Your Location</strong></Popup>
          </Marker>
          {distanceKm && (
            <Circle
              center={[userCoords.lat, userCoords.lng]}
              radius={distanceKm * 1000}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4' }}
            />
          )}
        </>
      )}

      {/* Item markers (limit to 50 nearest) */}
      {items.slice(0, 50).map((item) => (
        <Marker key={item.id} position={[item.lat, item.lng]} icon={blueIcon}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <img src={item.image} alt={item.title} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }} />
              <p style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{item.title}</p>
              <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: 13 }}>${item.price.toLocaleString()}</p>
              <p style={{ color: '#71717a', fontSize: 11, marginTop: 2 }}>{item.category} · {item.condition}</p>
              <p style={{ color: '#a1a1aa', fontSize: 10, marginTop: 2 }}>Posted by {item.seller}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
