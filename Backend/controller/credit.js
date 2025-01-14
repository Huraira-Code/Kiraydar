const { default: mongoose } = require("mongoose");
const Credit = require("../models/Credit");
const jwt = require("jsonwebtoken");

const CreatePayment = async (req, res) => {
  // Move the code to extract title and create property inside the Promise.all().then() block
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  try {
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const _id = verify.response._id;
    const TransactionType = "Escrow";
    const PaymentIntentId = req.body.PaymentIntentId;
    const TransactionAmount = req.body.TransactionAmount;
    const InAccordance = req.body.InAccordance;
    const SendedId = _id;
    const RecieverId = req.body.RecieverId;
    const myData = new Credit({
      PaymentIntentId: PaymentIntentId,
      TransactionType: TransactionType, // "Escrow" as the transaction type
      TransactionAmount: TransactionAmount,
      InAccordance: InAccordance,
      SendedId: SendedId,
      RecieverId: RecieverId,
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
