const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "adi111",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // הגדר ל-true רק אם אתה משתמש ב-HTTPS
  })
);

app.use(require("./routes/supplierRoutes"));
app.use(require("./routes/storeOwnerRoutes"));
app.use(require("./routes/productRoutes"));
app.use(require("./routes/orderRoutes"));

app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
