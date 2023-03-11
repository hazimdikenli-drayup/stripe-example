const express = require("express");
const app = express();
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items, customerId } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    customer: customerId,
    setup_future_usage: 'off_session',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


app.post('/create-customer',  async (req, res) => {
  const {description='Customer01', name='Jose'} = req.body;
  const customer = await stripe.customers.create({
    name,
    description
  })
  console.log('Created Customer: ', customer);
  res.json(customer);
});

app.post('/setup-payment-intent',  async (req, res) => {
  const {customerId} = req.body;
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['bancontact', 'card', 'ideal'],
  });
  console.log('Created Setup Intent: ', setupIntent);
  res.json({client_secret: setupIntent.client_secret});
});

app.get('/get-payment-methods',  async (req, res) => {
  const customerId = req.query['customerId'];
  console.log('custoemr id:', customerId)
const paymentMethods = await stripe.paymentMethods.list({
  customer: customerId,
  type: 'card',
});
  console.log('List of payment methods: ', paymentMethods);
  res.json(paymentMethods);
});
app.listen(4242, () => console.log("Node server listening on port 4242!"));