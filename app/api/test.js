import client from "./client";

// Test backend connectivity
export const testBackend = async () => {
  return client.get("/test");
}; 