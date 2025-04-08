const sql = require("mssql");
const config = require("../config");

// Function to create an order
async function createOrder(orderdata) {
  let pool, transaction;
  try {
    pool = await sql.connect(config);
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Create a new order
    const orderRequest = new sql.Request(transaction);
    const orderResult = await orderRequest
      .input("supplierId", sql.Int, orderdata.supplierId)
      .input("orderDate", sql.DateTime, new Date()).query(`
        INSERT INTO Orders (supplierId, orderDate, status)
        OUTPUT INSERTED.id
        VALUES (@supplierId, @orderDate, 'Pending')
      `);
    const orderId = orderResult.recordset[0].id;

    // Add products to the order
    for (const product of orderdata.products) {
      const productRequest = new sql.Request(transaction);
      await productRequest
        .input("orderId", sql.Int, orderId)
        .input("productId", sql.Int, product.productId)
        .input("quantity", sql.Int, product.quantity).query(`
          INSERT INTO OrderProducts (orderId, productId, quantity) 
          VALUES (@orderId, @productId, @quantity)
        `);
    }

    await transaction.commit();
    return orderId;
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error(
      "❌ Error during order creation or transaction:",
      err.message
    );
    throw err;
  }
}

// Function to get products by company name
async function getProductsByCompanyName(companyName) {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("companyName", sql.NVarChar(100), companyName)
      .query("SELECT * FROM Products WHERE companyName = @companyName");
    return result.recordset;
  } catch (error) {
    console.error("❌ Error retrieving products:", error.message);
    throw error;
  }
}

// Function to get all suppliers
async function getAllSuppliers() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM Suppliers");
    return result.recordset;
  } catch (error) {
    console.error("❌ Error retrieving suppliers:", error.message);
    throw error;
  }
}

// Function to get orders by supplier
async function getOrdersBySupplier(supplierId) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("supplierId", sql.Int, supplierId)
      .query(`
          SELECT 
            o.id AS orderId,
            o.orderDate,
            o.status,
            p.productName,
            op.quantity
          FROM Orders o
          JOIN OrderProducts op ON o.id = op.orderId
          JOIN Products p ON op.productId = p.id
          WHERE o.supplierId = @supplierId
          ORDER BY o.id
        `);

    // Organize results
    const ordersMap = {};

    result.recordset.forEach((row) => {
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

    return Object.values(ordersMap); // array of orders
  } catch (error) {
    console.error("❌ Error retrieving orders:", error.message);
    throw error;
  }
}

// Function to update order status
async function updateOrderStatus(orderId) {
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(
        "UPDATE Orders SET status = 'Processing' WHERE id = @orderId AND status = 'Pending'"
      );
  } catch (error) {
    console.error("❌ Error updating order status:", error.message);
    throw error;
  }
}

// Function to get products by supplier ID
async function getProductsBySupplierId(supplierId) {
  try {
    const pool = await sql.connect(config);

    // Get the companyName using supplierId from the Suppliers table
    const supplierResult = await pool
      .request()
      .input("supplierId", sql.Int, supplierId)
      .query("SELECT companyName FROM Suppliers WHERE id = @supplierId");

    if (supplierResult.recordset.length === 0) {
      throw new Error(`Supplier with ID ${supplierId} not found.`);
    }

    const companyName = supplierResult.recordset[0].companyName;

    // Get the products based on companyName
    const productResult = await pool
      .request()
      .input("companyName", sql.NVarChar(100), companyName)
      .query("SELECT * FROM Products WHERE companyName = @companyName");

    return productResult.recordset;
  } catch (error) {
    console.error("❌ Error retrieving products:", error.message);
    throw error;
  }
}

// All orders with products
async function fetchAllOrders() {
  const pool = await sql.connect(config);
  const result = await pool.request().query(`
    SELECT 
      o.id AS orderId,
      o.orderDate,
      o.status,
      p.productName,
      op.quantity
    FROM Orders o
    JOIN OrderProducts op ON o.id = op.orderId
    JOIN Products p ON op.productId = p.id
    ORDER BY o.id
  `);
  return result.recordset;
}

// Function to update order status to complete
async function markOrderAsCompleted(orderId) {
  if (isNaN(orderId)) {
    throw new Error("orderId is not a number");
  }
  const pool = await sql.connect(config);
  await pool.request().input("orderId", sql.Int, orderId).query(`
      UPDATE Orders
      SET status = 'Completed'
      WHERE id = @orderId
    `);
}

module.exports = {
  createOrder,
  getProductsByCompanyName,
  getAllSuppliers,
  getOrdersBySupplier,
  updateOrderStatus,
  getProductsBySupplierId,
  fetchAllOrders,
  markOrderAsCompleted,
};
