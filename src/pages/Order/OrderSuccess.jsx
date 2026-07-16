import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";

function formatDeliveryAddress(order) {
  const deliveryAddress = String(order?.deliveryAddress || '').trim();

  if (!deliveryAddress) {
    return "No delivery address";
  }

  return deliveryAddress;
}

function formatCustomerName(order) {
  const customerName = String(order?.customerName || '').trim();

  return customerName || "No customer name";
}

function formatCustomerPhone(order) {
  const customerPhone = String(order?.customerPhone || '').trim();

  return customerPhone || "No customer phone";
}

const OrderSuccess = () => {
  const waitTime = 10;
  const { state } = useLocation();
  const order = state?.order;
  const orderItemsCount = Array.isArray(order?.products)
    ? order.products.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0)
    : 0;

  return (
    <main className="min-h-screen [background-image:var(--background-image-menu)] bg-cover bg-center px-4 py-16 text-text">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-md border border-border bg-panel/95 shadow-2xl backdrop-blur">
          <div className="bg-panel-elevated px-6 py-10 text-center md:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent/15">
              <CheckCircleIcon className="h-12 w-12 text-accent" />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Order confirmed
            </p>
            <h1 className="text-3xl font-bold text-text md:text-5xl">
              Thank you for your order
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-secondary md:text-base">
              The kitchen received your order and is preparing it now. Please
              stay nearby so we can serve it fresh.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-10">
            <div className="rounded-md border border-border bg-control p-4">
              <ClockIcon className="mb-3 h-7 w-7 text-accent" />
              <p className="text-sm text-muted">Estimated wait</p>
              <p className="mt-1 text-2xl font-bold text-text">
                {waitTime} min
              </p>
            </div>

            <div className="rounded-md border border-border bg-control p-4">
              <ReceiptPercentIcon className="mb-3 h-7 w-7 text-accent" />
              <p className="text-sm text-muted">Status</p>
              <p className="mt-1 text-lg font-semibold text-text">
                Preparing
              </p>
            </div>

            <div className="rounded-md border border-border bg-control p-4">
              <ShoppingBagIcon className="mb-3 h-7 w-7 text-accent" />
              <p className="text-sm text-muted">Items</p>
              <p className="mt-1 text-lg font-semibold text-text">
                {orderItemsCount || "Confirmed"}
              </p>
            </div>
          </div>

          <div className="border-t border-border px-6 py-6 md:px-10">
            <div className="mb-4 rounded-md border border-border bg-control p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <UserIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Customer</p>
                    <p className="mt-1 text-sm font-semibold text-text">
                      {formatCustomerName(order)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Phone</p>
                    <p className="mt-1 text-sm font-semibold text-text">
                      {formatCustomerPhone(order)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-md border border-border bg-control p-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-accent" />
                <div>
                  <p className="text-sm text-muted">Delivery location</p>
                  <p className="mt-1 text-sm font-semibold text-text">
                    {formatDeliveryAddress(order)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-3 text-sm text-text-secondary md:grid-cols-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                Order received
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                Kitchen preparing
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-muted" />
                Ready soon
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/menu"
                className="engage inline-flex flex-1 items-center justify-center rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
              >
                Back to menu
              </Link>
              <Link
                to="/"
                className="inline-flex flex-1 items-center justify-center rounded-3xl border border-border bg-control px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:bg-control-hover"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OrderSuccess;
