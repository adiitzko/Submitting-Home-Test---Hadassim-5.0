const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

router.get("/", (req, res) => {
  res.render("login");
});

router.get("/loginSupplier", (req, res) => {
  res.render("loginSupplier");
});

router.get("/registerSupplier", (req, res) => {
  res.render("registerSupplier");
});

router.post("/registerSupplier", supplierController.registerSupplier);
router.post("/loginSupplier", supplierController.loginSupplier);

module.exports = router;
