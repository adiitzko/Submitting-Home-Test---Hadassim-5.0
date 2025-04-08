const sql = require("mssql");

const config = {
  user: "AdiItzkovich_SQLLogin_1",
  password: "1du785hmqq",
  server: "hadasim.mssql.somee.com",
  database: "hadasim",
  options: {
    trustServerCertificate: true,
  },
};

sql.connect(config, (err) => {
  if (err) {
    console.log("Error while connecting to database: ", err);
  } else {
    console.log("Connected to the database successfully!");
  }
});
