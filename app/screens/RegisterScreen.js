import React, { useState } from "react";
import { StyleSheet, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import * as Yup from "yup";

import Screen from "../components/Screen";
import ErrorMessage from "../components/ErrorMessage";
import AppFormField from "../components/AppFormField";
import SubmitButton from "../components/SubmitButton";
import AppForm from "../components/AppForm";
import useAuth from "../auth/useAuth";
import auth from "../api/auth";

function RegisterScreen() {
  const [loginFailed, setLoginFailed] = useState(false);
  const [error, setError] = useState("");
  const useauth = useAuth();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required().label("Name"),
    email: Yup.string().required().email().label("Email"),
    phone: Yup.string().required().label("Phone"),
    password: Yup.string().required().min(4).label("Password"),
    password1: Yup.string()
      .required()
      .min(4)
      .label("Password Confirm")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  const handleSubmit = async ({ name, email, phone, password }) => {
    setLoginFailed(false);
    setError("");
    try {
      const result = await auth.register(email, password, phone, name);
      if (!result.ok) {
        setLoginFailed(true);
        setError(result.data?.message || "Registration failed");
        return;
      }
      const user= result.data.token;
      useauth.logIn(user);
    } catch (err) {
      setLoginFailed(true);
      setError("An unexpected error occurred");
    }
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>KidMate</Text>

          <AppForm
            initialValues={{ name: "", email: "", phone: "", password: "", password1: "" }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            <ErrorMessage error={error} visible={loginFailed} />

            <AppFormField
              autoCapitalize="words"
              autoCorrect={false}
              name="name"
              icon="account"
              placeholder="Your Full Name"
              textContentType="name"
            />

            <AppFormField
              autoCapitalize="none"
              autoCorrect={false}
              name="email"
              keyboardType="email-address"
              icon="email"
              placeholder="Your Email"
              textContentType="emailAddress"
            />

            <AppFormField
              autoCapitalize="none"
              autoCorrect={false}
              name="phone"
              keyboardType="phone-pad"
              icon="phone"
              placeholder="Your Phone Number"
              textContentType="telephoneNumber"
            />

            <AppFormField
              autoCapitalize="none"
              autoCorrect={false}
              name="password"
              icon="lock"
              placeholder="Password"
              secureTextEntry
              textContentType="password"
            />

            <AppFormField
              autoCapitalize="none"
              autoCorrect={false}
              name="password1"
              icon="lock"
              placeholder="Confirm Password"
              secureTextEntry
              textContentType="password"
            />

            <SubmitButton color="primary" title="Register" />
          </AppForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },
  title: {
    fontWeight: "bold",
    fontSize: 30,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    color: "#1F8EFA",
    fontSize: 20,
    alignSelf: "center",
    marginBottom: 40,
  },
});

export default RegisterScreen;
