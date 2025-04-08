const sql = require("mssql");
const config = require("../config");

// Function to log in a supplierd
async function loginSupplier(companyName, password) {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("companyName", sql.NVarChar(100), companyName)
      .input("password", sql.NVarChar(100), password)
      .query(
        "SELECT * FROM Suppliers WHERE companyName = @companyName AND password = @password"
      );
    return result.recordset;
  } catch (err) {
    throw err;
  }
}

// Function to register a new supplier
async function registerSupplier(
  companyName,
  phoneNumber,
  representativeName,
  password
) {
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("companyName", sql.NVarChar(100), companyName)
      .input("phoneNumber", sql.NVarChar(20), phoneNumber)
      .input("representativeName", sql.NVarChar(100), representativeName)
      .input("password", sql.NVarChar(100), password).query(`
        INSERT INTO Suppliers (companyName, phoneNumber, representativeName, password) 
        VALUES (@companyName, @phoneNumber, @representativeName, @password)
      `); // Insert the new supplier into the Suppliers table
  } catch (err) {
    throw err;
  }
}

// Function to get all suppliers from the database
async function getAllSuppliers() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM Suppliers");

    return result.recordset; // Return all suppliers
  } catch (error) {
    throw new Error("Error fetching suppliers: " + error.message);
  }
}

// Function to get all products for a specific supplier by company name
async function getProductsBySupplier(companyName) {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("companyName", sql.NVarChar(100), companyName)
      .query("SELECT * FROM Products WHERE companyName = @companyName");
    return result.recordset; // Return all products for the specific supplier
  } catch (error) {
    throw new Error("Error fetching products: " + error.message);
  }
}

module.exports = {
  loginSupplier,
  registerSupplier,
  getAllSuppliers,
  getProductsBySupplier,
};
