import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import colors from "../config/colors";
import Screen from "../components/Screen";
import { getChildren, getChildSummary, formatAttendanceStatus, formatDate, formatGrade, formatTime } from "../api/children";
import { submitComplaint } from "../api/complaints";
import useAuth from "../auth/useAuth";

const complaintTypes = [
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing Question" },
  { value: "service", label: "Service Feedback" },
  { value: "general", label: "General Inquiry" },
];

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

const ComplaintForm = ({ onSubmit }) => {
  const [selectedType, setSelectedType] = useState("general");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in both subject and description");
      return;
    }
    onSubmit({ type: selectedType, subject, description });
    setSubject("");
    setDescription("");
    setSelectedType("general");
    setShowForm(false);
  };

  return (
    <View style={styles.complaintForm}>
      {!showForm ? (
        <TouchableOpacity 
          style={styles.submitComplaintButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.submitComplaintText}>📝 Submit New Complaint</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Submit Complaint</Text>
          
          {/* Type Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Type:</Text>
            <View style={styles.dropdown}>
              {complaintTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.dropdownOption,
                    selectedType === type.value && styles.dropdownOptionSelected
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    selectedType === type.value && styles.dropdownOptionTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject:</Text>
            <TextInput
              style={styles.textInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="Enter complaint subject"
              placeholderTextColor={colors.medium}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your complaint in detail"
              placeholderTextColor={colors.medium}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.formActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

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

function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childSummary, setChildSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getChildren();
      
      if (response.ok && response.data.success) {
        setChildren(response.data.children);
        // Select the first child by default
        if (response.data.children.length > 0) {
          setSelectedChild(response.data.children[0]);
          await loadChildSummary(response.data.children[0].id);
        }
      } else {
        setError("Failed to load children data");
      }
    } catch (error) {
      setError("Error loading children: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChildSummary = async (childId) => {
    try {
      const response = await getChildSummary(childId);
      
      if (response.ok && response.data.success) {
        console.log('Child summary data:', response.data);
        console.log('Recent grades:', response.data.recent_grades);
        console.log('Grades stats:', response.data.grades_stats);
        setChildSummary(response.data);
      } else {
        setError("Failed to load child summary");
      }
    } catch (error) {
      setError("Error loading child summary: " + error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const handleSubmitComplaint = async (complaintData) => {
    try {
      console.log('Submitting complaint:', complaintData);
      
      // Call the actual API to submit the complaint
      const response = await submitComplaint({
        subject: complaintData.subject,
        description: complaintData.description,
        category: complaintData.type,
        priority: 'medium' // Default priority
      });
      
      if (response.ok) {
        Alert.alert(
          "Success", 
          `Complaint submitted successfully!\nType: ${complaintData.type}\nSubject: ${complaintData.subject}`,
          [
            {
              text: "View All Complaints",
              onPress: () => navigation.navigate("ComplaintsList")
            },
            {
              text: "OK",
              style: "cancel"
            }
          ]
        );
      } else {
        Alert.alert("Error", response.error || "Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert("Error", "Failed to submit complaint. Please try again.");
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  if (loading) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your children's data...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadChildren}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (children.length === 0) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No children found for your account.</Text>
          <Text style={styles.emptySubtext}>Please contact the administrator to add your children.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Child Selection */}
        {children.length > 1 && (
          <View style={styles.childSelector}>
            <Text style={styles.childSelectorTitle}>Select Child:</Text>
            <FlatList
              horizontal
              data={children}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.childOption,
                    selectedChild?.id === item.id && styles.childOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedChild(item);
                    loadChildSummary(item.id);
                  }}
                >
                  <Text style={[
                    styles.childOptionText,
                    selectedChild?.id === item.id && styles.childOptionTextSelected
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Section 1: Student Card */}
        {selectedChild && (
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <Image source={require("../assets/student.png")} style={styles.profileImage} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{selectedChild.name}</Text>
                <Text style={styles.profileId}>🎓 ID: {selectedChild.id}</Text>
                {selectedChild.grade && <Text style={styles.profileGrade}>📚 Grade: {selectedChild.grade}</Text>}
                {selectedChild.school && <Text style={styles.profileSchool}>🏫 {selectedChild.school}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Section 2: Statistics Cards */}
        {childSummary && (
          <View style={[styles.section, styles.row]}>
            <View style={[styles.card, { backgroundColor: "#FFA07A" }]}>
              <Text style={styles.cardTitle}>📊 Attendance</Text>
              <Text style={styles.cardValue}>{childSummary.attendance_stats?.attendance_percentage || 0}%</Text>
              <Text style={styles.cardSubtext}>
                {childSummary.attendance_stats?.present_days || 0} present / {childSummary.attendance_stats?.total_days || 0} total
              </Text>
            </View>
            <View style={[styles.card, { backgroundColor: "#87CEFA" }]}>
              <Text style={styles.cardTitle}>📚 Average Grade</Text>
              <Text style={styles.cardValue}>{childSummary.grades_stats?.average_grade?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.cardSubtext}>
                {childSummary.grades_stats?.total_grades || 0} subjects
              </Text>
            </View>
          </View>
        )}

                {/* Section 3: Recent Attendance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.attendanceTitle}>📝 Recent Attendance</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                console.log('Navigating to AttendanceList with:', {
                  childId: selectedChild.id,
                  childName: selectedChild.name
                });
                navigation.navigate("AttendanceList", {
                  childId: selectedChild.id,
                  childName: selectedChild.name
                });
              }}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {childSummary && childSummary.recent_attendance && childSummary.recent_attendance.length > 0 ? (
            <AttendanceItem
              date={childSummary.recent_attendance[0].date}
              status={childSummary.recent_attendance[0].status}
              checkInTime={childSummary.recent_attendance[0].check_in_time}
              checkOutTime={childSummary.recent_attendance[0].check_out_time}
            />
          ) : (
            <View style={styles.emptyAttendanceContainer}>
              <Text style={styles.emptyAttendanceText}>No recent attendance records</Text>
              <Text style={styles.emptyAttendanceSubtext}>Tap "View All" to see all attendance records</Text>
            </View>
          )}
        </View>

                {/* Section 4: Recent Grades */}
        {(() => {
          console.log('Rendering grades section check:');
          console.log('- childSummary exists:', !!childSummary);
          console.log('- recent_grades exists:', !!(childSummary && childSummary.recent_grades));
          console.log('- recent_grades length:', childSummary?.recent_grades?.length);
          return childSummary && childSummary.recent_grades && childSummary.recent_grades.length > 0;
        })() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.gradesTitle}>🏆 Highest Grade</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate("GradesList", {
                  childId: selectedChild.id,
                  childName: selectedChild.name
                })}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <GradeItem
              subject={childSummary.recent_grades[0].subject}
              grade={childSummary.recent_grades[0].grade}
              dateRecorded={childSummary.recent_grades[0].date_recorded}
              remarks={childSummary.recent_grades[0].remarks}
            />
          </View>
        )}

        {/* Section 4c: No Recent Grades - Show Grades Access */}
        {childSummary && (!childSummary.recent_grades || childSummary.recent_grades.length === 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.gradesTitle}>🏆 Highest Grade</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate("GradesList", {
                  childId: selectedChild.id,
                  childName: selectedChild.name
                })}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emptyGradesContainer}>
              <Text style={styles.emptyGradesText}>No grades available</Text>
              <Text style={styles.emptyGradesSubtext}>Tap "View All" to see all grade records</Text>
            </View>
          </View>
        )}

              {/* Section 5: Complaints */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.complaintsTitle}>📞 Complaints & Support</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate("ComplaintsList")}
          >
            <Text style={styles.viewAllButtonText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ComplaintForm onSubmit={handleSubmitComplaint} />
      </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.light,
    textAlign: 'center',
  },
  childSelector: {
    marginBottom: 15,
  },
  childSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.dark,
  },
  childOption: {
    backgroundColor: colors.light,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  childOptionSelected: {
    backgroundColor: colors.primary,
  },
  childOptionText: {
    color: colors.dark,
    fontSize: 14,
  },
  childOptionTextSelected: {
    color: colors.white,
  },
  section: {
    marginBottom: 25,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.light,
  },
  profileId: {
    fontSize: 16,
    color: colors.white,
  },
  profileGrade: {
    fontSize: 14,
    color: colors.white,
    marginTop: 2,
  },
  profileSchool: {
    fontSize: 14,
    color: colors.white,
    marginTop: 2,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    width: "48%",
    alignItems: "center",
    elevation: 4,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
  },
  cardValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 5,
  },
  cardSubtext: {
    color: "#fff",
    fontSize: 12,
    textAlign: 'center',
  },
  complaintsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#006400",
  },
  complaintsGrid: {
    flex: 1,
  },
  complaintItem: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    margin: 5,
    borderRadius: 10,
    flex: 1,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  complaintTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  complaintDescription: {
    fontSize: 12,
    color: colors.medium,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#006400",
  },
  attendanceItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  attendanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceDate: {
    fontSize: 15,
  },
  attendanceStatus: {
    fontSize: 15,
    fontWeight: "bold",
  },
  timeInfo: {
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
  },
  gradesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#006400",
  },
  gradeItem: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderLeftWidth: 4,
    elevation: 2,
  },
  gradeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  gradeSubject: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gradeDate: {
    fontSize: 12,
    color: colors.medium,
  },
  gradeRemarks: {
    fontSize: 12,
    color: colors.medium,
    marginTop: 5,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewAllText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  complaintsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#006400",
  },
  complaintsGrid: {
    marginTop: 10,
  },
  complaintItem: {
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.medium,
  },
  complaintForm: {
    marginTop: 10,
  },
  submitComplaintButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitComplaintText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  dropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dropdownOptionText: {
    fontSize: 12,
    color: colors.dark,
  },
  dropdownOptionTextSelected: {
    color: colors.white,
  },
  inputContainer: {
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.dark,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.light,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewAllButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyGradesContainer: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyGradesText: {
    fontSize: 16,
    color: colors.medium,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyGradesSubtext: {
    fontSize: 14,
    color: colors.light,
    textAlign: 'center',
  },
  emptyAttendanceContainer: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyAttendanceText: {
    fontSize: 16,
    color: colors.medium,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyAttendanceSubtext: {
    fontSize: 14,
    color: colors.light,
    textAlign: 'center',
  },
});

export default HomeScreen;
