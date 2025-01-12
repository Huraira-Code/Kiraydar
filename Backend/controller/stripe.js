const stripe = require("stripe")(
  "sk_test_51Q90mr2LewuTEXoE0He3jMvaViGCuev6fx1m08QZ8w6ShDO14m8WUI1ze8l6MEpmNPKS2fe67NTnFkIGbEQLYmdg00VwD6Dqlk"
);

const payment = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.json({ paymentIntent: paymentIntent.client_secret });
  } catch (e) {
    res.status(400).json({
      error: e.message,
    });
  }
};

module.exports = {
  payment,
};
