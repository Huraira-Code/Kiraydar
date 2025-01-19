const mongoose = require("mongoose");

const creditSchema = mongoose.Schema({
  PaymentIntentId: {
    type: String,
    required: true,
  },
  TransactionType: {
    type: String,
    enum: ["Escrow", "Transfered" , "Refund" , "Forward"],
    required: true,
  },
  TransactionAmount: {
    type: Number,
    required: true,
  },
  InAccordance: {
    type: String,
    default: true,
  },
  InAccordancePropertyId: {
    type: String,
  },
  SendedId: {
    type: String,
  },
  RecieverId: {
    type: String,
  },
});

const Credit = mongoose.model("Credit", creditSchema);

module.exports = Credit;
