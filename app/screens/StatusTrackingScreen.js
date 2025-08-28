import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, FlatList, Alert, Image } from "react-native";
import Screen from "../components/Screen";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import colors from "../config/colors";
import { updatePickupStatus, getPickupStatus, getJourneyDetails, recordDeparture } from "../api/status";
import { getChildren } from "../api/children";
import useAuth from "../auth/useAuth";
import apiClient from "../api/client";

const STATUS_FLOW = ["pending", "departed", "picked", "arrived", "completed"];
const STATUS_LABELS = {
  pending: "Started",
  departed: "Departed",
  picked: "Picked Up",
  arrived: "Arrived",
  completed: "Completed",
};
const STATUS_COLORS = {
  pending: colors.grey,
  departed: colors.warning,
  picked: colors.secondary,
  arrived: colors.Inprogress,
  completed: colors.Completed,
};

const CIRCLE_SIZE = Dimensions.get("window").width * 0.7;

// Helper to map backend errors to user-friendly messages
function getFriendlyErrorMessage(error) {
  if (!error) return null;
  if (error.includes("Invalid status transition")) {
    return "You must follow the pickup steps in order. Please tap the button to move to the next stage.";
  }
  if (error.includes("Cannot update status after journey is")) {
    return "This pickup journey is already finished and cannot be updated.";
  }
  if (error.includes("Cannot cancel a completed journey")) {
    return "You cannot cancel a journey that is already completed.";
  }
  if (error.includes("Missing required fields")) {
    return "Some information is missing. Please contact support.";
  }
  return error;
}

// Helper to generate unique journey ID combining child ID and random string
function generateJourneyId(childId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${childId}-${randomPart}`;
}

export default function StatusTrackingScreen({ route, navigation }) {
  const { user } = useAuth();
  const [statusIndex, setStatusIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusTimestamp, setStatusTimestamp] = useState(null);
  const [pickupIds, setPickupIds] = useState([]); // Start with empty array
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [journeyStatuses, setJourneyStatuses] = useState({});
  const [children, setChildren] = useState(route?.params?.children || []);
  const [selectedChild, setSelectedChild] = useState(null);
  const [journeyDetails, setJourneyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newJourneyMessage, setNewJourneyMessage] = useState(null);
  const status = STATUS_FLOW[statusIndex];

  // Fetch children for the authenticated parent (only if not passed as params)
  const fetchChildren = async () => {
    if (children.length > 0) {
      console.log("✅ Using children from params:", children);
      return;
    }
    
    try {
      const response = await getChildren();
      if (response.ok && response.data && response.data.children) {
        setChildren(response.data.children);
        console.log("✅ Children fetched:", response.data.children);
      } else {
        console.log("❌ Failed to fetch children:", response);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };



  // Simplified function - backend will get all data from database
  const getStatusUpdateData = () => {
    return {
      pickup_id: selectedPickupId,
      status: null // Will be set when calling the function
    };
  };

  // Fetch journey details including child and pickup person info
  const fetchJourneyDetails = async (pickupId) => {
    if (!pickupId || pickupId === null || pickupId === "null") {
      setJourneyDetails(null);
      return;
    }
    
    try {
      setLoadingDetails(true);
      const response = await getJourneyDetails(pickupId);
      if (response.ok && response.data && response.data.success) {
        setJourneyDetails(response.data.journey_details);
        console.log("✅ Journey details fetched:", response.data.journey_details);
      } else {
        console.log("❌ Failed to fetch journey details:", response);
        setJourneyDetails(null);
      }
    } catch (error) {
      console.error("Error fetching journey details:", error);
      setJourneyDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchStatus = async (pickupId = selectedPickupId) => {
    if (!pickupId || pickupId === null || pickupId === "null") {
      setLoading(false);
      setStatusIndex(-1); // No status yet
      setStatusTimestamp(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPickupStatus(pickupId);
      console.log("Status response:", response);
      
      if (response.ok && response.data) {
        const statusData = response.data;
        
        // Check if there's no status in the database
        if (statusData.status === null || statusData.status === undefined) {
          setStatusIndex(-1); // No status yet
        } else {
          const currentStatus = statusData.status;
          const newIndex = STATUS_FLOW.indexOf(currentStatus);
          
          if (newIndex !== -1) {
            setStatusIndex(newIndex);
          }
        }
        
        if (statusData.timestamp) {
          setStatusTimestamp(statusData.timestamp);
        }
        
        // Also fetch journey details
        await fetchJourneyDetails(pickupId);
      } else {
        console.log("Failed to fetch status:", response);
        setError("Failed to fetch status");
      }
    } catch (error) {
      console.error("Error fetching status:", error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch status for all pickup IDs
  const fetchAllStatuses = async () => {
    try {
      // Get all journeys from the backend
      const response = await apiClient.get("/get_user_journeys");
      if (response.ok) {
        const data = response.data;
        if (data.journeys && data.journeys.length > 0) {
          // Extract pickup IDs from journeys
          const journeyIds = data.journeys.map(journey => journey.pickup_id);
          setPickupIds(journeyIds);
          
          // Create status mapping
          const newStatuses = {};
          data.journeys.forEach(journey => {
            newStatuses[journey.pickup_id] = {
              status: journey.status,
              timestamp: journey.timestamp
            };
          });
          setJourneyStatuses(newStatuses);
        }
      }
    } catch (e) {
      console.error("Error fetching all journeys:", e);
    }
  };

  useEffect(() => {
    fetchChildren();
    // Only fetch status and journey details if we have a selected pickup ID
    if (selectedPickupId) {
      fetchStatus();
      fetchJourneyDetails(selectedPickupId);
    }
    fetchAllStatuses();
    setInitializing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update children when route params change
  useEffect(() => {
    if (route?.params?.children) {
      setChildren(route.params.children);
    }
  }, [route?.params?.children]);

  // Handle new journey creation
  useEffect(() => {
    if (route?.params?.newJourney) {
      const newJourney = route.params.newJourney;
      console.log("🎉 New journey created:", newJourney);
      
      // Add the new journey to the pickup IDs list
      setPickupIds(prev => {
        if (!prev.includes(newJourney.pickup_id)) {
          return [...prev, newJourney.pickup_id];
        }
        return prev;
      });
      
      // Select the new journey
      setSelectedPickupId(newJourney.pickup_id);
      
      // Show success message
      setNewJourneyMessage(`✅ New journey created: ${newJourney.pickup_id}`);
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setNewJourneyMessage(null);
      }, 3000);
      
      // Clear the route params to avoid re-processing
      navigation.setParams({ newJourney: undefined });
    }
  }, [route?.params?.newJourney, navigation]);

  // Refresh data when screen comes into focus (e.g., after creating a journey)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh journey data when returning to this screen
      fetchAllStatuses();
      if (selectedPickupId) {
        fetchStatus(selectedPickupId);
        fetchJourneyDetails(selectedPickupId);
      }
    });

    return unsubscribe;
  }, [navigation, selectedPickupId]);

  useEffect(() => {
    if (selectedPickupId) {
      fetchStatus();
      fetchJourneyDetails(selectedPickupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPickupId]);

  const handleAdvanceStatus = async () => {
    // Parents can advance from "Started" to "Departed", "Picked Up" to "Arrived", or "Arrived" to "Completed"
    let nextStatus;
    let nextStatusIndex;
    
    if (statusIndex === 0) {
      // From "Started" (pending) to "Departed"
      nextStatus = "departed";
      nextStatusIndex = 1;
    } else if (statusIndex === 2) {
      // From "Picked Up" to "Arrived"
      nextStatus = "arrived";
      nextStatusIndex = 3;
    } else if (statusIndex === 3) {
      // From "Arrived" to "Completed"
      nextStatus = "completed";
      nextStatusIndex = 4;
    } else {
      setError("School admin will handle status updates. Please wait for pickup confirmation.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const statusUpdateData = getStatusUpdateData();
      statusUpdateData.status = nextStatus;
      
      console.log("📱 MOBILE APP - Status Update Request:");
      console.log("📤 Pickup ID:", selectedPickupId);
      console.log("📤 Status:", nextStatus);
      console.log("📤 Full request data:", JSON.stringify(statusUpdateData, null, 2));
      
      const res = await updatePickupStatus(statusUpdateData);
      
      console.log("📱 MOBILE APP - Status Update Response:");
      console.log("📥 Response OK:", res.ok);
      console.log("📥 Response Data:", res.data);
      console.log("📥 Response Error:", res.error);
      
      if (res.ok) {
          setStatusIndex(nextStatusIndex);
          setStatusTimestamp(res.data?.timestamp || new Date().toISOString());
          // Update the journey statuses
          fetchAllStatuses();
          
          if (nextStatus === "departed") {
            Alert.alert("Success", "Departure recorded! School admin will handle pickup.");
          } else if (nextStatus === "arrived") {
            Alert.alert("Success", "Arrival recorded! Child has reached the destination.");
          } else if (nextStatus === "completed") {
            Alert.alert("Success", "Journey completed! Child has arrived safely.");
          }
        } else {
        setError(getFriendlyErrorMessage(res.data?.error || "Failed to update status"));
      }
    } catch (e) {
      setError(getFriendlyErrorMessage("Network error. Please check your connection."));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPickup = () => {
    if (children.length === 0) {
      Alert.alert("No Children", "You need to have children registered to create a journey.");
      return;
    }
    
    // Navigate to journey creation screen with children data
    navigation.navigate("CreateJourney", { children });
  };

  // This function is no longer needed as we're using a dedicated journey creation screen
  // const handleChildSelection = (child) => {
  //   // Moved to CreateJourney screen
  // };

  const handleSelectPickup = (pickupId) => {
    if (!pickupId || pickupId === null || pickupId === "null") {
      return;
    }
    setSelectedPickupId(pickupId);
    fetchStatus(pickupId);
    fetchJourneyDetails(pickupId);
  };

  const renderPickupItem = ({ item }) => {
    if (!item || item === null || item === "null") {
      return null;
    }
    
    const journeyStatus = journeyStatuses[item] || {};
    const currentStatus = journeyStatus.status || "pending";
    const statusLabel = STATUS_LABELS[currentStatus];
    const statusColor = STATUS_COLORS[currentStatus] || colors.grey;
    
    return (
      <TouchableOpacity 
        style={[
          styles.pickupItem, 
          selectedPickupId === item && styles.selectedPickupItem
        ]}
        onPress={() => handleSelectPickup(item)}
      >
        <AppText style={styles.pickupIdText}>ID: {item}</AppText>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
          <AppText style={styles.statusIndicatorText}>{statusLabel}</AppText>
        </View>
      </TouchableOpacity>
    );
  };

  if (initializing && selectedPickupId) {
    return (
      <Screen style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={{ marginTop: 20 }}>Loading status...</AppText>
        </View>
      </Screen>
    );
  }

  // Update button logic to handle status transitions
  let nextStatusLabel = null;
  if (statusIndex === 0) {
    // From "Started" to "Departed"
    nextStatusLabel = STATUS_LABELS["departed"];
  } else if (statusIndex === 2) {
    // From "Picked Up" to "Arrived"
    nextStatusLabel = STATUS_LABELS["arrived"];
  } else if (statusIndex === 3) {
    // From "Arrived" to "Completed"
    nextStatusLabel = STATUS_LABELS["completed"];
  }
  // Parents cannot advance from "Departed" (school admin handles that)

  // Helper to format timestamp
  function formatTimestamp(ts) {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleString();
  }
  // Helper to get elapsed time
  function getElapsedTime(ts) {
    if (!ts) return "";
    const now = new Date();
    const then = new Date(ts);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (diffHours > 0) {
      return `${diffHours}h ${mins}m ago`;
    }
    return `${mins}m ago`;
  }

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchStatus} />
        }
      >
        {/* Success Message */}
        {newJourneyMessage && (
          <View style={styles.successMessageContainer}>
            <AppText style={styles.successMessageText}>{newJourneyMessage}</AppText>
          </View>
        )}

        {/* Pickup IDs List */}
        <View style={styles.pickupListContainer}>
          <View style={styles.pickupListHeader}>
           
            <AppButton
              title="+ New Journey"
              onPress={handleCreateNewPickup}
              color="secondary"
              style={styles.newJourneyButton}
            />
          </View>
          {pickupIds.length > 0 ? (
            <FlatList
              data={pickupIds}
              renderItem={renderPickupItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickupList}
            />
          ) : (
            <View style={styles.noJourneysContainer}>
              <AppText style={styles.noJourneysText}>No journeys available</AppText>
              <AppText style={styles.noJourneysSubtext}>Create a new journey to get started</AppText>
            </View>
          )}
        </View>

        {/* Status Circle */}
        <View style={styles.centered}>
          {selectedPickupId ? (
            <AppText style={styles.selectedPickupText}>Journey: {selectedPickupId}</AppText>
          ) : (
            <AppText style={styles.selectedPickupText}>No record yet</AppText>
          )}
          
          {/* Journey Details Card */}
          {journeyDetails && (
            <View style={styles.journeyDetailsCard}>
              <View style={styles.detailsRow}>
                <View style={styles.detailSection}>
                  <AppText style={styles.detailLabel}>Child</AppText>
                  <AppText style={styles.detailValue}>{journeyDetails.child.name}</AppText>
                  <AppText style={styles.detailSubtext}>
                    Age: {journeyDetails.child.age} • Grade: {journeyDetails.child.grade}
                  </AppText>
                  <AppText style={styles.detailSubtext}>{journeyDetails.child.school}</AppText>
                </View>
                
                <View style={styles.detailSection}>
                  <AppText style={styles.detailLabel}>Pickup Person</AppText>
                  <AppText style={styles.detailValue}>{journeyDetails.pickup_person.name}</AppText>
                  {journeyDetails.pickup_person.image_url && (
                    <Image 
                      source={{ uri: journeyDetails.pickup_person.image_url }} 
                      style={styles.pickupPersonImage}
                    />
                  )}
                </View>
              </View>
            </View>
          )}
          
          {loadingDetails && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText style={styles.loadingText}>Loading journey details...</AppText>
            </View>
          )}
          
          {selectedPickupId ? (
            <View style={[styles.circle, { backgroundColor: STATUS_COLORS[status] }]}> 
              <AppText style={styles.statusText}>{STATUS_LABELS[status]}</AppText>
              {statusTimestamp && (
                <>
                  <AppText style={styles.timestampText}>{formatTimestamp(statusTimestamp)}</AppText>
                  <AppText style={styles.elapsedText}>{getElapsedTime(statusTimestamp)}</AppText>
                </>
              )}
            </View>
          ) : (
            <View style={[styles.circle, { backgroundColor: colors.grey }]}> 
              <AppText style={styles.statusText}>No Journey Selected</AppText>
              <AppText style={styles.timestampText}>Select or create a journey to begin tracking</AppText>
            </View>
          )}
          {error && <AppText style={styles.error}>{error}</AppText>}
        </View>
        <View style={styles.buttonContainer}>
          {selectedPickupId && nextStatusLabel && (
            <AppButton
              title={loading ? "Updating..." : (statusIndex === 0 ? "Record Departure" : statusIndex === 2 ? "Mark as Arrived" : "Mark as Completed")}
              onPress={handleAdvanceStatus}
              color="primary"
              disabled={loading}
            />
          )}
          {selectedPickupId && statusIndex === STATUS_FLOW.length - 1 ? (
            <AppText style={styles.completedText}>Journey Completed!</AppText>
          ) : selectedPickupId ? (
            <AppText style={styles.currentStatusText}>Current Status: {STATUS_LABELS[status]}</AppText>
          ) : (
            <AppText style={styles.currentStatusText}>No active journey</AppText>
          )}
        </View>
      </ScrollView>

      {/* Child selector modal removed - now using dedicated CreateJourney screen */}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  statusText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    padding: 20,
  },
  completedText: {
    color: colors.Completed,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    color: colors.Cancelled,
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
  },
  timestampText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  elapsedText: {
    color: colors.white,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  pickupListContainer: {
    padding: 10,
    backgroundColor: colors.light,
    marginBottom: 10,
  },
  pickupListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pickupListTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  newJourneyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  pickupList: {
    height: 100, // Fixed height for the list
  },
  pickupItem: {
    width: 150, // Fixed width for each item
    marginRight: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPickupItem: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pickupIdText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  statusIndicator: {
    width: 80,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  statusIndicatorText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  selectedPickupText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  currentStatusText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 20,
  },
  childList: {
    maxHeight: 300,
  },
  childItem: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  childDetails: {
    fontSize: 14,
    color: colors.medium,
  },
  cancelButton: {
    marginTop: 15,
  },
  journeyDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  detailSection: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  detailSubtext: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 5,
  },
  pickupPersonImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.medium,
  },
  noJourneysContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  noJourneysText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 5,
  },
  noJourneysSubtext: {
    fontSize: 14,
    color: colors.medium,
    textAlign: 'center',
  },
  successMessageContainer: {
    backgroundColor: colors.Completed,
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  successMessageText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 