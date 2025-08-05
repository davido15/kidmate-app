import apiClient from './client';

// Get all children for the authenticated parent
export const getChildren = async () => {
  try {
    const response = await apiClient.get('/api/get-children');
    return response;
  } catch (error) {
    console.error('Error fetching children:', error);
    return { ok: false, error: error.message };
  }
};

// Get attendance records for a specific child
export const getChildAttendance = async (childId) => {
  try {
    const response = await apiClient.get(`/api/get-child-attendance/${childId}`);
    return response;
  } catch (error) {
    console.error('Error fetching child attendance:', error);
    return { ok: false, error: error.message };
  }
};

// Get grade records for a specific child
export const getChildGrades = async (childId) => {
  try {
    const response = await apiClient.get(`/api/get-child-grades/${childId}`);
    return response;
  } catch (error) {
    console.error('Error fetching child grades:', error);
    return { ok: false, error: error.message };
  }
};

// Get comprehensive summary for a child (attendance + grades)
export const getChildSummary = async (childId) => {
  try {
    const response = await apiClient.get(`/api/get-child-summary/${childId}`);
    return response;
  } catch (error) {
    console.error('Error fetching child summary:', error);
    return { ok: false, error: error.message };
  }
};

// Helper function to format attendance status for display
export const formatAttendanceStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'present':
    case 'checked in':
      return { text: 'Present', color: '#4CAF50' };
    case 'absent':
      return { text: 'Absent', color: '#F44336' };
    case 'late':
      return { text: 'Late', color: '#FF9800' };
    case 'checked out':
      return { text: 'Checked Out', color: '#2196F3' };
    default:
      return { text: status || 'Unknown', color: '#9E9E9E' };
  }
};

// Helper function to format grade for display
export const formatGrade = (grade) => {
  const numGrade = parseFloat(grade);
  if (!isNaN(numGrade)) {
    if (numGrade >= 90) return { text: grade, color: '#4CAF50' };
    if (numGrade >= 80) return { text: grade, color: '#2196F3' };
    if (numGrade >= 70) return { text: grade, color: '#FF9800' };
    return { text: grade, color: '#F44336' };
  }
  return { text: grade, color: '#9E9E9E' };
};

// Helper function to format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format time for display
export const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}; 