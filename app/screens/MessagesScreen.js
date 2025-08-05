import React, { useState } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";

import Screen from "../components/Screen";
import MsgItem from "../components/MsgItem";
import ListItemDelete from "../components/ListItemDelete";
import colors from "../config/colors";

const initialMessages = [
  {
    id: 1,
    title: "Pickup Confirmed",
    description: "John was picked up by authorized person at 3:00 PM.",
    color: "#4ecdc4",
  },
  {
    id: 2,
    title: "Pickup Delayed",
    description: "Pickup for Sarah is delayed. ETA is 15 minutes. Please stay patient.",
    color: "#fc5c65",
  },
  {
    id: 3,
    title: "Unauthorized Pickup Attempt",
    description: "An unregistered person attempted to pick up Alex. Please verify details urgently.",
    color: "#fd9644",
  },
  {
    id: 4,
    title: "Pickup Completed",
    description: "Emma has been successfully picked up by her guardian at the gate.",
    color: "#26de81",
  },
];

function MessagesScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = (message) => {
    setMessages(messages.filter((m) => m.id !== message.id));
  };

  const renderCircle = (color) => (
    <View style={[styles.circle, { backgroundColor: color }]} />
  );

  return (
    <Screen style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(message) => message.id.toString()}
        renderItem={({ item }) => (
          <MsgItem
            title={item.title}
            subTitle={item.description}
            IconComponent={renderCircle(item.color)}
            onPress={() => console.log("Message tapped")}
            renderRightActions={() => (
              <ListItemDelete onPress={() => handleDelete(item)} />
            )}
          />
        )}
        refreshing={refreshing}
        onRefresh={() => {
          console.log("Refreshing messages...");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    flex: 1,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default MessagesScreen;
