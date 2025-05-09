const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { Contact } = require("../../models/contacts");
const auth = require("../../middleware/auth");

// Walidacja danych kontaktu
const contactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
  // favorite: Joi.boolean().optional(),
  // owner: Joi.string().required(),
});

// Do PATCH /contacts/:id/favorite
const favoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
}).min(1); // by bylo przynajmniej jedno pole

// GET - Pobieranie kontaktów użytkownika
router.get("/", auth, async (req, res) => {
  try {
    // Sprawdzenie, czy użytkownik jest poprawnie przypisany
    console.log("User ID:", req.user._id);

    const contacts = await Contact.find({ owner: req.user._id });
    console.log("Fetched contacts:", contacts);

    if (!contacts) {
      return res.status(404).json({ message: "No contacts found" });
    }

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - Dodanie nowego kontaktu
router.post("/", auth, async (req, res) => {
  const { error } = contactSchema.validate(req.body); // Walidacja
  if (error) {
    return res.status(400).json({
      message: `missing required ${error.details[0].path[0]} - field`,
    });
  }

  const { name, email, phone } = req.body;
  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      owner: req.user._id, // Powiązanie kontaktu z użytkownikiem
    });

    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT aktualizacja kontaktu (uwsglednienie wlasciciela)
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;

  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: `Missing or invalid fields: ${error.details[0].message}`,
    });
  }

  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: id, owner: req.user._id }, // kontakt musi należeć do zalogowanego użytkownika
      req.body,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
  } catch (err) {
    console.error("PUT /contacts/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/favorite", auth, async (req, res) => {
  const { error } = favoriteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "missing field favorite" });
  }

  try {
    const { id } = req.params;

    // const contact = await Contact.findById(id);
    const contact = await Contact.findOne({ _id: id, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    if (contact.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    contact.favorite = req.body.favorite;
    await contact.save();

    res.status(200).json(contact);
  } catch (err) {
    console.error("PATCH /contacts/:id/favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE - Usunięcie kontaktu
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
