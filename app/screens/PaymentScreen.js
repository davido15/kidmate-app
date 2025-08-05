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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import colors from "../config/colors";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import { getPayments } from "../api/payments";

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

  // Fetch payments from backend
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getPayments();
      console.log("Payments response:", response);
      
      if (response.ok && response.data && response.data.payments) {
        setPayments(response.data.payments);
      } else {
        console.log("No payments found or invalid response");
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
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
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payment_method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.amount?.toString().includes(searchQuery) ||
      p.payment_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePaymentPress = (payment) => {
    Alert.alert(
      "Payment Details",
      `Amount: $${payment.amount}\nStatus: ${payment.status}\nMethod: ${payment.payment_method}\nPayment ID: ${payment.payment_id}\nChild ID: ${payment.child_id}`,
      [
        { text: "OK", style: "default" },
        { text: "Pay Now", style: "default", onPress: () => handlePayNow(payment) },
      ]
    );
  };

  const handlePayNow = (payment) => {
    Alert.alert(
      "Payment Processing",
      `Processing payment of $${payment.amount} for child ${payment.child_id}...`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: "default", 
          onPress: () => {
            Alert.alert("Success", "Payment processed successfully!");
          }
        },
      ]
    );
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
          <View style={styles.amountContainer}>
            <AppText style={styles.amountLabel}>Amount:</AppText>
            <AppText style={styles.amount}>${item.amount}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Payment ID:</AppText>
            <AppText style={styles.detailValue}>{item.payment_id}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Child ID:</AppText>
            <AppText style={styles.detailValue}>{item.child_id}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Method:</AppText>
            <AppText style={styles.detailValue}>{item.payment_method}</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Description:</AppText>
            <AppText style={styles.detailValue}>{item.description}</AppText>
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
      <AppText style={styles.title}>💳 Payment History</AppText>

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
          <AppText style={styles.loadingText}>Loading payments...</AppText>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.payment_id}
          ListEmptyComponent={
            <AppText style={styles.emptyText}>
              No payments found for selected criteria.
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: colors.white 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 15,
    color: colors.dark,
  },
  searchContainer: {
    marginBottom: 15,
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.grey,
  },
});

export default PaymentScreen; 