const { Router } = require("express");
const profileRouter = Router();

profileRouter.get("/profile", (req, res) => {
  res.render("profile", req.user);
});

module.exports = profileRouter;
