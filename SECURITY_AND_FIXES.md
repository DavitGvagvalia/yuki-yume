# Security and Fixes To Do

This document lists the major issues that should be fixed before this app is treated as production-ready. The first priority is protecting the `/admin` route and all admin-only Firestore actions.

## 1. Protect `/admin` With Firebase Auth

Email/Password authentication has been enabled in Firebase Console. The app now needs frontend auth handling and route protection.

### Current Problem

The `/admin` route is public in `src/routes.jsx`.

Anyone who knows the URL can open the admin dashboard UI. If Firestore rules are permissive, this can expose all orders and allow unauthorized users to change order statuses, edit data, or delete records.

### Required Fix

- Add Firebase Email/Password login for admin users.
- Create a dedicated login page, for example `/admin/login`.
- Protect `/admin` so it only renders for authenticated users.
- Redirect unauthenticated users from `/admin` to `/admin/login`.
- Add a logout button in the admin dashboard.
- Show a loading state while Firebase checks the current auth session.

### Important

Authentication alone is not enough. A logged-in customer account should not automatically become an admin account. Admin access needs role checks.

Recommended approach:

- Store admin authorization separately from normal Firebase Auth login.
- Use custom claims if available.
- Or keep an `admins` collection where the document ID is the admin user's Firebase Auth UID.
- The frontend may use this for UI gating, but Firestore rules must also enforce it.

Example logic:

```txt
User logs in with email/password
App gets Firebase Auth UID
App checks whether UID is allowed as admin
If admin: allow /admin
If not admin: deny access
```

## 2. Add Firestore Security Rules

### Current Problem

No `firestore.rules` file was found in the repo. The app performs direct Firestore reads and writes from the frontend.

Collections affected:

- `orders`
- `products`
- `reviews`

### Required Fix

Add explicit Firestore rules and deploy them.

Minimum expected behavior:

- Public users can read available products.
- Public users can create orders only through a validated checkout path.
- Public users cannot update or delete orders.
- Public users cannot update or delete products.
- Only admins can read all orders.
- Only admins can change order status.
- Only admins can create, update, or delete products.

### Major Risk

If Firestore rules are currently open, users may be able to modify database records directly from the browser console or from their own scripts.

## 3. Move Checkout Order Creation Server-Side

### Current Problem

`CheckoutPayment.jsx` creates an order directly from client-side state.

The frontend currently sends:

- Product names
- Quantities
- Total price
- Order status
- Generated order ID

This data cannot be trusted because users can edit frontend state in the browser.

### Required Fix

The client should submit only:

- Product IDs
- Quantities
- Customer contact details
- Delivery location/address

The server should:

- Fetch products from Firestore.
- Validate that each product exists.
- Validate that each product is available.
- Calculate prices and total server-side.
- Create the order with `status: "pending"`.
- Ignore any total price or status sent from the client.

## 4. Remove Payment Card Fields Until Real Payment Exists

### Current Problem

The checkout UI asks for card number, expiration date, and CVV, but there is no real payment provider integration.

This is dangerous because users may type sensitive payment data into fields that the app should not handle.

### Required Fix

For now:

- Remove card number, expiration date, and CVV fields.
- Allow only safe options such as `Cash on delivery` or `Pay at restaurant`.

Later:

- Use a real payment provider such as Stripe.
- Never store raw card data in Firestore.
- Never process card data manually in React.

## 5. Fix Firebase Function Setup

### Current Problem

`functions/checkout_check.js` looks like an unfinished Firebase Function. It imports the frontend Firebase config but uses server-style APIs.

This is not a reliable backend implementation.

### Required Fix

Create a proper Firebase Functions setup:

- Add a real `functions/package.json`.
- Use Firebase Admin SDK in backend functions.
- Export the checkout function from the Firebase Functions entry file.
- Add functions configuration to `firebase.json`.
- Call the function from the frontend instead of writing checkout orders directly.

## 6. Fix Product Service Runtime Errors

### Current Problem

`src/services/product.service.js` calls `updateDoc` but does not import it.

This can break product editing at runtime or during build.

### Required Fix

- Import `updateDoc` from `firebase/firestore`.
- Remove unused imports such as `setDoc`, `getImageUrl`, and `add`.
- Run the build after fixing.

## 7. Fix Case-Sensitive Import Problems

### Current Problem

`src/hooks/useProducts.jsx` imports:

```js
import { fetcherHandler } from "../utils/StorageHandler";
```

But the actual file is:

```txt
src/utils/storageHandler.js
```

This may work on macOS but fail on Linux deployment.

### Required Fix

Make import casing match the real file path exactly.

## 8. Add Lint Configuration

### Current Problem

`package.json` has a lint script:

```json
"lint": "eslint ."
```

But no ESLint config file was found.

### Required Fix

- Add `eslint.config.js`.
- Enable React hooks rules.
- Run `npm run lint`.
- Fix all obvious import and hook issues.

## 9. Improve App Routing Structure

### Current Problem

`CheckoutPage` is mounted globally inside `App.jsx`.

This makes checkout behave like a global overlay instead of a clear route or controlled modal flow.

### Required Fix

Choose one approach:

- Make checkout a real route, such as `/checkout`.
- Or keep it as a modal but isolate it cleanly from normal page rendering.

The current setup is hard to reason about and easier to break.

## 10. Clean File Structure

### Current Problem

The file structure is mostly understandable, but there are naming and cleanup issues.

Issues:

- `src/pages/admin_dashboard/admin_dashboard.jsx` should use consistent casing.
- `src/schemes/templates.ts` is probably meant to be `src/schemas/templates.ts`.
- Root files like `test.js`, `rd-results.txt`, `final-scan.txt`, and `final-scan2.txt` look temporary.
- `README.md` still contains default Vite boilerplate.
- `public/index.html` may be stale or unnecessary in a Vite app.

### Required Fix

- Rename folders/files consistently.
- Remove temporary scan/test files if they are not needed.
- Replace the boilerplate README with real project setup instructions.
- Document Firebase setup, required environment variables, and deployment steps.

## Fastest Fix Order

Do these first:

1. Protect `/admin` with Firebase Auth and admin role checks.
2. Add Firestore rules that block public writes and admin actions.
3. Remove raw payment card fields from checkout.
4. Move checkout order creation to a backend function.
5. Fix build/runtime errors and case-sensitive imports.

The most urgent fix is `/admin` plus Firestore rules. Without those, the app may expose business data and allow unauthorized database changes.
