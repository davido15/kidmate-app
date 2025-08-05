import React from "react";
import PropTypes from "prop-types";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Image,
  TouchableHighlight,
  Text,
} from "react-native";

import AppText from "./AppText";
import colors from "../config/colors";

function ListItem({
  image,
  ImageComponent,
  IconComponent,
  title,
  subTitle,
  price,
  onPress,
  renderRightActions,
}) {
  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableHighlight underlayColor={colors.light} onPress={onPress}>
        <View style={styles.container}>
          {IconComponent}
          {image && <Image style={styles.image} source={image} />}
          <View style={styles.detailsContainer}>
            <AppText style={styles.title} numberOfLines={1}>
              {title}
            </AppText>
            <AppText style={styles.price} numberOfLines={1}>
              {price}
            </AppText>
            {subTitle && (
              <AppText style={styles.subtitle} numberOfLines={3}>
                {subTitle}
              </AppText>
            )}
          </View>
          
       
        </View>
      </TouchableHighlight>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 0,

    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",

    marginVertical: 10,
    paddingBottom: 10,
    shadowColor: "#ebe9e9",
    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  detailsContainer: {
    flex: 1,
    margin: 10,
    justifyContent: "center",
  },
  title: {
    fontWeight: "300",
    color: colors.black,
  },
  subtitle: {
    fontWeight: "normal",
    fontSize: 10,
    color: colors.black,
    paddingTop: 1,
  },
  price: {
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default ListItem;
