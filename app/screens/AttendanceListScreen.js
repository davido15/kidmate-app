import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import colors from "../config/colors";
import Screen from "../components/Screen";
import { getChildAttendance, formatAttendanceStatus, formatDate, formatTime } from "../api/children";
import Icon from "../components/Icon";

const AttendanceItem = ({ date, status, checkInTime, checkOutTime }) => {
  // Add safety checks for undefined props
  if (!date || !status) {
    return null; // Don't render if required props are missing
  }
  
  const statusStyle = getStatusStyle(status);
  return (
    <View style={[styles.attendanceItem, { backgroundColor: statusStyle.backgroundColor }]}>
      <View style={styles.attendanceInfo}>
        <Text style={[styles.attendanceDate, { color: statusStyle.color }]}>{formatDate(date)}</Text>
        <Text style={[styles.attendanceStatus, { color: statusStyle.color }]}>{status}</Text>
      </View>
      {(checkInTime || checkOutTime) && (
        <View style={styles.timeInfo}>
          {checkInTime && <Text style={[styles.timeText, { color: statusStyle.color }]}>In: {formatTime(checkInTime)}</Text>}
          {checkOutTime && <Text style={[styles.timeText, { color: statusStyle.color }]}>Out: {formatTime(checkOutTime)}</Text>}
        </View>
      )}
    </View>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Present":
      return { backgroundColor: "#d4edda", color: "#155724" };
    case "Absent":
      return { backgroundColor: "#f8d7da", color: "#721c24" };
    case "Late":
      return { backgroundColor: "#fff3cd", color: "#856404" };
    default:
      return { backgroundColor: "#e2e3e5", color: "#383d41" };
  }
};

function AttendanceListScreen({ route, navigation }) {
  const { childId, childName } = route.params;
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getChildAttendance(childId);
      
      if (response.ok) {
        console.log('Attendance response:', response.data);
        setAttendanceRecords(response.data.attendance_records || []);
      } else {
        setError('Failed to load attendance records');
        console.error('Error loading attendance:', response.problem);
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendanceRecords();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAttendanceRecords();
  }, [childId]);

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading attendance records...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" backgroundColor={colors.danger} size={50} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAttendanceRecords}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" backgroundColor={colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Records</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Child Info */}
      <View style={styles.childInfo}>
        <Icon name="account-child" backgroundColor={colors.primary} size={40} />
        <Text style={styles.childName}>{childName}</Text>
      </View>

      {/* Attendance Records */}
      {attendanceRecords.length > 0 ? (
        <FlatList
          data={attendanceRecords}
          keyExtractor={(item, index) => `attendance-${item.id || index}`}
          renderItem={({ item }) => (
            <AttendanceItem
              date={item.date}
              status={item.status}
              checkInTime={item.check_in_time}
              checkOutTime={item.check_out_time}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-blank" backgroundColor={colors.medium} size={60} />
          <Text style={styles.emptyText}>No attendance records found</Text>
          <Text style={styles.emptySubtext}>Attendance records will appear here once they are added</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.light,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.light,
    elevation: 4,
  },
  backButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 24,
  },
  childInfo: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    elevation: 2,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
    marginTop: 10,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  attendanceItem: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 5,
  },
  attendanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  attendanceDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  attendanceStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeInfo: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 10,
  },
  timeText: {
    fontSize: 14,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 10,
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
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.medium,
    marginTop: 15,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.medium,
    marginTop: 5,
    textAlign: "center",
  },
});

export default AttendanceListScreen; 