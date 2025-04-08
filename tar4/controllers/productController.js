const productModel = require("../models/productModel");

async function addProducts(req, res) {
  const { companyName, products } = req.body;

  try {
    if (products && products.length > 0) {
      await productModel.addProductsForSupplier(companyName, products);
      res.redirect("/supplier-dashboard");
    } else {
      res.render("registerSupplier", {
        errorMessage: "No products selected to add",
      });
    }
  } catch (err) {
    console.error("Error adding products:", err);
    res.render("registerSupplier", {
      errorMessage: "Error adding products. Please try again.",
    });
  }
}

module.exports = { addProducts };
