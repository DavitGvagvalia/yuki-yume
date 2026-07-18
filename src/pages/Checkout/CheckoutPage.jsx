import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutDeliveryMap from './CheckoutDeliveryMap.jsx';
import { useCheckout } from '../../hooks/useCheckout.jsx';
import { useOrder } from '../../hooks/useOrders.jsx';
import { useSelection } from '../../hooks/useSelection.jsx';
import {
  getProductDiscountedPrice,
  getProductPriceInfo,
  normalizePromotionPercent,
} from '../../services/product.service.js';
import {
  calculateDeliveryPricing,
  formatGel,
} from '../../utils/deliveryFee.js';

function buildOrderProduct(product) {
  const priceInfo = getProductPriceInfo(product);

  return {
    ...product,
    price: getProductDiscountedPrice(product),
    basePrice: priceInfo.basePrice,
    promotion: normalizePromotionPercent(product.promotion),
    quantity: Number(product.quantity) || 0,
  };
}

function CheckoutItem({ item }) {
  const priceInfo = getProductPriceInfo(item);
  const quantity = Number(item.quantity) || 0;
  const lineTotal = priceInfo.currentPrice * quantity;

  return (
    <article className="flex gap-4 border-b border-border py-4 last:border-b-0">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="aspect-square h-20 w-20 flex-shrink-0 rounded-md object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-text">{item.name}</h3>
            <p className="mt-1 text-sm text-muted">Quantity: {quantity}</p>
          </div>

          <p className="whitespace-nowrap text-sm font-bold text-text">
            {lineTotal.toFixed(2)} GEL
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-text">
            {priceInfo.currentPriceLabel} GEL each
          </span>
          {priceInfo.hasPromotion && (
            <>
              <span className="text-muted line-through">
                {priceInfo.basePriceLabel} GEL
              </span>
              <span className="text-success">-{priceInfo.promotion}%</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyCheckout() {
  return (
    <main className="fixed inset-0 z-50 overflow-y-auto bg-background px-4 py-28 text-text">
      <section className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-xl items-center justify-center">
        <div className="w-full rounded-md border border-border bg-panel p-6 text-center shadow-xl">
          <ShoppingBagIcon className="mx-auto mb-4 h-12 w-12 text-accent" />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-sm text-text-secondary">
            Add menu items before checking out.
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center justify-center rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Back to menu
          </Link>
        </div>
      </section>
    </main>
  );
}

function CheckoutCustomerInfo({
  customerName,
  customerPhone,
  onCustomerNameChange,
  onCustomerPhoneChange,
}) {
  return (
    <section className="rounded-md border border-border bg-panel shadow-xl">
      <div className="border-b border-border bg-panel-elevated px-5 py-4">
        <h2 className="text-lg font-bold text-text">Contact information</h2>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-text-secondary">
          Name
          <div className="flex items-center gap-3 rounded-md border border-border bg-control px-4 py-3">
            <UserIcon className="h-5 w-5 flex-shrink-0 text-accent" />
            <input
              type="text"
              value={customerName}
              onChange={(event) => onCustomerNameChange(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-text-secondary">
          Phone
          <div className="flex items-center gap-3 rounded-md border border-border bg-control px-4 py-3">
            <PhoneIcon className="h-5 w-5 flex-shrink-0 text-accent" />
            <input
              type="tel"
              value={customerPhone}
              onChange={(event) => onCustomerPhoneChange(event.target.value)}
              placeholder="+995 ..."
              autoComplete="tel"
              className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
            />
          </div>
        </label>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { openCheckout, closeCheckout } = useCheckout();
  const { createNewOrder } = useOrder();
  const {
    selectedProducts,
    totalPrice,
    clearSelection,
  } = useSelection();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    openCheckout();

    return () => closeCheckout();
  }, [openCheckout, closeCheckout]);

  const orderProducts = useMemo(() => (
    selectedProducts.map(buildOrderProduct)
  ), [selectedProducts]);

  const totalItems = useMemo(() => (
    orderProducts.reduce((sum, product) => sum + product.quantity, 0)
  ), [orderProducts]);
  const orderSubtotal = Number(totalPrice);
  const deliveryPricing = useMemo(() => (
    calculateDeliveryPricing(deliveryLocation?.coordinates, orderSubtotal)
  ), [deliveryLocation, orderSubtotal]);

  if (selectedProducts.length === 0) {
    return <EmptyCheckout />;
  }

  async function handleSubmit() {
    setError('');

    const trimmedCustomerName = customerName.trim();
    const trimmedCustomerPhone = customerPhone.trim();
    const deliveryAddress = deliveryLocation?.address?.trim();

    if (!trimmedCustomerName || !trimmedCustomerPhone) {
      setError('Enter your name and phone number before placing your order.');
      return;
    }

    if (!deliveryAddress) {
      setError('Choose a delivery address before placing your order.');
      return;
    }

    if (!deliveryLocation?.coordinates) {
      setError('Choose a delivery pin before placing your order.');
      return;
    }

    if (!deliveryPricing.inRange) {
      setError(deliveryPricing.error || 'Choose a valid delivery location before placing your order.');
      return;
    }

    setSubmitting(true);

    const order = {
      id: crypto.randomUUID(),
      customerName: trimmedCustomerName,
      customerPhone: trimmedCustomerPhone,
      products: orderProducts,
      deliveryAddress,
      distanceKm: deliveryPricing.distanceKm,
      deliveryFee: deliveryPricing.deliveryFee,
      finalTotal: deliveryPricing.finalTotal,
      date: new Date().toISOString(),
      totalPrice: orderSubtotal,
      status: 'pending',
    };

    try {
      const orderId = await createNewOrder(order);

      clearSelection();
      navigate('/order/success', {
        state: {
          order: {
            ...order,
            orderId,
          },
        },
      });
    } catch (submitError) {
      console.error('Error placing checkout order:', submitError);
      setError('Unable to place your order. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="fixed inset-0 z-50 overflow-y-auto bg-background px-4 py-10   text-text">
      <div
        className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_340px]"
      >
        <div className="grid gap-6">
          <section className="rounded-md border border-border bg-panel shadow-xl">
            <header className="flex items-center justify-between gap-4 border-b border-border bg-panel-elevated px-5 py-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-text"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back
              </Link>

              <h1 className="text-lg font-bold text-text md:text-2xl">
                Checkout
              </h1>
            </header>

            <div className="px-5 py-2">
              {selectedProducts.map((item) => (
                <CheckoutItem key={item.id} item={item} />
              ))}
            </div>
          </section>

          <CheckoutCustomerInfo
            customerName={customerName}
            customerPhone={customerPhone}
            onCustomerNameChange={setCustomerName}
            onCustomerPhoneChange={setCustomerPhone}
          />

          <CheckoutDeliveryMap
            deliveryLocation={deliveryLocation}
            onDeliveryLocationChange={setDeliveryLocation}
          />
        </div>

        <aside className="rounded-md border border-border bg-panel p-5 shadow-xl lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-xl font-bold">Order summary</h2>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-control p-3">
              <span className="flex items-center gap-2 text-text-secondary">
                <ShoppingBagIcon className="h-5 w-5 text-accent" />
                Items
              </span>
              <span className="font-semibold text-text">{totalItems}</span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-control p-3">
              <span className="flex items-center gap-2 text-text-secondary">
                <ReceiptPercentIcon className="h-5 w-5 text-accent" />
                Food subtotal
              </span>
              <span className="text-lg font-bold text-text">
                {formatGel(orderSubtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-control p-3">
              
              <span className="text-text-secondary flex gap-2 items-center">
                <TruckIcon className="h-5 w-5 text-accent"/>Delivery</span>
              <span className="font-semibold text-text">
                {deliveryPricing.deliveryFee === null
                  ? 'Unavailable'
                  : formatGel(deliveryPricing.deliveryFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-accent/40 bg-accent-soft p-3">
              <span className="font-semibold text-text">Final total</span>
              <span className="text-lg font-bold text-text">
                {deliveryPricing.finalTotal === null
                  ? formatGel(orderSubtotal)
                  : formatGel(deliveryPricing.finalTotal)}
              </span>
            </div>
          </div>

          {deliveryPricing.error && deliveryLocation?.coordinates && (
            <p className="mt-4 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger">
              {deliveryPricing.error}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="mt-5 flex w-full items-center justify-center rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-103 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted"
          >
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </button>
        </aside>
      </div>
    </main>
  );
}
