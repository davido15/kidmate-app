import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import colors from "../config/colors";
import { getPickupStatus } from "../api/status";

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

const CIRCLE_SIZE = 200;

export default function JourneyDetailScreen({ route, navigation }) {
  const { 
    pickupId, 
    status: initialStatus, 
    timestamp: initialTimestamp,
    child_id,
    pickup_person_id
  } = route.params;
  
  const [statusIndex, setStatusIndex] = useState(STATUS_FLOW.indexOf(initialStatus));
  const [error, setError] = useState(null);
  const [statusTimestamp, setStatusTimestamp] = useState(initialTimestamp);
  const [refreshing, setRefreshing] = useState(false);

  const status = STATUS_FLOW[statusIndex];

  // Child and pickup person data
  const childData = {
    name: `Child ID: ${child_id || 'N/A'}`,
    age: "Student",
            image: require("../assets/student.jpg"), // Using existing asset
  };
  
  const pickerData = {
    name: `Pickup Person ID: ${pickup_person_id || 'N/A'}`,
    phone: "Assigned",
    image: require("../assets/woman.jpg"), // Using existing asset
  };

  const fetchStatus = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await getPickupStatus(pickupId);
      if (res.ok && res.data) {
        if (res.data.status === null || res.data.status === undefined) {
          setStatusIndex(-1);
          setStatusTimestamp(null);
        } else {
          const idx = STATUS_FLOW.indexOf(res.data.status);
          setStatusIndex(idx >= 0 ? idx : 0);
          setStatusTimestamp(res.data.timestamp || null);
        }
      } else {
        setStatusIndex(-1);
        setStatusTimestamp(null);
      }
    } catch (e) {
      setError("Could not fetch current status. Please try again.");
      setStatusIndex(-1);
      setStatusTimestamp(null);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);



  const formatTimestamp = (ts) => {
    if (!ts) return "No timestamp available";
    const date = new Date(ts);
    return date.toLocaleString();
  };

  const getElapsedTime = (ts) => {
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
  };



  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchStatus} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.journeyTitle}>Journey #{pickupId}</AppText>
          <AppText style={styles.journeySubtitle}>Pickup Details</AppText>
        </View>

        {/* Status Circle */}
        <View style={styles.statusContainer}>
          <View style={[styles.circle, { backgroundColor: STATUS_COLORS[status] }]}>
            <AppText style={styles.statusText}>{STATUS_LABELS[status]}</AppText>
            {statusTimestamp && (
              <>
                <AppText style={styles.timestampText}>{formatTimestamp(statusTimestamp)}</AppText>
                <AppText style={styles.elapsedText}>{getElapsedTime(statusTimestamp)}</AppText>
              </>
            )}
          </View>
        </View>

        {/* Child and Picker Information */}
        <View style={styles.peopleContainer}>
          {/* Child Section */}
          <View style={styles.personSection}>
            <AppText style={styles.sectionTitle}>Child</AppText>
            <View style={styles.personCard}>
              <Image source={childData.image} style={styles.personImage} />
              <View style={styles.personInfo}>
                <AppText style={styles.personName}>{childData.name}</AppText>
                <AppText style={styles.personDetails}>{childData.age}</AppText>
              </View>
            </View>
          </View>

          {/* Picker Section */}
          <View style={styles.personSection}>
            <AppText style={styles.sectionTitle}>Pickup Person</AppText>
            <View style={styles.personCard}>
              <Image source={pickerData.image} style={styles.personImage} />
              <View style={styles.personInfo}>
                <AppText style={styles.personName}>{pickerData.name}</AppText>
                <AppText style={styles.personDetails}>{pickerData.phone}</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Journey Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Journey ID:</AppText>
            <AppText style={styles.infoValue}>{pickupId}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Child ID:</AppText>
            <AppText style={styles.infoValue}>{child_id || 'N/A'}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Pickup Person ID:</AppText>
            <AppText style={styles.infoValue}>{pickup_person_id || 'N/A'}</AppText>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Current Status:</AppText>
            <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[status] }]}>
              <AppText style={styles.statusChipText}>{STATUS_LABELS[status]}</AppText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Last Updated:</AppText>
            <AppText style={styles.infoValue}>
              {statusTimestamp ? formatTimestamp(statusTimestamp) : "Not started"}
            </AppText>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        )}

        {/* Completion Status */}
        {statusIndex === STATUS_FLOW.length - 1 && (
          <View style={styles.completedContainer}>
            <AppText style={styles.completedText}>Journey Completed!</AppText>
            <AppText style={styles.completedSubtext}>All stages completed successfully</AppText>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: colors.light,
    alignItems: "center",
  },
  journeyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
  },
  journeySubtitle: {
    fontSize: 16,
    color: colors.grey,
    marginTop: 5,
  },
  statusContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  statusText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  timestampText: {
    color: colors.white,
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  elapsedText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  infoContainer: {
    padding: 20,
    backgroundColor: colors.light,
    margin: 20,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
  },
  infoValue: {
    fontSize: 16,
    color: colors.grey,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusChipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: colors.Cancelled + "20",
    borderRadius: 8,
  },
  errorText: {
    color: colors.Cancelled,
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    padding: 20,
  },
  completedContainer: {
    alignItems: "center",
    padding: 20,
  },
  completedText: {
    color: colors.Completed,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  completedSubtext: {
    color: colors.grey,
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
  },
  peopleContainer: {
    padding: 20,
  },
  personSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 10,
  },
  personCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 4,
  },
  personDetails: {
    fontSize: 14,
    color: colors.grey,
  },
}); 