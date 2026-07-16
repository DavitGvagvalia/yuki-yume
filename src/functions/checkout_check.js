import { functions, db } from "../firebaseConfig.js";

function normalizePromotionPercent(value) {
  const promotion = Number(value);

  if (!Number.isFinite(promotion)) {
    return 0;
  }

  return Math.min(Math.max(promotion, 0), 100);
}

function getDiscountedPrice(product) {
  const price = Number(product?.price);
  const basePrice = Number.isFinite(price) ? price : 0;
  const promotion = normalizePromotionPercent(product?.promotion);
  const discountedPrice = promotion > 0
    ? basePrice * (1 - promotion / 100)
    : basePrice;

  return Math.round((discountedPrice + Number.EPSILON) * 100) / 100;
}

export const checkoutCheck = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed.",
      });
    }

    const { cart } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or invalid.",
      });
    }

    
    let total = 0;
    const orderItems = [];

    for (const item of cart) {
      const { id, quantity } = item;

      if (!id || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item.",
        });
      }

      const docRef = db.collection("products").doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${id} not found.`,
        });
      }

      const dbItem = docSnap.data();

      if (!dbItem.available) {
        return res.status(400).json({
          success: false,
          message: `${dbItem.name} is not available.`,
        });
      }

      const itemPrice = getDiscountedPrice(dbItem);
      const itemTotal = itemPrice * quantity;
      total += itemTotal;

      orderItems.push({
        productId: id,
        name: dbItem.name,
        price: itemPrice,
        basePrice: dbItem.price,
        promotion: normalizePromotionPercent(dbItem.promotion),
        quantity,
        total: itemTotal,
      });
    }

    const orderRef = await db.collection("orders").add({
      items: orderItems,
      total,
      status: "pending",
      createdAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Checkout successful.",
      orderId: orderRef.id,
      total,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});
