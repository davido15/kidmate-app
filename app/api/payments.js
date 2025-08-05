import client from "./client";

export const getPayments = async () => {
  return client.get("/get_payments");
};

export const addDummyPayments = async () => {
  return client.post("/add_dummy_payments");
}; 