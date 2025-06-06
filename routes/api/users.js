const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const path = require("path");
const fs = require("fs/promises");
const gravatar = require("gravatar");
const Jimp = require("jimp");
// const { Jimp } = require("jimp");

const User = require("../../models/user");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload");

const router = express.Router();

// Walidacja rejestracji
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Walidacja logowania
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /users/register
router.post("/register", async (req, res, next) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const newUser = await User.create({
    //   email,
    //   password: hashedPassword,
    // });

    const avatarURL = gravatar.url(email, { s: "250" }, true);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /users/login
router.post("/login", async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error" });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /users/logout
router.post("/logout", auth, async (req, res, next) => {
  try {
    req.user.token = null;
    await req.user.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /users/current
router.get("/current", auth, async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const tempUpload = req.file.path;
      const originalname = req.file.originalname;

      console.log("Plik otrzymany:", req.file);

      const filename = `${req.user._id}_${originalname}`;
      const avatarsDir = path.join(__dirname, "../../public/avatars");
      const finalPath = path.join(avatarsDir, filename);

      // czy folder istnieje
      await fs.mkdir(avatarsDir, { recursive: true });

      const image = await Jimp.read(tempUpload);
      console.log("Obrazek wczytany z Jimp");

      // czy resize otrzymuje liczby
      const width = 250;
      const height = 250;
      console.log("➡️ Resize do:", width, height);
      await image.resize(width, height).writeAsync(tempUpload);

      await fs.rename(tempUpload, finalPath);
      console.log("Plik przeniesiony do:", finalPath);

      const avatarURL = `/avatars/${filename}`;
      req.user.avatarURL = avatarURL;
      await req.user.save();

      res.status(200).json({ avatarURL });
    } catch (err) {
      console.error("Błąd w avatar upload:", err);
      next(err);
    }
  }
);

module.exports = router;
