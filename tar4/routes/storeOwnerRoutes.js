const express = require("express");
const router = express.Router();

router.get("/storeOwner", (req, res) => {
  res.render("storeOwnerLogin", { errorMessage: null });
});

// Manage the store owner login
router.post("/storeOwner-login", (req, res) => {
  const { username, password } = req.body;

  if (username === "Adi" && password === "123") {
    res.redirect("/order");
  } else {
    res.render("storeOwnerLogin", {
      errorMessage: "Incorrect username or password!",
    });
  }
});

module.exports = router;
