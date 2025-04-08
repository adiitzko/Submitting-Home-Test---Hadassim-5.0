const express = require("express");
const router = express.Router();
const {
  createOrderHandler,
  getProductsBySupplier,
  getSuppliers,
  updateOrderStatusHandler,
  getAllOrders,
  completeOrder,
  showOrders,
} = require("../controllers/orderController");

router.get("/suppliers", getSuppliers);

router.get("/suppliers/:companyName/products", getProductsBySupplier);

router.post("/create-order", createOrderHandler);

router.post("/updateOrderStatus", updateOrderStatusHandler);

router.get("/all-orders", getAllOrders);

router.get("/supplierOrders", showOrders);

router.post("/completeOrder", completeOrder);

router.get("/order", (req, res) => {
  res.render("order");
});

module.exports = router;
