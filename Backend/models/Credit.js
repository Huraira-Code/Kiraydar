const mongoose = require("mongoose");

const creditSchema = mongoose.Schema({
  PropertyId: {
    type: String,
    required: true,
  },
  transferId: {
    type: String,
    required: true,
  },
  recieverId: {
    type: String,
    required: true,
  },
  StripeIntent: {
    type: String,
    default: null,
  },
  Type: {
    type:String,
    default:null,
  },
  SendedTo:{
    type:String,
    default:null
  }
});

const Credit = mongoose.model("Credit", creditSchema);

module.exports = Credit;
