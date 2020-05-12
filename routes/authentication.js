const { Router } = require("express");
const router = new Router();

const User = require("./../models/user");
const bcryptjs = require("bcryptjs");

router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/sign-up", (req, res, next) => {
  res.render("sign-up");
});

router.post("/sign-up", (req, res, next) => {
  const { name, email, password } = req.body;
  const generateToken = (length) => {
    const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }
    return token;
  };

  const confirmationCode = generateToken(10);
  bcryptjs
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        name,
        email,
        passwordHash: hash,
        status: "pending",
        confirmationCode,
      });
    })
    .then((user) => {
      console.log(user);
      req.session.user = user._id;
      res.redirect("/");
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/sign-in", (req, res, next) => {
  res.render("sign-in");
});

router.post("/sign-in", (req, res, next) => {
  let userId;
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then((result) => {
      if (result) {
        req.session.user = userId;
        res.redirect("/");
      } else {
        return Promise.reject(new Error("Wrong password."));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post("/sign-out", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/auth/confirm/:token", (req, res) => {
  const confirmationCode = req.params.token;
  User.findOneAndUpdate({ confirmationCode }, { status: "active" })
    .then((doc) => {
      console.log(doc);
      res.redirect("/confirmation");
    })
    .catch((error) => {
      next(error);
    });
});

router.get("/confirmation", (req, res) => {
  res.render("confirmation");
});

const routeGuard = require("./../middleware/route-guard");

router.get("/private", routeGuard, (req, res, next) => {
  res.render("private");
});

module.exports = router;
