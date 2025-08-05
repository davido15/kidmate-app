import React from "react";
import { ImageBackground, StyleSheet, View, Image, Text } from "react-native";
import AppButton from "../components/AppButton";

function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      blurRadius={0.5}
      style={styles.background}
      source={require("../assets/background.jpg")}
    >
      <View style={styles.logocontainer}>
      <Text style={styles.logo}> KidMate </Text>
        <Text style={styles.moto}> Kid Pickup Tracking</Text>
      </View>

      <View style={styles.maintext}>
 
  <Text style={styles.maintitle}> Parenting Made Simple </Text>

  <Text style={styles.smalltitle} numberOfLines={2}> Manage your child's activities effortlessly </Text>
  <Text style={styles.smalltitle} numberOfLines={2}> Track schedules, progress, and milestones in one place </Text>
  <Text style={styles.smalltitle} numberOfLines={2}> Designed with love for busy parents and caregivers </Text>
</View>

      <View style={styles.buttonContainer}>
        <AppButton title="Login" onPress={() => navigation.navigate("Login")} />
        <AppButton title="Register" color="secondary" onPress={() => navigation.navigate("Register")} />
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
},
  background: {
    flex: 1,
    justifyContent: "flex-end",
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignSelf:"stretch",
    alignItems: "center",
  },

  logo: {
    width: 300,
    height: 300,
  },
  moto: {
    color: "white",
    top: "50%",
    position: "absolute",
    fontSize: 14
  },
  logo: {
    color: "white",
    top: "10%",
    position: "absolute",
    fontWeight: "bold",
    fontSize: 50,
    margin:20
  },

  maintitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 30,
   
  },

  smalltitle: {
    color: "#f9f9f9",
    fontWeight: "normal",
    fontSize: 15,
   
  },
  logocontainer: {
    alignItems: "center",
    position: "absolute",
    top: 60,
  },

  maintext: {
    flex:1,
    alignItems: "flex-start",
    justifyContent:"center",
    alignContent:"center",
    alignSelf:"flex-start",
    margin:10,
    padding:10
  },
  buttonContainer: {
    padding: 20,
    width: "95%",
  },
});
export default WelcomeScreen;
