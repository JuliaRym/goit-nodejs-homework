const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  // Sprawdzanie tokenu z nagłówka 'Authorization'
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // Weryfikacja tokenu JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Wyszukiwanie użytkownika na podstawie ID z tokenu

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Zapisywanie użytkownika w obiekcie request (req.user)
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = auth;
