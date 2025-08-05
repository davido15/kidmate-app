import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Text,
} from "react-native";

import colors from "../config/colors";

function Card({ title, subTitle,status, createdat, createdby, imageUrl, onPress,color }) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.card,{  borderColor: colors[color] }]}>

        <View style={styles.detailsContainer}>
          <Text style={[styles.title,{backgroundColor: colors[color] }]} numberOfLines={1}>
            Title : {title}
          </Text>

          <Text style={styles.subTitle} numberOfLines={2}>
            <Text style={{ fontWeight: "bold", }}>Created At :</Text> {createdat}
          </Text>
          <Text style={styles.subTitle} numberOfLines={2}>
            <Text style={{ fontWeight: "bold", }}>Created By :</Text> {createdby}
          </Text>

          <Text style={styles.subTitle} numberOfLines={3}>
            <Text style={{ fontWeight: "bold", }}>Description:</Text> {subTitle}
          </Text>
          <Text style={[styles.status,{backgroundColor: colors[color] }]} numberOfLines={1}>
             {status}
          </Text>

        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 1,
    borderColor:  colors.primary,
    borderWidth: 1,
    backgroundColor: colors.white,
    marginBottom: 20,
    overflow: "hidden",
    height: 210,

    shadowColor: "#ebe9e9",
    shadowOffset: {
      width: 1,
      height: 2,
    },

    elevation: 4,
  },
  detailsContainer: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 10,
  },
  subTitle: {
    color: colors.primary,
    fontWeight: "normal",
    padding: 5
  },
  title: {
    marginBottom: 7,
    padding: 5,
    backgroundColor: colors.completed,
    color: colors.white
  },
  status: {
  borderRadius:5,
    margin:2,
    padding:2,
    paddingLeft:7,
    backgroundColor: colors.completed,
    color: colors.white,
    width:80,
    alignSelf:"flex-end",
    alignItems:"center",
    justifyContent:"center",
    alignContent:"center",
    
  
    
  },
});

export default Card;
