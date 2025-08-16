import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import colors from "../config/colors";
import { getComplaints } from "../api/complaints";

function ComplaintsListScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Debug: Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStorage = require("../auth/storage");
        const token = await authStorage.getToken();
        console.log("🔐 Auth token exists:", !!token);
        if (token) {
          console.log("🔐 Token preview:", token.substring(0, 20) + "...");
        }
      } catch (err) {
        console.log("🔐 Auth check error:", err);
      }
    };
    checkAuth();
  }, []);

  const fetchComplaints = async () => {
    try {
      setError(null);
      console.log("🔍 Fetching complaints...");
      
      // Test the API endpoint first
              const testResponse = await fetch("https://8c22148c8bbe.ngrok-free.app/api/test");
      console.log("🧪 Test endpoint response:", testResponse.status);
      
      const response = await getComplaints();
      console.log("📦 Complaints API response:", response);
      
      if (response.ok && response.data && response.data.success) {
        console.log("✅ Complaints fetched successfully:", response.data.complaints);
        setComplaints(response.data.complaints || []);
      } else if (response.ok && response.data) {
        // Handle case where response is successful but no success flag
        console.log("✅ Complaints fetched successfully:", response.data);
        setComplaints(response.data.complaints || response.data || []);
      } else {
        console.log("❌ Complaints fetch failed:", response);
        setError(response.data?.error || response.error || "Failed to fetch complaints");
      }
    } catch (err) {
      console.error("💥 Error fetching complaints:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const formatComplaintStatus = (status) => {
    switch (status) {
      case "open":
        return { text: "Open", color: "#FF6B6B" };
      case "in_progress":
        return { text: "In Progress", color: "#FFA500" };
      case "closed":
        return { text: "Closed", color: "#4CAF50" };
      default:
        return { text: status, color: "#666" };
    }
  };

  const formatComplaintPriority = (priority) => {
    switch (priority) {
      case "low":
        return { text: "Low", color: "#4CAF50" };
      case "medium":
        return { text: "Medium", color: "#FFA500" };
      case "high":
        return { text: "High", color: "#FF6B6B" };
      case "urgent":
        return { text: "Urgent", color: "#FF0000" };
      default:
        return { text: priority, color: "#666" };
    }
  };

  const formatComplaintCategory = (category) => {
    switch (category) {
      case "technical":
        return "Technical Issue";
      case "billing":
        return "Billing Question";
      case "service":
        return "Service Feedback";
      case "general":
        return "General Inquiry";
      default:
        return category;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ComplaintItem = ({ item }) => {
    const statusInfo = formatComplaintStatus(item.status);
    const priorityInfo = formatComplaintPriority(item.priority);
    const category = formatComplaintCategory(item.category);

    return (
      <View style={styles.complaintItem}>
        <View style={styles.complaintHeader}>
          <Text style={styles.complaintSubject}>{item.subject}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.complaintDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.complaintDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority:</Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityInfo.color },
              ]}
            >
              <Text style={styles.priorityText}>{priorityInfo.text}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>

        {item.admin_notes && (
          <View style={styles.adminNotes}>
            <Text style={styles.adminNotesLabel}>Admin Response:</Text>
            <Text style={styles.adminNotesText}>{item.admin_notes}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchComplaints}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Complaints</Text>
      </View>

      {complaints.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No complaints found</Text>
          <Text style={styles.emptySubtext}>
            Your submitted complaints will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.complaint_id}
          renderItem={({ item }) => <ComplaintItem item={item} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.medium,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 18,
    color: colors.medium,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.medium,
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  complaintItem: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  complaintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  complaintSubject: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    flex: 1,
    marginRight: 10,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 10,
    lineHeight: 20,
  },
  complaintDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.medium,
    fontWeight: "bold",
  },
  detailValue: {
    fontSize: 12,
    color: colors.dark,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  adminNotes: {
    backgroundColor: colors.light,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  adminNotesText: {
    fontSize: 12,
    color: colors.medium,
    lineHeight: 16,
  },
});

export default ComplaintsListScreen; 