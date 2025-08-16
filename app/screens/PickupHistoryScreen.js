import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import colors from "../config/colors";
import { getPickupStatus, getAllPickupJourneys, getUserPickupJourneys } from "../api/status";
import useAuth from "../auth/useAuth";
import apiClient from "../api/client";

const STATUS_LABELS = {
  pending: "Waiting to Start",
  picked: "Picked Up",
  dropoff: "In Transit",
  completed: "Arrived",
};

const STATUS_COLORS = {
  pending: colors.grey,
  picked: colors.secondary,
  dropoff: colors.Inprogress,
  completed: colors.Completed,
};

export default function PickupHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [pickupIds, setPickupIds] = useState([]);
  const [journeyStatuses, setJourneyStatuses] = useState({});
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch pickup journeys from database
  useEffect(() => {
    fetchPickupJourneys();
    fetchParentData();
  }, []);

  // Fetch pickup journeys from database
  const fetchPickupJourneys = async () => {
    setLoading(true);
    try {
      console.log("Fetching pickup journeys for user:", user?.sub?.name, "(ID:", user?.sub?.id, ")");
      // Use user-specific endpoint if user is logged in, otherwise use general endpoint
      const res = user && user.sub ? await getUserPickupJourneys() : await getAllPickupJourneys();
      console.log("Response:", res);
      
      if (res.ok && res.data && res.data.journeys) {
        const journeys = res.data.journeys;
        console.log("Journeys found:", journeys.length);
        const ids = journeys.map(journey => journey.pickup_id);
        const statuses = {};
        
        journeys.forEach(journey => {
          statuses[journey.pickup_id] = {
            status: journey.status,
            timestamp: journey.timestamp,
            child_id: journey.child_id,
            pickup_person_id: journey.pickup_person_id
          };
        });
        
        setPickupIds(ids);
        setJourneyStatuses(statuses);
      } else {
        console.log("No journeys found or invalid response");
        // If no journeys found, set empty arrays
        setPickupIds([]);
        setJourneyStatuses({});
      }
    } catch (e) {
      console.error("Error fetching pickup journeys:", e);
      setPickupIds([]);
      setJourneyStatuses({});
    } finally {
      setLoading(false);
    }
  };

  const fetchParentData = async () => {
    try {
      const response = await apiClient.get('/api/me');
      if (response.ok && response.data) {
        setParentData(response.data.parent);
      }
    } catch (error) {
      console.error('Error fetching parent data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPickupJourneys();
    setRefreshing(false);
  };

  const handleJourneyPress = (pickupId) => {
    const journeyData = journeyStatuses[pickupId] || {};
    navigation.navigate("JourneyDetail", { 
      pickupId,
      status: journeyData.status || "pending",
      timestamp: journeyData.timestamp,
      child_id: journeyData.child_id,
      pickup_person_id: journeyData.pickup_person_id
    });
  };

  const renderJourneyItem = ({ item }) => {
    const journeyStatus = journeyStatuses[item] || {};
    const status = journeyStatus.status || "pending";
    const statusLabel = STATUS_LABELS[status];
    const statusColor = STATUS_COLORS[status];
    
    return (
      <TouchableOpacity 
        style={styles.journeyItem}
        onPress={() => handleJourneyPress(item)}
      >
        <View style={styles.journeyHeader}>
          <AppText style={styles.journeyId}>Journey #{item}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <AppText style={styles.statusText}>{statusLabel}</AppText>
          </View>
        </View>
        
        <View style={styles.journeyDetails}>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Child ID:</AppText>
            <AppText style={styles.infoValue}>{journeyStatus.child_id || "N/A"}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Pickup Person:</AppText>
            <AppText style={styles.infoValue}>{journeyStatus.pickup_person_id || "N/A"}</AppText>
          </View>
          <AppText style={styles.timestampText}>
            {journeyStatus.timestamp ? 
              new Date(journeyStatus.timestamp).toLocaleDateString() : 
              "No timestamp"
            }
          </AppText>
          <AppText style={styles.tapText}>Tap to view details</AppText>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Loading pickup history...</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <AppText style={styles.title}>
          {parentData ? `${parentData.name}'s Pickup History` : 'Parent Pickup History'}
        </AppText>
        <AppText style={styles.subtitle}>
          {pickupIds.length} journeys found
        </AppText>
      </View>
      
      <FlatList
        data={pickupIds}
        renderItem={renderJourneyItem}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No pickup journeys found</AppText>
            <AppText style={styles.emptySubtext}>Create a new journey to get started</AppText>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    padding: 20,
    backgroundColor: colors.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
    marginTop: 5,
  },
  listContainer: {
    padding: 20,
  },
  journeyItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  journeyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  journeyId: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  journeyDetails: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.grey,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: "bold",
  },
  timestampText: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 8,
  },
  tapText: {
    fontSize: 12,
    color: colors.secondary,
    fontStyle: "italic",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.grey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.grey,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: "center",
  },
}); 