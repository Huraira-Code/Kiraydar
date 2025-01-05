const { default: mongoose } = require("mongoose");
const Credit = require("../models/Credit");
const jwt = require("jsonwebtoken");

const CreatePayment = async (req, res) => {
  // Move the code to extract title and create property inside the Promise.all().then() block
   
  try {
    const propertyId = req.body.propertyId;
    const transferId = req.body.transferId;
    const recieverId = req.body.recieverId;
    const StripeIntent = req.body.StripeIntent;
    const Type = req.body.Type;
    const SendedTo = req.body.SendedTo;

    const myData = new Credit({
      transferId: req.body.transferId,
      recieverId: req.body.recieverId,
      StripeIntent: req.body.StripeIntent,
      Type: req.body.Type,
      SendedTo: req.body.SendedTo
    });

    // Save the new property to the database
    const savedCredit = await myData.save();

    res.status(201).json({
      success: true,
      Credit: savedCredit,
    });
  } catch (error) {
    console.error("Error creating Credit:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  CreatePayment,
};
