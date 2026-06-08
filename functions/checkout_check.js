import { functions, db } from "../src/firebaseConfig.js";

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

      const itemTotal = dbItem.price * quantity;
      total += itemTotal;

      orderItems.push({
        productId: id,
        name: dbItem.name,
        price: dbItem.price,
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