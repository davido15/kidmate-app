import React from "react";
import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from 'react-native';
function Icon({
  name,
  size = 40,
  backgroundColor = "red",
  iconColor = "white",
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        justifyContent:"center",
        alignItems:"center"
      }}
    >
      <MaterialCommunityIcons
        name={name}
        color={iconColor}
        size={size * 0.5}
        backgroundColor={backgroundColor}
      ></MaterialCommunityIcons>
    </View>
  );
}

export default Icon;
