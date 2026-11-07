const React = require("react");
const { View } = require("react-native");

function StripeProvider({ children }) {
  return children;
}

function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null }),
    confirmPayment: async () => ({ error: null, paymentIntent: { id: "pi_web_test", status: "Succeeded" } }),
    confirmSetupIntent: async () => ({ setupIntent: { status: "Succeeded", paymentMethodId: "pm_web_setup" }, error: null }),
    createPaymentMethod: async () => ({ error: null, paymentMethod: { id: "pm_web_test" } }),
  };
}

function CardField(props) {
  return React.createElement(View, props);
}

const CardFieldInput = {};

module.exports = {
  initStripe: async () => {},
  StripeProvider,
  useStripe,
  CardField,
  CardFieldInput,
};
