import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logo from '../../assets/images/logo.png';

const RESTAURANT_LOCATION = {
  lat: 41.70400903072833,
  lng: 44.80448381630125,
};
const DELIVERY_RADIUS_METERS = 5000;
const TBILISI_VIEWBOX = {
  west: 44.596,
  south: 41.58,
  east: 45.02,
  north: 41.86,
};

function createRestaurantIcon() {
  return L.divIcon({
    html: `<img src="${logo}" alt="" style="width:34px;height:34px;border-radius:9999px;border:2px solid #1b6cd1;background:#fff;object-fit:cover;" />`,
    className: 'checkout-restaurant-pin',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function createCustomerIcon() {
  return L.divIcon({
    html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;border:3px solid #ffffff;background:#c45151;box-shadow:0 6px 18px rgba(16,42,67,.35);"></span>',
    className: 'checkout-customer-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapFocus({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates) {
      map.flyTo([coordinates.lat, coordinates.lng], 16);
    }
  }, [coordinates, map]);

  return null;
}

export default function CheckoutDeliveryMap({
  deliveryLocation,
  onDeliveryLocationChange,
}) {
  const [address, setAddress] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setSearching] = useState(false);
  const restaurantIcon = useMemo(createRestaurantIcon, []);
  const customerIcon = useMemo(createCustomerIcon, []);
  const deliveryCoordinates = deliveryLocation?.coordinates || null;

  const handleLocationSelect = useCallback((coordinates, addressName) => {
    setSearchError('');
    onDeliveryLocationChange({
      address: addressName,
      coordinates,
    });
  }, [onDeliveryLocationChange]);

  function handleAddressChange(event) {
    const nextAddress = event.target.value;

    setAddress(nextAddress);

    if (deliveryCoordinates) {
      onDeliveryLocationChange({
        address: nextAddress,
        coordinates: deliveryCoordinates,
      });
    }
  }

  async function handleMapLocationSelect(coordinates) {
    setSearching(true);
    setSearchError('');

    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(coordinates.lat),
      lon: String(coordinates.lng),
      zoom: '18',
      addressdetails: '1',
    });

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Nominatim reverse request failed with status ${response.status}`);
      }

      const result = await response.json();
      const resolvedAddress = result?.display_name || address.trim() || 'Pinned delivery location';

      setAddress(resolvedAddress);
      handleLocationSelect(coordinates, resolvedAddress);
    } catch (error) {
      console.error('Address reverse lookup error:', error);

      const fallbackAddress = address.trim() || 'Pinned delivery location';

      setAddress(fallbackAddress);
      handleLocationSelect(coordinates, fallbackAddress);
    } finally {
      setSearching(false);
    }
  }

  async function handleAddressSearch(event) {
    event.preventDefault();

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setSearchError('Enter an address to search.');
      return;
    }

    setSearching(true);
    setSearchError('');

    const params = new URLSearchParams({
      format: 'jsonv2',
      q: `${trimmedAddress}, Tbilisi, Georgia`,
      limit: '1',
      countrycodes: 'ge',
      viewbox: [
        TBILISI_VIEWBOX.west,
        TBILISI_VIEWBOX.north,
        TBILISI_VIEWBOX.east,
        TBILISI_VIEWBOX.south,
      ].join(','),
      bounded: '1',
      addressdetails: '1',
    });

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Nominatim request failed with status ${response.status}`);
      }

      const results = await response.json();
      const firstResult = Array.isArray(results) ? results[0] : null;

      if (!firstResult) {
        setSearchError('Location not found.');
        return;
      }

      const resolvedAddress = firstResult.display_name || trimmedAddress;
      const coordinates = {
        lat: Number(firstResult.lat),
        lng: Number(firstResult.lon),
      };

      setAddress(resolvedAddress);
      handleLocationSelect(coordinates, resolvedAddress);
    } catch (error) {
      console.error('Address search error:', error);
      setSearchError('Location not found.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-panel shadow-xl">
      <div className="border-b border-border bg-panel-elevated px-5 py-4">
        <h2 className="text-lg font-bold text-text">Delivery address</h2>
      </div>

      <div className="grid gap-4 p-5">
        <form onSubmit={handleAddressSearch} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Search Tbilisi address"
            aria-label="Search delivery address"
            className="min-w-0 rounded-md border border-border bg-control px-4 py-3 text-sm text-text outline-none transition focus:border-accent"
          />

          <button
            type="submit"
            disabled={isSearching}
            className="rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted"
          >
            {isSearching ? 'Searching...' : 'Find'}
          </button>
        </form>

        {searchError && (
          <p className="rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger">
            {searchError}
          </p>
        )}

        <div className="h-[360px] overflow-hidden rounded-md border border-border bg-control md:h-[460px]">
          <MapContainer
            center={[RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]}
            zoom={14}
            minZoom={11}
            maxZoom={18}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={[RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]}
              radius={DELIVERY_RADIUS_METERS}
              pathOptions={{
                color: '#1b6cd1',
                fillColor: '#3077cf',
                fillOpacity: 0.12,
                weight: 2,
              }}
            />
            <Marker
              position={[RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng]}
              icon={restaurantIcon}
            />
            {deliveryCoordinates && (
              <Marker
                position={[deliveryCoordinates.lat, deliveryCoordinates.lng]}
                icon={customerIcon}
              />
            )}
            <MapClickHandler onLocationSelect={handleMapLocationSelect} />
            <MapFocus coordinates={deliveryCoordinates} />
          </MapContainer>
        </div>

        <div className="rounded-md border border-border bg-control p-3 text-sm text-text-secondary">
          <p>
            Selected location: {deliveryLocation?.address?.trim() || 'Choose a delivery pin'}
          </p>
          <p className="mt-1">
            Delivery limit: 5 km from Tkviavi 18.
          </p>
        </div>
      </div>
    </section>
  );
}
