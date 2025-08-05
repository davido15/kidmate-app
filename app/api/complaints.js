import apiClient from './client';

// Submit a new complaint
export const submitComplaint = async (complaintData) => {
  try {
    const response = await apiClient.post('/api/submit-complaint', complaintData);
    return response;
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return { ok: false, error: error.message };
  }
};

// Get all complaints for the authenticated user
export const getComplaints = async () => {
  try {
    const response = await apiClient.get('/api/get-complaints');
    return response;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return { ok: false, error: error.message };
  }
};

// Get a specific complaint by ID
export const getComplaint = async (complaintId) => {
  try {
    const response = await apiClient.get(`/api/get-complaint/${complaintId}`);
    return response;
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return { ok: false, error: error.message };
  }
};

// Helper function to format complaint status for display
export const formatComplaintStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return { text: 'Open', color: '#FF9800', backgroundColor: '#FFF3E0' };
    case 'in_progress':
      return { text: 'In Progress', color: '#2196F3', backgroundColor: '#E3F2FD' };
    case 'closed':
      return { text: 'Closed', color: '#4CAF50', backgroundColor: '#E8F5E8' };
    default:
      return { text: status || 'Unknown', color: '#9E9E9E', backgroundColor: '#F5F5F5' };
  }
};

// Helper function to format complaint priority for display
export const formatComplaintPriority = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'low':
      return { text: 'Low', color: '#4CAF50' };
    case 'medium':
      return { text: 'Medium', color: '#FF9800' };
    case 'high':
      return { text: 'High', color: '#F44336' };
    case 'urgent':
      return { text: 'Urgent', color: '#9C27B0' };
    default:
      return { text: priority || 'Unknown', color: '#9E9E9E' };
  }
};

// Helper function to format complaint category for display
export const formatComplaintCategory = (category) => {
  switch (category?.toLowerCase()) {
    case 'general':
      return { text: 'General', color: '#607D8B' };
    case 'technical':
      return { text: 'Technical', color: '#2196F3' };
    case 'billing':
      return { text: 'Billing', color: '#FF9800' };
    case 'service':
      return { text: 'Service', color: '#4CAF50' };
    default:
      return { text: category || 'Unknown', color: '#9E9E9E' };
  }
};

// Helper function to format date for display
export const formatComplaintDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 