const { Schema, model } = require("mongoose");

const contactSchema = new Schema({
  name: { type: String, required: [true, "Set name for contact"] },
  email: String,
  phone: String,
  favorite: { type: Boolean, default: false },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const Contact = model("Contact", contactSchema, "contacts");

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
  Contact,
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact,
};
