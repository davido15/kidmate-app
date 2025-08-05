import React from "react";
import PropTypes from "prop-types";
import { Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function AppText({ children }) {
  return <Text style={styles.text}>{children}</Text>;
}



const styles = StyleSheet.create({
  text: {
    flex: 1,
    margin: 50,
    color: "tomato",
    fontFamily: "Avenir",
  },
});

export default AppText;
