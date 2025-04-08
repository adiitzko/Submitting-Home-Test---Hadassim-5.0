const sql = require("mssql");
const config = require("../config");

// Function to add products for a supplier
async function addProductsForSupplier(companyName, products) {
  const pool = await sql.connect(config);
  const transaction = pool.transaction(); // for atomicity

  try {
    await transaction.begin();

    // Each product in the array
    for (const product of products) {
      if (
        !product.productName ||
        typeof product.productName !== "string" ||
        product.productName.trim() === ""
      ) {
        throw new Error("❌ productName must be a valid non-empty string!");
      }

      // Insert the product into the database
      await transaction
        .request()
        .input("productName", sql.NVarChar(100), product.productName)
        .input("price", sql.Decimal(10, 2), product.price)
        .input("minQuantity", sql.Int, product.minQuantity)
        .input("companyName", sql.NVarChar(100), companyName).query(`
          INSERT INTO Products (productName, price, minQuantity, companyName) 
          VALUES (@productName, @price, @minQuantity, @companyName)
        `);
    }

    await transaction.commit();
    console.log("Transaction committed successfully.");
  } catch (err) {
    console.error("Error occurred while adding products:", err);
    await transaction.rollback();
    throw new Error(`Error occurred while adding products: ${err.message}`);
  } finally {
  }
}

// Function to get all products from the database
async function getProducts() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM Products");
    return result.recordset; // Return the list of products
  } catch (err) {
    throw err;
  }
}

module.exports = { addProductsForSupplier, getProducts };
