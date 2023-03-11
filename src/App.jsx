import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";
import "./App.css";
import SetupForm from "./SetupForm";
import SetupBasicForm from "./SetupBasicForm";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

export default function App() {
  const session = window.sessionStorage;
  const [customerName, setCustomerName] = useState("Alpha Bravo");
  const [customerId, setCustomerId] = useState(session.getItem("customerId"));
  const [customer, setCustomer] = useState(undefined);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState("");
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] =
    useState("");

  const startPayment = () => {
    // Create PaymentIntent as soon as the page loads
    fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, items: [{ id: "xl-tshirt" }] }),
    })
      .then((res) => res.json())
      .then((data) => setPaymentIntentClientSecret(data.clientSecret));
  };
  const startPaymentSetup = () => {
    // Create PaymentIntent as soon as the page loads
    fetch("/setup-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setSetupIntentClientSecret(data.client_secret);
      });
  };

  const createCustomer = () => {
    console.log(customerName);
    fetch("/create-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: customerName }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        session.setItem("customerId", data.id);
        setCustomerId(data.id);
        setCustomer(data);
      });
  };
  const getPaymentMethods = () => {
    const params = new URLSearchParams();
    params.append("customerId", customerId);
    fetch("/get-payment-methods?" + params.toString(), {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setPaymentMethods(data.data);
        console.log(data.data);
      });
  };
  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret: setupIntentClientSecret,
    appearance,
  };

  return (
    <div className="App">
      <div id="customer" style={{ maxWidth: 400 }}>
        <label>
          Customer Name:
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          ></input>
          <button onClick={createCustomer}>create customer</button>
        </label>
        {customerId && <p>Customer Id:{customerId}</p>}
        {customer && <p>Customer: {JSON.stringify(customer)}</p>}
        {customer && (
          <button onClick={startPaymentSetup}>Setup Payment Method</button>
        )}
        {setupIntentClientSecret && (
          <p>Client Secret:{setupIntentClientSecret}</p>
        )}
      </div>
      {customerId && (
        <div style={{ maxWidth: 600 }}>
          <button onClick={getPaymentMethods}>get payment methods</button>
          {!!paymentMethods?.length &&
            paymentMethods.map((pm) => <p id={pm.id}>{JSON.stringify(pm)}</p>)}
        </div>
      )}
      {customerId && (
        <div>
          <button onClick={startPayment}>checkout</button>
        </div>
      )}

      {paymentIntentClientSecret && (
        <Elements
          options={{
            clientSecret: paymentIntentClientSecret,
            customerOptions: {
              customer: customerId,
            },
            appearance,
          }}
          stripe={stripePromise}
        >
          <CheckoutForm />
        </Elements>
      )}
      {setupIntentClientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <SetupBasicForm />
        </Elements>
      )}
    </div>
  );
}
