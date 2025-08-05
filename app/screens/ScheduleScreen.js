import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import colors from "../config/colors";

const pickupPersonImages = {
  Mom: "../assets/woman.jpg",
  Dad: "https://randomuser.me/api/portraits/men/46.jpg",
};

const generatePickups = () => {
  const pickups = [];
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    pickups.push({
      id: `${i + 1}`,
      pickupDate: date,
      pickupTime: `07:${(30 + i) % 60} AM`,
      pickupPerson: i % 2 === 0 ? "Mom" : "Dad",
      arrivalTime: `08:${(0 + i) % 60} AM`,
      departureTime: `03:${30 + (i % 30)} PM`,
      pickupLine: i % 2 === 0 ? "Front Gate" : "Back Entrance",
      description:
        i % 2 === 0
          ? "Picked up with snacks."
          : "Picked up by guardian and walked home.",
    });
  }
  return pickups;
};

const pickupsData = generatePickups();

const formatFullDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const ScheduleScreen = () => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const filteredPickups = pickupsData.filter(
    (p) =>
      p.pickupDate.getMonth() + 1 === selectedMonth &&
      p.pickupDate.getDate() === selectedDay
  );

  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 30 }}>
      <View style={styles.scheduleCard}>
        <Text style={styles.date}>{formatFullDate(item.pickupDate)}</Text>
        <Text style={styles.item}>🚗 Pickup Time: {item.pickupTime}</Text>
        <Text style={styles.item}>🏫 Arrival Time: {item.arrivalTime}</Text>
        <Text style={styles.item}>🏠 Departure: {item.departureTime}</Text>
        <Text style={styles.item}>📍 Location: {item.pickupLine}</Text>
        <Text style={styles.item}>📝 Notes: {item.description}</Text>
      </View>

      <View style={styles.personCard}>
        <Text style={styles.personCardTitle}>Pickup Person</Text>
        <Image
          source={require('../assets/woman.jpg')} 
          style={styles.personImageLarge}
          resizeMode="cover"
        />
        <Text style={styles.personNameLarge}>{item.pickupPerson}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕒 Pickup History</Text>

      <View style={styles.filterRow}>
        <View style={styles.pickerContainer}>
          <Text style={styles.filterLabel}>Month:</Text>
          {Platform.OS === "android" ? (
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              style={styles.picker}
            >
              {months.map((month) => (
                <Picker.Item
                  key={month}
                  label={new Date(0, month - 1).toLocaleString("en-US", {
                    month: "long",
                  })}
                  value={month}
                />
              ))}
            </Picker>
          ) : (
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {months.map((month) => (
                <Picker.Item
                  key={month}
                  label={new Date(0, month - 1).toLocaleString("en-US", {
                    month: "long",
                  })}
                  value={month}
                />
              ))}
            </Picker>
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.filterLabel}>Day:</Text>
          {Platform.OS === "android" ? (
            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
              style={styles.picker}
            >
              {days.map((day) => (
                <Picker.Item key={day} label={`${day}`} value={day} />
              ))}
            </Picker>
          ) : (
            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
            >
              {days.map((day) => (
                <Picker.Item key={day} label={`${day}`} value={day} />
              ))}
            </Picker>
          )}
        </View>
      </View>

      <FlatList
        data={filteredPickups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No pickups found for selected month/day.
          </Text>
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  picker: {
    height: 40,
    width: "100%",
  },
  scheduleCard: {
    backgroundColor: colors.light,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  date: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  item: {
    fontSize: 15,
    marginVertical: 2,
    color: "#555",
  },
  personCard: {
    height: 320, // static height big enough to identify clearly
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  personCardTitle: {
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 20,
    color: colors.light
  },
  personImageLarge: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: colors.light,
    marginBottom: 20,
  },
  personNameLarge: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },
});

export default ScheduleScreen;
