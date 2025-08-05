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
import { getChildGrades, formatGrade, formatDate } from "../api/children";
import Icon from "../components/Icon";

const GradeItem = ({ subject, grade, dateRecorded, remarks }) => {
  // Add safety checks for undefined props
  if (!subject || !grade) {
    return null; // Don't render if required props are missing
  }
  
  const gradeStyle = formatGrade(grade);
  return (
    <View style={[styles.gradeItem, { borderLeftColor: gradeStyle.color }]}>
      <View style={styles.gradeHeader}>
        <Text style={styles.gradeSubject}>{subject}</Text>
        <Text style={[styles.gradeValue, { color: gradeStyle.color }]}>{grade}</Text>
      </View>
      <Text style={styles.gradeDate}>{formatDate(dateRecorded)}</Text>
      {remarks && <Text style={styles.gradeRemarks}>{remarks}</Text>}
    </View>
  );
};

function GradesListScreen({ route, navigation }) {
  const { childId, childName } = route.params;
  const [gradeRecords, setGradeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadGradeRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getChildGrades(childId);
      
      if (response.ok) {
        console.log('Grades response:', response.data);
        setGradeRecords(response.data.grade_records || []);
      } else {
        setError('Failed to load grade records');
        console.error('Error loading grades:', response.problem);
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGradeRecords();
    setRefreshing(false);
  };

  useEffect(() => {
    loadGradeRecords();
  }, [childId]);

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading grade records...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={loadGradeRecords}>
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
        <Text style={styles.headerTitle}>Grade Records</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Child Info */}
      <View style={styles.childInfo}>
        <Icon name="account-child" backgroundColor={colors.primary} size={40} />
        <Text style={styles.childName}>{childName}</Text>
      </View>

      {/* Grade Records */}
      {gradeRecords.length > 0 ? (
        <FlatList
          data={gradeRecords}
          keyExtractor={(item, index) => `grade-${item.id || index}`}
          renderItem={({ item }) => (
            <GradeItem
              subject={item.subject}
              grade={item.grade}
              dateRecorded={item.date_recorded}
              remarks={item.remarks}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="school" backgroundColor={colors.medium} size={60} />
          <Text style={styles.emptyText}>No grade records found</Text>
          <Text style={styles.emptySubtext}>Grade records will appear here once they are added</Text>
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
  gradeItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 5,
  },
  gradeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  gradeSubject: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    flex: 1,
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gradeDate: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 5,
  },
  gradeRemarks: {
    fontSize: 14,
    color: colors.dark,
    fontStyle: "italic",
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

export default GradesListScreen; 