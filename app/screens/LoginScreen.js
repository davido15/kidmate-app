import React, { useState, useContext, useEffect } from "react";

import { View, Image, StyleSheet, Text, Alert } from "react-native";

import * as Yup from "yup";

import useAuth from "../auth/useAuth";
import Screen from "../components/Screen";
import ErrorMessage from "../components/ErrorMessage";
import AppFormField from "../components/AppFormField";
import SubmitButton from "../components/SubmitButton";
import AppForm from "../components/AppForm";



import auth from "../api/auth";

function LoginScreen(props) {
  const useauth = useAuth();

  const [loginFailed, setLoginFailed] = useState(false);

  const handleSubmit = async ({ email, password }) => {
    console.log(email,password)
    const result = await auth.login(email, password);
    console.log(result)
    if(!result.ok) return setLoginFailed(true);
    setLoginFailed(false)
   const user= result.data.token;

   console.log("the user is here ",user);
    useauth.logIn(user);
  };

  

  const [email, setemail] = useState();
  const [password, setpassword] = useState();

  const validationSchema = Yup.object().shape({
    email: Yup.string().required().email().label("Email"),
    password: Yup.string().required().min(4).label("Password"),
  });

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}> We're thrilled</Text>

      <Text style={styles.subtile}>Get started with KidMate</Text>

      <AppForm
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <ErrorMessage error="Error invalid credentials" visible={loginFailed} />
        <AppFormField
          autoCapitalise="none"
          autoCorrect={false}
          name="email"
          keyboardType="email-address"
          icon="email"
          placeholder="email"
          textContentType="emailAddress"
        />

        <AppFormField
          autoCapitalise="none"
          autoCorrect={false}
          name="password"
          icon="lock"
          placeholder="Password"
          secureTextEntry
          textContentType="password"
        />

        <SubmitButton title="Login" />
      </AppForm>

     
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 30,
    alignSelf: "center",
    marginTop: 50,
    color:"#2F3B52"
  },
  subtile: {
    color: "#1F8EFA",
    fontSize: 20,
    alignSelf: "center",
    marginBottom: 40,
  },
  logo2: {
    fontSize: 30,
    marginTop: 50,
    alignSelf: "center",
    justifyContent: "flex-end",
  },
});

export default LoginScreen;
