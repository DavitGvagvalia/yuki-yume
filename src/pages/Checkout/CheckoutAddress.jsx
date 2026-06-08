// src/components/DeliveryMap.jsx
import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import logo from '../../../assets/images/logo.png';
import loading from '../../../assets/images/loading.svg';




const restaurantIcon = L.divIcon({
  html: `
    <img src="${logo}" alt="Restaurant Location" style="width: 32px; aspect-ratio:1/1; border-radius: 50%; border: 2px solid #3077cf;" />
  `,
  className: 'custom-pin',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const customerIcon = L.divIcon({
  html: `
    <img src="${loading}" alt="Selected Location" style="width: 20px; aspect-ratio: 1/1; border-radius: 50%; border: 2px solid #333;" />
  `,
  className: 'custom-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const RESTAURANT_LOCATION = [41.70400903072833, 44.80448381630125]; // [Lat, Lng]
const FIVE_KM_IN_METERS = 5000;

// MapEventsHandler component defined outside to allow hook usage at component level
function MapEventsHandler({ position, setPosition, onLocationSelected }) {
  const handleMapClick = useCallback((e) => {
    setPosition(e.latlng);
    onLocationSelected(e.latlng);
  }, [setPosition, onLocationSelected]);

  useMapEvents({
    click: handleMapClick,
  });
  return position === null ? null : <Marker position={position} icon={customerIcon} />;
}

export function DeliveryMap({ onLocationSelected }) {
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [mapInstance, setMapInstance] = useState(null);

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchStatus('Searching...');

    try {
      const fullQuery = `${searchQuery}, Tbilisi, Georgia`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MySushiBarApp/1.0 (contact@mysushibar.com)'
        }
      });

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };

        setPosition(newCoords);
        onLocationSelected(newCoords);
        setSearchStatus(`Found: ${display_name}`);

        if (mapInstance) {
          mapInstance.flyTo([newCoords.lat, newCoords.lng], 16);
        }
      } else {
        setSearchStatus('Address not found. Please try adding more details or pin manually.');
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSearchStatus('Search service temporarily unavailable. Please pin manually.');
    }
  };

  return (
    <div className="w-full md:w-1/2 p-5 flex flex-col gap-3">
      {/* Search Input UI */}
      <form onSubmit={handleAddressSearch} className="flex gap-3 items-center justify-center" >
        <input
          type="text"
          placeholder="Enter address..."
          aria-label="Enter delivery address to search on map"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-1.5 py-1 bg-accent text-white border-none rounded-md cursor-pointer ">
          Find on Map
        </button>
      </form>

      {searchStatus && <p className="text-sm text-accent-muted">{searchStatus}</p>}





      <div className="relative w-full aspect-square rounded-md overflow-hidden">
        <MapContainer
          center={RESTAURANT_LOCATION}
          zoom={12}
          minZoom={12}
          maxZoom={18}
          ref={setMapInstance}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Restaurant Pin */}
          <Marker position={RESTAURANT_LOCATION} icon={restaurantIcon} />

          {/* Green Delivery boundary stroke ring */}
          <Circle
            center={RESTAURANT_LOCATION}
            radius={FIVE_KM_IN_METERS}
            pathOptions={{ color: 'red', fillColor: '#3077cf', weight: 10, opacity: 1, fillOpacity: .2 }}
          />

          <MapEventsHandler position={position} setPosition={setPosition} onLocationSelected={onLocationSelected} />

        </MapContainer>
      </div>
    </div>
  );
}

const CheckoutAddress = () => {
  const handleLocationSelected = useCallback((coords) => {
    console.log("Selected delivery location:", coords);
  }, []);

  return (
    <div className="flex flex-col gap-3 items-center justify-center">

      <DeliveryMap onLocationSelected={handleLocationSelected} />
    </div>
  )
}

export default CheckoutAddress;