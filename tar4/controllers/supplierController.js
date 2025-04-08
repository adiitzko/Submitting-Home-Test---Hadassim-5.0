const supplierModel = require("../models/supplierModel");
const productModel = require("../models/productModel");

// Function to register a new supplier
async function registerSupplier(req, res) {
  const { companyName, phoneNumber, representativeName, password, products } =
    req.body;

  try {
    // Call the registerSupplier function to register the supplier
    await supplierModel.registerSupplier(
      companyName,
      phoneNumber,
      representativeName,
      password
    );

    // If there are products, add them to the database
    if (products && products.length > 0) {
      await productModel.addProductsForSupplier(companyName, products);
    }

    // Login page after successful registration
    res.redirect("/loginSupplier");
  } catch (err) {
    console.error("Error registering supplier:", err);
    res.render("registerSupplier", {
      errorMessage: "Error during registration. Please try again.",
    });
  }
}

// Function to log in supplier
async function loginSupplier(req, res) {
  const { companyName, password } = req.body;

  try {
    // Call the loginSupplier function  to check login credentials
    const result = await supplierModel.loginSupplier(companyName, password);

    if (result.length > 0) {
      // If we get results from the database, the supplier exists
      const supplier = result[0]; // Take the first supplier found

      if (!req.session) {
        console.error("Session is not initialized");
        return res
          .status(500)
          .send("An error occurred during login - session not initialized");
      }

      // Save the supplier's ID in the session
      req.session.supplierId = supplier.id;
      console.log(`Supplier logged in, ID: ${supplier.id}`);

      // Redirect to the supplier orders page
      return res.redirect("/supplierOrders");
    } else {
      // If login fails, render the login page again with an error message
      return res.render("loginSupplier", {
        errorMessage: "Incorrect company name or password",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("An error occurred during login");
  }
}

module.exports = { registerSupplier, loginSupplier };
