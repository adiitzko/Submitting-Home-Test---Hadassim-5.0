const {
  createOrder,
  getProductsByCompanyName,
  getAllSuppliers,
  getOrdersBySupplier,
  updateOrderStatus,
  getProductsBySupplierId,
  fetchAllOrders,
  markOrderAsCompleted,
} = require("../models/orderModel");

// Fetch all suppliers
async function getSuppliers(req, res) {
  try {
    const suppliers = await getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error("❌ Error fetching suppliers:", error);
    res.status(500).send("Error fetching suppliers");
  }
}

// Get products by supplier company name
async function getProductsBySupplier(req, res) {
  const { companyName } = req.params;

  try {
    const products = await getProductsByCompanyName(companyName);
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ message: "No products found for this supplier" });
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ error: "Error fetching products" });
  }
}

// Create a new order
async function createOrderHandler(req, res) {
  const { supplierId, products } = req.body;

  // Validate products format
  if (!Array.isArray(products)) {
    return res
      .status(400)
      .send("Products parameter is not in the correct format");
  }

  try {
    const orderData = { supplierId, products };

    // Check product quantities
    for (const product of products) {
      const productList = await getProductsBySupplierId(supplierId);
      console.log("Product List: ", productList);
      const productData = productList.find(
        (p) => p.id === parseInt(product.productId)
      );

      if (!productData) {
        return res
          .status(404)
          .json({ error: `Product with ID ${product.productId} not found` });
      }

      if (product.quantity < productData.minQuantity) {
        return res.status(400).json({
          error: `Quantity for product ${product.productId} is below minimum allowed`,
        });
      }
    }

    // Create the order
    const orderId = await createOrder(orderData);
    res
      .status(200)
      .json({ message: `Order created successfully! Order ID: ${orderId}` });
  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    res.status(500).json({ error: "Error creating order" });
  }
}

// Orders foe specific supplier
async function showOrders(req, res) {
  // Check if supplier is logged in
  if (!req.session.supplierId) {
    return res.redirect("/"); // Redirect to homepage if not logged in
  }

  const supplierId = req.session.supplierId;

  try {
    const orders = await getOrdersBySupplier(supplierId);
    res.render("supplierOrders", { orders });
  } catch (error) {
    console.error("❌ Error displaying orders:", error);
    res.status(500).send("Error displaying orders");
  }
}

// Update order status to Processing
async function updateOrderStatusHandler(req, res) {
  const { orderId } = req.body;
  try {
    await updateOrderStatus(orderId);
    res.redirect("/supplierOrders");
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).send("Error updating order status");
  }
}

// Get all orders
async function getAllOrders(req, res) {
  try {
    const rawData = await fetchAllOrders();

    // Organize data by order ID
    const ordersMap = {};

    rawData.forEach((row) => {
      if (!ordersMap[row.orderId]) {
        ordersMap[row.orderId] = {
          id: row.orderId,
          orderDate: row.orderDate,
          status: row.status,
          products: [],
        };
      }

      ordersMap[row.orderId].products.push({
        productName: row.productName,
        quantity: row.quantity,
      });
    });

    const orders = Object.values(ordersMap);

    const isApiRequest = req.path === "/all-orders";

    if (isApiRequest) {
      // If API request, return JSON
      res.json(orders);
    } else {
      // If view request, render the page
      res.render("storeOwnerDashboard", { orders });
    }
  } catch (error) {
    console.error("❌ Error loading orders:", error.message);
    res.status(500).send("Error loading orders");
  }
}

//  Update order status to completed
async function completeOrder(req, res) {
  const { orderId } = req.body;
  console.log("🔍 Received orderId:", orderId); // הוספה

  try {
    await markOrderAsCompleted(orderId);
    res.json({ message: "Order status successfully updated" });
  } catch (error) {
    console.error(" Error updating order status:", error.message);
    res.status(500).send("Error updating order status");
  }
}

module.exports = {
  createOrderHandler,
  getProductsBySupplier,
  getSuppliers,
  showOrders,
  updateOrderStatusHandler,
  getAllOrders,
  completeOrder,
};
