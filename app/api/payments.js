import client from "./client";

export const getPayments = async () => {
  return client.get("/get_payments");
};

export const getParentPendingPayments = async () => {
  return client.get("/api/parent/pending-payments");
};

export const getParentAllPayments = async () => {
  return client.get("/api/parent/all-payments");
};

export const getPaymentDetails = async (paymentId) => {
  return client.get(`/api/parent/payment-details/${paymentId}`);
};

export const addDummyPayments = async () => {
  return client.post("/add_dummy_payments");
}; 