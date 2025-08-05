import React from "react";
import { useFormikContext } from "formik";

import AppTextInput from "../components/AppTextInput";
import ErrorMessage from "./ErrorMessage";

function AppFormField({ name, ...otherProps }) {
  const {
    setFieldTouched,
    setFieldValue,
    touched,
    errors,
    values,
  } = useFormikContext();

  return (
    <>
      <AppTextInput
        // autoCapitalise="none"
        // autoCorrect={false}
        // keyboardType="email-address"
        onChangeText={(text) => setFieldValue(name, text)}
        onBlur={() => setFieldTouched(name)}
        value={values[name]}
        {...otherProps}
        //icon="email"
        // placeholder="email"
        // textContentType="emailAddress"
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  );
}

export default AppFormField;
