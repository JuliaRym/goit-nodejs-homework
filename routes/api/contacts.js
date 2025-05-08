const express = require("express");
const router = express.Router();
const Joi = require("joi");

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

// Walidacja POST i PUT
const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

// GET all contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET contact by ID
router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

// POST new contact
router.post("/", async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: `missing required ${error.details[0].path[0]} - field`,
      });
    }
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// DELETE contact by ID
router.delete("/:contactId", async (req, res, next) => {
  try {
    const result = await removeContact(req.params.contactId);
    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

// PUT update contact by ID
router.put("/:contactId", async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({ message: "missing fields" });
    }

    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: `missing required ${error.details[0].path[0]} - field`,
      });
    }

    const updated = await updateContact(req.params.contactId, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }

  const result = await updateStatusContact(contactId, { favorite });

  if (!result) {
    return res.status(404).json({ message: "Not found" });
  }

  res.status(200).json(result);
});

module.exports = router;
