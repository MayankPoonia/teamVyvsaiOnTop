const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tenderSchema = new Schema({
  tender_id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  org_name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    // required: true,
  },
  address: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    // required: true,
  },
  closing_date: {
    type: String,
    required: true,
  },
  published_date: {
    type: String,
    required: true,
  },
  boq: {
    type: String,
  },
  undertaking: {
    type: String,
  },
});

const Tender = mongoose.model("Tender", tenderSchema);
module.exports = Tender;
