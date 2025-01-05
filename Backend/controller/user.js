const User = require("../models/user");
const { query, check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const stripe = require('stripe')('sk_test_51Q90mr2LewuTEXoE0He3jMvaViGCuev6fx1m08QZ8w6ShDO14m8WUI1ze8l6MEpmNPKS2fe67NTnFkIGbEQLYmdg00VwD6Dqlk');

const   signIn = async (req, res) => {
  try {
    const myData = await User.findOne(
      {
        email: req.body.email,
      },
      "_id username cnic password"
    ).exec();
    console.log(myData);
    console.log(req.body.password);
    if (myData !== null) {
      if (myData.password === req.body.password) {
        const accessToken = jwt.sign(
          { response: myData },
          process.env.ACCESS_TOKEN_SECRET
        );
        console.log(accessToken);
        res.status(200).json(accessToken);
      } else {
        console.log("backend log")
        res
        .status(404)
        .json({ msg: "Your provided credential's not matched" });      }
    } else {
      res
        .status(404)
        .json({ msg: "No such user with the provided Email address" });
    }
  } catch (error) {
    console.log(error);
  }
};

const signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.errors);
    return res.json({ errors: errors.errors });
  }
  const account = await stripe.accounts.create({
    type: 'custom',
    country: 'US',
    email: 'testuser@example.com',
    capabilities: {
      transfers: { requested: true },
    },
    business_type: 'individual',
    individual: {
      first_name: 'John',
      last_name: 'Doe',
      dob: { day: 1, month: 1, year: 1990 },
      address: {
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94111',
      },
      ssn_last_4: '0000', // Test SSN
    },
    external_account: {
      object: 'bank_account',
      country: 'US',
      currency: 'usd',
      routing_number: '110000000', // Test routing number
      account_number: '000123456789', // Test account number
    },
  });
  console.log(account)
  
  
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const cnic = req.body.cnic;
    const phonenumber = req.body.phonenumber;
    const bankAccounted = req.body.bankAccount
    const myData = new User({
      username: username,
      email: email,
      password: password,
      cnic: cnic,
      phonenumber: phonenumber,
      bankAccount : bankAccounted,
      BankAountStripeId : account.id
    });

    // Save the new issue to the database
    const savedUser = await myData.save();
    console.log(savedUser);
    const accessToken = jwt.sign(
      { response: savedUser },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.status(202).json({
      success: true,
      token: accessToken,
    });
  } catch (error) {
    console.error("Error creating User:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
module.exports = {
  signIn,
  signUp,
};
