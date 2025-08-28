import apiClient from "./client";

export const updatePickupStatus = async (data) => {
  try {
    const response = await apiClient.post("/update_status", data);
    return response;
  } catch (error) {
    console.error("Error updating pickup status:", error);
    return { ok: false, error: "Failed to update status" };
  }
};

export const getPickupStatus = async (pickupId) => {
  try {
    const response = await apiClient.get(`/get_status?pickup_id=${pickupId}`);
    return response;
  } catch (error) {
    console.error("Error getting pickup status:", error);
    return { ok: false, error: "Failed to get status" };
  }
};

export const getJourneyDetails = async (pickupId) => {
  try {
    const response = await apiClient.get(`/api/get-journey-details/${pickupId}`);
    return response;
  } catch (error) {
    console.error("Error getting journey details:", error);
    return { ok: false, error: "Failed to get journey details" };
  }
};

// Fetch all pickup journeys
export const getAllPickupJourneys = async () => {
  try {
    const response = await apiClient.get("/get_all_journeys");
    return response;
  } catch (error) {
    console.error("Error getting all pickup journeys:", error);
    return { ok: false, error: "Failed to get pickup journeys" };
  }
};

// Fetch pickup journeys for the current user
export const getUserPickupJourneys = async () => {
  try {
    const response = await apiClient.get("/get_user_journeys");
    return response;
  } catch (error) {
    console.error("Error getting user pickup journeys:", error);
    return { ok: false, error: "Failed to get user pickup journeys" };
  }
};

// Record departure for a journey
export const recordDeparture = async (pickupId) => {
  try {
    const response = await apiClient.post("/api/record-departure", { pickup_id: pickupId });
    return response;
  } catch (error) {
    console.error("Error recording departure:", error);
    return { ok: false, error: "Failed to record departure" };
  }
}; 