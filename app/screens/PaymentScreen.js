import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Constants from "expo-constants";
import colors from "../config/colors";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import { getParentAllPayments, getPaymentDetails } from "../api/payments";
import PaymentWebView from "../components/PaymentWebView";
import bugsnagLog from "../utility/bugsnag";

const formatFullDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return colors.Completed;
    case "pending":
      return colors.Inprogress;
    case "failed":
      return colors.Cancelled;
    default:
      return colors.grey;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "completed":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return "Unknown";
  }
};

const PaymentScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [currentPaymentUrl, setCurrentPaymentUrl] = useState("");

  // Fetch all payments for parent
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getParentAllPayments();
      bugsnagLog.log("Parent payments response", { success: response.ok });
      
      if (response.ok && response.data && response.data.success) {
        // Get all payments (pending, completed, failed)
        const allPayments = response.data.payments || response.data.all_payments || [];
        setPayments(allPayments);
      } else {
        bugsnagLog.warn("No payments found or invalid response", { response });
        setPayments([]);
      }
    } catch (error) {
      bugsnagLog.paymentError("fetch_parent_payments", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Refresh payments
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const filteredPayments = payments.filter(
    (p) =>
      searchQuery === "" || 
      p.child_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.amount?.toString().includes(searchQuery) ||
      p.payment_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePaymentPress = (payment) => {
    Alert.alert(
      "Payment Details",
      `Child: ${payment.child_name}\nAmount: ${payment.currency} ${payment.amount}\nStatus: ${payment.status}\nDescription: ${payment.description}\nPayment ID: ${payment.payment_id}`,
      [
        { text: "OK", style: "default" },
        { text: "Pay Now", style: "default", onPress: () => handlePayNow(payment) },
      ]
    );
  };

  const handlePayNow = async (payment) => {
    try {
      // Generate the payment link directly using the payment_id
      const paymentUrl = `https://outrankconsult.com/payment/KidMate/pay.php?link=${payment.payment_id}`;
      
      Alert.alert(
        "Payment Confirmation",
        `You are about to pay ${payment.currency} ${payment.amount} for ${payment.child_name}.\n\nDescription: ${payment.description}`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Proceed to Payment", 
            style: "default", 
            onPress: () => openPaymentLink(paymentUrl)
          },
        ]
      );
    } catch (error) {
      bugsnagLog.paymentError("process_payment", error, { paymentId: payment.payment_id });
      Alert.alert("Error", "Unable to process payment. Please try again.");
    }
  };

  const openPaymentLink = (paymentLink) => {
    setCurrentPaymentUrl(paymentLink);
    setShowWebView(true);
  };

  const handleWebViewClose = () => {
    setShowWebView(false);
    setCurrentPaymentUrl("");
  };

  const handlePaymentComplete = (status) => {
    // Refresh the payments list after payment completion
    fetchPayments();
  };

  const renderItem = ({ item }) => {
    const paymentDate = item.journey_date ? new Date(item.journey_date) : new Date();
    const formattedDate = formatFullDate(paymentDate);
    
    return (
      <TouchableOpacity 
        style={styles.paymentCard}
        onPress={() => handlePaymentPress(item)}
      >
        <View style={styles.paymentHeader}>
          <AppText style={styles.paymentDate}>{formattedDate}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <AppText style={styles.statusText}>{getStatusText(item.status)}</AppText>
          </View>
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.childInfo}>
            <AppText style={styles.childName}>{item.child_name}</AppText>
          </View>
          
          <View style={styles.amountContainer}>
            <AppText style={styles.amountLabel}>Amount:</AppText>
            <AppText style={styles.amount}>{item.currency} {item.amount}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Description:</AppText>
            <AppText style={styles.detailValue}>{item.description}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Payment ID:</AppText>
            <AppText style={styles.detailValue}>{item.payment_id}</AppText>
          </View>
        </View>

        {item.status === "pending" && (
          <View style={styles.actionContainer}>
            <AppButton
              title="Pay Now"
              onPress={() => handlePayNow(item)}
              color="primary"
              style={styles.payButton}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>💳 All Payments</AppText>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search payments..."
          placeholderTextColor={colors.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Loading all payments...</AppText>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.payment_id}
          ListEmptyComponent={
            <AppText style={styles.emptyText}>
              No payments found.
            </AppText>
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Payment WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PaymentWebView
          paymentUrl={currentPaymentUrl}
          onClose={handleWebViewClose}
          onPaymentComplete={handlePaymentComplete}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.white 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 15,
    color: colors.dark,
    paddingTop: Constants.statusBarHeight + 10,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  searchInput: {
    backgroundColor: colors.light,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.dark,
    borderWidth: 1,
    borderColor: colors.grey,
  },
  paymentCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentDate: {
    fontWeight: "700",
    fontSize: 16,
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
  paymentDetails: {
    marginBottom: 10,
  },
  childInfo: {
    marginBottom: 8,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.grey,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.dark,
  },
  actionContainer: {
    marginTop: 10,
  },
  payButton: {
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: colors.grey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.grey,
  },
});

export default PaymentScreen; 