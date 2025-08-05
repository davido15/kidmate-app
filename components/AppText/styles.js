import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  text: {
    flex: 1,
    margin: 50,
    color: "tomato",
    ...Platform.select({
      ios: {
        fontSize: 20,
        fontFamily: "Avenir",
      },
      android: {
        fontSize: 20,
        fontFamily: "Roboto",
      },
    }),
  },
});

export default styles;
