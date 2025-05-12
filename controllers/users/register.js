const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const User = require("../../models/user");

const register = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email in use" });
  }

  const hash = await bcrypt.hash(password, 10);

  const avatarURL = gravatar.url(email, { s: "250" }, true);

  const newUser = await User.create({
    email,
    password: hash,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    },
  });
};

module.exports = register;
