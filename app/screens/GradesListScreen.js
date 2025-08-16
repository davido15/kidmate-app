import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from "react-native";
import colors from "../config/colors";
import Screen from "../components/Screen";
import { getChildGrades, formatGrade, formatDate } from "../api/children";
import Icon from "../components/Icon";
import authStorage from "../auth/storage";

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

const TermFilter = ({ selectedTerm, onTermChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const terms = [
    { id: 'all', label: 'All Terms' },
    { id: 'term1', label: 'Term 1' },
    { id: 'term2', label: 'Term 2' },
    { id: 'term3', label: 'Term 3' },
  ];

  const selectedTermLabel = terms.find(term => term.id === selectedTerm)?.label || 'All Terms';

  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>{selectedTermLabel}</Text>
        <Icon name="chevron-down" backgroundColor="transparent" size={20} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {terms.map((term) => (
              <TouchableOpacity
                key={term.id}
                style={[
                  styles.termOption,
                  selectedTerm === term.id && styles.selectedTermOption
                ]}
                onPress={() => {
                  onTermChange(term.id);
                  setModalVisible(false);
                }}
              >
                <Text style={[
                  styles.termOptionText,
                  selectedTerm === term.id && styles.selectedTermOptionText
                ]}>
                  {term.label}
                </Text>
                {selectedTerm === term.id && (
                  <Icon name="check" backgroundColor="transparent" size={20} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

function GradesListScreen({ route, navigation }) {
  const { childId, childName } = route.params;
  const [gradeRecords, setGradeRecords] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadGradeRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug authentication
      const authToken = await authStorage.getToken();
      console.log('Auth token exists:', !!authToken);
      console.log('Child ID:', childId);
      
      const response = await getChildGrades(childId);
      console.log('Grades API response:', response);
      
      if (response.ok) {
        console.log('Grades response:', response.data);
        const grades = response.data.grade_records || [];
        setGradeRecords(grades);
        filterGrades(grades, selectedTerm);
      } else {
        console.error('Grades API error:', response);
        if (response.data && response.data.error) {
          setError(response.data.error);
        } else {
          setError('Failed to load grade records');
        }
      }
    } catch (error) {
      console.error('Exception in loadGradeRecords:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = (grades, term) => {
    if (term === 'all') {
      setFilteredGrades(grades);
    } else {
      // Filter based on term - you may need to adjust this logic based on your data structure
      const filtered = grades.filter(grade => {
        // Assuming there's a term field in the grade data
        // If not, you might need to add this field to your backend
        return grade.term === term || grade.term_id === term;
      });
      setFilteredGrades(filtered);
    }
  };

  const handleTermChange = (term) => {
    setSelectedTerm(term);
    filterGrades(gradeRecords, term);
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

      {/* Term Filter */}
      <TermFilter selectedTerm={selectedTerm} onTermChange={handleTermChange} />

      {/* Grade Records */}
      {filteredGrades.length > 0 ? (
        <FlatList
          data={filteredGrades}
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
          <Text style={styles.emptyText}>
            {selectedTerm === 'all' ? 'No grade records found' : `No grades for ${selectedTerm.replace('term', 'Term ')}`}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedTerm === 'all' 
              ? 'Grade records will appear here once they are added'
              : 'Try selecting a different term or check back later'
            }
          </Text>
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
  filterContainer: {
    marginHorizontal: 15,
    marginTop: 15,
  },
  filterButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  filterButtonText: {
    fontSize: 16,
    color: colors.dark,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    width: "80%",
    maxWidth: 300,
  },
  termOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  selectedTermOption: {
    backgroundColor: colors.primary,
  },
  termOptionText: {
    fontSize: 16,
    color: colors.dark,
  },
  selectedTermOptionText: {
    color: colors.white,
    fontWeight: "bold",
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