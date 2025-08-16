import apiClient from "./client";

export const getPickupPersons = async () => {
  try {
    const response = await apiClient.get("/api/get-pickup-persons");
    return response;
  } catch (error) {
    console.error("Error fetching pickup persons:", error);
    return { ok: false, error: "Failed to fetch pickup persons" };
  }
};

export const formatPickupDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

export const formatPickupTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Time";
  }
};

export const togglePickupPersonStatus = async (pickupPersonId) => {
  try {
    const response = await apiClient.put(`/api/toggle-pickup-person-status/${pickupPersonId}`);
    return response;
  } catch (error) {
    console.error("Error toggling pickup person status:", error);
    return { ok: false, error: "Failed to toggle pickup person status" };
  }
}; 