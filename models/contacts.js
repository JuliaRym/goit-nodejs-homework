const { Schema, model } = require("mongoose");

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: String,
  phone: String,
  favorite: {
    type: Boolean,
    default: false,
  },
});

const Contact = model("contact", contactSchema);

// Mongodb functions
const listContacts = () => Contact.find();

const getContactById = (id) => Contact.findById(id);

const addContact = (data) => Contact.create(data);

const updateContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });

const removeContact = (id) => Contact.findByIdAndDelete(id);

const updateStatusContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data, { new: true });

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact,
};
