export const RESTAURANT_LOCATION = {
  lat: 41.70400903072833,
  lng: 44.80448381630125,
};

export const MAX_DELIVERY_DISTANCE_KM = 5;

function toFiniteNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundDistanceUpToTenth(distanceKm) {
  return Math.max(0, Math.ceil((distanceKm - Number.EPSILON) * 10) / 10);
}

export function formatGel(value) {
  const number = toFiniteNumber(value);

  return `${(number ?? 0).toFixed(2)} GEL`;
}

export function getHaversineDistanceKm(firstCoordinates, secondCoordinates) {
  const firstLat = toFiniteNumber(firstCoordinates?.lat);
  const firstLng = toFiniteNumber(firstCoordinates?.lng);
  const secondLat = toFiniteNumber(secondCoordinates?.lat);
  const secondLng = toFiniteNumber(secondCoordinates?.lng);

  if (
    firstLat === null ||
    firstLng === null ||
    secondLat === null ||
    secondLng === null
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const degreesToRadians = Math.PI / 180;
  const deltaLat = (secondLat - firstLat) * degreesToRadians;
  const deltaLng = (secondLng - firstLng) * degreesToRadians;
  const firstLatRadians = firstLat * degreesToRadians;
  const secondLatRadians = secondLat * degreesToRadians;
  const haversineValue =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(firstLatRadians) *
      Math.cos(secondLatRadians) *
      Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(
    Math.sqrt(haversineValue),
    Math.sqrt(1 - haversineValue)
  );
}

export function getDeliveryFeeForDistance(distanceKm) {
  const normalizedDistanceKm = toFiniteNumber(distanceKm);

  if (normalizedDistanceKm === null) {
    return null;
  }

  const roundedDistanceKm = roundDistanceUpToTenth(normalizedDistanceKm);

  if (roundedDistanceKm > MAX_DELIVERY_DISTANCE_KM) {
    return null;
  }

  if (roundedDistanceKm <= 1) {
    return 1;
  }

  if (roundedDistanceKm <= 3) {
    return 3;
  }

  return 5;
}

export function calculateDeliveryPricing(deliveryCoordinates, subtotal) {
  const normalizedSubtotal = toFiniteNumber(subtotal);
  const distanceKm = getHaversineDistanceKm(
    RESTAURANT_LOCATION,
    deliveryCoordinates
  );

  if (distanceKm === null || normalizedSubtotal === null) {
    return {
      distanceKm: null,
      deliveryFee: null,
      finalTotal: null,
      inRange: false,
      error: 'Choose a valid delivery location.',
    };
  }

  const roundedDistanceKm = roundDistanceUpToTenth(distanceKm);
  const deliveryFee = getDeliveryFeeForDistance(roundedDistanceKm);

  if (deliveryFee === null) {
    return {
      distanceKm: roundedDistanceKm,
      deliveryFee: null,
      finalTotal: null,
      inRange: false,
      error: 'Delivery address is outside the 5 km delivery area.',
    };
  }

  return {
    distanceKm: roundedDistanceKm,
    deliveryFee: roundMoney(deliveryFee),
    finalTotal: roundMoney(normalizedSubtotal + deliveryFee),
    inRange: true,
    error: '',
  };
}
