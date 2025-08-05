import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import defaultStyles from "../config/styles";

function AppTextInput({ icon, ...otherProps }) {
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={defaultStyles.colors.primary}
          style={styles.icon}
        />
      )}
      <TextInput style={defaultStyles.text}   {...otherProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.light,
    borderRadius: 0,
    flexDirection: "row",
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderBottomWidth :1,
    borderBottomColor: defaultStyles.colors.light,
    
  },
  icon: {
    marginRight: 10,
  },
});

export default AppTextInput;
